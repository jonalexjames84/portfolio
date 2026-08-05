/**
 * Turn the raw `job_applications` ledger into the three questions Jon actually
 * asks it:
 *
 *   1. What is waiting on me right now?
 *   2. What has gone out, and when do I chase it?
 *   3. Where can I not apply, even though the role looks open?
 *
 * The third one is the non-obvious value. A role can be live, well-scored, and
 * still unavailable because the company already has an open application — that
 * is what killed the Anthropic Web PM req after its letter was already written.
 * The pipeline board cannot show that, because the block lives one table over.
 */

import {
  companyApplicationCap,
  normalizeCompany,
  normalizeRole,
} from "./application-guard";

export type LedgerStatus =
  | "claimed"
  | "prepared"
  | "submitted"
  | "closed"
  | "withdrawn";

export interface LedgerRow {
  id: string;
  company: string;
  company_key: string;
  role: string;
  job_url: string | null;
  status: LedgerStatus;
  agent_id: string;
  claimed_at: string;
  prepared_at: string | null;
  submitted_at: string | null;
  closed_at: string | null;
  notes: string | null;
}

/** Statuses that hold a company slot. `closed` and `withdrawn` release it. */
const OCCUPIES_SLOT: ReadonlySet<LedgerStatus> = new Set([
  "claimed",
  "prepared",
  "submitted",
]);

export interface WaitingItem {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  /** What specifically is blocking it, pulled from the note when stated. */
  blocker: string | null;
  /** True when another agent prepared it, so Jon knows it isn't his draft. */
  preparedByAgent: boolean;
}

export interface SubmittedItem {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  submittedOn: string | null;
  daysSince: number | null;
  /** Follow-up is due at a week, which is the cadence already in the tasks. */
  followUpDue: boolean;
}

export interface CompanySlot {
  companyKey: string;
  company: string;
  used: number;
  cap: number;
  atCap: boolean;
  roles: string[];
  /** Saved-but-unreachable roles at this company. Empty means nothing is lost. */
  blockedRoles: string[];
}

export interface LedgerReport {
  waiting: WaitingItem[];
  submitted: SubmittedItem[];
  /** Only companies at cap that are actually costing Jon a scored role. */
  blocking: CompanySlot[];
  closedCount: number;
  totalOpen: number;
}

const FOLLOW_UP_DAYS = 7;

/**
 * Blockers are written into the note prose by whichever agent parked the
 * application, so this reads rather than infers. An unrecognised note yields
 * null and the UI just says "waiting" — better than guessing wrong about why.
 */
function extractBlocker(notes: string | null): string | null {
  if (!notes) return null;
  const patterns: Array<[RegExp, string]> = [
    [/hCaptcha/i, "hCaptcha"],
    [/\b8-?character\b.*\bcode\b|emailed .*verification code/i, "emailed code"],
    [/demographic/i, "demographic questions"],
    [/dropdowns? (still )?unset|six dropdowns/i, "unset dropdowns"],
    [/company cap/i, "company cap"],
  ];
  for (const [pattern, label] of patterns) {
    if (pattern.test(notes)) return label;
  }
  return null;
}

function daysBetween(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

/** A saved pipeline row: a role Jon has scored but not applied to. */
export interface SavedRole {
  companyKey: string;
  role: string;
}

export function buildLedgerReport(
  rows: LedgerRow[],
  opts: {
    now?: Date;
    capOverrides?: Record<string, number>;
    /**
     * Saved roles, used to decide whether being at cap actually costs
     * anything. Without this, every company with one application reads as
     * "at cap", which is true and useless — it just restates the list above.
     */
    savedRoles?: SavedRole[];
  } = {},
): LedgerReport {
  const now = opts.now ?? new Date();
  const overrides = opts.capOverrides ?? {};

  const savedByCompany = new Map<string, string[]>();
  for (const s of opts.savedRoles ?? []) {
    const list = savedByCompany.get(s.companyKey);
    if (list) list.push(s.role);
    else savedByCompany.set(s.companyKey, [s.role]);
  }

  const waiting: WaitingItem[] = rows
    .filter((r) => r.status === "prepared" || r.status === "claimed")
    .map((r) => ({
      id: r.id,
      company: r.company,
      role: r.role,
      jobUrl: r.job_url,
      blocker: extractBlocker(r.notes),
      // A backfilled row is Jon's own history, not another agent's live work.
      preparedByAgent: /^session-/.test(r.agent_id),
    }))
    .sort((a, b) => a.company.localeCompare(b.company));

  const submitted: SubmittedItem[] = rows
    .filter((r) => r.status === "submitted")
    .map((r) => {
      const daysSince = daysBetween(r.submitted_at, now);
      return {
        id: r.id,
        company: r.company,
        role: r.role,
        jobUrl: r.job_url,
        submittedOn: r.submitted_at ? r.submitted_at.slice(0, 10) : null,
        daysSince,
        followUpDue: daysSince !== null && daysSince >= FOLLOW_UP_DAYS,
      };
    })
    .sort((a, b) => (b.daysSince ?? -1) - (a.daysSince ?? -1));

  // Slot usage, so an at-cap company is visible before its letter gets written.
  const byCompany = new Map<string, LedgerRow[]>();
  for (const r of rows) {
    if (!OCCUPIES_SLOT.has(r.status)) continue;
    const key = r.company_key || normalizeCompany(r.company);
    const list = byCompany.get(key);
    if (list) list.push(r);
    else byCompany.set(key, [r]);
  }

  const slots: CompanySlot[] = [...byCompany.entries()].map(([companyKey, list]) => {
    const cap = companyApplicationCap(list[0].company, {
      override: overrides[companyKey],
    });

    // A role being worked is often still `saved` on the pipeline, because
    // `prepared` is a ledger state with no pipeline equivalent. Listing it as
    // blocked would tell Jon he cannot apply to the thing he is applying to.
    const held = new Set(list.map((r) => normalizeRole(r.role)));
    const blockedRoles = (savedByCompany.get(companyKey) ?? []).filter(
      (role) => !held.has(normalizeRole(role)),
    );

    return {
      companyKey,
      company: list[0].company,
      used: list.length,
      cap,
      atCap: list.length >= cap,
      roles: list.map((r) => r.role),
      blockedRoles,
    };
  });

  // Surface a company only when the cap is costing a role Jon actually saved.
  // "Stedi is 1/1" is true of every applied-to company and tells him nothing.
  const blocking = slots
    .filter((s) => s.atCap && s.blockedRoles.length > 0)
    .sort(
      (a, b) =>
        b.blockedRoles.length - a.blockedRoles.length ||
        a.company.localeCompare(b.company),
    );

  return {
    waiting,
    submitted,
    blocking,
    closedCount: rows.filter((r) => r.status === "closed").length,
    totalOpen: waiting.length + submitted.length,
  };
}
