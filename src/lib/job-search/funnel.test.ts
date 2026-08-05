import { describe, it, expect } from "vitest";
import { buildFunnel, MIN_STAGE_SAMPLE } from "./funnel";

describe("buildFunnel", () => {
  it("withholds a conversion rate below sample threshold", () => {
    // 12 applications, 1 screen. 8% is two data points wearing a percentage.
    const f = buildFunnel({ applications: 12, screens: 1, interviews: 0, offers: 0 });
    const screens = f.stages.find((s) => s.key === "screens")!;
    expect(screens.conversionFromPrevious).toBeNull();
    expect(screens.sample).toBe(12);
  });

  it("shows the rate once the upstream stage has enough sample", () => {
    const f = buildFunnel({
      applications: MIN_STAGE_SAMPLE,
      screens: 5,
      interviews: 0,
      offers: 0,
    });
    expect(f.stages.find((s) => s.key === "screens")!.conversionFromPrevious).toBe(25);
  });

  it("never divides by zero at an empty stage", () => {
    const f = buildFunnel({ applications: 0, screens: 0, interviews: 0, offers: 0 });
    for (const stage of f.stages) {
      expect(stage.conversionFromPrevious).toBeNull();
      expect(Number.isNaN(stage.conversionFromPrevious as number)).toBe(false);
    }
  });

  it("treats an empty upstream stage as no-rate, not 0%", () => {
    // 0 screens means the interview rate is unknown, not a failure.
    const f = buildFunnel({ applications: 30, screens: 0, interviews: 0, offers: 0 });
    expect(f.stages.find((s) => s.key === "interviews")!.conversionFromPrevious).toBeNull();
  });

  it("rounds rather than emitting long floats", () => {
    const f = buildFunnel({ applications: 30, screens: 7, interviews: 0, offers: 0 });
    expect(f.stages.find((s) => s.key === "screens")!.conversionFromPrevious).toBe(23);
  });

  it("orders the stages as the chain to an offer", () => {
    const f = buildFunnel({ applications: 12, screens: 0, interviews: 1, offers: 0 });
    expect(f.stages.map((s) => s.key)).toEqual([
      "applications",
      "screens",
      "interviews",
      "offers",
    ]);
  });

  it("counts days running so a zero can read as early", () => {
    const f = buildFunnel({
      applications: 12,
      screens: 0,
      interviews: 1,
      offers: 0,
      firstApplicationDate: "2026-08-04",
      now: new Date("2026-08-06T12:00:00Z"),
    });
    expect(f.daysRunning).toBe(2);
  });

  it("leaves days running null when nothing has been sent", () => {
    const f = buildFunnel({ applications: 0, screens: 0, interviews: 0, offers: 0 });
    expect(f.daysRunning).toBeNull();
  });

  it("does not go negative if the first application date is in the future", () => {
    const f = buildFunnel({
      applications: 1,
      screens: 0,
      interviews: 0,
      offers: 0,
      firstApplicationDate: "2026-09-01",
      now: new Date("2026-08-06T00:00:00Z"),
    });
    expect(f.daysRunning).toBe(0);
  });

  it("survives an unparseable date", () => {
    const f = buildFunnel({
      applications: 1,
      screens: 0,
      interviews: 0,
      offers: 0,
      firstApplicationDate: "not a date",
    });
    expect(f.daysRunning).toBeNull();
  });
});
