/**
 * What to do next, ranked by how far it moves the north star.
 *
 * This exists because the task list had 73 open rows and 270 saved roles, all
 * undifferentiated, which meant the two highest-leverage moves available — nine
 * finished applications sitting unsent, and twenty-six warm contacts none of
 * whom had been approached — were invisible.
 *
 * Ranking is a pure function on purpose. "What matters most" is the one piece
 * of logic here worth testing, and it must not decay into JSX ordering.
 */

export type ActionKey =
  | "send_prepared"
  | "referral_live"
  | "referral_gap"
  | "follow_up"
  | "stale_active"
  | "interview_prep";

export interface NextAction {
  key: ActionKey;
  /** Imperative, countable. "Send 9 finished applications". */
  label: string;
  /** Why this sits where it does. Shown, not implied. */
  rationale: string;
  count: number;
  /** 3 = do it today, 1 = worth knowing. Drives the visual weight. */
  weight: 1 | 2 | 3;
  href: string | null;
}

export interface NextActionInput {
  /** Applications written and verified but not sent. */
  preparedCount: number;
  /** Connections on record who have never been contacted. */
  uncontactedConnections: number;
  /** Total connections, used to phrase the referral gap honestly. */
  totalConnections: number;
  /**
   * Uncontacted contacts who work somewhere an application is already live.
   *
   * These are worth far more than the rest of the list and must not be averaged
   * into it. On 2026-08-05 the contact list had 26 names and covered exactly one
   * of seventeen companies with a live application — "reach out to 26 contacts"
   * was the wrong instruction, and a raw count is what made it look right.
   */
  uncontactedAtLiveCompanies?: number;
  /**
   * How many distinct employers those contacts represent. Kept separate
   * because the two numbers differ a lot — 8 contacts across 2 companies — and
   * labelling contacts as companies overstates the reach considerably.
   */
  liveCompaniesWithContacts?: number;
  /** Submitted, past the follow-up window, no reply. */
  followUpsDue: number;
  /** Live screens/interviews with no movement in >10 days. */
  staleActive: number;
  /** Interviews currently scheduled or in flight. */
  interviewsInFlight: number;
}

/** At most this many rows. Beyond five, a priority list is just a list. */
export const MAX_ACTIONS = 5;

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export function rankNextActions(input: NextActionInput): NextAction[] {
  const candidates: NextAction[] = [];

  // Highest: the work is already done. Nothing else converts effort to funnel
  // movement at this rate.
  if (input.preparedCount > 0) {
    candidates.push({
      key: "send_prepared",
      label: `Send ${input.preparedCount} finished ${plural(input.preparedCount, "application", "applications")}`,
      rationale:
        "Written, verified, and waiting on a captcha or a dropdown. Minutes each.",
      count: input.preparedCount,
      weight: 3,
      href: "/dashboard/job-search",
    });
  }

  // A referral where an application is already in flight is the single highest
  // -converting move available, so it is ranked and phrased separately from the
  // rest of the contact list rather than folded into one count.
  const atLive = input.uncontactedAtLiveCompanies ?? 0;
  const liveCompanies = input.liveCompaniesWithContacts ?? 0;
  if (atLive > 0) {
    const where =
      liveCompanies > 0
        ? `${liveCompanies} ${plural(liveCompanies, "company", "companies")} you've applied to`
        : "a company you've applied to";
    candidates.push({
      key: "referral_live",
      label: `Get a referral at ${where}`,
      rationale: `${atLive} ${plural(atLive, "contact", "contacts")} there, none contacted. An application already in flight plus someone inside beats anything else on this list.`,
      count: atLive,
      weight: 3,
      href: "/job-search/connections",
    });
  }

  // The remainder of the list can only produce introductions, not referrals —
  // a weaker and slower play, so it sits a tier down.
  const coldOnly = Math.max(0, input.uncontactedConnections - atLive);
  if (coldOnly > 0) {
    candidates.push({
      key: "referral_gap",
      label: `Ask ${coldOnly} ${plural(coldOnly, "contact", "contacts")} for intros`,
      rationale:
        input.uncontactedConnections === input.totalConnections
          ? "Nobody on the list has been contacted. None of them work where you've applied, so the ask is an introduction — name the companies."
          : "None of these work at a company you've applied to. Ask for an intro, not a referral.",
      count: coldOnly,
      weight: 2,
      href: "/job-search/connections",
    });
  }

  // Cheap, and the only thing that rescues an application already sent.
  if (input.followUpsDue > 0) {
    candidates.push({
      key: "follow_up",
      label: `Follow up on ${input.followUpsDue} ${plural(input.followUpsDue, "application", "applications")}`,
      rationale: "Past a week with no reply. One message reopens the thread.",
      count: input.followUpsDue,
      weight: 2,
      href: "/dashboard/job-search",
    });
  }

  // A stalled late-stage role is worth more than a new early-stage one.
  if (input.staleActive > 0) {
    candidates.push({
      key: "stale_active",
      label: `Chase ${input.staleActive} stalled ${plural(input.staleActive, "role", "roles")}`,
      rationale:
        "Already past the application stage and gone quiet — the most expensive thing to lose.",
      count: input.staleActive,
      weight: 2,
      href: "/job-search",
    });
  }

  if (input.interviewsInFlight > 0) {
    candidates.push({
      key: "interview_prep",
      label: `Prep ${input.interviewsInFlight} ${plural(input.interviewsInFlight, "interview", "interviews")}`,
      rationale: "Furthest along the funnel. Protect it.",
      count: input.interviewsInFlight,
      weight: 2,
      href: "/job-search/interviews",
    });
  }

  // Weight first, then the insertion order above, which encodes precedence
  // between kinds of work. Deliberately NOT by count: "9 applications" and "26
  // contacts" are different units, and sorting across them by size ranked the
  // contact list above nine finished applications purely because 26 > 9.
  // Array#sort is stable, so equal weights keep the order they were pushed in.
  return candidates.sort((a, b) => b.weight - a.weight).slice(0, MAX_ACTIONS);
}
