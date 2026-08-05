import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth, getWeekBounds } from "@/lib/email-templates";
import { computeWeeklyMetrics } from "@/lib/job-search/metrics-rollup";
import type { PipelineStatus } from "@/lib/job-search/types";

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekStartStr, weekEndStr } = getWeekBounds();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split("T")[0];

  const [
    tasksRes,
    pipelineRes,
    contactedRes,
    repliedRes,
    interviewsRes,
    appliedThisWeekRes,
  ] = await Promise.all([
      supabase
        .from("job_daily_tasks")
        .select("category, done")
        .gte("date", weekStartStr)
        .lte("date", weekEndStr)
        .eq("done", true),
      supabase.from("job_pipeline_entries").select("status"),
      supabase
        .from("job_connections")
        .select("id")
        .gte("last_contact", fourteenDaysAgoStr),
      supabase
        .from("job_connections")
        .select("id")
        .gte("replied_at", fourteenDaysAgoStr),
      supabase
        .from("job_pipeline_entries")
        .select("id")
        .eq("status", "interview")
        .gte("last_update", weekStartStr)
        .lte("last_update", weekEndStr),
      supabase
        .from("job_pipeline_entries")
        .select("id")
        .not("applied_date", "is", null)
        .neq("status", "saved")
        .gte("applied_date", weekStartStr)
        .lte("applied_date", weekEndStr),
    ]);

  const completedTasksByCategory: Record<string, number> = {};
  for (const t of tasksRes.data || []) {
    completedTasksByCategory[t.category] =
      (completedTasksByCategory[t.category] || 0) + 1;
  }

  const row = computeWeeklyMetrics({
    weekStart: weekStartStr,
    completedTasksByCategory,
    pipelineStatuses: (pipelineRes.data || []).map((p) => p.status as PipelineStatus),
    connectionsContactedLast14d: (contactedRes.data || []).length,
    connectionsRepliedLast14d: (repliedRes.data || []).length,
    interviewsCompletedThisWeek: (interviewsRes.data || []).length,
    applicationsFromPipelineThisWeek: (appliedThisWeekRes.data || []).length,
  });

  const { error } = await supabase
    .from("job_weekly_metrics")
    .upsert(row, { onConflict: "week_start" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, row });
}
