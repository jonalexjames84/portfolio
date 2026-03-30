import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("job_pipeline_entries")
    .select("*")
    .order("last_update", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const entries = data || [];
  const funnel = {
    applied: entries.filter((e) => e.status === "applied").length,
    screen: entries.filter((e) => e.status === "screen").length,
    interview: entries.filter((e) => e.status === "interview").length,
    offer: entries.filter((e) => e.status === "offer").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
    passed: entries.filter((e) => e.status === "passed").length,
  };

  const total = entries.length;
  const conversionRates = {
    app_to_screen: funnel.applied > 0 ? Math.round(((funnel.screen + funnel.interview + funnel.offer) / (funnel.applied + funnel.screen + funnel.interview + funnel.offer)) * 100) : 0,
    screen_to_interview: (funnel.screen + funnel.interview + funnel.offer) > 0 ? Math.round(((funnel.interview + funnel.offer) / (funnel.screen + funnel.interview + funnel.offer)) * 100) : 0,
    interview_to_offer: (funnel.interview + funnel.offer) > 0 ? Math.round((funnel.offer / (funnel.interview + funnel.offer)) * 100) : 0,
  };

  return NextResponse.json({ funnel, conversionRates, total, entries });
}
