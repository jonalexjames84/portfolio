import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.JOB_SEARCH_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: tasks } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .eq("date", today)
    .order("impact", { ascending: true });

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ error: "No tasks for today" }, { status: 404 });
  }

  const categoryEmoji: Record<string, string> = {
    apply: "\ud83d\udcdd",
    outreach: "\ud83d\udce7",
    follow_up: "\ud83d\udd04",
    content: "\u270d\ufe0f",
    prep: "\ud83d\udcda",
    admin: "\u2699\ufe0f",
  };

  const impactColor: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#6b7280",
  };

  const taskRows = tasks.map((t) => `
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
  `).join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="padding: 24px 0;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">Today's Game Plan</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        ${taskRows}
      </table>
      <div style="padding: 16px 0; text-align: center;">
        <a href="https://portfolio.jonnymartin.blog/dashboard/job-search" style="display: inline-block; background: #0d9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard</a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 8px;">${tasks.length} tasks &middot; Check them off as you go</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "Job Search <onboarding@resend.dev>",
    to: "jonalexjames@gmail.com",
    subject: `${tasks.length} tasks today \u2014 ${tasks.filter((t) => t.impact === "high").length} high impact`,
    html,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true, taskCount: tasks.length });
}
