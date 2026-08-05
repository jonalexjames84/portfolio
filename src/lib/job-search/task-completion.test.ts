import { describe, it, expect } from "vitest";
import { resolvePipelineEffect } from "./task-completion";

const TODAY = "2026-08-05";

describe("resolvePipelineEffect", () => {
  it("moves a saved role to applied when an apply task is ticked", () => {
    expect(
      resolvePipelineEffect({
        category: "apply",
        done: true,
        entryStatus: "saved",
        today: TODAY,
      })
    ).toEqual({ status: "applied", applied_date: TODAY });
  });

  it("ignores tasks that are not applications", () => {
    for (const category of ["outreach", "follow_up", "content", "prep", "admin"]) {
      expect(
        resolvePipelineEffect({ category, done: true, entryStatus: "saved", today: TODAY })
      ).toBeNull();
    }
  });

  it("does nothing when there is no matching pipeline row", () => {
    expect(
      resolvePipelineEffect({ category: "apply", done: true, entryStatus: null, today: TODAY })
    ).toBeNull();
  });

  it("never regresses a role that has already moved past applied", () => {
    // Ticking a stale task must not drag a live interview back to `applied`.
    for (const entryStatus of ["applied", "screen", "interview", "offer", "rejected"]) {
      expect(
        resolvePipelineEffect({ category: "apply", done: true, entryStatus, today: TODAY })
      ).toBeNull();
    }
  });

  it("un-ticking reverts applied back to saved", () => {
    expect(
      resolvePipelineEffect({
        category: "apply",
        done: false,
        entryStatus: "applied",
        today: TODAY,
      })
    ).toEqual({ status: "saved", applied_date: null });
  });

  it("un-ticking leaves a role that has progressed beyond applied alone", () => {
    // Jon got a screen, then un-ticked the task by accident. The screen stands.
    for (const entryStatus of ["screen", "interview", "offer", "rejected", "passed"]) {
      expect(
        resolvePipelineEffect({ category: "apply", done: false, entryStatus, today: TODAY })
      ).toBeNull();
    }
  });

  it("un-ticking a role still at saved is a no-op", () => {
    expect(
      resolvePipelineEffect({ category: "apply", done: false, entryStatus: "saved", today: TODAY })
    ).toBeNull();
  });
});
