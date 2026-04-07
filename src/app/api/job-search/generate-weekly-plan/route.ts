import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import {
  generateWeeklyPlan,
  type PlanInput,
} from "@/lib/job-search/weekly-plan-generator";

function nextMondayDateStr(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysUntilMonday);
  return monday.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

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

  const weekStartDate = nextMondayDateStr();
  const weekEndDate = addDays(weekStartDate, 4);
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = addDays(today, -7);

  // Carry forward last week's high-impact unfinished
  const lastWeekEnd = addDays(weekStartDate, -1);
  const lastWeekStart = addDays(lastWeekEnd, -4);
  const { data: lastWeekTasks } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .gte("date", lastWeekStart)
    .lte("date", lastWeekEnd)
    .eq("done", false);

  // Delete non-high last week unfinished
  const nonHighIds = (lastWeekTasks || [])
    .filter((t) => t.impact !== "high")
    .map((t) => t.id);
  if (nonHighIds.length > 0) {
    await supabase.from("job_daily_tasks").delete().in("id", nonHighIds);
  }

  const carriedOverHighImpact = (lastWeekTasks || [])
    .filter((t) => t.impact === "high")
    .map((t) => ({
      id: t.id,
      task: t.task,
      category: t.category,
      company: t.company,
    }));

  // Delete old (now-carried) high tasks; we re-create them on Monday
  const carriedIds = carriedOverHighImpact.map((c) => c.id);
  if (carriedIds.length > 0) {
    await supabase.from("job_daily_tasks").delete().in("id", carriedIds);
  }

  // Fetch interviews scheduled in this week
  const { data: interviewsData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, interview_date")
    .gte("interview_date", weekStartDate)
    .lte("interview_date", weekEndDate);

  const interviews = (interviewsData || [])
    .filter((i) => i.interview_date)
    .map((i) => ({
      id: i.id,
      company: i.company,
      role: i.role,
      date: i.interview_date as string,
    }));

  // Stale active pipeline entries
  const { data: staleData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, last_update")
    .in("status", ["screen", "interview"])
    .lte("last_update", sevenDaysAgo);

  const stalePipelineEntries = (staleData || []).map((s) => {
    const days = Math.floor(
      (Date.now() - new Date(s.last_update).getTime()) / 86400000
    );
    return { id: s.id, company: s.company, daysSinceUpdate: days };
  });

  // New scored jobs from last 7 days, score 65+, status saved
  const { data: newJobsData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, fit_score, fit_score_auto")
    .eq("status", "saved")
    .gte("created_at", sevenDaysAgo);

  const newScoredJobs = (newJobsData || [])
    .map((j) => ({
      id: j.id,
      company: j.company,
      role: j.role,
      score: j.fit_score ?? j.fit_score_auto ?? 0,
    }))
    .filter((j) => j.score >= 65);

  // Stale connections needing outreach
  const { data: staleConnData } = await supabase
    .from("job_connections")
    .select("id, name, company_name, last_contact")
    .lte("last_contact", sevenDaysAgo)
    .not("next_action", "is", null);

  const staleConnections = (staleConnData || []).map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company_name,
  }));

  // Target company backlog — top targets
  const { data: targetData } = await supabase
    .from("job_target_companies")
    .select("id, name, rank")
    .eq("hiring_status", "active")
    .order("rank", { ascending: true })
    .limit(20);

  const targetCompanyBacklog = (targetData || []).map((t) => ({
    id: t.id,
    company: t.name,
  }));

  const planInput: PlanInput = {
    weekStartDate,
    interviews,
    stalePipelineEntries,
    newScoredJobs,
    staleConnections,
    targetCompanyBacklog,
    carriedOverHighImpact,
  };

  const generated = generateWeeklyPlan(planInput);

  // Insert generated tasks
  if (generated.length > 0) {
    const { error } = await supabase.from("job_daily_tasks").insert(generated);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    weekStartDate,
    inserted: generated.length,
  });
}
