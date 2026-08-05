export const dynamic = "force-dynamic";

import { ApplicationTable } from "@/components/job-search/ApplicationTable";
import { ChannelBreakdown } from "@/components/job-search/ChannelBreakdown";
import { HubNav } from "@/components/job-search/HubNav";
import { MetricsBlock } from "@/components/job-search/MetricsBlock";
import { NorthStar } from "@/components/job-search/NorthStar";
import { PortfolioKPIs } from "@/components/job-search/PortfolioKPIs";
import { supabase } from "@/lib/supabase";
import { addDays, localDateStr, weekBounds } from "@/lib/job-search/dates";
import { buildFunnel } from "@/lib/job-search/funnel";
import { computeChannelStats } from "@/lib/job-search/channel-attribution";
import { buildContactIndex, type Contact } from "@/lib/job-search/referrals";
import type { ApplicationRow } from "@/lib/job-search/pipeline-views";
import type { PipelineStatus } from "@/lib/job-search/types";
import { TARGETS, type MetricRow } from "@/lib/email-templates";

/**
 * Where the search stands, then what to do about it.
 *
 * Two halves, in that order. The top is the snapshot — the north-star number,
 * the funnel that produces it, the week against target, and which channel is
 * actually working. The bottom is the plan: one table of applications shown
 * three ways, every row editable in place.
 *
 * What is deliberately not here is the second and third telling of the same
 * list. The page used to restate the pipeline as a ledger, a kanban board and a
 * weekly task list as well; those components still exist and still serve the
 * email templates and the other hub pages.
 */

async function loadData() {
  const today = localDateStr(new Date());
  const { weekStartStr } = weekBounds(today);
  const fourWeeksAgo = addDays(weekStartStr, -28);

  const [pipelineRes, metricsRes, ledgerRes, connectionsRes] = await Promise.all([
    supabase
      .from("job_pipeline_entries")
      .select(
        "id, company, role, status, job_url, fit_score, fit_score_auto, created_at, posted_at, last_update, applied_date, channel"
      )
      .order("last_update", { ascending: false }),
    supabase
      .from("job_weekly_metrics")
      .select("*")
      .gte("week_start", fourWeeksAgo)
      .order("week_start", { ascending: true }),
    supabase.from("job_applications").select("status, submitted_at"),
    supabase
      .from("job_connections")
      .select("id, name, company_name, linkedin_url, last_contact"),
  ]);

  if (pipelineRes.error) {
    throw new Error(`Could not load the pipeline: ${pipelineRes.error.message}`);
  }

  const entries = pipelineRes.data || [];

  const rows: ApplicationRow[] = entries.map((e) => ({
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
    // The board's own posting date when it gave us one — 247 of 321 rows. It is
    // what "most recent" means; `created_at` only says when the ingest ran, and
    // one night's run stamped 263 rows with the same value.
    postedDate: e.posted_at ? localDateStr(new Date(e.posted_at)) : null,
    lastUpdate: e.last_update ?? null,
  }));

  // The funnel counts applications from the ledger, not the pipeline: the
  // ledger is the record that an application happened, which is why it exists.
  const ledgerRows = ledgerRes.data || [];
  const submitted = ledgerRows.filter((r) => r.status === "submitted");
  const firstApplicationDate = submitted
    .map((r) => r.submitted_at)
    .filter((d): d is string => Boolean(d))
    .sort()[0];

  const countOf = (status: PipelineStatus) =>
    entries.filter((e) => e.status === status).length;

  const funnelReport = buildFunnel({
    applications: submitted.length,
    screens: countOf("screen"),
    interviews: countOf("interview"),
    offers: countOf("offer"),
    firstApplicationDate,
  });

  const history = metricsRes.data || [];
  const current = history.find((h) => h.week_start === weekStartStr);
  const series = (key: string) =>
    history.map((h) => Number((h as Record<string, unknown>)[key]) || 0);
  const value = (key: string) => Number(current?.[key]) || 0;

  const metricRows: MetricRow[] = [
    {
      label: "Applications",
      current: value("applications_sent"),
      target: TARGETS.applications_sent,
      history: series("applications_sent"),
    },
    {
      label: "Outreach",
      current: value("outreach_sent"),
      target: TARGETS.outreach_sent,
      history: series("outreach_sent"),
    },
    {
      label: "Response rate",
      current: value("response_rate"),
      target: null,
      history: series("response_rate"),
      unit: "%",
    },
    {
      label: "Active pipeline",
      current: value("active_pipeline_count"),
      target: null,
      history: series("active_pipeline_count"),
    },
    {
      label: "Interviews",
      current: value("interviews_completed"),
      target: null,
      history: series("interviews_completed"),
    },
  ];

  const contactIndex = buildContactIndex(connectionsRes.data || []);
  const contacts: Record<string, Contact[]> = Object.fromEntries(contactIndex);

  return {
    today,
    rows,
    contacts,
    funnelReport,
    metricRows,
    channelReport: computeChannelStats(entries),
  };
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default async function JobSearchDashboard() {
  const data = await loadData();

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Job Search
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {new Date(`${data.today}T12:00:00Z`).toLocaleDateString("en-US", {
            timeZone: "UTC",
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <HubNav />

      <Divider label="Where we are" />

      <Panel>
        <NorthStar report={data.funnelReport} />
      </Panel>

      <Panel>
        <MetricsBlock rows={data.metricRows} />
      </Panel>

      <Panel>
        <ChannelBreakdown report={data.channelReport} />
      </Panel>

      <Divider label="What to do" />

      <ApplicationTable
        rows={data.rows}
        today={data.today}
        contacts={data.contacts}
      />

      <Divider label="Portfolio" />

      <Panel>
        <PortfolioKPIs />
      </Panel>
    </div>
  );
}
