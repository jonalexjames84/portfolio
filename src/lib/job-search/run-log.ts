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
 */
export const JOB_STALE_HOURS: Record<string, number> = {
  "ingest-jobs": 36,
  "recheck-listings": 36,
  "score-new-jobs": 36,
  "rollup-metrics": 36,
  "send-daily-email": 36,
  "collect-market": 36,
  "collect-filings": 36,
  "generate-weekly-plan": 24 * 8,
  "send-weekly-review": 24 * 8,
  // Add a job here only once it is actually running (a route, a vercel.json
  // cron entry, or a script calling recordRun). A monitor for a job that
  // doesn't exist yet can never clear, and findHealthIssues below will flag
  // it as never_ran on every single run.
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
 * Detect a failure that resolved instead of throwing.
 *
 * Every route this wraps returns a `NextResponse` for a failure exactly as
 * often as it throws one — a Supabase query error, "no ATS-configured
 * companies", a rejected Resend send all resolve with a non-2xx status rather
 * than raising. `NextResponse` is a real `Response` under the hood, and
 * `Response` is a web-standard global (Node 18+), not a Next.js import — so
 * checking `instanceof Response` here catches every one of those cases with
 * zero changes to the six call sites, while keeping this module free of any
 * framework dependency. Anything that isn't a `Response` (a plain value, an
 * object a non-route caller resolves with) is untouched and always "ok".
 */
function describeFailure(result: unknown): string | null {
  if (typeof Response !== "undefined" && result instanceof Response && !result.ok) {
    return `HTTP ${result.status}`;
  }
  return null;
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
    const failure = describeFailure(result);
    if (failure !== null) {
      await finish("error", failure);
    } else {
      await finish("ok", null);
    }
    return result;
  } catch (err) {
    await finish("error", err instanceof Error ? err.message : String(err));
    throw err;
  }
}
