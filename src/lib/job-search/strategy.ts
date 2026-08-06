import { buildFunnel, type FunnelReport } from "./funnel";

/**
 * Whether the search is being run the way the Job Search OS describes.
 *
 * The dashboard measures `applications_sent` against a target. That framing has
 * exactly one answer when twelve applications have produced zero interviews:
 * send more. This module asks the other question — is the machine converting,
 * and where does it leak — and it grades the five principles in
 * `job-search-os/CLAUDE.md` against what the data actually shows.
 *
 * On 2026-08-05 all five were being violated: 26 contacts and none approached,
 * an average applied fit of 77 while 34 saved roles scored 80+, zero work
 * products, zero interviews, and thirteen finished applications sitting unsent.
 *
 * The load-bearing rule here is the same one `funnel.ts` and
 * `channel-attribution.ts` already enforce: **absent evidence is not evidence
 * of failure.** A lever with too little sample returns `unknown`, never a red
 * zero. Twelve applications and no interviews is not a 0% conversion rate, it
 * is twelve applications. A page that shouts everywhere is one you stop
 * reading — so it only shouts where the finding needs no statistics.
 */

// ---------------------------------------------------------------------------
// The thesis
// ---------------------------------------------------------------------------

/**
 * What Jon said he was looking for, in the terms the pipeline stores.
 *
 * Source of truth is `job-search-os/context-library/career-plan.md`, which is
 * prose and cannot be queried. This is the machine-readable restatement of it;
 * when the career plan changes, change this with it.
 *
 * Kept as a declaration of which stored values count rather than a hardcoded
 * verdict, so "on-thesis" stays computed from `industry` and `stage` on
 * `job_pipeline_entries` rather than asserted.
 */
export const THESIS = {
  summary:
    "Senior PM · seed–Series B AI/ML, dev tools, and games · Bay Area or remote",
  /**
   * Single-word terms match a whole token; multi-word terms match as a phrase.
   *
   * Not a plain substring test. The stored values are messy — `Growth / Dev
   * Tools`, `Healthcare AI`, `SaaS / dev tools` — and a bare `includes("ai")`
   * also matches `International` and `Retail`. Tokenising keeps `Healthcare AI`
   * in and `International` out.
   *
   * `gaming` is on-thesis deliberately. The career plan calls games "deep but
   * not the target"; Jon's later standing instruction is that game studios are
   * in scope and should be searched. 62 gaming rows are in the pipeline because
   * of that instruction, and grading them off-thesis would contradict it.
   */
  industries: [
    "ai",
    "ml",
    "dev tools",
    "developer tools",
    "saas",
    "consumer",
    "gaming",
  ],
  stages: ["seed", "series a", "series b", "pre-seed", "early"],
  /** Fit score at or above which a saved role is worth acting on. */
  worthActingOn: 80,
} as const;

function industryMatches(industry: string): boolean {
  const i = industry.toLowerCase();
  const tokens = new Set(i.split(/[^a-z0-9]+/).filter(Boolean));
  return THESIS.industries.some((t) =>
    t.includes(" ") ? i.includes(t) : tokens.has(t),
  );
}

export function isOnThesis(
  industry: string | null,
  stage: string | null,
): boolean {
  const i = (industry || "").trim();
  const s = (stage || "").toLowerCase();
  // An unlabelled row is not counted as on-thesis. Treating null as a match
  // would make the number rise every time the ingest failed to classify.
  if (!i) return false;
  if (!industryMatches(i)) return false;
  // Stage is frequently null on ATS-ingested rows. Industry alone qualifies;
  // a stated stage outside the range disqualifies.
  if (!s) return true;
  return THESIS.stages.some((t) => s.includes(t));
}

// ---------------------------------------------------------------------------
// Leak funnel
// ---------------------------------------------------------------------------

/** Below this, a stage's conversion is withheld rather than rendered. */
export const MIN_LEAK_SAMPLE = 10;

export type LeakStageKey =
  | "targets"
  | "on_thesis"
  | "referral_path"
  | "applied"
  | "active"
  | "interview";

export interface LeakStage {
  key: LeakStageKey;
  label: string;
  count: number;
  /** What this stage means, shown so the number is not just a number. */
  note: string;
  /** Which stage this one narrows from. Null on the first. */
  parentKey: LeakStageKey | null;
  /** Conversion from the parent stage. Null below sample threshold. */
  conversionFromParent: number | null;
  sample: number;
  /**
   * Coverage of the parent rather than a gate through it.
   *
   * The referral path is not a stage applications pass through — two roles
   * reached `active` with no warm intro behind either. Rendered inline it
   * produced a chain reading 0 → 24 → 2, which looks like a bug. It measures
   * how many of the companies you applied to know you: a property of that
   * stage, not a step after it.
   */
  isBranch: boolean;
  /** The worst-converting stage with enough sample to say so. */
  isLeak: boolean;
  /**
   * How far this stage exceeds its parent, when it does.
   *
   * A funnel that widens is normally a bug. Here it is the finding: applying to
   * more companies than qualify under your own thesis is the shotgun
   * signature, so it is surfaced rather than smoothed over.
   */
  overflow: number | null;
}

export interface LeakInput {
  /** Companies being tracked at all. */
  targetsTracked: number;
  /** Companies with an on-thesis role scoring at or above the threshold. */
  qualifiedCompanies: number;
  /** Companies with a live application where a contact has been worked. */
  referralPathBuilt: number;
  /** Companies with a live application (prepared or submitted). */
  companiesApplied: number;
  /** Roles at screen, interview, or offer. */
  active: number;
  /** Interviews actually logged. */
  interviews: number;
}

/**
 * The chain from target list to conversation, every stage company-scoped.
 *
 * Each stage names the stage it narrows from rather than assuming the row above
 * it. That is what lets the referral path hang off `applied` as coverage
 * without pretending `active` flows through it — which it demonstrably does
 * not, since two roles got there with no warm intro at all.
 */
export function buildLeakFunnel(input: LeakInput): LeakStage[] {
  const raw: Array<
    Pick<LeakStage, "key" | "label" | "count" | "note" | "parentKey" | "isBranch">
  > = [
    {
      key: "targets",
      label: "Targets tracked",
      count: input.targetsTracked,
      note: "companies on the list",
      parentKey: null,
      isBranch: false,
    },
    {
      key: "on_thesis",
      label: "Qualified",
      count: input.qualifiedCompanies,
      note: `on-thesis, with a role scoring ${THESIS.worthActingOn}+`,
      parentKey: "targets",
      isBranch: false,
    },
    {
      key: "applied",
      label: "Applied",
      count: input.companiesApplied,
      note: "companies with a live application",
      parentKey: "on_thesis",
      isBranch: false,
    },
    {
      key: "referral_path",
      label: "Referral path built",
      count: input.referralPathBuilt,
      note: "of those, the ones where somebody inside has heard from you",
      parentKey: "applied",
      isBranch: true,
    },
    {
      key: "active",
      label: "Active",
      count: input.active,
      note: "screen, interview, or offer",
      parentKey: "applied",
      isBranch: false,
    },
    {
      key: "interview",
      label: "Interview",
      count: input.interviews,
      note: "conversations logged",
      parentKey: "active",
      isBranch: false,
    },
  ];

  const countByKey = new Map(raw.map((s) => [s.key, s.count]));

  const stages: LeakStage[] = raw.map((s) => {
    if (s.parentKey === null) {
      return {
        ...s,
        conversionFromParent: null,
        sample: 0,
        isLeak: false,
        overflow: null,
      };
    }
    const parent = countByKey.get(s.parentKey) ?? 0;
    const enough = parent >= MIN_LEAK_SAMPLE;
    return {
      ...s,
      conversionFromParent: enough ? Math.round((s.count / parent) * 100) : null,
      sample: parent,
      isLeak: false,
      overflow: s.count > parent ? s.count - parent : null,
    };
  });

  const leak = findLeak(stages);
  if (leak) leak.isLeak = true;

  return stages;
}

/**
 * The worst-converting stage that has enough upstream sample to say so.
 *
 * Returns the stage object itself (not a copy) so the caller can flag it. A
 * stage whose rate was withheld for low sample can never be the leak — that is
 * the honesty rule, and skipping it here is what keeps a 0-of-2 from
 * outranking a genuine 0-of-24. A stage that overflowed its parent is likewise
 * not a leak: it is the opposite problem and gets its own treatment.
 */
export function findLeak(stages: LeakStage[]): LeakStage | null {
  let worst: LeakStage | null = null;
  for (const s of stages) {
    if (s.conversionFromParent === null) continue;
    if (s.overflow !== null) continue;
    if (worst === null || s.conversionFromParent < worst.conversionFromParent!) {
      worst = s;
    }
  }
  return worst;
}

// ---------------------------------------------------------------------------
// Levers
// ---------------------------------------------------------------------------

export type LeverKey =
  | "referral_path"
  | "precision"
  | "depth"
  | "conversion"
  | "compounding";

/**
 * `unknown` is not a milder `weak`. It means the data cannot support a verdict,
 * and it must render differently — grey, not red. Twelve applications with no
 * interviews is not a failing conversion rate.
 */
export type LeverState = "critical" | "weak" | "working" | "unknown";

export interface Lever {
  key: LeverKey;
  /** The Job OS principle, quoted, so the grade has a stated standard. */
  principle: string;
  /** The number, phrased so it reads without the surrounding chrome. */
  headline: string;
  state: LeverState;
  /** What the data says. One sentence, no hedging. */
  finding: string;
  /** The single next move. Imperative and countable, or null when unknown. */
  move: string | null;
  href: string | null;
  /** 0-100 for the bar. Null when there is nothing to measure. */
  score: number | null;
}

export interface LeverInput {
  /** Contacts at companies where an application is already live. */
  contactsAtLiveCompanies: number;
  /** How many of those have actually been contacted. */
  contactsWorkedAtLiveCompanies: number;
  /** Total connections on record, worked or not. */
  totalConnections: number;
  /** Connections ever contacted. */
  totalContacted: number;

  /** Average fit score of what was applied to. Null when nothing applied. */
  avgScoreApplied: number | null;
  /**
   * Saved, never-acted-on roles that are on-thesis and score at or above the
   * threshold.
   *
   * On-thesis is part of the definition on purpose. A page arguing for thesis
   * discipline cannot then tell him to go apply to the highest-scoring roles
   * regardless of thesis, and showing a bare score-only count next to the
   * funnel's thesis-filtered one put two different "worth acting on" numbers
   * on one screen.
   */
  qualifiedUntouched: number;
  /** Saved roles in total, to phrase the backlog honestly. */
  savedCount: number;

  /** Materials whose type reads as a work product. */
  workProducts: number;
  /** Companies with a live application. */
  companiesApplied: number;

  funnel: FunnelReport;
  /** Applications actually submitted. */
  applicationsSubmitted: number;

  /** Interviews logged. */
  interviewsLogged: number;
  /** Interviews carrying a debrief — `key_improvement` filled in. */
  interviewsDebriefed: number;
}

/** Applications needed before a conversion rate is worth reading. */
export const MIN_CONVERSION_SAMPLE = 20;

function referralLever(input: LeverInput): Lever {
  const {
    contactsAtLiveCompanies: at,
    contactsWorkedAtLiveCompanies: worked,
    totalConnections,
    totalContacted,
  } = input;

  const principle = "A referral is 5x more effective. Build the path first.";

  // No contacts anywhere is a different problem from contacts you are sitting
  // on, and the move is different too: go find people, not go message them.
  if (totalConnections === 0) {
    return {
      key: "referral_path",
      principle,
      headline: "No contacts on record",
      state: "critical",
      finding:
        "There is nobody on the connection list, so every application is cold by default.",
      move: "Add contacts at your top target companies",
      href: "/job-search/network",
      score: 0,
    };
  }

  if (at === 0) {
    return {
      key: "referral_path",
      principle,
      headline: `${totalContacted} of ${totalConnections} contacts worked`,
      state: totalContacted === 0 ? "critical" : "weak",
      finding:
        "None of your contacts work at a company where you have a live application — the list and the pipeline do not overlap.",
      move: "Apply where you already know someone, or find contacts where you applied",
      href: "/job-search/network",
      score: totalConnections > 0 ? Math.round((totalContacted / totalConnections) * 100) : 0,
    };
  }

  const score = Math.round((worked / at) * 100);
  const state: LeverState = worked === 0 ? "critical" : score >= 60 ? "working" : "weak";

  return {
    key: "referral_path",
    principle,
    headline: `${worked} of ${at} warm contacts worked`,
    state,
    finding:
      worked === 0
        ? `${at} ${at === 1 ? "person" : "people"} on your list already work where your application is sitting, and ${at === 1 ? "they have" : "none of them has"} heard from you.`
        : `${at - worked} more ${at - worked === 1 ? "contact sits" : "contacts sit"} at companies where you have applied.`,
    move:
      worked === 0
        ? `Message ${at} warm ${at === 1 ? "contact" : "contacts"} before writing another cover letter`
        : `Message the remaining ${at - worked}`,
    href: "/job-search/network",
    score,
  };
}

function precisionLever(input: LeverInput): Lever {
  const { avgScoreApplied, qualifiedUntouched, savedCount } = input;
  const principle = "Precision over volume. Every application tailored. No spray-and-pray.";

  if (avgScoreApplied === null) {
    return {
      key: "precision",
      principle,
      headline: "Nothing applied yet",
      state: "unknown",
      finding: "No applications have gone out, so there is no targeting to grade.",
      move: null,
      href: null,
      score: null,
    };
  }

  // The damning comparison: better roles you saved and never touched than the
  // ones you actually applied to. That is the definition of applying to
  // whatever was in front of you.
  const betterAvailable = qualifiedUntouched > 0 && avgScoreApplied < THESIS.worthActingOn;

  const state: LeverState = betterAvailable
    ? "critical"
    : avgScoreApplied >= THESIS.worthActingOn
      ? "working"
      : "weak";

  return {
    key: "precision",
    principle,
    headline: `Applied at avg fit ${avgScoreApplied}`,
    state,
    finding: betterAvailable
      ? `${qualifiedUntouched} saved ${qualifiedUntouched === 1 ? "role is" : "roles are"} on-thesis, ${qualifiedUntouched === 1 ? "scores" : "score"} ${THESIS.worthActingOn}+, and ${qualifiedUntouched === 1 ? "has" : "have"} never been acted on — better roles than the ones you applied to.`
      : qualifiedUntouched > 0
        ? `${qualifiedUntouched} untouched on-thesis ${qualifiedUntouched === 1 ? "role scores" : "roles score"} ${THESIS.worthActingOn}+, in line with what you have been applying to.`
        : `Nothing saved is both on-thesis and scoring ${THESIS.worthActingOn}+. The backlog of ${savedCount} is not where the next application comes from.`,
    move: betterAvailable
      ? `Apply to the ${qualifiedUntouched} qualified saved roles instead of new ones`
      : qualifiedUntouched > 0
        ? `Work the ${qualifiedUntouched} qualified saved roles`
        : "Find better-fitting roles before applying again",
    href: "/dashboard/job-search",
    score: avgScoreApplied,
  };
}

function depthLever(input: LeverInput): Lever {
  const { workProducts, companiesApplied } = input;
  const principle = "Work products lead hiring-manager outreach.";

  if (companiesApplied === 0) {
    return {
      key: "depth",
      principle,
      headline: "Nothing applied yet",
      state: "unknown",
      finding: "No live applications, so there is nothing to go deep on.",
      move: null,
      href: null,
      score: null,
    };
  }

  const score = Math.min(100, Math.round((workProducts / companiesApplied) * 100));
  const state: LeverState = workProducts === 0 ? "weak" : score >= 25 ? "working" : "weak";

  return {
    key: "depth",
    principle,
    headline: `${workProducts} work ${workProducts === 1 ? "product" : "products"} across ${companiesApplied} live ${companiesApplied === 1 ? "company" : "companies"}`,
    state,
    finding:
      workProducts === 0
        ? "Every application is a resume and a cover letter — the same two artifacts every other candidate sends."
        : `${companiesApplied - workProducts} live ${companiesApplied - workProducts === 1 ? "company has" : "companies have"} no work product behind the application.`,
    move: "Build one work product for your top live company",
    href: "/job-search/materials",
    score,
  };
}

function conversionLever(input: LeverInput): Lever {
  const { funnel, applicationsSubmitted } = input;
  const principle = "The funnel converts, or the volume is wasted.";

  // The whole point of the honesty rule. Twelve applications and no interviews
  // is not a 0% conversion rate — it is twelve applications. Rendering it as a
  // red zero would tell him to fix a machine that has not run long enough to
  // be measured.
  if (applicationsSubmitted < MIN_CONVERSION_SAMPLE) {
    return {
      key: "conversion",
      principle,
      headline: `${applicationsSubmitted} of ~${MIN_CONVERSION_SAMPLE} applications needed`,
      state: "unknown",
      finding: `Too early to read a rate. ${MIN_CONVERSION_SAMPLE - applicationsSubmitted} more ${MIN_CONVERSION_SAMPLE - applicationsSubmitted === 1 ? "application" : "applications"} before the numbers mean anything.`,
      move: null,
      href: null,
      score: null,
    };
  }

  const screens = funnel.stages.find((s) => s.key === "screens");
  const rate = screens?.conversionFromPrevious ?? null;

  if (rate === null) {
    return {
      key: "conversion",
      principle,
      headline: "Not enough through the funnel",
      state: "unknown",
      finding: "The funnel has not moved enough for a rate to be meaningful.",
      move: null,
      href: null,
      score: null,
    };
  }

  const state: LeverState = rate === 0 ? "critical" : rate < 10 ? "weak" : "working";

  return {
    key: "conversion",
    principle,
    headline: `${rate}% of applications reach a screen`,
    state,
    finding:
      rate === 0
        ? `${applicationsSubmitted} applications and no screens. This is a targeting or a materials problem, not a volume one.`
        : `${applicationsSubmitted} applications produced ${funnel.stages.find((s) => s.key === "screens")?.count ?? 0} screens.`,
    move: rate < 10 ? "Fix targeting and materials before sending more" : "Keep the pace",
    href: "/dashboard/job-search",
    score: Math.min(100, rate * 5),
  };
}

function compoundingLever(input: LeverInput): Lever {
  const { interviewsLogged, interviewsDebriefed } = input;
  const principle = "The system compounds. Each debrief sharpens the next interview.";

  if (interviewsLogged === 0) {
    return {
      key: "compounding",
      principle,
      headline: "Flywheel not started",
      state: "unknown",
      finding:
        "No interviews logged yet, so there is nothing to learn from. This turns on once conversations start.",
      move: null,
      href: null,
      score: null,
    };
  }

  const score = Math.round((interviewsDebriefed / interviewsLogged) * 100);
  const state: LeverState = score === 0 ? "weak" : score >= 80 ? "working" : "weak";

  return {
    key: "compounding",
    principle,
    headline: `${interviewsDebriefed} of ${interviewsLogged} interviews debriefed`,
    state,
    finding:
      score === 100
        ? "Every interview has a debrief. The next one starts from what the last one taught you."
        : `${interviewsLogged - interviewsDebriefed} ${interviewsLogged - interviewsDebriefed === 1 ? "interview has" : "interviews have"} no debrief, so ${interviewsLogged - interviewsDebriefed === 1 ? "its lesson is" : "their lessons are"} lost.`,
    move: score === 100 ? null : "Debrief the interviews that have none",
    href: "/job-search/interviews",
    score,
  };
}

/** How much a lever moves the north star when it is fixed. Ties break here. */
const LEVERAGE_WEIGHT: Record<LeverKey, number> = {
  referral_path: 5,
  precision: 4,
  conversion: 3,
  depth: 2,
  compounding: 1,
};

const STATE_ORDER: Record<LeverState, number> = {
  critical: 0,
  weak: 1,
  working: 2,
  unknown: 3,
};

/**
 * All five levers, worst and highest-leverage first.
 *
 * `unknown` sorts last on purpose — a lever that cannot be graded should never
 * outrank one that can, however important it is in principle.
 */
export function buildLevers(input: LeverInput): Lever[] {
  const levers = [
    referralLever(input),
    precisionLever(input),
    depthLever(input),
    conversionLever(input),
    compoundingLever(input),
  ];

  return levers.sort((a, b) => {
    const byState = STATE_ORDER[a.state] - STATE_ORDER[b.state];
    if (byState !== 0) return byState;
    return LEVERAGE_WEIGHT[b.key] - LEVERAGE_WEIGHT[a.key];
  });
}

/** The moves worth doing this week, drawn from the levers that have one. */
export function topMoves(levers: Lever[], limit = 3): Lever[] {
  return levers.filter((l) => l.move !== null && l.state !== "working").slice(0, limit);
}

// ---------------------------------------------------------------------------
// Stop doing
// ---------------------------------------------------------------------------

export interface StopItem {
  id: string;
  /** The instruction, imperative. */
  text: string;
  /** Why, in one sentence. */
  because: string;
}

export interface StopInput {
  savedCount: number;
  qualifiedUntouched: number;
  preparedUnsent: number;
  contactsAtLiveCompanies: number;
  contactsWorkedAtLiveCompanies: number;
  applicationsSubmitted: number;
  interviewsLogged: number;
}

/** Saved roles beyond which the backlog is the problem, not the supply. */
export const BACKLOG_CEILING = 50;

/**
 * What to stop doing.
 *
 * The half the dashboard cannot express. A volume dashboard has no way to say
 * "the answer is not more" — every metric on it goes up and to the right. Most
 * of the wasted effort in this search is in things that feel productive:
 * saving more roles, opening more applications, running the ingest again.
 */
export function buildStopDoing(input: StopInput): StopItem[] {
  const out: StopItem[] = [];

  if (input.savedCount > BACKLOG_CEILING) {
    out.push({
      id: "stop_saving",
      text: `Stop adding to the ${input.savedCount} saved roles`,
      because:
        input.qualifiedUntouched > 0
          ? `${input.qualifiedUntouched} of them are already on-thesis, score ${THESIS.worthActingOn}+, and have never been acted on. Supply is not the constraint.`
          : "Nothing in the backlog is being acted on. More rows will not change that.",
    });
  }

  if (input.preparedUnsent > 0) {
    out.push({
      id: "stop_claiming",
      text: `Don't start a new application while ${input.preparedUnsent} ${input.preparedUnsent === 1 ? "sits" : "sit"} prepared and unsent`,
      because: `The work is already done on ${input.preparedUnsent}. Sending ${input.preparedUnsent === 1 ? "it" : "them"} costs minutes; writing a new one costs an hour.`,
    });
  }

  const unworked = input.contactsAtLiveCompanies - input.contactsWorkedAtLiveCompanies;
  if (unworked > 0) {
    out.push({
      id: "stop_cold",
      text: "Stop applying cold where you already know someone",
      because: `${unworked} ${unworked === 1 ? "contact" : "contacts"} at companies with a live application ${unworked === 1 ? "has" : "have"} never been messaged. That is the 5x channel, unused.`,
    });
  }

  // Only once there is real evidence the funnel is not converting. Below the
  // sample threshold this would be telling him to stop on no evidence at all.
  if (
    input.applicationsSubmitted >= MIN_CONVERSION_SAMPLE &&
    input.interviewsLogged === 0
  ) {
    out.push({
      id: "stop_volume",
      text: "Stop increasing volume until one application converts",
      because: `${input.applicationsSubmitted} applications and no interviews. More of the same input produces more of the same output.`,
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

export interface ThesisReport {
  summary: string;
  /** Share of submitted applications that were on-thesis. Null when none sent. */
  onThesisPct: number | null;
  /** Share that came through a referral. Null when none sent. */
  referralPct: number | null;
  avgScoreApplied: number | null;
  applicationsSubmitted: number;
}

export interface StrategyReport {
  thesis: ThesisReport;
  leak: LeakStage[];
  levers: Lever[];
  moves: Lever[];
  stop: StopItem[];
}

export interface StrategyInput extends LeverInput, LeakInput, StopInput {
  onThesisApplied: number;
  referralApplied: number;
}

export function buildStrategy(input: StrategyInput): StrategyReport {
  const levers = buildLevers(input);
  const sent = input.applicationsSubmitted;

  return {
    thesis: {
      summary: THESIS.summary,
      onThesisPct: sent > 0 ? Math.round((input.onThesisApplied / sent) * 100) : null,
      referralPct: sent > 0 ? Math.round((input.referralApplied / sent) * 100) : null,
      avgScoreApplied: input.avgScoreApplied,
      applicationsSubmitted: sent,
    },
    leak: buildLeakFunnel(input),
    levers,
    moves: topMoves(levers),
    stop: buildStopDoing(input),
  };
}

export { buildFunnel };
