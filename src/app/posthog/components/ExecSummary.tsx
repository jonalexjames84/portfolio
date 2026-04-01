"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

export function ExecSummary() {
  return (
    <AnimatedSection className="mb-16">
      <div className="rounded-xl border-l-4 border-[#2563eb] bg-zinc-50 p-6 dark:bg-zinc-900/50">
        <p className="mb-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
          PostHog&apos;s all-in-one platform is uniquely valuable for solo builders — the
          exact persona shipping AI-native products with Claude Code, Cursor, and
          Replit. But the onboarding experience assumes you have a team: a data
          engineer to design events, a PM to define funnels, an analyst to build
          dashboards. Solo builders are all three.
        </p>
        <p className="text-lg font-semibold text-[#2563eb]">
          PostHog replaces 8+ tools for solo builders — but the onboarding
          assumes you have a team.
        </p>
      </div>
    </AnimatedSection>
  );
}
