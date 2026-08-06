import { describe, expect, it } from "vitest";
import { buildFunnel } from "./funnel";
import {
  BACKLOG_CEILING,
  buildLeakFunnel,
  buildLevers,
  buildStopDoing,
  buildStrategy,
  findLeak,
  isOnThesis,
  MIN_CONVERSION_SAMPLE,
  MIN_LEAK_SAMPLE,
  THESIS,
  topMoves,
  type LeakStage,
  type LeverInput,
  type StrategyInput,
} from "./strategy";

// The state of the search on 2026-08-05, which is what the page was built to
// describe. Every "live data" assertion below is pinned to these numbers.
const LIVE: StrategyInput = {
  contactsAtLiveCompanies: 8,
  contactsWorkedAtLiveCompanies: 0,
  totalConnections: 26,
  totalContacted: 0,
  avgScoreApplied: 77,
  qualifiedUntouched: 34,
  savedCount: 255,
  workProducts: 0,
  companiesApplied: 24,
  funnel: buildFunnel({ applications: 12, screens: 2, interviews: 0, offers: 0 }),
  applicationsSubmitted: 12,
  interviewsLogged: 0,
  interviewsDebriefed: 0,
  targetsTracked: 313,
  qualifiedCompanies: 20,
  referralPathBuilt: 0,
  active: 2,
  interviews: 0,
  preparedUnsent: 13,
  onThesisApplied: 9,
  referralApplied: 0,
};

function leverInput(over: Partial<LeverInput> = {}): LeverInput {
  return { ...LIVE, ...over };
}

describe("isOnThesis", () => {
  it("matches the industry values the pipeline actually stores", () => {
    expect(isOnThesis("AI/ML", "Series A")).toBe(true);
    expect(isOnThesis("Developer Tools", "seed")).toBe(true);
    expect(isOnThesis("Growth / Dev Tools", null)).toBe(true);
    expect(isOnThesis("SaaS / dev tools", null)).toBe(true);
    expect(isOnThesis("Healthcare AI", null)).toBe(true);
  });

  it("counts gaming as on thesis", () => {
    // Jon's standing instruction is that game studios are in scope. 62 gaming
    // rows are in the pipeline because of it; grading them off-thesis would
    // contradict the instruction that put them there.
    expect(isOnThesis("Gaming", null)).toBe(true);
  });

  it("does not match a short term inside an unrelated word", () => {
    // A bare includes("ai") matches "International" and "Retail". Tokenising
    // is the reason it does not.
    expect(isOnThesis("International", null)).toBe(false);
    expect(isOnThesis("Retail", null)).toBe(false);
  });

  it("rejects an off-thesis industry regardless of stage", () => {
    expect(isOnThesis("Enterprise", "Series A")).toBe(false);
    expect(isOnThesis("FAANG+", "seed")).toBe(false);
  });

  it("rejects a late stage even when the industry fits", () => {
    expect(isOnThesis("AI/ML", "Series F")).toBe(false);
    expect(isOnThesis("SaaS", "Public")).toBe(false);
  });

  it("accepts a fitting industry when stage is unknown", () => {
    // Stage is null on most ATS-ingested rows. Requiring it would zero out the
    // on-thesis count for the majority of the pipeline.
    expect(isOnThesis("AI/ML", null)).toBe(true);
  });

  it("does not count an unclassified row as on-thesis", () => {
    // Otherwise the number climbs every time the ingest fails to classify.
    expect(isOnThesis(null, "Series A")).toBe(false);
    expect(isOnThesis("", "seed")).toBe(false);
  });
});

describe("buildLeakFunnel", () => {
  const byKey = (stages: LeakStage[], key: string) =>
    stages.find((s) => s.key === key)!;

  it("hangs the referral path off applied as a branch, not a gate", () => {
    // Two roles reached `active` with no warm intro behind either, so referral
    // cannot be a step applications pass through. Rendered inline it produced a
    // chain reading 0 → 24 → 2, which looks like a rendering bug.
    const referral = byKey(buildLeakFunnel(LIVE), "referral_path");
    expect(referral.isBranch).toBe(true);
    expect(referral.parentKey).toBe("applied");
    expect(byKey(buildLeakFunnel(LIVE), "active").parentKey).toBe("applied");
  });

  it("measures each stage against its named parent, not the row above it", () => {
    const stages = buildLeakFunnel(LIVE);
    // Active is 2 of 24 applied — not 2 of the 0 referral paths above it.
    expect(byKey(stages, "active").sample).toBe(24);
    expect(byKey(stages, "active").conversionFromParent).toBe(8);
  });

  it("withholds a conversion when the parent stage is below sample", () => {
    const stages = buildLeakFunnel({
      ...LIVE,
      targetsTracked: 3,
      qualifiedCompanies: 1,
    });
    expect(byKey(stages, "on_thesis").conversionFromParent).toBeNull();
    expect(byKey(stages, "on_thesis").sample).toBe(3);
  });

  it("computes a conversion once the parent clears sample", () => {
    const stages = buildLeakFunnel({
      ...LIVE,
      targetsTracked: 100,
      qualifiedCompanies: 25,
    });
    expect(byKey(stages, "on_thesis").conversionFromParent).toBe(25);
  });

  it("flags a stage wider than its parent as overflow, not as a leak", () => {
    // 24 applied against 20 qualified. A widening funnel is normally a bug;
    // here it is the shotgun signature and gets named rather than smoothed.
    const applied = byKey(buildLeakFunnel(LIVE), "applied");
    expect(applied.overflow).toBe(4);
    expect(applied.isLeak).toBe(false);
  });

  it("leaves overflow null when a stage fits inside its parent", () => {
    const stages = buildLeakFunnel({ ...LIVE, qualifiedCompanies: 40 });
    expect(byKey(stages, "applied").overflow).toBeNull();
  });

  it("flags the referral path as the leak on live data", () => {
    const leak = buildLeakFunnel(LIVE).find((s) => s.isLeak);
    expect(leak?.key).toBe("referral_path");
    expect(leak?.conversionFromParent).toBe(0);
  });

  it("flags exactly one leak", () => {
    expect(buildLeakFunnel(LIVE).filter((s) => s.isLeak)).toHaveLength(1);
  });
});

describe("findLeak", () => {
  function stage(
    key: string,
    rate: number | null,
    sample: number,
    overflow: number | null = null,
  ): LeakStage {
    return {
      key: key as LeakStage["key"],
      label: key,
      count: 0,
      note: "",
      parentKey: null,
      conversionFromParent: rate,
      sample,
      isBranch: false,
      isLeak: false,
      overflow,
    };
  }

  it("skips stages whose rate was withheld", () => {
    // A 0-of-2 must never outrank a genuine 0-of-24. Withheld means unknown,
    // not zero, and unknown cannot be the worst.
    const stages = [
      stage("targets", null, 0),
      stage("a", null, MIN_LEAK_SAMPLE - 1),
      stage("b", 40, 100),
    ];
    expect(findLeak(stages)?.key).toBe("b");
  });

  it("skips a stage that overflowed its parent", () => {
    // Overflow is the opposite problem and has its own treatment. A 120% stage
    // would otherwise never win, but a 0% overflowing stage could.
    const stages = [stage("a", 0, 100, 5), stage("b", 40, 100)];
    expect(findLeak(stages)?.key).toBe("b");
  });

  it("returns null when nothing has a rate", () => {
    expect(findLeak([stage("targets", null, 0), stage("a", null, 2)])).toBeNull();
  });

  it("picks the lowest rate, not the first", () => {
    const stages = [stage("a", 50, 100), stage("b", 10, 100), stage("c", 30, 100)];
    expect(findLeak(stages)?.key).toBe("b");
  });
});

describe("levers — the honesty rule", () => {
  it("grades conversion as unknown below sample, not as failure", () => {
    // The load-bearing case. 12 applications and 0 interviews is not a 0%
    // conversion rate, it is 12 applications. Rendering it red would tell Jon
    // to fix a machine that has not run long enough to be measured.
    const lever = buildLevers(LIVE).find((l) => l.key === "conversion")!;
    expect(lever.state).toBe("unknown");
    expect(lever.score).toBeNull();
    expect(lever.move).toBeNull();
    expect(lever.headline).toContain(`12 of ~${MIN_CONVERSION_SAMPLE}`);
  });

  it("grades compounding as unknown when no interview has happened", () => {
    const lever = buildLevers(LIVE).find((l) => l.key === "compounding")!;
    expect(lever.state).toBe("unknown");
    expect(lever.move).toBeNull();
  });

  it("does grade conversion once enough applications are out", () => {
    const lever = buildLevers(
      leverInput({
        applicationsSubmitted: 40,
        funnel: buildFunnel({ applications: 40, screens: 0, interviews: 0, offers: 0 }),
      }),
    ).find((l) => l.key === "conversion")!;
    expect(lever.state).toBe("critical");
    expect(lever.move).not.toBeNull();
  });

  it("never assigns a score to an unknown lever", () => {
    for (const lever of buildLevers(LIVE)) {
      if (lever.state === "unknown") expect(lever.score).toBeNull();
    }
  });
});

describe("referral lever", () => {
  const key = "referral_path";

  it("is critical when warm contacts exist and none are worked", () => {
    const lever = buildLevers(LIVE).find((l) => l.key === key)!;
    expect(lever.state).toBe("critical");
    expect(lever.score).toBe(0);
    expect(lever.headline).toBe("0 of 8 warm contacts worked");
    expect(lever.move).toContain("8 warm contacts");
  });

  it("distinguishes an empty contact list from an unworked one", () => {
    // Different problem, different move: go find people, not go message them.
    const lever = buildLevers(
      leverInput({ totalConnections: 0, totalContacted: 0, contactsAtLiveCompanies: 0 }),
    ).find((l) => l.key === key)!;
    expect(lever.headline).toBe("No contacts on record");
    expect(lever.move).toContain("Add contacts");
  });

  it("handles contacts that do not overlap the pipeline", () => {
    const lever = buildLevers(
      leverInput({ contactsAtLiveCompanies: 0, contactsWorkedAtLiveCompanies: 0 }),
    ).find((l) => l.key === key)!;
    expect(lever.finding).toContain("do not overlap");
  });

  it("is working once most warm contacts are worked", () => {
    const lever = buildLevers(
      leverInput({ contactsAtLiveCompanies: 10, contactsWorkedAtLiveCompanies: 8 }),
    ).find((l) => l.key === key)!;
    expect(lever.state).toBe("working");
    expect(lever.score).toBe(80);
  });
});

describe("precision lever", () => {
  const key = "precision";

  it("is critical when better roles sit untouched than the ones applied to", () => {
    // The definition of shotgunning: applying to whatever was in front of you
    // while higher-scoring roles sit saved.
    const lever = buildLevers(LIVE).find((l) => l.key === key)!;
    expect(lever.state).toBe("critical");
    expect(lever.finding).toContain("better roles than the ones you applied to");
    expect(lever.move).toContain("34 qualified saved roles");
  });

  it("is working when applying at or above the threshold", () => {
    const lever = buildLevers(leverInput({ avgScoreApplied: 85 })).find(
      (l) => l.key === key,
    )!;
    expect(lever.state).toBe("working");
  });

  it("is unknown when nothing has been applied to", () => {
    const lever = buildLevers(leverInput({ avgScoreApplied: null })).find(
      (l) => l.key === key,
    )!;
    expect(lever.state).toBe("unknown");
    expect(lever.score).toBeNull();
  });

  it("does not claim better roles exist when none do", () => {
    const lever = buildLevers(
      leverInput({ avgScoreApplied: 70, qualifiedUntouched: 0 }),
    ).find((l) => l.key === key)!;
    expect(lever.state).toBe("weak");
    expect(lever.finding).not.toContain("better roles");
  });
});

describe("depth lever", () => {
  it("is weak with no work products behind live applications", () => {
    const lever = buildLevers(LIVE).find((l) => l.key === "depth")!;
    expect(lever.state).toBe("weak");
    expect(lever.score).toBe(0);
  });

  it("is unknown before anything is applied to", () => {
    const lever = buildLevers(leverInput({ companiesApplied: 0 })).find(
      (l) => l.key === "depth",
    )!;
    expect(lever.state).toBe("unknown");
  });

  it("caps the score at 100 when work products outnumber companies", () => {
    const lever = buildLevers(
      leverInput({ workProducts: 30, companiesApplied: 10 }),
    ).find((l) => l.key === "depth")!;
    expect(lever.score).toBe(100);
  });
});

describe("lever ordering", () => {
  it("puts critical first and unknown last", () => {
    const states = buildLevers(LIVE).map((l) => l.state);
    expect(states[0]).toBe("critical");
    expect(states[states.length - 1]).toBe("unknown");
  });

  it("ranks referral path above precision when both are critical", () => {
    // Both are critical on live data; the referral path is the 5x channel.
    const levers = buildLevers(LIVE);
    expect(levers[0].key).toBe("referral_path");
    expect(levers[1].key).toBe("precision");
  });

  it("returns all five levers", () => {
    expect(buildLevers(LIVE)).toHaveLength(5);
  });
});

describe("topMoves", () => {
  it("returns at most three, all with a move", () => {
    const moves = topMoves(buildLevers(LIVE));
    expect(moves.length).toBeLessThanOrEqual(3);
    for (const m of moves) expect(m.move).not.toBeNull();
  });

  it("excludes levers that are already working", () => {
    const levers = buildLevers(
      leverInput({ contactsAtLiveCompanies: 10, contactsWorkedAtLiveCompanies: 10 }),
    );
    expect(topMoves(levers).map((l) => l.key)).not.toContain("referral_path");
  });

  it("leads with the referral path on live data", () => {
    expect(topMoves(buildLevers(LIVE))[0].key).toBe("referral_path");
  });
});

describe("buildStopDoing", () => {
  it("tells him to stop saving roles when the backlog is large", () => {
    const items = buildStopDoing(LIVE);
    const stop = items.find((i) => i.id === "stop_saving")!;
    expect(stop.text).toContain("255 saved roles");
    expect(stop.because).toContain("34");
  });

  it("stays quiet about the backlog below the ceiling", () => {
    const items = buildStopDoing({ ...LIVE, savedCount: BACKLOG_CEILING - 1 });
    expect(items.find((i) => i.id === "stop_saving")).toBeUndefined();
  });

  it("flags prepared-but-unsent applications", () => {
    expect(buildStopDoing(LIVE).find((i) => i.id === "stop_claiming")?.text).toContain(
      "13",
    );
  });

  it("flags cold applications where a contact exists", () => {
    expect(buildStopDoing(LIVE).find((i) => i.id === "stop_cold")).toBeDefined();
  });

  it("does not tell him to stop on volume below sample", () => {
    // 12 applications with no interviews is not evidence the funnel is broken.
    expect(buildStopDoing(LIVE).find((i) => i.id === "stop_volume")).toBeUndefined();
  });

  it("does tell him to stop on volume once there is evidence", () => {
    const items = buildStopDoing({ ...LIVE, applicationsSubmitted: 40 });
    expect(items.find((i) => i.id === "stop_volume")).toBeDefined();
  });

  it("is empty for a clean search", () => {
    expect(
      buildStopDoing({
        savedCount: 10,
        qualifiedUntouched: 0,
        preparedUnsent: 0,
        contactsAtLiveCompanies: 5,
        contactsWorkedAtLiveCompanies: 5,
        applicationsSubmitted: 5,
        interviewsLogged: 2,
      }),
    ).toEqual([]);
  });
});

describe("buildStrategy", () => {
  it("reports the thesis shares against submitted applications", () => {
    const report = buildStrategy(LIVE);
    expect(report.thesis.onThesisPct).toBe(75); // 9 of 12
    expect(report.thesis.referralPct).toBe(0);
    expect(report.thesis.avgScoreApplied).toBe(77);
    expect(report.thesis.summary).toBe(THESIS.summary);
  });

  it("withholds thesis shares when nothing has been submitted", () => {
    const report = buildStrategy({ ...LIVE, applicationsSubmitted: 0 });
    expect(report.thesis.onThesisPct).toBeNull();
    expect(report.thesis.referralPct).toBeNull();
  });

  it("assembles every section", () => {
    const report = buildStrategy(LIVE);
    expect(report.leak.length).toBe(6);
    expect(report.levers).toHaveLength(5);
    expect(report.moves.length).toBeGreaterThan(0);
    expect(report.stop.length).toBeGreaterThan(0);
  });
});
