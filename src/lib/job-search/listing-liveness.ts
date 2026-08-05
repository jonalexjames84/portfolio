/**
 * Decide whether a job posting URL still points at a real, open req.
 *
 * Written after the 2026-08-04 queue audit, where 4 of 13 postings had been
 * queued — with tailored cover letters written for them — against reqs that
 * were already closed. One had been dead for eight months. The failure mode is
 * silent: every one of those URLs returned HTTP 200.
 */

export type Liveness = "live" | "dead" | "unknown";

export interface LivenessInput {
  /** URL as stored on the pipeline row. */
  originalUrl: string;
  /** URL after following redirects. */
  finalUrl: string;
  httpStatus: number;
  /** Response body, or "" when it could not be read. */
  body: string;
}

export interface LivenessVerdict {
  liveness: Liveness;
  /** Short human-readable justification, stored on the row when dead. */
  reason: string;
}

/**
 * Phrases ATS platforms show when a req is gone but the page still renders.
 * Kept narrow — "closed" and "filled" alone appear in plenty of live JDs
 * (e.g. "closed-loop", "filled a gap"), so each pattern needs surrounding
 * context to match.
 */
const CLOSED_PHRASES: RegExp[] = [
  /sorry,\s*this job was removed/i,
  /this job (?:posting |listing )?(?:has been|was) (?:removed|closed|filled)/i,
  /(?:this |the )?(?:job|position|role|posting|opening) is (?:no longer|not currently) (?:available|open|accepting)/i,
  /no longer accepting applications/i,
  /this (?:job|position|role) has been filled/i,
  /applications (?:are |have )?(?:now )?closed/i,
  /we are no longer hiring for this/i,
];

/**
 * Greenhouse redirects a removed req to the board root with ?error=true.
 * Ashby and Lever 404. Company career sites usually bounce to their index.
 */
function looksLikeBoardIndex(originalUrl: string, finalUrl: string): boolean {
  let orig: SafeUrl, fin: SafeUrl;
  try {
    orig = parse(originalUrl);
    fin = parse(finalUrl);
  } catch {
    return false;
  }

  if (fin.searchParams.get("error") === "true") return true;

  // Unchanged URL is not a redirect at all.
  if (stripTrailingSlash(orig.pathname) === stripTrailingSlash(fin.pathname)) {
    return false;
  }

  // If the destination still carries the same req id, we landed on the same
  // posting, not on an index. Boards routinely hand off to the employer's own
  // careers site — boards.greenhouse.io/roblox/jobs/8014742 becomes
  // careers.roblox.com/jobs/8014742?gh_jid=8014742 — which drops a path segment
  // while remaining perfectly live. Without this check the depth rule below
  // retires healthy roles, which is the more expensive mistake of the two.
  const reqId = lastNumericSegment(orig.pathname);
  if (reqId) {
    const finId = lastNumericSegment(fin.pathname);
    if (finId === reqId) return false;
    for (const v of fin.searchParams.values()) {
      if (v === reqId) return false;
    }
  }

  // A redirect that drops path depth is a bounce to a listing page:
  // /company/jobs/12345 -> /company  or  /careers/some-role -> /careers
  const origDepth = segments(orig.pathname).length;
  const finDepth = segments(fin.pathname).length;
  if (finDepth < origDepth) return true;

  return false;
}

interface SafeUrl {
  pathname: string;
  searchParams: URLSearchParams;
}

function parse(u: string): SafeUrl {
  const parsed = new URL(u);
  return { pathname: parsed.pathname, searchParams: parsed.searchParams };
}

function segments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

/** The trailing all-digits path segment, which on every major ATS is the req id. */
function lastNumericSegment(pathname: string): string | null {
  const segs = segments(pathname);
  for (let i = segs.length - 1; i >= 0; i--) {
    if (/^\d{4,}$/.test(segs[i])) return segs[i];
  }
  return null;
}

function stripTrailingSlash(p: string): string {
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

/**
 * Pull a posting URL out of a free-text notes field.
 *
 * The scraper writes rows as `... | Link: https://... | Auto-scraped`, leaving
 * `job_url` null. 22 such rows existed on 2026-08-04 and were invisible to the
 * re-check sweep, including 17 dead ones — among them a Vercel req that had
 * been gone for months. A row is only as checkable as its URL.
 */
export function extractListingUrl(
  jobUrl: string | null | undefined,
  notes: string | null | undefined
): string | null {
  if (jobUrl && jobUrl.trim()) return jobUrl.trim();
  if (!notes) return null;
  const m = notes.match(/https?:\/\/[^\s|)<>"']+/);
  if (!m) return null;
  // Trailing sentence punctuation is not part of the URL.
  return m[0].replace(/[.,;]+$/, "");
}

export function classifyListing(input: LivenessInput): LivenessVerdict {
  const { httpStatus, body, originalUrl, finalUrl } = input;

  if (httpStatus === 404 || httpStatus === 410) {
    return { liveness: "dead", reason: `HTTP ${httpStatus} — posting not found` };
  }

  // Anything other than 2xx is a transport problem, not evidence of closure.
  // Never retire a role because a board had a bad afternoon.
  if (httpStatus < 200 || httpStatus >= 300) {
    return { liveness: "unknown", reason: `HTTP ${httpStatus} — could not verify` };
  }

  if (looksLikeBoardIndex(originalUrl, finalUrl)) {
    return {
      liveness: "dead",
      reason: `redirected to a board index (${finalUrl}) — req removed`,
    };
  }

  for (const re of CLOSED_PHRASES) {
    const m = body.match(re);
    if (m) {
      return { liveness: "dead", reason: `page states: "${m[0].trim()}"` };
    }
  }

  // An empty body on a 200 tells us nothing — JS-rendered boards look like this.
  if (body.trim().length === 0) {
    return { liveness: "unknown", reason: "HTTP 200 but empty body — could not verify" };
  }

  return { liveness: "live", reason: "HTTP 200, no closure signal" };
}

/* -------------------------------------------------------------------------
 * ATS-API layer
 *
 * Everything above works on a fetched HTML page. That is the fallback, not
 * the preferred path: career sites soft-404, boards render closure notices in
 * JavaScript, and some (ZoomInfo) return 403 to any scripted request, which
 * costs us a verdict on a live role.
 *
 * Every major ATS publishes a JSON endpoint that states plainly whether a req
 * is open, and returns its canonical title. Ask that instead when we can. This
 * is the single implementation — the nightly re-check route and the
 * verifying-job-listings skill CLI both import it, so they cannot drift.
 * ---------------------------------------------------------------------- */

export type AtsRoute =
  | { kind: "greenhouse"; board: string; id: string }
  | { kind: "ashby"; org: string; id: string }
  | { kind: "lever"; org: string; id: string }
  | { kind: "yc"; company: string; slug: string }
  | { kind: "aggregator" }
  | { kind: "generic" };

export interface ListingCheck extends LivenessVerdict {
  /** Canonical title from the ATS. Null when only the HTML path was available. */
  title: string | null;
  location: string | null;
  /** Which authority answered, for the audit trail. */
  via: AtsRoute["kind"];
}

/** Map a posting URL to the API that actually knows whether it is open. */
export function routeListing(url: string): AtsRoute {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { kind: "generic" };
  }
  const host = u.hostname.toLowerCase();
  const path = u.pathname;

  const ghJid = u.searchParams.get("gh_jid");
  if (ghJid) {
    // careers.roblox.com/jobs/123?gh_jid=123 — the employer's own site fronting
    // a Greenhouse board. The subdomain is the board name often enough to try.
    const board = host.split(".").filter((s) => s !== "www" && s !== "careers")[0];
    if (board) return { kind: "greenhouse", board, id: ghJid };
  }

  let m: RegExpMatchArray | null;
  if (host.endsWith("greenhouse.io") && (m = path.match(/^\/([\w-]+)\/jobs\/(\d+)/))) {
    return { kind: "greenhouse", board: m[1], id: m[2] };
  }
  if (host.endsWith("ashbyhq.com") && (m = path.match(/^\/([^/]+)\/([0-9a-f-]{36})/i))) {
    return { kind: "ashby", org: m[1], id: m[2] };
  }
  if (host.endsWith("lever.co") && (m = path.match(/^\/([^/]+)\/([0-9a-f-]{36})/i))) {
    return { kind: "lever", org: m[1], id: m[2] };
  }
  if (
    host.endsWith("ycombinator.com") &&
    (m = path.match(/^\/companies\/([^/]+)\/jobs\/([^/?#]+)/))
  ) {
    return { kind: "yc", company: m[1], slug: m[2] };
  }
  if (host.endsWith("builtin.com") || host.endsWith("indeed.com")) {
    return { kind: "aggregator" };
  }
  return { kind: "generic" };
}

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function getJson(
  f: FetchLike,
  url: string
): Promise<{ status: number; body: unknown }> {
  const res = await f(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) return { status: res.status, body: null };
  try {
    return { status: res.status, body: await res.json() };
  } catch {
    return { status: res.status, body: null };
  }
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

/**
 * Check one posting against the best authority available for it.
 *
 * `fetchImpl` is injectable so this is unit-testable without network access.
 */
export async function checkListing(url: string, fetchImpl: FetchLike = fetch): Promise<ListingCheck> {
  const route = routeListing(url);
  const base = { title: null, location: null, via: route.kind } as const;
  try {
    switch (route.kind) {
      case "greenhouse": {
        const r = await getJson(
          fetchImpl,
          `https://boards-api.greenhouse.io/v1/boards/${route.board}/jobs/${route.id}`
        );
        if (r.status === 404) {
          // A 404 retires the req id, not necessarily the role — it may have
          // been re-posted. Report how much else is on the board so the caller
          // knows a re-post hunt is worthwhile.
          const all = await getJson(
            fetchImpl,
            `https://boards-api.greenhouse.io/v1/boards/${route.board}/jobs`
          );
          const jobs = asRecord(all.body)?.jobs;
          const n = Array.isArray(jobs) ? jobs.length : 0;
          return {
            ...base,
            liveness: "dead",
            reason: `req ${route.id} 404s on the ${route.board} board (${n} other reqs open — check for a re-post before retiring)`,
          };
        }
        const body = asRecord(r.body);
        if (!body) {
          return { ...base, liveness: "unknown", reason: `HTTP ${r.status} from Greenhouse API` };
        }
        return {
          ...base,
          liveness: "live",
          reason: "open on the Greenhouse board",
          title: str(body.title),
          location: str(asRecord(body.location)?.name),
        };
      }
      case "ashby": {
        const r = await getJson(
          fetchImpl,
          `https://api.ashbyhq.com/posting-api/job-board/${route.org}`
        );
        const jobs = asRecord(r.body)?.jobs;
        if (!Array.isArray(jobs)) {
          return { ...base, liveness: "unknown", reason: `HTTP ${r.status} from Ashby API` };
        }
        const hit = jobs.map(asRecord).find((j) => j && j.id === route.id);
        if (!hit) {
          return {
            ...base,
            liveness: "dead",
            reason: `not among ${jobs.length} open postings on the ${route.org} Ashby board`,
          };
        }
        return {
          ...base,
          liveness: "live",
          reason: "listed on the Ashby board",
          title: str(hit.title),
          location: str(hit.location),
        };
      }
      case "lever": {
        const r = await getJson(
          fetchImpl,
          `https://api.lever.co/v0/postings/${route.org}/${route.id}`
        );
        if (r.status === 404) return { ...base, liveness: "dead", reason: "req 404s on Lever" };
        const body = asRecord(r.body);
        if (!body) return { ...base, liveness: "unknown", reason: `HTTP ${r.status} from Lever` };
        return {
          ...base,
          liveness: "live",
          reason: "open on Lever",
          title: str(body.text),
          location: str(asRecord(body.categories)?.location),
        };
      }
      case "yc": {
        // The individual job page stays up after a role closes; the company's
        // jobs index only lists what is open. Use the index.
        const res = await fetchImpl(
          `https://www.ycombinator.com/companies/${route.company}/jobs`,
          { headers: { "user-agent": UA } }
        );
        if (!res.ok) {
          return { ...base, liveness: "unknown", reason: `HTTP ${res.status} from YC` };
        }
        const html = await res.text();
        const re = new RegExp(`/companies/${route.company}/jobs/([A-Za-z0-9]+-[a-z0-9-]+)`, "g");
        const open = new Set(Array.from(html.matchAll(re), (mm) => mm[1]));
        if (!open.has(route.slug)) {
          return {
            ...base,
            liveness: "dead",
            reason: `not listed among ${open.size} open roles on the YC company page`,
          };
        }
        return {
          ...base,
          liveness: "live",
          reason: `listed among ${open.size} open roles`,
          title: route.slug,
        };
      }
      default: {
        // Aggregators and unknown hosts: fall back to the HTML classifier.
        const res = await fetchImpl(url, {
          redirect: "follow",
          headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
        });
        const html = (await res.text()).slice(0, 250_000);
        if (route.kind === "aggregator") {
          const vt = html.match(/"validThrough"\s*:\s*"([^"]+)"/);
          if (vt && new Date(vt[1]).getTime() < Date.now()) {
            return {
              ...base,
              liveness: "dead",
              reason: `aggregator JSON-LD validThrough ${vt[1].slice(0, 10)} has passed`,
            };
          }
        }
        const verdict = classifyListing({
          originalUrl: url,
          finalUrl: res.url || url,
          httpStatus: res.status,
          body: html,
        });
        return { ...base, ...verdict };
      }
    }
  } catch (e) {
    // Network failure is never enough to retire a role.
    return {
      ...base,
      liveness: "unknown",
      reason: `fetch failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

/**
 * Does the ATS's own title still describe the role we queued?
 *
 * The 2026-08-04 queue had an Anthropic link labelled "Product Manager, Claude
 * Code" that pointed at "Product Manager, Claude Tag" — a live req for a
 * different job, so every liveness check passed while the cover letter argued
 * for the wrong role.
 */
export function titlesDiverge(storedRole: string | null, atsTitle: string | null): boolean {
  if (!storedRole || !atsTitle) return false;

  // Seniority is the one axis that reliably gets reworded without the job
  // changing, so it is the only thing dropped before comparing.
  const SENIORITY = /\b(sr|snr|senior|staff|principal|lead|jr|junior|i{1,3}|iv)\b/g;
  const norm = (s: string) =>
    s
      .toLowerCase()
      // Expand the abbreviation before anything else, or "Senior PM, Command
      // Center" reads as a different job from "Senior Product Manager, Command
      // Center" and the report fills with noise nobody will read.
      .replace(/\bpm\b/g, "product manager")
      .replace(SENIORITY, " ")
      .replace(/[^a-z0-9]+/g, "");

  const a = norm(storedRole);
  const b = norm(atsTitle);
  if (!a || !b) return false;

  // Comparing spaceless strings by containment, rather than by token overlap,
  // is what separates the two cases that matter:
  //   "User Lifecycle" vs "User Life Cycle: Engagement" -> one contains the
  //   other, same role with added scope, no flag.
  //   "Claude Code" vs "Claude Tag" -> neither contains the other, different
  //   jobs, flag it.
  // Token-overlap scoring rates both of those identically and cannot tell them
  // apart, which is how the Claude Tag mislink survived review in the first
  // place.
  return !a.includes(b) && !b.includes(a);
}
