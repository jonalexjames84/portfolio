"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Zap } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

/* ── Scramble text hook ──────────────────────────────────── */

function useScramble(text: string, trigger: number) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (trigger === 0) {
      setDisplay(text);
      return;
    }
    const glyphs = "0123456789!@#$%&*";
    let frame = 0;
    const total = text.length * 5;
    const id = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((ch, i) =>
            frame / 5 > i
              ? ch
              : glyphs[Math.floor(Math.random() * glyphs.length)]
          )
          .join("")
      );
      frame++;
      if (frame >= total) {
        clearInterval(id);
        setDisplay(text);
      }
    }, 35);
    return () => clearInterval(id);
  }, [text, trigger]);

  return display;
}

/* ── Tool logo map ─────────────────────────────────────── */

const toolLogos: Record<string, { src: string; bg: string }> = {
  Fireflies: { src: "/logos/fireflies.png", bg: "bg-purple-100 dark:bg-purple-900/40" },
  NotebookLM: { src: "/logos/notebooklm.svg", bg: "bg-blue-100 dark:bg-blue-900/40" },
  Notion: { src: "/logos/notion.svg", bg: "bg-zinc-100 dark:bg-zinc-800" },
  "Claude Code": { src: "/logos/anthropic.svg", bg: "bg-amber-50 dark:bg-amber-900/30" },
  Claude: { src: "/logos/anthropic.svg", bg: "bg-amber-50 dark:bg-amber-900/30" },
  ChatGPT: { src: "/logos/chatgpt.svg", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  Figma: { src: "/logos/figma.svg", bg: "bg-violet-100 dark:bg-violet-900/40" },
  Supabase: { src: "/logos/supabase.svg", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  GitHub: { src: "/logos/github.svg", bg: "bg-zinc-100 dark:bg-zinc-800" },
  Vercel: { src: "/logos/vercel.svg", bg: "bg-zinc-100 dark:bg-zinc-800" },
  PostHog: { src: "/logos/posthog.svg", bg: "bg-yellow-100 dark:bg-yellow-900/40" },
  "Next.js": { src: "/logos/nextjs.svg", bg: "bg-zinc-100 dark:bg-zinc-800" },
  "React Native": { src: "/logos/react.svg", bg: "bg-sky-100 dark:bg-sky-900/40" },
  TypeScript: { src: "/logos/typescript.svg", bg: "bg-blue-100 dark:bg-blue-900/40" },
};

function ToolIcon({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const logo = toolLogos[name];
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
    },
    [x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };
  const imgSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  if (!logo) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-xl bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400`}>
        {name.slice(0, 2)}
      </div>
    );
  }

  return (
    <motion.div
      className="group/tool relative flex flex-col items-center gap-1.5"
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ x: springX, y: springY }}
    >
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl ${logo.bg} ring-1 ring-zinc-200/60 transition-all group-hover/tool:scale-110 group-hover/tool:shadow-lg dark:ring-zinc-700/60`}
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
      <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
        {name}
      </span>
    </motion.div>
  );
}

/* ── Flow connector SVG ──────────────────────────────────── */

function FlowArrow({ gradient }: { gradient: string }) {
  const colorMap: Record<string, string> = {
    "from-indigo-500 to-violet-500": "#6366f1",
    "from-amber-500 to-orange-500": "#f59e0b",
    "from-emerald-500 to-teal-500": "#10b981",
  };
  const color = colorMap[gradient] || "#6366f1";

  return (
    <div className="flex items-center justify-center py-2">
      <motion.svg
        width="24"
        height="32"
        viewBox="0 0 24 32"
        fill="none"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <line
          x1="12"
          y1="0"
          x2="12"
          y2="24"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 3"
          opacity="0.4"
          className="flow-line"
        />
        <motion.path
          d="M6 20 L12 28 L18 20"
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ── Step node ─────────────────────────────────────────── */

type StepData = {
  title: string;
  description: string;
  tools: string[];
};

function StepNode({
  step,
  index,
  gradient,
}: {
  step: StepData;
  index: number;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div
        className="group relative w-full overflow-hidden rounded-2xl border text-left border-zinc-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
      >
        {/* Left accent bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`}
        />

        <div className="p-4 sm:p-5">
          {/* Header row with step number + title */}
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

          {/* Tool icons row */}
          {step.tools.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pl-11">
              {step.tools.map((tool) => (
                <ToolIcon key={tool} name={tool} size="sm" />
              ))}
            </div>
          )}

          {/* Description - always visible */}
          <p className="mt-3 pl-11 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Workflow data ─────────────────────────────────────── */

type WorkflowData = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  when: string;
  gradient: string;
  steps: StepData[];
  example: string;
  outputTools: string[];
};

const workflows: WorkflowData[] = [
  {
    id: "client-consulting",
    number: "01",
    title: "Client Consulting",
    subtitle: "Discovery to Delivery",
    when: "For clients who know roughly what they want but need help articulating it clearly and building it right.",
    gradient: "from-indigo-500 to-violet-500",
    steps: [
      {
        title: "Discovery Call",
        description:
          "Recorded session with Fireflies note-taker. PM-focused questions: who are we building for, what pain points are we solving, what do they like and dislike, what does success look like.",
        tools: ["Fireflies"],
      },
      {
        title: "Client Homework",
        description:
          "Client identifies competitors they like/dislike and why, defines their goals, mission, and purpose. This surfaces the real priorities before any code gets written.",
        tools: [],
      },
      {
        title: "Build the Brain",
        description:
          "Compile everything into NotebookLM as the central knowledge repo. Set up Notion as the single source of truth — product docs, strategy, branding, design specs — connected to Claude Code via MCP.",
        tools: ["NotebookLM", "Notion"],
      },
      {
        title: "Collect Assets & Review",
        description:
          "Gather images, fonts, branding assets, and design files. Drop everything into the project folder. Read through all generated docs to make sure everything aligns with the client's vision. This checkpoint usually takes a few days.",
        tools: ["Figma"],
      },
      {
        title: "Connect the Stack",
        description:
          "Wire up MCPs based on the project: Figma for design teams, Supabase for backend, GitHub + Vercel for deployment, PostHog for analytics. Each project gets exactly the integrations it needs.",
        tools: ["Supabase", "GitHub", "Vercel", "PostHog"],
      },
      {
        title: "Build",
        description:
          "Claude Code builds the full product against all the artifacts — docs, designs, assets, and live integrations. Notion tracks tasks in real time so I can watch agents run, see what they're working on, and catch issues as they happen.",
        tools: ["Claude Code", "Notion"],
      },
    ],
    outputTools: ["Next.js", "React Native", "TypeScript", "Supabase", "Vercel"],
    example: "Swob — built 5 prototypes as investor demos and living specs for the founding team.",
  },
  {
    id: "solo-prototyping",
    number: "02",
    title: "Solo Rapid Prototyping",
    subtitle: "Idea to Full Stack Product",
    when: "For personal products where I'm the PM, designer, and developer. Speed of iteration is the priority.",
    gradient: "from-amber-500 to-orange-500",
    steps: [
      {
        title: "Start with an Idea",
        description:
          "A problem I've experienced firsthand or spotted in a community. No formal discovery — the insight comes from living in the problem space.",
        tools: [],
      },
      {
        title: "Prototype Fast",
        description:
          "Build a front-end prototype directly in Claude or ChatGPT. Iterate on layout, flow, and feature scope until the best MVP surfaces. Many iteration cycles in a single day.",
        tools: ["Claude", "ChatGPT"],
      },
      {
        title: "Write PRD & TRD",
        description:
          "Once the prototype is solid, write a Product Requirements Doc and Technical Requirements Doc. Both go into the project folder alongside the prototype files.",
        tools: ["Notion"],
      },
      {
        title: "Claude Code Builds It",
        description:
          "Claude Code reviews all artifacts — prototype, PRD, TRD, branding instructions, and any special requirements — then builds the full stack product. Notion tracks tasks so I can monitor agent progress and resolve issues in real time.",
        tools: ["Claude Code", "Notion"],
      },
      {
        title: "Connect & Ship",
        description:
          "Wire up Supabase for backend, GitHub + Vercel for deployment, PostHog for analytics. Same production-grade infrastructure as client work, just faster to decision.",
        tools: ["Supabase", "GitHub", "Vercel", "PostHog"],
      },
    ],
    outputTools: ["Next.js", "React Native", "TypeScript", "Supabase", "Vercel"],
    example: "Pottery Friends — from studio observation to 150-member beta, built entirely with this workflow.",
  },
  {
    id: "internal-buy-in",
    number: "03",
    title: "Internal Buy-in",
    subtitle: "Interactive Prototypes for Stakeholders",
    when: "For getting executive and partner alignment. Not for customers — for internal decision-makers who need to see it to believe it.",
    gradient: "from-emerald-500 to-teal-500",
    steps: [
      {
        title: "Verbal Discussion",
        description:
          "Starts with a conversation — what does the team need, what's the vision, what would make this real? No formal docs. The input is a shared understanding of the goal.",
        tools: [],
      },
      {
        title: "Vibe Code It",
        description:
          "Pure vibe coding with Claude Code. Instead of PRDs or one-pagers, I build the interactive prototype directly from the conversation. The prototype is the spec.",
        tools: ["Claude Code"],
      },
      {
        title: "Ship & Present",
        description:
          "Deploy to Vercel via GitHub so stakeholders can click through a live URL. An interactive prototype beats a slide deck every time for getting buy-in.",
        tools: ["GitHub", "Vercel"],
      },
      {
        title: "Iterate on Feedback",
        description:
          "Take stakeholder feedback and update the prototype in real time. The speed of this loop is the whole point — show, don't tell, and close the gap between vision and reality fast.",
        tools: ["Claude Code", "Vercel"],
      },
    ],
    outputTools: ["Next.js", "TypeScript", "Vercel"],
    example: "Frame Story — game studio prototypes and pitch materials built to secure funding and align the team.",
  },
];

/* ── Tab selector ──────────────────────────────────────── */

function WorkflowTab({
  workflow,
  isActive,
  onClick,
}: {
  workflow: WorkflowData;
  isActive: boolean;
  onClick: () => void;
}) {
  const [scrambleKey, setScrambleKey] = useState(0);
  const displayNumber = useScramble(workflow.number, scrambleKey);

  useEffect(() => {
    if (isActive) setScrambleKey((k) => k + 1);
  }, [isActive]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setScrambleKey((k) => k + 1)}
      className={`relative flex flex-1 flex-col items-center gap-2 rounded-2xl border px-4 py-5 transition-all ${
        isActive
          ? "border-zinc-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
          : "border-zinc-200 bg-white/60 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/60"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${workflow.gradient}`}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${workflow.gradient} font-mono text-sm font-bold text-white shadow-md`}
      >
        {displayNumber}
      </span>
      <div className="text-center">
        <p className={`text-sm font-semibold ${isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>
          {workflow.title}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          {workflow.subtitle}
        </p>
      </div>
    </button>
  );
}

/* ── Main component ────────────────────────────────────── */

export function WorkflowDiagram() {
  const [activeWorkflow, setActiveWorkflow] = useState(0);
  const workflow = workflows[activeWorkflow];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <div className="mb-10">
        <div className="hero-grain relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-8 sm:p-10 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
          {/* Aurora blobs */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10"
            style={{ animation: "float-blob 12s ease-in-out infinite" }}
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-600/15"
            style={{ animation: "float-blob 15s ease-in-out infinite 2s" }}
          />
          <div
            className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-purple-400/15 blur-3xl dark:bg-purple-600/10"
            style={{ animation: "float-blob 18s ease-in-out infinite 4s" }}
          />

          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="icon-container">
                <Zap className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                How I Build with AI
              </h1>
            </div>
            <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
              Three workflows for three contexts. The tools change depending on
              who I&apos;m building for, but the principle is the same: AI
              handles the execution, I handle the judgment.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow tabs */}
      <AnimatedSection className="mb-10" delay={0.05}>
        <div className="flex gap-3">
          {workflows.map((w, i) => (
            <WorkflowTab
              key={w.id}
              workflow={w}
              isActive={activeWorkflow === i}
              onClick={() => setActiveWorkflow(i)}
            />
          ))}
        </div>
      </AnimatedSection>

      {/* Active workflow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={workflow.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Context line */}
          <div className="mb-8 rounded-xl border border-dashed border-zinc-300 bg-white/50 px-5 py-3 dark:border-zinc-700 dark:bg-zinc-900/20">
            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              <span className={`font-semibold bg-gradient-to-r ${workflow.gradient} bg-clip-text text-transparent`}>
                When:
              </span>{" "}
              {workflow.when}
            </p>
          </div>

          {/* Flow diagram */}
          <div className="space-y-0">
            {workflow.steps.map((step, i) => (
              <div key={step.title}>
                {i > 0 && <FlowArrow gradient={workflow.gradient} />}
                <StepNode
                  step={step}
                  index={i}
                  gradient={workflow.gradient}
                />
              </div>
            ))}
          </div>

          {/* Output arrow */}
          <FlowArrow gradient={workflow.gradient} />

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`rounded-2xl border-2 border-dashed p-5 ${
              workflow.gradient === "from-indigo-500 to-violet-500"
                ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20"
                : workflow.gradient === "from-amber-500 to-orange-500"
                  ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                  : "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
            }`}
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

          {/* Example */}
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <span
                className={`font-semibold bg-gradient-to-r ${workflow.gradient} bg-clip-text text-transparent`}
              >
                Example:
              </span>{" "}
              {workflow.example}
            </p>
          </div>
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
