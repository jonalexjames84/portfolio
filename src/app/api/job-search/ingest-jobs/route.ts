import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import { computeAutoFitScore } from "@/lib/job-search/fit-score";
import { fetchBoard, mapPool, type AtsBoard, type AtsType } from "@/lib/job-search/ats";
import { canonicalJobKey, normalizeCompany } from "@/lib/job-search/application-guard";
import type { PipelineEntry } from "@/lib/job-search/types";
import { localDateStr } from "@/lib/job-search/dates";

export const maxDuration = 300;

/**
 * Drop only genuinely zombie postings. Freshness is NOT the "is this new to Jon"
 * test — dedupe against job_url is, and it's exact. Good roles routinely sit open
 * for months (Anthropic's PM, Developer Productivity was published 77 days before
 * this was written and is still live), so a tight window would hide the backlog.
 */
const DEFAULT_SINCE_DAYS = 180;
/**
 * Cap inserts per run. The first run has a whole universe of open roles to draw
 * from, so this drips the backlog in at ~25 best-scoring roles a day rather than
 * dumping hundreds into one brief.
 */
const DEFAULT_LIMIT = 25;
/** Ignore anything the scorer rates below this. */
const DEFAULT_MIN_SCORE = 40;

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

  const params = request.nextUrl.searchParams;
  const sinceDays = Number(params.get("sinceDays")) || DEFAULT_SINCE_DAYS;
  const limit = Number(params.get("limit")) || DEFAULT_LIMIT;
  const minScore = params.get("minScore") != null ? Number(params.get("minScore")) : DEFAULT_MIN_SCORE;
  const dryRun = params.get("dryRun") === "1";

  // 1. Target companies that publish to a board we can read.
  const { data: companies, error: compErr } = await supabase
    .from("job_target_companies")
    .select("name, ats_type, ats_token, industry, stage")
    .not("ats_type", "is", null)
    .not("ats_token", "is", null);

  if (compErr) {
    return NextResponse.json({ error: compErr.message }, { status: 500 });
  }

  const boards: AtsBoard[] = (companies || []).map((c) => ({
    company: c.name,
    atsType: c.ats_type as AtsType,
    atsToken: c.ats_token as string,
    industry: c.industry,
    stage: c.stage,
  }));

  if (boards.length === 0) {
    return NextResponse.json(
      { error: "No target companies have ats_type/ats_token set. Run the ATS migration." },
      { status: 500 }
    );
  }

  // 2. Everything already in the pipeline, so we never re-add a posting.
  const { data: existingRows } = await supabase
    .from("job_pipeline_entries")
    .select("job_url, company, role, external_id");

  const seenUrls = new Set(
    (existingRows || []).map((r) => r.job_url).filter(Boolean) as string[]
  );
  const seenPairs = new Set(
    (existingRows || []).map((r) => `${lc(r.company)}|${lc(r.role)}`)
  );

  // Canonical identity, which the raw-URL set above cannot supply: the same
  // Greenhouse req reaches us as job-boards.greenhouse.io/{board}/jobs/{id} from
  // one source and {employer}.com/careers?gh_jid={id} from another. Both are one
  // req and must collapse to one row.
  const seenKeys = new Set(
    (existingRows || []).map((r) =>
      canonicalJobKey({
        company: r.company,
        role: r.role,
        jobUrl: r.job_url,
        externalId: r.external_id,
      })
    )
  );

  // 3. Pull every board in parallel.
  const cutoff = Date.now() - sinceDays * 86400000;
  const boardResults = await mapPool(boards, 8, async (board) => {
    try {
      const postings = await fetchBoard(board);
      return { board, postings, ok: true };
    } catch {
      return { board, postings: [], ok: false };
    }
  });

  const failedBoards = boardResults.filter((r) => !r.ok).map((r) => r.board.company);

  // 4. Normalise into pipeline candidates, filtering stale and already-seen.
  type Candidate = {
    company: string;
    role: string;
    job_url: string;
    location: string;
    jd_text: string;
    industry: string | null;
    stage: string | null;
    external_id: string;
    posted_at: string | null;
    score: number;
    breakdown: ReturnType<typeof computeAutoFitScore>["breakdown"];
    dedupe_key: string;
    company_key: string;
  };

  const candidates: Candidate[] = [];
  let totalFetched = 0;
  let skippedStale = 0;
  let skippedDuplicate = 0;

  for (const { board, postings } of boardResults) {
    for (const p of postings) {
      totalFetched++;

      if (p.postedAt) {
        const t = new Date(p.postedAt).getTime();
        if (Number.isFinite(t) && t < cutoff) {
          skippedStale++;
          continue;
        }
      }

      const pairKey = `${lc(board.company)}|${lc(p.title)}`;
      const dedupeKey = canonicalJobKey({
        company: board.company,
        role: p.title,
        jobUrl: p.url,
        externalId: p.externalId,
        atsType: board.atsType,
      });
      if (seenUrls.has(p.url) || seenPairs.has(pairKey) || seenKeys.has(dedupeKey)) {
        skippedDuplicate++;
        continue;
      }
      seenUrls.add(p.url);
      seenPairs.add(pairKey);
      seenKeys.add(dedupeKey);

      const entry = {
        role: p.title,
        jd_text: p.description,
        industry: board.industry ?? null,
        stage: board.stage ?? null,
        location: p.location,
      } as PipelineEntry;

      const { total, breakdown } = computeAutoFitScore(entry);

      candidates.push({
        company: board.company,
        role: p.title,
        job_url: p.url,
        location: p.location,
        jd_text: p.description.slice(0, 20_000),
        industry: board.industry ?? null,
        stage: board.stage ?? null,
        external_id: p.externalId,
        posted_at: p.postedAt,
        score: total,
        breakdown,
        dedupe_key: dedupeKey,
        company_key: normalizeCompany(board.company),
      });
    }
  }

  // 5. Best-scoring first, then cap.
  const selected = candidates
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      boardsChecked: boards.length,
      failedBoards,
      totalFetched,
      skippedStale,
      skippedDuplicate,
      candidates: candidates.length,
      wouldInsert: selected.length,
      preview: selected.slice(0, 15).map((c) => ({
        company: c.company,
        role: c.role,
        score: c.score,
        location: c.location,
        url: c.job_url,
      })),
    });
  }

  // 6. Insert as saved pipeline entries — the daily brief reads exactly this.
  // last_update is a `date` column, not a timestamp.
  const today = localDateStr(new Date());
  const rows = selected.map((c) => ({
    company: c.company,
    role: c.role,
    status: "saved",
    job_url: c.job_url,
    location: c.location,
    jd_text: c.jd_text,
    industry: c.industry,
    stage: c.stage,
    fit_score_auto: c.score,
    score_breakdown: c.breakdown,
    source: "ats_ingest",
    external_id: c.external_id,
    posted_at: c.posted_at,
    last_update: today,
    dedupe_key: c.dedupe_key,
    company_key: c.company_key,
  }));

  let inserted = 0;
  const insertErrors: string[] = [];

  // Chunked so one bad row can't cost the whole run.
  for (let i = 0; i < rows.length; i += 25) {
    const chunk = rows.slice(i, i + 25);
    const { data, error } = await supabase
      .from("job_pipeline_entries")
      // Conflict on the canonical key, not the raw URL. The URL index let one
      // req in three times under three spellings; dedupe_key is the same value
      // no matter which board handed it to us.
      .upsert(chunk, { onConflict: "dedupe_key", ignoreDuplicates: true })
      .select("id");
    if (error) {
      insertErrors.push(error.message);
    } else {
      inserted += data?.length ?? 0;
    }
  }

  return NextResponse.json({
    boardsChecked: boards.length,
    failedBoards,
    totalFetched,
    skippedStale,
    skippedDuplicate,
    candidates: candidates.length,
    inserted,
    insertErrors,
    topInserted: selected.slice(0, 10).map((c) => `${c.company} — ${c.role} (${c.score})`),
  });
}

function lc(s: string | null | undefined): string {
  return (s || "").toLowerCase().trim();
}
