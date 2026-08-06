# Job Search OS Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the job-search crons observable, and stop roles Jon would never accept from entering the funnel.

**Architecture:** Two independent pure-logic modules plus one migration each. `run-log.ts` wraps every cron in a database-backed execution record and derives health from it; `gates.ts` decides pass/reject on location and ethics before a role is stored. Both are plain functions over plain data, so the whole surface is unit-testable without network or database.

**Tech Stack:** TypeScript, Next.js 16 App Router, Supabase (`@supabase/supabase-js`), Vitest, Resend.

**Spec:** `docs/superpowers/specs/2026-08-06-fit-gates-and-apply-pipeline-design.md` (build steps 1–2).

## Global Constraints

- Tests are Vitest, colocated as `src/**/*.test.ts`. Run with `npm test`.
- Import alias `@` maps to `./src`.
- Pure logic lives in `src/lib/job-search/`; route handlers stay thin and call into it.
- Migrations are `supabase/migrations/YYYYMMDDNNNNNN_name.sql`, applied via the `mcp__supabase__apply_migration` tool against the shared `red-ox-mobile` project. Every job-search table is prefixed `job_`.
- Auth on every cron route uses the existing `checkAuth(request)` from `@/lib/email-templates`. Do not invent a new auth path.
- `fit_score_auto` and `computeAutoFitScore` are **not** modified by this plan.
- No `temperature` or `budget_tokens` anywhere — this plan makes no LLM calls at all.
- Dates: use `localDateStr` from `@/lib/job-search/dates` for date strings; store timestamps as ISO strings.
- **No tested module may import `@/lib/supabase`.** That module calls
  `createClient` at import time and throws `supabaseUrl is required` when the
  env vars are unset, which they are under Vitest. Verified by probe: a test
  importing it fails before a single assertion runs. So each pure module has a
  `-db.ts` sibling holding every Supabase call — `run-log.ts` / `run-log-db.ts`,
  `gates.ts` / `gates-db.ts`. Tests import only the pure side. This matches the
  codebase as it already stands: no module under `src/lib/job-search/` imports
  the client today.

---

### Task 1: `job_cron_runs` table and the run-log module

**Files:**
- Create: `supabase/migrations/20260806000001_job_cron_runs.sql`
- Create: `src/lib/job-search/run-log.ts`
- Test: `src/lib/job-search/run-log.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `RunStatus`, `CronRun`, `RunCounts`, `JOB_STALE_HOURS`, `HealthIssue`, `findHealthIssues(rows: JobLastRun[], now: Date): HealthIssue[]`, `JobLastRun`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260806000001_job_cron_runs.sql`:

```sql
-- Execution log for every job-search cron and the local apply agent.
--
-- Nothing currently records whether any of the seven crons ran. A silent
-- failure and a quiet week are indistinguishable from the inbox, which is
-- fatal for a system whose whole promise is running unattended.
--
-- One row per execution. Opened on entry, closed on exit, including on error.

CREATE TABLE IF NOT EXISTS job_cron_runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name    text NOT NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status      text NOT NULL DEFAULT 'running'
                CHECK (status IN ('running', 'ok', 'error')),
  counts      jsonb,
  error       text
);

-- The health query is always "latest run for this job", so order matters.
CREATE INDEX IF NOT EXISTS job_cron_runs_recent
  ON job_cron_runs (job_name, started_at DESC);

-- The stall query filters to successful runs specifically: a cron that has
-- errored every hour for two days is stalled, not healthy.
CREATE INDEX IF NOT EXISTS job_cron_runs_ok
  ON job_cron_runs (job_name, started_at DESC) WHERE status = 'ok';
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/job-search/run-log.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { findHealthIssues, JOB_STALE_HOURS, type JobLastRun } from "./run-log";

const NOW = new Date("2026-08-06T16:00:00Z");

function hoursAgo(h: number): string {
  return new Date(NOW.getTime() - h * 3600_000).toISOString();
}

/**
 * A fully healthy set covering every known job, with one job optionally
 * degraded. Every test needs the full set: findHealthIssues reports a
 * never_ran issue for any known job missing from the rows, so passing a
 * single row would surface eight unrelated issues.
 */
function allHealthy(degrade?: Partial<JobLastRun> & { job_name: string }): JobLastRun[] {
  const rows: JobLastRun[] = Object.keys(JOB_STALE_HOURS).map((job_name) => ({
    job_name,
    last_started_at: hoursAgo(11),
    last_ok_at: hoursAgo(11),
    last_status: "ok",
    last_error: null,
  }));
  if (!degrade) return rows;
  const i = rows.findIndex((r) => r.job_name === degrade.job_name);
  if (i === -1) return [...rows, { last_started_at: null, last_ok_at: null, last_status: null, last_error: null, ...degrade }];
  rows[i] = { ...rows[i], ...degrade };
  return rows;
}

describe("findHealthIssues", () => {
  it("reports nothing when every job ran recently and succeeded", () => {
    expect(findHealthIssues(allHealthy(), NOW)).toEqual([]);
  });

  it("flags a daily cron with no successful run inside its window", () => {
    const issues = findHealthIssues(
      allHealthy({ job_name: "ingest-jobs", last_ok_at: hoursAgo(40) }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("stalled");
    expect(issues[0].jobName).toBe("ingest-jobs");
  });

  it("flags a job whose most recent run errored", () => {
    const issues = findHealthIssues(
      allHealthy({ job_name: "ingest-jobs", last_status: "error", last_error: "board 502" }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("errored");
    expect(issues[0].detail).toContain("board 502");
  });

  it("does not report a stall and an error twice for the same job", () => {
    const issues = findHealthIssues(
      allHealthy({
        job_name: "ingest-jobs",
        last_ok_at: hoursAgo(40),
        last_status: "error",
        last_error: "boom",
      }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("errored");
  });

  it("gives the local apply agent a 48-hour window, not 36", () => {
    const at40 = allHealthy({
      job_name: "apply-batch",
      last_ok_at: hoursAgo(40),
      last_started_at: hoursAgo(40),
    });
    expect(findHealthIssues(at40, NOW)).toEqual([]);

    const at50 = allHealthy({
      job_name: "apply-batch",
      last_ok_at: hoursAgo(50),
      last_started_at: hoursAgo(50),
    });
    expect(findHealthIssues(at50, NOW)).toHaveLength(1);
  });

  it("gives weekly crons an eight-day window so Tuesday is not an alarm", () => {
    const sixDays = allHealthy({
      job_name: "generate-weekly-plan",
      last_ok_at: hoursAgo(24 * 6),
      last_started_at: hoursAgo(24 * 6),
    });
    expect(findHealthIssues(sixDays, NOW)).toEqual([]);

    const nineDays = allHealthy({
      job_name: "generate-weekly-plan",
      last_ok_at: hoursAgo(24 * 9),
      last_started_at: hoursAgo(24 * 9),
    });
    expect(findHealthIssues(nineDays, NOW)).toHaveLength(1);
  });

  it("flags a known job that has never run at all", () => {
    const issues = findHealthIssues(
      allHealthy({
        job_name: "ingest-jobs",
        last_ok_at: null,
        last_started_at: null,
        last_status: null,
      }),
      NOW,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe("never_ran");
  });

  it("flags every known job when no runs exist at all", () => {
    const issues = findHealthIssues([], NOW);
    expect(issues).toHaveLength(Object.keys(JOB_STALE_HOURS).length);
    expect(issues.every((i) => i.kind === "never_ran")).toBe(true);
    expect(issues.map((i) => i.jobName)).toContain("apply-batch");
  });

  it("ignores an unknown job name rather than inventing a threshold", () => {
    const rows = [
      ...allHealthy(),
      {
        job_name: "some-experiment",
        last_started_at: hoursAgo(500),
        last_ok_at: hoursAgo(500),
        last_status: "ok" as const,
        last_error: null,
      },
    ];
    expect(findHealthIssues(rows, NOW)).toEqual([]);
  });

  it("covers every scheduled job in JOB_STALE_HOURS", () => {
    expect(Object.keys(JOB_STALE_HOURS).sort()).toEqual([
      "apply-batch",
      "draft-applications",
      "generate-weekly-plan",
      "ingest-jobs",
      "recheck-listings",
      "rollup-metrics",
      "score-new-jobs",
      "send-daily-email",
      "send-weekly-review",
    ]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- run-log`
Expected: FAIL — `Failed to resolve import "./run-log"`.

- [ ] **Step 4: Write the implementation**

Create `src/lib/job-search/run-log.ts`:

```ts
/**
 * Execution logging and health derivation for the job-search crons.
 *
 * The failure this exists to prevent: a cron stops running, and nothing says
 * so. From Jon's inbox a broken pipeline looks exactly like a slow week, and
 * he finds out weeks later by noticing the numbers stopped moving.
 *
 * Health is derived, never stored. A stored "healthy" flag is one more thing
 * that can itself go stale; a query over run rows cannot.
 */

export type RunStatus = "running" | "ok" | "error";

export type RunCounts = Record<string, number>;

export interface CronRun {
  id: string;
  job_name: string;
  started_at: string;
  finished_at: string | null;
  status: RunStatus;
  counts: RunCounts | null;
  error: string | null;
}

/**
 * How long each job may go without a successful run before it is stalled.
 *
 * Weekly jobs get eight days rather than seven: a job that runs Monday is
 * six days old by Sunday, and a seven-day window would alarm every weekend.
 * The local agent gets 48 hours because it only runs when the Mac is awake,
 * and a single closed laptop is not a fault worth shouting about.
 */
export const JOB_STALE_HOURS: Record<string, number> = {
  "ingest-jobs": 36,
  "recheck-listings": 36,
  "score-new-jobs": 36,
  "rollup-metrics": 36,
  "draft-applications": 36,
  "send-daily-email": 36,
  "generate-weekly-plan": 24 * 8,
  "send-weekly-review": 24 * 8,
  "apply-batch": 48,
};

export interface JobLastRun {
  job_name: string;
  last_started_at: string | null;
  last_ok_at: string | null;
  last_status: RunStatus | null;
  last_error: string | null;
}

export interface HealthIssue {
  jobName: string;
  kind: "stalled" | "errored" | "never_ran";
  detail: string;
}

function hoursBetween(then: string, now: Date): number {
  return (now.getTime() - new Date(then).getTime()) / 3600_000;
}

/**
 * One issue per job, at most. A job that both errored and went stale is one
 * problem with one fix, and listing it twice makes the email look worse than
 * the system actually is — which is its own way of training someone to stop
 * reading it.
 */
export function findHealthIssues(rows: JobLastRun[], now: Date): HealthIssue[] {
  const byName = new Map(rows.map((r) => [r.job_name, r]));
  const issues: HealthIssue[] = [];

  for (const [jobName, staleHours] of Object.entries(JOB_STALE_HOURS)) {
    const row = byName.get(jobName);

    if (!row || row.last_started_at === null) {
      issues.push({
        jobName,
        kind: "never_ran",
        detail: "No run has ever been recorded.",
      });
      continue;
    }

    // Errors outrank staleness: the error message is the actionable half.
    if (row.last_status === "error") {
      issues.push({
        jobName,
        kind: "errored",
        detail: `Last run failed: ${row.last_error ?? "no error recorded"}`,
      });
      continue;
    }

    if (row.last_ok_at === null || hoursBetween(row.last_ok_at, now) > staleHours) {
      const age = row.last_ok_at
        ? `${Math.floor(hoursBetween(row.last_ok_at, now))}h ago`
        : "never";
      issues.push({
        jobName,
        kind: "stalled",
        detail: `Last successful run ${age} (window is ${staleHours}h).`,
      });
    }
  }

  return issues;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- run-log`
Expected: PASS, 10 tests.

- [ ] **Step 6: Apply the migration**

Use the `mcp__supabase__apply_migration` tool with name `job_cron_runs` and the SQL from Step 1.

Then verify with `mcp__supabase__execute_sql`:

```sql
select column_name, data_type from information_schema.columns
where table_name = 'job_cron_runs' order by ordinal_position;
```

Expected: 7 rows — `id`, `job_name`, `started_at`, `finished_at`, `status`, `counts`, `error`.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260806000001_job_cron_runs.sql \
        src/lib/job-search/run-log.ts \
        src/lib/job-search/run-log.test.ts
git commit -m "feat: record every cron run and derive health from it"
```

---

### Task 2: Wrap the existing crons in run records

**Files:**
- Modify: `src/lib/job-search/run-log.ts` (append the recorder — stays pure)
- Create: `src/lib/job-search/run-log-db.ts`
- Test: `src/lib/job-search/run-log.test.ts` (append a describe block)
- Modify: `src/app/api/job-search/ingest-jobs/route.ts`
- Modify: `src/app/api/job-search/recheck-listings/route.ts`
- Modify: `src/app/api/job-search/score-new-jobs/route.ts`
- Modify: `src/app/api/job-search/rollup-metrics/route.ts`
- Modify: `src/app/api/job-search/generate-weekly-plan/route.ts`
- Modify: `src/app/api/job-search/send-weekly-review/route.ts`

**Interfaces:**
- Consumes: `RunCounts`, `RunStatus` from Task 1.
- Produces: from `run-log.ts` — `RunLogDeps`, `recordRun<T>(jobName: string, fn: (counts: RunCounts) => Promise<T>, deps: RunLogDeps): Promise<T>` (deps is **required**, so the pure module never reaches for a client). From `run-log-db.ts` — `supabaseRunDeps: RunLogDeps`, `withRunLog<T>(jobName: string, fn: (counts: RunCounts) => Promise<T>): Promise<T>`.

`send-daily-email` is deliberately excluded here — Task 4 rewrites it anyway.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/job-search/run-log.test.ts`:

```ts
import { recordRun, type RunLogDeps } from "./run-log";

function fakeDeps() {
  const opened: string[] = [];
  const closed: Array<{ id: string; status: string; counts: unknown; error: string | null }> = [];
  const deps: RunLogDeps = {
    open: async (jobName) => {
      opened.push(jobName);
      return `run-${opened.length}`;
    },
    close: async (id, status, counts, error) => {
      closed.push({ id, status, counts, error });
    },
  };
  return { deps, opened, closed };
}

describe("recordRun", () => {
  it("opens a run, returns the function's value, and closes it ok", async () => {
    const { deps, opened, closed } = fakeDeps();

    const result = await recordRun("ingest-jobs", async () => "done", deps);

    expect(result).toBe("done");
    expect(opened).toEqual(["ingest-jobs"]);
    expect(closed).toHaveLength(1);
    expect(closed[0].status).toBe("ok");
    expect(closed[0].error).toBeNull();
  });

  it("passes a mutable counts object through to the close call", async () => {
    const { deps, closed } = fakeDeps();

    await recordRun("ingest-jobs", async (counts) => {
      counts.scanned = 120;
      counts.inserted = 3;
    }, deps);

    expect(closed[0].counts).toEqual({ scanned: 120, inserted: 3 });
  });

  it("closes the run as errored and rethrows when the function throws", async () => {
    const { deps, closed } = fakeDeps();

    await expect(
      recordRun("ingest-jobs", async () => {
        throw new Error("board 502");
      }, deps),
    ).rejects.toThrow("board 502");

    expect(closed).toHaveLength(1);
    expect(closed[0].status).toBe("error");
    expect(closed[0].error).toContain("board 502");
  });

  it("still runs the function when opening the run record fails", async () => {
    const deps: RunLogDeps = {
      open: async () => {
        throw new Error("db down");
      },
      close: async () => {},
    };

    await expect(recordRun("ingest-jobs", async () => "done", deps)).resolves.toBe("done");
  });

  it("does not mask the function's own error when closing fails", async () => {
    const deps: RunLogDeps = {
      open: async () => "run-1",
      close: async () => {
        throw new Error("close failed");
      },
    };

    await expect(
      recordRun("ingest-jobs", async () => {
        throw new Error("real failure");
      }, deps),
    ).rejects.toThrow("real failure");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- run-log`
Expected: FAIL — `recordRun` is not exported.

- [ ] **Step 3: Implement `recordRun` (pure)**

Append to `src/lib/job-search/run-log.ts`. Note there is **no** Supabase import
here — see Global Constraints.

```ts
export interface RunLogDeps {
  open: (jobName: string) => Promise<string>;
  close: (
    id: string,
    status: Exclude<RunStatus, "running">,
    counts: RunCounts,
    error: string | null,
  ) => Promise<void>;
}

/**
 * Wrap a cron body so its execution is recorded whatever happens.
 *
 * Logging must never be the reason a cron fails. If opening the record throws,
 * the work still runs — an unlogged successful run is a far better outcome
 * than a skipped one, and the stall detector will surface the gap anyway.
 * Likewise a failure to close is swallowed, so it can never replace the real
 * error the caller needs to see.
 */
export async function recordRun<T>(
  jobName: string,
  fn: (counts: RunCounts) => Promise<T>,
  deps: RunLogDeps,
): Promise<T> {
  const counts: RunCounts = {};
  let runId: string | null = null;

  try {
    runId = await deps.open(jobName);
  } catch {
    runId = null;
  }

  const finish = async (
    status: Exclude<RunStatus, "running">,
    error: string | null,
  ) => {
    if (runId === null) return;
    try {
      await deps.close(runId, status, counts, error);
    } catch {
      // Never let bookkeeping mask the outcome.
    }
  };

  try {
    const result = await fn(counts);
    await finish("ok", null);
    return result;
  } catch (err) {
    await finish("error", err instanceof Error ? err.message : String(err));
    throw err;
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- run-log`
Expected: PASS, 15 tests.

- [ ] **Step 5: Create the Supabase-backed wrapper**

Create `src/lib/job-search/run-log-db.ts`. Everything that touches the client
lives here, so `run-log.ts` stays importable from a test:

```ts
import { supabase } from "@/lib/supabase";
import {
  recordRun,
  type JobLastRun,
  type RunCounts,
  type RunLogDeps,
  type RunStatus,
} from "./run-log";

export const supabaseRunDeps: RunLogDeps = {
  open: async (jobName) => {
    const { data, error } = await supabase
      .from("job_cron_runs")
      .insert({ job_name: jobName })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  },
  close: async (id, status, counts, error) => {
    await supabase
      .from("job_cron_runs")
      .update({
        finished_at: new Date().toISOString(),
        status,
        counts,
        error,
      })
      .eq("id", id);
  },
};

/** What every cron route calls. */
export function withRunLog<T>(
  jobName: string,
  fn: (counts: RunCounts) => Promise<T>,
): Promise<T> {
  return recordRun(jobName, fn, supabaseRunDeps);
}
```

- [ ] **Step 6: Wrap each cron route**

For each of the six routes listed in **Files**, find the inner `async function run(request: NextRequest)` and wrap its body. The pattern, using `ingest-jobs` as the worked example:

```ts
// at the top of the file
import { withRunLog } from "@/lib/job-search/run-log-db";

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return withRunLog("ingest-jobs", async (counts) => {
    // ... the entire existing body, unchanged ...

    // Before each return of a success payload, record what happened.
    counts.scanned = candidates.length;
    counts.inserted = inserted;

    return NextResponse.json({ ok: true, inserted });
  });
}
```

Two rules:

- **The auth check stays outside `withRunLog`.** An unauthenticated probe is not a run, and logging it would let anyone with the URL flood the table.
- **Set at least one count per route** so the record says what the run did, not just that it happened. Use the names below; the daily email renders them verbatim.

| Route | `jobName` | Counts to set |
|---|---|---|
| `ingest-jobs` | `ingest-jobs` | `scanned`, `inserted` |
| `recheck-listings` | `recheck-listings` | `checked`, `dead` |
| `score-new-jobs` | `score-new-jobs` | `scored` |
| `rollup-metrics` | `rollup-metrics` | `weeks` |
| `generate-weekly-plan` | `generate-weekly-plan` | `tasks` |
| `send-weekly-review` | `send-weekly-review` | `sent` |

If a route's existing body already computes a differently-named local for one of these, assign it across rather than renaming the local.

- [ ] **Step 7: Typecheck and test**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/job-search/run-log.ts src/lib/job-search/run-log-db.ts \
        src/lib/job-search/run-log.test.ts src/app/api/job-search
git commit -m "feat: wrap the job-search crons in run records"
```

---

### Task 3: Health section in the daily email

**Files:**
- Modify: `src/lib/email-templates.ts` (append `healthSection`)
- Test: `src/lib/email-templates.test.ts` (create)
- Modify: `src/lib/job-search/run-log-db.ts` (append `loadLastRuns`)
- Modify: `src/app/api/job-search/send-daily-email/route.ts`

**Interfaces:**
- Consumes: `HealthIssue`, `findHealthIssues`, `JobLastRun`, `RunStatus` from `run-log.ts`; `withRunLog` from `run-log-db.ts`.
- Produces: `healthSection(issues: HealthIssue[]): string` (from `email-templates.ts`), `loadLastRuns(): Promise<JobLastRun[]>` (from `run-log-db.ts`).

`email-templates.ts` imports only pure modules today and must stay that way —
its new test imports it directly.

- [ ] **Step 1: Write the failing test**

Create `src/lib/email-templates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { healthSection } from "./email-templates";
import type { HealthIssue } from "./job-search/run-log";

describe("healthSection", () => {
  it("renders nothing at all when there are no issues", () => {
    expect(healthSection([])).toBe("");
  });

  it("names the job and the reason for each issue", () => {
    const issues: HealthIssue[] = [
      { jobName: "apply-batch", kind: "stalled", detail: "Last successful run 52h ago (window is 48h)." },
      { jobName: "ingest-jobs", kind: "errored", detail: "Last run failed: board 502" },
    ];

    const html = healthSection(issues);

    expect(html).toContain("apply-batch");
    expect(html).toContain("52h ago");
    expect(html).toContain("ingest-jobs");
    expect(html).toContain("board 502");
  });

  it("escapes HTML in error text so a stray tag cannot break the email", () => {
    const issues: HealthIssue[] = [
      { jobName: "ingest-jobs", kind: "errored", detail: "Last run failed: <script>x</script>" },
    ];

    const html = healthSection(issues);

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- email-templates`
Expected: FAIL — `healthSection` is not exported.

- [ ] **Step 3: Implement `healthSection`**

Append to `src/lib/email-templates.ts`:

```ts
import type { HealthIssue } from "./job-search/run-log";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders only when something is wrong.
 *
 * A green "all systems healthy" banner every morning is read twice and
 * skipped forever after, which means the one morning it turns red it gets
 * skipped too. Silence on healthy is what keeps this worth looking at.
 */
export function healthSection(issues: HealthIssue[]): string {
  if (issues.length === 0) return "";

  const rows = issues
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 10px;font-family:monospace;font-size:13px;color:#7f1d1d;">
          ${escapeHtml(i.jobName)}
        </td>
        <td style="padding:6px 10px;font-size:13px;color:#7f1d1d;">
          ${escapeHtml(i.detail)}
        </td>
      </tr>`,
    )
    .join("");

  return `
    <div style="border:1px solid #fecaca;background:#fef2f2;border-radius:8px;padding:14px;margin:0 0 20px;">
      <div style="font-weight:600;font-size:14px;color:#991b1b;margin-bottom:8px;">
        ⚠ ${issues.length} job${issues.length === 1 ? "" : "s"} need attention
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- email-templates`
Expected: PASS, 3 tests.

- [ ] **Step 5: Add the loader to `run-log-db.ts`**

Append to `src/lib/job-search/run-log-db.ts` (not `run-log.ts` — this one
touches the client):

```ts
/**
 * Latest run and latest successful run per job, in one pass.
 *
 * Deliberately fetches a bounded recent window and folds it in TypeScript
 * rather than issuing two grouped queries per job. The table is small, the
 * window is generous, and one round trip is easier to reason about than
 * eighteen.
 */
export async function loadLastRuns(): Promise<JobLastRun[]> {
  const since = new Date(Date.now() - 14 * 24 * 3600_000).toISOString();

  const { data, error } = await supabase
    .from("job_cron_runs")
    .select("job_name, started_at, status, error")
    .gte("started_at", since)
    .order("started_at", { ascending: false });

  if (error) throw error;

  const byName = new Map<string, JobLastRun>();

  for (const row of (data ?? []) as Array<{
    job_name: string;
    started_at: string;
    status: RunStatus;
    error: string | null;
  }>) {
    // Rows arrive newest-first, so the first sighting of a name is its latest run.
    let entry = byName.get(row.job_name);
    if (!entry) {
      entry = {
        job_name: row.job_name,
        last_started_at: row.started_at,
        last_ok_at: null,
        last_status: row.status,
        last_error: row.error,
      };
      byName.set(row.job_name, entry);
    }
    if (entry.last_ok_at === null && row.status === "ok") {
      entry.last_ok_at = row.started_at;
    }
  }

  return [...byName.values()];
}
```

- [ ] **Step 6: Wire it into the daily email**

In `src/app/api/job-search/send-daily-email/route.ts`:

1. Add to the existing import from `@/lib/email-templates`: `healthSection`.
2. Add both imports:

```ts
import { findHealthIssues } from "@/lib/job-search/run-log";
import { loadLastRuns, withRunLog } from "@/lib/job-search/run-log-db";
```

3. Wrap the body of `run()` in `withRunLog("send-daily-email", async (counts) => { ... })`, keeping the `checkAuth` guard outside it, exactly as in Task 2.
4. Immediately before the section that assembles the email HTML, add:

```ts
  // findHealthIssues is synchronous; only the load is awaited.
  const healthIssues = findHealthIssues(await loadLastRuns(), new Date());
  counts.healthIssues = healthIssues.length;
```

5. In the `emailWrapper(...)` call, prepend `healthSection(healthIssues)` to the body string so it renders above everything else:

```ts
  const body = healthSection(healthIssues) + newJobsSection(newJobs, backlog) + /* ...existing sections... */;
```

- [ ] **Step 7: Verify end to end**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

Then trigger the route locally and confirm it returns 200:

```bash
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/job-search/send-daily-email
kill %1
```

Expected: `200`. Because no crons have logged a run yet, the health block will list every job as `never_ran` — that is correct behavior on first deploy and resolves itself after one cycle of each cron.

- [ ] **Step 8: Commit**

```bash
git add src/lib/email-templates.ts src/lib/email-templates.test.ts \
        src/lib/job-search/run-log-db.ts src/app/api/job-search/send-daily-email/route.ts
git commit -m "feat: lead the daily email with cron health, only when something is wrong"
```

---

### Task 4: The location gate

**Files:**
- Create: `src/lib/job-search/gates.ts`
- Test: `src/lib/job-search/gates.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `GateInput`, `GateResult`, `EthicsFlag`, `BAY_AREA_HINTS`, `onsiteDays(text: string): number | null`, `isRemoteUs(input: GateInput): boolean`, `locationGate(input: GateInput): GateResult`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/job-search/gates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { locationGate, onsiteDays, type GateInput } from "./gates";

function input(overrides: Partial<GateInput> = {}): GateInput {
  return {
    company: "Acme",
    industry: null,
    location: null,
    jd_text: null,
    ...overrides,
  };
}

describe("onsiteDays", () => {
  it("reads 'N days a week'", () => {
    expect(onsiteDays("We work 3 days a week in the office")).toBe(3);
  });

  it("reads 'N days per week'", () => {
    expect(onsiteDays("Hybrid: 2 days per week onsite")).toBe(2);
  });

  it("reads 'Nx/week'", () => {
    expect(onsiteDays("Onsite 4x/week")).toBe(4);
  });

  it("reads 'N days in office' with no cadence word", () => {
    expect(onsiteDays("Hybrid — 2 days in office")).toBe(2);
  });

  it("returns null when no cadence is stated", () => {
    expect(onsiteDays("We are a hybrid company")).toBeNull();
  });

  it("returns null for empty text", () => {
    expect(onsiteDays("")).toBeNull();
  });
});

describe("locationGate", () => {
  it("passes a fully remote US role", () => {
    const r = locationGate(input({ location: "Remote (US)" }));
    expect(r.pass).toBe(true);
  });

  it("passes remote-first stated in the JD", () => {
    const r = locationGate(input({ location: null, jd_text: "We are remote-first." }));
    expect(r.pass).toBe(true);
  });

  it("passes a Bay Area role at 3 days onsite", () => {
    const r = locationGate(input({ location: "San Francisco, CA", jd_text: "Hybrid, 3 days a week in office" }));
    expect(r.pass).toBe(true);
  });

  it("rejects a Bay Area role at 4 days onsite", () => {
    const r = locationGate(input({ location: "San Francisco, CA", jd_text: "4 days a week in office" }));
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("location");
    expect(r.reason).toContain("4");
  });

  it("rejects a hybrid role outside the Bay Area", () => {
    const r = locationGate(input({ location: "Austin, TX", jd_text: "Hybrid, 2 days a week" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("outside");
  });

  it("passes a Bay Area hybrid role with no stated cadence, and says it assumed", () => {
    const r = locationGate(input({ location: "Oakland, CA", jd_text: "This is a hybrid role." }));
    expect(r.pass).toBe(true);
    expect(r.reason).toBe("cadence_assumed");
  });

  it("rejects a Bay Area role with no remote or hybrid language at all", () => {
    const r = locationGate(input({ location: "Palo Alto, CA", jd_text: "Join us at HQ." }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("onsite");
  });

  it("rejects a role with no location signal whatsoever", () => {
    const r = locationGate(input());
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("no location");
  });

  it("does not treat 'remote-friendly' on a hybrid role as fully remote", () => {
    const r = locationGate(input({ location: "New York, NY", jd_text: "Remote-friendly, hybrid 3 days a week" }));
    expect(r.pass).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- gates`
Expected: FAIL — `Failed to resolve import "./gates"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/job-search/gates.ts`:

```ts
/**
 * Hard gates. A role that fails one never enters the funnel.
 *
 * These stay deterministic and keyword-driven on purpose. A gate is the one
 * place in this system that can silently shrink the pipeline to nothing, so it
 * must be cheap to run, exhaustively testable, and incapable of inventing a
 * rejection. Judgment calls belong in scoring and in Jon's review, not here.
 */

export interface GateInput {
  company: string;
  industry: string | null;
  location: string | null;
  jd_text: string | null;
}

export type EthicsFlag = "gambling" | "crypto" | "aggressive_monetization";

export interface GateResult {
  pass: boolean;
  gate: "location" | "ethics" | null;
  reason: string | null;
  flags: EthicsFlag[];
}

/** Moved from fit-score.ts, which keeps its own copy for scoring. */
export const BAY_AREA_HINTS = [
  "san francisco",
  "sf bay",
  "bay area",
  "oakland",
  "berkeley",
  "palo alto",
  "mountain view",
  "menlo park",
  "south san francisco",
  "redwood city",
  "sunnyvale",
  "san mateo",
  "san jose",
  "cupertino",
];

/** The most onsite days Jon will take in the Bay Area. */
export const MAX_ONSITE_DAYS = 3;

const CADENCE_PATTERNS: RegExp[] = [
  /(\d)\s*(?:\+)?\s*days?\s*(?:a|per)\s*week/i,
  /(\d)\s*days?\s*(?:in|on)[-\s]?site/i,
  /(\d)\s*x\s*\/?\s*(?:a\s*)?week/i,
  /(\d)\s*days?\s*in\s*(?:the\s*)?office/i,
];

export function onsiteDays(text: string): number | null {
  for (const re of CADENCE_PATTERNS) {
    const m = re.exec(text);
    if (m) {
      const n = Number(m[1]);
      if (n >= 0 && n <= 7) return n;
    }
  }
  return null;
}

const REMOTE_PATTERNS: RegExp[] = [
  /fully remote/i,
  /100%\s*remote/i,
  /remote[-\s]first/i,
  /work from anywhere/i,
  /\bremote\s*\(us/i,
  /\bus[-\s]remote\b/i,
  /\bremote,?\s*us\b/i,
];

function haystack(input: GateInput): string {
  return `${input.location ?? ""} ${input.jd_text ?? ""}`.toLowerCase();
}

/**
 * Hybrid beats remote language, always.
 *
 * "Remote-friendly, hybrid 3 days a week" is a hybrid role that used the word
 * remote for recruiting reasons. Reading it as remote is exactly the mistake
 * that puts a 3-day commute on the calendar.
 */
export function isRemoteUs(input: GateInput): boolean {
  const text = haystack(input);
  if (/\bhybrid\b/.test(text)) return false;
  if (REMOTE_PATTERNS.some((re) => re.test(text))) return true;
  return (input.location ?? "").trim().toLowerCase() === "remote";
}

function isBayArea(input: GateInput): boolean {
  const text = haystack(input);
  return BAY_AREA_HINTS.some((h) => text.includes(h));
}

export function locationGate(input: GateInput): GateResult {
  const pass = (reason: string | null): GateResult => ({
    pass: true,
    gate: null,
    reason,
    flags: [],
  });
  const reject = (reason: string): GateResult => ({
    pass: false,
    gate: "location",
    reason,
    flags: [],
  });

  if (isRemoteUs(input)) return pass(null);

  const text = haystack(input);
  const bay = isBayArea(input);
  const hybrid = /\bhybrid\b/.test(text);

  if (!bay) {
    if (hybrid) return reject("Hybrid role outside the Bay Area.");
    if (text.trim() === "") return reject("Not remote and no location stated.");
    return reject("Not remote and outside the Bay Area.");
  }

  const days = onsiteDays(text);

  if (days === null) {
    // A Bay Area role that says hybrid but not how often gets the permissive
    // read, flagged for a human. Rejecting on silence would drop good local
    // roles; passing silently would hide a 5-day commute.
    if (hybrid) return pass("cadence_assumed");
    return reject("Bay Area role with no remote or hybrid language; assumed 5 days onsite.");
  }

  if (days <= MAX_ONSITE_DAYS) return pass(null);
  return reject(`Bay Area role requires ${days} days onsite (max is ${MAX_ONSITE_DAYS}).`);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- gates`
Expected: PASS, 16 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/gates.ts src/lib/job-search/gates.test.ts
git commit -m "feat: gate roles on work location"
```

---

### Task 5: The ethics gate and disclosure flags

**Files:**
- Modify: `src/lib/job-search/gates.ts`
- Test: `src/lib/job-search/gates.test.ts`

**Interfaces:**
- Consumes: `GateInput`, `GateResult`, `EthicsFlag` from Task 4.
- Produces: `ethicsGate(input: GateInput): GateResult`, `detectFlags(input: GateInput): EthicsFlag[]`.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/job-search/gates.test.ts`:

```ts
import { ethicsGate, detectFlags } from "./gates";

describe("ethicsGate", () => {
  it("passes an ordinary SaaS company", () => {
    const r = ethicsGate(input({ company: "Linear", industry: "SaaS" }));
    expect(r.pass).toBe(true);
  });

  it("rejects a defense contractor named in the industry", () => {
    const r = ethicsGate(input({ company: "Anduril", industry: "Defense contractor" }));
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("ethics");
    expect(r.reason).toContain("defense");
  });

  it("rejects a data broker named in the company", () => {
    const r = ethicsGate(input({ company: "Acme Data Broker LLC", industry: "Analytics" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("surveillance");
  });

  it("rejects a payday lender", () => {
    const r = ethicsGate(input({ company: "FastCash", industry: "Payday lending" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("predatory_finance");
  });

  it("does not reject on JD text alone", () => {
    const r = ethicsGate(
      input({ company: "Honest Bank", industry: "Fintech", jd_text: "We do not do predatory lending." }),
    );
    expect(r.pass).toBe(true);
  });
});

describe("detectFlags", () => {
  it("flags social casino without rejecting", () => {
    const i = input({ company: "Playtika", industry: "Social casino games" });
    expect(detectFlags(i)).toContain("gambling");
    expect(ethicsGate(i).pass).toBe(true);
  });

  it("flags web3 gaming without rejecting", () => {
    const i = input({ company: "Treasure", industry: "Web3 gaming", jd_text: "Own our tokenomics." });
    expect(detectFlags(i)).toContain("crypto");
    expect(ethicsGate(i).pass).toBe(true);
  });

  it("flags gacha monetization without rejecting", () => {
    const i = input({ company: "Some Studio", industry: "Mobile games", jd_text: "Own the gacha economy." });
    expect(detectFlags(i)).toContain("aggressive_monetization");
    expect(ethicsGate(i).pass).toBe(true);
  });

  it("returns no flags for an ordinary company", () => {
    expect(detectFlags(input({ company: "Linear", industry: "SaaS" }))).toEqual([]);
  });

  it("carries flags through on a passing ethics result", () => {
    const r = ethicsGate(input({ company: "Playtika", industry: "Social casino" }));
    expect(r.pass).toBe(true);
    expect(r.flags).toContain("gambling");
  });

  it("does not flag the word 'whale' outside a monetization context", () => {
    expect(detectFlags(input({ company: "Whale Shark Labs", industry: "SaaS" }))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- gates`
Expected: FAIL — `ethicsGate` is not exported.

- [ ] **Step 3: Write the implementation**

Append to `src/lib/job-search/gates.ts`:

```ts
/**
 * The rejection floor. Deliberately narrow.
 *
 * An earlier draft also rejected gambling, social casino, and crypto. Those
 * are Jon's actual record — Zynga, Jam City, Treasure DAO, Mythical — and
 * gating them out removes the roles where fifteen years of experience make him
 * strongest, and where a reply is most likely. A cleaner list and an empty
 * inbox is not a trade worth making.
 *
 * What is left holds only where both are true: no experience overlap, and a
 * line he would not cross for any offer.
 */
const ETHICS_REJECT: Record<string, string[]> = {
  defense: [
    "defense contractor",
    "defense technology",
    "weapons",
    "munitions",
    "military surveillance",
    "border enforcement",
    "immigration enforcement",
  ],
  surveillance: [
    "data broker",
    "people search",
    "location data resale",
    "covert tracking",
    "mass surveillance",
  ],
  predatory_finance: ["payday lend", "payday loan", "predatory lend", "debt trap"],
};

/**
 * Disclosure, not rejection. These render as a badge on the role card and
 * carry no score penalty — Jon decides with the full JD in front of him.
 */
const ETHICS_FLAG_TERMS: Record<EthicsFlag, string[]> = {
  gambling: [
    "casino",
    "sportsbook",
    "sports betting",
    "real-money gaming",
    "real money gaming",
    "slots",
  ],
  crypto: [
    "token launch",
    "tokenomics",
    "nft marketplace",
    "defi",
    "play-to-earn",
    "play to earn",
    "web3 gaming",
  ],
  aggressive_monetization: ["loot box", "lootbox", "gacha", "whale spend", "whale monetization"],
};

function identityText(input: GateInput): string {
  // Company and industry only — the reject decision never reads the JD.
  return `${input.company} ${input.industry ?? ""}`.toLowerCase();
}

export function detectFlags(input: GateInput): EthicsFlag[] {
  const text = `${identityText(input)} ${(input.jd_text ?? "").toLowerCase()}`;
  const found: EthicsFlag[] = [];
  for (const [flag, terms] of Object.entries(ETHICS_FLAG_TERMS) as Array<[EthicsFlag, string[]]>) {
    if (terms.some((t) => text.includes(t))) found.push(flag);
  }
  return found;
}

/**
 * Matches on company and industry only.
 *
 * A fintech JD that says "we do not do predatory lending" must not trip the
 * gate — and a JD is full of sentences about what a company is not. Identity
 * is the reliable signal; prose is not.
 */
export function ethicsGate(input: GateInput): GateResult {
  const text = identityText(input);
  const flags = detectFlags(input);

  for (const [category, terms] of Object.entries(ETHICS_REJECT)) {
    const hit = terms.find((t) => text.includes(t));
    if (hit) {
      return {
        pass: false,
        gate: "ethics",
        reason: `${category}: matched "${hit}"`,
        flags,
      };
    }
  }

  return { pass: true, gate: null, reason: null, flags };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- gates`
Expected: PASS, 27 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/job-search/gates.ts src/lib/job-search/gates.test.ts
git commit -m "feat: narrow ethics gate with disclosure flags for Jon's own domains"
```

---

### Task 6: Overrides and the combined `evaluateGates`

**Files:**
- Create: `supabase/migrations/20260806000002_job_gate_overrides.sql`
- Modify: `src/lib/job-search/gates.ts`
- Create: `src/lib/job-search/gates-db.ts`
- Test: `src/lib/job-search/gates.test.ts`

**Interfaces:**
- Consumes: `locationGate`, `ethicsGate`, `detectFlags`, `GateInput`, `GateResult` from Tasks 4–5; `normalizeCompany` from `application-guard.ts` (already exported, and that module is pure).
- Produces: from `gates.ts` — `GateOverride`, `evaluateGates(input: GateInput, overrides: GateOverride[]): GateResult`. From `gates-db.ts` — `loadGateOverrides(): Promise<GateOverride[]>`.

`gates.ts` must not import `@/lib/supabase` — its test imports it directly.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260806000002_job_gate_overrides.sql`:

```sql
-- Manual escape hatch for both hard gates.
--
-- A gate is the one thing in this system that can silently shrink the pipeline
-- to nothing. When it is wrong about a specific company, the fix must be one
-- row and no deploy — otherwise the pressure is to loosen the gate for
-- everyone, which is how a filter stops filtering.
--
-- company_key matches the canonical key produced by
-- src/lib/job-search/application-guard.ts (normalizeCompany).

CREATE TABLE IF NOT EXISTS job_gate_overrides (
  company_key text PRIMARY KEY,
  decision    text NOT NULL CHECK (decision IN ('allow', 'deny')),
  gate        text CHECK (gate IN ('location', 'ethics')),
  reason      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Write the failing test**

Append to `src/lib/job-search/gates.test.ts`:

```ts
import { evaluateGates, type GateOverride } from "./gates";

describe("evaluateGates", () => {
  const remoteOk = { location: "Remote (US)" };

  it("passes a role that clears both gates", () => {
    const r = evaluateGates(input({ ...remoteOk, company: "Linear", industry: "SaaS" }), []);
    expect(r.pass).toBe(true);
  });

  it("rejects on location before consulting ethics", () => {
    const r = evaluateGates(input({ location: "Austin, TX", jd_text: "Hybrid 2 days a week" }), []);
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("location");
  });

  it("rejects on ethics when location passes", () => {
    const r = evaluateGates(input({ ...remoteOk, company: "Anduril", industry: "Defense contractor" }), []);
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("ethics");
  });

  it("preserves disclosure flags on a passing result", () => {
    const r = evaluateGates(input({ ...remoteOk, company: "Playtika", industry: "Social casino" }), []);
    expect(r.pass).toBe(true);
    expect(r.flags).toContain("gambling");
  });

  it("an allow override rescues a rejected role", () => {
    const overrides: GateOverride[] = [
      { company_key: "anduril", decision: "allow", gate: "ethics", reason: "manual review" },
    ];
    const r = evaluateGates(
      input({ ...remoteOk, company: "Anduril", industry: "Defense contractor" }),
      overrides,
    );
    expect(r.pass).toBe(true);
    expect(r.reason).toContain("override");
  });

  it("a deny override rejects a role that would otherwise pass", () => {
    const overrides: GateOverride[] = [
      { company_key: "linear", decision: "deny", gate: null, reason: "already applied twice" },
    ];
    const r = evaluateGates(input({ ...remoteOk, company: "Linear", industry: "SaaS" }), overrides);
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("already applied twice");
  });

  it("matches overrides on the normalized company key, not raw text", () => {
    const overrides: GateOverride[] = [
      { company_key: "anduril", decision: "allow", gate: "ethics", reason: "manual review" },
    ];
    const r = evaluateGates(
      input({ ...remoteOk, company: "Anduril, Inc.", industry: "Defense contractor" }),
      overrides,
    );
    expect(r.pass).toBe(true);
  });

  it("still reports flags on an overridden role", () => {
    const overrides: GateOverride[] = [
      { company_key: "playtika", decision: "deny", gate: null, reason: "not interested" },
    ];
    const r = evaluateGates(
      input({ ...remoteOk, company: "Playtika", industry: "Social casino" }),
      overrides,
    );
    expect(r.flags).toContain("gambling");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- gates`
Expected: FAIL — `evaluateGates` is not exported.

- [ ] **Step 4: Write the implementation**

Append to `src/lib/job-search/gates.ts`:

```ts
import { normalizeCompany } from "./application-guard";

export interface GateOverride {
  company_key: string;
  decision: "allow" | "deny";
  gate: "location" | "ethics" | null;
  reason: string;
}

/**
 * Location runs first. It is cheaper, it is the more common rejection, and a
 * role Jon cannot physically take is not worth an ethics opinion.
 *
 * Flags are computed regardless of outcome, so a rejected role still shows why
 * it was interesting — which is what makes the reject list readable when
 * tuning the gates later.
 */
export function evaluateGates(input: GateInput, overrides: GateOverride[]): GateResult {
  const key = normalizeCompany(input.company);
  const override = overrides.find((o) => o.company_key === key);
  const flags = detectFlags(input);

  if (override) {
    return override.decision === "allow"
      ? { pass: true, gate: null, reason: `override: ${override.reason}`, flags }
      : { pass: false, gate: override.gate, reason: `override: ${override.reason}`, flags };
  }

  const location = locationGate(input);
  if (!location.pass) return { ...location, flags };

  const ethics = ethicsGate(input);
  if (!ethics.pass) return ethics;

  // Carry the location reason forward — 'cadence_assumed' must survive.
  return { pass: true, gate: null, reason: location.reason, flags };
}
```

Then create `src/lib/job-search/gates-db.ts`:

```ts
import { supabase } from "@/lib/supabase";
import type { GateOverride } from "./gates";

export async function loadGateOverrides(): Promise<GateOverride[]> {
  const { data, error } = await supabase
    .from("job_gate_overrides")
    .select("company_key, decision, gate, reason");
  if (error) throw error;
  return (data ?? []) as GateOverride[];
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- gates`
Expected: PASS, 35 tests.

If `normalizeCompany` is not exported from `application-guard.ts`, export it rather than duplicating the normalization. One copy, one place to fix — the same rule the dedupe migration follows.

- [ ] **Step 6: Apply the migration**

Use `mcp__supabase__apply_migration` with name `job_gate_overrides` and the SQL from Step 1.

Verify:

```sql
select column_name from information_schema.columns
where table_name = 'job_gate_overrides' order by ordinal_position;
```

Expected: `company_key`, `decision`, `gate`, `reason`, `created_at`.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260806000002_job_gate_overrides.sql \
        src/lib/job-search/gates.ts src/lib/job-search/gates-db.ts \
        src/lib/job-search/gates.test.ts
git commit -m "feat: combine gates with a per-company override table"
```

---

### Task 7: Run gates at ingest

**Files:**
- Create: `supabase/migrations/20260806000003_job_pipeline_gate_result.sql`
- Modify: `src/app/api/job-search/ingest-jobs/route.ts`
- Modify: `src/lib/job-search/types.ts`

**Interfaces:**
- Consumes: `evaluateGates`, `GateResult` from `gates.ts`; `loadGateOverrides` from `gates-db.ts`; `withRunLog` from `run-log-db.ts`.
- Produces: `gate_result` column on `job_pipeline_entries`; `PipelineEntry.gate_result`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20260806000003_job_pipeline_gate_result.sql`:

```sql
-- Why a role did or did not clear the hard gates.
--
-- Gated-out roles are still stored. A gate that silently drops rows cannot be
-- audited or tuned, and the first sign it is too aggressive would be an empty
-- funnel with no explanation. Storing the verdict makes the rejection list
-- readable.

ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS gate_result jsonb;

-- Downstream queries all ask "which rows passed", so index that directly.
CREATE INDEX IF NOT EXISTS idx_pipeline_gate_pass
  ON job_pipeline_entries (((gate_result ->> 'pass')::boolean));
```

- [ ] **Step 2: Extend the type**

In `src/lib/job-search/types.ts`, add to the `PipelineEntry` interface, directly after `channel`:

```ts
  /**
   * Hard-gate verdict. Null on rows written before gating existed — treat null
   * as ungated rather than as passing, so a backfill gap can never masquerade
   * as approval.
   */
  gate_result: GateResult | null;
```

And at the top of the file:

```ts
import type { GateResult } from "./gates";
```

- [ ] **Step 3: Update the fit-score test fixture**

`src/lib/job-search/fit-score.test.ts` builds a full `PipelineEntry`. Add `gate_result: null,` to the `entry()` factory's returned object, after `channel: null,`.

- [ ] **Step 4: Run tests to verify the type change compiles**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

- [ ] **Step 5: Wire gates into ingest**

In `src/app/api/job-search/ingest-jobs/route.ts`:

1. Add both imports:

```ts
import { evaluateGates } from "@/lib/job-search/gates";
import { loadGateOverrides } from "@/lib/job-search/gates-db";
```

2. Inside the `withRunLog` callback added in Task 2, before the loop that maps candidate roles to rows:

```ts
  const overrides = await loadGateOverrides();
```

3. Where each candidate row is built for insert, compute and attach the verdict:

```ts
  const gate = evaluateGates(
    {
      company: candidate.company,
      industry: candidate.industry ?? null,
      location: candidate.location ?? null,
      jd_text: candidate.jd_text ?? null,
    },
    overrides,
  );
```

Then include `gate_result: gate` in the object being inserted.

4. Apply the score floor **only to gated-pass rows**, so a rejected role is still recorded with its reason:

```ts
  if (!gate.pass) {
    gatedOut += 1;
    // Still insert it — the rejection list is what makes the gates tunable.
  } else if (score < minScore) {
    continue;
  }
```

5. Add counts alongside the ones from Task 2:

```ts
  counts.gatedOut = gatedOut;
```

Declare `let gatedOut = 0;` before the loop.

- [ ] **Step 6: Apply the migration**

Use `mcp__supabase__apply_migration` with name `job_pipeline_gate_result` and the SQL from Step 1.

- [ ] **Step 7: Verify against real data with a dry run**

The route already supports `dryRun=1`.

```bash
npm run dev &
sleep 8
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/job-search/ingest-jobs?dryRun=1&limit=25" | head -c 2000
kill %1
```

Expected: a JSON payload where some candidates carry `gate_result.pass === false`.

**Read the rejections before trusting them.** Confirm no social-casino or web3 gaming company was rejected — those must pass with a flag. If one was rejected, the ethics term list is over-matching and needs narrowing before this ships.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/20260806000003_job_pipeline_gate_result.sql \
        src/app/api/job-search/ingest-jobs/route.ts \
        src/lib/job-search/types.ts src/lib/job-search/fit-score.test.ts
git commit -m "feat: evaluate hard gates at ingest and store the verdict"
```

---

### Task 8: Backfill and exclude gated-out roles from the funnel

**Files:**
- Create: `scripts/backfill-gates.ts`
- Modify: `package.json`
- Modify: `src/app/api/job-search/pipeline/route.ts`
- Modify: `src/app/api/job-search/send-daily-email/route.ts`

**Interfaces:**
- Consumes: everything from Tasks 4–7.
- Produces: `npm run gates:backfill` and `npm run gates:check`.

- [ ] **Step 1: Install tsx**

The script must import `evaluateGates` from a `.ts` file. Existing scripts in
`scripts/` are plain `.mjs` and import nothing from `src/`, so there is no
TypeScript runner in the project yet. Duplicating the gate logic into a `.mjs`
would give the backfill a second copy that drifts from the one ingest uses —
the exact failure the dedupe migration warns about. Add a runner instead:

```bash
npm install --save-dev tsx
```

Expected: `tsx` appears in `devDependencies`.

- [ ] **Step 2: Write the backfill script**

Create `scripts/backfill-gates.ts`:

```ts
#!/usr/bin/env npx tsx
/**
 * Apply the hard gates to every pipeline row written before gating existed.
 *
 * Run `--dry-run` first, always. A gate that is wrong about a whole category
 * is easy to see in a list of 200 rejections and nearly invisible in an empty
 * dashboard three days later.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateGates, type GateOverride } from "../src/lib/job-search/gates";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Same .env.local loader as scripts/sync-materials.mjs — real environment wins.
function loadEnv(): void {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i === -1 || line.trim().startsWith("#")) continue;
    const key = line.slice(0, i).trim();
    if (process.env[key]) continue;
    process.env[key] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const { data: overrides } = await supabase
  .from("job_gate_overrides")
  .select("company_key, decision, gate, reason");

const { data: rows, error } = await supabase
  .from("job_pipeline_entries")
  .select("id, company, industry, location, jd_text, status");

if (error) throw error;

const rejections: Array<{ company: string; status: string; reason: string | null }> = [];
let passed = 0;

for (const row of rows ?? []) {
  const gate = evaluateGates(
    {
      company: row.company,
      industry: row.industry,
      location: row.location,
      jd_text: row.jd_text,
    },
    (overrides ?? []) as GateOverride[],
  );

  if (gate.pass) passed += 1;
  else rejections.push({ company: row.company, status: row.status, reason: gate.reason });

  if (!dryRun) {
    await supabase.from("job_pipeline_entries").update({ gate_result: gate }).eq("id", row.id);
  }
}

console.log(`${rows?.length ?? 0} rows · ${passed} pass · ${rejections.length} rejected\n`);
for (const r of rejections) {
  console.log(`  REJECT  ${r.company.padEnd(28)} [${r.status}]  ${r.reason}`);
}
if (dryRun) console.log("\n(dry run — nothing written)");
```

Note the script uses top-level `await`, which requires the file to be treated
as an ES module. `tsx` handles `.ts` files with ESM syntax directly; no
`package.json` change beyond the scripts below is needed.

- [ ] **Step 3: Add the npm scripts**

In `package.json`, add to `scripts`:

```json
    "gates:backfill": "tsx scripts/backfill-gates.ts",
    "gates:check": "tsx scripts/backfill-gates.ts --dry-run"
```

- [ ] **Step 4: Run the dry run and read every rejection**

Run: `npm run gates:check`

Expected: a rejection list. **Stop and read it.** Three things must be true before proceeding:

- No social-casino, mobile-gaming, or web3 company appears in the rejection list.
- Every `location` rejection names a real cadence or a genuinely non-Bay-Area location.
- The pass count is a clear majority of rows. If most of the pipeline is rejected, a term list is over-matching — fix `gates.ts` and re-run before writing anything.

If a specific company is wrongly rejected and the term lists are otherwise sound, add an override row rather than loosening the gate:

```sql
insert into job_gate_overrides (company_key, decision, gate, reason)
values ('<normalized-key>', 'allow', 'ethics', 'false positive: <why>');
```

- [ ] **Step 5: Run the backfill for real**

Run: `npm run gates:backfill`
Expected: same summary, without the dry-run notice.

Verify with `mcp__supabase__execute_sql`:

```sql
select gate_result ->> 'pass' as pass, count(*)
from job_pipeline_entries group by 1;
```

Expected: no nulls remain.

- [ ] **Step 6: Exclude gated-out roles from downstream queries**

Two places select saved roles for Jon to act on. Both must skip gate failures.

In `src/app/api/job-search/pipeline/route.ts`, on the query that lists entries, add:

```ts
    .or("gate_result.is.null,gate_result->>pass.eq.true")
```

In `src/app/api/job-search/send-daily-email/route.ts`, on the "new jobs in last 24h" query (the one filtering `status = 'saved'`), add the same `.or(...)` clause.

The `gate_result.is.null` half is a safety net for rows written between deploy and backfill. After the backfill it matches nothing, and it is cheaper to leave than to remove and forget on the next migration.

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all tests pass.

```bash
npm run dev &
sleep 8
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/job-search/pipeline | head -c 500
kill %1
```

Expected: 200, and no entry in the payload whose `gate_result.pass` is `false`.

- [ ] **Step 8: Commit**

```bash
git add scripts/backfill-gates.ts package.json package-lock.json \
        src/app/api/job-search/pipeline/route.ts \
        src/app/api/job-search/send-daily-email/route.ts
git commit -m "feat: backfill gate verdicts and keep rejected roles out of the funnel"
```

---

## Verification

After all eight tasks:

- [ ] `npm test` — all tests pass, including 35 in `gates.test.ts` and 15 in `run-log.test.ts`
- [ ] `npx tsc --noEmit` — clean
- [ ] `npm run lint` — clean
- [ ] `npm run gates:check` — rejection list contains no gaming, social-casino, or web3 company
- [ ] `select job_name, status, counts from job_cron_runs order by started_at desc limit 20;` returns rows after the crons next fire
- [ ] The daily email renders a health block listing `never_ran` jobs on first run, and stops mentioning each one after its first successful cycle

## What this plan does not do

Deliberately out of scope, covered by the next plan:

- `draft-applications` and the `job_application_drafts` table
- The `/job-search/approvals` page and signed email approval links
- The local Claude Code agent and `/apply-batch`
- Any LLM call, including `fit_note`
