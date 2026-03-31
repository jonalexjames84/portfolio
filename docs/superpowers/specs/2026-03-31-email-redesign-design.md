# Email Redesign: Daily Digest + Weekly Recap

## Problem

The daily email is a bare task list with no context on weekly progress or pipeline status. The weekly email duplicates what should be daily visibility. Neither email is actually being sent — the daily route has no cron trigger and only accepts POST (Vercel crons send GET).

## Design

### Approach: Shared HTML Helpers (Option B)

Extract reusable HTML-generating functions into `src/lib/email-templates.ts` shared by both routes. No new dependencies.

---

### New File: `src/lib/email-templates.ts`

Shared helpers used by both email routes:

- `emailWrapper(title: string, subtitle: string, body: string): string` — outer layout (font family, max-width, header, dashboard CTA button, footer)
- `progressBar(actual: number, target: number, label: string): string` — single metric bar with color coding (green >= 100%, amber >= 60%, red < 60%)
- `pipelineBoxes(funnel: {applied, screen, interview, offer}): string` — four colored stat boxes in a row
- `signalBox(signals: string[]): string` — amber alert box with signal bullets (returns empty string if no signals)

Each returns an HTML string fragment. No JSX, no framework — just template literals matching the existing inline HTML style.

---

### Daily Digest Email

**Route:** `src/app/api/job-search/send-daily-email/route.ts`
**Schedule:** `0 16 * * 1-5` (8am PST, weekdays)
**Trigger:** Vercel cron via GET (add GET handler alongside existing POST)

**Data fetched:**
1. Today's tasks from `job_daily_tasks` where `date = today`
2. This week's completed tasks from `job_daily_tasks` (Monday through Sunday of current week, `done = true`) — counted by category for scorecard
3. Pipeline entries from `job_pipeline_entries` — counted by status for funnel

**Email sections (top to bottom):**

1. **Header:** "Today's Game Plan" + formatted date (e.g., "Tuesday, March 31")

2. **Today's Tasks:** Table with category emoji, task name, company, link, impact badge. High impact sorted first. Same structure as current email.

3. **Weekly Progress:** Compact progress bars for each metric:
   - Applications: X/5
   - Outreach: X/5
   - Follow-ups: X/3
   - LinkedIn Posts: X/3
   - Conversations: X/2
   - Includes "Day N of 5" label so you can gauge pace

4. **Pipeline Snapshot:** Four stat boxes — Applied / Screens / Interviews / Offers

5. **Mid-week Signal:** If it's Wednesday or later and any metric is below 40% of target, show a nudge. Example: "Below pace on applications — 1/5 with 2 days left"

6. **CTA:** "Open Dashboard" button linking to `/dashboard/job-search`

**Subject line format:** `{weekday}: {taskCount} tasks — {highCount} high impact | {apps}/{appsTarget} apps this week`

**Edge cases:**
- No tasks for today: Send email anyway with "No tasks scheduled" message, still show scorecard + pipeline (the point is daily visibility)
- Weekend/holiday: Cron only runs weekdays (`1-5`)

---

### Weekly Recap Email

**Route:** `src/app/api/job-search/send-weekly-review/route.ts`
**Schedule:** `0 16 * * 5` (Fridays 8am PST — change from 4pm UTC to align with daily timing... actually 8am PST = 4pm UTC, so keep `0 16 * * 5`)
**Trigger:** Existing Vercel cron GET handler (already works)

**Data fetched:**
1. This week's completed tasks from `job_daily_tasks` (Monday-Sunday, `done = true`) — by category
2. Total tasks this week from `job_daily_tasks` (for completion rate)
3. Last week's metrics from `job_weekly_metrics` history (for deltas)
4. Pipeline entries from `job_pipeline_entries` — current status counts
5. Pipeline entries updated this week (where `last_update >= weekStart`) — for "what moved"

**Email sections (top to bottom):**

1. **Header:** "Weekly Review" + "Week of {month} {day}"

2. **Week Summary Line:** Auto-generated one-liner based on:
   - Category with most completions
   - Pipeline movement (new screens, interviews, offers)
   - Overall completion rate
   - Example: "Heavy outreach week — 6 sent, 2 new screens. Applications light at 2/5."
   - Logic: build an array of notable facts, join into a sentence. Not AI-generated — just template logic.

3. **Final Scorecard:** Progress bars showing final week totals vs targets (same `progressBar` helper as daily)

4. **Week-over-Week Deltas:** Compare this week vs last week from `job_weekly_metrics`:
   - Show delta for each metric: "+2 apps, -1 outreach, +1 screen"
   - Green for positive, red for negative, gray for no change
   - If no last-week data exists (first week), show "First week — no comparison yet"

5. **Pipeline Changes:** What moved this week:
   - Count entries where `last_update` is within this week, grouped by status
   - Format: "3 new applications, 1 advanced to screen, 2 rejected"
   - Below that, current pipeline totals (same `pipelineBoxes` helper)

6. **Signals:** Same smart nudges as current (low screen rate, below targets, high execution praise)

7. **CTA:** "Full Dashboard" button

**Subject line format:** `Week of {date}: {completed}/{total} tasks done — {notable event}`
- Notable event priority: offers > interviews > screens > completion rate

**Edge case:**
- No tasks this week: Still send with "No activity this week" and pipeline snapshot. The weekly email always sends — silence is worse than an empty report.

---

### Cron Configuration

**`vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/job-search/send-daily-email",
      "schedule": "0 16 * * 1-5"
    },
    {
      "path": "/api/job-search/send-weekly-review",
      "schedule": "0 16 * * 5"
    }
  ]
}
```

Both routes need to accept GET with `CRON_SECRET` auth (Vercel sends `Authorization: Bearer <CRON_SECRET>` header). The weekly route already supports this. The daily route needs a GET handler added.

**Auth pattern (match weekly route):**
```typescript
function checkAuth(request: NextRequest): boolean {
  if (request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`) return true;
  if (request.headers.get("authorization") === `Bearer ${process.env.JOB_SEARCH_API_KEY}`) return true;
  return false;
}
```

---

### Summary of File Changes

| File | Change |
|---|---|
| `src/lib/email-templates.ts` | **New** — shared HTML helpers |
| `src/app/api/job-search/send-daily-email/route.ts` | **Rewrite** — add GET handler, add scorecard + pipeline + signals |
| `src/app/api/job-search/send-weekly-review/route.ts` | **Rewrite** — add summary line, week-over-week deltas, pipeline changes |
| `vercel.json` | **Update** — add daily cron |

### Data Dependencies

Both routes query Supabase directly (existing pattern). No new tables needed. The `job_weekly_metrics` table may not have last week's data if it's never been written to via the POST endpoint — the weekly recap handles this gracefully by showing "First week."

The `job_pipeline_entries` table has a `last_update` column used to detect what moved this week.
