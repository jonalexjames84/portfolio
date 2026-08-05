export const dynamic = "force-dynamic";

import { NewJobsBlock } from "@/components/job-search/NewJobsBlock";
import { WeekView } from "@/components/job-search/WeekView";
import { MetricsBlock } from "@/components/job-search/MetricsBlock";
import { SignalsBlock } from "@/components/job-search/SignalsBlock";
import { FunnelHealth } from "@/components/job-search/FunnelHealth";
import { ChannelBreakdown } from "@/components/job-search/ChannelBreakdown";
import { ApplicationLedger } from "@/components/job-search/ApplicationLedger";
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
import { addDays, localDateStr, weekBounds } from "@/lib/job-search/dates";
import { computeChannelStats } from "@/lib/job-search/channel-attribution";
import {
  buildLedgerReport,
  type LedgerRow,
} from "@/lib/job-search/application-ledger";
import { NorthStar } from "@/components/job-search/NorthStar";
import { NextActions } from "@/components/job-search/NextActions";
import { buildFunnel } from "@/lib/job-search/funnel";
import { rankNextActions } from "@/lib/job-search/next-actions";
import { normalizeCompany } from "@/lib/job-search/application-guard";

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];

async function loadData() {
  // Rendered on the server, so `new Date()` is UTC. Resolve the calendar date
  // in PT first, or an evening visit shows tomorrow — and a Sunday-evening one
  // shows next week.
  const today = localDateStr(new Date());
  const { weekStartStr, weekdaysPassed } = weekBounds(today);
  // The board shows the working week, Monday–Friday.
  const weekEndStr = addDays(weekStartStr, 4);
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

  // The ledger is a separate table from the pipeline on purpose: it records
  // that an application *happened*, which pipeline status alone never did.
  // The connections query is deliberately unfiltered — `recentOutreachRes`
  // above only returns contacts already reached, so it cannot see the gap that
  // matters here: contacts on record who have never been approached.
  const [ledgerRes, connectionsRes] = await Promise.all([
    supabase
      .from("job_applications")
      .select(
        "id, company, company_key, role, job_url, status, agent_id, claimed_at, prepared_at, submitted_at, closed_at, notes"
      ),
    supabase.from("job_connections").select("id, last_contact, company_name"),
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

  // Only pass the fields FunnelHealth expects
  const funnelData = {
    funnel: {
      applied: pipelineEntries.filter((e) => e.status === "applied").length,
      screen: pipelineEntries.filter((e) => e.status === "screen").length,
      interview: pipelineEntries.filter((e) => e.status === "interview").length,
      offer: pipelineEntries.filter((e) => e.status === "offer").length,
      rejected: pipelineEntries.filter((e) => e.status === "rejected").length,
    },
    conversionRates: { app_to_screen: 0, screen_to_interview: 0, interview_to_offer: 0 },
  };

  const channelReport = computeChannelStats(pipelineEntries);
  // Saved roles tell the ledger whether a cap is actually costing anything.
  const savedRoles = pipelineEntries
    .filter((p) => p.status === "saved" && p.company_key)
    .map((p) => ({ companyKey: p.company_key as string, role: p.role }));

  const ledgerReport = buildLedgerReport((ledgerRes.data || []) as LedgerRow[], {
    savedRoles,
  });

  // The funnel counts applications from the ledger, not the pipeline: the
  // ledger is the record that an application happened, which is the whole
  // reason it exists.
  const ledgerRows = (ledgerRes.data || []) as LedgerRow[];
  const submittedRows = ledgerRows.filter((r) => r.status === "submitted");
  const firstApplicationDate = submittedRows
    .map((r) => r.submitted_at)
    .filter((d): d is string => Boolean(d))
    .sort()[0];

  const funnelReport = buildFunnel({
    applications: submittedRows.length,
    screens: pipelineEntries.filter((e) => e.status === "screen").length,
    interviews: pipelineEntries.filter((e) => e.status === "interview").length,
    offers: pipelineEntries.filter((e) => e.status === "offer").length,
    firstApplicationDate,
  });

  const connections = connectionsRes.data || [];
  const uncontacted = connections.filter((c) => !c.last_contact);

  // Which of them work somewhere an application is already in flight. Matched
  // through the same company key the ledger uses, so "Assort Health" and
  // "assort-health" resolve to one employer.
  const liveCompanyKeys = new Set(
    ledgerRows
      .filter((r) => r.status === "submitted" || r.status === "prepared")
      .map((r) => r.company_key)
  );
  const atLive = uncontacted.filter((c) =>
    liveCompanyKeys.has(normalizeCompany(c.company_name))
  );
  const uncontactedAtLiveCompanies = atLive.length;
  const liveCompaniesWithContacts = new Set(
    atLive.map((c) => normalizeCompany(c.company_name))
  ).size;

  const nextActions = rankNextActions({
    preparedCount: ledgerReport.waiting.length,
    uncontactedConnections: uncontacted.length,
    uncontactedAtLiveCompanies,
    liveCompaniesWithContacts,
    totalConnections: connections.length,
    followUpsDue: ledgerReport.submitted.filter((s) => s.followUpDue).length,
    staleActive: staleActive.length,
    interviewsInFlight: funnelReport.interviewsInFlight,
  });

  return {
    newJobs,
    days,
    metricRows,
    signals,
    funnelData,
    channelReport,
    ledgerReport,
    funnelReport,
    nextActions,
    pipelineEntries,
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

      {/* The first screen: one number, the chain that produces it, and the
          ranked list of what moves it. Everything else is below the divider. */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <NorthStar report={data.funnelReport} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <NextActions actions={data.nextActions} />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Details
        </span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Block 1: New Jobs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <NewJobsBlock jobs={data.newJobs} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <ApplicationLedger report={data.ledgerReport} />
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
        <FunnelHealth data={data.funnelData} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <ChannelBreakdown report={data.channelReport} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        <PipelineBoard entries={data.pipelineEntries} subtasks={data.subtasks} />
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PortfolioKPIs />
      </div>
    </div>
  );
}
