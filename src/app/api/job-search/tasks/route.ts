import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { localDateStr } from "@/lib/job-search/dates";

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
  const today = request.nextUrl.searchParams.get("date") || localDateStr(new Date());
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

  // 5. Resolve blocked status — a task is blocked if its blocker exists and isn't done
  const allTaskIds = new Set(visible.map((t) => t.id));
  const blockerIds = visible
    .filter((t) => t.blocked_by && !allTaskIds.has(t.blocked_by))
    .map((t) => t.blocked_by);

  // Fetch any blockers not in the visible set
  let externalBlockers: Record<string, boolean> = {};
  if (blockerIds.length > 0) {
    const { data: blockers } = await supabase
      .from("job_daily_tasks")
      .select("id, done")
      .in("id", blockerIds);
    for (const b of blockers || []) {
      externalBlockers[b.id] = b.done;
    }
  }

  const tasksWithBlockedStatus = visible.map((t) => {
    if (!t.blocked_by) return { ...t, is_blocked: false };
    // Check if blocker is in visible set
    const visibleBlocker = visible.find((v) => v.id === t.blocked_by);
    if (visibleBlocker) return { ...t, is_blocked: !visibleBlocker.done };
    // Check external blockers
    if (t.blocked_by in externalBlockers) return { ...t, is_blocked: !externalBlockers[t.blocked_by] };
    // Blocker was deleted — not blocked
    return { ...t, is_blocked: false };
  });

  const actionable = tasksWithBlockedStatus.filter((t) => !t.is_blocked);
  const allDone = actionable.length > 0 && actionable.every((t) => t.done);

  return NextResponse.json({
    tasks: tasksWithBlockedStatus,
    futurePulled,
    backlogCount,
    allDone,
  });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized();

  const body = await request.json();
  const tasks = Array.isArray(body) ? body : [body];

  const rows = tasks.map((t: { task: string; category: string; impact?: string; company?: string; link?: string; date?: string; blocked_by?: string }) => ({
    task: t.task,
    category: t.category,
    impact: t.impact || "medium",
    company: t.company || null,
    link: t.link || null,
    date: t.date || localDateStr(new Date()),
    blocked_by: t.blocked_by || null,
  }));

  const { data, error } = await supabase.from("job_daily_tasks").insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data }, { status: 201 });
}
