/**
 * Date helpers pinned to the timezone Jon actually lives the search in.
 *
 * Vercel runs functions in UTC, so `new Date().getDay()` on the server is the
 * UTC weekday, not his. That is not cosmetic: `generate-weekly-plan` fires at
 * 06:00 UTC Monday — 23:00 PT *Sunday* — and its old "next Monday" math saw a
 * Monday, added 7 days, and planned the following week while pruning the
 * current week's tasks as if they were last week's.
 *
 * Every weekday or day-boundary decision in the job search goes through here so
 * that class of bug can only be fixed once.
 */

export const SEARCH_TZ = "America/Los_Angeles";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The YYYY-MM-DD date an instant falls on in `timeZone`.
 *
 * en-CA formats as ISO (2026-08-05), and Intl handles DST, so this stays right
 * across the March/November shifts that a fixed UTC offset would get wrong.
 */
export function localDateStr(instant: Date, timeZone: string = SEARCH_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Day of week for a YYYY-MM-DD string. 0 = Sunday, matching Date#getDay. */
export function dayOfWeek(dateStr: string): number {
  assertIsoDate(dateStr);
  // Parsed as UTC midnight deliberately: the string already carries the local
  // calendar date, so no further zone conversion should happen to it.
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay();
}

/** Shift a YYYY-MM-DD string by whole days. Negative goes backwards. */
export function addDays(dateStr: string, days: number): string {
  assertIsoDate(dateStr);
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

/** The Monday of the week containing `dateStr`. Sunday belongs to the week that just ended. */
export function mondayOf(dateStr: string): string {
  const day = dayOfWeek(dateStr);
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(dateStr, offset);
}

/**
 * The Monday of the week we are about to plan.
 *
 * On a Monday this returns that same Monday rather than jumping a week — which
 * is the whole bug. Any other day returns the next Monday, so a Sunday-night
 * run plans tomorrow. Correct whether the cron lands on Sunday PT (its normal
 * schedule) or drifts onto Monday PT after a DST shift or a manual re-run.
 */
export function upcomingMonday(dateStr: string): string {
  const day = dayOfWeek(dateStr);
  if (day === 1) return dateStr;
  return addDays(dateStr, day === 0 ? 1 : 8 - day);
}

/**
 * Monday–Sunday bounds of the week containing `dateStr`, plus how many weekdays
 * have elapsed — used to pace targets ("3 of 5 days in, 2 of 5 applications").
 * Saturday and Sunday both read as a full 5, since the working week is over.
 */
export function weekBounds(dateStr: string): {
  weekStartStr: string;
  weekEndStr: string;
  dayOfWeek: number;
  weekdaysPassed: number;
} {
  const day = dayOfWeek(dateStr);
  const weekStartStr = mondayOf(dateStr);
  return {
    weekStartStr,
    weekEndStr: addDays(weekStartStr, 6),
    dayOfWeek: day,
    weekdaysPassed: day === 0 ? 5 : Math.min(day, 5),
  };
}

function assertIsoDate(dateStr: string): void {
  if (!ISO_DATE.test(dateStr)) {
    throw new Error(`Expected a YYYY-MM-DD date, got: ${dateStr}`);
  }
}
