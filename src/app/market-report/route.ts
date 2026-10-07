import { supabase } from "@/lib/supabase";
import { buildMarketReport, renderMarketReport, renderMarketReportUnavailable } from "@/lib/job-search/market-report";
import { isTechIndustry, type BoardSummary, type ChartApp, type FormDFiling } from "@/lib/job-search/market-sources";

/**
 * The public PM Job Market page, served at market.jonnymartin.blog (the
 * middleware rewrites that host's root here). A route handler rather than a
 * page so it renders standalone, outside the portfolio's nav and footer.
 */
export const revalidate = 3600;

/** Past this, the collector has stalled; say so instead of showing old numbers as this week's. */
const MAX_SNAPSHOT_AGE_DAYS = 3;

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });

export async function GET() {
  const now = new Date();
  const { data: snap } = await supabase
    .from("job_market_snapshots")
    .select("snapshot_date, boards, apps")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!snap || (now.getTime() - Date.parse(snap.snapshot_date + "T12:00:00Z")) / 86_400_000 > MAX_SNAPSHOT_AGE_DAYS) {
    return html(renderMarketReportUnavailable(), 503);
  }

  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const { data: rows } = await supabase
    .from("job_market_filings")
    .select("accession, company, cik, filed_on, industry, city, state, amount_sold, filing_url")
    .gte("filed_on", since);

  // Only company-level public filing data reaches this page. The named people
  // on each filing are deliberately not selected.
  const filings: FormDFiling[] = (rows || [])
    .filter((r) => isTechIndustry(r.industry))
    .map((r) => ({
      accession: r.accession, company: r.company, cik: r.cik, filedOn: r.filed_on, industry: r.industry,
      city: r.city, state: r.state, amountSold: r.amount_sold == null ? null : Number(r.amount_sold),
      people: [], filingUrl: r.filing_url,
    }));

  const report = buildMarketReport({
    asOf: snap.snapshot_date,
    boards: snap.boards as BoardSummary[],
    apps: snap.apps as ChartApp[],
    filings,
    now,
  });
  return html(renderMarketReport(report));
}
