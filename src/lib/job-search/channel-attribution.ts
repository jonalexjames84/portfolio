/**
 * Which channels actually produce conversations.
 *
 * The point of this module is to answer one question: given a finite number of
 * hours, does the next one go into LinkedIn, into warm intros, or into applying
 * straight through company boards? Everything here is shaped to make that
 * comparison honest rather than flattering.
 *
 * KNOWN UNDERCOUNT — read before quoting a response rate.
 * `status` is the row's *current* state, not its history. A role that got a
 * screen and was then rejected reads as `rejected`, indistinguishable from one
 * that was never answered. So `responded` is a floor, not a true count, and
 * channels that move fast to a decision look worse than they are. `closed` is
 * reported alongside it so the gap is visible instead of hidden: a channel with
 * a low response rate and a big `closed` count deserves a manual look before
 * you cut it.
 *
 * The fix would be a status-transition log. Until that exists, treat these
 * numbers as directional — good enough to spot a channel that produces nothing
 * at all, not precise enough to split hairs between two similar ones.
 */

import type { Channel, PipelineEntry, PipelineStatus } from "./types";
import { CHANNEL_LABELS } from "./types";

/** Statuses that prove a human on the other side engaged. */
const RESPONDED: PipelineStatus[] = ["screen", "interview", "offer"];

/** Statuses that reached a real interview. */
const INTERVIEWED: PipelineStatus[] = ["interview", "offer"];

/** Statuses that ended without an offer. */
const CLOSED: PipelineStatus[] = ["rejected", "passed"];

/** The bucket unattributed rows report under. Not a Channel — it's the absence of one. */
export const UNATTRIBUTED = "unattributed" as const;

export type ChannelKey = Channel | typeof UNATTRIBUTED;

export interface ChannelStat {
  channel: ChannelKey;
  label: string;
  /** Every row on this channel, applied or not. */
  total: number;
  /** Rows actually submitted — the denominator for every rate below. */
  applied: number;
  /** Currently at screen or beyond. A floor: see the undercount note above. */
  responded: number;
  /** Currently at interview or beyond. */
  interviewed: number;
  offers: number;
  /** Applied and now rejected or passed. Context for a low response rate. */
  closed: number;
  /** Applied and still awaiting any signal. */
  pending: number;
  /** responded / applied, 0–100, rounded. 0 when nothing has been applied to. */
  responseRate: number;
  /** interviewed / applied, 0–100, rounded. */
  interviewRate: number;
}

export interface ChannelReport {
  stats: ChannelStat[];
  totalApplied: number;
  totalResponded: number;
  /** Rows with no channel set. Prompt to attribute them, not a channel result. */
  unattributedCount: number;
  /**
   * The channel worth more hours, or null when the evidence is too thin.
   * Requires MIN_SAMPLE applications so a single lucky referral cannot outrank
   * a channel with a real track record.
   */
  bestChannel: ChannelStat | null;
}

/**
 * Below this many applications a rate is noise. One reply out of one
 * application is 100%, and acting on that would be the whole trap this report
 * exists to avoid.
 */
export const MIN_SAMPLE = 5;

type EntryLike = Pick<PipelineEntry, "status" | "channel" | "applied_date">;

export function computeChannelStats(entries: EntryLike[]): ChannelReport {
  const buckets = new Map<ChannelKey, ChannelStat>();

  for (const entry of entries) {
    const key: ChannelKey = entry.channel ?? UNATTRIBUTED;
    const stat = buckets.get(key) ?? blankStat(key);

    stat.total++;

    // Applied-or-beyond is the honest denominator. A `saved` row cost no real
    // effort, so counting it would punish whichever channel surfaces the most
    // leads — which is exactly backwards.
    const hasApplied =
      entry.applied_date != null || entry.status !== "saved";

    if (hasApplied) {
      stat.applied++;
      if (RESPONDED.includes(entry.status)) stat.responded++;
      if (INTERVIEWED.includes(entry.status)) stat.interviewed++;
      if (entry.status === "offer") stat.offers++;
      if (CLOSED.includes(entry.status)) stat.closed++;
      if (entry.status === "applied") stat.pending++;
    }

    buckets.set(key, stat);
  }

  const stats = [...buckets.values()].map((s) => ({
    ...s,
    responseRate: rate(s.responded, s.applied),
    interviewRate: rate(s.interviewed, s.applied),
  }));

  // Most-applied first, so the report opens on where the hours already went.
  stats.sort((a, b) => b.applied - a.applied || b.total - a.total);

  const eligible = stats.filter(
    (s) => s.channel !== UNATTRIBUTED && s.applied >= MIN_SAMPLE
  );
  const bestChannel =
    eligible.length > 0
      ? eligible.reduce((best, s) =>
          s.responseRate > best.responseRate ? s : best
        )
      : null;

  return {
    stats,
    totalApplied: stats.reduce((n, s) => n + s.applied, 0),
    totalResponded: stats.reduce((n, s) => n + s.responded, 0),
    unattributedCount: buckets.get(UNATTRIBUTED)?.total ?? 0,
    bestChannel,
  };
}

function blankStat(channel: ChannelKey): ChannelStat {
  return {
    channel,
    label: channel === UNATTRIBUTED ? "Unattributed" : CHANNEL_LABELS[channel],
    total: 0,
    applied: 0,
    responded: 0,
    interviewed: 0,
    offers: 0,
    closed: 0,
    pending: 0,
    responseRate: 0,
    interviewRate: 0,
  };
}

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}
