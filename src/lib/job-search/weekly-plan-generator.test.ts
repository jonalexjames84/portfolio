import { describe, it, expect } from "vitest";
import { generateWeeklyPlan, type PlanInput } from "./weekly-plan-generator";

function input(overrides: Partial<PlanInput> = {}): PlanInput {
  return {
    weekStartDate: "2026-04-06",
    interviews: [],
    stalePipelineEntries: [],
    newScoredJobs: [],
    staleConnections: [],
    targetCompanyBacklog: [],
    carriedOverHighImpact: [],
    ...overrides,
  };
}

describe("generateWeeklyPlan", () => {
  it("returns empty array for empty inputs", () => {
    expect(generateWeeklyPlan(input()).length).toBe(0);
  });

  it("schedules interview prep 1 day before the interview", () => {
    const tasks = generateWeeklyPlan(
      input({
        interviews: [
          { id: "p1", company: "Anthropic", role: "PM", date: "2026-04-08" }, // Wed
        ],
      })
    );
    const prepTask = tasks.find((t) => t.source === "interview_prep");
    expect(prepTask).toBeDefined();
    expect(prepTask?.date).toBe("2026-04-07"); // Tue
    expect(prepTask?.impact).toBe("high");
    expect(prepTask?.probability_lift).toBe(10);
  });

  it("creates apply tasks for new jobs scoring 80+", () => {
    const tasks = generateWeeklyPlan(
      input({
        newScoredJobs: [
          { id: "j1", company: "Vercel", role: "Staff PM", score: 85 },
          { id: "j2", company: "Linear", role: "PM", score: 72 },
        ],
      })
    );
    const high = tasks.filter((t) => t.source === "apply_new_job" && t.impact === "high");
    const medium = tasks.filter((t) => t.source === "apply_new_job" && t.impact === "medium");
    expect(high.length).toBe(1);
    expect(medium.length).toBe(1);
    expect(high[0].probability_lift).toBe(8);
    expect(medium[0].probability_lift).toBe(4);
  });

  it("creates follow-up tasks for stale pipeline entries", () => {
    const tasks = generateWeeklyPlan(
      input({
        stalePipelineEntries: [{ id: "p2", company: "Stripe", daysSinceUpdate: 9 }],
      })
    );
    const t = tasks.find((t) => t.source === "stale_pipeline");
    expect(t).toBeDefined();
    expect(t?.impact).toBe("high");
    expect(t?.probability_lift).toBe(7);
  });

  it("prunes tasks with probability_lift below 3", () => {
    const tasks = generateWeeklyPlan(
      input({
        targetCompanyBacklog: [{ id: "tc1", company: "Foo" }],
      })
    );
    // backlog tasks have probability_lift = 3, should survive
    expect(tasks.length).toBe(1);
  });

  it("caps total tasks at 25 per week, keeping highest probability_lift", () => {
    const stale = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      company: `C${i}`,
      daysSinceUpdate: 10,
    }));
    const tasks = generateWeeklyPlan(input({ stalePipelineEntries: stale }));
    expect(tasks.length).toBe(25);
  });

  it("caps each day at 5 tasks", () => {
    const stale = Array.from({ length: 25 }, (_, i) => ({
      id: `p${i}`,
      company: `C${i}`,
      daysSinceUpdate: 10,
    }));
    const tasks = generateWeeklyPlan(input({ stalePipelineEntries: stale }));
    const byDate: Record<string, number> = {};
    for (const t of tasks) byDate[t.date] = (byDate[t.date] || 0) + 1;
    for (const count of Object.values(byDate)) {
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it("carries forward high-impact unfinished tasks to Monday", () => {
    const tasks = generateWeeklyPlan(
      input({
        carriedOverHighImpact: [
          {
            id: "old1",
            task: "Apply: Anthropic PM",
            category: "apply",
            company: "Anthropic",
          },
        ],
      })
    );
    const carried = tasks.find((t) => t.task === "Apply: Anthropic PM");
    expect(carried).toBeDefined();
    expect(carried?.date).toBe("2026-04-06"); // Monday
    expect(carried?.carried_over).toBe(true);
  });
});
