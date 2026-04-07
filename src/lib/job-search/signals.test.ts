import { describe, it, expect } from "vitest";
import { computeSignals, type SignalInput } from "./signals";

function input(overrides: Partial<SignalInput> = {}): SignalInput {
  return {
    weekdaysPassed: 0,
    appsThisWeek: 0,
    appsTarget: 5,
    last10OutreachReplies: 5,
    staleActiveRoles: [],
    interviewsThisWeek: 0,
    savedCount: 10,
    newTopTierJobs: [],
    ...overrides,
  };
}

describe("computeSignals", () => {
  it("returns empty array when nothing is wrong", () => {
    expect(computeSignals(input())).toEqual([]);
  });

  it("flags slow apply pace mid-week", () => {
    const signals = computeSignals(
      input({ weekdaysPassed: 3, appsThisWeek: 1, appsTarget: 5 })
    );
    expect(signals.some((s) => s.id === "apply_pace_slow")).toBe(true);
  });

  it("does not flag apply pace before midweek", () => {
    const signals = computeSignals(
      input({ weekdaysPassed: 2, appsThisWeek: 1, appsTarget: 5 })
    );
    expect(signals.some((s) => s.id === "apply_pace_slow")).toBe(false);
  });

  it("flags zero replies on last 10 outreach", () => {
    const signals = computeSignals(input({ last10OutreachReplies: 0 }));
    expect(signals.some((s) => s.id === "outreach_no_replies")).toBe(true);
  });

  it("flags stale active roles >10d", () => {
    const signals = computeSignals(
      input({ staleActiveRoles: [{ id: "1", company: "Vercel", daysSince: 12 }] })
    );
    expect(signals.some((s) => s.id === "stale_active_role")).toBe(true);
  });

  it("flags hot streak with 3+ interviews this week", () => {
    const signals = computeSignals(input({ interviewsThisWeek: 3 }));
    expect(signals.some((s) => s.id === "hot_streak")).toBe(true);
  });

  it("flags pipeline drying up when saved < 5", () => {
    const signals = computeSignals(input({ savedCount: 3 }));
    expect(signals.some((s) => s.id === "pipeline_drying_up")).toBe(true);
  });

  it("flags new top-tier job (90+)", () => {
    const signals = computeSignals(
      input({
        newTopTierJobs: [{ id: "abc", company: "Anthropic", role: "PM", score: 92 }],
      })
    );
    expect(signals.some((s) => s.id === "new_top_tier_job")).toBe(true);
  });
});
