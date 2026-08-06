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
