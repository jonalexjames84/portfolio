import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { localDateStr } from "@/lib/job-search/dates";
import { canonicalJobKey } from "@/lib/job-search/application-guard";
import { resolvePipelineEffect } from "@/lib/job-search/task-completion";

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

  const pipeline = await syncPipelineStatus(data, newDone);

  return NextResponse.json({ task: data, pipeline });
}

interface TaskRow {
  category: string;
  company: string | null;
  link: string | null;
}

/**
 * Move the pipeline row the task points at, so ticking "Apply to Zynga" is the
 * same act as marking Zynga applied.
 *
 * Matching is by `dedupe_key` rather than raw URL: one Greenhouse req has at
 * least three URL spellings and the task's link is whichever the queue stored.
 * Falls back to an exact `job_url` match for rows predating the canonical key.
 *
 * Never throws. A task must still tick even when nothing matches — a silent
 * no-op is recoverable, a 500 on a checkbox is not.
 */
async function syncPipelineStatus(task: TaskRow, newDone: boolean) {
  if (task.category !== "apply" || !task.link) return null;

  try {
    const key = canonicalJobKey({
      company: task.company || "",
      role: "",
      jobUrl: task.link,
    });

    const { data: entry } = await supabase
      .from("job_pipeline_entries")
      .select("id, status")
      .or(`dedupe_key.eq.${key},job_url.eq.${task.link}`)
      .limit(1)
      .maybeSingle();

    const effect = resolvePipelineEffect({
      category: task.category,
      done: newDone,
      entryStatus: entry?.status ?? null,
      today: localDateStr(new Date()),
    });
    if (!entry || !effect) return null;

    const { error } = await supabase
      .from("job_pipeline_entries")
      .update({ ...effect, last_update: localDateStr(new Date()) })
      .eq("id", entry.id);
    if (error) return null;

    return { id: entry.id, status: effect.status };
  } catch {
    return null;
  }
}
