export const dynamic = "force-dynamic";

import { ApplicationTable } from "@/components/job-search/ApplicationTable";
import { HubNav } from "@/components/job-search/HubNav";
import { supabase } from "@/lib/supabase";
import { localDateStr } from "@/lib/job-search/dates";
import type { ApplicationRow } from "@/lib/job-search/pipeline-views";
import type { PipelineStatus } from "@/lib/job-search/types";

/**
 * One table, three lenses: what needs hands, what just arrived, everything by
 * status.
 *
 * This page used to render eleven panels over six tables — a ledger, a kanban,
 * a funnel, a weekly task list, metrics and KPIs — which restated the same
 * applications in six shapes and left the only editable copy buried inside a
 * horizontally-scrolling board. The components still exist and are still used by
 * the email templates and the other hub pages; they are simply not the answer to
 * "what is the status of each application?"
 */

async function loadRows(): Promise<ApplicationRow[]> {
  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .select(
      "id, company, role, status, job_url, fit_score, fit_score_auto, created_at, last_update"
    )
    .order("last_update", { ascending: false });

  if (error) throw new Error(`Could not load the pipeline: ${error.message}`);

  return (data || []).map((e) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    status: e.status as PipelineStatus,
    jobUrl: e.job_url,
    score: e.fit_score ?? e.fit_score_auto ?? null,
    // `created_at` is a timestamptz; every date comparison downstream is a
    // calendar-day one in Jon's timezone, so it is resolved here rather than
    // letting a UTC evening read as tomorrow.
    createdDate: localDateStr(new Date(e.created_at)),
    lastUpdate: e.last_update ?? null,
  }));
}

export default async function JobSearchDashboard() {
  const today = localDateStr(new Date());
  const rows = await loadRows();

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Applications
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date(`${today}T12:00:00Z`).toLocaleDateString("en-US", {
            timeZone: "UTC",
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <HubNav />

      <ApplicationTable rows={rows} today={today} />
    </div>
  );
}
