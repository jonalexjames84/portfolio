# ADHD Job Search Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a push-based job search system with a daily email, weekly scorecard email, and a visual dashboard — optimized for ADHD brains that need tasks delivered to them, not waiting behind a tab.

**Architecture:** Three layers — (1) daily morning email with 3-5 pre-decided tasks, (2) a private dashboard page at `/dashboard/job-search` showing weekly scorecard + funnel health + PostHog KPIs, (3) a weekly Friday review email with conversion rates and pivot signals. Supabase stores tasks and metrics. Scheduled Claude Code agents generate tasks and send emails via API endpoints on the portfolio site. Resend handles email delivery.

**Tech Stack:** Next.js 16 (App Router), Supabase (PostgreSQL + JS client), Resend (email API), PostHog (portfolio analytics), Recharts (charts), Tailwind CSS v4, Framer Motion

---

## Data Flow

```
Scheduled Agent (Mon 8am) → POST /api/job-search/generate-tasks → Supabase
Scheduled Agent (Mon 8am) → POST /api/job-search/send-daily-email → Resend → Jon's inbox
Dashboard page → GET /api/job-search/tasks → Supabase
Dashboard page → GET /api/job-search/metrics → Supabase
Dashboard page → POST /api/dashboard/posthog → PostHog (existing)
Jon checks off task → POST /api/job-search/tasks/[id]/complete → Supabase
Scheduled Agent (Fri 9am) → POST /api/job-search/send-weekly-review → Resend → Jon's inbox
```

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── job-search/
│   │       └── page.tsx              # The ADHD dashboard (Layer 2)
│   └── api/
│       └── job-search/
│           ├── tasks/
│           │   ├── route.ts          # GET tasks, POST new tasks
│           │   └── [id]/
│           │       └── complete/
│           │           └── route.ts  # POST mark task complete
│           ├── metrics/
│           │   └── route.ts          # GET weekly metrics, POST new week
│           ├── pipeline/
│           │   └── route.ts          # GET funnel snapshot
│           ├── send-daily-email/
│           │   └── route.ts          # POST trigger daily email
│           └── send-weekly-review/
│               └── route.ts          # POST trigger weekly review
├── lib/
│   └── supabase.ts                   # Supabase client (server-side)
└── components/
    └── job-search/
        ├── TaskList.tsx               # Today's tasks with checkboxes
        ├── WeeklyScorecard.tsx        # Activity bars vs targets
        ├── FunnelHealth.tsx           # Pipeline conversion rates
        └── PortfolioKPIs.tsx          # PostHog metrics cards
```

---

## Task 1: Supabase Project + Schema

**Files:**
- Create: `src/lib/supabase.ts`

Uses existing Supabase project `red-ox-mobile` (ref: `lohuzsjnztefixqbaoqf`). All tables prefixed with `job_` to namespace.

- [ ] **Step 1: Create `job_daily_tasks` table**

```sql
CREATE TABLE job_daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('apply', 'outreach', 'follow_up', 'content', 'prep', 'admin')),
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('high', 'medium', 'low')),
  company TEXT,
  link TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_daily_tasks_date ON job_daily_tasks(date);

-- Enable RLS
ALTER TABLE job_daily_tasks ENABLE ROW LEVEL SECURITY;

-- Allow read/write via service key only (API routes use service key)
CREATE POLICY "Service key full access" ON job_daily_tasks
  FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 3: Create `job_weekly_metrics` table**

```sql
CREATE TABLE job_weekly_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start DATE NOT NULL UNIQUE,
  applications_sent INTEGER NOT NULL DEFAULT 0,
  outreach_sent INTEGER NOT NULL DEFAULT 0,
  follow_ups_sent INTEGER NOT NULL DEFAULT 0,
  linkedin_posts INTEGER NOT NULL DEFAULT 0,
  conversations INTEGER NOT NULL DEFAULT 0,
  phone_screens INTEGER NOT NULL DEFAULT 0,
  interviews INTEGER NOT NULL DEFAULT 0,
  offers INTEGER NOT NULL DEFAULT 0,
  resume_downloads INTEGER NOT NULL DEFAULT 0,
  portfolio_visits INTEGER NOT NULL DEFAULT 0,
  calendly_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE job_weekly_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service key full access" ON job_weekly_metrics
  FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 4: Create `job_pipeline_entries` table**

```sql
CREATE TABLE job_pipeline_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'screen', 'interview', 'offer', 'rejected', 'passed')),
  applied_date DATE,
  last_update DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE job_pipeline_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service key full access" ON job_pipeline_entries
  FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 5: Create Supabase client**

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

- [ ] **Step 6: Install Supabase client + Resend**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npm install @supabase/supabase-js resend`

- [ ] **Step 7: Add env vars to `.env.local`**

```
NEXT_PUBLIC_SUPABASE_URL=https://lohuzsjnztefixqbaoqf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key from red-ox-mobile project settings>
RESEND_API_KEY=<resend-api-key>
JOB_SEARCH_API_KEY=<random-32-char-string>
```

Note: `JOB_SEARCH_API_KEY` is a simple bearer token the scheduled agents send to authenticate write requests. Generate with: `openssl rand -hex 16`

- [ ] **Step 8: Commit**

```bash
git add src/lib/supabase.ts package.json package-lock.json
git commit -m "feat: add Supabase client and Resend for job search dashboard"
```

---

## Task 2: API Routes — Tasks CRUD

**Files:**
- Create: `src/app/api/job-search/tasks/route.ts`
- Create: `src/app/api/job-search/tasks/[id]/complete/route.ts`

- [ ] **Step 1: Create tasks list/create route**

```typescript
// src/app/api/job-search/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .eq("date", date)
    .order("impact", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const body = await request.json();
  const tasks = Array.isArray(body) ? body : [body];

  const rows = tasks.map((t: { task: string; category: string; impact?: string; company?: string; link?: string; date?: string }) => ({
    task: t.task,
    category: t.category,
    impact: t.impact || "medium",
    company: t.company || null,
    link: t.link || null,
    date: t.date || new Date().toISOString().split("T")[0],
  }));

  const { data, error } = await supabase.from("job_daily_tasks").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data }, { status: 201 });
}
```

- [ ] **Step 2: Create task complete route**

```typescript
// src/app/api/job-search/tasks/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("job_daily_tasks")
    .update({ done: true, completed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}
```

- [ ] **Step 3: Verify routes compile**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npx next build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/job-search/tasks/
git commit -m "feat: add task CRUD API routes for job search dashboard"
```

---

## Task 3: API Routes — Metrics + Pipeline

**Files:**
- Create: `src/app/api/job-search/metrics/route.ts`
- Create: `src/app/api/job-search/pipeline/route.ts`

- [ ] **Step 1: Create metrics route**

```typescript
// src/app/api/job-search/metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Current week metrics
  const { data: currentWeek } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .eq("week_start", weekStartStr)
    .single();

  // If no row yet, compute from completed tasks this week
  if (!currentWeek) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const { data: tasks } = await supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("done", true);

    const counts = {
      applications_sent: 0,
      outreach_sent: 0,
      follow_ups_sent: 0,
      linkedin_posts: 0,
      conversations: 0,
    };

    for (const t of tasks || []) {
      if (t.category === "apply") counts.applications_sent++;
      if (t.category === "outreach") counts.outreach_sent++;
      if (t.category === "follow_up") counts.follow_ups_sent++;
      if (t.category === "content") counts.linkedin_posts++;
    }

    return NextResponse.json({
      current: { week_start: weekStartStr, ...counts, phone_screens: 0, interviews: 0, offers: 0 },
      targets: { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 },
    });
  }

  // Last 4 weeks for trend
  const fourWeeksAgo = new Date(weekStart);
  fourWeeksAgo.setDate(weekStart.getDate() - 28);

  const { data: history } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .gte("week_start", fourWeeksAgo.toISOString().split("T")[0])
    .order("week_start", { ascending: true });

  return NextResponse.json({
    current: currentWeek,
    history: history || [],
    targets: { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 },
  });
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.JOB_SEARCH_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("job_weekly_metrics")
    .upsert(body, { onConflict: "week_start" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ metrics: data });
}
```

- [ ] **Step 2: Create pipeline route**

```typescript
// src/app/api/job-search/pipeline/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .select("*")
    .order("last_update", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = data || [];
  const funnel = {
    applied: entries.filter((e) => e.status === "applied").length,
    screen: entries.filter((e) => e.status === "screen").length,
    interview: entries.filter((e) => e.status === "interview").length,
    offer: entries.filter((e) => e.status === "offer").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
    passed: entries.filter((e) => e.status === "passed").length,
  };

  const total = entries.length;
  const conversionRates = {
    app_to_screen: funnel.applied > 0 ? Math.round(((funnel.screen + funnel.interview + funnel.offer) / (funnel.applied + funnel.screen + funnel.interview + funnel.offer)) * 100) : 0,
    screen_to_interview: (funnel.screen + funnel.interview + funnel.offer) > 0 ? Math.round(((funnel.interview + funnel.offer) / (funnel.screen + funnel.interview + funnel.offer)) * 100) : 0,
    interview_to_offer: (funnel.interview + funnel.offer) > 0 ? Math.round((funnel.offer / (funnel.interview + funnel.offer)) * 100) : 0,
  };

  return NextResponse.json({ funnel, conversionRates, total, entries });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/metrics/ src/app/api/job-search/pipeline/
git commit -m "feat: add metrics and pipeline API routes"
```

---

## Task 4: Email Routes (Daily + Weekly)

**Files:**
- Create: `src/app/api/job-search/send-daily-email/route.ts`
- Create: `src/app/api/job-search/send-weekly-review/route.ts`

- [ ] **Step 1: Create daily email route**

```typescript
// src/app/api/job-search/send-daily-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.JOB_SEARCH_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: tasks } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .eq("date", today)
    .order("impact", { ascending: true });

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ error: "No tasks for today" }, { status: 404 });
  }

  const categoryEmoji: Record<string, string> = {
    apply: "📝",
    outreach: "📧",
    follow_up: "🔄",
    content: "✍️",
    prep: "📚",
    admin: "⚙️",
  };

  const impactColor: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#6b7280",
  };

  const taskRows = tasks.map((t) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
        <span style="font-size: 20px;">${categoryEmoji[t.category] || "📋"}</span>
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
  `).join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="padding: 24px 0;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">Today's Game Plan</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        ${taskRows}
      </table>
      <div style="padding: 16px 0; text-align: center;">
        <a href="https://portfolio.jonnymartin.blog/dashboard/job-search" style="display: inline-block; background: #0d9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard</a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 8px;">${tasks.length} tasks &middot; Check them off as you go</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject: `${tasks.length} tasks today — ${tasks.filter((t) => t.impact === "high").length} high impact`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, taskCount: tasks.length });
}
```

- [ ] **Step 2: Create weekly review email route**

```typescript
// src/app/api/job-search/send-weekly-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

const TARGETS = { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 };

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.JOB_SEARCH_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get this week's start (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = new Date(weekStart.getTime() + 6 * 86400000).toISOString().split("T")[0];

  // Count completed tasks by category
  const { data: tasks } = await supabase
    .from("job_daily_tasks")
    .select("category, done")
    .gte("date", weekStartStr)
    .lte("date", weekEndStr);

  const completed = (tasks || []).filter((t) => t.done);
  const total = (tasks || []).length;

  const counts: Record<string, number> = { apply: 0, outreach: 0, follow_up: 0, content: 0, prep: 0, admin: 0 };
  for (const t of completed) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }

  // Get pipeline
  const { data: pipeline } = await supabase.from("job_pipeline_entries").select("status");
  const statuses = (pipeline || []).map((p) => p.status);
  const funnel = {
    applied: statuses.filter((s) => s === "applied").length,
    screen: statuses.filter((s) => s === "screen").length,
    interview: statuses.filter((s) => s === "interview").length,
    offer: statuses.filter((s) => s === "offer").length,
  };

  function bar(actual: number, target: number, label: string): string {
    const pct = Math.min(Math.round((actual / target) * 100), 100);
    const color = pct >= 100 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
    return `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
          <span style="color: #374151; font-weight: 500;">${label}</span>
          <span style="color: ${color}; font-weight: 700;">${actual}/${target}</span>
        </div>
        <div style="background: #f3f4f6; border-radius: 6px; height: 8px; overflow: hidden;">
          <div style="background: ${color}; height: 100%; width: ${pct}%; border-radius: 6px; transition: width 0.3s;"></div>
        </div>
      </div>
    `;
  }

  // Pivot signals
  const signals: string[] = [];
  const totalApplied = funnel.applied + funnel.screen + funnel.interview + funnel.offer;
  const screenRate = totalApplied > 0 ? ((funnel.screen + funnel.interview + funnel.offer) / totalApplied) * 100 : 0;

  if (totalApplied >= 10 && screenRate < 10) {
    signals.push("🔴 Application→Screen rate is below 10%. Your resume may need rework for these roles.");
  }
  if (counts.outreach >= 10 && counts.outreach > 0) {
    signals.push("🟡 Check your outreach response rate. If <15%, try the product-led intro template instead.");
  }
  if (counts.apply < TARGETS.applications_sent) {
    signals.push("🟡 Below target on applications. Block 1 hour tomorrow morning for focused applying.");
  }
  if (completed.length / Math.max(total, 1) > 0.8) {
    signals.push("🟢 Great execution this week. Momentum compounds — keep it up.");
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="padding: 24px 0;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">Weekly Review</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Week of ${new Date(weekStartStr).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px;">Activity vs Targets</h2>
        ${bar(counts.apply, TARGETS.applications_sent, "Applications")}
        ${bar(counts.outreach, TARGETS.outreach_sent, "Outreach")}
        ${bar(counts.follow_up, TARGETS.follow_ups_sent, "Follow-ups")}
        ${bar(counts.content, TARGETS.linkedin_posts, "LinkedIn Posts")}
      </div>

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

      ${signals.length > 0 ? `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 8px;">Signals</h2>
        ${signals.map((s) => `<p style="color: #78350f; font-size: 13px; margin: 4px 0;">${s}</p>`).join("")}
      </div>
      ` : ""}

      <div style="padding: 16px 0; text-align: center;">
        <a href="https://portfolio.jonnymartin.blog/dashboard/job-search" style="display: inline-block; background: #0d9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Full Dashboard</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">${completed.length}/${total} tasks completed this week (${total > 0 ? Math.round((completed.length / total) * 100) : 0}%)</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject: `Week review: ${completed.length}/${total} tasks — ${funnel.interview} interviews active`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/send-daily-email/ src/app/api/job-search/send-weekly-review/
git commit -m "feat: add daily and weekly email routes with Resend"
```

---

## Task 5: Dashboard Page — The Cockpit

**Files:**
- Create: `src/app/dashboard/job-search/page.tsx`
- Create: `src/components/job-search/TaskList.tsx`
- Create: `src/components/job-search/WeeklyScorecard.tsx`
- Create: `src/components/job-search/FunnelHealth.tsx`
- Create: `src/components/job-search/PortfolioKPIs.tsx`

- [ ] **Step 1: Create TaskList component**

```typescript
// src/components/job-search/TaskList.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Task = {
  id: string;
  task: string;
  category: string;
  impact: string;
  company: string | null;
  link: string | null;
  done: boolean;
};

const categoryEmoji: Record<string, string> = {
  apply: "📝",
  outreach: "📧",
  follow_up: "🔄",
  content: "✍️",
  prep: "📚",
  admin: "⚙️",
};

const impactStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function TaskList({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  async function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: true } : t))
    );

    await fetch(`/api/job-search/tasks/${id}/complete`, { method: "POST" });
  }

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Today&apos;s Tasks
        </h2>
        <span className="text-sm font-medium text-zinc-500">
          {done}/{total} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                task.done
                  ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-60"
                  : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700"
              }`}
              onClick={() => !task.done && toggleComplete(task.id)}
            >
              <div className="mt-0.5 shrink-0">
                {task.done ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{categoryEmoji[task.category]}</span>
                  <span className={`text-sm font-medium ${task.done ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {task.task}
                  </span>
                </div>
                {task.company && (
                  <p className="text-xs text-zinc-500 mt-0.5 ml-7">{task.company}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${impactStyles[task.impact]}`}>
                  {task.impact}
                </span>
                {task.link && (
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-teal-500 hover:text-teal-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-zinc-400">
          <p className="text-lg font-medium">No tasks today</p>
          <p className="text-sm mt-1">Check back tomorrow morning</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create WeeklyScorecard component**

```typescript
// src/components/job-search/WeeklyScorecard.tsx
"use client";

import { motion } from "framer-motion";

type Metrics = {
  applications_sent: number;
  outreach_sent: number;
  follow_ups_sent: number;
  linkedin_posts: number;
  conversations: number;
};

type Targets = {
  applications_sent: number;
  outreach_sent: number;
  follow_ups_sent: number;
  linkedin_posts: number;
  conversations: number;
};

const labels: Record<string, string> = {
  applications_sent: "Applications",
  outreach_sent: "Outreach",
  follow_ups_sent: "Follow-ups",
  linkedin_posts: "LinkedIn Posts",
  conversations: "Conversations",
};

function barColor(pct: number): string {
  if (pct >= 100) return "from-emerald-400 to-emerald-500";
  if (pct >= 60) return "from-amber-400 to-amber-500";
  return "from-red-400 to-red-500";
}

export function WeeklyScorecard({ metrics, targets }: { metrics: Metrics; targets: Targets }) {
  const keys = Object.keys(labels) as (keyof Metrics)[];

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        This Week
      </h2>
      <div className="space-y-3">
        {keys.map((key) => {
          const actual = metrics[key] || 0;
          const target = targets[key] || 1;
          const pct = Math.min(Math.round((actual / target) * 100), 100);

          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600 dark:text-zinc-400">{labels[key]}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {actual}<span className="text-zinc-400 font-normal">/{target}</span>
                </span>
              </div>
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor(pct)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create FunnelHealth component**

```typescript
// src/components/job-search/FunnelHealth.tsx
"use client";

type FunnelData = {
  funnel: { applied: number; screen: number; interview: number; offer: number; rejected: number };
  conversionRates: { app_to_screen: number; screen_to_interview: number; interview_to_offer: number };
};

function rateColor(rate: number, healthy: number, warning: number): string {
  if (rate >= healthy) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= warning) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function FunnelHealth({ data }: { data: FunnelData }) {
  const { funnel, conversionRates } = data;

  const stages = [
    { label: "Applied", count: funnel.applied, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    { label: "Screens", count: funnel.screen, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    { label: "Interviews", count: funnel.interview, bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    { label: "Offers", count: funnel.offer, bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-400" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        Pipeline
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {stages.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-bold ${s.text}`}>{s.count}</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">App → Screen</span>
          <span className={`font-semibold ${rateColor(conversionRates.app_to_screen, 15, 10)}`}>
            {conversionRates.app_to_screen}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Screen → Interview</span>
          <span className={`font-semibold ${rateColor(conversionRates.screen_to_interview, 40, 25)}`}>
            {conversionRates.screen_to_interview}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Interview → Offer</span>
          <span className={`font-semibold ${rateColor(conversionRates.interview_to_offer, 25, 15)}`}>
            {conversionRates.interview_to_offer}%
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create PortfolioKPIs component**

```typescript
// src/components/job-search/PortfolioKPIs.tsx
"use client";

import { useEffect, useState } from "react";

type KPIs = {
  visitors: number;
  resumeDownloads: number;
  calendlyClicks: number;
  ctaClicks: number;
};

export function PortfolioKPIs() {
  const [kpis, setKpis] = useState<KPIs>({ visitors: 0, resumeDownloads: 0, calendlyClicks: 0, ctaClicks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch7DayKPIs() {
      try {
        const res = await fetch("/api/dashboard/posthog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queryType: "websitePageViews", days: 7 }),
        });
        if (res.ok) {
          const data = await res.json();
          setKpis((prev) => ({ ...prev, visitors: data.summary?.uniqueVisitors || 0 }));
        }
      } catch {
        // PostHog may not be available
      } finally {
        setLoading(false);
      }
    }
    fetch7DayKPIs();
  }, []);

  if (loading) return null;

  const items = [
    { label: "Visitors (7d)", value: kpis.visitors, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Resume DLs", value: kpis.resumeDownloads, color: "text-teal-600 dark:text-teal-400" },
    { label: "Calendly Clicks", value: kpis.calendlyClicks, color: "text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        Portfolio
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create the dashboard page**

```typescript
// src/app/dashboard/job-search/page.tsx
import { TaskList } from "@/components/job-search/TaskList";
import { WeeklyScorecard } from "@/components/job-search/WeeklyScorecard";
import { FunnelHealth } from "@/components/job-search/FunnelHealth";
import { PortfolioKPIs } from "@/components/job-search/PortfolioKPIs";

async function getTodaysTasks() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const today = new Date().toISOString().split("T")[0];
  try {
    const res = await fetch(`${baseUrl}/api/job-search/tasks?date=${today}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tasks || [];
  } catch {
    return [];
  }
}

async function getMetrics() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/job-search/metrics`, { cache: "no-store" });
    if (!res.ok) return { current: {}, targets: {} };
    return await res.json();
  } catch {
    return { current: {}, targets: {} };
  }
}

async function getPipeline() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/job-search/pipeline`, { cache: "no-store" });
    if (!res.ok) return { funnel: {}, conversionRates: {} };
    return await res.json();
  } catch {
    return { funnel: {}, conversionRates: {} };
  }
}

export default async function JobSearchDashboard() {
  const [tasks, metricsData, pipelineData] = await Promise.all([
    getTodaysTasks(),
    getMetrics(),
    getPipeline(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Job Search
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Layer 1: Today's tasks — FRONT AND CENTER */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <TaskList tasks={tasks} />
      </div>

      {/* Layer 2: Weekly scorecard + Pipeline side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <WeeklyScorecard metrics={metricsData.current} targets={metricsData.targets} />
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <FunnelHealth data={pipelineData} />
        </div>
      </div>

      {/* Layer 3: Portfolio KPIs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PortfolioKPIs />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npx next build 2>&1 | tail -10`

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/job-search/ src/components/job-search/
git commit -m "feat: add ADHD-optimized job search dashboard with task list, scorecard, and funnel"
```

---

## Task 6: Update Scheduled Agents

The existing 3 scheduled agents need to be updated to write tasks to Supabase via the API and trigger emails.

- [ ] **Step 1: Update Weekly Job Scan agent prompt**

Add to the end of the existing prompt:
```
After writing results, also POST today's tasks to the portfolio API:
POST https://portfolio.jonnymartin.blog/api/job-search/tasks
Authorization: Bearer <JOB_SEARCH_API_KEY from env>
Body: array of tasks, e.g.:
[
  {"task": "Apply to Anthropic Claude Code PM", "category": "apply", "impact": "high", "company": "Anthropic", "link": "https://anthropic.com/careers/..."},
  {"task": "Send cold email to Sett CEO", "category": "outreach", "impact": "high", "company": "Sett"}
]
Generate 3-5 tasks for the day based on what the scan found + existing pipeline state.
Then trigger the daily email:
POST https://portfolio.jonnymartin.blog/api/job-search/send-daily-email
Authorization: Bearer <JOB_SEARCH_API_KEY>
```

- [ ] **Step 2: Create a new Friday scheduled agent for weekly review**

Since we already have 3 agents (max), we need to either:
- (a) Combine the weekly review into the Follow-Up Nudger (Wednesday), or
- (b) Replace the LinkedIn Post Drafter with a combined content + weekly review agent

Recommended: Keep the 3 agents as-is, but have the Follow-Up Nudger (Wednesday) also trigger the weekly email on Fridays. OR use a Vercel Cron Job for the Friday email.

Alternative: Add a Vercel cron job in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/job-search/send-weekly-review",
      "schedule": "0 16 * * 5"
    }
  ]
}
```
This calls the weekly review endpoint every Friday at 9am PT (4pm UTC). The endpoint is already auth-protected.

- [ ] **Step 3: Set env vars on Vercel**

Add to Vercel environment variables (if not already set):
- `NEXT_PUBLIC_SUPABASE_URL` = `https://lohuzsjnztefixqbaoqf.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` (from red-ox-mobile project settings → API)
- `RESEND_API_KEY`
- `JOB_SEARCH_API_KEY` (generate with `openssl rand -hex 16`)
- `NEXT_PUBLIC_SITE_URL` = `https://portfolio.jonnymartin.blog`

- [ ] **Step 4: Commit vercel.json if using Vercel Cron**

```bash
git add vercel.json
git commit -m "feat: add Vercel cron for weekly review email"
```

---

## Task 7: Seed Initial Data

- [ ] **Step 1: Seed this week's tasks**

POST to `/api/job-search/tasks` with initial tasks:
```json
[
  {"task": "Send cold email to Amit Carmi at Sett", "category": "outreach", "impact": "high", "company": "Sett", "link": "https://github.com/jonalexjames84/portfolio/blob/main/documents/outreach-drafts-top4.md"},
  {"task": "Apply to Anthropic PM, Claude Code", "category": "apply", "impact": "high", "company": "Anthropic", "link": "https://www.anthropic.com/careers"},
  {"task": "Update LinkedIn headline and About section", "category": "content", "impact": "high", "link": "https://github.com/jonalexjames84/portfolio/blob/main/documents/linkedin-strategy.md"},
  {"task": "Send cold email to Cat Wu at Anthropic", "category": "outreach", "impact": "high", "company": "Anthropic", "link": "https://github.com/jonalexjames84/portfolio/blob/main/documents/outreach-drafts-top4.md"},
  {"task": "Apply to Replit Senior PM", "category": "apply", "impact": "medium", "company": "Replit", "link": "https://replit.com/careers"}
]
```

- [ ] **Step 2: Seed pipeline entries from Notion tracker**

Add the 17 open roles as pipeline entries with status "applied" (or "screen" etc. as appropriate).

- [ ] **Step 3: Verify dashboard renders**

Run: `npm run dev` and visit `http://localhost:3000/dashboard/job-search`

---

## Summary

| Layer | What | Trigger | Frequency |
|---|---|---|---|
| Daily Email | 3-5 tasks delivered to inbox | Scheduled agent → API | Every morning |
| Dashboard | Visual cockpit: tasks, scorecard, funnel, KPIs | Browser tab (pull) | On demand |
| Weekly Review | Scorecard + pivot signals to inbox | Vercel Cron → API | Every Friday |

**ADHD optimizations:**
- Tasks come TO you via email — zero activation energy
- Dashboard is one narrow column, max 2xl width — no visual overwhelm
- Tasks are big click targets with immediate visual feedback (check → strikethrough + progress bar)
- Weekly scorecard uses color-coded progress bars — instant read on whether you're on track
- Pivot signals are automatic — no need to analyze your own conversion rates
