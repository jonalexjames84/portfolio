import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_daily_tasks")
    .select("*")
    .eq("date", date)
    .order("impact", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data });
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
