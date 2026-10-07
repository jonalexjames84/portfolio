import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import { mapPool, type AtsType } from "@/lib/job-search/ats";
import { fetchAllPostings, fetchAppCharts, summarizeBoard, type BoardSummary } from "@/lib/job-search/market-sources";
import { localDateStr } from "@/lib/job-search/dates";
import { withRunLog } from "@/lib/job-search/run-log-db";

export const maxDuration = 300;

/**
 * Market Radar collector: reads every tracked board and the App Store charts,
 * and saves one snapshot row for today. The 9am email builds its Market Radar
 * section from the latest row. Runs before the email.
 */
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

  return withRunLog("collect-market", async (counts) => {
    const now = new Date();
    const { data: companies, error } = await supabase
      .from("job_target_companies")
      .select("name, ats_type, ats_token, industry")
      .not("ats_type", "is", null)
      .not("ats_token", "is", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const errors: string[] = [];
    const boards = (
      await mapPool(companies || [], 12, async (c): Promise<BoardSummary | null> => {
        const postings = await fetchAllPostings(c.ats_type as AtsType, c.ats_token as string);
        if (!postings) { errors.push(c.name); return null; }
        return summarizeBoard(c.name, c.industry, postings, now);
      })
    ).filter((b): b is BoardSummary => b !== null);

    const apps = await fetchAppCharts();

    const row = { snapshot_date: localDateStr(now), taken_at: now.toISOString(), boards, apps, board_errors: errors };
    const { error: upsertErr } = await supabase.from("job_market_snapshots").upsert(row);
    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

    counts.boards = boards.length;
    counts.boardErrors = errors.length;
    counts.pmRoles = boards.reduce((s, b) => s + b.pmRoles.length, 0);
    counts.apps = apps.length;
    return NextResponse.json({ snapshot: row.snapshot_date, boards: boards.length, boardErrors: errors, apps: apps.length });
  });
}
