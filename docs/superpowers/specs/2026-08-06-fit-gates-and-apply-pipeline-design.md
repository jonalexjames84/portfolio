# Spec 1 — The Apply Pipeline

**Date:** 2026-08-06
**Depends on:** nothing. First to build.
**Overview:** `2026-08-06-job-search-os-overview-design.md`

## Problem

**Nothing ships.** Thirteen applications are finished and unsent. The work of
tailoring a resume and writing a letter is already done; the last mile —
opening the form, pasting it in, pressing the button — is where it dies.

Two smaller problems feed that one. Roles Jon would never accept still consume
review attention, because nothing filters on work location or on the handful of
industries he won't work in. And nothing records whether any of the seven crons
actually ran, so a broken pipeline and a slow week look identical.

## Goal

Roles Jon would refuse never enter the funnel. Roles that survive arrive each
morning with the resume tailored, the letter written, the screening answers
drafted, and the form filled to the submit button — and if that didn't happen,
the morning email says so.

## Part 1 — Gates

Hard gates run inside `ingest-jobs`, before scoring, before storage. A gated-out
role is still written (so we can audit and tune) but with
`gate_result = {pass: false, gate: '...', reason: '...'}` and is excluded from
every downstream query.

### `location_gate`

```
pass if:
  remote_us(location, jd_text)                          → fully remote, US-eligible
  OR (bay_area(location) AND onsite_days(jd_text) <= 3)
reject otherwise
```

`onsite_days` parses "3 days a week in office", "hybrid — 2 days", "4x/week
onsite" and similar. When a Bay Area role states hybrid but no cadence, treat
it as **3** (the permissive read) and set `reason: 'cadence_assumed'` so the
dashboard can surface it for a human check. When a role is Bay Area with no
remote or hybrid language at all, treat it as 5 and reject.

`BAY_AREA_HINTS` already exists in `fit-score.ts` and moves here.

### `ethics_gate`

The floor is narrow by design. It rejects only where Jon has **no experience
overlap** and there is a line he would not cross for any offer. Everything else
is disclosed, not blocked — see `ethics_flag` below.

| Category | Signals |
|---|---|
| `defense` | defense contractor, weapons, munitions, ISR, military surveillance, border/immigration enforcement tooling |
| `surveillance` | data broker, people search, covert location tracking, location-data resale |
| `predatory_finance` | payday lending, predatory lending, debt-trap products |

A match on **company or industry** rejects. A match on **JD text alone** flags
for review rather than rejecting — a fintech JD saying "we do not do predatory
lending" must not trip the gate.

### `ethics_flag` — disclosure, not rejection

Three categories that were previously gates are now informational. They are
detected the same way, stored on `gate_result.flags`, rendered as a labeled
badge on the role card, and **carry no score penalty**:

| Flag | Signals |
|---|---|
| `gambling` | casino, sportsbook, betting, slots, real-money gaming, social casino |
| `crypto` | token launch, NFT marketplace, DeFi, play-to-earn, tokenomics |
| `aggressive_monetization` | loot box economy, gacha, whale-focused LTV language |

These are Jon's résumé. Zynga and Jam City are social casino and F2P
monetization; Treasure DAO and Mythical are token economies. Scoring them down
would penalize the exact record that makes him a strong candidate at those
companies — and they are among the roles most likely to reply. The flag exists
so he knows what he is applying to before he reads the letter, not so the
system can decide for him.

**`aggressive_monetization` is the one to watch.** It fires on language Jon has
personally shipped, so expect it on roles that are a genuinely good fit. If it
proves noisy, delete the category — it is the least load-bearing of the three.

### Overrides

```sql
job_gate_overrides (
  company_key text primary key,
  decision    text not null check (decision in ('allow','deny')),
  gate        text,
  reason      text not null,
  created_at  timestamptz default now()
)
```

Checked before both gates. A false positive is one row, not a deploy.

### Tests

`gates.test.ts` covers, at minimum: fully-remote passes; Bay Area 3-day passes;
Bay Area 4-day rejects; Austin hybrid rejects; hybrid-no-cadence in SF passes
with `cadence_assumed`; a defense contractor rejects on industry; a fintech JD
disclaiming predatory lending passes; an override row flips each direction.

Explicitly asserted, because these are the regressions that would quietly shrink
the funnel: **a social-casino studio passes** with `flags: ['gambling']`; **a
web3 gaming company passes** with `flags: ['crypto']`; and a flagged role's
`fit_score_auto` is identical to the same role without the flag.

## Part 2 — Scoring stays as it is, for now

**Deliberately deferred.** Ranking is a dial that can be turned any week
without touching the machine around it; automation either runs unattended or it
doesn't. Building an elaborate rubric before anything ships would be tuning the
sort order of a list nobody acts on.

So: `fit_score_auto` is unchanged and remains the ordering key. The hard gates
above do the filtering — that's where the real decisions live, and they're
deterministic and testable. There is no `fit_score_v2` in this spec.

One small addition, because it costs one field and pays for itself in review
time: the drafting call already reads the whole JD, so it also returns a
**two-sentence `fit_note`** — why this role fits Jon and the single biggest
gap. Stored on the draft, rendered on the approval card. Prose a human reads,
not a number that needs calibrating.

When there's enough decision data to calibrate against — Jon's approve/skip
choices, and which applications converted — the retrospective (Spec 4) proposes
a scoring change like any other parameter. That is the right time to build it,
with evidence instead of guesses.

The dimensions Jon named — leadership, mission, hours, two-year tenure — are
recorded here so they aren't lost: they belong in that later scoring pass, and
`tenure_proxy` in particular still can't be honestly derived from a JD.

## Part 3 — The apply pipeline

### State machine

```
drafted ──approve──▶ approved ──local agent──▶ filled_awaiting_submit ──Jon──▶ submitted
   │                    │                              │
   └──skip──▶ skipped ◀─┴──────────────────────────────┘
```

Only Jon moves a row to `submitted`, from the dashboard, after pressing the ATS
button himself. The system never claims an application it cannot prove.

```sql
job_application_drafts (
  id                      uuid primary key default gen_random_uuid(),
  pipeline_entry_id       uuid not null references job_pipeline_entries(id),
  state                   text not null default 'drafted',
  resume_material_id      uuid references job_materials(id),
  cover_letter_material_id uuid references job_materials(id),
  screening_answers       jsonb,
  fit_note                text,
  ats_type                text,
  block_reason            text,
  attempt_count           int  not null default 0,
  job_url                 text not null,
  drafted_at              timestamptz default now(),
  approved_at             timestamptz,
  filled_at               timestamptz,
  submitted_at            timestamptz,
  skip_reason             text
)
```

One draft per pipeline entry, enforced by a unique index.

### `draft-applications` (06:00 daily)

1. Select gated-pass entries, `status = 'saved'`, `fit_score_auto >=
   FIT_THRESHOLD` (constant, 70), ordered by score. Cap at `DAILY_DRAFT_CAP`
   (constant, 3) — the bottleneck is Jon's review, not generation.

   Both are module constants in this spec. Spec 4 introduces
   `job_search_config` and moves them there, seeded with these values so
   behavior is unchanged.
2. For each, **claim through the existing guard** —
   `.claude/skills/one-application-per-company/apply-guard.ts claim`. Exit 1
   means skip and take the next role. This is non-negotiable: three
   applications went to Stedi because nothing recorded a claim.
3. Verify the listing is still live via `listing-liveness.ts`. Dead → mark the
   entry, release the claim, skip.
4. Generate the tailored resume and cover letter with `claude-opus-5`, sourcing
   from `experience.ts` and `projects.ts`.
5. Extract screening questions from the JD and draft answers.
6. Write markdown to `documents/`, render PDFs via `render-pdfs.mjs`, sync to
   `job_materials` with `origin = 'agent'`.
7. Insert the draft row in state `drafted`.

**The `---` rule carries over unchanged.** Cover-letter markdown opens with
notes written *to Jon* — JD verification, comp, honest gaps, prior-application
warnings — and `render-pdfs.mjs` refuses to render a letter with no `---`
separator. Generated letters must emit that separator and those notes. A letter
that would print Jon's private notes on something he sends is the worst failure
this system can have.

### `/job-search/approvals`

One card per `drafted` row: company, role, `fit_score_auto`, the two-sentence
`fit_note`, any `ethics_flag` badges, the letter rendered inline, the screening answers, links to both
PDFs. Actions: **Approve**, **Edit** (opens the markdown, re-renders on save),
**Skip** (requires a reason — the reasons are training data for the
retrospective).

### Email approval

The 09:00 email lists pending drafts with signed one-click approve links:

```
GET /api/job-search/approve/[token]
```

Token is an HMAC over `(draft_id, action, expiry)` with a 7-day expiry, signed
with a server-only secret. Approve-only — skip and edit require the dashboard,
because both need context a link cannot carry.

### The local agent

The automation's weakest link, and therefore the most specified. A Claude Code
scheduled agent, 08:00 weekdays, created via the `schedule` skill.

**Auth.** It calls the same API the crons do, using the existing `checkAuth`
bearer token from `src/lib/email-templates.ts`, read from the local
environment. No new auth path.

**Per run:**

1. `GET /api/job-search/drafts?state=approved` — ordered oldest first, capped at
   5 per run. A backlog drains over days rather than opening twenty tabs.
2. Re-check liveness on each job URL. A listing that closed between drafting and
   filling is marked and skipped — filling a dead form wastes the tab and the
   claim.
3. Open the URL in Chrome. Fill using the `applying-to-jobs` skill and the
   stored materials, uploading the PDF from the signed-URL endpoint.
4. **Stop at submit.** Never click it. Leave the tab open.
5. `PATCH` state to `filled_awaiting_submit` with `filled_at`.
6. Write a run record and post a summary: filled, blocked, and why.

**Failure taxonomy.** Failure is the expected case often enough that vague
handling would sink this. Each blocked draft records a typed `block_reason`, and
the row stays `approved` so the next run retries it:

| `block_reason` | Meaning | Next step |
|---|---|---|
| `login_required` | ATS wants an account | Jon logs in once; retries next run |
| `captcha` | Human challenge | Manual action item |
| `unknown_field` | A required field the skill can't classify | Manual; the field label is logged so the skill can learn it |
| `upload_failed` | File input rejected the PDF | Manual |
| `page_changed` | Form didn't match the expected ATS shape | Manual; likely an `ats.ts` update |
| `listing_dead` | 404 or closed | Auto-marks the entry, releases the claim |

**The agent never guesses at a required field.** A wrong answer submitted under
Jon's name is worse than an unfilled form, and unlike an unfilled form it can't
be undone. Uncertainty always resolves to `unknown_field` and a human.

**Retry ceiling.** Three failed attempts on the same draft stops the retries and
escalates it to a manual item. Otherwise a permanently broken form is retried
every morning forever.

**Idempotency.** A draft already `filled_awaiting_submit` is never re-opened,
so a re-run after a crash is safe.

**Manual fallback.** The identical run is available as `/apply-batch` for when
the Mac was asleep, which it will often be. The schedule is a convenience; the
command is the guarantee.

## Part 4 — Knowing whether it ran

Ten crons and a local agent, and today nothing records whether any of them
executed. A silent failure looks exactly like a quiet week — which is the worst
possible failure mode for a system whose whole promise is running unattended.

```sql
job_cron_runs (
  id         uuid primary key default gen_random_uuid(),
  job_name   text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status     text not null default 'running',   -- running | ok | error
  counts     jsonb,        -- {scanned: 120, drafted: 3, blocked: 1}
  error      text
);
create index job_cron_runs_recent on job_cron_runs (job_name, started_at desc);
```

Every cron and the local agent open a row on entry and close it on exit,
including on error. Cheap, and it turns "is this working?" into a query.

**Stall detection.** The 09:00 email leads with a health line, and only when
something is wrong:

- any cron with no `ok` run in 36 hours
- the local agent with no run in 48 hours
- any cron whose last run was `error`

When everything is healthy the health block is absent entirely. A green
checkmark every morning trains you to stop reading the email; silence-on-healthy
keeps the signal meaningful.

**Idempotency across the board.** Every cron must be safe to re-run — Vercel
retries, and manual re-runs happen during debugging:

| Cron | Guard |
|---|---|
| `ingest-jobs` | dedupes on `job_url` (exists) |
| `draft-applications` | unique index on `job_application_drafts.pipeline_entry_id` |
| `draft-outreach` | unique index on `(thread_id, touch_number)` (Spec 2) |
| `send-daily-email` | one send per `(job_name, date)`; a second run that day no-ops |

The email guard matters most. Everything else double-running wastes compute;
the email double-running lands twice in Jon's inbox and teaches him to ignore
it.

## Migration

`20260806000001_job_apply_pipeline.sql` — creates `job_application_drafts`,
`job_gate_overrides`, and `job_cron_runs`; adds `gate_result` to
`job_pipeline_entries`; unique index on `job_application_drafts
(pipeline_entry_id)`; indexes on `state` and `(job_name, started_at desc)`.

No scoring columns. `fit_score_auto` is untouched.

## Backfill

The 34 saved roles scoring ≥80 and the 13 unsent applications are run through
the gates once, by hand, on first deploy. Expect a few rejections — that is the
point, and they should be read before they are trusted.

## Build order within this spec

Each step is independently useful, so a stall doesn't strand the work:

1. `job_cron_runs` + health line in the daily email. Instrument the seven
   existing crons first — this is worth having even if nothing else ships, and
   it makes every later step debuggable.
2. Gates + override table + tests. Filtering improves immediately.
3. `draft-applications` + the drafts table. Drafts accumulate, reviewable as raw
   rows.
4. `/job-search/approvals` + signed email links. Approval becomes one click.
5. The local agent + `/apply-batch`. The last mile closes.

## Non-goals

- Auto-submit. Not in this spec, not in any spec.
- Comp scoring.
- A new fit score. Explicitly deferred to Spec 4.

## Success

A weekday morning where Jon opens his laptop to three applications filled to the
submit button, reads three cover letters, and sends the ones he likes — and a
morning three weeks later where the email says the local agent hasn't run in
two days, so he finds out from the system rather than from a quiet inbox.
