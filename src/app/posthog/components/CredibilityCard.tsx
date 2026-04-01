"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

const stats = [
  { value: "15+", label: "years shipping products" },
  { value: "150", label: "beta members tracked in PostHog" },
  { value: "5", label: "products built solo with AI" },
];

export function CredibilityCard() {
  return (
    <AnimatedSection className="mb-16">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Why Listen to Me
        </p>
        <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
          Product manager and founder. Daily PostHog power user.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-[#2563eb]">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
