import { describe, it, expect } from "vitest";
import {
  computeChannelStats,
  UNATTRIBUTED,
  MIN_SAMPLE,
} from "./channel-attribution";
import type { Channel, PipelineStatus } from "./types";

type Row = {
  status: PipelineStatus;
  channel: Channel | null;
  applied_date: string | null;
};

function row(
  channel: Channel | null,
  status: PipelineStatus,
  applied = "2026-08-01"
): Row {
  return { channel, status, applied_date: status === "saved" ? null : applied };
}

/** n rows on one channel, all at the same status. */
function rows(channel: Channel | null, status: PipelineStatus, n: number): Row[] {
  return Array.from({ length: n }, () => row(channel, status));
}

describe("computeChannelStats", () => {
  it("returns an empty report for no entries", () => {
    const report = computeChannelStats([]);
    expect(report.stats).toEqual([]);
    expect(report.totalApplied).toBe(0);
    expect(report.bestChannel).toBeNull();
  });

  it("groups by channel and counts the funnel", () => {
    const report = computeChannelStats([
      row("linkedin", "applied"),
      row("linkedin", "screen"),
      row("linkedin", "interview"),
      row("referral", "offer"),
    ]);

    const linkedin = report.stats.find((s) => s.channel === "linkedin")!;
    expect(linkedin.applied).toBe(3);
    expect(linkedin.responded).toBe(2);
    expect(linkedin.interviewed).toBe(1);
    expect(linkedin.pending).toBe(1);
    expect(linkedin.responseRate).toBe(67);

    const referral = report.stats.find((s) => s.channel === "referral")!;
    expect(referral.offers).toBe(1);
    expect(referral.interviewed).toBe(1);
    expect(referral.responseRate).toBe(100);
  });

  it("excludes saved rows from the denominator so lead-generating channels aren't punished", () => {
    const report = computeChannelStats([
      ...rows("ats_direct", "saved", 40),
      row("ats_direct", "screen"),
      row("ats_direct", "applied"),
    ]);

    const ats = report.stats.find((s) => s.channel === "ats_direct")!;
    expect(ats.total).toBe(42);
    expect(ats.applied).toBe(2);
    expect(ats.responseRate).toBe(50);
  });

  it("counts a row as applied when status moved past saved even without an applied_date", () => {
    const report = computeChannelStats([
      { channel: "referral", status: "screen", applied_date: null },
    ]);
    expect(report.stats[0].applied).toBe(1);
    expect(report.stats[0].responded).toBe(1);
  });

  it("buckets null channels as unattributed rather than dropping them", () => {
    const report = computeChannelStats([
      row(null, "applied"),
      row(null, "screen"),
      row("linkedin", "applied"),
    ]);

    const un = report.stats.find((s) => s.channel === UNATTRIBUTED)!;
    expect(un.label).toBe("Unattributed");
    expect(un.total).toBe(2);
    expect(report.unattributedCount).toBe(2);
  });

  it("reports closed alongside responded so the undercount is visible", () => {
    const report = computeChannelStats([
      ...rows("cold_outreach", "rejected", 8),
      row("cold_outreach", "screen"),
    ]);

    const cold = report.stats.find((s) => s.channel === "cold_outreach")!;
    expect(cold.applied).toBe(9);
    expect(cold.closed).toBe(8);
    expect(cold.responded).toBe(1);
    // The point: 11% looks terrible, and the closed count is what tells you
    // whether that is real or just rows that already resolved.
    expect(cold.responseRate).toBe(11);
  });

  it("sorts by volume applied, so the report opens on where the hours went", () => {
    const report = computeChannelStats([
      row("referral", "screen"),
      ...rows("ats_direct", "applied", 10),
      ...rows("linkedin", "applied", 4),
    ]);
    expect(report.stats.map((s) => s.channel)).toEqual([
      "ats_direct",
      "linkedin",
      "referral",
    ]);
  });
});

describe("bestChannel", () => {
  it("ignores channels below the sample floor, so one lucky referral cannot win", () => {
    const report = computeChannelStats([
      row("referral", "offer"), // 100% on a single application
      ...rows("linkedin", "screen", 5),
      ...rows("linkedin", "applied", 5),
    ]);

    expect(report.bestChannel?.channel).toBe("linkedin");
    expect(report.bestChannel?.responseRate).toBe(50);
  });

  it("returns null when no channel has enough applications to judge", () => {
    const report = computeChannelStats([
      row("referral", "offer"),
      row("linkedin", "screen"),
    ]);
    expect(report.bestChannel).toBeNull();
  });

  it("never nominates the unattributed bucket", () => {
    const report = computeChannelStats([
      ...rows(null, "screen", 20),
      ...rows("linkedin", "applied", MIN_SAMPLE),
    ]);
    expect(report.bestChannel?.channel).toBe("linkedin");
  });

  it("picks the highest response rate once channels clear the floor", () => {
    const report = computeChannelStats([
      ...rows("ats_direct", "applied", 20), // 0%
      ...rows("referral", "screen", 3),
      ...rows("referral", "applied", 3), // 50% on 6
    ]);
    expect(report.bestChannel?.channel).toBe("referral");
  });
});
