# Job Search Report Redesign — Design Spec

**Date:** 2026-04-07
**Author:** Jon Martin (with Claude Code)
**Status:** Approved, ready for implementation plan

## Problem

The current daily email and dashboard aren't working for Jon's job search:

1. **New jobs are buried.** The email leads with briefings, tasks, and scorecards. Jobs Jon should apply to ASAP are hidden down the page, mixed with unranked "other roles."
2. **Task sequencing is broken.** Tasks are generated same-day with no weekly arc, no dependency awareness, and no pruning of low-leverage busywork. There's no plan for the week — just a flat list for today.
3. **Metrics lack trend context.** Current scorecard shows this week's counts vs. targets, but no week-over-week direction, no sparklines, no way to tell if things are getting better or worse.
4. **Email and dashboard drift.** They show different information in different orders, so Jon can't mentally sync the two.

The redesign unifies email + dashboard into a single four-block format optimized for one goal: **maximize probability of landing a PM offer by September 2026**.

## Goals

- Surface new jobs first, ranked by fit, so Jon can act within minutes of opening the email.
- Show the whole week's plan every day (not just today) with today highlighted, so Jon sees the arc.
- Ensure every task in the plan directly moves probability of offer up (kill busywork).
- Show progress with trend lines, not just absolute numbers.
- Make the email and the dashboard render the same four blocks in the same order.

## Non-Goals

- No LLM calls for job scoring. Auto-scoring uses a transparent rule-based heuristic. Jon overrides manually with `/job-fit-scorer` when he wants the real score.
- No overhaul of the pipeline board, kanban, or portfolio KPIs sections of the dashboard. Those stay; the four new blocks render above them.
- No new notification channels (Slack, SMS, etc.). Email + dashboard only.
- No changes to how jobs get *into* the pipeline. The redesign consumes whatever is in `job_pipeline_entries`.

## The Four-Block Format

Both the email and the dashboard render these four blocks, in order:

```
┌─────────────────────────────────────────┐
│ 1. NEW JOBS (last 24h, ranked by fit)   │
├─────────────────────────────────────────┤
│ 2. THIS WEEK'S TASKS (M-F, today hi'd)  │
├─────────────────────────────────────────┤
│ 3. METRICS (5 KPIs + 4-week sparklines) │
├─────────────────────────────────────────┤
│ 4. SIGNALS (only if triggered)          │
└─────────────────────────────────────────┘
```

The dashboard renders the existing pipeline board, funnel health, and portfolio KPIs *below* these four blocks, unchanged.

---

## Block 1: New Jobs

### Data source
`job_pipeline_entries` where `created_at >= now() - 24h` AND `status = 'saved'`.

### Scoring
Two score columns on `job_pipeline_entries`:

- `fit_score_auto` (int 0-100) — rule-based heuristic, computed on insert/update.
- `fit_score_manual` (int 0-100, nullable) — Jon's override after running `/job-fit-scorer`.
- `score_breakdown` (jsonb) — stores the rule-based breakdown for transparency.

Display prefers `fit_score_manual` if set, else `fit_score_auto` with a small "auto" tag.

### Auto-score algorithm

Runs in the Next.js app (no external calls, ~1ms per job). Computed when a pipeline entry is inserted or its role/company/JD is updated.

| Signal | Condition | Points |
|---|---|---|
| Title match | Title contains "Product Manager", "PM", or "Head of Product" | +25 |
| Seniority fit | Title contains "Senior", "Staff", "Principal", "Lead", or "Head" | +15 |
| Keyword match | JD contains any of: AI, ML, LLM, agent, platform, dev tools, SaaS | +5 each, capped at +25 |
| Industry fit | Company industry matches Jon's target list (AI/ML, SaaS, dev tools, consumer) | +15 |
| Stage fit | Company stage is seed, Series A, or Series B | +10 |
| Junior red flag | Title contains "Associate", "Junior", or "Intern" | −30 |
| Location red flag | Role is strict on-site outside the Bay Area | −20 |

Final score clamped to 0-100.

**Tiers:**
- 80+ = Strong match, prioritize
- 65-79 = Worth a look
- <65 = Skip unless desperate

### Display

Ranked by effective score descending. Top 5 rendered as cards:

```
#1  Senior PM, AI Platform — Anthropic                  92/100
    Skill 19 • Seniority 18 • Culture 20 • Comp 17 • Growth 18
    Strong match on AI-native building + PM scope at Series B+.
    Referral path: Sarah K. (2nd degree via Figma)
    [Apply →]  [Run /resume-tailor →]  [Dismiss]
```

Jobs scoring below 70 are collapsed into a single "Also found" one-liner list below the top 5.

### Empty state
"No new jobs in the last 24h. Pipeline has N saved roles from earlier — [view backlog]."

---

## Block 2: This Week's Tasks

### Data model additions

`job_daily_tasks` already has `date`, `category`, `impact`, `blocked_by`, `done`. Add:

- `probability_lift` (int 1-10) — how much this task moves Jon closer to an offer. Set at task creation time.
- `source` (text) — one of `interview_prep`, `stale_pipeline`, `apply_new_job`, `outreach`, `backlog`. Used for debugging and reporting.

### Weekly plan generator

New cron job `generate-weekly-plan`, runs **Sunday 10pm PT**.

Steps:

1. **Carry-forward pass.** Find unfinished tasks from the previous week.
   - If `impact = 'high'` → carry into Monday with `carried_over = true`.
   - Otherwise → delete (no guilt).

2. **Generation pass.** Pull candidate tasks from five sources in priority order:
   1. **Active interviews** — any `job_pipeline_entries` with status `interview` or `screen` and an upcoming date. Generate prep tasks 1-2 days before the interview.
   2. **Stale pipeline** — pipeline entries in `screen` or `interview` with `last_update > 7 days ago`. Generate a follow-up task.
   3. **Apply new jobs** — top-scored new jobs (fit score 80+) from the last 7 days that are not yet applied. Generate an "apply" task (includes resume tailor + cover letter + submit).
   4. **Outreach to stale connections** — `job_connections` with `next_action` set and `last_contact > 7 days ago`. Generate an outreach task.
   5. **Backlog fill** — if a day has fewer than 5 tasks, fill with net-new outreach to target companies from `job_target_companies`.

3. **Impact + probability assignment.**
   - Interview prep → `high`, `probability_lift = 10`
   - Apply to 80+ scored job → `high`, `probability_lift = 8`
   - Follow-up on stale active pipeline → `high`, `probability_lift = 7`
   - Outreach to warm contact → `medium`, `probability_lift = 5`
   - Apply to 65-79 scored job → `medium`, `probability_lift = 4`
   - Backlog outreach → `medium`, `probability_lift = 3`

4. **Pruning.** Drop any task with `probability_lift < 3`. No busywork.

5. **Day assignment.** Distribute across M-F with a cap of 5 tasks/day. Interview prep is pinned to its specific day. Everything else flows by priority.

6. **Dependency wiring.** If task A blocks task B (e.g., "tailor resume" blocks "submit application"), set `blocked_by` on B.

### Display

Full week shown every day, with today highlighted:

```
THIS WEEK — Apr 6-10
─────────────────────
MON (today)  ● ● ● ○ ○    3 of 5
  🔥 Prep for Anthropic screen (Wed 2pm)        HIGH
  📝 Apply: Senior PM, AI Platform — Anthropic  HIGH
  📧 Follow up with Sarah K. re: referral       MED

TUE          ○ ○ ○
  📝 Apply: Staff PM — Vercel                   HIGH
  📧 Outreach: 3 PMs at Linear                  MED
  ✍️ Work product draft for Anthropic           HIGH

WED  🎯 Anthropic screen 2pm
  📚 Final interview prep (morning)             HIGH
  📧 Thank-you note to Anthropic                HIGH

THU          ○ ○
  📝 Apply: 2 roles from new jobs               HIGH
  📧 Follow up with Vercel referral             MED

FRI          ○ ○
  📧 Outreach: 5 new contacts                   MED
  🔄 Weekly retro                               HIGH
```

Each task line shows its blocked state if applicable (greyed + "blocked by X").

### Dashboard-only interaction

Tasks can be dragged between days to reschedule. Completed tasks show a strikethrough and move to the bottom of their day.

### Task cap
5 tasks per day, hard cap. If the plan generates more than 25 total tasks for the week, only the top 25 by `probability_lift` survive.

---

## Block 3: Metrics

### The 5 KPIs

1. **Applications sent / week** — target 5
2. **Outreach sent / week** — target 5
3. **Response rate %** — replies ÷ outreach (last 14 days rolling)
4. **Active pipeline count** — sum of saved + applied + screen + interview
5. **Interviews completed / week** — actual interview count (not screens)

### Data source

Extend the existing `job_weekly_metrics` table with three new columns:

- `response_rate` (numeric) — computed from `job_connections.last_reply` / `job_connections.last_contact` counts in a 14-day window ending on `week_end`.
- `active_pipeline_count` (int) — snapshot count at `week_end`.
- `interviews_completed` (int) — count of pipeline entries that transitioned to `interview` status during the week.

### Rollup job

New nightly cron `rollup-weekly-metrics`, runs every night at 11pm PT. For the current ISO week, upsert a row into `job_weekly_metrics` with the latest counts.

### Display

```
METRICS — Week of Apr 6
────────────────────────────────────────────────
Applications      3 / 5       ▁▃▅▇▅   ↑ vs last wk
Outreach          4 / 5       ▁▁▃▅▇   ↑ vs last wk
Response rate    28%          ▃▅▃▇▅   ↑ 8pts
Active pipeline  12           ▃▅▇▇▇   flat
Interviews        2           ▁▁▁▃▅   ↑ 2

On pace for: 18 apps, 15 outreach, 6 interviews this month
```

**Sparklines:**
- 5 data points = last 4 weeks + current week.
- Email: inline SVG (Gmail-compatible).
- Dashboard: small Recharts component. Clicking expands to a 12-week line chart in a modal.

**Delta:** Compare current week's value to last week's. Show ↑/↓/flat and the absolute delta.

---

## Block 4: Signals

Rule-based anomaly flags. Only shown if at least one triggers. Each is a one-liner.

| Signal | Trigger | Icon |
|---|---|---|
| Apply pace slow | `weekdays_passed >= 3` AND current apps projected for week < target | 🟡 |
| Outreach getting no replies | Last 10 outreach messages have 0 responses | 🟡 |
| Stale active role | Pipeline entry in `screen` or `interview` with no activity in 10+ days | 🔴 |
| Hot streak | 3+ interviews booked in the current week | 🟢 |
| Pipeline drying up | Fewer than 5 entries with status `saved` | 🔴 |
| New top-tier job | A new job scored 90+ in the last 24h | 🟢 |

If no signal triggers, the block is hidden entirely.

---

## Backend Changes Summary

### Schema

New columns on `job_pipeline_entries`:
- `fit_score_auto` (int, default 0)
- `fit_score_manual` (int, nullable)
- `score_breakdown` (jsonb, nullable)

New columns on `job_daily_tasks`:
- `probability_lift` (int 1-10, default 5)
- `source` (text, nullable)
- `carried_over` (bool, default false)

New columns on `job_weekly_metrics`:
- `response_rate` (numeric, default 0)
- `active_pipeline_count` (int, default 0)
- `interviews_completed` (int, default 0)

### New code units

- `src/lib/job-search/fit-score.ts` — pure function `computeAutoFitScore(entry)` returning `{ total, breakdown }`. Unit-tested with fixtures.
- `src/lib/job-search/weekly-plan-generator.ts` — pulls candidates from five sources, assigns impact/probability_lift, prunes, distributes across M-F. Unit-tested with mock Supabase.
- `src/lib/job-search/metrics-rollup.ts` — computes the weekly metrics row.
- `src/lib/job-search/signals.ts` — pure function `computeSignals(state)` returning an array of signals.
- `src/lib/job-search/sparkline.ts` — renders a tiny SVG sparkline given an array of numbers. Shared between email HTML and dashboard.

### New routes (cron-protected)

- `POST /api/job-search/generate-weekly-plan` — Sunday 10pm PT
- `POST /api/job-search/rollup-metrics` — nightly 11pm PT
- `POST /api/job-search/score-new-jobs` — nightly, runs `computeAutoFitScore` for any pipeline entry with null `fit_score_auto`

### Refactors

- `src/app/api/job-search/send-daily-email/route.ts` — rewrite to render the new 4-block format. Remove old sections (scorecard, follow-ups standalone, spotlight).
- `src/lib/email-templates.ts` — add new section functions: `newJobsSection`, `weekViewSection`, `metricsSection`, `signalsSection`. Remove or deprecate: `scorecardSection`, `spotlightSection`, `followUpSection` (its contents move into the week view).
- `src/app/dashboard/job-search/page.tsx` — replace `TaskList` with `WeekView`, replace `WeeklyScorecard` with `MetricsBlock`, add `NewJobsBlock` at the top, add `SignalsBlock`. Keep `PipelineBoard`, `FunnelHealth`, `PortfolioKPIs` below.
- New components:
  - `src/components/job-search/NewJobsBlock.tsx`
  - `src/components/job-search/WeekView.tsx` (with drag-to-reschedule)
  - `src/components/job-search/MetricsBlock.tsx`
  - `src/components/job-search/SignalsBlock.tsx`
  - `src/components/job-search/Sparkline.tsx`

### Removed

- Old "Target Spotlight" email section — noise, not actionable.
- Old "Today's Tasks only" view — replaced by full-week view.
- Standalone "Follow-ups Due" section — absorbed into the week view as tasks.

---

## Success Criteria

The redesign is successful if:

1. **Jon opens the daily email and sees new jobs first.** Every high-fit job surfaced within 24h of appearing in the pipeline.
2. **Jon never wonders "what should I do this week?"** The full week is visible, tasks are sequenced by dependency, and every task has a `probability_lift >= 3`.
3. **Jon can tell if things are getting better or worse at a glance.** Metrics show 4-week sparklines + week-over-week delta.
4. **Email and dashboard render the same four blocks in the same order.** No drift.
5. **No LLM calls.** All scoring and generation is deterministic and transparent.

## Schema Assumptions to Verify During Plan Writing

The following assumptions must be verified against the live Supabase schema before implementation:

- `job_pipeline_entries` has fields for role title, company name, JD text, industry, and stage (needed by the auto-score algorithm). If any are missing, either add them or adapt the algorithm to use what's present.
- `job_pipeline_entries` has a location field or JD text searchable for location red flags.
- `job_connections` has `last_reply` (or equivalent) to compute response rate. If not, response rate computation changes or gets dropped for v1.
- `job_pipeline_entries` stores interview dates in a field usable to schedule prep tasks 1-2 days prior. If not, add an `interview_date` column.
- `job_target_companies` exposes industry and stage fields used by the auto-score's "Industry fit" and "Stage fit" signals.

If a gap is discovered during plan writing, prefer adding the column to dropping the signal, unless the signal contributes <10 points and Jon agrees to drop it.

## Open Questions (resolved)

- ~~What counts as a "new job"?~~ → Pipeline entries added in the last 24h, status `saved`.
- ~~How should tasks be sequenced?~~ → Priority-driven (option C) with weekly pre-plan and dependency wiring.
- ~~Which metrics matter?~~ → Apps, Outreach, Response rate, Active pipeline, Interviews completed.
- ~~Should jobs be scored by LLM?~~ → No. Rule-based auto-score + manual override via `/job-fit-scorer`.
- ~~Task cap per day?~~ → 5.
- ~~Full week or just today?~~ → Full week every day, today highlighted.
