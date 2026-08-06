import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAuthorized } from "@/lib/job-search/request-auth";

export async function GET(request: NextRequest) {
  // Cover letters and resumes are personal material. The middleware gate steps
  // aside whenever an authorization header is present, so this route has to
  // verify the caller itself.
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const company = searchParams.get("company");
  const type = searchParams.get("type");

  let query = supabase.from("job_materials").select("*").order("created_at", { ascending: false });

  if (company) query = query.eq("company", company);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: data || [] });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("job_materials")
    .insert(body)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ materials: data }, { status: 201 });
}
