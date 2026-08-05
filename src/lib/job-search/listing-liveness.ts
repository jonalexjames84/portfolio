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
