/**
 * The public PM Job Market page (market.jonnymartin.blog): market data only.
 *
 * Design: https://claude.ai/artifact/WhtfTwnPryiRdi4Fh28Ttv (version 1), chosen
 * 2026-10-07 and recorded on the portfolio project page in Notion.
 *
 * This page is public, so it is built only from the market snapshot and SEC
 * filings. It never reads contacts, applications or action items; those stay
 * in the private daily email (`market-brief.ts`).
 */

import { isProductLeaderTitle, type BoardSummary, type ChartApp, type FormDFiling } from "./market-sources";

const DAY_MS = 86_400_000;

export interface MarketReport {
  asOf: string;
  boardCount: number;
  thisWeek: number;
  lastWeek: number;
  companiesThisWeek: number;
  hiring: { company: string; roles: number; newestTitle: string; newestUrl: string; newestDays: number }[];
  hiringCount: number;
  raises: { company: string; amount: number; filedOn: string; city: string | null; state: string | null; url: string }[];
  raiseCount: number;
  raiseSum: number;
  breakouts: { name: string; developer: string; url: string; releasedOn: string; rank: number; chart: string }[];
  breakoutCount: number;
  breakoutGrossing: number;
  sectors: [string, number][];
  leaders: { company: string; title: string; url: string; days: number }[];
}

export function buildMarketReport(input: { asOf: string; boards: BoardSummary[]; apps: ChartApp[]; filings: FormDFiling[]; now: Date }): MarketReport {
  const { boards, apps, filings, now } = input;
  const age = (iso: string) => Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS);

  const allPm = boards.flatMap((b) => b.pmRoles.map((r) => ({ company: b.company, days: age(r.postedAt) })));
  const thisWeek = allPm.filter((r) => r.days <= 6);

  const hiringBoards = boards.filter((b) => b.pmRoles.length).sort((a, b) => b.pmRoles.length - a.pmRoles.length || age(a.pmRoles[0].postedAt) - age(b.pmRoles[0].postedAt));

  const largest = new Map<string, FormDFiling>();
  for (const f of filings) {
    if ((f.amountSold ?? 0) < 1e6) continue;
    const k = f.company.toLowerCase();
    if (!largest.has(k) || (f.amountSold ?? 0) > (largest.get(k)!.amountSold ?? 0)) largest.set(k, f);
  }
  const raises = [...largest.values()].sort((a, b) => (b.amountSold ?? 0) - (a.amountSold ?? 0));

  const grossing = (a: ChartApp) => Object.keys(a.ranks).some((k) => k.startsWith("Top grossing"));
  const best = (a: ChartApp) => Object.entries(a.ranks).sort((x, y) => x[1] - y[1])[0];
  const breakouts = apps
    .filter((a) => a.releasedOn && age(a.releasedOn) <= 365)
    .sort((a, b) => Number(grossing(b)) - Number(grossing(a)) || best(a)[1] - best(b)[1]);

  const sectors = new Map<string, number>();
  for (const b of hiringBoards) sectors.set(b.industry || "Other", (sectors.get(b.industry || "Other") ?? 0) + b.pmRoles.length);

  return {
    asOf: input.asOf,
    boardCount: boards.length,
    thisWeek: thisWeek.length,
    lastWeek: allPm.filter((r) => r.days >= 7 && r.days <= 13).length,
    companiesThisWeek: new Set(thisWeek.map((r) => r.company)).size,
    hiring: hiringBoards.slice(0, 10).map((b) => ({ company: b.company, roles: b.pmRoles.length, newestTitle: b.pmRoles[0].title, newestUrl: b.pmRoles[0].url, newestDays: age(b.pmRoles[0].postedAt) })),
    hiringCount: hiringBoards.length,
    raises: raises.slice(0, 10).map((f) => ({ company: f.company, amount: f.amountSold ?? 0, filedOn: f.filedOn, city: f.city, state: f.state, url: f.filingUrl })),
    raiseCount: raises.length,
    raiseSum: raises.reduce((s, f) => s + (f.amountSold ?? 0), 0),
    breakouts: breakouts.slice(0, 10).map((a) => { const [chart, rank] = best(a); return { name: a.name, developer: a.developer, url: a.url, releasedOn: a.releasedOn!, rank, chart }; }),
    breakoutCount: breakouts.length,
    breakoutGrossing: breakouts.filter(grossing).length,
    sectors: [...sectors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    leaders: hiringBoards
      .filter((b) => b.pmRoles.every((r) => isProductLeaderTitle(r.title)))
      .slice(0, 6)
      .map((b) => ({ company: b.company, title: b.pmRoles[0].title, url: b.pmRoles[0].url, days: age(b.pmRoles[0].postedAt) })),
  };
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const day = (s: string) => { const d = new Date(s.length === 10 ? s + "T12:00:00Z" : s); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`; };
const money = (n: number) => (n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${Math.round(n / 1e6)}M`);
const ago = (d: number) => (d <= 0 ? "today" : d === 1 ? "yesterday" : `${d}d ago`);
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const row = (url: string, name: string, meta: string, value: string) =>
  `<li><a href="${esc(url)}" target="_blank" rel="noopener"><span class="n">${esc(name)}</span><span class="val">${esc(value)}</span><span class="m">${esc(meta)}</span></a></li>`;

export function renderMarketReport(r: MarketReport): string {
  const change = r.lastWeek ? Math.round((r.thisWeek / r.lastWeek - 1) * 100) : null;
  const asOf = new Date(r.asOf + "T12:00:00Z");
  const max = Math.max(1, ...r.sectors.map((s) => s[1]));
  const tiles = [
    { v: r.thisWeek, s: "PM roles posted this week", d: change == null ? "first week of data" : `${change >= 0 ? "▲ +" : "▼ "}${change}% vs last week` },
    { v: r.hiringCount, s: "companies hiring PMs", d: `${r.companiesThisWeek} posted this week` },
    { v: money(r.raiseSum), s: `raised by ${r.raiseCount} tech companies`, d: "last 30 days" },
    { v: r.breakoutCount, s: "new apps in the top charts", d: `${r.breakoutGrossing} already top grossing` },
  ];

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>PM Job Market</title>
<meta name="description" content="Where product manager hiring is happening this week, who just raised money, and which new apps are breaking out. Updated every morning from public data.">
<style>${CSS}</style>
</head><body><div class="wrap">
  <header>
    <div class="eyebrow">Week of ${MONTHS[asOf.getUTCMonth()]} ${asOf.getUTCDate()}, ${asOf.getUTCFullYear()}</div>
    <h1>PM Job Market</h1>
    <p class="lede">Where product manager hiring is happening this week, who just raised money, and which new apps are breaking out. Updated every morning from public data.</p>
  </header>
  <section class="tiles" aria-label="This week">${tiles.map((t) => `<div class="tile"><span class="v">${t.v}</span><span class="s">${t.s}</span><span class="d">${t.d}</span></div>`).join("")}</section>
  <section class="grid">
    <div class="card"><h2>Who’s hiring PMs</h2><p class="sub">Most PM roles posted in the last 30 days.</p>
      <ol class="rank">${r.hiring.map((h) => row(h.newestUrl, h.company, `Newest: ${h.newestTitle} · ${ago(h.newestDays)}`, `${h.roles} roles`)).join("")}</ol></div>
    <div class="card"><h2>Just raised</h2><p class="sub">Largest tech rounds reported to the SEC in the last 30 days. A PM hire usually follows within a few months.</p>
      <ol class="rank">${r.raises.map((f) => row(f.url, f.company, `${titleCase(f.city || "")}${f.state ? ", " + f.state : ""} · filed ${day(f.filedOn)}`, money(f.amount))).join("")}</ol></div>
    <div class="card"><h2>Breaking out on mobile</h2><p class="sub">Apps under a year old already in a US App Store top-100 chart. Top grossing first.</p>
      <ol class="rank">${r.breakouts.map((a) => row(a.url, a.name, `${a.developer} · out ${day(a.releasedOn)}`, `#${a.rank} ${a.chart.replace("Top ", "").replace(" · ", " ")}`)).join("")}</ol></div>
    <div class="card"><h2>PM roles by sector</h2><p class="sub">Last 30 days.</p>
      <div class="bars">${r.sectors.map(([k, v]) => `<div class="bar"><span>${esc(k)}</span><span class="track"><span class="fill" style="width:${((v / max) * 100).toFixed(1)}%"></span></span><span class="num">${v}</span></div>`).join("")}</div>
      <h2 class="mt">Hiring a product leader first</h2><p class="sub">Only a Head, Director or VP of Product is open. The team usually follows.</p>
      <ol class="rank">${r.leaders.length ? r.leaders.map((l) => row(l.url, l.company, l.title, ago(l.days))).join("") : `<li class="none">None this month.</li>`}</ol></div>
  </section>
  <footer>
    <div><b>Sources.</b> Job postings from ${r.boardCount} company career boards (Greenhouse, Ashby, Lever), counted by first-published date. Funding from SEC Form D filings by operating companies in technology industries. Apps from Apple’s US top-100 free and top-grossing charts.</div>
    <div><b>Limits.</b> Career boards only show open roles, so filled roles drop out. Roles are matched by job title. Form D amounts are what each company reported as sold.</div>
  </footer>
</div></body></html>`;
}

/** An empty-state page for before the first snapshot, or when the collector has stalled. */
export function renderMarketReportUnavailable(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PM Job Market</title><style>${CSS}</style></head>
<body><div class="wrap"><header><h1>PM Job Market</h1><p class="lede">This week’s numbers aren’t ready yet. The page refreshes every morning; check back in a few hours.</p></header></div></body></html>`;
}

const CSS = `
:root{--bg:#f4f6f9;--surface:#fcfcfd;--ink:#0f1520;--ink-2:#4a5363;--muted:#737b8a;--grid:#e3e6eb;--line:rgba(15,21,32,.10);--accent:#2a78d6;--good:#006300;
--font-body:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--font-data:ui-monospace,"SF Mono",Menlo,monospace;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0d1015;--surface:#151920;--ink:#f2f4f7;--ink-2:#b7becb;--muted:#8b93a1;--grid:#252b35;--line:rgba(255,255,255,.10);--accent:#3987e5;--good:#0ca30c;color-scheme:dark}}
*{box-sizing:border-box}body{background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:14px;line-height:1.45;margin:0}
.wrap{max-width:1040px;margin:0 auto;padding:32px 20px 56px;display:grid;gap:28px}
h1,h2{margin:0;text-wrap:balance;letter-spacing:-.01em}h1{font-size:34px;font-weight:800}h2{font-size:18px;font-weight:700}h2.mt{margin-top:10px}
.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600}
.lede{color:var(--ink-2);max-width:62ch;margin:6px 0 0;font-size:15px}
.tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:grid;gap:3px;min-width:0}
.tile .v{font-size:30px;font-weight:800;line-height:1.05}.tile .s{font-size:13px;color:var(--ink-2)}.tile .d{font-family:var(--font-data);font-size:12px;color:var(--good)}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px 18px;display:grid;gap:8px;align-content:start;min-width:0}
.sub{margin:0;font-size:12.5px;color:var(--muted)}
ol.rank{list-style:none;margin:0;padding:0;counter-reset:r}ol.rank li{counter-increment:r;border-bottom:1px solid var(--grid)}ol.rank li:last-child{border-bottom:0}
ol.rank a{display:grid;grid-template-columns:1.6rem minmax(0,1fr) auto;gap:2px 10px;padding:8px 0;color:inherit;text-decoration:none}
ol.rank a::before{content:counter(r);font-family:var(--font-data);font-size:12px;color:var(--muted);padding-top:2px}
ol.rank a:hover .n{color:var(--accent)}ol.rank a:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
.n{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m{grid-column:2;font-size:12.5px;color:var(--ink-2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.val{font-family:var(--font-data);font-size:12.5px;text-align:right;white-space:nowrap;grid-row:1;grid-column:3}
.none{padding:8px 0;color:var(--muted)}
.bars{display:grid;gap:6px}.bar{display:grid;grid-template-columns:9.5rem minmax(0,1fr) 2.5rem;gap:10px;align-items:center;font-size:12.5px}
.track{height:10px;background:var(--grid);border-radius:0 4px 4px 0}.fill{display:block;height:10px;background:var(--accent);border-radius:0 4px 4px 0}.num{font-family:var(--font-data);text-align:right}
footer{font-size:12.5px;color:var(--muted);display:grid;gap:6px;max-width:80ch}
@media (max-width:860px){.tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.grid{grid-template-columns:minmax(0,1fr)}}
@media (max-width:480px){.wrap{padding:24px 16px 40px}h1{font-size:27px}.bar{grid-template-columns:7rem minmax(0,1fr) 2.2rem}}
`;
