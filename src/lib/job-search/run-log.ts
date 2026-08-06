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
