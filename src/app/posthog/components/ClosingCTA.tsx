"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import posthog from "posthog-js";

export function ClosingCTA() {
  return (
    <AnimatedSection className="mb-16">
      <div className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <p className="text-center text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Happy to walk through the data behind these recommendations or dig
          deeper into any of these areas. I&apos;ve been living in PostHog daily for a
          year — there&apos;s more where this came from.
        </p>
        <p className="mt-4 text-center">
          <a
            href="https://www.linkedin.com/in/jonmartin-pm/"
            className="text-sm font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
            onClick={() =>
              posthog.capture("posthog_cta_clicked", {
                cta_type: "linkedin",
                source: "posthog_page",
              })
            }
          >
            Connect on LinkedIn
          </a>
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
          <a
            href="mailto:jonalexjames@gmail.com"
            className="text-sm font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
            onClick={() =>
              posthog.capture("posthog_cta_clicked", {
                cta_type: "email",
                source: "posthog_page",
              })
            }
          >
            jonalexjames@gmail.com
          </a>
        </p>
      </div>
    </AnimatedSection>
  );
}
