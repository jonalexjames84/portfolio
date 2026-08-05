import { normalizeCompany } from "./application-guard";
import type { PipelineStatus } from "./types";

/**
 * Three lenses on one table.
 *
 * The dashboard used to answer "what is the state of my search?" with eleven
 * panels drawn from six sources, which meant the same application appeared as a
 * ledger row, a kanban card, a funnel tick and a weekly task. This module
 * replaces that with `job_pipeline_entries` filtered three ways: what needs
 * hands today, what just arrived, and everything grouped by status.
 *
 * Urgency is derived, not stored. There is no `urgent` column and adding one
 * would need a human to keep it true; a rule that reads `status` and the dates
 * already on the row cannot go stale.
 */

export interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  status: PipelineStatus;
  jobUrl: string | null;
  /** Manual score when set, otherwise the computed one. Null when neither. */
  score: number | null;
  /** When it landed on Jon's board. YYYY-MM-DD in his timezone. */
  createdDate: string;
  /**
   * When the company posted it, when the board told us. Null for the 74 rows
   * entered by hand before ATS ingestion existed.
   */
  postedDate: string | null;
  lastUpdate: string | null;
}

/**
 * The date that answers "how recent is this job?".
 *
 * The posting date when the board published one, because a role scraped today
 * but posted in February is not new — and one night's ingest stamped 263 rows
 * with the same `created_at`, which made every one of them read as "today".
 */
export function recencyOf(row: ApplicationRow): {
  date: string;
  isPosted: boolean;
} {
  return row.postedDate
    ? { date: row.postedDate, isPosted: true }
    : { date: row.createdDate, isPosted: false };
}

/** An urgent row carries the reason it ranks, so the ordering is never taken on faith. */
export interface UrgentRow extends ApplicationRow {
  reason: string;
}

export interface StatusGroup {
  status: PipelineStatus;
  label: string;
  rows: ApplicationRow[];
}

export interface PipelineViews {
  urgent: UrgentRow[];
  fresh: ApplicationRow[];
  groups: StatusGroup[];
}

export const STATUS_ORDER: PipelineStatus[] = [
  "offer",
  "interview",
  "screen",
  "applied",
  "saved",
  "rejected",
  "passed",
];

export const STATUS_LABELS: Record<PipelineStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screen: "Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  passed: "Passed",
};

/** Closed out. Never urgent, never new, and grouped last. */
export const ARCHIVED_STATUSES: PipelineStatus[] = ["rejected", "passed"];

/** A role counts as new for its first three days on the board. */
export const FRESH_DAYS = 3;

/** Applied and silent for this long is a follow-up, not a wait. */
export const FOLLOW_UP_DAYS = 10;

/**
 * Past this, silence is an answer.
 *
 * Without the ceiling the follow-up rule had no upper bound, so five
 * applications from March sat at the top of "Do next" reading "no reply in
 * 127d — follow up". Nobody follows up on a four-month-old application; the
 * posting is filled and the req is closed. A row this old is archived, not
 * actioned.
 */
export const STALE_DAYS = 90;

/** A saved role this strong should not sit unapplied. */
export const STRONG_FIT = 85;

/** Whole days from one YYYY-MM-DD to another. Negative if `from` is later. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    throw new Error(`Expected YYYY-MM-DD dates, got: ${from} -> ${to}`);
  }
  return Math.round((b - a) / 86400000);
}

/**
 * Why a row needs Jon today, or null if it does not. Lower rank sorts first.
 *
 * A live conversation always outranks paperwork: an offer left unanswered or an
 * interview loop left unprepped costs more than an application not sent.
 */
export function urgencyOf(
  row: ApplicationRow,
  today: string
): { reason: string; rank: number; days: number } | null {
  // `last_update` is nullable in practice; fall back to the created date so a
  // row missing one still ages rather than sitting silently forever.
  const since = daysBetween(row.lastUpdate || row.createdDate, today);

  if (row.status === "offer") {
    return { reason: "offer on the table", rank: 0, days: since };
  }
  if (row.status === "interview") {
    return { reason: "interview in flight", rank: 1, days: since };
  }
  if (row.status === "screen") {
    return { reason: "screen in flight", rank: 2, days: since };
  }

  if (row.status === "applied" && since >= FOLLOW_UP_DAYS && since <= STALE_DAYS) {
    return { reason: `no reply in ${since}d — follow up`, rank: 3, days: since };
  }
  // Measured from when it landed on the board, not when it was posted: this
  // rule is about how long Jon has sat on a strong lead, which a posting date
  // says nothing about.
  const age = daysBetween(row.createdDate, today);
  if (
    row.status === "saved" &&
    row.score != null &&
    row.score >= STRONG_FIT &&
    age >= FRESH_DAYS &&
    age <= STALE_DAYS
  ) {
    return { reason: `${row.score} fit going stale`, rank: 4, days: age };
  }

  return null;
}

/**
 * True for a role posted within the last `FRESH_DAYS` days and not yet closed.
 *
 * Measured from the posting date, so a role the board published in June does
 * not appear under "New" merely because tonight's ingest was the first to see
 * it. Rows with no posting date fall back to when they were added.
 */
export function isFresh(row: ApplicationRow, today: string): boolean {
  if (ARCHIVED_STATUSES.includes(row.status)) return false;
  const age = daysBetween(recencyOf(row).date, today);
  return age >= 0 && age <= FRESH_DAYS;
}

function byScoreThenCompany(a: ApplicationRow, b: ApplicationRow): number {
  const diff = (b.score ?? -1) - (a.score ?? -1);
  return diff !== 0 ? diff : a.company.localeCompare(b.company);
}

/**
 * Newest first. Score only breaks a tie between roles added the same day.
 *
 * This is the order for browsing — "what came in" — as distinct from the urgent
 * view, which is a work queue and stays oldest-first.
 */
function byRecencyThenScore(a: ApplicationRow, b: ApplicationRow): number {
  const diff = recencyOf(b).date.localeCompare(recencyOf(a).date);
  return diff !== 0 ? diff : byScoreThenCompany(a, b);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * How long a row has been on the board, in as few characters as possible.
 *
 * Days for the first month, because "12d" is what decides whether to act; a
 * calendar date after that, because "127d" is a number nobody converts. Built
 * from the string rather than a Date so it cannot drift a day across a
 * timezone, which is the bug the rest of this module exists to avoid.
 */
export function formatAge(createdDate: string, today: string): string {
  const days = daysBetween(createdDate, today);
  if (days < 0) return "scheduled";
  if (days === 0) return "today";
  if (days === 1) return "1d";
  if (days < 30) return `${days}d`;

  const [y, m, d] = createdDate.split("-");
  const label = `${MONTHS[Number(m) - 1]} ${Number(d)}`;
  const thisYear = today.slice(0, 4);
  return y === thisYear ? label : `${label} '${y.slice(2)}`;
}

export function buildPipelineViews(
  rows: ApplicationRow[],
  today: string
): PipelineViews {
  type Scored = {
    row: ApplicationRow;
    urgency: { reason: string; rank: number; days: number };
  };

  const urgent = rows
    .map((row) => {
      const urgency = urgencyOf(row, today);
      return urgency ? { row, urgency } : null;
    })
    .filter((x): x is Scored => x !== null)
    // Oldest first inside a rank, not highest score. A follow-up list is a
    // queue of neglect, and ordering five of them by fit score printed
    // 125d, 127d, 126d, 126d, 127d down the page — which reads as no order
    // at all. Score only breaks a tie between rows of the same age.
    .sort(
      (a, b) =>
        a.urgency.rank - b.urgency.rank ||
        b.urgency.days - a.urgency.days ||
        byScoreThenCompany(a.row, b.row)
    )
    .map(({ row, urgency }) => ({ ...row, reason: urgency.reason }));

  const fresh = rows
    .filter((row) => isFresh(row, today))
    .sort(byRecencyThenScore);

  const groups = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    rows: rows.filter((row) => row.status === status).sort(byRecencyThenScore),
  })).filter((group) => group.rows.length > 0);

  return { urgent, fresh, groups };
}

/** One company's roles, kept in the order the list already sorted them. */
export interface CompanyGroup<T extends ApplicationRow = ApplicationRow> {
  /** Normalized, so "Assort Health" and "assort-health" are one employer. */
  key: string;
  /** The spelling to show — the first one the sorted list used. */
  company: string;
  rows: T[];
}

/**
 * Collapse a sorted list so a company appears once.
 *
 * Scopely has eleven open roles, Brex and Roblox ten each. Listed flat they
 * bury everything else, and the ordering already established by the caller is
 * what decides where the company sits — so groups keep the position of their
 * best row rather than being re-sorted here.
 */
export function groupByCompany<T extends ApplicationRow>(
  rows: T[]
): CompanyGroup<T>[] {
  const groups = new Map<string, CompanyGroup<T>>();

  for (const row of rows) {
    const key = normalizeCompany(row.company) || row.company.toLowerCase();
    const existing = groups.get(key);
    if (existing) {
      existing.rows.push(row);
    } else {
      groups.set(key, { key, company: row.company, rows: [row] });
    }
  }

  return [...groups.values()];
}
