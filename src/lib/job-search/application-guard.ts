/**
 * One application per req, one company at a time.
 *
 * Written after parallel agents each prepared an application for the same role
 * and nobody noticed until Stedi had three. Two separate holes made that
 * possible:
 *
 * 1. **No canonical job identity.** `job_pipeline_entries` had a UNIQUE index on
 *    the raw `job_url`, so the *same* Greenhouse req stored three different ways
 *    — `job-boards.greenhouse.io/webflow/jobs/8097749`,
 *    `boards.greenhouse.io/webflow/jobs/8097749`, and
 *    `webflow.com/careers?gh_jid=8097749` — was three distinct rows to Postgres.
 *    Rows with a null `job_url` (45 of 98 at the time) were exempt entirely,
 *    which is how "PM, Accounts" and "Product Manager, Accounts" both survived.
 *
 * 2. **No record that an application happened.** The only evidence was `status`
 *    on a pipeline row. An agent that built its own queue never saw it. Stedi
 *    got three applications while appearing exactly once in the pipeline.
 *
 * This module supplies the identity half. The atomic half — claiming a job so a
 * second agent's claim *fails* rather than races — lives in the
 * `job_claim_application` Postgres function, because a check in TypeScript can
 * only ever narrow the window, never close it.
 */

// ---------------------------------------------------------------------------
// Company identity
// ---------------------------------------------------------------------------

/**
 * Company names arrive spelled several ways across sources: the ATS board name,
 * the queue file's display name, and whatever the scraper grabbed. These all
 * have to collapse to one key or the per-company cap counts the same employer
 * twice.
 */
const COMPANY_ALIASES: Record<string, string> = {
  "alphabet": "google",
  "google-deepmind": "google",
  "deepmind": "google",
  "aws": "amazon",
  "amazon-web-services": "amazon",
  "meta-platforms": "meta",
  "facebook": "meta",
  "x-corp": "x",
  "twitter": "x",
  "square": "block",
  "take-two": "2k-games",
  "take-two-interactive": "2k-games",
  "2k": "2k-games",
  "recall": "recall-ai",
  "weights-biases": "weights-and-biases",
  "wandb": "weights-and-biases",
};

/**
 * Normalize a company name to a stable key.
 *
 * Drops the parenthetical parent-company suffix the ATS seed data carries
 * ("LinkedIn (Microsoft)" → `linkedin`): Jon applies to LinkedIn's PM org, not
 * to Microsoft's, and rolling them together would wrongly block the other.
 */
export function normalizeCompany(name: string | null | undefined): string {
  const base = (name || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // parent-company suffix
    .replace(/\b(inc|llc|ltd|corp|corporation|co|gmbh|labs?|technologies|systems)\b\.?/g, " ")
    .replace(/\.(io|ai|com|co|dev|app|sh|xyz)\b/g, " ") // Apollo.io → apollo
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return COMPANY_ALIASES[base] ?? base;
}

// ---------------------------------------------------------------------------
// Role identity
// ---------------------------------------------------------------------------

/**
 * Expanded before matching so "Sr. Technical Product Manager" and "Senior
 * Technical Product Manager" — two rows for one 2K req — resolve identically.
 * Order matters: longest first, so "sr pm" does not half-expand.
 */
const ROLE_ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\btpm\b/g, "technical product manager"],
  [/\bapm\b/g, "associate product manager"],
  [/\bgpm\b/g, "group product manager"],
  [/\bpmm\b/g, "product marketing manager"],
  [/\bpm\b/g, "product manager"],
  [/\bsr\b\.?/g, "senior"],
  [/\bjr\b\.?/g, "junior"],
  [/\bengr?\b/g, "engineering"],
  [/\bops\b/g, "operations"],
  [/\bexp\b/g, "experience"],
  [/\bmgr\b/g, "manager"],
];

/**
 * Normalize a role title for the no-URL fallback key.
 *
 * Deliberately conservative: it collapses spelling and level-code noise but
 * never trims meaningful scope. "Product Manager, Claude Code" and "Product
 * Manager, Claude Code Model Performance" stay distinct, because they are in
 * fact different reqs — a lesson from the queue that shipped a Claude Code
 * cover letter against the Claude Tag posting.
 */
export function normalizeRole(role: string | null | undefined): string {
  let t = (role || "").toLowerCase();

  t = t
    .replace(/\[[^\]]*\]/g, " ") // level codes: "Product Manager [IC4]"
    .replace(/\([^)]*\)/g, " ") // "(first PM)", "(Senior/Staff)"
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  for (const [pattern, expansion] of ROLE_ABBREVIATIONS) {
    t = t.replace(pattern, expansion);
  }

  return t.replace(/\s+/g, " ").trim().replace(/ /g, "-");
}

// ---------------------------------------------------------------------------
// Canonical job identity
// ---------------------------------------------------------------------------

export interface JobIdentity {
  company: string;
  role: string;
  jobUrl?: string | null;
  /** Req id straight from the ATS, when ingestion captured one. */
  externalId?: string | null;
  atsType?: string | null;
}

/** Tracking and session junk that must not vary the key. */
const IGNORED_QUERY_PARAMS = /^(utm_|ref$|source$|src$|gh_src$|lever-origin|t$|trk$)/i;

/**
 * Reduce a posting URL to the req it points at.
 *
 * Greenhouse, Ashby and Lever all mint globally unique req ids, so the board
 * slug is dropped: it is the one part of the URL that changes when a company
 * moves its careers page behind its own domain, and keeping it would re-split
 * the very rows this is meant to merge.
 */
export function jobKeyFromUrl(rawUrl: string | null | undefined): string | null {
  const url = (rawUrl || "").trim();
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const path = parsed.pathname.replace(/\/+$/, "");

  // Greenhouse: /{board}/jobs/{id}, or ?gh_jid={id} on the employer's own site.
  const ghJid = parsed.searchParams.get("gh_jid");
  if (ghJid) return `greenhouse:${ghJid}`;
  if (host.endsWith("greenhouse.io")) {
    const m = path.match(/\/jobs\/(\d+)/);
    if (m) return `greenhouse:${m[1]}`;
  }

  // Ashby: /{org}/{uuid}
  if (host.endsWith("ashbyhq.com")) {
    const m = path.match(/\/([0-9a-f-]{36})/i);
    if (m) return `ashby:${m[1].toLowerCase()}`;
  }

  // Lever: /{org}/{uuid}
  if (host.endsWith("lever.co")) {
    const m = path.match(/\/([0-9a-f-]{36})/i);
    if (m) return `lever:${m[1].toLowerCase()}`;
  }

  // Y Combinator: /companies/{co}/jobs/{id}-{slug} — the leading token is the id.
  if (host.endsWith("ycombinator.com")) {
    const m = path.match(/\/companies\/([^/]+)\/jobs\/([^/-]+)/);
    if (m) return `yc:${m[1].toLowerCase()}:${m[2]}`;
  }

  // Anything else: host + path, with tracking params dropped but meaningful
  // ones kept, since some career sites carry the req id in the query string.
  const kept = [...parsed.searchParams.entries()]
    .filter(([k]) => !IGNORED_QUERY_PARAMS.test(k))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return `url:${host}${path.toLowerCase()}${kept ? `?${kept}` : ""}`;
}

/**
 * The value that goes in `job_pipeline_entries.dedupe_key` and carries the
 * UNIQUE constraint. Never returns null — a row with no URL still gets an
 * identity, because null-URL rows were exactly the ones that slipped through
 * the old index.
 */
export function canonicalJobKey(job: JobIdentity): string {
  const fromUrl = jobKeyFromUrl(job.jobUrl);
  if (fromUrl) return fromUrl;

  const ats = (job.atsType || "").toLowerCase();
  if (job.externalId && (ats === "greenhouse" || ats === "ashby" || ats === "lever")) {
    return `${ats}:${job.externalId.toLowerCase()}`;
  }

  return `title:${normalizeCompany(job.company)}:${normalizeRole(job.role)}`;
}

// ---------------------------------------------------------------------------
// Per-company application cap
// ---------------------------------------------------------------------------

/**
 * How many applications may be open at one employer at once.
 *
 * The rule is **one**. Three applications landing on the same small company's
 * desk in a week reads as spray-and-pray and costs more than the extra shot is
 * worth. The exception is employers big enough that separate PM orgs genuinely
 * do not talk to each other — a Google Cloud req and a YouTube req are not
 * competing for the same recruiter's attention.
 *
 * The list is explicit on purpose. Inferring size from funding stage put Stedi
 * — Series C, ~100 people — in the same bucket as Snowflake.
 */
export const DEFAULT_COMPANY_CAP = 1;

/** Tens of thousands of employees, many independent product orgs. */
const VERY_LARGE_EMPLOYERS = new Set([
  "google", "amazon", "microsoft", "apple", "meta", "netflix", "nvidia",
  "intel", "ibm", "oracle", "sap", "salesforce", "adobe", "disney", "sony",
  "uber", "lyft", "airbnb", "doordash", "instacart", "pinterest", "reddit",
  "spotify", "shopify", "paypal", "block", "twitch", "linkedin", "roblox",
  "electronic-arts", "unity", "epic-games", "zynga", "2k-games", "take-two",
  "atlassian", "servicenow", "workday", "zoom", "palantir", "coinbase",
  "stripe", "databricks", "snowflake", "mongodb", "datadog", "cloudflare",
]);

/** Low thousands, but with distinctly separate product surfaces. */
const LARGE_EMPLOYERS = new Set([
  "anthropic", "openai", "figma", "notion", "discord", "gitlab", "asana",
  "brex", "plaid", "samsara", "toast", "affirm", "chime", "twilio", "elastic",
  "confluent", "hashicorp", "robinhood", "sofi", "zoominfo", "mercury",
]);

export interface CapOptions {
  /**
   * `job_target_companies.max_concurrent_applications`. Always wins — it is the
   * hand-set answer, and the lists below are only the fallback.
   */
  override?: number | null;
}

export function companyApplicationCap(
  company: string | null | undefined,
  opts: CapOptions = {},
): number {
  if (typeof opts.override === "number" && opts.override > 0) return opts.override;

  const key = normalizeCompany(company);
  if (VERY_LARGE_EMPLOYERS.has(key)) return 3;
  if (LARGE_EMPLOYERS.has(key)) return 2;
  return DEFAULT_COMPANY_CAP;
}

// ---------------------------------------------------------------------------
// The verdict
// ---------------------------------------------------------------------------

export type GuardOutcome =
  | "allowed"
  | "duplicate_application"
  | "claimed_by_other_agent"
  | "company_cap_reached";

export interface ExistingApplication {
  dedupeKey: string;
  companyKey: string;
  /** Set while another agent holds the lease. */
  claimedBy?: string | null;
  claimedAt?: string | null;
  /** Counts against the company cap only while the application is live. */
  active: boolean;
}

export interface GuardVerdict {
  outcome: GuardOutcome;
  allowed: boolean;
  reason: string;
  /** Applications already open at this employer, for the message. */
  conflicting: ExistingApplication[];
}

/**
 * How long an agent may hold a claim before another agent may take it.
 *
 * An agent that dies mid-cover-letter must not lock a role forever, but the
 * window has to outlast a real preparation run — reading the JD, tailoring a
 * resume, and drafting a letter took 20-40 minutes in practice.
 */
export const CLAIM_TTL_MINUTES = 90;

export function isClaimExpired(claimedAt: string | null | undefined, now: Date): boolean {
  if (!claimedAt) return true;
  const t = Date.parse(claimedAt);
  if (Number.isNaN(t)) return true;
  return now.getTime() - t > CLAIM_TTL_MINUTES * 60_000;
}

/**
 * Pure evaluation of whether an application may proceed.
 *
 * This is the readable statement of the rule and what the tests pin down; the
 * enforcing copy runs inside `job_claim_application` under a row lock. Two
 * implementations of one rule is a hazard, so keep them edited together — the
 * SQL function's comment points back here.
 */
export function evaluateApplication(
  job: JobIdentity,
  existing: ExistingApplication[],
  opts: { agentId: string; now?: Date; cap?: number } ,
): GuardVerdict {
  const now = opts.now ?? new Date();
  const key = canonicalJobKey(job);
  const companyKey = normalizeCompany(job.company);
  const cap = opts.cap ?? companyApplicationCap(job.company);

  const sameReq = existing.filter((e) => e.dedupeKey === key);

  // Already applied to this exact req — permanent, regardless of cap.
  const applied = sameReq.filter((e) => !e.claimedBy);
  if (applied.length > 0) {
    return {
      outcome: "duplicate_application",
      allowed: false,
      reason: `Already applied to this req (${key}). One application per posting, ever.`,
      conflicting: applied,
    };
  }

  // Another agent is mid-preparation on it.
  const heldByOther = sameReq.filter(
    (e) => e.claimedBy && e.claimedBy !== opts.agentId && !isClaimExpired(e.claimedAt, now),
  );
  if (heldByOther.length > 0) {
    return {
      outcome: "claimed_by_other_agent",
      allowed: false,
      reason: `Agent ${heldByOther[0].claimedBy} claimed this req at ${heldByOther[0].claimedAt}. Claims expire after ${CLAIM_TTL_MINUTES} minutes.`,
      conflicting: heldByOther,
    };
  }

  // Cap counts every *other* live application at the employer, claims included:
  // a claim that is about to become an application still occupies the slot.
  const liveAtCompany = existing.filter(
    (e) =>
      e.companyKey === companyKey &&
      e.dedupeKey !== key &&
      (e.active || (e.claimedBy && !isClaimExpired(e.claimedAt, now))),
  );

  if (liveAtCompany.length >= cap) {
    return {
      outcome: "company_cap_reached",
      allowed: false,
      reason:
        `${liveAtCompany.length} application(s) already open at ${job.company} (cap ${cap}). ` +
        `Apply to one role per company; wait for a rejection or withdraw the other first.`,
      conflicting: liveAtCompany,
    };
  }

  return { outcome: "allowed", allowed: true, reason: "No conflicting application.", conflicting: [] };
}
