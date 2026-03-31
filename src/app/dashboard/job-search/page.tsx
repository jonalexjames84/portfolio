import { TaskList } from "@/components/job-search/TaskList";
import { WeeklyScorecard } from "@/components/job-search/WeeklyScorecard";
import { FunnelHealth } from "@/components/job-search/FunnelHealth";
import { PortfolioKPIs } from "@/components/job-search/PortfolioKPIs";
import { PipelineBacklog } from "@/components/job-search/PipelineBacklog";
import { HubNav } from "@/components/job-search/HubNav";
import { supabase } from "@/lib/supabase";

const MAX_TASKS = 5;
const IMPACT_ORDER = ["high", "medium", "low"];

function sortByImpactThenDate(a: { impact: string; date: string }, b: { impact: string; date: string }) {
  const impactDiff = IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact);
  if (impactDiff !== 0) return impactDiff;
  return a.date.localeCompare(b.date);
}

async function getTodaysTasks() {
  const today = new Date().toISOString().split("T")[0];

  const [{ data: todayTasks }, { data: pastUnfinished }] = await Promise.all([
    supabase.from("job_daily_tasks").select("*").eq("date", today),
    supabase.from("job_daily_tasks").select("*").lt("date", today).eq("done", false).order("date", { ascending: true }),
  ]);

  const todaySorted = (todayTasks || []).sort(sortByImpactThenDate);
  const pastSorted = (pastUnfinished || []).sort(sortByImpactThenDate);

  const visible = [...todaySorted];
  const remaining = [...pastSorted];

  while (visible.length < MAX_TASKS && remaining.length > 0) {
    visible.push(remaining.shift()!);
  }

  const backlogCount = remaining.length;

  // Resolve blocked status
  const allTaskIds = new Set(visible.map((t) => t.id));
  const blockerIds = visible
    .filter((t) => t.blocked_by && !allTaskIds.has(t.blocked_by))
    .map((t) => t.blocked_by);

  let externalBlockers: Record<string, boolean> = {};
  if (blockerIds.length > 0) {
    const { data: blockers } = await supabase
      .from("job_daily_tasks")
      .select("id, done")
      .in("id", blockerIds);
    for (const b of blockers || []) {
      externalBlockers[b.id] = b.done;
    }
  }

  const tasksWithBlockedStatus = visible.map((t) => {
    if (!t.blocked_by) return { ...t, is_blocked: false };
    const visibleBlocker = visible.find((v) => v.id === t.blocked_by);
    if (visibleBlocker) return { ...t, is_blocked: !visibleBlocker.done };
    if (t.blocked_by in externalBlockers) return { ...t, is_blocked: !externalBlockers[t.blocked_by] };
    return { ...t, is_blocked: false };
  });

  const actionable = tasksWithBlockedStatus.filter((t) => !t.is_blocked);
  const allDone = actionable.length > 0 && actionable.every((t) => t.done);

  return { tasks: tasksWithBlockedStatus, backlogCount, allDone };
}

async function getMetrics() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const { data: currentWeek } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .eq("week_start", weekStartStr)
    .single();

  const targets = { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 };

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

    const counts = { applications_sent: 0, outreach_sent: 0, follow_ups_sent: 0, linkedin_posts: 0, conversations: 0 };
    for (const t of tasks || []) {
      if (t.category === "apply") counts.applications_sent++;
      if (t.category === "outreach") counts.outreach_sent++;
      if (t.category === "follow_up") counts.follow_ups_sent++;
      if (t.category === "linkedin_post") counts.linkedin_posts++;
    }

    return { current: { week_start: weekStartStr, ...counts, phone_screens: 0, interviews: 0, offers: 0 }, targets };
  }

  return { current: currentWeek, targets };
}

async function getPipeline() {
  const { data } = await supabase
    .from("job_pipeline_entries")
    .select("*")
    .order("last_update", { ascending: false });

  const entries = data || [];
  const funnel = {
    saved: entries.filter((e) => e.status === "saved").length,
    applied: entries.filter((e) => e.status === "applied").length,
    screen: entries.filter((e) => e.status === "screen").length,
    interview: entries.filter((e) => e.status === "interview").length,
    offer: entries.filter((e) => e.status === "offer").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
    passed: entries.filter((e) => e.status === "passed").length,
  };

  const conversionRates = {
    app_to_screen: funnel.applied > 0 ? Math.round(((funnel.screen + funnel.interview + funnel.offer) / (funnel.applied + funnel.screen + funnel.interview + funnel.offer)) * 100) : 0,
    screen_to_interview: (funnel.screen + funnel.interview + funnel.offer) > 0 ? Math.round(((funnel.interview + funnel.offer) / (funnel.screen + funnel.interview + funnel.offer)) * 100) : 0,
    interview_to_offer: (funnel.interview + funnel.offer) > 0 ? Math.round((funnel.offer / (funnel.interview + funnel.offer)) * 100) : 0,
  };

  return { funnel, conversionRates, total: entries.length, entries };
}

async function getBacklogTasks() {
  const { data } = await supabase
    .from("job_daily_tasks")
    .select("id, task, category, impact, company, date, done")
    .neq("category", "apply")
    .order("date", { ascending: true });
  return data || [];
}

export default async function JobSearchDashboard() {
  const [taskData, metricsData, pipelineData, backlogTasks] = await Promise.all([
    getTodaysTasks(),
    getMetrics(),
    getPipeline(),
    getBacklogTasks(),
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

      <HubNav />

      {/* Layer 1: Today's tasks */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <TaskList tasks={taskData.tasks || []} backlogCount={taskData.backlogCount || 0} allDone={taskData.allDone || false} />
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

      {/* Layer 3: Backlog (applications + tasks) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PipelineBacklog entries={pipelineData.entries || []} tasks={backlogTasks} />
      </div>

      {/* Layer 4: Portfolio KPIs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PortfolioKPIs />
      </div>
    </div>
  );
}
