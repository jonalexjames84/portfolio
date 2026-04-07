import type { PipelineStatus, WeeklyMetricsRow } from "./types";

export interface RollupInput {
  weekStart: string;
  completedTasksByCategory: Record<string, number>;
  pipelineStatuses: PipelineStatus[];
  connectionsContactedLast14d: number;
  connectionsRepliedLast14d: number;
  interviewsCompletedThisWeek: number;
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
    applications_sent: c.apply || 0,
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
