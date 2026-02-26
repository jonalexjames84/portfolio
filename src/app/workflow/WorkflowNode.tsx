"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { StepData, WorkflowColor } from "./workflowData";
import { toolLogos } from "./workflowData";

/* ── Tool icon sub-component ──────────────────────────── */

export function ToolIcon({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const logo = toolLogos[name];
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };
  const imgSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  if (!logo) {
    return (
      <motion.div
        whileHover={{ scale: 1.15 }}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-zinc-100 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400`}
      >
        {name.slice(0, 2)}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.15 }}
      className="group/tool relative flex flex-col items-center gap-1"
    >
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-lg ${logo.bg} ring-1 ring-zinc-200/60 transition-shadow group-hover/tool:shadow-md dark:ring-zinc-700/60`}
      >
        <Image
          src={logo.src}
          alt={name}
          width={28}
          height={28}
          className={`${imgSizes[size]} object-contain`}
          unoptimized
        />
      </div>
      {size !== "sm" && (
        <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
          {name}
        </span>
      )}
    </motion.div>
  );
}

/* ── Spatial node card ────────────────────────────────── */

export function WorkflowNode({
  step,
  index,
  color,
  gradient,
  isHovered,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onClick,
}: {
  step: StepData;
  index: number;
  color: WorkflowColor;
  gradient: string;
  isHovered: boolean;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout="position"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: isDimmed ? 0.5 : 1,
        transition: {
          scale: { type: "spring", stiffness: 400, damping: 25, delay: index * 0.07 },
          opacity: { duration: 0.2 },
        },
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.03 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{
        left: `${step.x}%`,
        top: `${step.y}%`,
        width: "clamp(200px, 22vw, 280px)",
        zIndex: isHovered || isActive ? 30 : 20,
      }}
    >
      <motion.div
        className={`relative overflow-hidden rounded-2xl border bg-white/95 backdrop-blur-sm transition-colors dark:bg-zinc-900/95 ${
          isHovered || isActive
            ? "border-zinc-300 dark:border-zinc-600"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
        animate={{
          boxShadow: isHovered || isActive ? color.glow : "0 1px 3px rgba(0,0,0,0.08)",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Left gradient accent bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`}
        />

        <div className="p-3 pl-4">
          {/* Header: step number + title */}
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-[11px] font-bold text-white shadow-sm`}
            >
              {index + 1}
            </span>
            <h3 className="text-[13px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
              {step.title}
            </h3>
          </div>

          {/* Tool icons row */}
          {step.tools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 pl-9">
              {step.tools.map((tool) => (
                <ToolIcon key={tool} name={tool} size="sm" />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Mobile fallback card (vertical layout) ───────────── */

export function WorkflowNodeMobile({
  step,
  index,
  color,
  gradient,
  isActive,
  onClick,
}: {
  step: StepData;
  index: number;
  color: WorkflowColor;
  gradient: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <button
        onClick={onClick}
        className={`group relative w-full overflow-hidden rounded-2xl border text-left transition-all ${
          isActive
            ? "border-zinc-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
            : "border-zinc-200 bg-white/80 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
        }`}
      >
        {/* Left accent bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient} transition-opacity ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          }`}
        />

        <div className="p-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-xs font-bold text-white shadow-sm`}
            >
              {index + 1}
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {step.title}
            </h3>
          </div>

          {step.tools.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pl-11">
              {step.tools.map((tool) => (
                <ToolIcon key={tool} name={tool} size="sm" />
              ))}
            </div>
          )}

          {isActive && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 pl-11 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
            >
              {step.description}
            </motion.p>
          )}
        </div>
      </button>
    </motion.div>
  );
}
