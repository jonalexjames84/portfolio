import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_briefings")
    .select("*")
    .eq("date", date)
    .single();

  if (error) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_briefings")
    .upsert(
      {
        date: body.date || today,
        part: body.part || "full",
        top_roles: body.top_roles || [],
        other_roles: body.other_roles || [],
        networking_html: body.networking_html || null,
        coaching_html: body.coaching_html || null,
        raw_markdown: body.raw_markdown || null,
      },
      { onConflict: "date" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
