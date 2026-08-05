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
  /** YYYY-MM-DD in Jon's timezone, not the raw timestamp. */
  createdDate: string;
  lastUpdate: string | null;
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
): { reason: string; rank: number } | null {
  if (row.status === "offer") {
    return { reason: "offer on the table", rank: 0 };
  }
  if (row.status === "interview") {
    return { reason: "interview in flight", rank: 1 };
  }
  if (row.status === "screen") {
    return { reason: "screen in flight", rank: 2 };
  }

  // `last_update` is nullable in practice; fall back to the created date so a
  // row missing one still ages rather than sitting silently forever.
  const since = daysBetween(row.lastUpdate || row.createdDate, today);

  if (row.status === "applied" && since >= FOLLOW_UP_DAYS) {
    return { reason: `no reply in ${since}d — follow up`, rank: 3 };
  }
  if (
    row.status === "saved" &&
    row.score != null &&
    row.score >= STRONG_FIT &&
    daysBetween(row.createdDate, today) >= FRESH_DAYS
  ) {
    return { reason: `${row.score} fit going stale`, rank: 4 };
  }

  return null;
}

/** True for a row added within the last `FRESH_DAYS` days and not yet closed out. */
export function isFresh(row: ApplicationRow, today: string): boolean {
  if (ARCHIVED_STATUSES.includes(row.status)) return false;
  const age = daysBetween(row.createdDate, today);
  return age >= 0 && age <= FRESH_DAYS;
}

function byScoreThenCompany(a: ApplicationRow, b: ApplicationRow): number {
  const diff = (b.score ?? -1) - (a.score ?? -1);
  return diff !== 0 ? diff : a.company.localeCompare(b.company);
}

export function buildPipelineViews(
  rows: ApplicationRow[],
  today: string
): PipelineViews {
  const urgent = rows
    .map((row) => {
      const urgency = urgencyOf(row, today);
      return urgency ? { row, urgency } : null;
    })
    .filter((x): x is { row: ApplicationRow; urgency: { reason: string; rank: number } } => x !== null)
    .sort(
      (a, b) => a.urgency.rank - b.urgency.rank || byScoreThenCompany(a.row, b.row)
    )
    .map(({ row, urgency }) => ({ ...row, reason: urgency.reason }));

  const fresh = rows
    .filter((row) => isFresh(row, today))
    .sort(byScoreThenCompany);

  const groups = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    rows: rows.filter((row) => row.status === status).sort(byScoreThenCompany),
  })).filter((group) => group.rows.length > 0);

  return { urgent, fresh, groups };
}
