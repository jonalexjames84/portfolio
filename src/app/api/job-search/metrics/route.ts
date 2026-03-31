import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const { data: currentWeek } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .eq("week_start", weekStartStr)
    .single();

  if (!currentWeek) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const { data: tasks } = await supabase
      .from("job_daily_tasks")
      .select("category, done")
      .gte("date", weekStartStr)
      .lte("date", weekEndStr)
      .eq("done", true);

    const counts = {
      applications_sent: 0,
      outreach_sent: 0,
      follow_ups_sent: 0,
      linkedin_posts: 0,
      conversations: 0,
    };

    for (const t of tasks || []) {
      if (t.category === "apply") counts.applications_sent++;
      if (t.category === "outreach") counts.outreach_sent++;
      if (t.category === "follow_up") counts.follow_ups_sent++;
      if (t.category === "linkedin_post") counts.linkedin_posts++;
    }

    return NextResponse.json({
      current: { week_start: weekStartStr, ...counts, phone_screens: 0, interviews: 0, offers: 0 },
      targets: { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 },
    });
  }

  const fourWeeksAgo = new Date(weekStart);
  fourWeeksAgo.setDate(weekStart.getDate() - 28);

  const { data: history } = await supabase
    .from("job_weekly_metrics")
    .select("*")
    .gte("week_start", fourWeeksAgo.toISOString().split("T")[0])
    .order("week_start", { ascending: true });

  return NextResponse.json({
    current: currentWeek,
    history: history || [],
    targets: { applications_sent: 5, outreach_sent: 5, follow_ups_sent: 3, linkedin_posts: 3, conversations: 2 },
  });
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.JOB_SEARCH_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("job_weekly_metrics")
    .upsert(body, { onConflict: "week_start" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ metrics: data });
}
