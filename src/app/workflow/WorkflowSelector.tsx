"use client";

import { motion } from "framer-motion";
import type { WorkflowData } from "./workflowData";

/* ── Mini-map thumbnail for a single workflow ─────────── */

function SelectorThumbnail({
  workflow,
  isActive,
  onClick,
}: {
  workflow: WorkflowData;
  isActive: boolean;
  onClick: () => void;
}) {
  const steps = workflow.steps;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center gap-3 rounded-2xl border px-4 py-5 transition-all ${
        isActive
          ? "border-zinc-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
          : "border-zinc-200 bg-white/60 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
      }`}
    >
      {/* Active gradient top bar */}
      {isActive && (
        <motion.div
          layoutId="activeSelectorTab"
          className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${workflow.gradient}`}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      {/* Mini node map */}
      <div className="relative h-12 w-full">
        <svg
          viewBox="0 0 100 60"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Thin connection lines */}
          {steps.slice(0, -1).map((step, i) => {
            const next = steps[i + 1];
            return (
              <line
                key={i}
                x1={step.x * 0.8 + 10}
                y1={step.y * 0.7 + 8}
                x2={next.x * 0.8 + 10}
                y2={next.y * 0.7 + 8}
                stroke={workflow.color.hex}
                strokeWidth="0.8"
                strokeOpacity={isActive ? 0.5 : 0.2}
              />
            );
          })}
          {/* Node dots */}
          {steps.map((step, i) => (
            <motion.circle
              key={i}
              cx={step.x * 0.8 + 10}
              cy={step.y * 0.7 + 8}
              r={isActive ? 3.5 : 2.5}
              fill={workflow.color.hex}
              opacity={isActive ? 0.8 : 0.35}
              animate={
                isActive
                  ? {
                      r: [3.5, 4.5, 3.5],
                      opacity: [0.8, 1, 0.8],
                    }
                  : { r: 2.5, opacity: 0.35 }
              }
              transition={
                isActive
                  ? {
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }
                  : { duration: 0.3 }
              }
            />
          ))}
        </svg>
      </div>

      {/* Label */}
      <div className="text-center">
        <p
          className={`text-sm font-semibold ${
            isActive
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {workflow.title}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          {workflow.subtitle}
        </p>
      </div>
    </button>
  );
}

/* ── Main selector ────────────────────────────────────── */

export function WorkflowSelector({
  workflows,
  activeIndex,
  onSelect,
}: {
  workflows: WorkflowData[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex gap-3">
      {workflows.map((w, i) => (
        <SelectorThumbnail
          key={w.id}
          workflow={w}
          isActive={activeIndex === i}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}
