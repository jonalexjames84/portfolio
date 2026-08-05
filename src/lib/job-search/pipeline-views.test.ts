import { describe, it, expect } from "vitest";
import {
  buildPipelineViews,
  daysBetween,
  isFresh,
  urgencyOf,
  type ApplicationRow,
} from "./pipeline-views";
import type { PipelineStatus } from "./types";

const TODAY = "2026-08-05";

function row(over: Partial<ApplicationRow> & { id: string }): ApplicationRow {
  return {
    company: `Co ${over.id}`,
    role: "Product Manager",
    status: "saved" as PipelineStatus,
    jobUrl: null,
    score: 70,
    createdDate: TODAY,
    lastUpdate: TODAY,
    ...over,
  };
}

describe("daysBetween", () => {
  it("counts whole days forward", () => {
    expect(daysBetween("2026-08-01", "2026-08-05")).toBe(4);
  });

  it("goes negative when the range runs backwards", () => {
    expect(daysBetween("2026-08-05", "2026-08-01")).toBe(-4);
  });

  it("survives a DST boundary without drifting an hour into the wrong day", () => {
    expect(daysBetween("2026-03-07", "2026-03-09")).toBe(2);
    expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
  });

  it("rejects a non-ISO date rather than returning NaN days", () => {
    expect(() => daysBetween("Aug 1", TODAY)).toThrow(/YYYY-MM-DD/);
  });
});

describe("urgencyOf", () => {
  it("treats every live conversation as urgent regardless of dates", () => {
    for (const status of ["offer", "interview", "screen"] as PipelineStatus[]) {
      const urgency = urgencyOf(row({ id: status, status, lastUpdate: TODAY }), TODAY);
      expect(urgency, status).not.toBeNull();
    }
  });

  it("ranks an offer above an interview above a screen", () => {
    const ranks = (["offer", "interview", "screen"] as PipelineStatus[]).map(
      (status) => urgencyOf(row({ id: status, status }), TODAY)!.rank
    );
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(ranks).size).toBe(3);
  });

  it("flags an applied role that has been silent for ten days", () => {
    const urgency = urgencyOf(
      row({ id: "a", status: "applied", lastUpdate: "2026-07-26" }),
      TODAY
    );
    expect(urgency?.reason).toBe("no reply in 10d — follow up");
  });

  it("leaves a recently applied role alone", () => {
    expect(
      urgencyOf(row({ id: "a", status: "applied", lastUpdate: "2026-08-01" }), TODAY)
    ).toBeNull();
  });

  it("ages a missing last_update off the created date instead of never", () => {
    const urgency = urgencyOf(
      row({
        id: "a",
        status: "applied",
        lastUpdate: null,
        createdDate: "2026-07-01",
      }),
      TODAY
    );
    expect(urgency?.reason).toMatch(/follow up/);
  });

  it("chases a strong saved role once it is no longer new", () => {
    const urgency = urgencyOf(
      row({ id: "s", status: "saved", score: 91, createdDate: "2026-08-01" }),
      TODAY
    );
    expect(urgency?.reason).toBe("91 fit going stale");
  });

  it("does not chase a strong saved role on its first days", () => {
    expect(
      urgencyOf(
        row({ id: "s", status: "saved", score: 91, createdDate: "2026-08-04" }),
        TODAY
      )
    ).toBeNull();
  });

  it("does not chase a weak saved role however long it sits", () => {
    expect(
      urgencyOf(
        row({ id: "s", status: "saved", score: 60, createdDate: "2026-05-01" }),
        TODAY
      )
    ).toBeNull();
  });

  it("never marks a closed-out role urgent", () => {
    for (const status of ["rejected", "passed"] as PipelineStatus[]) {
      expect(
        urgencyOf(row({ id: status, status, lastUpdate: "2026-01-01" }), TODAY),
        status
      ).toBeNull();
    }
  });
});

describe("isFresh", () => {
  it("covers today through three days old", () => {
    for (const created of ["2026-08-05", "2026-08-04", "2026-08-02"]) {
      expect(isFresh(row({ id: created, createdDate: created }), TODAY), created).toBe(
        true
      );
    }
  });

  it("drops a role on its fourth day", () => {
    expect(isFresh(row({ id: "a", createdDate: "2026-08-01" }), TODAY)).toBe(false);
  });

  it("excludes a rejection even when it landed today", () => {
    expect(isFresh(row({ id: "a", status: "rejected" }), TODAY)).toBe(false);
  });
});

describe("buildPipelineViews", () => {
  const rows = [
    row({ id: "1", company: "Anthropic", status: "interview" }),
    row({ id: "2", company: "Figma", status: "offer" }),
    row({
      id: "3",
      company: "Stedi",
      status: "applied",
      createdDate: "2026-05-20",
      lastUpdate: "2026-06-01",
    }),
    row({ id: "4", company: "Fresh Co", status: "saved", createdDate: "2026-08-04", score: 70 }),
    row({ id: "5", company: "Old Co", status: "saved", createdDate: "2026-04-01", score: 70 }),
    row({ id: "6", company: "Gone Co", status: "rejected", createdDate: "2026-08-05" }),
  ];

  const views = buildPipelineViews(rows, TODAY);

  it("puts the offer first in the urgent view", () => {
    expect(views.urgent[0].company).toBe("Figma");
  });

  it("shows only rows that need hands, each with its reason", () => {
    expect(views.urgent.map((u) => u.company)).toEqual([
      "Figma",
      "Anthropic",
      "Stedi",
    ]);
    expect(views.urgent.every((u) => u.reason.length > 0)).toBe(true);
  });

  it("shows only the last three days in the new view", () => {
    expect(views.fresh.map((f) => f.company)).toEqual(["Anthropic", "Figma", "Fresh Co"]);
  });

  it("groups everything by status in funnel order, hiding empty groups", () => {
    expect(views.groups.map((g) => g.status)).toEqual([
      "offer",
      "interview",
      "applied",
      "saved",
      "rejected",
    ]);
  });

  it("accounts for every row exactly once across the groups", () => {
    const grouped = views.groups.flatMap((g) => g.rows.map((r) => r.id));
    expect(grouped.sort()).toEqual(rows.map((r) => r.id).sort());
  });

  it("orders within a group by fit score, then company", () => {
    const saved = buildPipelineViews(
      [
        row({ id: "a", company: "Zebra", status: "saved", score: 90, createdDate: TODAY }),
        row({ id: "b", company: "Apple", status: "saved", score: 90, createdDate: TODAY }),
        row({ id: "c", company: "Middle", status: "saved", score: 95, createdDate: TODAY }),
      ],
      TODAY
    ).groups.find((g) => g.status === "saved")!;
    expect(saved.rows.map((r) => r.company)).toEqual(["Middle", "Apple", "Zebra"]);
  });

  it("returns three empty views for an empty board", () => {
    expect(buildPipelineViews([], TODAY)).toEqual({
      urgent: [],
      fresh: [],
      groups: [],
    });
  });
});
