import { supabase } from "@/lib/supabase";
import { buildMarketBrief, type MarketBrief } from "./market-brief";
import { isTechIndustry, type BoardSummary, type ChartApp, type FormDFiling } from "./market-sources";

/** A snapshot older than this is stale; the email says so instead of passing it off as today's. */
const MAX_SNAPSHOT_AGE_DAYS = 2;

export interface LoadedMarketBrief {
  brief: MarketBrief;
  snapshotDate: string;
  boardErrors: string[];
}

/**
 * Everything the Market Radar section needs, read from Supabase. Returns null
 * when there is no recent snapshot, so the rest of the daily email still sends.
 */
export async function loadMarketBrief(now = new Date()): Promise<LoadedMarketBrief | null> {
  const { data: snap } = await supabase
    .from("job_market_snapshots")
    .select("snapshot_date, boards, apps, board_errors")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!snap) return null;
  const age = (now.getTime() - Date.parse(snap.snapshot_date + "T12:00:00Z")) / 86_400_000;
  if (age > MAX_SNAPSHOT_AGE_DAYS) return null;

  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const [{ data: filingRows }, { data: connections }, { data: applications }] = await Promise.all([
    supabase.from("job_market_filings").select("*").gte("filed_on", since),
    supabase.from("job_connections").select("name, company_name, linkedin_url, next_action"),
    supabase.from("job_applications").select("company, status, submitted_at, created_at"),
  ]);

  const filings: FormDFiling[] = (filingRows || [])
    .filter((r) => isTechIndustry(r.industry))
    .map((r) => ({
      accession: r.accession, company: r.company, cik: r.cik, filedOn: r.filed_on, industry: r.industry,
      city: r.city, state: r.state, amountSold: r.amount_sold == null ? null : Number(r.amount_sold),
      people: r.people || [], filingUrl: r.filing_url,
    }));

  return {
    brief: buildMarketBrief({
      boards: snap.boards as BoardSummary[],
      apps: snap.apps as ChartApp[],
      filings,
      connections: connections || [],
      applications: applications || [],
      now,
    }),
    snapshotDate: snap.snapshot_date,
    boardErrors: snap.board_errors || [],
  };
}
