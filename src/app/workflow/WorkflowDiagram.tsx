"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { workflows } from "./workflowData";
import { WorkflowBackground } from "./WorkflowBackground";
import { WorkflowNode, WorkflowNodeMobile, ToolIcon } from "./WorkflowNode";
import { WorkflowConnections } from "./WorkflowConnections";
import { WorkflowSelector } from "./WorkflowSelector";

/* ── Detail panel (slide-out from right) ──────────────── */

function DetailPanel({
  step,
  index,
  gradient,
  color,
  onClose,
}: {
  step: (typeof workflows)[0]["steps"][0];
  index: number;
  gradient: string;
  color: (typeof workflows)[0]["color"];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 bottom-0 z-40 w-80 overflow-y-auto border-l border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 lg:w-96"
    >
      <div className="p-6">
        <button
          onClick={onClose}
          className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-md`}
          >
            {index + 1}
          </span>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {step.title}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6">
          {step.description}
        </p>

        {step.tools.length > 0 && (
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Tools
            </p>
            <div className="flex flex-wrap gap-3">
              {step.tools.map((tool) => (
                <ToolIcon key={tool} name={tool} size="lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Mobile detail sheet (bottom) ─────────────────────── */

function DetailSheet({
  step,
  index,
  gradient,
  onClose,
}: {
  step: (typeof workflows)[0]["steps"][0];
  index: number;
  gradient: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="p-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-xs font-bold text-white`}
          >
            {index + 1}
          </span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {step.title}
          </h3>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-4">
          {step.description}
        </p>
        {step.tools.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {step.tools.map((tool) => (
              <ToolIcon key={tool} name={tool} size="md" />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Mobile vertical flow arrow ───────────────────────── */

function MobileFlowArrow({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center py-2">
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
        <motion.path
          d="M12 0 L12 24"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 3"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        <path
          d="M6 20 L12 28 L18 20"
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

/* ── Main orchestrator ────────────────────────────────── */

export function WorkflowDiagram() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  const workflow = workflows[activeWorkflow];

  // Container resize observer for the spatial diagram
  useEffect(() => {
    const el = diagramRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const connectionsY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const handleWorkflowSwitch = useCallback((index: number) => {
    setActiveWorkflow(index);
    setActiveStep(null);
    setHoveredNode(null);
  }, []);

  const handleNodeClick = useCallback(
    (index: number) => {
      setActiveStep(activeStep === index ? null : index);
    },
    [activeStep],
  );

  return (
    <div ref={containerRef} className="mx-auto max-w-6xl px-6 py-16">
      {/* Hero */}
      <AnimatedSection className="mb-10">
        <div className="hero-grain relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-6 sm:p-8 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
          <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl dark:bg-violet-600/10" />
          <motion.div
            className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            animate={{
              backgroundColor: [
                "rgba(99,102,241,0.08)",
                "rgba(139,92,246,0.08)",
                "rgba(168,85,247,0.08)",
                "rgba(99,102,241,0.08)",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              How I Build with AI
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Three workflows for three contexts. The tools change depending on
              who I&apos;m building for, but the principle is the same: AI
              handles the execution, I handle the judgment.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Workflow selector */}
      <AnimatedSection className="mb-10" delay={0.05}>
        <WorkflowSelector
          workflows={workflows}
          activeIndex={activeWorkflow}
          onSelect={handleWorkflowSwitch}
        />
      </AnimatedSection>

      {/* Context line */}
      <AnimatePresence mode="wait">
        <motion.div
          key={workflow.id + "-context"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mb-8 rounded-xl border border-dashed border-zinc-300 bg-white/50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-900/20"
        >
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            <span
              className={`font-semibold bg-gradient-to-r ${workflow.gradient} bg-clip-text text-transparent`}
            >
              When:
            </span>{" "}
            {workflow.when}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── DESKTOP: Spatial diagram (CSS-based, hidden below md) ── */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div
            ref={diagramRef}
            className="relative"
            style={{ height: "clamp(520px, 58vh, 720px)" }}
          >
            {/* Layer 1: Background (parallax slow) */}
            <motion.div
              className="absolute inset-0"
              style={{ y: bgY, zIndex: 0 }}
            >
              <WorkflowBackground color={workflow.color} />
            </motion.div>

            {/* Layer 2: Connections (parallax medium) */}
            <motion.div
              className="absolute inset-0"
              style={{ y: connectionsY, zIndex: 10 }}
            >
              <AnimatePresence mode="wait">
                <WorkflowConnections
                  key={workflow.id}
                  steps={workflow.steps}
                  color={workflow.color}
                  containerWidth={containerSize.width}
                  containerHeight={containerSize.height}
                  hoveredNode={hoveredNode}
                  workflowId={workflow.id}
                />
              </AnimatePresence>
            </motion.div>

            {/* Layer 3: Nodes (normal speed) */}
            <div className="absolute inset-0" style={{ zIndex: 20 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={workflow.id}
                  className="relative h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {workflow.steps.map((step, i) => (
                    <WorkflowNode
                      key={`${workflow.id}-${i}`}
                      step={step}
                      index={i}
                      color={workflow.color}
                      gradient={workflow.gradient}
                      isHovered={hoveredNode === i}
                      isActive={activeStep === i}
                      isDimmed={hoveredNode !== null && hoveredNode !== i}
                      onHover={() => setHoveredNode(i)}
                      onLeave={() => setHoveredNode(null)}
                      onClick={() => handleNodeClick(i)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Detail panel (slide from right) */}
            <AnimatePresence>
              {activeStep !== null && (
                <DetailPanel
                  step={workflow.steps[activeStep]}
                  index={activeStep}
                  gradient={workflow.gradient}
                  color={workflow.color}
                  onClose={() => setActiveStep(null)}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Output zone at bottom of diagram */}
          <div
            className="relative border-t border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80"
            style={{ zIndex: 25 }}
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${workflow.color.hex}40, transparent)`,
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="px-6 py-5 text-center">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Production Output
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {workflow.outputTools.map((tool) => (
                  <ToolIcon key={tool} name={tool} size="md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE: Enhanced vertical layout (CSS-based, hidden at md+) ── */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-0"
          >
            {workflow.steps.map((step, i) => (
              <div key={step.title}>
                {i > 0 && <MobileFlowArrow color={workflow.color.hex} />}
                <WorkflowNodeMobile
                  step={step}
                  index={i}
                  color={workflow.color}
                  gradient={workflow.gradient}
                  isActive={activeStep === i}
                  onClick={() => handleNodeClick(i)}
                />
              </div>
            ))}

            <MobileFlowArrow color={workflow.color.hex} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border-2 border-dashed p-5"
              style={{ borderColor: `${workflow.color.hex}40` }}
            >
              <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Production Output
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {workflow.outputTools.map((tool) => (
                  <ToolIcon key={tool} name={tool} size="md" />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile detail sheet */}
        <AnimatePresence>
          {activeStep !== null && (
            <DetailSheet
              step={workflow.steps[activeStep]}
              index={activeStep}
              gradient={workflow.gradient}
              onClose={() => setActiveStep(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Example */}
      <AnimatePresence mode="wait">
        <motion.div
          key={workflow.id + "-example"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <span
              className={`font-semibold bg-gradient-to-r ${workflow.gradient} bg-clip-text text-transparent`}
            >
              Example:
            </span>{" "}
            {workflow.example}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <AnimatedSection className="mt-16">
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-6 text-center dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-950/30">
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Every product on this site was built using one of these workflows.
            The common thread: AI is the force multiplier, but product judgment
            — knowing what to build, what to cut, and when to change direction —
            is the skill that makes it work.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
