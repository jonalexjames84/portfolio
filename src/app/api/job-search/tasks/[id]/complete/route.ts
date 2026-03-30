import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check current state to toggle
  const { data: current } = await supabase
    .from("job_daily_tasks")
    .select("done")
    .eq("id", id)
    .single();

  const newDone = !current?.done;

  const { data, error } = await supabase
    .from("job_daily_tasks")
    .update({ done: newDone, completed_at: newDone ? new Date().toISOString() : null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}
