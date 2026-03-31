import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const companyId = searchParams.get("company_id");
  const needsFollowup = searchParams.get("needs_followup");

  let query = supabase.from("job_connections").select("*").order("updated_at", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (needsFollowup === "true") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query = query.lt("last_contact", sevenDaysAgo.toISOString().split("T")[0]).not("next_action", "is", null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase
    .from("job_connections")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connections: data }, { status: 201 });
}
