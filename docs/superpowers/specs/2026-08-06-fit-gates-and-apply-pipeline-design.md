# Spec 1 — Fit Gates & The Apply Pipeline

**Date:** 2026-08-06
**Depends on:** nothing. First to build.
**Overview:** `2026-08-06-job-search-os-overview-design.md`

## Problem

Two failures, one spec.

**Scoring is blind to Jon's actual criteria.** `computeAutoFitScore` scores
title, seniority, keywords, industry, stage, and two red flags. It cannot see
work location beyond a crude `-20`, and it cannot see mission, ethics,
leadership opportunity, sustainable hours, or tenure odds at all. Roles Jon
would never take rank alongside roles he'd love.

**Nothing ships.** Thirteen applications are finished and unsent. The work of
tailoring a resume and writing a letter is done; the last mile — opening the
form, pasting it in — is where it dies.

## Goal

Roles Jon would refuse never enter the funnel. Roles that survive arrive each
morning with the resume tailored, the letter written, the screening answers
drafted, and the form filled to the submit button.

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

Four categories, each a term list matched against company name, industry, and
JD text:

| Category | Signals |
|---|---|
| `gambling` | casino, sportsbook, betting, slots, real-money gaming, social casino, loot box economy |
| `defense` | defense contractor, weapons, munitions, ISR, border enforcement, military surveillance |
| `crypto_speculative` | token launch, NFT marketplace, DeFi yield, memecoin, play-to-earn, tokenomics-led |
| `surveillance` | data broker, people search, covert tracking, predatory lending, location-data resale |

A match on **company or industry** rejects. A match on **JD text alone** flags
for review rather than rejecting — a fintech JD mentioning "we do not do
predatory lending" must not trip the gate.

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
with `cadence_assumed`; a social-casino studio rejects on industry; a fintech JD
disclaiming predatory lending passes; an override row flips each direction.

## Part 2 — Soft scoring v2

One `claude-opus-5` call per surviving role, inside `score-new-jobs`. Structured
output, five dimensions, 0–20 each:

| Dimension | Rubric asks |
|---|---|
| `role_fit` | Does Jon's record — 15 years, F2P/live-service, AI-native building, founding PM at an edtech infra company — map onto what this role does daily? |
| `leadership_signal` | Does the role involve mentoring, growing a team, direct reports, or setting practice for others? |
| `mission_signal` | Is there a stated mission beyond growth, and is the business model non-extractive? |
| `hours_signal` | Does the JD signal sustainable pace, or does it stack crunch markers? Absence of signal scores neutral (10), not high. |
| `tenure_proxy` | Is this an established team or a net-new speculative one? Is it a backfill? Does the JD describe success at twelve months specifically? |

Each returns a score **and a one-sentence justification**, stored in
`fit_breakdown_v2` and rendered on the role card. A score with no reasoning is
not actionable.

Keyword scoring survives for `title_match` and `seniority_fit` — cheap,
deterministic, and already correct including the gaming-title handling.

`fit_score_v2` = keyword subtotal (40 max) + LLM subtotal (100 max), normalized
to 100. `fit_score_auto` is left untouched so historical comparisons stay valid.

**Neutral-on-absence is the load-bearing rule.** A JD that says nothing about
hours is not a JD with good hours. Scoring silence as 10 rather than 20 keeps
`hours_signal` from becoming a participation trophy.

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
  ats_type                text,
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

1. Select gated-pass entries, `status = 'saved'`, `fit_score_v2 >=
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

One card per `drafted` row: company, role, `fit_score_v2` with its five
justifications, the letter rendered inline, the screening answers, links to both
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

A Claude Code scheduled agent, 08:00 weekdays, via the `schedule` skill. Per run:

1. `GET /api/job-search/drafts?state=approved`
2. For each: open the job URL in Chrome, fill the form using the
   `applying-to-jobs` skill and the stored materials.
3. **Stop at submit.** Leave the tab open. `PATCH` state to
   `filled_awaiting_submit`.
4. Post a summary — filled, failed, and why.

Failure is expected and must be graceful: an ATS that needs a login, a form
field the skill cannot classify, a CAPTCHA. On failure the row stays `approved`
with `skip_reason` recording the blocker, and it appears in the next day's email
as a manual action item. The agent never guesses at a required field.

The same run is available as `/apply-batch` for a manual pass when the Mac was
asleep.

## Migration

`20260806000001_job_apply_pipeline.sql` — creates `job_application_drafts` and
`job_gate_overrides`; adds `gate_result`, `fit_score_v2`, `fit_breakdown_v2` to
`job_pipeline_entries`; indexes on `state` and `pipeline_entry_id`.

## Backfill

The 34 saved roles scoring ≥80 and the 13 unsent applications are run through
the gates and v2 scoring once, by hand, on first deploy. Expect the gates to
reject some of them — that is the point, and the rejections should be read
before they are trusted.

## Non-goals

- Auto-submit. Not in this spec, not in any spec.
- Comp scoring.
- Replacing `fit_score_auto`.

## Success

A weekday morning where Jon opens his laptop to three applications filled to the
submit button, reads three cover letters, and sends the ones he likes. The
"finished but unsent" count trends to zero.
