# Job Search OS — Overview & Architecture

**Date:** 2026-08-06
**Status:** Approved. Four specs follow; build in order.

## Problem

The job search already runs on seven Vercel crons. They ingest ATS boards,
dedupe, score, recheck liveness, roll up metrics, and email a daily brief.
Discovery is solved.

Shipping is not. `src/lib/job-search/strategy.ts` measured the machine on
2026-08-05 and found:

| Signal | Value |
|---|---|
| Connections on file | 26 |
| Connections ever contacted | **0** |
| Applications sent | 12 |
| Applications finished but unsent | **13** |
| Interviews | **0** |
| Work products | 0 |

Nothing leaves the building. A better search does not fix that; an execution
engine does.

Two smaller problems compound it. Nothing filters on work location or on the
industries Jon won't work in, so roles he'd never accept still consume review
attention. And nothing records whether any of the seven crons ran — a broken
pipeline and a slow week are indistinguishable from the outside.

## Goal

A system that runs daily without prompting, produces work Jon only has to
approve, and adjusts itself weekly when the numbers say it should.

## The constraint that shapes everything: two clocks

Vercel cron runs on a server. It cannot drive Chrome on Jon's laptop — no
session, no cookies, no browser. Filling a Greenhouse form *is* browser work,
and the `applying-to-jobs` skill is built on `claude-in-chrome`.

So the system runs on two clocks against one database.

```
SERVER CLOCK — Vercel cron
 05:00  ingest-jobs*          ATS pull → HARD GATES → store
 05:30  recheck-listings*     kill dead links
 06:00  draft-applications    NEW · LLM writes resume + letter + answers
 06:30  draft-outreach        NEW · cadence engine emits due messages
 07:00  score-new-jobs*       unchanged
 07:00  rollup-metrics*
 09:00  send-daily-email*     + approval queue + action items
 Mon 06 generate-weekly-plan* + coffee dates + events
 Fri 09  send-weekly-review*   + retrospective proposals

         ↓ state in Supabase ↓

LOCAL CLOCK — Claude Code scheduled agent on Jon's Mac, 08:00 weekdays
        reads drafts where state = 'approved'
        claude-in-chrome fills each ATS form from stored materials
        STOPS AT SUBMIT · leaves tabs open · state = 'filled_awaiting_submit'
```

`*` = exists today, gets extended.

The local clock only runs when the Mac is awake. That is a real limitation and
the spec does not pretend otherwise: the same work is available on demand as a
manual command, and the dashboard shows when the last local run happened.

## Decisions taken

**Auto-prep, never auto-submit.** The system does 100% of the work and holds at
the submit button. This supersedes the stored preference "prep, do not submit"
only in *degree* — materials are now finished and forms pre-filled — not in
kind. No text goes out under Jon's name unread.

**Automation first; scoring is deferred.** Ranking is a dial that can be turned
any week without touching the machine around it. Automation either runs
unattended or it doesn't, and a beautifully-ranked list that nobody acts on is
the failure this system already has. So `fit_score_auto` stays as-is and keeps
ordering the list; the hard gates do the filtering, because that's where the
real decisions live and they're deterministic and testable.

Roles carry a two-sentence `fit_note` — why it fits, and the biggest gap —
written by the drafting call that already reads the JD. Prose a human reads,
rather than a number that needs calibrating.

The dimensions Jon named — leadership, mission, sustainable hours, two-year
tenure — are not dropped. They're deferred to a scoring pass built once there's
decision data to calibrate against: his approve/skip choices, and which
applications converted. Spec 4 proposes that change like any other parameter.
`tenure_proxy` in particular still cannot be honestly derived from a JD, and
building it early would only make a guess look like a metric.

**Hard gates stay rule-based.** They must be cheap, unit-testable, and
incapable of hallucinating a rejection.

**The system reports its own health.** Ten crons and a local agent, and nothing
currently records whether any of them ran. A silent failure is indistinguishable
from a quiet week — fatal for something whose whole promise is running
unattended. `job_cron_runs` logs every execution; the daily email leads with a
health line when, and only when, something is stalled or erroring.

**Nothing changes its own parameters silently.** The retrospective proposes;
Jon approves. Approved changes land in a config table the crons read, so tuning
is data rather than a deploy.

## Hard gates

| Gate | Rule |
|---|---|
| `location_gate` | Pass if fully remote (US), or Bay Area with onsite ≤ 3 days/week. Reject anything else. |
| `ethics_gate` | Reject weapons & defense contracting, military/immigration surveillance, data brokerage & covert consumer surveillance, and predatory lending. Nothing else. |

**The ethics floor is deliberately narrow, and indexed on Jon's experience.**

An earlier draft of this spec also hard-rejected gambling, social casino, and
crypto/web3. That was wrong, for a practical reason that outranks the
principle: those categories *are* Jon's record. Zynga, Jam City, Treasure DAO,
Mythical — F2P monetization, live ops, and token economies are where his
fifteen years actually sit, and they are the roles most likely to return a
reply. A gate that rejects a candidate's strongest domain buys a cleaner list
and an empty inbox. Response rate is the binding constraint right now.

So the floor holds only where two things are true at once: **no experience
overlap, and a line Jon would not cross for any offer.** Weapons, ICE tooling,
data brokers, and predatory lenders clear that bar. Social casino does not —
not because it's beyond reproach, but because Jon has shipped it, and a system
that pretends otherwise is lying about his resume.

Everything demoted from the gate becomes an **`ethics_flag`** — a disclosure
rendered on the role card, carrying no score penalty. The system says what the
company does; Jon decides at review time, with the full JD in front of him.
That is a better place for the judgment than a term list, and it costs nothing
in responses.

Both gates carry a manual override table, so a false positive is a one-row fix
rather than a code change.

**Comp is not scored.** Handled in the screen conversation. Most JDs omit it,
and a parsed guess would be worse than no signal.

## Decomposition

Five subsystems. Each gets its own spec and ships working before the next
starts.

| # | Spec | Why this order |
|---|---|---|
| 1 | Apply pipeline + gates + health | Unblocks the 13 unsent. Gates prevent wasted prep downstream. |
| 2 | Outreach engine | Unblocks the 26 untouched. Referrals convert far better than cold applications. |
| 3 | In-person layer | Needs warmth tiers from #2 to rank anything. |
| 4 | Retrospective v2 | Needs #1–3 producing data before it has anything real to diagnose. |

## New data

| Table | Purpose |
|---|---|
| `job_application_drafts` | One row per prepared application; the approval state machine |
| `job_outreach_threads` | One per contact-purpose; holds cadence state and close reason |
| `job_outreach_messages` | One per touch; drafted text, value hook, due date |
| `job_networking_events` | Discovered events with relevance and suggested contacts |
| `job_strategy_proposals` | Proposed parameter changes awaiting approval |
| `job_search_config` | Live tunable parameters the crons read |
| `job_cron_runs` | Execution log for every cron and the local agent |

Altered: `job_connections` gains `warmth_tier`, `warmth_source`,
`do_not_contact`, `dormant_until`. `job_pipeline_entries` gains `gate_result`.

No new scoring columns. `fit_score_auto` is untouched.

## LLM usage

`claude-opus-5` via `@anthropic-ai/sdk`, with adaptive thinking and
`output_config.effort`. Structured outputs via `output_config.format` for all
scoring and screening-answer calls. Streaming on cover-letter generation, which
can be long. No `temperature` and no `budget_tokens` — both return 400 on this
model.

Rate limiting matters: `ingest-jobs` caps at 25 roles/day, so scoring is at most
25 calls per run. `draft-applications` is capped separately (Spec 1).

## Non-goals

- Auto-submitting anything, ever.
- Sending outreach. The system drafts; Jon sends.
- Scraping LinkedIn. There is no API and the ToS forbids it. LinkedIn messages
  are drafted for copy-paste.
- Replacing the existing dashboard. The strategy page stays the page you open
  first.
