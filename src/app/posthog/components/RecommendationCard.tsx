"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import posthog from "posthog-js";

function DashboardVisual() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {["Activation Funnel", "Retention Cohort", "Feature Usage"].map((label) => (
        <div
          key={label}
          className="rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/5 p-3 text-center dark:border-[#2563eb]/30 dark:bg-[#2563eb]/10"
        >
          <div className="mx-auto mb-2 h-8 w-full rounded bg-[#2563eb]/10" />
          <p className="text-[10px] font-medium text-[#2563eb]">{label}</p>
        </div>
      ))}
    </div>
  );
}

function TimelineVisual() {
  const milestones = [
    { trigger: "1K events", unlock: "Session Replay" },
    { trigger: "First funnel", unlock: "Feature Flags" },
    { trigger: "7 days of data", unlock: "Experiments" },
  ];
  return (
    <div className="mt-4 space-y-3">
      {milestones.map((m, i) => (
        <div key={m.trigger} className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">
            {i + 1}
          </div>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {m.trigger}
          </span>
          <div className="h-px w-4 bg-[#2563eb]" />
          <span className="rounded-md bg-[#2563eb]/10 px-2 py-0.5 text-xs font-medium text-[#2563eb]">
            {m.unlock}
          </span>
        </div>
      ))}
    </div>
  );
}

function PromptsVisual() {
  const prompts = [
    "What's my D7 retention this week?",
    "Why did signups drop on Tuesday?",
    "Which onboarding step has the highest drop-off?",
  ];
  return (
    <div className="mt-4 space-y-2">
      {prompts.map((prompt) => (
        <div
          key={prompt}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400"
        >
          <span className="mr-2 text-[#2563eb]">→</span>
          {prompt}
        </div>
      ))}
    </div>
  );
}

const visuals: Record<string, () => React.JSX.Element> = {
  dashboard: DashboardVisual,
  timeline: TimelineVisual,
  prompts: PromptsVisual,
};

export function RecommendationCard({
  number,
  title,
  summary,
  detail,
  visual,
}: {
  number: number;
  title: string;
  summary: string;
  detail: string;
  visual: "dashboard" | "timeline" | "prompts";
}) {
  const [open, setOpen] = useState(false);
  const Visual = visuals[visual];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: number * 0.1 }}
    >
      <button
        type="button"
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen) {
            posthog.capture("posthog_recommendation_expanded", {
              recommendation_number: number,
              recommendation_title: title,
            });
          }
        }}
        className={`w-full rounded-xl border text-left transition-all ${
          open
            ? "border-[#2563eb]/40 bg-[#2563eb]/5 shadow-md dark:border-[#2563eb]/30 dark:bg-[#2563eb]/5"
            : "border-zinc-200 bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
        } p-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-sm font-bold text-white">
              {number}
            </span>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {summary}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          </motion.div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {detail}
                </p>
                <Visual />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
