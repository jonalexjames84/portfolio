import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import { mapPool } from "@/lib/job-search/ats";
import {
  checkListing,
  extractListingUrl,
  titlesDiverge,
} from "@/lib/job-search/listing-liveness";
import { localDateStr } from "@/lib/job-search/dates";

/**
 * Re-check saved postings and retire the ones whose reqs have closed.
 *
 * The ingest route only ever sees live boards, so freshly ingested rows are
 * fine. The rot happens to rows that sit in `saved` for weeks while the req
 * quietly closes underneath them — which is how the 2026-08-04 queue ended up
 * with tailored cover letters written against four dead postings, one of them
 * closed for eight months.
 *
 * Only `saved` rows are touched. Once you've applied, the posting coming down
 * usually means the req is progressing, not that your application evaporated.
 *
 * The liveness logic lives in @/lib/job-search/listing-liveness and is shared
 * verbatim with the verifying-job-listings skill CLI, so the nightly sweep and
 * the hand-run check can never disagree.
 */

const DEFAULT_LIMIT = 60;
const CONCURRENCY = 6;
const FETCH_TIMEOUT_MS = 20_000;

export async function GET(request: NextRequest) {
  return run(request);
}
export async function POST(request: NextRequest) {
  return run(request);
}

/** checkListing with a timeout, so one hung board cannot stall the sweep. */
function probe(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const timed: typeof fetch = (input, init) =>
    fetch(input, { ...init, signal: controller.signal });
  return checkListing(url, timed).finally(() => clearTimeout(timer));
}

async function run(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const dryRun = params.get("dryRun") === "1";
  const limit = Math.min(Number(params.get("limit")) || DEFAULT_LIMIT, 200);

  // Oldest-checked first, so repeated runs sweep the whole backlog.
  //
  // Deliberately NOT filtered on `job_url is not null`: the scraper often leaves
  // job_url null and buries the link in notes, and those rows rot the longest
  // precisely because nothing ever checks them.
  const { data: rows, error } = await supabase
    .from("job_pipeline_entries")
    .select("id, company, role, job_url, notes, last_update")
    .eq("status", "saved")
    .order("last_update", { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const all = rows || [];
  const resolved = all.map((row) => ({
    row,
    url: extractListingUrl(row.job_url as string | null, row.notes as string | null),
  }));

  // No URL anywhere means unverifiable, not closed. Reported, never retired.
  const unlinked = resolved.filter((r) => !r.url);
  const checked = resolved.filter((r) => r.url);

  const results = await mapPool(checked, CONCURRENCY, async ({ row, url }) => {
    const verdict = await probe(url as string);
    return { row, url: url as string, ...verdict };
  });

  const dead = results.filter((r) => r.liveness === "dead");
  const unknown = results.filter((r) => r.liveness === "unknown");
  const today = localDateStr(new Date());

  if (!dryRun) {
    for (const d of dead) {
      await supabase
        .from("job_pipeline_entries")
        .update({
          status: "passed",
          last_update: today,
          notes: `CLOSED — auto-verified ${today}: ${d.reason}. ${d.row.notes || ""}`.trim(),
        })
        .eq("id", d.row.id);
    }
    // Touch the survivors so the oldest-first sweep advances instead of
    // re-checking the same rows every run. Promote a notes-derived URL onto
    // job_url at the same time, so the row is cheap to check next sweep.
    for (const r of results.filter((x) => x.liveness === "live")) {
      const patch: Record<string, string> = { last_update: today };
      if (!r.row.job_url) patch.job_url = r.url;
      await supabase.from("job_pipeline_entries").update(patch).eq("id", r.row.id);
    }
  }

  return NextResponse.json({
    dryRun,
    checked: checked.length,
    live: results.length - dead.length - unknown.length,
    dead: dead.length,
    unknown: unknown.length,
    retired: dead.map((d) => ({
      company: d.row.company,
      role: d.row.role,
      url: d.url,
      reason: d.reason,
    })),
    // Surfaced so a board-wide outage is visible rather than silently ignored.
    unverified: unknown.map((u) => ({
      company: u.row.company,
      role: u.row.role,
      reason: u.reason,
    })),
    // Live, but the ATS calls it something else. Never auto-changed — a title
    // drift can be a harmless rename or a link pointing at an entirely
    // different job, and only a human can tell which. The 2026-08-04 queue had
    // an "Anthropic, PM Claude Code" row whose req was "PM, Claude Tag"; every
    // liveness check passed while the cover letter argued for the wrong role.
    titleMismatches: results
      .filter((r) => r.liveness === "live" && titlesDiverge(r.row.role as string | null, r.title))
      .map((r) => ({
        company: r.row.company,
        queuedAs: r.row.role,
        atsTitle: r.title,
        url: r.url,
      })),
    // Rows with no URL at all can never be auto-verified. Left untouched and
    // reported, so they show up as a data-quality problem instead of silently
    // aging into the pipeline as if they were still open.
    unlinked: unlinked.map((u) => ({ company: u.row.company, role: u.row.role })),
  });
}
