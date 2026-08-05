import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import {
  emailWrapper,
  scorecardSection,
  signalBox,
  networkGrowthSection,
  checkAuth,
  EMAIL_FROM,
  EMAIL_TO,
  getWeekBounds,
  TARGETS,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  return handleWeeklyRecap(request);
}

export async function POST(request: NextRequest) {
  return handleWeeklyRecap(request);
}

async function handleWeeklyRecap(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekStartStr, weekEndStr } = getWeekBounds();

  // Last week bounds
  const lastWeekStart = new Date(weekStartStr);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStartStr = lastWeekStart.toISOString().split("T")[0];
  const lastWeekEndStr = new Date(lastWeekStart.getTime() + 6 * 86400000).toISOString().split("T")[0];

  const [thisWeekResult, lastWeekResult, allTasksResult, pipelineResult, pipelineMovedResult, newConnectionsResult, materialsResult] = await Promise.all([
    supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("done", true),
    supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", lastWeekStartStr)
      .lte("date", lastWeekEndStr)
      .eq("done", true),
    supabase
      .from("job_daily_tasks")
      .select("done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr),
    supabase.from("job_pipeline_entries").select("status"),
    supabase
      .from("job_pipeline_entries")
      .select("status, last_update")
      .gte("last_update", weekStartStr),
    supabase
      .from("job_connections")
      .select("id, referral_status")
      .gte("created_at", weekStartStr),
    supabase
      .from("job_materials")
      .select("id")
      .gte("created_at", weekStartStr),
  ]);

  const thisWeekCompleted = thisWeekResult.data || [];
  const lastWeekCompleted = lastWeekResult.data || [];
  const allTasks = allTasksResult.data || [];
  const pipelineEntries = pipelineResult.data || [];
  const pipelineMoved = pipelineMovedResult.data || [];
  const newConnections = newConnectionsResult.data || [];
  const newMaterials = materialsResult.data || [];
  const referralChanges = newConnections.filter((c) => c.referral_status !== "none").length;

  const total = allTasks.length;
  const completedCount = allTasks.filter((t) => t.done).length;

  // Count this week by category
  const counts: Record<string, number> = {};
  for (const t of thisWeekCompleted) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }

  // Count last week by category
  const lastCounts: Record<string, number> = {};
  for (const t of lastWeekCompleted) {
    lastCounts[t.category] = (lastCounts[t.category] || 0) + 1;
  }

  // Current funnel
  const statuses = pipelineEntries.map((p) => p.status);
  const funnel = {
    applied: statuses.filter((s) => s === "applied").length,
    screen: statuses.filter((s) => s === "screen").length,
    interview: statuses.filter((s) => s === "interview").length,
    offer: statuses.filter((s) => s === "offer").length,
  };

  // Pipeline movement this week
  const movedStatuses = pipelineMoved.map((p) => p.status);
  const moved = {
    applied: movedStatuses.filter((s) => s === "applied").length,
    screen: movedStatuses.filter((s) => s === "screen").length,
    interview: movedStatuses.filter((s) => s === "interview").length,
    offer: movedStatuses.filter((s) => s === "offer").length,
    rejected: movedStatuses.filter((s) => s === "rejected").length,
    passed: movedStatuses.filter((s) => s === "passed").length,
  };

  // --- Build summary line ---
  const summaryParts: string[] = [];
  const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const categoryLabels: Record<string, string> = {
    apply: "applications", outreach: "outreach messages", follow_up: "follow-ups",
    linkedin_post: "LinkedIn posts", content: "content tasks", prep: "prep tasks", admin: "admin tasks",
  };
  if (topCategory && topCategory[1] > 0) {
    summaryParts.push(`${topCategory[1]} ${categoryLabels[topCategory[0]] || topCategory[0]}`);
  }
  if (moved.screen > 0) summaryParts.push(`${moved.screen} new screen${moved.screen !== 1 ? "s" : ""}`);
  if (moved.interview > 0) summaryParts.push(`${moved.interview} new interview${moved.interview !== 1 ? "s" : ""}`);
  if (moved.offer > 0) summaryParts.push(`${moved.offer} offer${moved.offer !== 1 ? "s" : ""}!`);
  const completionPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const summaryLine = summaryParts.length > 0
    ? summaryParts.join(", ") + `. ${completionPct}% task completion.`
    : `${completionPct}% task completion this week.`;

  // --- Summary section ---
  const summarySection = `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <p style="color: #166534; font-size: 15px; font-weight: 600; margin: 0;">${summaryLine}</p>
    </div>
  `;

  // --- Week-over-week deltas ---
  function delta(key: string, label: string): string {
    const thisVal = counts[key] || 0;
    const lastVal = lastCounts[key] || 0;
    const diff = thisVal - lastVal;
    if (diff === 0) return `<span style="color: #6b7280;">${label}: ${thisVal} (=)</span>`;
    const color = diff > 0 ? "#16a34a" : "#dc2626";
    const sign = diff > 0 ? "+" : "";
    return `<span style="color: ${color}; font-weight: 600;">${label}: ${thisVal} (${sign}${diff})</span>`;
  }

  const hasLastWeek = lastWeekCompleted.length > 0;
  const deltaSection = hasLastWeek
    ? `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">vs Last Week</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px;">
        ${delta("apply", "Apps")}
        ${delta("outreach", "Outreach")}
        ${delta("follow_up", "Follow-ups")}
        ${delta("linkedin_post", "Posts")}
        ${delta("conversations", "Convos")}
      </div>
    </div>
    `
    : `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px;">vs Last Week</h2>
      <p style="color: #6b7280; font-size: 13px; margin: 0;">First week \u2014 no comparison yet.</p>
    </div>
    `;

  // --- Pipeline changes section ---
  const moveParts: string[] = [];
  if (moved.applied > 0) moveParts.push(`${moved.applied} new application${moved.applied !== 1 ? "s" : ""}`);
  if (moved.screen > 0) moveParts.push(`${moved.screen} advanced to screen`);
  if (moved.interview > 0) moveParts.push(`${moved.interview} advanced to interview`);
  if (moved.offer > 0) moveParts.push(`${moved.offer} offer${moved.offer !== 1 ? "s" : ""}`);
  if (moved.rejected > 0) moveParts.push(`${moved.rejected} rejected`);
  if (moved.passed > 0) moveParts.push(`${moved.passed} passed on`);

  const pipelineChangesHtml = moveParts.length > 0
    ? `<p style="font-size: 13px; color: #374151; margin: 0 0 16px;">${moveParts.join(" \u00b7 ")}</p>`
    : `<p style="font-size: 13px; color: #6b7280; margin: 0 0 16px;">No pipeline movement this week.</p>`;

  const pipelineSection = `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">Pipeline This Week</h2>
      ${pipelineChangesHtml}
      <div style="display: flex; gap: 12px; text-align: center;">
        <div style="flex: 1; padding: 8px; background: #eff6ff; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${funnel.applied}</div>
          <div style="font-size: 11px; color: #6b7280;">Applied</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fefce8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${funnel.screen}</div>
          <div style="font-size: 11px; color: #6b7280;">Screens</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #f0fdf4; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${funnel.interview}</div>
          <div style="font-size: 11px; color: #6b7280;">Interviews</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fdf2f8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #ec4899;">${funnel.offer}</div>
          <div style="font-size: 11px; color: #6b7280;">Offers</div>
        </div>
      </div>
    </div>
  `;

  // --- Signals ---
  const signals: string[] = [];
  const totalApplied = funnel.applied + funnel.screen + funnel.interview + funnel.offer;
  const screenRate = totalApplied > 0 ? ((funnel.screen + funnel.interview + funnel.offer) / totalApplied) * 100 : 0;

  if (totalApplied >= 10 && screenRate < 10) {
    signals.push("\ud83d\udd34 Application\u2192Screen rate is below 10%. Your resume may need rework for these roles.");
  }
  if ((counts.apply || 0) < TARGETS.applications_sent) {
    signals.push("\ud83d\udfe1 Below target on applications. Block focused time next week.");
  }
  if (completionPct >= 80) {
    signals.push("\ud83d\udfe2 Great execution this week. Momentum compounds \u2014 keep it up.");
  }

  // --- Assemble ---
  const weekLabel = `Week of ${new Date(weekStartStr).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
  const activitySection = networkGrowthSection({ newConnections: newConnections.length, referralChanges, materialsCreated: newMaterials.length });
  const body = summarySection + scorecardSection(counts) + deltaSection + pipelineSection + activitySection + signalBox(signals)
    + `<p style="color: #9ca3af; font-size: 12px; text-align: center;">${completedCount}/${total} tasks completed (${completionPct}%)</p>`;

  const html = emailWrapper("Weekly Review", weekLabel, body);

  // Subject line — pick most notable event
  let notable = `${completionPct}% completion`;
  if (moved.offer > 0) notable = `${moved.offer} new offer${moved.offer !== 1 ? "s" : ""}`;
  else if (moved.interview > 0) notable = `${moved.interview} new interview${moved.interview !== 1 ? "s" : ""}`;
  else if (moved.screen > 0) notable = `${moved.screen} new screen${moved.screen !== 1 ? "s" : ""}`;

  const subject = `Week of ${new Date(weekStartStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${completedCount}/${total} tasks done \u2014 ${notable}`;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
