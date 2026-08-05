import type { PipelineEntry, ScoreBreakdown } from "./types";

const KEYWORDS = ["ai", "ml", "llm", "agent", "platform", "dev tools", "saas"];
const SENIORITY_TERMS = ["senior", "staff", "principal", "lead", "head"];
const PM_TERMS = ["product manager", "pm", "head of product"];
const JUNIOR_TERMS = ["associate", "junior", "intern"];
const TARGET_INDUSTRIES = ["ai/ml", "ai", "ml", "saas", "dev tools", "consumer", "gaming", "games"];

/**
 * In games, the role that owns scope and shipping is a Producer and the ops
 * role is Live Ops. Scoring only PM_TERMS gave every one of them a title_match
 * of 0, so the roles Jon is most qualified for ranked last on his own board.
 * Gated on industry: a "Producer" at a media company is a different job.
 */
const GAMING_TITLE_TERMS = [
  "producer",
  "production",
  "development director",
  "program manager",
  "project manager",
  "live ops",
  "liveops",
  "live operations",
  "publishing",
];

/** Signals from Jon's actual gaming record: F2P mobile, live service, monetization. */
const GAMING_KEYWORDS = [
  "live ops",
  "liveops",
  "live service",
  "free-to-play",
  "f2p",
  "monetization",
  "monetisation",
  "retention",
  "engagement",
  "player",
  "mobile",
  "in-app purchase",
  "game",
];
const TARGET_STAGES = ["seed", "series a", "series b"];
const BAY_AREA_HINTS = [
  "san francisco",
  "sf",
  "bay area",
  "oakland",
  "berkeley",
  "palo alto",
  "mountain view",
  "menlo park",
  "south san francisco",
];

function lc(s: string | null | undefined): string {
  return (s || "").toLowerCase();
}

export function computeAutoFitScore(entry: PipelineEntry): {
  total: number;
  breakdown: ScoreBreakdown;
} {
  const role = lc(entry.role);
  const jd = lc(entry.jd_text);
  const industry = lc(entry.industry);
  const stage = lc(entry.stage);
  const location = lc(entry.location);

  const breakdown: ScoreBreakdown = {
    title_match: 0,
    seniority_fit: 0,
    keyword_match: 0,
    industry_fit: 0,
    stage_fit: 0,
    red_flags: 0,
  };

  const isGaming = industry.includes("gaming") || industry.includes("games");

  if (PM_TERMS.some((t) => role.includes(t))) breakdown.title_match = 25;
  else if (isGaming && GAMING_TITLE_TERMS.some((t) => role.includes(t))) {
    breakdown.title_match = 25;
  }
  if (SENIORITY_TERMS.some((t) => role.includes(t))) breakdown.seniority_fit = 15;

  const keywordPool = isGaming ? [...KEYWORDS, ...GAMING_KEYWORDS] : KEYWORDS;
  const matchedKeywords = keywordPool.filter((k) => jd.includes(k));
  breakdown.keyword_match = Math.min(matchedKeywords.length * 5, 25);

  if (TARGET_INDUSTRIES.some((i) => industry.includes(i))) breakdown.industry_fit = 15;
  if (TARGET_STAGES.some((s) => stage.includes(s))) breakdown.stage_fit = 10;

  if (JUNIOR_TERMS.some((t) => role.includes(t))) breakdown.red_flags -= 30;
  if (
    location.includes("on-site") &&
    !BAY_AREA_HINTS.some((h) => location.includes(h))
  ) {
    breakdown.red_flags -= 20;
  }

  const raw =
    breakdown.title_match +
    breakdown.seniority_fit +
    breakdown.keyword_match +
    breakdown.industry_fit +
    breakdown.stage_fit +
    breakdown.red_flags;

  const total = Math.max(0, Math.min(100, raw));
  return { total, breakdown };
}
