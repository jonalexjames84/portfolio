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

  it("names the zero-outreach case explicitly when no contact has been reached", () => {
    const [action] = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 26,
      totalConnections: 26,
    });
    expect(action.rationale).toContain("Every contact on record is uncontacted");
  });

  it("uses the softer rationale once some outreach has happened", () => {
    const [action] = rankNextActions({
      ...EMPTY,
      uncontactedConnections: 20,
      totalConnections: 26,
    });
    expect(action.rationale).not.toContain("Every contact on record");
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
