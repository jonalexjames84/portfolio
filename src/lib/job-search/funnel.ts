/**
 * The funnel that ends in the north star.
 *
 * Every stage here is something that must happen before an offer exists, which
 * is why this and not a leading-indicator set: the dashboard should read as one
 * chain, not a scoreboard of loosely related numbers.
 *
 * The load-bearing decision is that **a conversion rate below sample threshold
 * is not shown at all**. With twelve applications and one rejection, "8%
 * response rate" is two data points wearing a percentage, and a number on a
 * dashboard gets treated as a finding no matter how small the caveat next to
 * it. Same reasoning as MIN_SAMPLE in channel-attribution.ts.
 */

/** Below this, a stage's conversion is withheld rather than rendered. */
export const MIN_STAGE_SAMPLE = 20;

export interface FunnelStage {
  key: "applications" | "screens" | "interviews" | "offers";
  label: string;
  count: number;
  /**
   * Conversion from the previous stage, as a percentage. Null when the
   * upstream stage has too little sample to mean anything, or is empty.
   */
  conversionFromPrevious: number | null;
  /** Upstream count the rate is computed against — shown as the `n=`. */
  sample: number;
}

export interface FunnelReport {
  stages: FunnelStage[];
  offers: number;
  interviewsInFlight: number;
  applicationsOut: number;
  /** Days since the first application, so a zero can read as early. */
  daysRunning: number | null;
}

export interface FunnelInput {
  applications: number;
  screens: number;
  interviews: number;
  offers: number;
  firstApplicationDate?: string | null;
  now?: Date;
}

function conversion(
  current: number,
  previous: number,
): { rate: number | null; sample: number } {
  // An empty upstream stage has no rate — not 0%, which would read as failure
  // rather than as nothing-has-happened-yet.
  if (previous <= 0) return { rate: null, sample: previous };
  if (previous < MIN_STAGE_SAMPLE) return { rate: null, sample: previous };
  return { rate: Math.round((current / previous) * 100), sample: previous };
}

export function buildFunnel(input: FunnelInput): FunnelReport {
  const { applications, screens, interviews, offers } = input;

  const screenConv = conversion(screens, applications);
  const interviewConv = conversion(interviews, screens);
  const offerConv = conversion(offers, interviews);

  const stages: FunnelStage[] = [
    {
      key: "applications",
      label: "Applications",
      count: applications,
      conversionFromPrevious: null,
      sample: 0,
    },
    {
      key: "screens",
      label: "Screens",
      count: screens,
      conversionFromPrevious: screenConv.rate,
      sample: screenConv.sample,
    },
    {
      key: "interviews",
      label: "Interviews",
      count: interviews,
      conversionFromPrevious: interviewConv.rate,
      sample: interviewConv.sample,
    },
    {
      key: "offers",
      label: "Offers",
      count: offers,
      conversionFromPrevious: offerConv.rate,
      sample: offerConv.sample,
    },
  ];

  let daysRunning: number | null = null;
  if (input.firstApplicationDate) {
    const start = new Date(input.firstApplicationDate).getTime();
    if (!Number.isNaN(start)) {
      const now = (input.now ?? new Date()).getTime();
      daysRunning = Math.max(0, Math.floor((now - start) / 86_400_000));
    }
  }

  return {
    stages,
    offers,
    interviewsInFlight: interviews,
    applicationsOut: applications,
    daysRunning,
  };
}
