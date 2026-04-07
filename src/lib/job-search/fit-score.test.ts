import { describe, it, expect } from "vitest";
import { computeAutoFitScore } from "./fit-score";
import type { PipelineEntry } from "./types";

function entry(overrides: Partial<PipelineEntry> = {}): PipelineEntry {
  return {
    id: "1",
    company: "Acme",
    role: "Product Manager",
    status: "saved",
    created_at: "2026-04-07T00:00:00Z",
    applied_date: null,
    last_update: "2026-04-07",
    job_url: null,
    fit_score: null,
    fit_score_auto: 0,
    score_breakdown: null,
    jd_text: null,
    industry: null,
    stage: null,
    location: null,
    interview_date: null,
    notes: null,
    ...overrides,
  };
}

describe("computeAutoFitScore", () => {
  it("gives base credit for a generic PM title", () => {
    const { total } = computeAutoFitScore(entry({ role: "Product Manager" }));
    expect(total).toBe(25);
  });

  it("adds seniority bonus for Senior PM", () => {
    const { total } = computeAutoFitScore(entry({ role: "Senior Product Manager" }));
    expect(total).toBe(40); // 25 + 15
  });

  it("adds keyword match capped at 25", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        jd_text: "Build AI agents on a dev tools platform with ML and LLM features and SaaS",
      })
    );
    // 25 (PM) + 15 (Senior) + 25 (cap, 6 keywords matched) = 65
    expect(total).toBe(65);
  });

  it("adds industry and stage bonuses", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        industry: "AI/ML",
        stage: "Series B",
      })
    );
    expect(total).toBe(65); // 25 + 15 + 15 + 10
  });

  it("subtracts for junior red flag", () => {
    const { total } = computeAutoFitScore(
      entry({ role: "Associate Product Manager" })
    );
    expect(total).toBe(0); // 25 - 30, clamped to 0
  });

  it("subtracts for non-Bay-Area on-site location", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        location: "On-site - New York, NY",
      })
    );
    expect(total).toBe(20); // 25 + 15 - 20
  });

  it("does not subtract location penalty for Bay Area on-site", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        location: "On-site - San Francisco, CA",
      })
    );
    expect(total).toBe(40);
  });

  it("clamps maximum at 100", () => {
    const { total } = computeAutoFitScore(
      entry({
        role: "Head of Product",
        jd_text: "AI ML LLM agent platform dev tools SaaS",
        industry: "AI/ML",
        stage: "Series A",
      })
    );
    // 25 + 15 + 25 + 15 + 10 = 90, OK
    expect(total).toBe(90);
  });

  it("returns the breakdown", () => {
    const { breakdown } = computeAutoFitScore(
      entry({
        role: "Senior Product Manager",
        industry: "SaaS",
        stage: "Series B",
      })
    );
    expect(breakdown).toEqual({
      title_match: 25,
      seniority_fit: 15,
      keyword_match: 0,
      industry_fit: 15,
      stage_fit: 10,
      red_flags: 0,
    });
  });
});
