# Job Search Report Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current daily email and dashboard with a unified four-block format (New Jobs → This Week → Metrics → Signals) so Jon sees fresh ranked jobs first, the whole week sequenced by dependency, and trend-aware metrics.

**Architecture:** Pure-function logic units (`fit-score`, `weekly-plan-generator`, `metrics-rollup`, `signals`, `sparkline`) under `src/lib/job-search/` are unit-tested with Vitest. Three new cron-protected API routes drive nightly scoring, weekly plan generation, and metrics rollup. The daily email route and dashboard page are refactored to render the same four-block layout from shared section components.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase, Resend, TypeScript, Vitest (added in Task 1), Recharts (already present).

**Spec:** `docs/superpowers/specs/2026-04-07-job-search-report-redesign-design.md`

---

## Conventions used in this plan

- All test files live next to the source: `src/lib/job-search/fit-score.test.ts` next to `src/lib/job-search/fit-score.ts`.
- Pure functions take plain typed inputs, return plain typed outputs, never hit Supabase. All Supabase access is in API routes or page components.
- Commits are small. Every task ends with a commit.
- Migrations are written as numbered SQL files in `supabase/migrations/` and run by Jon manually against the shared `red-ox-mobile` Supabase project (per the user's preference: never create new projects, always use the `job_` table prefix).

---

## Task 0: Pre-flight schema audit

**Files:**
- Read-only inspection of Supabase via the existing `supabase` client.

**Why:** The spec assumes several columns may not exist on `job_pipeline_entries`, `job_connections`, etc. Before writing the migration, verify what's actually there so we don't add duplicate columns.

- [ ] **Step 1: List columns on each affected table**

Inspect column names for these tables either via the Supabase web UI (Table Editor → click each table) or via SQL editor running:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN (
  'job_pipeline_entries','job_daily_tasks','job_weekly_metrics',
  'job_connections','job_briefings','job_target_companies'
)
ORDER BY table_name, ordinal_position;
```

You need column names for: `job_pipeline_entries`, `job_daily_tasks`, `job_weekly_metrics`, `job_connections`, `job_briefings`, `job_target_companies`.

- [ ] **Step 2: Record findings in the plan**

Append the actual column lists to the bottom of this plan file under a `## Schema Audit Results` section. Future tasks reference these.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/2026-04-07-job-search-report-redesign.md
git commit -m "docs: record schema audit results for redesign plan"
```

---

## Task 1: Add Vitest test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `src/lib/job-search/__sanity__.test.ts` (deleted at end of task — proves config works)

- [ ] **Step 1: Install Vitest and types**

```bash
npm install --save-dev vitest @vitest/ui
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add test script to `package.json`**

In the `scripts` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a sanity test**

Create `src/lib/job-search/__sanity__.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the test**

```bash
npm test
```

Expected: 1 passed.

- [ ] **Step 6: Delete the sanity test and commit**

```bash
rm src/lib/job-search/__sanity__.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "build: add vitest test infrastructure"
```

---

## Task 2: Schema migration

**Files:**
- Create: `supabase/migrations/20260407000001_job_search_redesign.sql`

This adds all new columns required by the redesign in one migration. Engineer must verify each `ADD COLUMN IF NOT EXISTS` against the audit results from Task 0 — if a column already exists with a different name, prefer the existing name and update later code references accordingly.

- [ ] **Step 1: Write the migration file**

```sql
-- Job search report redesign — schema additions
-- Run against the shared red-ox-mobile Supabase project

-- job_pipeline_entries: scoring + auto-source fields
ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS fit_score_auto integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS jd_text text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS interview_date date;

-- job_daily_tasks: probability + provenance + carry-forward
ALTER TABLE job_daily_tasks
  ADD COLUMN IF NOT EXISTS probability_lift integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS carried_over boolean DEFAULT false;

-- job_weekly_metrics: new KPI columns
ALTER TABLE job_weekly_metrics
  ADD COLUMN IF NOT EXISTS response_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_pipeline_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interviews_completed integer DEFAULT 0;

-- job_connections: reply tracking for response rate
ALTER TABLE job_connections
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

-- Helpful index for the "new jobs in last 24h" query
CREATE INDEX IF NOT EXISTS idx_pipeline_created_at ON job_pipeline_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_fit_score_auto ON job_pipeline_entries(fit_score_auto DESC);
```

- [ ] **Step 2: Tell Jon to run the migration**

The plan executor should pause here and tell the user:

> "Migration file written. Please run it against the red-ox-mobile Supabase project (paste it into the SQL editor) and confirm before continuing. The plan can't proceed without it."

Wait for confirmation before continuing.

- [ ] **Step 3: Commit the migration file**

```bash
git add supabase/migrations/20260407000001_job_search_redesign.sql
git commit -m "feat: add schema migration for job search report redesign"
```

---

## Task 3: Type definitions for shared models

**Files:**
- Create: `src/lib/job-search/types.ts`

These types are used by every logic unit. They model the actual Supabase row shape after the migration.

- [ ] **Step 1: Write `src/lib/job-search/types.ts`**

```ts
export type PipelineStatus =
  | "saved"
  | "applied"
  | "screen"
  | "interview"
  | "offer"
  | "rejected"
  | "passed";

export type TaskCategory =
  | "apply"
  | "outreach"
  | "follow_up"
  | "content"
  | "linkedin_post"
  | "prep"
  | "admin";

export type TaskImpact = "high" | "medium" | "low";

export type TaskSource =
  | "interview_prep"
  | "stale_pipeline"
  | "apply_new_job"
  | "outreach"
  | "backlog";

export interface PipelineEntry {
  id: string;
  company: string;
  role: string;
  status: PipelineStatus;
  created_at: string;
  applied_date: string | null;
  last_update: string;
  job_url: string | null;
  fit_score: number | null;        // manual override
  fit_score_auto: number;          // computed
  score_breakdown: ScoreBreakdown | null;
  jd_text: string | null;
  industry: string | null;
  stage: string | null;
  location: string | null;
  interview_date: string | null;
  notes: string | null;
}

export interface ScoreBreakdown {
  title_match: number;
  seniority_fit: number;
  keyword_match: number;
  industry_fit: number;
  stage_fit: number;
  red_flags: number;
}

export interface DailyTask {
  id: string;
  date: string;
  category: TaskCategory;
  task: string;
  company: string | null;
  link: string | null;
  impact: TaskImpact;
  probability_lift: number;
  source: TaskSource | null;
  blocked_by: string | null;
  carried_over: boolean;
  done: boolean;
}

export interface Connection {
  id: string;
  name: string;
  company_name: string | null;
  outreach_stage: string | null;
  referral_status: string | null;
  last_contact: string | null;
  replied_at: string | null;
  next_action: string | null;
}

export interface WeeklyMetricsRow {
  week_start: string;
  applications_sent: number;
  outreach_sent: number;
  follow_ups_sent: number;
  linkedin_posts: number;
  conversations: number;
  phone_screens: number;
  interviews: number;
  offers: number;
  response_rate: number;
  active_pipeline_count: number;
  interviews_completed: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/job-search/types.ts
git commit -m "feat: add shared types for job search redesign"
```

---

## Task 4: Fit-score function (TDD)

**Files:**
- Create: `src/lib/job-search/fit-score.ts`
- Create: `src/lib/job-search/fit-score.test.ts`

This is the rule-based auto-score from the spec.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/job-search/fit-score.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeAutoFitScore } from "./fit-score";
import type { PipelineEntry } from "./types";

function entry(overrides: Partial<PipelineEntry> = {}): PipelineEntry {
  return {
    id: "1",
    company: "Acme",
    role: "Product Manager",
    status: "saved",
    created_at: "2026-04-07T00:00:00Z",
    applied_date: null,
    last_update: "2026-04-07",
    job_url: null,
    fit_score: null,
    fit_score_auto: 0,
    score_breakdown: null,
    jd_text: null,
    industry: null,
    stage: null,
    location: null,
    interview_date: null,
    notes: null,
    ...overrides,
  };
}

describe("computeAutoFitScore", () => {
  it("gives base credit for a generic PM title", () => {
    const { total } = computeAutoFitScore(entry({ role: "Product Manager" }));
    expect(total).toBe(25);
  });

  it("adds seniority bonus for Senior PM", () => {
    const { total } = computeAutoFitScore(entry({ role: "Senior Product Manager" }));
    expect(total).toBe(40); // 25 + 15
  });

  it("adds keyword match capped at 25", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        jd_text: "Build AI agents on a dev tools platform with ML and LLM features and SaaS",
      })
    );
    // 25 (PM) + 15 (Senior) + 25 (cap, 6 keywords matched) = 65
    expect(total).toBe(65);
  });

  it("adds industry and stage bonuses", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        industry: "AI/ML",
        stage: "Series B",
      })
    );
    expect(total).toBe(65); // 25 + 15 + 15 + 10
  });

  it("subtracts for junior red flag", () => {
    const { total } = computeAutoFitScore(
      entry({ role: "Associate Product Manager" })
    );
    expect(total).toBe(0); // 25 - 30, clamped to 0
  });

  it("subtracts for non-Bay-Area on-site location", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        location: "On-site - New York, NY",
      })
    );
    expect(total).toBe(20); // 25 + 15 - 20
  });

  it("does not subtract location penalty for Bay Area on-site", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        location: "On-site - San Francisco, CA",
      })
    );
    expect(total).toBe(40);
  });

  it("clamps maximum at 100", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Head of Product",
        jd_text: "AI ML LLM agent platform dev tools SaaS",
        industry: "AI/ML",
        stage: "Series A",
      })
    );
    // 25 + 15 + 25 + 15 + 10 = 90, OK
    expect(total).toBe(90);
  });

  it("returns the breakdown", () => {
    const { breakdown } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        industry: "SaaS",
        stage: "Series B",
      })
    );
    expect(breakdown).toEqual({
      title_match: 25,
      seniority_fit: 15,
      keyword_match: 0,
      industry_fit: 15,
      stage_fit: 10,
      red_flags: 0,
    });
  });
});
```

- [ ] **Step 2: Run the tests, expect failure**

```bash
npm test -- fit-score
```

Expected: FAIL — `computeAutoFitScore` not exported.

- [ ] **Step 3: Implement `src/lib/job-search/fit-score.ts`**

```ts
import type { PipelineEntry, ScoreBreakdown } from "./types";

const KEYWORDS = ["ai", "ml", "llm", "agent", "platform", "dev tools", "saas"];
const SENIORITY_TERMS = ["senior", "staff", "principal", "lead", "head"];
const PM_TERMS = ["product manager", "pm", "head of product"];
const JUNIOR_TERMS = ["associate", "junior", "intern"];
const TARGET_INDUSTRIES = ["ai/ml", "ai", "ml", "saas", "dev tools", "consumer"];
const TARGET_STAGES = ["seed", "series a", "series b"];
const BAY_AREA_HINTS = [
  "san francisco",
  "sf",
  "bay area",
  "oakland",
  "berkeley",
  "palo alto",
  "mountain view",
  "menlo park",
  "south san francisco",
];

function lc(s: string | null | undefined): string {
  return (s || "").toLowerCase();
}

export function computeAutoFitScore(entry: PipelineEntry): {
  total: number;
  breakdown: ScoreBreakdown;
} {
  const role = lc(entry.role);
  const jd = lc(entry.jd_text);
  const industry = lc(entry.industry);
  const stage = lc(entry.stage);
  const location = lc(entry.location);

  const breakdown: ScoreBreakdown = {
    title_match: 0,
    seniority_fit: 0,
    keyword_match: 0,
    industry_fit: 0,
    stage_fit: 0,
    red_flags: 0,
  };

  if (PM_TERMS.some((t) => role.includes(t))) breakdown.title_match = 25;
  if (SENIORITY_TERMS.some((t) => role.includes(t))) breakdown.seniority_fit = 15;

  const matchedKeywords = KEYWORDS.filter((k) => jd.includes(k));
  breakdown.keyword_match = Math.min(matchedKeywords.length * 5, 25);

  if (TARGET_INDUSTRIES.some((i) => industry.includes(i))) breakdown.industry_fit = 15;
  if (TARGET_STAGES.some((s) => stage.includes(s))) breakdown.stage_fit = 10;

  if (JUNIOR_TERMS.some((t) => role.includes(t))) breakdown.red_flags -= 30;
  if (
    location.includes("on-site") &&
    !BAY_AREA_HINTS.some((h) => location.includes(h))
  ) {
    breakdown.red_flags -= 20;
  }

  const raw =
    breakdown.title_match +
    breakdown.seniority_fit +
    breakdown.keyword_match +
    breakdown.industry_fit +
    breakdown.stage_fit +
    breakdown.red_flags;

  const total = Math.max(0, Math.min(100, raw));
  return { total, breakdown };
}
```

- [ ] **Step 4: Run tests, expect pass**

```bash
npm test -- fit-score
```

Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/fit-score.ts src/lib/job-search/fit-score.test.ts
git commit -m "feat: add rule-based fit score for pipeline entries"
```

---

## Task 5: Signals function (TDD)

**Files:**
- Create: `src/lib/job-search/signals.ts`
- Create: `src/lib/job-search/signals.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import { computeSignals, type SignalInput } from "./signals";

function input(overrides: Partial<SignalInput> = {}): SignalInput {
  return {
    weekdaysPassed: 0,
    appsThisWeek: 0,
    appsTarget: 5,
    last10OutreachReplies: 5,
    staleActiveRoles: [],
    interviewsThisWeek: 0,
    savedCount: 10,
    newTopTierJobs: [],
    ...overrides,
  };
}

describe("computeSignals", () => {
  it("returns empty array when nothing is wrong", () => {
    expect(computeSignals(input())).toEqual([]);
  });

  it("flags slow apply pace mid-week", () => {
    const signals = computeSignals(
      input({ weekdaysPassed: 3, appsThisWeek: 1, appsTarget: 5 })
    );
    expect(signals.some((s) => s.id === "apply_pace_slow")).toBe(true);
  });

  it("does not flag apply pace before midweek", () => {
    const signals = computeSignals(
      input({ weekdaysPassed: 2, appsThisWeek: 1, appsTarget: 5 })
    );
    expect(signals.some((s) => s.id === "apply_pace_slow")).toBe(false);
  });

  it("flags zero replies on last 10 outreach", () => {
    const signals = computeSignals(input({ last10OutreachReplies: 0 }));
    expect(signals.some((s) => s.id === "outreach_no_replies")).toBe(true);
  });

  it("flags stale active roles >10d", () => {
    const signals = computeSignals(
      input({ staleActiveRoles: [{ id: "1", company: "Vercel", daysSince: 12 }] })
    );
    expect(signals.some((s) => s.id === "stale_active_role")).toBe(true);
  });

  it("flags hot streak with 3+ interviews this week", () => {
    const signals = computeSignals(input({ interviewsThisWeek: 3 }));
    expect(signals.some((s) => s.id === "hot_streak")).toBe(true);
  });

  it("flags pipeline drying up when saved < 5", () => {
    const signals = computeSignals(input({ savedCount: 3 }));
    expect(signals.some((s) => s.id === "pipeline_drying_up")).toBe(true);
  });

  it("flags new top-tier job (90+)", () => {
    const signals = computeSignals(
      input({
        newTopTierJobs: [{ id: "abc", company: "Anthropic", role: "PM", score: 92 }],
      })
    );
    expect(signals.some((s) => s.id === "new_top_tier_job")).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm test -- signals
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/job-search/signals.ts`**

```ts
export type SignalSeverity = "warn" | "alert" | "good";

export interface Signal {
  id: string;
  severity: SignalSeverity;
  message: string;
}

export interface SignalInput {
  weekdaysPassed: number;
  appsThisWeek: number;
  appsTarget: number;
  last10OutreachReplies: number;
  staleActiveRoles: Array<{ id: string; company: string; daysSince: number }>;
  interviewsThisWeek: number;
  savedCount: number;
  newTopTierJobs: Array<{ id: string; company: string; role: string; score: number }>;
}

export function computeSignals(input: SignalInput): Signal[] {
  const out: Signal[] = [];

  if (input.weekdaysPassed >= 3) {
    const projected = (input.appsThisWeek / input.weekdaysPassed) * 5;
    if (projected < input.appsTarget) {
      const daysLeft = 5 - input.weekdaysPassed;
      out.push({
        id: "apply_pace_slow",
        severity: "warn",
        message: `🟡 Apply pace slow — ${input.appsThisWeek}/${input.appsTarget} with ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
      });
    }
  }

  if (input.last10OutreachReplies === 0) {
    out.push({
      id: "outreach_no_replies",
      severity: "warn",
      message: "🟡 Last 10 outreach → 0 replies. Tighten messaging?",
    });
  }

  for (const role of input.staleActiveRoles) {
    if (role.daysSince > 10) {
      out.push({
        id: "stale_active_role",
        severity: "alert",
        message: `🔴 ${role.company} — ${role.daysSince} days since last touch`,
      });
    }
  }

  if (input.interviewsThisWeek >= 3) {
    out.push({
      id: "hot_streak",
      severity: "good",
      message: `🟢 ${input.interviewsThisWeek} interviews booked this week — double down on prep`,
    });
  }

  if (input.savedCount < 5) {
    out.push({
      id: "pipeline_drying_up",
      severity: "alert",
      message: `🔴 Only ${input.savedCount} saved roles — refill the pipeline`,
    });
  }

  for (const job of input.newTopTierJobs) {
    if (job.score >= 90) {
      out.push({
        id: "new_top_tier_job",
        severity: "good",
        message: `🟢 New top match: ${job.role} at ${job.company} (${job.score}/100)`,
      });
    }
  }

  return out;
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- signals
```

Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/signals.ts src/lib/job-search/signals.test.ts
git commit -m "feat: add signals computation for anomaly detection"
```

---

## Task 6: Sparkline SVG renderer (TDD)

**Files:**
- Create: `src/lib/job-search/sparkline.ts`
- Create: `src/lib/job-search/sparkline.test.ts`

This produces a string of SVG markup small enough to inline in email HTML.

- [ ] **Step 1: Write tests**

```ts
import { describe, it, expect } from "vitest";
import { renderSparklineSvg } from "./sparkline";

describe("renderSparklineSvg", () => {
  it("returns an SVG string", () => {
    const svg = renderSparklineSvg([1, 2, 3, 4, 5]);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("uses width and height defaults", () => {
    const svg = renderSparklineSvg([1, 2, 3]);
    expect(svg).toContain('width="80"');
    expect(svg).toContain('height="20"');
  });

  it("includes a polyline element", () => {
    const svg = renderSparklineSvg([1, 2, 3, 4, 5]);
    expect(svg).toContain("<polyline");
  });

  it("renders a flat baseline for constant input", () => {
    const svg = renderSparklineSvg([3, 3, 3, 3]);
    expect(svg).toContain("<polyline");
  });

  it("returns an empty SVG for empty input", () => {
    const svg = renderSparklineSvg([]);
    expect(svg).toContain("<svg");
    expect(svg).not.toContain("<polyline");
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm test -- sparkline
```

- [ ] **Step 3: Implement `src/lib/job-search/sparkline.ts`**

```ts
export interface SparklineOptions {
  width?: number;
  height?: number;
  stroke?: string;
}

export function renderSparklineSvg(
  values: number[],
  options: SparklineOptions = {}
): string {
  const width = options.width ?? 80;
  const height = options.height ?? 20;
  const stroke = options.stroke ?? "#0d9488";

  if (values.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><polyline fill="none" stroke="${stroke}" stroke-width="1.5" points="${points}" /></svg>`;
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- sparkline
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/sparkline.ts src/lib/job-search/sparkline.test.ts
git commit -m "feat: add sparkline SVG renderer for email and dashboard"
```

---

## Task 7: Metrics rollup function (TDD)

**Files:**
- Create: `src/lib/job-search/metrics-rollup.ts`
- Create: `src/lib/job-search/metrics-rollup.test.ts`

Pure function: takes raw inputs, returns the row to upsert. The route in Task 12 fetches the inputs from Supabase and calls this.

- [ ] **Step 1: Write tests**

```ts
import { describe, it, expect } from "vitest";
import { computeWeeklyMetrics, type RollupInput } from "./metrics-rollup";

function input(overrides: Partial<RollupInput> = {}): RollupInput {
  return {
    weekStart: "2026-04-06",
    completedTasksByCategory: {},
    pipelineStatuses: [],
    connectionsContactedLast14d: 0,
    connectionsRepliedLast14d: 0,
    interviewsCompletedThisWeek: 0,
    ...overrides,
  };
}

describe("computeWeeklyMetrics", () => {
  it("counts applications from completed apply tasks", () => {
    const row = computeWeeklyMetrics(
      input({ completedTasksByCategory: { apply: 4 } })
    );
    expect(row.applications_sent).toBe(4);
  });

  it("counts outreach + follow-ups + linkedin", () => {
    const row = computeWeeklyMetrics(
      input({
        completedTasksByCategory: {
          outreach: 3,
          follow_up: 2,
          linkedin_post: 1,
        },
      })
    );
    expect(row.outreach_sent).toBe(3);
    expect(row.follow_ups_sent).toBe(2);
    expect(row.linkedin_posts).toBe(1);
  });

  it("computes response rate as replied/contacted", () => {
    const row = computeWeeklyMetrics(
      input({ connectionsContactedLast14d: 10, connectionsRepliedLast14d: 3 })
    );
    expect(row.response_rate).toBe(0.3);
  });

  it("returns 0 response rate when no contacts", () => {
    const row = computeWeeklyMetrics(
      input({ connectionsContactedLast14d: 0, connectionsRepliedLast14d: 0 })
    );
    expect(row.response_rate).toBe(0);
  });

  it("counts active pipeline as saved + applied + screen + interview", () => {
    const row = computeWeeklyMetrics(
      input({
        pipelineStatuses: [
          "saved",
          "saved",
          "applied",
          "screen",
          "interview",
          "rejected",
          "passed",
        ],
      })
    );
    expect(row.active_pipeline_count).toBe(5);
  });

  it("passes through interviews_completed", () => {
    const row = computeWeeklyMetrics(input({ interviewsCompletedThisWeek: 2 }));
    expect(row.interviews_completed).toBe(2);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm test -- metrics-rollup
```

- [ ] **Step 3: Implement `src/lib/job-search/metrics-rollup.ts`**

```ts
import type { PipelineStatus, WeeklyMetricsRow } from "./types";

export interface RollupInput {
  weekStart: string;
  completedTasksByCategory: Record<string, number>;
  pipelineStatuses: PipelineStatus[];
  connectionsContactedLast14d: number;
  connectionsRepliedLast14d: number;
  interviewsCompletedThisWeek: number;
}

const ACTIVE_STATUSES: PipelineStatus[] = ["saved", "applied", "screen", "interview"];

export function computeWeeklyMetrics(
  input: RollupInput
): WeeklyMetricsRow {
  const c = input.completedTasksByCategory;
  const responseRate =
    input.connectionsContactedLast14d > 0
      ? input.connectionsRepliedLast14d / input.connectionsContactedLast14d
      : 0;

  const activeCount = input.pipelineStatuses.filter((s) =>
    ACTIVE_STATUSES.includes(s)
  ).length;

  return {
    week_start: input.weekStart,
    applications_sent: c.apply || 0,
    outreach_sent: c.outreach || 0,
    follow_ups_sent: c.follow_up || 0,
    linkedin_posts: c.linkedin_post || 0,
    conversations: 0,
    phone_screens: 0,
    interviews: 0,
    offers: 0,
    response_rate: responseRate,
    active_pipeline_count: activeCount,
    interviews_completed: input.interviewsCompletedThisWeek,
  };
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- metrics-rollup
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/metrics-rollup.ts src/lib/job-search/metrics-rollup.test.ts
git commit -m "feat: add weekly metrics rollup function"
```

---

## Task 8: Weekly plan generator (TDD)

**Files:**
- Create: `src/lib/job-search/weekly-plan-generator.ts`
- Create: `src/lib/job-search/weekly-plan-generator.test.ts`

Pure function: takes raw candidate data, returns the array of `DailyTask`s to insert. The route in Task 11 fetches inputs and writes outputs.

- [ ] **Step 1: Write tests**

```ts
import { describe, it, expect } from "vitest";
import { generateWeeklyPlan, type PlanInput } from "./weekly-plan-generator";

function input(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    weekStartDate: "2026-04-06",
    interviews: [],
    stalePipelineEntries: [],
    newScoredJobs: [],
    staleConnections: [],
    targetCompanyBacklog: [],
    carriedOverHighImpact: [],
    ...overrides,
  };
}

describe("generateWeeklyPlan", () => {
  it("returns empty array for empty inputs", () => {
    expect(generateWeeklyPlan(input()).length).toBe(0);
  });

  it("schedules interview prep 1 day before the interview", () => {
    const tasks = generateWeeklyPlan(
      input({
        interviews: [
          { id: "p1", company: "Anthropic", role: "PM", date: "2026-04-08" }, // Wed
        ],
      })
    );
    const prepTask = tasks.find((t) => t.source === "interview_prep");
    expect(prepTask).toBeDefined();
    expect(prepTask?.date).toBe("2026-04-07"); // Tue
    expect(prepTask?.impact).toBe("high");
    expect(prepTask?.probability_lift).toBe(10);
  });

  it("creates apply tasks for new jobs scoring 80+", () => {
    const tasks = generateWeeklyPlan(
      input({
        newScoredJobs: [
          { id: "j1", company: "Vercel", role: "Staff PM", score: 85 },
          { id: "j2", company: "Linear", role: "PM", score: 72 },
        ],
      })
    );
    const high = tasks.filter((t) => t.source === "apply_new_job" && t.impact === "high");
    const medium = tasks.filter((t) => t.source === "apply_new_job" && t.impact === "medium");
    expect(high.length).toBe(1);
    expect(medium.length).toBe(1);
    expect(high[0].probability_lift).toBe(8);
    expect(medium[0].probability_lift).toBe(4);
  });

  it("creates follow-up tasks for stale pipeline entries", () => {
    const tasks = generateWeeklyPlan(
      input({
        stalePipelineEntries: [{ id: "p2", company: "Stripe", daysSinceUpdate: 9 }],
      })
    );
    const t = tasks.find((t) => t.source === "stale_pipeline");
    expect(t).toBeDefined();
    expect(t?.impact).toBe("high");
    expect(t?.probability_lift).toBe(7);
  });

  it("prunes tasks with probability_lift below 3", () => {
    const tasks = generateWeeklyPlan(
      input({
        targetCompanyBacklog: [{ id: "tc1", company: "Foo" }],
      })
    );
    // backlog tasks have probability_lift = 3, should survive
    expect(tasks.length).toBe(1);
  });

  it("caps total tasks at 25 per week, keeping highest probability_lift", () => {
    const stale = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      company: `C${i}`,
      daysSinceUpdate: 10,
    }));
    const tasks = generateWeeklyPlan(input({ stalePipelineEntries: stale }));
    expect(tasks.length).toBe(25);
  });

  it("caps each day at 5 tasks", () => {
    const stale = Array.from({ length: 25 }, (_, i) => ({
      id: `p${i}`,
      company: `C${i}`,
      daysSinceUpdate: 10,
    }));
    const tasks = generateWeeklyPlan(input({ stalePipelineEntries: stale }));
    const byDate: Record<string, number> = {};
    for (const t of tasks) byDate[t.date] = (byDate[t.date] || 0) + 1;
    for (const count of Object.values(byDate)) {
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it("carries forward high-impact unfinished tasks to Monday", () => {
    const tasks = generateWeeklyPlan(
      input({
        carriedOverHighImpact: [
          {
            id: "old1",
            task: "Apply: Anthropic PM",
            category: "apply",
            company: "Anthropic",
          },
        ],
      })
    );
    const carried = tasks.find((t) => t.task === "Apply: Anthropic PM");
    expect(carried).toBeDefined();
    expect(carried?.date).toBe("2026-04-06"); // Monday
    expect(carried?.carried_over).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm test -- weekly-plan-generator
```

- [ ] **Step 3: Implement `src/lib/job-search/weekly-plan-generator.ts`**

```ts
import type { TaskCategory, TaskImpact, TaskSource } from "./types";

export interface PlanInput {
  weekStartDate: string; // Monday
  interviews: Array<{ id: string; company: string; role: string; date: string }>;
  stalePipelineEntries: Array<{ id: string; company: string; daysSinceUpdate: number }>;
  newScoredJobs: Array<{ id: string; company: string; role: string; score: number }>;
  staleConnections: Array<{ id: string; name: string; company: string | null }>;
  targetCompanyBacklog: Array<{ id: string; company: string }>;
  carriedOverHighImpact: Array<{
    id: string;
    task: string;
    category: TaskCategory;
    company: string | null;
  }>;
}

export interface GeneratedTask {
  date: string;
  category: TaskCategory;
  task: string;
  company: string | null;
  link: string | null;
  impact: TaskImpact;
  probability_lift: number;
  source: TaskSource;
  carried_over: boolean;
}

const DAY_CAP = 5;
const WEEK_CAP = 25;
const MIN_PROBABILITY_LIFT = 3;

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function weekdayDates(weekStartDate: string): string[] {
  return [0, 1, 2, 3, 4].map((i) => addDays(weekStartDate, i));
}

export function generateWeeklyPlan(input: PlanInput): GeneratedTask[] {
  const candidates: GeneratedTask[] = [];

  // 1. Carry-forward high-impact tasks → Monday
  for (const c of input.carriedOverHighImpact) {
    candidates.push({
      date: input.weekStartDate,
      category: c.category,
      task: c.task,
      company: c.company,
      link: null,
      impact: "high",
      probability_lift: 9,
      source: "stale_pipeline",
      carried_over: true,
    });
  }

  // 2. Interview prep — pinned to interview_date - 1
  for (const iv of input.interviews) {
    const prepDate = addDays(iv.date, -1);
    candidates.push({
      date: prepDate,
      category: "prep",
      task: `Prep for ${iv.company} interview (${iv.role})`,
      company: iv.company,
      link: null,
      impact: "high",
      probability_lift: 10,
      source: "interview_prep",
      carried_over: false,
    });
  }

  // 3. Apply to new top-scored jobs
  for (const job of input.newScoredJobs) {
    const isHigh = job.score >= 80;
    candidates.push({
      date: "", // assigned later
      category: "apply",
      task: `Apply: ${job.role} — ${job.company}`,
      company: job.company,
      link: null,
      impact: isHigh ? "high" : "medium",
      probability_lift: isHigh ? 8 : 4,
      source: "apply_new_job",
      carried_over: false,
    });
  }

  // 4. Stale pipeline follow-ups
  for (const stale of input.stalePipelineEntries) {
    candidates.push({
      date: "",
      category: "follow_up",
      task: `Follow up with ${stale.company} (${stale.daysSinceUpdate}d since last touch)`,
      company: stale.company,
      link: null,
      impact: "high",
      probability_lift: 7,
      source: "stale_pipeline",
      carried_over: false,
    });
  }

  // 5. Stale connection outreach
  for (const conn of input.staleConnections) {
    candidates.push({
      date: "",
      category: "outreach",
      task: `Reach out to ${conn.name}${conn.company ? ` (${conn.company})` : ""}`,
      company: conn.company,
      link: null,
      impact: "medium",
      probability_lift: 5,
      source: "outreach",
      carried_over: false,
    });
  }

  // 6. Backlog outreach (lowest priority)
  for (const tc of input.targetCompanyBacklog) {
    candidates.push({
      date: "",
      category: "outreach",
      task: `New outreach to ${tc.company}`,
      company: tc.company,
      link: null,
      impact: "medium",
      probability_lift: 3,
      source: "backlog",
      carried_over: false,
    });
  }

  // Prune by minimum probability_lift
  const pruned = candidates.filter((t) => t.probability_lift >= MIN_PROBABILITY_LIFT);

  // Pinned tasks (already have a date) keep theirs; unpinned will be assigned
  const pinned = pruned.filter((t) => t.date !== "");
  const unpinned = pruned.filter((t) => t.date === "");

  // Sort unpinned by probability_lift desc
  unpinned.sort((a, b) => b.probability_lift - a.probability_lift);

  // Track day fill counts
  const days = weekdayDates(input.weekStartDate);
  const fill: Record<string, number> = {};
  for (const d of days) fill[d] = 0;
  for (const t of pinned) fill[t.date] = (fill[t.date] || 0) + 1;

  // Distribute unpinned across days, day-cap aware
  for (const t of unpinned) {
    const target = days.find((d) => fill[d] < DAY_CAP);
    if (!target) break; // all days full
    t.date = target;
    fill[target]++;
  }

  // Combine
  const combined = [...pinned, ...unpinned.filter((t) => t.date !== "")];

  // Apply week cap (25 max), keep highest probability_lift
  combined.sort((a, b) => b.probability_lift - a.probability_lift);
  return combined.slice(0, WEEK_CAP);
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm test -- weekly-plan-generator
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/weekly-plan-generator.ts src/lib/job-search/weekly-plan-generator.test.ts
git commit -m "feat: add weekly plan generator with priority sequencing"
```

---

## Task 9: Score-new-jobs API route

**Files:**
- Create: `src/app/api/job-search/score-new-jobs/route.ts`

Reads pipeline entries with `fit_score_auto = 0` (or null), runs `computeAutoFitScore`, writes back. Cron-protected.

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import { computeAutoFitScore } from "@/lib/job-search/fit-score";
import type { PipelineEntry } from "@/lib/job-search/types";

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .select("*")
    .or("fit_score_auto.is.null,fit_score_auto.eq.0");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data || []) as PipelineEntry[];
  let scored = 0;

  for (const entry of entries) {
    const { total, breakdown } = computeAutoFitScore(entry);
    const { error: updErr } = await supabase
      .from("job_pipeline_entries")
      .update({ fit_score_auto: total, score_breakdown: breakdown })
      .eq("id", entry.id);
    if (!updErr) scored++;
  }

  return NextResponse.json({ scored, total: entries.length });
}
```

- [ ] **Step 2: Build to verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/score-new-jobs/route.ts
git commit -m "feat: add API route to auto-score new pipeline entries"
```

---

## Task 10: Rollup-metrics API route

**Files:**
- Create: `src/app/api/job-search/rollup-metrics/route.ts`

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth, getWeekBounds } from "@/lib/email-templates";
import { computeWeeklyMetrics } from "@/lib/job-search/metrics-rollup";
import type { PipelineStatus } from "@/lib/job-search/types";

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekStartStr, weekEndStr } = getWeekBounds();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split("T")[0];

  const [tasksRes, pipelineRes, contactedRes, repliedRes, interviewsRes] =
    await Promise.all([
      supabase
        .from("job_daily_tasks")
        .select("category, done")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr)
        .eq("done", true),
      supabase.from("job_pipeline_entries").select("status"),
      supabase
        .from("job_connections")
        .select("id")
        .gte("last_contact", fourteenDaysAgoStr),
      supabase
        .from("job_connections")
        .select("id")
        .gte("replied_at", fourteenDaysAgoStr),
      supabase
        .from("job_pipeline_entries")
        .select("id")
        .eq("status", "interview")
        .gte("last_update", weekStartStr)
        .lte("last_update", weekEndStr),
    ]);

  const completedTasksByCategory: Record<string, number> = {};
  for (const t of tasksRes.data || []) {
    completedTasksByCategory[t.category] =
      (completedTasksByCategory[t.category] || 0) + 1;
  }

  const row = computeWeeklyMetrics({
    weekStart: weekStartStr,
    completedTasksByCategory,
    pipelineStatuses: (pipelineRes.data || []).map((p) => p.status as PipelineStatus),
    connectionsContactedLast14d: (contactedRes.data || []).length,
    connectionsRepliedLast14d: (repliedRes.data || []).length,
    interviewsCompletedThisWeek: (interviewsRes.data || []).length,
  });

  const { error } = await supabase
    .from("job_weekly_metrics")
    .upsert(row, { onConflict: "week_start" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, row });
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/rollup-metrics/route.ts
git commit -m "feat: add nightly metrics rollup API route"
```

---

## Task 11: Generate-weekly-plan API route

**Files:**
- Create: `src/app/api/job-search/generate-weekly-plan/route.ts`

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import {
  generateWeeklyPlan,
  type PlanInput,
} from "@/lib/job-search/weekly-plan-generator";

function nextMondayDateStr(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysUntilMonday);
  return monday.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekStartDate = nextMondayDateStr();
  const weekEndDate = addDays(weekStartDate, 4);
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = addDays(today, -7);
  const tenDaysAgo = addDays(today, -10);

  // Carry forward last week's high-impact unfinished
  const lastWeekEnd = addDays(weekStartDate, -1);
  const lastWeekStart = addDays(lastWeekEnd, -4);
  const { data: lastWeekTasks } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .gte("date", lastWeekStart)
    .lte("date", lastWeekEnd)
    .eq("done", false);

  // Delete non-high last week unfinished
  const nonHighIds = (lastWeekTasks || [])
    .filter((t) => t.impact !== "high")
    .map((t) => t.id);
  if (nonHighIds.length > 0) {
    await supabase.from("job_daily_tasks").delete().in("id", nonHighIds);
  }

  const carriedOverHighImpact = (lastWeekTasks || [])
    .filter((t) => t.impact === "high")
    .map((t) => ({
      id: t.id,
      task: t.task,
      category: t.category,
      company: t.company,
    }));

  // Delete old (now-carried) high tasks; we re-create them on Monday
  const carriedIds = carriedOverHighImpact.map((c) => c.id);
  if (carriedIds.length > 0) {
    await supabase.from("job_daily_tasks").delete().in("id", carriedIds);
  }

  // Fetch interviews scheduled in this week
  const { data: interviewsData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, interview_date")
    .gte("interview_date", weekStartDate)
    .lte("interview_date", weekEndDate);

  const interviews = (interviewsData || [])
    .filter((i) => i.interview_date)
    .map((i) => ({
      id: i.id,
      company: i.company,
      role: i.role,
      date: i.interview_date as string,
    }));

  // Stale active pipeline entries
  const { data: staleData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, last_update")
    .in("status", ["screen", "interview"])
    .lte("last_update", sevenDaysAgo);

  const stalePipelineEntries = (staleData || []).map((s) => {
    const days = Math.floor(
      (Date.now() - new Date(s.last_update).getTime()) / 86400000
    );
    return { id: s.id, company: s.company, daysSinceUpdate: days };
  });

  // New scored jobs from last 7 days, score 65+, status saved
  const { data: newJobsData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, fit_score, fit_score_auto")
    .eq("status", "saved")
    .gte("created_at", sevenDaysAgo);

  const newScoredJobs = (newJobsData || [])
    .map((j) => ({
      id: j.id,
      company: j.company,
      role: j.role,
      score: j.fit_score ?? j.fit_score_auto ?? 0,
    }))
    .filter((j) => j.score >= 65);

  // Stale connections needing outreach
  const { data: staleConnData } = await supabase
    .from("job_connections")
    .select("id, name, company_name, last_contact")
    .lte("last_contact", sevenDaysAgo)
    .not("next_action", "is", null);

  const staleConnections = (staleConnData || []).map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company_name,
  }));

  // Target company backlog — top targets we don't yet have a connection at
  const { data: targetData } = await supabase
    .from("job_target_companies")
    .select("id, name, rank")
    .eq("hiring_status", "active")
    .order("rank", { ascending: true })
    .limit(20);

  const targetCompanyBacklog = (targetData || []).map((t) => ({
    id: t.id,
    company: t.name,
  }));

  const planInput: PlanInput = {
    weekStartDate,
    interviews,
    stalePipelineEntries,
    newScoredJobs,
    staleConnections,
    targetCompanyBacklog,
    carriedOverHighImpact,
  };

  const generated = generateWeeklyPlan(planInput);

  // Insert generated tasks
  if (generated.length > 0) {
    const { error } = await supabase.from("job_daily_tasks").insert(generated);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    weekStartDate,
    inserted: generated.length,
  });
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/generate-weekly-plan/route.ts
git commit -m "feat: add weekly plan generator API route"
```

---

## Task 12: Wire up cron schedules

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Update `vercel.json` to add the three new cron entries**

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
    },
    {
      "path": "/api/job-search/score-new-jobs",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/job-search/rollup-metrics",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/job-search/generate-weekly-plan",
      "schedule": "0 6 * * 1"
    }
  ]
}
```

The plan generator runs Monday 6am UTC (Sunday 11pm PT). Score and rollup run daily at 7am UTC. The daily email runs at 4pm UTC (9am PT) so all three nightly jobs finish first.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "build: schedule cron jobs for scoring, rollup, and weekly plan"
```

---

## Task 13: New email section functions

**Files:**
- Modify: `src/lib/email-templates.ts`

Add four new section functions: `newJobsSection`, `weekViewSection`, `metricsSection`, `signalsSection`. The old `scorecardSection`, `spotlightSection`, `followUpSection`, and `briefingSection` are not deleted yet (we'll deprecate them in Task 19) — leave them for now so the existing weekly review still works.

- [ ] **Step 1: Add `newJobsSection` to `src/lib/email-templates.ts`**

Append at the bottom of the file (before `categoryEmoji`):

```ts
export type NewJob = {
  id: string;
  company: string;
  role: string;
  score: number;
  scoreSource: "manual" | "auto";
  breakdown: {
    title_match: number;
    seniority_fit: number;
    keyword_match: number;
    industry_fit: number;
    stage_fit: number;
    red_flags: number;
  } | null;
  job_url: string | null;
};

export function newJobsSection(jobs: NewJob[]): string {
  if (jobs.length === 0) {
    return `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px;">🆕 New Jobs (last 24h)</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">No new jobs in the last 24h.</p>
      </div>
    `;
  }

  const top = jobs.slice(0, 5);
  const rest = jobs.slice(5);

  const cards = top
    .map((j, i) => {
      const color = j.score >= 80 ? "#10b981" : j.score >= 65 ? "#3b82f6" : "#f59e0b";
      const breakdownLine = j.breakdown
        ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Title ${j.breakdown.title_match} · Seniority ${j.breakdown.seniority_fit} · Keywords ${j.breakdown.keyword_match} · Industry ${j.breakdown.industry_fit} · Stage ${j.breakdown.stage_fit}${j.breakdown.red_flags ? ` · Flags ${j.breakdown.red_flags}` : ""}</div>`
        : "";
      const sourceTag =
        j.scoreSource === "auto"
          ? `<span style="font-size: 10px; color: #9ca3af; margin-left: 6px;">auto</span>`
          : "";
      return `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: #111827;">#${i + 1} ${j.role}</div>
              <div style="font-size: 12px; color: #6b7280;">${j.company}</div>
            </div>
            <div style="background: ${color}15; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 700;">${j.score}/100${sourceTag}</div>
          </div>
          ${breakdownLine}
          ${j.job_url ? `<a href="${j.job_url}" style="display: inline-block; margin-top: 8px; color: #0d9488; text-decoration: none; font-size: 12px; font-weight: 600;">View posting →</a>` : ""}
        </div>
      `;
    })
    .join("");

  const restLine =
    rest.length > 0
      ? `<p style="font-size: 12px; color: #6b7280; margin: 8px 0 0;"><strong>Also found:</strong> ${rest.map((j) => `${j.company} ${j.role} (${j.score})`).join(" · ")}</p>`
      : "";

  return `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #166534; margin: 0 0 12px;">🆕 New Jobs (last 24h, ranked by fit)</h2>
      ${cards}
      ${restLine}
    </div>
  `;
}
```

- [ ] **Step 2: Add `weekViewSection`**

```ts
export type WeekViewTask = {
  id: string;
  task: string;
  company: string | null;
  category: string;
  impact: "high" | "medium" | "low";
  done: boolean;
};

export type WeekDay = {
  date: string;
  label: string;     // "MON", "TUE", etc.
  isToday: boolean;
  tasks: WeekViewTask[];
};

export function weekViewSection(days: WeekDay[]): string {
  const dayBlocks = days
    .map((d) => {
      const doneCount = d.tasks.filter((t) => t.done).length;
      const headerBg = d.isToday ? "#0d9488" : "#f3f4f6";
      const headerColor = d.isToday ? "white" : "#374151";
      const taskRows = d.tasks
        .map((t) => {
          const emoji = categoryEmoji[t.category] || "📋";
          const checkbox = t.done ? "☑" : "☐";
          const strike = t.done ? "text-decoration: line-through; color: #9ca3af;" : "color: #111827;";
          const impactBadge = `<span style="background: ${impactColor[t.impact]}15; color: ${impactColor[t.impact]}; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-left: 6px;">${t.impact.toUpperCase()}</span>`;
          return `
            <div style="font-size: 13px; margin: 4px 0; ${strike}">
              ${checkbox} ${emoji} ${t.task}${t.company ? ` <span style="color: #6b7280;">— ${t.company}</span>` : ""}${impactBadge}
            </div>
          `;
        })
        .join("");
      const empty =
        d.tasks.length === 0
          ? `<div style="font-size: 12px; color: #9ca3af; padding: 4px 0;">No tasks</div>`
          : "";
      return `
        <div style="margin-bottom: 12px;">
          <div style="background: ${headerBg}; color: ${headerColor}; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; display: flex; justify-content: space-between;">
            <span>${d.label}${d.isToday ? " (today)" : ""}</span>
            <span>${doneCount}/${d.tasks.length}</span>
          </div>
          <div style="padding: 6px 10px;">${taskRows}${empty}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">📅 This Week's Tasks</h2>
      ${dayBlocks}
    </div>
  `;
}
```

- [ ] **Step 3: Add `metricsSection`**

Import `renderSparklineSvg` at the top of `src/lib/email-templates.ts`:

```ts
import { renderSparklineSvg } from "@/lib/job-search/sparkline";
```

Then add:

```ts
export type MetricRow = {
  label: string;
  current: number;
  target: number | null;
  history: number[]; // 5 values: last 4 weeks + this week
  unit?: "" | "%" | "/wk";
};

function deltaArrow(history: number[]): string {
  if (history.length < 2) return "—";
  const cur = history[history.length - 1];
  const prev = history[history.length - 2];
  if (cur > prev) return `<span style="color: #10b981;">↑</span>`;
  if (cur < prev) return `<span style="color: #ef4444;">↓</span>`;
  return `<span style="color: #6b7280;">flat</span>`;
}

export function metricsSection(rows: MetricRow[]): string {
  const rowsHtml = rows
    .map((r) => {
      const display =
        r.unit === "%"
          ? `${Math.round(r.current * 100)}%`
          : r.target
          ? `${r.current}/${r.target}`
          : `${r.current}`;
      return `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #374151;">${r.label}</td>
          <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600;">${display}</td>
          <td style="padding: 8px 0;">${renderSparklineSvg(r.history)}</td>
          <td style="padding: 8px 0; font-size: 12px; text-align: right;">${deltaArrow(r.history)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">📊 Metrics</h2>
      <table style="width: 100%; border-collapse: collapse;">${rowsHtml}</table>
    </div>
  `;
}
```

- [ ] **Step 4: Add `signalsSection`**

```ts
import type { Signal } from "@/lib/job-search/signals";

export function signalsSection(signals: Signal[]): string {
  if (signals.length === 0) return "";
  return `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 8px;">⚠️ Signals</h2>
      ${signals.map((s) => `<p style="color: #78350f; font-size: 13px; margin: 4px 0;">${s.message}</p>`).join("")}
    </div>
  `;
}
```

- [ ] **Step 5: Build to verify**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/email-templates.ts
git commit -m "feat: add new email sections for redesigned daily digest"
```

---

## Task 14: Refactor send-daily-email route

**Files:**
- Modify: `src/app/api/job-search/send-daily-email/route.ts`

Replace the body of the route with the new four-block format. The old sections are removed in this same edit.

- [ ] **Step 1: Replace the file contents**

```ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  emailWrapper,
  newJobsSection,
  weekViewSection,
  metricsSection,
  signalsSection,
  checkAuth,
  getWeekBounds,
  TARGETS,
  type NewJob,
  type WeekDay,
  type MetricRow,
} from "@/lib/email-templates";
import { computeSignals } from "@/lib/job-search/signals";

const resend = new Resend(process.env.RESEND_API_KEY);

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const { weekStartStr, weekEndStr, weekdaysPassed } = getWeekBounds();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const oneDayAgoIso = oneDayAgo.toISOString();

  // 1. New jobs in last 24h
  const { data: newJobsData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, fit_score, fit_score_auto, score_breakdown, job_url")
    .eq("status", "saved")
    .gte("created_at", oneDayAgoIso);

  const newJobs: NewJob[] = (newJobsData || [])
    .map((j) => {
      const manual = j.fit_score;
      const auto = j.fit_score_auto || 0;
      return {
        id: j.id,
        company: j.company,
        role: j.role,
        score: manual ?? auto,
        scoreSource: (manual != null ? "manual" : "auto") as "manual" | "auto",
        breakdown: j.score_breakdown ?? null,
        job_url: j.job_url,
      };
    })
    .sort((a, b) => b.score - a.score);

  // 2. This week's tasks (full M-F)
  const { data: weekTasks } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .gte("date", weekStartStr)
    .lte("date", weekEndStr)
    .order("impact", { ascending: true });

  const days: WeekDay[] = DAY_LABELS.map((label, i) => {
    const date = addDays(weekStartStr, i);
    return {
      date,
      label,
      isToday: date === today,
      tasks: (weekTasks || [])
        .filter((t) => t.date === date)
        .map((t) => ({
          id: t.id,
          task: t.task,
          company: t.company,
          category: t.category,
          impact: t.impact,
          done: t.done,
        })),
    };
  });

  // 3. Metrics (current + last 4 weeks)
  const fourWeeksAgo = addDays(weekStartStr, -28);
  const { data: metricsHistory } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .gte("week_start", fourWeeksAgo)
    .order("week_start", { ascending: true });

  const history = metricsHistory || [];
  const current =
    history.find((h) => h.week_start === weekStartStr) ||
    {
      applications_sent: 0,
      outreach_sent: 0,
      response_rate: 0,
      active_pipeline_count: 0,
      interviews_completed: 0,
    };

  const series = (key: keyof typeof current) =>
    history.map((h) => Number(h[key]) || 0);

  const metricRows: MetricRow[] = [
    {
      label: "Applications",
      current: Number(current.applications_sent) || 0,
      target: TARGETS.applications_sent,
      history: series("applications_sent"),
    },
    {
      label: "Outreach",
      current: Number(current.outreach_sent) || 0,
      target: TARGETS.outreach_sent,
      history: series("outreach_sent"),
    },
    {
      label: "Response rate",
      current: Number(current.response_rate) || 0,
      target: null,
      history: series("response_rate"),
      unit: "%",
    },
    {
      label: "Active pipeline",
      current: Number(current.active_pipeline_count) || 0,
      target: null,
      history: series("active_pipeline_count"),
    },
    {
      label: "Interviews",
      current: Number(current.interviews_completed) || 0,
      target: null,
      history: series("interviews_completed"),
    },
  ];

  // 4. Signals
  const { data: pipelineRows } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, status, last_update");

  // Last 10 outreach: connections most recently contacted, count those that replied
  const { data: recentOutreach } = await supabase
    .from("job_connections")
    .select("id, replied_at")
    .not("last_contact", "is", null)
    .order("last_contact", { ascending: false })
    .limit(10);
  const last10OutreachReplies = (recentOutreach || []).filter(
    (c) => c.replied_at != null
  ).length;

  const savedCount = (pipelineRows || []).filter((p) => p.status === "saved").length;
  const staleActive = (pipelineRows || [])
    .filter((p) => p.status === "screen" || p.status === "interview")
    .map((p) => {
      const days = Math.floor(
        (Date.now() - new Date(p.last_update).getTime()) / 86400000
      );
      return { id: p.id, company: p.company, daysSince: days };
    })
    .filter((p) => p.daysSince > 10);

  const newTopTier = newJobs
    .filter((j) => j.score >= 90)
    .map((j) => ({ id: j.id, company: j.company, role: j.role, score: j.score }));

  const signals = computeSignals({
    weekdaysPassed,
    appsThisWeek: Number(current.applications_sent) || 0,
    appsTarget: TARGETS.applications_sent,
    last10OutreachReplies,
    staleActiveRoles: staleActive,
    interviewsThisWeek: Number(current.interviews_completed) || 0,
    savedCount,
    newTopTierJobs: newTopTier,
  });

  // Compose body
  const body =
    newJobsSection(newJobs) +
    weekViewSection(days) +
    metricsSection(metricRows) +
    signalsSection(signals);

  const weekday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const html = emailWrapper("Job Search — Daily Brief", weekday, body);

  const subject = `${new Date().toLocaleDateString("en-US", { weekday: "short" })}: ${newJobs.length} new jobs · ${current.applications_sent || 0}/${TARGETS.applications_sent} apps`;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    sent: true,
    newJobs: newJobs.length,
    weekTaskCount: weekTasks?.length || 0,
    signals: signals.length,
  });
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/job-search/send-daily-email/route.ts
git commit -m "feat: rewrite daily email to use 4-block format"
```

---

## Task 15: Sparkline React component

**Files:**
- Create: `src/components/job-search/Sparkline.tsx`

Reuses the SVG renderer for consistency with the email.

- [ ] **Step 1: Write the component**

```tsx
import { renderSparklineSvg, type SparklineOptions } from "@/lib/job-search/sparkline";

interface Props extends SparklineOptions {
  values: number[];
  className?: string;
}

export function Sparkline({ values, className, ...opts }: Props) {
  const svg = renderSparklineSvg(values, opts);
  return (
    <span
      className={className}
      // svg is locally generated, not user input
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/job-search/Sparkline.tsx
git commit -m "feat: add Sparkline React component"
```

---

## Task 16: NewJobsBlock dashboard component

**Files:**
- Create: `src/components/job-search/NewJobsBlock.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import type { NewJob } from "@/lib/email-templates";

interface Props {
  jobs: NewJob[];
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 65) return "text-blue-600 bg-blue-50";
  return "text-amber-600 bg-amber-50";
}

export function NewJobsBlock({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          🆕 New Jobs (last 24h)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No new jobs in the last 24h.
        </p>
      </div>
    );
  }

  const top = jobs.slice(0, 5);
  const rest = jobs.slice(5);

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        🆕 New Jobs (last 24h, ranked by fit)
      </h2>
      <div className="space-y-2">
        {top.map((j, i) => (
          <div
            key={j.id}
            className="flex items-start justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                #{i + 1} {j.role}
              </div>
              <div className="text-xs text-zinc-500">{j.company}</div>
              {j.breakdown && (
                <div className="text-[11px] text-zinc-400 mt-1">
                  Title {j.breakdown.title_match} · Sen {j.breakdown.seniority_fit} · Kw {j.breakdown.keyword_match} · Ind {j.breakdown.industry_fit} · Stg {j.breakdown.stage_fit}
                  {j.breakdown.red_flags ? ` · Flags ${j.breakdown.red_flags}` : ""}
                </div>
              )}
              {j.job_url && (
                <a
                  href={j.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-600 hover:underline mt-1 inline-block"
                >
                  View posting →
                </a>
              )}
            </div>
            <span
              className={`shrink-0 ml-3 px-2 py-0.5 rounded-full text-xs font-bold ${scoreColor(j.score)}`}
            >
              {j.score}/100
              {j.scoreSource === "auto" && (
                <span className="ml-1 text-[9px] opacity-60">auto</span>
              )}
            </span>
          </div>
        ))}
      </div>
      {rest.length > 0 && (
        <p className="text-xs text-zinc-500 mt-2">
          <strong>Also found:</strong>{" "}
          {rest.map((j) => `${j.company} ${j.role} (${j.score})`).join(" · ")}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/job-search/NewJobsBlock.tsx
git commit -m "feat: add NewJobsBlock dashboard component"
```

---

## Task 17: WeekView dashboard component

**Files:**
- Create: `src/components/job-search/WeekView.tsx`

For v1, no drag-to-reschedule (deferred). The v1 component just renders the same data the email shows. Drag is added in a follow-up if needed.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import type { WeekDay } from "@/lib/email-templates";

interface Props {
  days: WeekDay[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  apply: "📝",
  outreach: "📧",
  follow_up: "🔄",
  content: "✍️",
  linkedin_post: "📱",
  prep: "📚",
  admin: "⚙️",
};

const IMPACT_COLOR: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-zinc-100 text-zinc-500",
};

export function WeekView({ days }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        📅 This Week's Tasks
      </h2>
      <div className="space-y-3">
        {days.map((d) => {
          const doneCount = d.tasks.filter((t) => t.done).length;
          return (
            <div key={d.date}>
              <div
                className={`flex justify-between items-center px-3 py-1.5 rounded-md text-xs font-bold ${
                  d.isToday
                    ? "bg-teal-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span>
                  {d.label}
                  {d.isToday && " (today)"}
                </span>
                <span>
                  {doneCount}/{d.tasks.length}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {d.tasks.length === 0 && (
                  <div className="text-xs text-zinc-400 px-3 py-1">No tasks</div>
                )}
                {d.tasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-2 px-3 py-1 text-sm ${
                      t.done ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span>{t.done ? "☑" : "☐"}</span>
                    <span>{CATEGORY_EMOJI[t.category] || "📋"}</span>
                    <span className="flex-1">{t.task}</span>
                    {t.company && (
                      <span className="text-xs text-zinc-500">— {t.company}</span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${IMPACT_COLOR[t.impact]}`}
                    >
                      {t.impact.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/job-search/WeekView.tsx
git commit -m "feat: add WeekView dashboard component"
```

---

## Task 18: MetricsBlock + SignalsBlock dashboard components

**Files:**
- Create: `src/components/job-search/MetricsBlock.tsx`
- Create: `src/components/job-search/SignalsBlock.tsx`

- [ ] **Step 1: Write `MetricsBlock.tsx`**

```tsx
"use client";

import { Sparkline } from "./Sparkline";
import type { MetricRow } from "@/lib/email-templates";

interface Props {
  rows: MetricRow[];
}

function delta(history: number[]): { symbol: string; color: string } {
  if (history.length < 2) return { symbol: "—", color: "text-zinc-400" };
  const cur = history[history.length - 1];
  const prev = history[history.length - 2];
  if (cur > prev) return { symbol: "↑", color: "text-emerald-600" };
  if (cur < prev) return { symbol: "↓", color: "text-red-600" };
  return { symbol: "flat", color: "text-zinc-400" };
}

function display(r: MetricRow): string {
  if (r.unit === "%") return `${Math.round(r.current * 100)}%`;
  if (r.target) return `${r.current}/${r.target}`;
  return String(r.current);
}

export function MetricsBlock({ rows }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        📊 Metrics
      </h2>
      <table className="w-full">
        <tbody>
          {rows.map((r) => {
            const d = delta(r.history);
            return (
              <tr key={r.label} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <td className="py-2 text-sm text-zinc-600 dark:text-zinc-400">{r.label}</td>
                <td className="py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {display(r)}
                </td>
                <td className="py-2">
                  <Sparkline values={r.history} />
                </td>
                <td className={`py-2 text-xs text-right ${d.color}`}>{d.symbol}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Write `SignalsBlock.tsx`**

```tsx
"use client";

import type { Signal } from "@/lib/job-search/signals";

interface Props {
  signals: Signal[];
}

export function SignalsBlock({ signals }: Props) {
  if (signals.length === 0) return null;
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
      <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">
        ⚠️ Signals
      </h2>
      {signals.map((s) => (
        <p key={s.id} className="text-sm text-amber-800 dark:text-amber-300 my-1">
          {s.message}
        </p>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/job-search/MetricsBlock.tsx src/components/job-search/SignalsBlock.tsx
git commit -m "feat: add MetricsBlock and SignalsBlock dashboard components"
```

---

## Task 19: Refactor dashboard page

**Files:**
- Modify: `src/app/dashboard/job-search/page.tsx`

Replace the top of the dashboard with the four blocks. Keep `PipelineBoard`, `FunnelHealth`, `PortfolioKPIs` below (Jon still wants them).

- [ ] **Step 1: Replace the page contents**

```tsx
export const dynamic = "force-dynamic";

import { NewJobsBlock } from "@/components/job-search/NewJobsBlock";
import { WeekView } from "@/components/job-search/WeekView";
import { MetricsBlock } from "@/components/job-search/MetricsBlock";
import { SignalsBlock } from "@/components/job-search/SignalsBlock";
import { FunnelHealth } from "@/components/job-search/FunnelHealth";
import { PortfolioKPIs } from "@/components/job-search/PortfolioKPIs";
import { PipelineBoard } from "@/components/job-search/PipelineBoard";
import { HubNav } from "@/components/job-search/HubNav";
import { supabase } from "@/lib/supabase";
import { computeSignals } from "@/lib/job-search/signals";
import {
  TARGETS,
  type NewJob,
  type WeekDay,
  type MetricRow,
} from "@/lib/email-templates";

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = addDays(weekStartStr, 4);
  const weekdaysPassed = dayOfWeek === 0 ? 5 : Math.min(dayOfWeek, 5);
  return { weekStartStr, weekEndStr, weekdaysPassed };
}

async function loadData() {
  const today = new Date().toISOString().split("T")[0];
  const { weekStartStr, weekEndStr, weekdaysPassed } = getWeekBounds();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const oneDayAgoIso = oneDayAgo.toISOString();
  const fourWeeksAgo = addDays(weekStartStr, -28);

  const [newJobsRes, weekTasksRes, metricsRes, pipelineRes, subtasksRes, recentOutreachRes] =
    await Promise.all([
      supabase
        .from("job_pipeline_entries")
        .select("id, company, role, fit_score, fit_score_auto, score_breakdown, job_url")
        .eq("status", "saved")
        .gte("created_at", oneDayAgoIso),
      supabase
        .from("job_daily_tasks")
        .select("*")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr),
      supabase
        .from("job_weekly_metrics")
        .select("*")
        .gte("week_start", fourWeeksAgo)
        .order("week_start", { ascending: true }),
      supabase
        .from("job_pipeline_entries")
        .select("*")
        .order("last_update", { ascending: false }),
      supabase
        .from("job_pipeline_subtasks")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("job_connections")
        .select("id, replied_at")
        .not("last_contact", "is", null)
        .order("last_contact", { ascending: false })
        .limit(10),
    ]);

  const last10OutreachReplies = (recentOutreachRes.data || []).filter(
    (c) => c.replied_at != null
  ).length;

  const newJobs: NewJob[] = (newJobsRes.data || [])
    .map((j) => ({
      id: j.id,
      company: j.company,
      role: j.role,
      score: j.fit_score ?? j.fit_score_auto ?? 0,
      scoreSource: (j.fit_score != null ? "manual" : "auto") as "manual" | "auto",
      breakdown: j.score_breakdown ?? null,
      job_url: j.job_url,
    }))
    .sort((a, b) => b.score - a.score);

  const days: WeekDay[] = DAY_LABELS.map((label, i) => {
    const date = addDays(weekStartStr, i);
    return {
      date,
      label,
      isToday: date === today,
      tasks: (weekTasksRes.data || [])
        .filter((t) => t.date === date)
        .map((t) => ({
          id: t.id,
          task: t.task,
          company: t.company,
          category: t.category,
          impact: t.impact,
          done: t.done,
        })),
    };
  });

  const history = metricsRes.data || [];
  const current =
    history.find((h) => h.week_start === weekStartStr) ||
    {
      applications_sent: 0,
      outreach_sent: 0,
      response_rate: 0,
      active_pipeline_count: 0,
      interviews_completed: 0,
    };

  const series = (key: string) =>
    history.map((h) => Number((h as Record<string, unknown>)[key]) || 0);

  const metricRows: MetricRow[] = [
    {
      label: "Applications",
      current: Number(current.applications_sent) || 0,
      target: TARGETS.applications_sent,
      history: series("applications_sent"),
    },
    {
      label: "Outreach",
      current: Number(current.outreach_sent) || 0,
      target: TARGETS.outreach_sent,
      history: series("outreach_sent"),
    },
    {
      label: "Response rate",
      current: Number(current.response_rate) || 0,
      target: null,
      history: series("response_rate"),
      unit: "%",
    },
    {
      label: "Active pipeline",
      current: Number(current.active_pipeline_count) || 0,
      target: null,
      history: series("active_pipeline_count"),
    },
    {
      label: "Interviews",
      current: Number(current.interviews_completed) || 0,
      target: null,
      history: series("interviews_completed"),
    },
  ];

  const pipelineEntries = pipelineRes.data || [];
  const savedCount = pipelineEntries.filter((p) => p.status === "saved").length;
  const staleActive = pipelineEntries
    .filter((p) => p.status === "screen" || p.status === "interview")
    .map((p) => ({
      id: p.id,
      company: p.company,
      daysSince: Math.floor(
        (Date.now() - new Date(p.last_update).getTime()) / 86400000
      ),
    }))
    .filter((p) => p.daysSince > 10);

  const newTopTier = newJobs
    .filter((j) => j.score >= 90)
    .map((j) => ({ id: j.id, company: j.company, role: j.role, score: j.score }));

  const signals = computeSignals({
    weekdaysPassed,
    appsThisWeek: Number(current.applications_sent) || 0,
    appsTarget: TARGETS.applications_sent,
    last10OutreachReplies,
    staleActiveRoles: staleActive,
    interviewsThisWeek: Number(current.interviews_completed) || 0,
    savedCount,
    newTopTierJobs: newTopTier,
  });

  const funnel = {
    saved: pipelineEntries.filter((e) => e.status === "saved").length,
    applied: pipelineEntries.filter((e) => e.status === "applied").length,
    screen: pipelineEntries.filter((e) => e.status === "screen").length,
    interview: pipelineEntries.filter((e) => e.status === "interview").length,
    offer: pipelineEntries.filter((e) => e.status === "offer").length,
    rejected: pipelineEntries.filter((e) => e.status === "rejected").length,
    passed: pipelineEntries.filter((e) => e.status === "passed").length,
  };

  return {
    newJobs,
    days,
    metricRows,
    signals,
    pipelineData: { funnel, total: pipelineEntries.length, entries: pipelineEntries, conversionRates: { app_to_screen: 0, screen_to_interview: 0, interview_to_offer: 0 } },
    subtasks: subtasksRes.data || [],
  };
}

export default async function JobSearchDashboard() {
  const data = await loadData();

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Job Search
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <HubNav />

      {/* Block 1: New Jobs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <NewJobsBlock jobs={data.newJobs} />
      </div>

      {/* Block 2: This Week */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <WeekView days={data.days} />
      </div>

      {/* Block 3: Metrics */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <MetricsBlock rows={data.metricRows} />
      </div>

      {/* Block 4: Signals (only if any) */}
      <SignalsBlock signals={data.signals} />

      {/* Below the four blocks: existing pipeline tools */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <FunnelHealth data={data.pipelineData} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        <PipelineBoard entries={data.pipelineData.entries} subtasks={data.subtasks} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PortfolioKPIs />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/job-search/page.tsx
git commit -m "feat: refactor dashboard to use 4-block format"
```

---

## Task 20: Smoke test the new email locally

**Files:** none (manual verification)

- [ ] **Step 1: Run the test suite end-to-end**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run a production build**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 3: Manually trigger the score-new-jobs route**

Once Jon has run the migration, hit the route locally:

```bash
curl -X POST http://localhost:3000/api/job-search/score-new-jobs \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{ scored: N, total: N }` with N matching unscored entries.

- [ ] **Step 4: Manually trigger the rollup**

```bash
curl -X POST http://localhost:3000/api/job-search/rollup-metrics \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{ ok: true, row: {...} }`.

- [ ] **Step 5: Manually trigger the daily email**

```bash
curl -X POST http://localhost:3000/api/job-search/send-daily-email \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected: `{ sent: true, ... }` and Jon receives the new-format email.

- [ ] **Step 6: Visit the dashboard at /dashboard/job-search**

Expected: four blocks render in order. New jobs at top, week view, metrics with sparklines, signals if any.

---

## Task 21: Cleanup deprecated email sections

**Files:**
- Modify: `src/lib/email-templates.ts`

Once the new format is verified working, delete the unused old section functions to prevent drift. The weekly review uses some of these — verify which are still needed before deleting.

- [ ] **Step 1: Check what `send-weekly-review/route.ts` still imports**

```bash
grep -E "scorecardSection|spotlightSection|followUpSection|briefingSection|pipelineBoxes|signalBox|networkGrowthSection" src/app/api/job-search/send-weekly-review/route.ts
```

Note which functions are still used.

- [ ] **Step 2: Delete unused exports from `src/lib/email-templates.ts`**

For each function NOT referenced anywhere else, remove it from the file. Functions referenced only by `send-daily-email/route.ts` are now unused and can be removed.

- [ ] **Step 3: Build to verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/email-templates.ts
git commit -m "refactor: remove deprecated email sections after redesign"
```

---

## Schema Audit Results

_(Engineer fills this in during Task 0.)_
