import type { PipelineStatus, WeeklyMetricsRow } from "./types";

export interface RollupInput {
  weekStart: string;
  completedTasksByCategory: Record<string, number>;
  pipelineStatuses: PipelineStatus[];
  connectionsContactedLast14d: number;
  connectionsRepliedLast14d: number;
  interviewsCompletedThisWeek: number;
  /**
   * Pipeline rows whose applied_date falls in this week. This is the real
   * record of what was submitted; the completed "apply" task count is only a
   * record of whether a checkbox got ticked, and had read 0 for weeks while
   * applications were actually going out. Whichever source is higher wins, so
   * ticking a task still counts for an application logged nowhere else.
   */
  applicationsFromPipelineThisWeek: number;
}

const ACTIVE_STATUSES: PipelineStatus[] = ["saved", "applied", "screen", "interview"];

export function computeWeeklyMetrics(
  input: RollupInput
): WeeklyMetricsRow {
  const c = input.completedTasksByCategory;
  const responseRate =
    input.connectionsContactedLast14d > 0
      ? input.connectionsRepliedLast14d / input.connectionsContactedLast14d
      : 0;

  const activeCount = input.pipelineStatuses.filter((s) =>
    ACTIVE_STATUSES.includes(s)
  ).length;

  return {
    week_start: input.weekStart,
    applications_sent: Math.max(
      c.apply || 0,
      input.applicationsFromPipelineThisWeek || 0
    ),
    outreach_sent: c.outreach || 0,
    follow_ups_sent: c.follow_up || 0,
    linkedin_posts: c.linkedin_post || 0,
    conversations: 0,
    phone_screens: 0,
    interviews: 0,
    offers: 0,
    response_rate: responseRate,
    active_pipeline_count: activeCount,
    interviews_completed: input.interviewsCompletedThisWeek,
  };
}
