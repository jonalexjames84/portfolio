import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { localDateStr } from "@/lib/job-search/dates";
import { CHANNELS, type Channel } from "@/lib/job-search/types";

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

  // Empty string clears the attribution back to unattributed. Anything else is
  // validated here as well as by the CHECK constraint, so a bad value fails as
  // a 400 rather than a 500 from Postgres.
  if (body.channel !== undefined) {
    if (body.channel === null || body.channel === "") {
      updates.channel = null;
    } else if (CHANNELS.includes(body.channel as Channel)) {
      updates.channel = body.channel;
    } else {
      return NextResponse.json(
        { error: `Unknown channel: ${body.channel}` },
        { status: 400 }
      );
    }
  }

  updates.last_update = localDateStr(new Date());

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
