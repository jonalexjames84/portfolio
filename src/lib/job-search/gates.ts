/**
 * Hard gates. A role that fails one never enters the funnel.
 *
 * These stay deterministic and keyword-driven on purpose. A gate is the one
 * place in this system that can silently shrink the pipeline to nothing, so it
 * must be cheap to run, exhaustively testable, and incapable of inventing a
 * rejection. Judgment calls belong in scoring and in Jon's review, not here.
 */

export interface GateInput {
  company: string;
  industry: string | null;
  location: string | null;
  jd_text: string | null;
}

export type EthicsFlag = "gambling" | "crypto" | "aggressive_monetization";

export interface GateResult {
  pass: boolean;
  gate: "location" | "ethics" | null;
  reason: string | null;
  flags: EthicsFlag[];
}

/** Moved from fit-score.ts, which keeps its own copy for scoring. */
export const BAY_AREA_HINTS = [
  "san francisco",
  "sf bay",
  "bay area",
  "oakland",
  "berkeley",
  "palo alto",
  "mountain view",
  "menlo park",
  "south san francisco",
  "redwood city",
  "sunnyvale",
  "san mateo",
  "san jose",
  "cupertino",
];

/** The most onsite days Jon will take in the Bay Area. */
export const MAX_ONSITE_DAYS = 3;

/**
 * A cadence digit has to stand on its own to count:
 *
 * - Not part of a longer number, so the trailing "5" of a zip code
 *   ("94105 days a week") can't be read as a 5-day cadence.
 * - Not immediately preceded by a unit/suite marker, so an address number
 *   ("Suite 4 days a week onsite") can't be read as a 4-day cadence.
 *
 * Both are "N" values that end up sitting next to cadence words purely
 * because `haystack()` concatenates `location` and `jd_text` with a single
 * space — they don't describe a work schedule.
 */
const DIGIT = String.raw`(?<!\b(?:suite|ste|apt|apartment|unit|floor|fl|bldg|building|room|rm)\.?\s)(?<!#)(?<!\d)(\d)(?!\d)`;

/**
 * An onsite marker phrased before the number ("Onsite 1 day", "In office 2
 * days per week", "On-site 3 days"). Postings write cadence both ways round;
 * without this, marker-before-number phrasing falls through every specific
 * pattern (which all expect number-then-marker) straight to the generic
 * "N days a week" — which then happily grabs a *different* number's day
 * count out of the same sentence (the remote days, not the onsite days).
 */
const ONSITE_MARKER = String.raw`(?:in\s*(?:the\s*)?office|on[-\s]?site)`;

/**
 * Ordered most-specific-first. A phrase that explicitly ties the number to
 * an onsite marker ("in office", "onsite") — in either word order — must win
 * over the generic "N days a week" form, or a sentence like "1 day in
 * office, other 4 days a week remote" gets read as 4 instead of 1, and
 * "Onsite 1 day, remote 4 days a week" the same way. Array order alone
 * decides which pattern reports the number when more than one matches.
 */
const CADENCE_PATTERNS: RegExp[] = [
  new RegExp(String.raw`${DIGIT}\s*days?\s*in\s*(?:the\s*)?office`, "i"),
  new RegExp(String.raw`${ONSITE_MARKER}\s*${DIGIT}\s*days?`, "i"),
  new RegExp(String.raw`${DIGIT}\s*days?\s*(?:in|on)[-\s]?site`, "i"),
  new RegExp(String.raw`${DIGIT}\s*x\s*\/?\s*(?:a\s*)?week`, "i"),
  new RegExp(String.raw`${DIGIT}\s*(?:\+)?\s*days?\s*(?:a|per)\s*week`, "i"),
];

export function onsiteDays(text: string): number | null {
  for (const re of CADENCE_PATTERNS) {
    const m = re.exec(text);
    if (m) {
      const n = Number(m[1]);
      if (n >= 0 && n <= 7) return n;
    }
  }
  return null;
}

const REMOTE_PATTERNS: RegExp[] = [
  /fully remote/i,
  /100%\s*remote/i,
  /remote[-\s]first/i,
  /work from anywhere/i,
  /\bremote\s*\(us/i,
  /\bus[-\s]remote\b/i,
  /\bremote,?\s*us\b/i,
];

function haystack(input: GateInput): string {
  return `${input.location ?? ""} ${input.jd_text ?? ""}`.toLowerCase();
}

/**
 * Hybrid beats remote language, always.
 *
 * "Remote-friendly, hybrid 3 days a week" is a hybrid role that used the word
 * remote for recruiting reasons. Reading it as remote is exactly the mistake
 * that puts a 3-day commute on the calendar.
 */
export function isRemoteUs(input: GateInput): boolean {
  const text = haystack(input);
  if (/\bhybrid\b/.test(text)) return false;
  if (REMOTE_PATTERNS.some((re) => re.test(text))) return true;
  return (input.location ?? "").trim().toLowerCase() === "remote";
}

function isBayArea(input: GateInput): boolean {
  const text = haystack(input);
  return BAY_AREA_HINTS.some((h) => text.includes(h));
}

export function locationGate(input: GateInput): GateResult {
  const pass = (reason: string | null): GateResult => ({
    pass: true,
    gate: null,
    reason,
    flags: [],
  });
  const reject = (reason: string): GateResult => ({
    pass: false,
    gate: "location",
    reason,
    flags: [],
  });

  if (isRemoteUs(input)) return pass(null);

  const text = haystack(input);
  const bay = isBayArea(input);
  const hybrid = /\bhybrid\b/.test(text);

  if (!bay) {
    if (hybrid) return reject("Hybrid role outside the Bay Area.");
    // No stated location at all, and nothing in the JD to go on either — this
    // is absence of evidence, not a stated disqualifying fact. Reject only on
    // what the posting actually says; a role we have no data about goes to
    // the human with a flag instead of being silently dropped.
    if (text.trim() === "") return pass("location_unknown");
    return reject("Not remote and outside the Bay Area.");
  }

  const days = onsiteDays(text);

  if (days === null) {
    // The user lives in the Bay Area, so a Bay Area role is geographically
    // fine by default. Only a *stated* cadence above the cap disqualifies it
    // — silence about remote/hybrid language is absence of evidence, not a
    // disqualifying fact, so it passes too, just under a different reason
    // than the hybrid-but-no-cadence case so a human can tell them apart.
    if (hybrid) return pass("cadence_assumed");
    return pass("cadence_unstated");
  }

  if (days <= MAX_ONSITE_DAYS) return pass(null);
  return reject(`Bay Area role requires ${days} days onsite (max is ${MAX_ONSITE_DAYS}).`);
}

/**
 * The rejection floor. Deliberately narrow.
 *
 * An earlier draft also rejected gambling, social casino, and crypto. Those
 * are Jon's actual record — Zynga, Jam City, Treasure DAO, Mythical — and
 * gating them out removes the roles where fifteen years of experience make him
 * strongest, and where a reply is most likely. A cleaner list and an empty
 * inbox is not a trade worth making.
 *
 * What is left holds only where both are true: no experience overlap, and a
 * line he would not cross for any offer.
 */
const ETHICS_REJECT: Record<string, string[]> = {
  defense: [
    "defense contractor",
    "defense technology",
    "weapons",
    "munitions",
    "military surveillance",
    "border enforcement",
    "immigration enforcement",
  ],
  surveillance: [
    "data broker",
    "people search",
    "location data resale",
    "covert tracking",
    "mass surveillance",
  ],
  predatory_finance: ["payday lend", "payday loan", "predatory lend", "debt trap"],
};

/**
 * Disclosure, not rejection. These render as a badge on the role card and
 * carry no score penalty — Jon decides with the full JD in front of him.
 */
const ETHICS_FLAG_TERMS: Record<EthicsFlag, string[]> = {
  gambling: [
    "casino",
    "sportsbook",
    "sports betting",
    "real-money gaming",
    "real money gaming",
    "slots",
  ],
  crypto: [
    "token launch",
    "tokenomics",
    "nft marketplace",
    "defi",
    "play-to-earn",
    "play to earn",
    "web3 gaming",
  ],
  aggressive_monetization: ["loot box", "lootbox", "gacha", "whale spend", "whale monetization"],
};

function identityText(input: GateInput): string {
  // Company and industry only — used by detectFlags, which is allowed to
  // read across the seam between them (flags carry no score penalty). The
  // reject decision below does NOT use this: see identityFields.
  return `${input.company} ${input.industry ?? ""}`.toLowerCase();
}

/**
 * Company and industry as independent strings, never joined.
 *
 * identityText() concatenates them with a single space so a reject term can
 * match across the seam even though neither field contains it on its own —
 * {company: "Meta Data", industry: "Broker-free platform"} joins into
 * "...data broker-free..." and would falsely match "data broker". Checking
 * each field on its own closes that without weakening multi-word matches
 * that live inside a single field ("Acme Data Broker LLC" still matches
 * "data broker" because both words are in `company`).
 */
function identityFields(input: GateInput): string[] {
  return [input.company.toLowerCase(), (input.industry ?? "").toLowerCase()];
}

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary match for a flag term.
 *
 * Plain substring matching flags "defi" inside "Deficit" and "slots" inside
 * "TimeSlots" — noise, since neither word has anything to do with crypto or
 * gambling. \b on both ends of every term (checked against each entry in
 * ETHICS_FLAG_TERMS) still matches hyphenated and multi-word terms like
 * "play-to-earn" and "web3 gaming" correctly, because hyphens and spaces are
 * already non-word characters that a boundary can sit against; no flag term
 * needed an exception.
 */
function matchesFlagTerm(text: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`).test(text);
}

export function detectFlags(input: GateInput): EthicsFlag[] {
  const text = `${identityText(input)} ${(input.jd_text ?? "").toLowerCase()}`;
  const found: EthicsFlag[] = [];
  for (const [flag, terms] of Object.entries(ETHICS_FLAG_TERMS) as Array<[EthicsFlag, string[]]>) {
    if (terms.some((t) => matchesFlagTerm(text, t))) found.push(flag);
  }
  return found;
}

/**
 * Matches on company and industry only, and checks each field
 * independently rather than a joined string.
 *
 * A fintech JD that says "we do not do predatory lending" must not trip the
 * gate — and a JD is full of sentences about what a company is not. Identity
 * is the reliable signal; prose is not. Checking company and industry apart
 * (identityFields) rather than concatenated (identityText) also stops a
 * term from matching across the seam between the two fields — see
 * identityFields' doc comment.
 */
export function ethicsGate(input: GateInput): GateResult {
  const targets = identityFields(input);
  const flags = detectFlags(input);

  for (const [category, terms] of Object.entries(ETHICS_REJECT)) {
    const hit = terms.find((t) => targets.some((field) => field.includes(t)));
    if (hit) {
      return {
        pass: false,
        gate: "ethics",
        reason: `${category}: matched "${hit}"`,
        flags,
      };
    }
  }

  return { pass: true, gate: null, reason: null, flags };
}

import { normalizeCompany } from "./application-guard";

export interface GateOverride {
  company_key: string;
  decision: "allow" | "deny";
  gate: "location" | "ethics" | null;
  reason: string;
}

/**
 * Location runs first. It is cheaper, it is the more common rejection, and a
 * role Jon cannot physically take is not worth an ethics opinion.
 *
 * Flags are computed regardless of outcome, so a rejected role still shows why
 * it was interesting — which is what makes the reject list readable when
 * tuning the gates later.
 */
export function evaluateGates(input: GateInput, overrides: GateOverride[]): GateResult {
  const key = normalizeCompany(input.company);
  const override = overrides.find((o) => o.company_key === key);
  const flags = detectFlags(input);

  if (override) {
    return override.decision === "allow"
      ? { pass: true, gate: null, reason: `override: ${override.reason}`, flags }
      : { pass: false, gate: override.gate, reason: `override: ${override.reason}`, flags };
  }

  const location = locationGate(input);
  if (!location.pass) return { ...location, flags };

  const ethics = ethicsGate(input);
  if (!ethics.pass) return ethics;

  // Carry the location reason forward — 'cadence_assumed' must survive.
  return { pass: true, gate: null, reason: location.reason, flags };
}
