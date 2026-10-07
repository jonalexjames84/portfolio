/**
 * Readers for the Market Radar: every posting on a tracked board, SEC Form D
 * filings, and the US App Store charts.
 *
 * All three are public, unauthenticated endpoints. `ats.ts` reads the same
 * boards but keeps only roles worth applying to; the radar needs the whole
 * board, because "how fast is this company hiring" counts every role.
 */

import type { AtsType } from "./ats";

const FETCH_TIMEOUT_MS = 20_000;
const DAY_MS = 86_400_000;

/** SEC asks automated clients to identify themselves. */
const SEC_HEADERS = { "User-Agent": "PM Market Radar research-bot (portfolio project)" };

async function fetchWith(url: string, headers: Record<string, string> = {}): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "job-search-os/1.0", ...headers } });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Role matching
// ---------------------------------------------------------------------------

const NOT_PRODUCT = /marketing|design|communications|brand|counsel|legal|product engineering|product security|product support/i;

export function isPmTitle(title: string): boolean {
  return (
    /\b(product manager|product management|product lead|head of product|director,? (of )?product|vp,? (of )?product|group product|product owner|chief product)\b/i.test(title) &&
    !NOT_PRODUCT.test(title)
  );
}

export function isProductLeaderTitle(title: string): boolean {
  return (
    /\b(head of product|vp,? (of )?product|vice president,? product|director,? (of )?product|chief product|cpo)\b/i.test(title) &&
    !NOT_PRODUCT.test(title)
  );
}

export function isEngineeringTitle(title: string): boolean {
  return /engineer|developer|scientist/i.test(title);
}

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

export interface RawPosting {
  title: string;
  url: string;
  location: string;
  /** First-published date from the ATS. */
  postedAt: string | null;
}

/** Every listed posting on a board, or null when the board didn't answer. */
export async function fetchAllPostings(atsType: AtsType, token: string): Promise<RawPosting[] | null> {
  if (atsType === "greenhouse") {
    const res = await fetchWith(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs`);
    const data = (await res?.json().catch(() => null)) as { jobs?: { title: string; absolute_url: string; location?: { name?: string }; first_published?: string; updated_at?: string }[] } | null;
    if (!data?.jobs) return null;
    return data.jobs.map((j) => ({ title: j.title, url: j.absolute_url, location: j.location?.name || "", postedAt: j.first_published || j.updated_at || null }));
  }
  if (atsType === "ashby") {
    const res = await fetchWith(`https://api.ashbyhq.com/posting-api/job-board/${token}`);
    const data = (await res?.json().catch(() => null)) as { jobs?: { title: string; jobUrl?: string; applyUrl?: string; location?: string; isRemote?: boolean; publishedAt?: string; isListed?: boolean }[] } | null;
    if (!data?.jobs) return null;
    return data.jobs
      .filter((j) => j.isListed !== false)
      .map((j) => ({ title: j.title, url: j.jobUrl || j.applyUrl || "", location: j.location || (j.isRemote ? "Remote" : ""), postedAt: j.publishedAt || null }));
  }
  if (atsType === "lever") {
    const res = await fetchWith(`https://api.lever.co/v0/postings/${token}?mode=json`);
    const data = (await res?.json().catch(() => null)) as { text: string; hostedUrl?: string; applyUrl?: string; createdAt?: number; categories?: { location?: string } }[] | null;
    if (!Array.isArray(data)) return null;
    return data.map((j) => ({ title: j.text, url: j.hostedUrl || j.applyUrl || "", location: j.categories?.location || "", postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null }));
  }
  return null;
}

export interface BoardRole {
  title: string;
  url: string;
  location: string;
  postedAt: string;
}

/** What the snapshot keeps per company: counts, plus the roles the brief names. */
export interface BoardSummary {
  company: string;
  industry: string | null;
  totalOpen: number;
  engineeringOpen: number;
  pmOpen: number;
  postedLast30: number;
  postedPrior60: number;
  /** PM roles first published in the last 30 days, newest first. */
  pmRoles: BoardRole[];
  /** Product-leader roles first published in the last 30 days. */
  leaderRoles: BoardRole[];
}

export function summarizeBoard(company: string, industry: string | null, postings: RawPosting[], now: Date): BoardSummary {
  const ageDays = (iso: string | null) => (iso ? Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS) : null);
  const recent = (p: RawPosting) => { const a = ageDays(p.postedAt); return a != null && a >= 0 && a <= 30; };
  const toRole = (p: RawPosting): BoardRole => ({ title: p.title, url: p.url, location: p.location.slice(0, 60), postedAt: p.postedAt as string });
  const byNewest = (a: BoardRole, b: BoardRole) => Date.parse(b.postedAt) - Date.parse(a.postedAt);
  return {
    company,
    industry,
    totalOpen: postings.length,
    engineeringOpen: postings.filter((p) => isEngineeringTitle(p.title)).length,
    pmOpen: postings.filter((p) => isPmTitle(p.title)).length,
    postedLast30: postings.filter(recent).length,
    postedPrior60: postings.filter((p) => { const a = ageDays(p.postedAt); return a != null && a > 30 && a <= 90; }).length,
    pmRoles: postings.filter((p) => recent(p) && isPmTitle(p.title)).map(toRole).sort(byNewest),
    leaderRoles: postings.filter((p) => recent(p) && isProductLeaderTitle(p.title)).map(toRole).sort(byNewest),
  };
}

// ---------------------------------------------------------------------------
// SEC Form D
// ---------------------------------------------------------------------------

export interface FormDIndexEntry {
  company: string;
  cik: string;
  /** e.g. edgar/data/1234567/0001234567-26-000001.txt */
  path: string;
}

const FUND_WORDS = /\b(fund|funds|l\.?p\.?|lp|spv|trust|reit|investors?|feeder|offshore|master|portfolio|co-?invest|opportunit|real estate|properties|realty|apartments|income|credit|capital|partners|holdings|series)\b/i;
const OPERATING_SUFFIX = /\b(inc\.?|corp\.?|corporation|technologies|labs|ai)\s*$/i;

/**
 * Form D is filed by startups and investment funds alike. Startups are almost
 * always Delaware C-corps ("Inc."), funds are LPs and LLC series. The name is
 * the only cheap signal before opening the filing.
 */
export function isOperatingCompany(name: string): boolean {
  return OPERATING_SUFFIX.test(name.trim()) && !FUND_WORDS.test(name);
}

/** Industries where a PM is a plausible hire. Biotech, banking and real estate are out. */
export function isTechIndustry(industry: string | null | undefined): boolean {
  return /Other Technology|Computers|Telecommunications|^Other$|Business Services|Retailing/.test(industry || "");
}

/** Original Form D filings from operating companies on one day. Null when SEC has no index (weekend, holiday, not yet published). */
export async function fetchFormDIndex(day: string): Promise<FormDIndexEntry[] | null> {
  const d = new Date(day + "T12:00:00Z");
  const quarter = Math.floor(d.getUTCMonth() / 3) + 1;
  const res = await fetchWith(`https://www.sec.gov/Archives/edgar/daily-index/${d.getUTCFullYear()}/QTR${quarter}/form.${day.replaceAll("-", "")}.idx`, SEC_HEADERS);
  if (!res) return null;
  const text = await res.text();
  const out: FormDIndexEntry[] = [];
  for (const line of text.split("\n")) {
    if (!/^D\s{2,}/.test(line)) continue; // "D" only, not "D/A" amendments
    const m = line.match(/^D\s+(.+?)\s{2,}(\d+)\s+(\d{8})\s+(\S+)/);
    if (m && isOperatingCompany(m[1])) out.push({ company: m[1].replace(/\s+/g, " ").trim(), cik: m[2], path: m[4] });
  }
  return out;
}

export interface FormDFiling {
  accession: string;
  company: string;
  cik: string;
  filedOn: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  amountSold: number | null;
  people: { name: string; relationship: string; title: string }[];
  filingUrl: string;
}

const tag = (xml: string, t: string) => xml.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1]?.trim() ?? null;

export function parseFormD(xml: string, entry: FormDIndexEntry, filedOn: string): FormDFiling {
  const accession = entry.path.split("/").pop()!.replace(".txt", "");
  const people = [...xml.matchAll(/<relatedPersonInfo>([\s\S]*?)<\/relatedPersonInfo>/g)].map((m) => ({
    name: [tag(m[1], "firstName"), tag(m[1], "lastName")].filter(Boolean).join(" "),
    relationship: [...m[1].matchAll(/<relationship>([^<]+)<\/relationship>/g)].map((r) => r[1]).join(", "),
    title: tag(m[1], "relationshipClarification") || "",
  }));
  const sold = Number(tag(xml, "totalAmountSold"));
  return {
    accession,
    company: entry.company,
    cik: entry.cik,
    filedOn,
    industry: tag(xml, "industryGroupType"),
    city: tag(xml, "city"),
    state: tag(xml, "stateOrCountry"),
    amountSold: Number.isFinite(sold) ? sold : null,
    people: people.slice(0, 6),
    filingUrl: `https://www.sec.gov/Archives/edgar/data/${entry.cik}/${accession.replaceAll("-", "")}/`,
  };
}

export async function fetchFormD(entry: FormDIndexEntry, filedOn: string): Promise<FormDFiling | null> {
  const accession = entry.path.split("/").pop()!.replace(".txt", "");
  const res = await fetchWith(`https://www.sec.gov/Archives/edgar/data/${entry.cik}/${accession.replaceAll("-", "")}/primary_doc.xml`, SEC_HEADERS);
  await sleep(130); // SEC's limit is 10 requests a second
  if (!res) return null;
  return parseFormD(await res.text(), entry, filedOn);
}

// ---------------------------------------------------------------------------
// App Store
// ---------------------------------------------------------------------------

export interface ChartApp {
  id: string;
  name: string;
  developer: string;
  url: string;
  /** Chart name → rank, e.g. { "Top grossing · games": 17 }. */
  ranks: Record<string, number>;
  releasedOn: string | null;
  sellerUrl: string | null;
}

const CHARTS: Record<string, string> = {
  "Top grossing · apps": "topgrossingapplications/limit=100",
  "Top free · apps": "topfreeapplications/limit=100",
  "Top grossing · games": "topgrossingapplications/limit=100/genre=6014",
  "Top free · games": "topfreeapplications/limit=100/genre=6014",
};

type RssEntry = { id: { label: string; attributes: { "im:id": string } }; "im:name": { label: string }; "im:artist"?: { label: string }; link?: { attributes?: { href?: string } } };

/** The four US top-100 charts, with first-release dates from the lookup API. */
export async function fetchAppCharts(): Promise<ChartApp[]> {
  const apps = new Map<string, ChartApp>();
  for (const [chart, path] of Object.entries(CHARTS)) {
    const res = await fetchWith(`https://itunes.apple.com/us/rss/${path}/json`);
    const data = (await res?.json().catch(() => null)) as { feed?: { entry?: RssEntry[] } } | null;
    (data?.feed?.entry || []).forEach((e, i) => {
      const id = e.id.attributes["im:id"];
      const app = apps.get(id) ?? { id, name: e["im:name"].label, developer: e["im:artist"]?.label || "", url: e.link?.attributes?.href || e.id.label, ranks: {}, releasedOn: null, sellerUrl: null };
      app.ranks[chart] = i + 1;
      apps.set(id, app);
    });
  }
  const ids = [...apps.keys()];
  for (let i = 0; i < ids.length; i += 150) {
    const res = await fetchWith(`https://itunes.apple.com/lookup?country=us&id=${ids.slice(i, i + 150).join(",")}`);
    const data = (await res?.json().catch(() => null)) as { results?: { trackId: number; releaseDate?: string; sellerUrl?: string }[] } | null;
    for (const r of data?.results || []) {
      const app = apps.get(String(r.trackId));
      if (app) { app.releasedOn = r.releaseDate?.slice(0, 10) ?? null; app.sellerUrl = r.sellerUrl ?? null; }
    }
  }
  return [...apps.values()];
}

// ---------------------------------------------------------------------------
// Steam
// ---------------------------------------------------------------------------

export interface SteamGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  /** Average concurrent players, last 30 days. */
  players: number;
  /** Average concurrent players three months earlier. */
  playersThen: number | null;
}

/** Monthly rows from a SteamCharts app page: [label, average players], newest first. */
export function parseSteamCharts(html: string): [string, number][] {
  return [...html.matchAll(/<td class="month-cell left[^"]*">\s*([^<]+?)\s*<\/td>\s*<td class="right num-f[^"]*">([\d.]+)<\/td>/g)].map((m) => [m[1], Number(m[2])]);
}

/** The 100 most-played Steam games of the last two weeks, with player counts now vs three months ago. */
export async function fetchSteamGames(): Promise<SteamGame[]> {
  const res = await fetchWith("https://steamspy.com/api.php?request=top100in2weeks");
  const top = (await res?.json().catch(() => null)) as Record<string, { appid: number; name: string; developer: string; publisher: string }> | null;
  if (!top) return [];
  const out: SteamGame[] = [];
  for (const g of Object.values(top)) {
    const page = await fetchWith(`https://steamcharts.com/app/${g.appid}`, { "User-Agent": "Mozilla/5.0 (PM Market Radar research)" });
    await sleep(300);
    const rows = page ? parseSteamCharts(await page.text()) : [];
    if (!rows.length) continue;
    out.push({ appid: g.appid, name: g.name, developer: g.developer, publisher: g.publisher, players: Math.round(rows[0][1]), playersThen: rows[3] ? Math.round(rows[3][1]) : null });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Studio job boards
// ---------------------------------------------------------------------------

export interface StudioBoard {
  atsType: AtsType;
  token: string;
  careersUrl: string;
  totalOpen: number;
  /** Product manager and producer roles. */
  productOpen: number;
}

const CAREERS_URL: Record<AtsType, (t: string) => string> = {
  greenhouse: (t) => `https://job-boards.greenhouse.io/${t}`,
  ashby: (t) => `https://jobs.ashbyhq.com/${t}`,
  lever: (t) => `https://jobs.lever.co/${t}`,
};

export function isProductOrProducerTitle(title: string): boolean {
  return isPmTitle(title) || /\bproducer\b|development director|game director/i.test(title);
}

/** Open-role counts for a board token already known to belong to the studio. */
export async function readStudioBoard(atsType: AtsType, token: string): Promise<StudioBoard | null> {
  const postings = await fetchAllPostings(atsType, token);
  if (!postings || !postings.length) return null;
  return { atsType, token, careersUrl: CAREERS_URL[atsType](token), totalOpen: postings.length, productOpen: postings.filter((p) => isProductOrProducerTitle(p.title)).length };
}

/**
 * Looks for a public job board under the studio's own name. Board tokens are
 * often not the company name (Zynga is `zyngacareers`), so a miss means "not
 * found", not "not hiring". Short names are skipped: a five-letter-or-less
 * slug is too likely to be some other company's board.
 */
export async function probeStudioBoard(slug: string): Promise<StudioBoard | null> {
  if (slug.length < 6) return null;
  for (const atsType of ["greenhouse", "ashby", "lever"] as AtsType[]) {
    const board = await readStudioBoard(atsType, slug);
    if (board) return board;
  }
  return null;
}
