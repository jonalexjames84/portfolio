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

  // A referral outperforms a cold application by a wide margin, so a contact
  // list at zero outreach is the largest structural gap in the search.
  if (input.uncontactedConnections > 0) {
    candidates.push({
      key: "referral_gap",
      label: `Reach out to ${input.uncontactedConnections} ${plural(input.uncontactedConnections, "contact", "contacts")}`,
      rationale:
        input.uncontactedConnections === input.totalConnections
          ? `Every contact on record is uncontacted. A referral beats a cold application; this channel is at zero.`
          : `Warm intros convert far better than cold applications.`,
      count: input.uncontactedConnections,
      weight: 3,
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
