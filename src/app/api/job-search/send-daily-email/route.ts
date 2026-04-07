import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  emailWrapper,
  newJobsSection,
  weekViewSection,
  metricsSection,
  signalsSection,
  checkAuth,
  getWeekBounds,
  TARGETS,
  type NewJob,
  type WeekDay,
  type MetricRow,
} from "@/lib/email-templates";
import { computeSignals } from "@/lib/job-search/signals";

const resend = new Resend(process.env.RESEND_API_KEY);

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"];

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

  const today = new Date().toISOString().split("T")[0];
  const { weekStartStr, weekEndStr, weekdaysPassed } = getWeekBounds();
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const oneDayAgoIso = oneDayAgo.toISOString();

  // 1. New jobs in last 24h
  const { data: newJobsData } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, fit_score, fit_score_auto, score_breakdown, job_url")
    .eq("status", "saved")
    .gte("created_at", oneDayAgoIso);

  const newJobs: NewJob[] = (newJobsData || [])
    .map((j) => {
      const manual = j.fit_score;
      const auto = j.fit_score_auto || 0;
      return {
        id: j.id,
        company: j.company,
        role: j.role,
        score: manual ?? auto,
        scoreSource: (manual != null ? "manual" : "auto") as "manual" | "auto",
        breakdown: j.score_breakdown ?? null,
        job_url: j.job_url,
      };
    })
    .sort((a, b) => b.score - a.score);

  // 2. This week's tasks (full M-F)
  const { data: weekTasks } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .gte("date", weekStartStr)
    .lte("date", weekEndStr)
    .order("impact", { ascending: true });

  const days: WeekDay[] = DAY_LABELS.map((label, i) => {
    const date = addDays(weekStartStr, i);
    return {
      date,
      label,
      isToday: date === today,
      tasks: (weekTasks || [])
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

  // 3. Metrics (current + last 4 weeks)
  const fourWeeksAgo = addDays(weekStartStr, -28);
  const { data: metricsHistory } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .gte("week_start", fourWeeksAgo)
    .order("week_start", { ascending: true });

  const history = metricsHistory || [];
  const current =
    history.find((h) => h.week_start === weekStartStr) ||
    {
      applications_sent: 0,
      outreach_sent: 0,
      response_rate: 0,
      active_pipeline_count: 0,
      interviews_completed: 0,
    };

  const series = (key: keyof typeof current) =>
    history.map((h) => Number(h[key]) || 0);

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

  // 4. Signals
  const { data: pipelineRows } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, status, last_update");

  // Last 10 outreach: connections most recently contacted, count those that replied
  const { data: recentOutreach } = await supabase
    .from("job_connections")
    .select("id, replied_at")
    .not("last_contact", "is", null)
    .order("last_contact", { ascending: false })
    .limit(10);
  const last10OutreachReplies = (recentOutreach || []).filter(
    (c) => c.replied_at != null
  ).length;

  const savedCount = (pipelineRows || []).filter((p) => p.status === "saved").length;
  const staleActive = (pipelineRows || [])
    .filter((p) => p.status === "screen" || p.status === "interview")
    .map((p) => {
      const days = Math.floor(
        (Date.now() - new Date(p.last_update).getTime()) / 86400000
      );
      return { id: p.id, company: p.company, daysSince: days };
    })
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

  // Compose body
  const body =
    newJobsSection(newJobs) +
    weekViewSection(days) +
    metricsSection(metricRows) +
    signalsSection(signals);

  const weekday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const html = emailWrapper("Job Search — Daily Brief", weekday, body);

  const subject = `${new Date().toLocaleDateString("en-US", { weekday: "short" })}: ${newJobs.length} new jobs · ${current.applications_sent || 0}/${TARGETS.applications_sent} apps`;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    sent: true,
    newJobs: newJobs.length,
    weekTaskCount: weekTasks?.length || 0,
    signals: signals.length,
  });
}
