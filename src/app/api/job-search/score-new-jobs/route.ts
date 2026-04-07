import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import { computeAutoFitScore } from "@/lib/job-search/fit-score";
import type { PipelineEntry } from "@/lib/job-search/types";

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .select("*")
    .or("fit_score_auto.is.null,fit_score_auto.eq.0");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = (data || []) as PipelineEntry[];
  let scored = 0;

  for (const entry of entries) {
    const { total, breakdown } = computeAutoFitScore(entry);
    const { error: updErr } = await supabase
      .from("job_pipeline_entries")
      .update({ fit_score_auto: total, score_breakdown: breakdown })
      .eq("id", entry.id);
    if (!updErr) scored++;
  }

  return NextResponse.json({ scored, total: entries.length });
}
