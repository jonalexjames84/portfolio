import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

const MAX_TASKS = 5;

const IMPACT_ORDER = ["high", "medium", "low"];

function sortByImpactThenDate(a: { impact: string; date: string }, b: { impact: string; date: string }) {
  const impactDiff = IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact);
  if (impactDiff !== 0) return impactDiff;
  return a.date.localeCompare(b.date); // oldest first
}

export async function GET(request: NextRequest) {
  const today = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];
  const pullFuture = request.nextUrl.searchParams.get("pull_future") === "true";

  // 1. Today's tasks (done and undone)
  const { data: todayTasks, error: todayErr } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .eq("date", today);

  if (todayErr) {
    return NextResponse.json({ error: todayErr.message }, { status: 500 });
  }

  // 2. Unfinished tasks from past days
  const { data: pastUnfinished } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .lt("date", today)
    .eq("done", false)
    .order("date", { ascending: true });

  // 3. Combine: today's tasks first, then backfill from past, cap at MAX_TASKS
  const todaySorted = (todayTasks || []).sort(sortByImpactThenDate);
  const pastSorted = (pastUnfinished || []).sort(sortByImpactThenDate);

  const visible = [...todaySorted];
  const remaining = [...pastSorted];

  while (visible.length < MAX_TASKS && remaining.length > 0) {
    visible.push(remaining.shift()!);
  }

  // Count how many past tasks are still waiting beyond the cap
  const backlogCount = remaining.length;

  // 4. If pulling future tasks (user opted in)
  let futurePulled: typeof visible = [];
  if (pullFuture) {
    const { data: futureUndone } = await supabase
      .from("job_daily_tasks")
      .select("*")
      .gt("date", today)
      .eq("done", false)
      .order("date", { ascending: true })
      .order("impact", { ascending: true })
      .limit(1);

    futurePulled = futureUndone || [];
  }

  return NextResponse.json({
    tasks: visible,
    futurePulled,
    backlogCount,
    allDone: visible.length > 0 && visible.every((t) => t.done),
  });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const body = await request.json();
  const tasks = Array.isArray(body) ? body : [body];

  const rows = tasks.map((t: { task: string; category: string; impact?: string; company?: string; link?: string; date?: string }) => ({
    task: t.task,
    category: t.category,
    impact: t.impact || "medium",
    company: t.company || null,
    link: t.link || null,
    date: t.date || new Date().toISOString().split("T")[0],
  }));

  const { data, error } = await supabase.from("job_daily_tasks").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data }, { status: 201 });
}
