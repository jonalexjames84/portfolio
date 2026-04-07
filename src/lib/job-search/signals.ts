export type SignalSeverity = "warn" | "alert" | "good";

export interface Signal {
  id: string;
  severity: SignalSeverity;
  message: string;
}

export interface SignalInput {
  weekdaysPassed: number;
  appsThisWeek: number;
  appsTarget: number;
  last10OutreachReplies: number;
  staleActiveRoles: Array<{ id: string; company: string; daysSince: number }>;
  interviewsThisWeek: number;
  savedCount: number;
  newTopTierJobs: Array<{ id: string; company: string; role: string; score: number }>;
}

export function computeSignals(input: SignalInput): Signal[] {
  const out: Signal[] = [];

  if (input.weekdaysPassed >= 3) {
    const projected = (input.appsThisWeek / input.weekdaysPassed) * 5;
    if (projected < input.appsTarget) {
      const daysLeft = 5 - input.weekdaysPassed;
      out.push({
        id: "apply_pace_slow",
        severity: "warn",
        message: `🟡 Apply pace slow — ${input.appsThisWeek}/${input.appsTarget} with ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
      });
    }
  }

  if (input.last10OutreachReplies === 0) {
    out.push({
      id: "outreach_no_replies",
      severity: "warn",
      message: "🟡 Last 10 outreach → 0 replies. Tighten messaging?",
    });
  }

  for (const role of input.staleActiveRoles) {
    if (role.daysSince > 10) {
      out.push({
        id: "stale_active_role",
        severity: "alert",
        message: `🔴 ${role.company} — ${role.daysSince} days since last touch`,
      });
    }
  }

  if (input.interviewsThisWeek >= 3) {
    out.push({
      id: "hot_streak",
      severity: "good",
      message: `🟢 ${input.interviewsThisWeek} interviews booked this week — double down on prep`,
    });
  }

  if (input.savedCount < 5) {
    out.push({
      id: "pipeline_drying_up",
      severity: "alert",
      message: `🔴 Only ${input.savedCount} saved roles — refill the pipeline`,
    });
  }

  for (const job of input.newTopTierJobs) {
    if (job.score >= 90) {
      out.push({
        id: "new_top_tier_job",
        severity: "good",
        message: `🟢 New top match: ${job.role} at ${job.company} (${job.score}/100)`,
      });
    }
  }

  return out;
}
