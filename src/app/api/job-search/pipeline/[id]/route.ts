import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.status) updates.status = body.status;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.job_url !== undefined) updates.job_url = body.job_url;
  if (body.fit_score !== undefined) updates.fit_score = body.fit_score;
  if (body.ats_result !== undefined) updates.ats_result = body.ats_result;
  updates.last_update = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
