import { describe, it, expect } from "vitest";
import {
  localDateStr,
  dayOfWeek,
  addDays,
  mondayOf,
  upcomingMonday,
  weekBounds,
} from "./dates";

describe("localDateStr", () => {
  it("reports the PT date, not the UTC date, for a late-evening instant", () => {
    // 2026-08-03 06:00 UTC is 2026-08-02 23:00 PDT — the previous day.
    expect(localDateStr(new Date("2026-08-03T06:00:00Z"))).toBe("2026-08-02");
  });

  it("agrees with UTC during PT business hours", () => {
    expect(localDateStr(new Date("2026-08-03T16:00:00Z"))).toBe("2026-08-03");
  });

  it("handles PST as well as PDT", () => {
    // January: UTC-8. 07:00 UTC is 23:00 the previous day.
    expect(localDateStr(new Date("2026-01-05T07:00:00Z"))).toBe("2026-01-04");
    expect(localDateStr(new Date("2026-01-05T08:00:00Z"))).toBe("2026-01-05");
  });
});

describe("dayOfWeek", () => {
  it("maps Sunday to 0 and Monday to 1", () => {
    expect(dayOfWeek("2026-08-02")).toBe(0);
    expect(dayOfWeek("2026-08-03")).toBe(1);
    expect(dayOfWeek("2026-08-08")).toBe(6);
  });

  it("rejects a non-ISO date rather than silently producing NaN", () => {
    expect(() => dayOfWeek("08/03/2026")).toThrow(/YYYY-MM-DD/);
  });
});

describe("addDays", () => {
  it("moves forward and backward", () => {
    expect(addDays("2026-08-03", 4)).toBe("2026-08-07");
    expect(addDays("2026-08-03", -1)).toBe("2026-08-02");
  });

  it("crosses month and year boundaries", () => {
    expect(addDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("does not drift across a DST transition", () => {
    // DST starts 2026-03-08 in the US. Pure calendar math must ignore it.
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
  });
});

describe("mondayOf", () => {
  it("returns the same day when given a Monday", () => {
    expect(mondayOf("2026-08-03")).toBe("2026-08-03");
  });

  it("walks back to the start of the week midweek", () => {
    expect(mondayOf("2026-08-06")).toBe("2026-08-03");
  });

  it("treats Sunday as the tail of the week that just ended", () => {
    expect(mondayOf("2026-08-09")).toBe("2026-08-03");
  });
});

describe("upcomingMonday", () => {
  it("returns today when today is already Monday — the week-skip bug", () => {
    expect(upcomingMonday("2026-08-03")).toBe("2026-08-03");
  });

  it("returns tomorrow on a Sunday, which is when the cron actually runs in PT", () => {
    expect(upcomingMonday("2026-08-02")).toBe("2026-08-03");
  });

  it("returns the next Monday midweek", () => {
    expect(upcomingMonday("2026-08-05")).toBe("2026-08-10");
    expect(upcomingMonday("2026-08-07")).toBe("2026-08-10");
  });

  it("plans the right week for the real cron instant", () => {
    // Cron: 0 6 * * 1 → Monday 06:00 UTC → Sunday 23:00 PDT.
    const fired = new Date("2026-08-03T06:00:00Z");
    expect(upcomingMonday(localDateStr(fired))).toBe("2026-08-03");
  });

  it("still plans the right week if the run lands on Monday PT", () => {
    const late = new Date("2026-08-03T17:00:00Z"); // 10:00 PDT Monday
    expect(upcomingMonday(localDateStr(late))).toBe("2026-08-03");
  });
});

describe("weekBounds", () => {
  it("spans Monday to Sunday", () => {
    const { weekStartStr, weekEndStr } = weekBounds("2026-08-05");
    expect(weekStartStr).toBe("2026-08-03");
    expect(weekEndStr).toBe("2026-08-09");
  });

  it("counts weekdays elapsed, capping at five", () => {
    expect(weekBounds("2026-08-03").weekdaysPassed).toBe(1); // Mon
    expect(weekBounds("2026-08-06").weekdaysPassed).toBe(4); // Thu
    expect(weekBounds("2026-08-08").weekdaysPassed).toBe(5); // Sat
    expect(weekBounds("2026-08-09").weekdaysPassed).toBe(5); // Sun
  });

  it("rolls up the week that just finished when run at midnight PT, not the new one", () => {
    // rollup-metrics fires 07:00 UTC. In PST that is 23:00 the previous day, so
    // a Monday-UTC run must still report the week that ended on Sunday.
    const fired = new Date("2026-01-05T07:00:00Z"); // Sun 2026-01-04 23:00 PST
    const { weekStartStr, weekEndStr } = weekBounds(localDateStr(fired));
    expect(weekStartStr).toBe("2025-12-29");
    expect(weekEndStr).toBe("2026-01-04");
  });
});
