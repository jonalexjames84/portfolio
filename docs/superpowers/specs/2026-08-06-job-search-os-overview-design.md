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

Separately, `fit-score.ts` scores title, seniority, keywords, industry, stage,
and red flags. It scores none of the criteria that actually decide whether Jon
takes and keeps a job: work location, mission and ethics, leadership and
mentoring, sustainable hours, or the odds he stays two years.

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
 07:00  score-new-jobs*       now LLM-scores the five soft dimensions
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

**Soft scores are LLM-scored; hard gates are deterministic.** "Strong mission"
and "reasonable hours" need reading comprehension, and a `CRUNCH_TERMS` array
is a bad proxy for either. Since the drafting cron already calls the Anthropic
API, scoring five dimensions against a written rubric is nearly free and much
more accurate. Hard gates stay rule-based: they must be cheap, unit-testable,
and incapable of hallucinating a rejection.

**`tenure_proxy` is named honestly.** "A job I keep for two years" cannot be
scored from a JD. Funding runway and layoff history are in no feed this system
has. What is observable — whether the team is net-new and speculative or
established, whether the role is a backfill, how specifically the JD describes
success at twelve months — gets scored under a name that never reads as more
certain than it is.

**Nothing changes its own parameters silently.** The retrospective proposes;
Jon approves. Approved changes land in a config table the crons read, so tuning
is data rather than a deploy.

## Hard gates

| Gate | Rule |
|---|---|
| `location_gate` | Pass if fully remote (US), or Bay Area with onsite ≤ 3 days/week. Reject anything else. |
| `ethics_gate` | Reject gambling & real-money gaming, defense & weapons, crypto & speculative web3, surveillance & data brokerage. |

The ethics gate matches on the **company's business model**, not on Jon's
history. His time at Treasure DAO, Mythical, Zynga and Jam City still counts as
experience everywhere else in the system. Stated plainly because the gate does
cut a real slice of the mobile F2P market — most social-casino studios, and
most token-led web3 companies — and that tradeoff was chosen deliberately.

Both gates carry a manual override table, so a false positive is a one-row fix
rather than a code change.

**Comp is not scored.** Handled in the screen conversation. Most JDs omit it,
and a parsed guess would be worse than no signal.

## Decomposition

Five subsystems. Each gets its own spec and ships working before the next
starts.

| # | Spec | Why this order |
|---|---|---|
| 1 | Fit gates + apply pipeline | Unblocks the 13 unsent. Gates prevent wasted prep downstream. |
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

Altered: `job_connections` gains `warmth_tier`, `warmth_source`,
`do_not_contact`, `dormant_until`. `job_pipeline_entries` gains `gate_result`,
`fit_score_v2`, `fit_breakdown_v2`.

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
