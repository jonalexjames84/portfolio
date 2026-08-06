import { supabase } from "@/lib/supabase";
import {
  recordRun,
  type RunCounts,
  type RunLogDeps,
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
