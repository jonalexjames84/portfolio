/**
 * Public ATS job-board clients.
 *
 * Greenhouse, Ashby and Lever all expose the job boards they host over
 * unauthenticated JSON endpoints — the same data their careers pages render.
 * No API key, no scraping, no bot protection.
 */

export type AtsType = "greenhouse" | "ashby" | "lever";

export interface AtsPosting {
  externalId: string;
  title: string;
  url: string;
  location: string;
  description: string;
  postedAt: string | null;
}

export interface AtsBoard {
  company: string;
  atsType: AtsType;
  atsToken: string;
  industry?: string | null;
  stage?: string | null;
}

const FETCH_TIMEOUT_MS = 15_000;

async function getJson(url: string): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "job-search-os/1.0" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Strip HTML tags and decode the entities ATS descriptions come wrapped in. */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Title relevance
// ---------------------------------------------------------------------------

const TITLE_INCLUDE = [
  "product manager",
  "product management",
  "head of product",
  "director of product",
  "director, product",
  "vp of product",
  "vp, product",
  "principal product",
  "product lead",
  "lead product",
  "product owner",
];

/**
 * Titles that contain an include-term but are a different job entirely.
 * "Product Marketing Manager" and "Technical Program Manager" are the two
 * that flood the results if left unfiltered.
 */
const TITLE_EXCLUDE = [
  "product marketing",
  "marketing manager",
  "program manager",
  "project manager",
  "product design",
  "product designer",
  "product analyst",
  "product support",
  "product specialist",
  "product counsel",
  "product operations",
  "engineering manager",
  "intern",
  "internship",
  "associate product manager",
  "apprentice",
  "new grad",
  "university grad",
];

export function isRelevantTitle(title: string): boolean {
  const t = title.toLowerCase();
  if (TITLE_EXCLUDE.some((x) => t.includes(x))) return false;
  return TITLE_INCLUDE.some((x) => t.includes(x));
}

// ---------------------------------------------------------------------------
// Location relevance — Jon is Bay Area, open to US remote.
// ---------------------------------------------------------------------------

/** Concrete US places. A hit here wins outright, even alongside a foreign office. */
const US_PLACES = [
  "united states",
  "usa",
  "u.s.",
  "san francisco",
  "bay area",
  "sf",
  "oakland",
  "berkeley",
  "palo alto",
  "mountain view",
  "menlo park",
  "sunnyvale",
  "santa clara",
  "san jose",
  "redwood city",
  "foster city",
  "new york",
  "nyc",
  "seattle",
  "los angeles",
  "austin",
  "boston",
  "chicago",
  "denver",
  "portland",
  "san diego",
  "washington",
  "atlanta",
  "miami",
  ", ca",
  ", ny",
  ", wa",
  ", tx",
  ", ma",
  ", il",
  ", co",
  ", or",
];

/** Ambiguous on its own — only counts once the deny list has had its say. */
const GENERIC_REMOTE = ["remote", "anywhere", "distributed"];

/**
 * Checked before LOCATION_ALLOW, because "Remote - Canada" and "Remote, EMEA"
 * both contain "remote" and would otherwise sail through as US-remote roles.
 */
const LOCATION_DENY = [
  "canada",
  "toronto",
  "vancouver, b",
  "montreal",
  "united kingdom",
  "london",
  "gb-",
  "uk-",
  "ireland",
  "dublin",
  "germany",
  "berlin",
  "munich",
  "france",
  "paris",
  "spain",
  "madrid",
  "barcelona",
  "portugal",
  "lisbon",
  "netherlands",
  "amsterdam",
  "poland",
  "warsaw",
  "sweden",
  "stockholm",
  "india",
  "bengaluru",
  "bangalore",
  "hyderabad",
  "mumbai",
  "gurugram",
  "singapore",
  "australia",
  "sydney",
  "melbourne",
  "japan",
  "tokyo",
  "china",
  "beijing",
  "shanghai",
  "korea",
  "israel",
  "tel aviv",
  "brazil",
  "sao paulo",
  "mexico",
  "argentina",
  "colombia",
  "emea",
  "apac",
  "latam",
];

/**
 * Empty locations pass — better a false positive than a missed A-tier role.
 *
 * Order matters. A named US office wins even when the posting also lists a
 * foreign one ("San Francisco, CA | London, UK" is applicable). A bare "remote"
 * does not, so "Remote - Canada" is correctly rejected.
 */
export function isRelevantLocation(location: string): boolean {
  const l = location.toLowerCase().trim();
  if (!l) return true;
  if (US_PLACES.some((x) => l.includes(x))) return true;
  if (LOCATION_DENY.some((x) => l.includes(x))) return false;
  return GENERIC_REMOTE.some((x) => l.includes(x));
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at?: string;
  first_published?: string;
  location?: { name?: string };
  content?: string;
}

async function fetchGreenhouse(token: string): Promise<AtsPosting[]> {
  const data = (await getJson(
    `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`
  )) as { jobs?: GreenhouseJob[] } | null;
  if (!data?.jobs) return [];

  // Boards run to 800+ postings, so filter on the cheap list payload first and
  // only pull full descriptions for the handful of PM roles that survive.
  const candidates = data.jobs.filter(
    (j) =>
      isRelevantTitle(j.title || "") &&
      isRelevantLocation(j.location?.name || "")
  );

  const detailed = await mapPool(candidates, 4, async (j) => {
    const detail = (await getJson(
      `https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${j.id}`
    )) as GreenhouseJob | null;
    return {
      externalId: String(j.id),
      title: j.title,
      url: j.absolute_url,
      location: j.location?.name || "",
      description: stripHtml(detail?.content || ""),
      postedAt: detail?.first_published || j.first_published || j.updated_at || null,
    };
  });

  return detailed;
}

interface AshbyJob {
  id: string;
  title: string;
  jobUrl?: string;
  applyUrl?: string;
  location?: string;
  isRemote?: boolean;
  publishedAt?: string;
  descriptionPlain?: string;
  isListed?: boolean;
}

async function fetchAshby(token: string): Promise<AtsPosting[]> {
  const data = (await getJson(
    `https://api.ashbyhq.com/posting-api/job-board/${token}`
  )) as { jobs?: AshbyJob[] } | null;
  if (!data?.jobs) return [];

  return data.jobs
    .filter((j) => j.isListed !== false)
    .filter((j) => isRelevantTitle(j.title || ""))
    // Deliberately not short-circuiting on j.isRemote: Ashby flags non-US remote
    // roles as remote too, and isRelevantLocation already passes empty strings.
    .filter((j) => isRelevantLocation(j.location || ""))
    .map((j) => ({
      externalId: j.id,
      title: j.title,
      url: j.jobUrl || j.applyUrl || "",
      location: j.location || (j.isRemote ? "Remote" : ""),
      description: (j.descriptionPlain || "").slice(0, 20_000),
      postedAt: j.publishedAt || null,
    }))
    .filter((j) => j.url);
}

interface LeverJob {
  id: string;
  text: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  categories?: { location?: string };
  descriptionPlain?: string;
  additionalPlain?: string;
}

async function fetchLever(token: string): Promise<AtsPosting[]> {
  const data = (await getJson(
    `https://api.lever.co/v0/postings/${token}?mode=json`
  )) as LeverJob[] | null;
  if (!Array.isArray(data)) return [];

  return data
    .filter((j) => isRelevantTitle(j.text || ""))
    .filter((j) => isRelevantLocation(j.categories?.location || ""))
    .map((j) => ({
      externalId: j.id,
      title: j.text,
      url: j.hostedUrl || j.applyUrl || "",
      location: j.categories?.location || "",
      description: `${j.descriptionPlain || ""} ${j.additionalPlain || ""}`
        .trim()
        .slice(0, 20_000),
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    }))
    .filter((j) => j.url);
}

export async function fetchBoard(board: AtsBoard): Promise<AtsPosting[]> {
  switch (board.atsType) {
    case "greenhouse":
      return fetchGreenhouse(board.atsToken);
    case "ashby":
      return fetchAshby(board.atsToken);
    case "lever":
      return fetchLever(board.atsToken);
    default:
      return [];
  }
}

/** Bounded-concurrency map — ATS boards are fetched in parallel but politely. */
export async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}
