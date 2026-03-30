import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

const TARGETS = { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 };

function checkAuth(request: NextRequest): boolean {
  // Vercel Cron sends this header
  if (request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`) return true;
  // Scheduled agents use the API key
  if (request.headers.get("authorization") === `Bearer ${process.env.JOB_SEARCH_API_KEY}`) return true;
  return false;
}

export async function GET(request: NextRequest) {
  return handleReview(request);
}

export async function POST(request: NextRequest) {
  return handleReview(request);
}

async function handleReview(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = new Date(weekStart.getTime() + 6 * 86400000).toISOString().split("T")[0];

  const { data: tasks } = await supabase
    .from("job_daily_tasks")
    .select("category, done")
    .gte("date", weekStartStr)
    .lte("date", weekEndStr);

  const completed = (tasks || []).filter((t) => t.done);
  const total = (tasks || []).length;

  const counts: Record<string, number> = { apply: 0, outreach: 0, follow_up: 0, content: 0, prep: 0, admin: 0 };
  for (const t of completed) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }

  const { data: pipeline } = await supabase.from("job_pipeline_entries").select("status");
  const statuses = (pipeline || []).map((p) => p.status);
  const funnel = {
    applied: statuses.filter((s) => s === "applied").length,
    screen: statuses.filter((s) => s === "screen").length,
    interview: statuses.filter((s) => s === "interview").length,
    offer: statuses.filter((s) => s === "offer").length,
  };

  function bar(actual: number, target: number, label: string): string {
    const pct = Math.min(Math.round((actual / target) * 100), 100);
    const color = pct >= 100 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
    return `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
          <span style="color: #374151; font-weight: 500;">${label}</span>
          <span style="color: ${color}; font-weight: 700;">${actual}/${target}</span>
        </div>
        <div style="background: #f3f4f6; border-radius: 6px; height: 8px; overflow: hidden;">
          <div style="background: ${color}; height: 100%; width: ${pct}%; border-radius: 6px;"></div>
        </div>
      </div>
    `;
  }

  const signals: string[] = [];
  const totalApplied = funnel.applied + funnel.screen + funnel.interview + funnel.offer;
  const screenRate = totalApplied > 0 ? ((funnel.screen + funnel.interview + funnel.offer) / totalApplied) * 100 : 0;

  if (totalApplied >= 10 && screenRate < 10) {
    signals.push("\ud83d\udd34 Application\u2192Screen rate is below 10%. Your resume may need rework for these roles.");
  }
  if (counts.apply < TARGETS.applications_sent) {
    signals.push("\ud83d\udfe1 Below target on applications. Block 1 hour tomorrow morning for focused applying.");
  }
  if (completed.length / Math.max(total, 1) > 0.8) {
    signals.push("\ud83d\udfe2 Great execution this week. Momentum compounds \u2014 keep it up.");
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="padding: 24px 0;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">Weekly Review</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Week of ${new Date(weekStartStr).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px;">Activity vs Targets</h2>
        ${bar(counts.apply, TARGETS.applications_sent, "Applications")}
        ${bar(counts.outreach, TARGETS.outreach_sent, "Outreach")}
        ${bar(counts.follow_up, TARGETS.follow_ups_sent, "Follow-ups")}
        ${bar(counts.content, TARGETS.linkedin_posts, "LinkedIn Posts")}
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">Pipeline</h2>
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

      ${signals.length > 0 ? `
      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 8px;">Signals</h2>
        ${signals.map((s) => `<p style="color: #78350f; font-size: 13px; margin: 4px 0;">${s}</p>`).join("")}
      </div>
      ` : ""}

      <div style="padding: 16px 0; text-align: center;">
        <a href="https://portfolio.jonnymartin.blog/dashboard/job-search" style="display: inline-block; background: #0d9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Full Dashboard</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; text-align: center;">${completed.length}/${total} tasks completed this week (${total > 0 ? Math.round((completed.length / total) * 100) : 0}%)</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject: `Week review: ${completed.length}/${total} tasks \u2014 ${funnel.interview} interviews active`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
