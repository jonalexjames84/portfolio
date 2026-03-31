import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.JOB_SEARCH_API_KEY}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const industry = searchParams.get("industry");
  const sort = searchParams.get("sort") || "rank";

  let query = supabase.from("job_target_companies").select("*");

  if (status) query = query.eq("hiring_status", status);
  if (industry) query = query.eq("industry", industry);

  const ascending = sort !== "updated_at";
  query = query.order(sort === "updated_at" ? "updated_at" : sort === "name" ? "name" : "rank", {
    ascending,
    nullsFirst: false,
  });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ companies: data || [] });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body) ? body : [body];

  const { data, error } = await supabase
    .from("job_target_companies")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ companies: data }, { status: 201 });
}
