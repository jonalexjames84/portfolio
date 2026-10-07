import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkAuth } from "@/lib/email-templates";
import { fetchFormD, fetchFormDIndex } from "@/lib/job-search/market-sources";
import { withRunLog } from "@/lib/job-search/run-log-db";

export const maxDuration = 300;

/** How far back the brief looks for funding. */
const LOOKBACK_DAYS = 30;
/** Stop well inside maxDuration; the next run picks up where this one left off. */
const TIME_BUDGET_MS = 240_000;

/**
 * Market Radar: reads SEC Form D filings day by day. A day is marked done only
 * once every filing on it is saved, so the first run's 30-day backfill can
 * spread across several runs without skipping or repeating work.
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

  return withRunLog("collect-filings", async (counts) => {
    const started = Date.now();
    const days: string[] = [];
    for (let i = 1; i <= LOOKBACK_DAYS; i++) {
      const d = new Date(Date.now() - i * 86_400_000);
      if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days.push(d.toISOString().slice(0, 10));
    }

    const { data: done } = await supabase.from("job_market_filing_days").select("day").gte("day", days[days.length - 1]);
    const doneDays = new Set((done || []).map((r) => r.day as string));
    const { data: saved } = await supabase.from("job_market_filings").select("accession").gte("filed_on", days[days.length - 1]);
    const savedAccessions = new Set((saved || []).map((r) => r.accession as string));

    let filingsSaved = 0, daysRead = 0, outOfTime = false;
    for (const day of days.filter((d) => !doneDays.has(d))) {
      const index = await fetchFormDIndex(day);
      if (!index) continue; // holiday, or not published yet: try again next run

      for (const entry of index) {
        if (Date.now() - started > TIME_BUDGET_MS) { outOfTime = true; break; }
        const accession = entry.path.split("/").pop()!.replace(".txt", "");
        if (savedAccessions.has(accession)) continue;
        const f = await fetchFormD(entry, day);
        if (!f) continue;
        const { error } = await supabase.from("job_market_filings").upsert({
          accession: f.accession, company: f.company, cik: f.cik, filed_on: f.filedOn, industry: f.industry,
          city: f.city, state: f.state, amount_sold: f.amountSold, people: f.people, filing_url: f.filingUrl,
        });
        if (!error) { filingsSaved++; savedAccessions.add(accession); }
      }
      if (outOfTime) break;
      await supabase.from("job_market_filing_days").upsert({ day, filings: index.length });
      daysRead++;
    }

    counts.filingsSaved = filingsSaved;
    counts.daysRead = daysRead;
    return NextResponse.json({ filingsSaved, daysRead, outOfTime });
  });
}
