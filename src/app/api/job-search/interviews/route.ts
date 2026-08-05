import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { localDateStr } from "@/lib/job-search/dates";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const company = searchParams.get("company");
  const upcoming = searchParams.get("upcoming");

  let query = supabase.from("job_interviews").select("*");

  if (company) query = query.eq("company", company);
  if (upcoming === "true") {
    query = query.gte("date", localDateStr(new Date())).order("date", { ascending: true });
  } else {
    query = query.order("date", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("job_interviews")
    .insert(body)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: data }, { status: 201 });
}
