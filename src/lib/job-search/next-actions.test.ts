import { describe, it, expect } from "vitest";
import { rankNextActions, MAX_ACTIONS, type NextActionInput } from "./next-actions";

const EMPTY: NextActionInput = {
  preparedCount: 0,
  uncontactedConnections: 0,
  totalConnections: 0,
  followUpsDue: 0,
  staleActive: 0,
  interviewsInFlight: 0,
};

describe("rankNextActions", () => {
  it("omits a driver with a zero count rather than rendering an empty row", () => {
    expect(rankNextActions(EMPTY)).toEqual([]);
  });

  it("ranks finished-but-unsent work above everything else", () => {
    // The live shape on 2026-08-05.
    const actions = rankNextActions({
      ...EMPTY,
      preparedCount: 9,
      uncontactedConnections: 26,
      totalConnections: 26,
      followUpsDue: 2,
      interviewsInFlight: 1,
    });
    expect(actions[0].key).toBe("send_prepared");
    expect(actions[1].key).toBe("referral_gap");
  });

  it("puts follow-ups and stalled roles below the two top drivers", () => {
    const keys = rankNextActions({
      ...EMPTY,
      preparedCount: 1,
      uncontactedConnections: 1,
      totalConnections: 5,
      followUpsDue: 3,
      staleActive: 2,
    }).map((a) => a.key);
    expect(keys.indexOf("send_prepared")).toBeLessThan(keys.indexOf("follow_up"));
    expect(keys.indexOf("referral_gap")).toBeLessThan(keys.indexOf("stale_active"));
  });

  it("does not let a larger count outrank a different kind of work", () => {
    // 26 contacts vs 9 applications are different units. Sorting across them by
    // size once put the contact list above nine finished, verified applications.
    const actions = rankNextActions({
      ...EMPTY,
      preparedCount: 9,
      uncontactedConnections: 26,
      totalConnections: 26,
    });
    expect(actions.map((a) => a.key)).toEqual(["send_prepared", "referral_gap"]);
  });

  it("keeps a stable precedence between same-weight drivers", () => {
    const actions = rankNextActions({
      ...EMPTY,
      followUpsDue: 2,
      staleActive: 9,
      interviewsInFlight: 1,
    });
    expect(actions.map((a) => a.key)).toEqual([
      "follow_up",
      "stale_active",
      "interview_prep",
    ]);
  });

  it("caps the list so a priority list does not become a list", () => {
    const actions = rankNextActions({
      preparedCount: 9,
      uncontactedConnections: 26,
      totalConnections: 26,
      followUpsDue: 4,
      staleActive: 3,
      interviewsInFlight: 2,
    });
    expect(actions).toHaveLength(MAX_ACTIONS);
  });

  it("separates a referral where an application is live from the cold remainder", () => {
    // The 2026-08-05 shape: 26 contacts, but only Anthropic overlaps the 17
    // companies with a live application.
    const actions = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 26,
      totalConnections: 26,
      uncontactedAtLiveCompanies: 1,
    });
    const live = actions.find((a) => a.key === "referral_live")!;
    const cold = actions.find((a) => a.key === "referral_gap")!;

    expect(live.count).toBe(1);
    expect(live.weight).toBe(3);
    expect(live.weight).toBe(3);
    // The remaining 25 must not be double-counted as referral targets.
    expect(cold.count).toBe(25);
    expect(cold.weight).toBe(2);
    expect(actions.indexOf(live)).toBeLessThan(actions.indexOf(cold));
  });

  it("omits the live-referral row when no contact works where he applied", () => {
    const actions = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 26,
      totalConnections: 26,
    });
    expect(actions.some((a) => a.key === "referral_live")).toBe(false);
    expect(actions.find((a) => a.key === "referral_gap")!.count).toBe(26);
  });

  it("tells him to ask for an intro, not a referral, when there is no overlap", () => {
    const [action] = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 26,
      totalConnections: 26,
    });
    expect(action.rationale).toContain("introduction");
  });

  it("counts companies in the label and contacts in the rationale", () => {
    // The live shape: 8 contacts across only 2 employers. Labelling the 8 as
    // companies overstates the reach four-fold.
    const [action] = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 8,
      totalConnections: 26,
      uncontactedAtLiveCompanies: 8,
      liveCompaniesWithContacts: 2,
    });
    expect(action.label).toBe("Get a referral at 2 companies you've applied to");
    expect(action.rationale).toContain("8 contacts there");
  });

  it("falls back to vague phrasing rather than a wrong number", () => {
    const [action] = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 3,
      totalConnections: 3,
      uncontactedAtLiveCompanies: 3,
    });
    expect(action.label).toBe("Get a referral at a company you've applied to");
  });

  it("does not emit a cold row when every contact is at a live company", () => {
    const actions = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 3,
      totalConnections: 3,
      uncontactedAtLiveCompanies: 3,
    });
    expect(actions.some((a) => a.key === "referral_gap")).toBe(false);
  });

  it("never produces a negative cold count if the inputs disagree", () => {
    const actions = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 1,
      totalConnections: 1,
      uncontactedAtLiveCompanies: 5,
    });
    expect(actions.some((a) => a.key === "referral_gap")).toBe(false);
  });

  it("writes singular labels for a count of one", () => {
    const [action] = rankNextActions({ ...EMPTY, preparedCount: 1 });
    expect(action.label).toBe("Send 1 finished application");
  });

  it("writes plural labels above one", () => {
    const [action] = rankNextActions({ ...EMPTY, preparedCount: 9 });
    expect(action.label).toBe("Send 9 finished applications");
  });

  it("gives every surfaced action a rationale, since the ranking must justify itself", () => {
    const actions = rankNextActions({
      preparedCount: 2,
      uncontactedConnections: 3,
      totalConnections: 4,
      followUpsDue: 1,
      staleActive: 1,
      interviewsInFlight: 1,
    });
    for (const action of actions) {
      expect(action.rationale.length).toBeGreaterThan(0);
      expect(action.count).toBeGreaterThan(0);
    }
  });
});
