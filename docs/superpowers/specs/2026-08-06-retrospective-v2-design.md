# Spec 4 — Retrospective v2

**Date:** 2026-08-06
**Depends on:** Specs 1–3. Needs their data to diagnose anything real.
**Overview:** `2026-08-06-job-search-os-overview-design.md`

## Problem

`src/lib/job-search/strategy.ts` already diagnoses well. It builds the leak
funnel, finds the worst-converting stage with enough sample, grades five levers,
and refuses to render a verdict it can't support. That work stands.

What it can't do is close the loop. It renders a page. Reading the page and
changing the system are separate acts, and the second one doesn't happen —
which is exactly the failure mode that produced 26 uncontacted connections
sitting under a dashboard that had been reporting the problem.

Meanwhile the parameters that govern the system — fit threshold, daily draft
cap, outreach weekly cap, channel emphasis — are constants in source files.
Changing one is a deploy.

## Goal

Every Friday: the leak, a specific proposed change, and one click to apply it.

## Config as data

```sql
job_search_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz default now(),
  updated_by  text
)
```

Seeded with: `fit_threshold` (70), `daily_draft_cap` (3),
`outreach_weekly_cap` (10), `min_leak_sample` (10), `channel_emphasis`
(`ats_direct`), `event_relevance_threshold`.

Every cron reads config at start with a hardcoded fallback, so a missing or
malformed row degrades to today's behavior rather than crashing the run.

## Proposals

```sql
job_strategy_proposals (
  id              uuid primary key default gen_random_uuid(),
  week_start      date not null,
  leak_stage      text,
  finding         text not null,
  proposed_change jsonb not null,
  rationale       text not null,
  state           text not null default 'proposed',
  decided_at      timestamptz,
  outcome_note    text
)
```

`proposed_change` is a config diff: `{"key": "fit_threshold", "from": 70,
"to": 65}`. Approving writes to `job_search_config`, atomically, in one
transaction with the state change.

## `generate-strategy-proposals` (Fri 08:00, before the weekly review)

1. Build the leak funnel via the existing `buildLeakFunnel`.
2. `findLeak` for the worst-converting stage with enough upstream sample.
3. Map the leak to a proposal from a fixed table.

| Leak | Proposal |
|---|---|
| Saved → drafted starving | Lower `fit_threshold`, or report that the gates are rejecting most of the pool and name which gate |
| Drafted → approved stalling | Do **not** raise `daily_draft_cap` — more drafts is the wrong answer to unread drafts. Surface the skip reasons and propose a letter-quality review |
| Approved → submitted stalling | Local agent isn't running or is failing; report last successful run and the top blocker |
| Applied → screen leaking | Shift `channel_emphasis` to `referral`; raise `outreach_weekly_cap` |
| Outreach → reply leaking | Report reply rate by warmth tier; propose narrowing to warmer tiers |
| Nothing has enough sample | Say so. Propose nothing. |

That last row is the important one. **`MIN_LEAK_SAMPLE` carries into every
proposal.** Twelve applications and no interviews is not a 0% conversion rate,
it is twelve applications. A stage whose rate was withheld for low sample can
never be the leak, and can never generate a proposal. The system is allowed to
report that it does not yet know.

At most **two proposals per week**. A list of eight changes is a list nobody
applies, and simultaneous changes make the next week's data unreadable.

## Approval

Friday email lists each proposal — finding, change, rationale — with signed
approve/reject links reusing Spec 1's HMAC token endpoint. Also on
`/dashboard/job-search/strategy`, below the leak funnel, with the same actions
plus a free-text alternative.

Rejections record why. A repeatedly-rejected proposal type gets suppressed for
four weeks — the system should notice when it's wrong about something.

## Measuring the change

Each approved proposal stores the metric that motivated it. Four weeks later,
the retrospective reports whether that metric moved, in `outcome_note`.

This is deliberately weak evidence and is labeled as such: n is small, weeks
are confounded, and nothing here is a controlled experiment. It is a memory of
what was tried and what happened next — enough to stop repeating a change that
didn't help, not enough to claim causation. Reporting it as more than that
would violate the same honesty rule that governs the funnel.

## Migration

`20260806000004_job_strategy_config.sql` — creates both tables; seeds config
with current hardcoded values so behavior is unchanged on deploy.

## Tests

`strategy-proposals.test.ts` — each leak maps to its proposal; a low-sample
stage generates none; the two-per-week cap holds; approval writes config
atomically; a rejected type is suppressed for four weeks; a missing config key
falls back to its hardcoded default.

## Non-goals

- Auto-applying proposals. Diagnose and propose; Jon decides.
- Claiming causation from n of 12.
- Replacing `strategy.ts`. This extends it.

## Success

A Friday where the system says "your applied → screen rate is 0 of 24 with
zero referral-backed applications; shift emphasis to referral and raise the
outreach cap to 15," Jon clicks approve, and the following Monday the plan is
visibly different — without anyone opening an editor.
