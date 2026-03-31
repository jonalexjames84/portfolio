import { TaskList } from "@/components/job-search/TaskList";
import { WeeklyScorecard } from "@/components/job-search/WeeklyScorecard";
import { FunnelHealth } from "@/components/job-search/FunnelHealth";
import { PortfolioKPIs } from "@/components/job-search/PortfolioKPIs";
import { PipelineBacklog } from "@/components/job-search/PipelineBacklog";

async function getTodaysTasks() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const today = new Date().toISOString().split("T")[0];
  try {
    const res = await fetch(`${baseUrl}/api/job-search/tasks?date=${today}`, { cache: "no-store" });
    if (!res.ok) return { tasks: [], backlogCount: 0, allDone: false };
    return await res.json();
  } catch {
    return { tasks: [], backlogCount: 0, allDone: false };
  }
}

async function getMetrics() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/job-search/metrics`, { cache: "no-store" });
    if (!res.ok) return { current: {}, targets: {} };
    return await res.json();
  } catch {
    return { current: {}, targets: {} };
  }
}

async function getPipeline() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/job-search/pipeline`, { cache: "no-store" });
    if (!res.ok) return { funnel: { applied: 0, screen: 0, interview: 0, offer: 0, rejected: 0 }, conversionRates: { app_to_screen: 0, screen_to_interview: 0, interview_to_offer: 0 } };
    return await res.json();
  } catch {
    return { funnel: { applied: 0, screen: 0, interview: 0, offer: 0, rejected: 0 }, conversionRates: { app_to_screen: 0, screen_to_interview: 0, interview_to_offer: 0 } };
  }
}

export default async function JobSearchDashboard() {
  const [taskData, metricsData, pipelineData] = await Promise.all([
    getTodaysTasks(),
    getMetrics(),
    getPipeline(),
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

      {/* Layer 1: Today's tasks — FRONT AND CENTER */}
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

      {/* Layer 3: Pipeline backlog */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PipelineBacklog entries={pipelineData.entries || []} />
      </div>

      {/* Layer 4: Portfolio KPIs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <PortfolioKPIs />
      </div>
    </div>
  );
}
