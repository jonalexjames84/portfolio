# Email Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade daily email to a full digest (tasks + scorecard + pipeline), rework weekly email into a recap with week-over-week deltas and narrative summary, and wire up Vercel crons so both actually send.

**Architecture:** Extract shared HTML helpers (`email-templates.ts`) used by both routes. Daily route gets a GET handler for Vercel cron. Weekly route is rewritten to focus on recap/deltas instead of duplicating daily content.

**Tech Stack:** Next.js API routes, Supabase queries, Resend email API, Vercel Cron

**Spec:** `docs/superpowers/specs/2026-03-31-email-redesign-design.md`

---

### Task 1: Create shared email template helpers

**Files:**
- Create: `src/lib/email-templates.ts`

- [ ] **Step 1: Create `src/lib/email-templates.ts` with all shared helpers**

```typescript
const DASHBOARD_URL = "https://portfolio.jonnymartin.blog/dashboard/job-search";

export const TARGETS = {
  applications_sent: 5,
  outreach_sent: 5,
  follow_ups_sent: 3,
  linkedin_posts: 3,
  conversations: 2,
};

export function emailWrapper(title: string, subtitle: string, body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="padding: 24px 0;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">${title}</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">${subtitle}</p>
      </div>
      ${body}
      <div style="padding: 16px 0; text-align: center;">
        <a href="${DASHBOARD_URL}" style="display: inline-block; background: #0d9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard</a>
      </div>
    </div>
  `;
}

export function progressBar(actual: number, target: number, label: string): string {
  const pct = Math.min(Math.round((actual / target) * 100), 100);
  const color = pct >= 100 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span style="color: #374151; font-weight: 500;">${label}</span>
        <span style="color: ${color}; font-weight: 700;">${actual}/${target}</span>
      </div>
      <div style="background: #f3f4f6; border-radius: 6px; height: 8px; overflow: hidden;">
        <div style="background: ${color}; height: 100%; width: ${pct}%; border-radius: 6px;"></div>
      </div>
    </div>
  `;
}

export function scorecardSection(counts: Record<string, number>, headerExtra?: string): string {
  const header = headerExtra
    ? `<h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px;">Weekly Progress</h2>
       <p style="font-size: 12px; color: #6b7280; margin: 0 0 16px;">${headerExtra}</p>`
    : `<h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px;">Weekly Progress</h2>`;

  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      ${header}
      ${progressBar(counts.apply || 0, TARGETS.applications_sent, "Applications")}
      ${progressBar(counts.outreach || 0, TARGETS.outreach_sent, "Outreach")}
      ${progressBar(counts.follow_up || 0, TARGETS.follow_ups_sent, "Follow-ups")}
      ${progressBar(counts.linkedin_post || 0, TARGETS.linkedin_posts, "LinkedIn Posts")}
      ${progressBar(counts.conversations || 0, TARGETS.conversations, "Conversations")}
    </div>
  `;
}

export function pipelineBoxes(funnel: { applied: number; screen: number; interview: number; offer: number }): string {
  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">Pipeline</h2>
      <div style="display: flex; gap: 12px; text-align: center;">
        <div style="flex: 1; padding: 8px; background: #eff6ff; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${funnel.applied}</div>
          <div style="font-size: 11px; color: #6b7280;">Applied</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fefce8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${funnel.screen}</div>
          <div style="font-size: 11px; color: #6b7280;">Screens</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #f0fdf4; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${funnel.interview}</div>
          <div style="font-size: 11px; color: #6b7280;">Interviews</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fdf2f8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #ec4899;">${funnel.offer}</div>
          <div style="font-size: 11px; color: #6b7280;">Offers</div>
        </div>
      </div>
    </div>
  `;
}

export function signalBox(signals: string[]): string {
  if (signals.length === 0) return "";
  return `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 8px;">Signals</h2>
      ${signals.map((s) => `<p style="color: #78350f; font-size: 13px; margin: 4px 0;">${s}</p>`).join("")}
    </div>
  `;
}

export function checkAuth(request: { headers: { get: (name: string) => string | null } }): boolean {
  if (request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`) return true;
  if (request.headers.get("authorization") === `Bearer ${process.env.JOB_SEARCH_API_KEY}`) return true;
  return false;
}

export function getWeekBounds(): { weekStartStr: string; weekEndStr: string; dayOfWeek: number; weekdaysPassed: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = new Date(weekStart.getTime() + 6 * 86400000).toISOString().split("T")[0];
  // Monday=1 day passed, Tuesday=2, etc. Sunday=0 treated as 5 (full work week)
  const weekdaysPassed = dayOfWeek === 0 ? 5 : Math.min(dayOfWeek, 5);
  return { weekStartStr, weekEndStr, dayOfWeek, weekdaysPassed };
}

export const categoryEmoji: Record<string, string> = {
  apply: "\ud83d\udcdd",
  outreach: "\ud83d\udce7",
  follow_up: "\ud83d\udd04",
  content: "\u270d\ufe0f",
  linkedin_post: "\ud83d\udcf1",
  prep: "\ud83d\udcda",
  admin: "\u2699\ufe0f",
};

export const impactColor: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/jonathanmartin/Desktop/Claude\ Projects/portfolio && npx tsc --noEmit src/lib/email-templates.ts 2>&1 | head -20`

Expected: No errors (or only errors from missing module resolution which is fine for isolated check). Alternatively run:

Run: `cd /Users/jonathanmartin/Desktop/Claude\ Projects/portfolio && npx next build 2>&1 | tail -20`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/lib/email-templates.ts
git commit -m "feat: add shared email template helpers for daily digest and weekly recap"
```

---

### Task 2: Rewrite daily email route

**Files:**
- Modify: `src/app/api/job-search/send-daily-email/route.ts` (full rewrite)

- [ ] **Step 1: Rewrite `src/app/api/job-search/send-daily-email/route.ts`**

Replace the entire file with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  emailWrapper,
  scorecardSection,
  pipelineBoxes,
  signalBox,
  checkAuth,
  getWeekBounds,
  categoryEmoji,
  impactColor,
  TARGETS,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  return handleDailyDigest(request);
}

export async function POST(request: NextRequest) {
  return handleDailyDigest(request);
}

async function handleDailyDigest(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const { weekStartStr, weekEndStr, weekdaysPassed } = getWeekBounds();

  // Fetch today's tasks, week's completed tasks, and pipeline in parallel
  const [todayResult, weekResult, pipelineResult] = await Promise.all([
    supabase
      .from("job_daily_tasks")
      .select("*")
      .eq("date", today)
      .order("impact", { ascending: true }),
    supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("done", true),
    supabase.from("job_pipeline_entries").select("status"),
  ]);

  const tasks = todayResult.data || [];
  const weekCompleted = weekResult.data || [];
  const pipelineEntries = pipelineResult.data || [];

  // Count completed tasks by category for scorecard
  const counts: Record<string, number> = {};
  for (const t of weekCompleted) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }

  // Build funnel from pipeline
  const statuses = pipelineEntries.map((p) => p.status);
  const funnel = {
    applied: statuses.filter((s) => s === "applied").length,
    screen: statuses.filter((s) => s === "screen").length,
    interview: statuses.filter((s) => s === "interview").length,
    offer: statuses.filter((s) => s === "offer").length,
  };

  // Build task rows HTML
  let taskSection: string;
  if (tasks.length === 0) {
    taskSection = `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px;">Today's Tasks</h2>
        <p style="color: #6b7280; font-size: 14px;">No tasks scheduled for today.</p>
      </div>
    `;
  } else {
    const taskRows = tasks
      .map(
        (t) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
          <span style="font-size: 20px;">${categoryEmoji[t.category] || "\ud83d\udccb"}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
          <div style="font-weight: 600; color: #111827; font-size: 15px;">${t.task}</div>
          ${t.company ? `<div style="color: #6b7280; font-size: 13px; margin-top: 2px;">${t.company}</div>` : ""}
          ${t.link ? `<div style="margin-top: 4px;"><a href="${t.link}" style="color: #0d9488; text-decoration: none; font-size: 13px;">Open link &rarr;</a></div>` : ""}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right;">
          <span style="background: ${impactColor[t.impact]}15; color: ${impactColor[t.impact]}; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${t.impact}</span>
        </td>
      </tr>
    `
      )
      .join("");

    taskSection = `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
        <div style="padding: 16px 16px 0;">
          <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0;">Today's Tasks</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse;">${taskRows}</table>
      </div>
    `;
  }

  // Mid-week signals
  const signals: string[] = [];
  if (weekdaysPassed >= 3) {
    const appPace = (counts.apply || 0) / weekdaysPassed;
    if (appPace * 5 < TARGETS.applications_sent) {
      const remaining = TARGETS.applications_sent - (counts.apply || 0);
      const daysLeft = 5 - weekdaysPassed;
      signals.push(`\ud83d\udfe1 Below pace on applications \u2014 ${counts.apply || 0}/${TARGETS.applications_sent} with ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`);
    }
    const outreachPace = (counts.outreach || 0) / weekdaysPassed;
    if (outreachPace * 5 < TARGETS.outreach_sent) {
      signals.push(`\ud83d\udfe1 Outreach behind \u2014 ${counts.outreach || 0}/${TARGETS.outreach_sent} this week`);
    }
  }
  if (funnel.interview > 0) {
    signals.push(`\ud83d\udfe2 ${funnel.interview} active interview${funnel.interview !== 1 ? "s" : ""} in pipeline \u2014 prep time is high-leverage`);
  }

  const dayLabel = `Day ${weekdaysPassed} of 5`;
  const body = taskSection + scorecardSection(counts, dayLabel) + pipelineBoxes(funnel) + signalBox(signals);

  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const html = emailWrapper("Today's Game Plan", weekday, body);

  const highCount = tasks.filter((t) => t.impact === "high").length;
  const subject = `${new Date().toLocaleDateString("en-US", { weekday: "short" })}: ${tasks.length} tasks \u2014 ${highCount} high impact | ${counts.apply || 0}/${TARGETS.applications_sent} apps this week`;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, taskCount: tasks.length });
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jonathanmartin/Desktop/Claude\ Projects/portfolio && npx next build 2>&1 | tail -20`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/send-daily-email/route.ts
git commit -m "feat: upgrade daily email to full digest with scorecard, pipeline, and signals"
```

---

### Task 3: Rewrite weekly recap email

**Files:**
- Modify: `src/app/api/job-search/send-weekly-review/route.ts` (full rewrite)

- [ ] **Step 1: Rewrite `src/app/api/job-search/send-weekly-review/route.ts`**

Replace the entire file with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  emailWrapper,
  scorecardSection,
  pipelineBoxes,
  signalBox,
  checkAuth,
  getWeekBounds,
  TARGETS,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  return handleWeeklyRecap(request);
}

export async function POST(request: NextRequest) {
  return handleWeeklyRecap(request);
}

async function handleWeeklyRecap(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekStartStr, weekEndStr } = getWeekBounds();

  // Last week bounds
  const lastWeekStart = new Date(weekStartStr);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStartStr = lastWeekStart.toISOString().split("T")[0];
  const lastWeekEndStr = new Date(lastWeekStart.getTime() + 6 * 86400000).toISOString().split("T")[0];

  const [thisWeekResult, lastWeekResult, allTasksResult, pipelineResult, pipelineMovedResult] = await Promise.all([
    supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("done", true),
    supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", lastWeekStartStr)
      .lte("date", lastWeekEndStr)
      .eq("done", true),
    supabase
      .from("job_daily_tasks")
      .select("done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr),
    supabase.from("job_pipeline_entries").select("status"),
    supabase
      .from("job_pipeline_entries")
      .select("status, last_update")
      .gte("last_update", weekStartStr),
  ]);

  const thisWeekCompleted = thisWeekResult.data || [];
  const lastWeekCompleted = lastWeekResult.data || [];
  const allTasks = allTasksResult.data || [];
  const pipelineEntries = pipelineResult.data || [];
  const pipelineMoved = pipelineMovedResult.data || [];

  const total = allTasks.length;
  const completedCount = allTasks.filter((t) => t.done).length;

  // Count this week by category
  const counts: Record<string, number> = {};
  for (const t of thisWeekCompleted) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }

  // Count last week by category
  const lastCounts: Record<string, number> = {};
  for (const t of lastWeekCompleted) {
    lastCounts[t.category] = (lastCounts[t.category] || 0) + 1;
  }

  // Current funnel
  const statuses = pipelineEntries.map((p) => p.status);
  const funnel = {
    applied: statuses.filter((s) => s === "applied").length,
    screen: statuses.filter((s) => s === "screen").length,
    interview: statuses.filter((s) => s === "interview").length,
    offer: statuses.filter((s) => s === "offer").length,
  };

  // Pipeline movement this week
  const movedStatuses = pipelineMoved.map((p) => p.status);
  const moved = {
    applied: movedStatuses.filter((s) => s === "applied").length,
    screen: movedStatuses.filter((s) => s === "screen").length,
    interview: movedStatuses.filter((s) => s === "interview").length,
    offer: movedStatuses.filter((s) => s === "offer").length,
    rejected: movedStatuses.filter((s) => s === "rejected").length,
    passed: movedStatuses.filter((s) => s === "passed").length,
  };

  // --- Build summary line ---
  const summaryParts: string[] = [];
  const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const categoryLabels: Record<string, string> = {
    apply: "applications", outreach: "outreach messages", follow_up: "follow-ups",
    linkedin_post: "LinkedIn posts", content: "content tasks", prep: "prep tasks", admin: "admin tasks",
  };
  if (topCategory && topCategory[1] > 0) {
    summaryParts.push(`${topCategory[1]} ${categoryLabels[topCategory[0]] || topCategory[0]}`);
  }
  if (moved.screen > 0) summaryParts.push(`${moved.screen} new screen${moved.screen !== 1 ? "s" : ""}`);
  if (moved.interview > 0) summaryParts.push(`${moved.interview} new interview${moved.interview !== 1 ? "s" : ""}`);
  if (moved.offer > 0) summaryParts.push(`${moved.offer} offer${moved.offer !== 1 ? "s" : ""}!`);
  const completionPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const summaryLine = summaryParts.length > 0
    ? summaryParts.join(", ") + `. ${completionPct}% task completion.`
    : `${completionPct}% task completion this week.`;

  // --- Summary section ---
  const summarySection = `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <p style="color: #166534; font-size: 15px; font-weight: 600; margin: 0;">${summaryLine}</p>
    </div>
  `;

  // --- Week-over-week deltas ---
  function delta(key: string, label: string): string {
    const thisVal = counts[key] || 0;
    const lastVal = lastCounts[key] || 0;
    const diff = thisVal - lastVal;
    if (diff === 0) return `<span style="color: #6b7280;">${label}: ${thisVal} (=)</span>`;
    const color = diff > 0 ? "#16a34a" : "#dc2626";
    const sign = diff > 0 ? "+" : "";
    return `<span style="color: ${color}; font-weight: 600;">${label}: ${thisVal} (${sign}${diff})</span>`;
  }

  const hasLastWeek = lastWeekCompleted.length > 0;
  const deltaSection = hasLastWeek
    ? `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">vs Last Week</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px;">
        ${delta("apply", "Apps")}
        ${delta("outreach", "Outreach")}
        ${delta("follow_up", "Follow-ups")}
        ${delta("linkedin_post", "Posts")}
        ${delta("conversations", "Convos")}
      </div>
    </div>
    `
    : `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px;">vs Last Week</h2>
      <p style="color: #6b7280; font-size: 13px; margin: 0;">First week \u2014 no comparison yet.</p>
    </div>
    `;

  // --- Pipeline changes section ---
  const moveParts: string[] = [];
  if (moved.applied > 0) moveParts.push(`${moved.applied} new application${moved.applied !== 1 ? "s" : ""}`);
  if (moved.screen > 0) moveParts.push(`${moved.screen} advanced to screen`);
  if (moved.interview > 0) moveParts.push(`${moved.interview} advanced to interview`);
  if (moved.offer > 0) moveParts.push(`${moved.offer} offer${moved.offer !== 1 ? "s" : ""}`);
  if (moved.rejected > 0) moveParts.push(`${moved.rejected} rejected`);
  if (moved.passed > 0) moveParts.push(`${moved.passed} passed on`);

  const pipelineChangesHtml = moveParts.length > 0
    ? `<p style="font-size: 13px; color: #374151; margin: 0 0 16px;">${moveParts.join(" \u00b7 ")}</p>`
    : `<p style="font-size: 13px; color: #6b7280; margin: 0 0 16px;">No pipeline movement this week.</p>`;

  const pipelineSection = `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">Pipeline This Week</h2>
      ${pipelineChangesHtml}
      <div style="display: flex; gap: 12px; text-align: center;">
        <div style="flex: 1; padding: 8px; background: #eff6ff; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${funnel.applied}</div>
          <div style="font-size: 11px; color: #6b7280;">Applied</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fefce8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${funnel.screen}</div>
          <div style="font-size: 11px; color: #6b7280;">Screens</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #f0fdf4; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${funnel.interview}</div>
          <div style="font-size: 11px; color: #6b7280;">Interviews</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fdf2f8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #ec4899;">${funnel.offer}</div>
          <div style="font-size: 11px; color: #6b7280;">Offers</div>
        </div>
      </div>
    </div>
  `;

  // --- Signals ---
  const signals: string[] = [];
  const totalApplied = funnel.applied + funnel.screen + funnel.interview + funnel.offer;
  const screenRate = totalApplied > 0 ? ((funnel.screen + funnel.interview + funnel.offer) / totalApplied) * 100 : 0;

  if (totalApplied >= 10 && screenRate < 10) {
    signals.push("\ud83d\udd34 Application\u2192Screen rate is below 10%. Your resume may need rework for these roles.");
  }
  if ((counts.apply || 0) < TARGETS.applications_sent) {
    signals.push("\ud83d\udfe1 Below target on applications. Block focused time next week.");
  }
  if (completionPct >= 80) {
    signals.push("\ud83d\udfe2 Great execution this week. Momentum compounds \u2014 keep it up.");
  }

  // --- Assemble ---
  const weekLabel = `Week of ${new Date(weekStartStr).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  const body = summarySection + scorecardSection(counts) + deltaSection + pipelineSection + signalBox(signals)
    + `<p style="color: #9ca3af; font-size: 12px; text-align: center;">${completedCount}/${total} tasks completed (${completionPct}%)</p>`;

  const html = emailWrapper("Weekly Review", weekLabel, body);

  // Subject line — pick most notable event
  let notable = `${completionPct}% completion`;
  if (moved.offer > 0) notable = `${moved.offer} new offer${moved.offer !== 1 ? "s" : ""}`;
  else if (moved.interview > 0) notable = `${moved.interview} new interview${moved.interview !== 1 ? "s" : ""}`;
  else if (moved.screen > 0) notable = `${moved.screen} new screen${moved.screen !== 1 ? "s" : ""}`;

  const subject = `Week of ${new Date(weekStartStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${completedCount}/${total} tasks done \u2014 ${notable}`;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/jonathanmartin/Desktop/Claude\ Projects/portfolio && npx next build 2>&1 | tail -20`

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/send-weekly-review/route.ts
git commit -m "feat: rework weekly email into recap with summary, deltas, and pipeline changes"
```

---

### Task 4: Update vercel.json with daily cron

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Update `vercel.json`**

Replace the entire file with:

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

Note: `0 16 * * 1-5` = 4pm UTC = 8am PST, weekdays only. The weekly review keeps its existing Friday schedule at the same time.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add daily email cron, keep weekly on Fridays"
```

---

### Task 5: Manual smoke test

- [ ] **Step 1: Test daily email locally**

Run the dev server, then curl the daily endpoint:

```bash
cd /Users/jonathanmartin/Desktop/Claude\ Projects/portfolio && npm run dev &
sleep 3
curl -X GET http://localhost:3000/api/job-search/send-daily-email \
  -H "Authorization: Bearer $JOB_SEARCH_API_KEY"
```

Expected: JSON response `{"sent": true, "taskCount": N}` and an email arrives at jonalexjames@gmail.com

- [ ] **Step 2: Test weekly email locally**

```bash
curl -X GET http://localhost:3000/api/job-search/send-weekly-review \
  -H "Authorization: Bearer $JOB_SEARCH_API_KEY"
```

Expected: JSON response `{"sent": true}` and a weekly recap email arrives

- [ ] **Step 3: Verify email rendering**

Open both emails and check:
- Daily: tasks table renders, scorecard bars show, pipeline boxes show, signals appear if mid-week
- Weekly: summary line is coherent, scorecard shows, deltas section shows (or "First week" message), pipeline changes listed, signals appear

- [ ] **Step 4: Deploy and verify cron**

```bash
cd /Users/jonathanmartin/Desktop/Claude\ Projects/portfolio && git push
```

After deploy, check Vercel dashboard > Crons to confirm both crons are registered:
- `/api/job-search/send-daily-email` — weekdays at 4pm UTC
- `/api/job-search/send-weekly-review` — Fridays at 4pm UTC
