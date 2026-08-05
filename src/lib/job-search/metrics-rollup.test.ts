import { describe, it, expect } from "vitest";
import { computeWeeklyMetrics, type RollupInput } from "./metrics-rollup";

function input(overrides: Partial<RollupInput> = {}): RollupInput {
  return {
    weekStart: "2026-04-06",
    completedTasksByCategory: {},
    pipelineStatuses: [],
    connectionsContactedLast14d: 0,
    connectionsRepliedLast14d: 0,
    interviewsCompletedThisWeek: 0,
    applicationsFromPipelineThisWeek: 0,
    ...overrides,
  };
}

describe("computeWeeklyMetrics", () => {
  it("counts applications from completed apply tasks", () => {
    const row = computeWeeklyMetrics(
      input({ completedTasksByCategory: { apply: 4 } })
    );
    expect(row.applications_sent).toBe(4);
  });

  it("counts applications from pipeline applied_date when no tasks were ticked", () => {
    const row = computeWeeklyMetrics(
      input({ applicationsFromPipelineThisWeek: 6 })
    );
    expect(row.applications_sent).toBe(6);
  });

  it("takes the higher of ticked apply tasks and pipeline applications", () => {
    expect(
      computeWeeklyMetrics(
        input({
          completedTasksByCategory: { apply: 2 },
          applicationsFromPipelineThisWeek: 5,
        })
      ).applications_sent
    ).toBe(5);

    expect(
      computeWeeklyMetrics(
        input({
          completedTasksByCategory: { apply: 7 },
          applicationsFromPipelineThisWeek: 3,
        })
      ).applications_sent
    ).toBe(7);
  });

  it("counts outreach + follow-ups + linkedin", () => {
    const row = computeWeeklyMetrics(
      input({
        completedTasksByCategory: {
          outreach: 3,
          follow_up: 2,
          linkedin_post: 1,
        },
      })
    );
    expect(row.outreach_sent).toBe(3);
    expect(row.follow_ups_sent).toBe(2);
    expect(row.linkedin_posts).toBe(1);
  });

  it("computes response rate as replied/contacted", () => {
    const row = computeWeeklyMetrics(
      input({ connectionsContactedLast14d: 10, connectionsRepliedLast14d: 3 })
    );
    expect(row.response_rate).toBe(0.3);
  });

  it("returns 0 response rate when no contacts", () => {
    const row = computeWeeklyMetrics(
      input({ connectionsContactedLast14d: 0, connectionsRepliedLast14d: 0 })
    );
    expect(row.response_rate).toBe(0);
  });

  it("counts active pipeline as saved + applied + screen + interview", () => {
    const row = computeWeeklyMetrics(
      input({
        pipelineStatuses: [
          "saved",
          "saved",
          "applied",
          "screen",
          "interview",
          "rejected",
          "passed",
        ],
      })
    );
    expect(row.active_pipeline_count).toBe(5);
  });

  it("passes through interviews_completed", () => {
    const row = computeWeeklyMetrics(input({ interviewsCompletedThisWeek: 2 }));
    expect(row.interviews_completed).toBe(2);
  });
});
