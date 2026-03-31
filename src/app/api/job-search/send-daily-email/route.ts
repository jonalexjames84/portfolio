import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  emailWrapper,
  scorecardSection,
  pipelineBoxes,
  signalBox,
  checkAuth,
  getWeekBounds,
  categoryEmoji,
  impactColor,
  TARGETS,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  return handleDailyDigest(request);
}

export async function POST(request: NextRequest) {
  return handleDailyDigest(request);
}

async function handleDailyDigest(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const { weekStartStr, weekEndStr, weekdaysPassed } = getWeekBounds();

  // Fetch today's tasks, week's completed tasks, and pipeline in parallel
  const [todayResult, weekResult, pipelineResult] = await Promise.all([
    supabase
      .from("job_daily_tasks")
      .select("*")
      .eq("date", today)
      .order("impact", { ascending: true }),
    supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("done", true),
    supabase.from("job_pipeline_entries").select("status"),
  ]);

  const tasks = todayResult.data || [];
  const weekCompleted = weekResult.data || [];
  const pipelineEntries = pipelineResult.data || [];

  // Count completed tasks by category for scorecard
  const counts: Record<string, number> = {};
  for (const t of weekCompleted) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }

  // Build funnel from pipeline
  const statuses = pipelineEntries.map((p) => p.status);
  const funnel = {
    applied: statuses.filter((s) => s === "applied").length,
    screen: statuses.filter((s) => s === "screen").length,
    interview: statuses.filter((s) => s === "interview").length,
    offer: statuses.filter((s) => s === "offer").length,
  };

  // Build task rows HTML
  let taskSection: string;
  if (tasks.length === 0) {
    taskSection = `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px;">Today's Tasks</h2>
        <p style="color: #6b7280; font-size: 14px;">No tasks scheduled for today.</p>
      </div>
    `;
  } else {
    const taskRows = tasks
      .map(
        (t) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
          <span style="font-size: 20px;">${categoryEmoji[t.category] || "\ud83d\udccb"}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
          <div style="font-weight: 600; color: #111827; font-size: 15px;">${t.task}</div>
          ${t.company ? `<div style="color: #6b7280; font-size: 13px; margin-top: 2px;">${t.company}</div>` : ""}
          ${t.link ? `<div style="margin-top: 4px;"><a href="${t.link}" style="color: #0d9488; text-decoration: none; font-size: 13px;">Open link &rarr;</a></div>` : ""}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right;">
          <span style="background: ${impactColor[t.impact]}15; color: ${impactColor[t.impact]}; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${t.impact}</span>
        </td>
      </tr>
    `
      )
      .join("");

    taskSection = `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 16px;">
        <div style="padding: 16px 16px 0;">
          <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0;">Today's Tasks</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse;">${taskRows}</table>
      </div>
    `;
  }

  // Mid-week signals
  const signals: string[] = [];
  if (weekdaysPassed >= 3) {
    const appPace = (counts.apply || 0) / weekdaysPassed;
    if (appPace * 5 < TARGETS.applications_sent) {
      const daysLeft = 5 - weekdaysPassed;
      signals.push(`\ud83d\udfe1 Below pace on applications \u2014 ${counts.apply || 0}/${TARGETS.applications_sent} with ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`);
    }
    const outreachPace = (counts.outreach || 0) / weekdaysPassed;
    if (outreachPace * 5 < TARGETS.outreach_sent) {
      signals.push(`\ud83d\udfe1 Outreach behind \u2014 ${counts.outreach || 0}/${TARGETS.outreach_sent} this week`);
    }
  }
  if (funnel.interview > 0) {
    signals.push(`\ud83d\udfe2 ${funnel.interview} active interview${funnel.interview !== 1 ? "s" : ""} in pipeline \u2014 prep time is high-leverage`);
  }

  const dayLabel = `Day ${weekdaysPassed} of 5`;
  const body = taskSection + scorecardSection(counts, dayLabel) + pipelineBoxes(funnel) + signalBox(signals);

  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const html = emailWrapper("Today's Game Plan", weekday, body);

  const highCount = tasks.filter((t) => t.impact === "high").length;
  const subject = `${new Date().toLocaleDateString("en-US", { weekday: "short" })}: ${tasks.length} tasks \u2014 ${highCount} high impact | ${counts.apply || 0}/${TARGETS.applications_sent} apps this week`;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, taskCount: tasks.length });
}
