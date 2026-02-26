/* ── Workflow Data, Types & Helpers ─────────────────────── */

export type StepData = {
  title: string;
  description: string;
  tools: string[];
  x: number; // percentage (0-100) within diagram container
  y: number; // percentage (0-100) within diagram container
};

export type WorkflowColor = {
  hex: string;
  glow: string;
  tint: string;
  gradient: string;
  darkTint: string;
};

export type WorkflowData = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  when: string;
  gradient: string;
  color: WorkflowColor;
  steps: StepData[];
  example: string;
  outputTools: string[];
};

/* ── Color constants ────────────────────────────────────── */

export const workflowColors: Record<string, WorkflowColor> = {
  indigo: {
    hex: "#6366f1",
    glow: "0 0 20px rgba(99,102,241,0.3)",
    tint: "rgba(99,102,241,0.03)",
    darkTint: "rgba(99,102,241,0.05)",
    gradient: "from-indigo-500 to-violet-500",
  },
  amber: {
    hex: "#f59e0b",
    glow: "0 0 20px rgba(245,158,11,0.3)",
    tint: "rgba(245,158,11,0.03)",
    darkTint: "rgba(245,158,11,0.05)",
    gradient: "from-amber-500 to-orange-500",
  },
  emerald: {
    hex: "#10b981",
    glow: "0 0 20px rgba(16,185,129,0.3)",
    tint: "rgba(16,185,129,0.03)",
    darkTint: "rgba(16,185,129,0.05)",
    gradient: "from-emerald-500 to-teal-500",
  },
};

/* ── Tool logo map ─────────────────────────────────────── */

export const toolLogos: Record<string, { src: string; bg: string }> = {
  Fireflies: {
    src: "/logos/fireflies.png",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
  NotebookLM: {
    src: "/logos/notebooklm.svg",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  Notion: {
    src: "/logos/notion.svg",
    bg: "bg-zinc-100 dark:bg-zinc-800",
  },
  "Claude Code": {
    src: "/logos/anthropic.svg",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  Claude: {
    src: "/logos/anthropic.svg",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  ChatGPT: {
    src: "/logos/chatgpt.svg",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  Figma: {
    src: "/logos/figma.svg",
    bg: "bg-violet-100 dark:bg-violet-900/40",
  },
  Supabase: {
    src: "/logos/supabase.svg",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  GitHub: {
    src: "/logos/github.svg",
    bg: "bg-zinc-100 dark:bg-zinc-800",
  },
  Vercel: {
    src: "/logos/vercel.svg",
    bg: "bg-zinc-100 dark:bg-zinc-800",
  },
  PostHog: {
    src: "/logos/posthog.svg",
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  "Next.js": {
    src: "/logos/nextjs.svg",
    bg: "bg-zinc-100 dark:bg-zinc-800",
  },
  "React Native": {
    src: "/logos/react.svg",
    bg: "bg-sky-100 dark:bg-sky-900/40",
  },
  TypeScript: {
    src: "/logos/typescript.svg",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
};

/* ── Workflow data ─────────────────────────────────────── */

export const workflows: WorkflowData[] = [
  {
    id: "client-consulting",
    number: "01",
    title: "Client Consulting",
    subtitle: "Discovery to Delivery",
    when: "For clients who know roughly what they want but need help articulating it clearly and building it right.",
    gradient: "from-indigo-500 to-violet-500",
    color: workflowColors.indigo,
    steps: [
      {
        title: "Discovery Call",
        description:
          "Recorded session with Fireflies note-taker. PM-focused questions: who are we building for, what pain points are we solving, what do they like and dislike, what does success look like.",
        tools: ["Fireflies"],
        x: 8,
        y: 12,
      },
      {
        title: "Client Homework",
        description:
          "Client identifies competitors they like/dislike and why, defines their goals, mission, and purpose. This surfaces the real priorities before any code gets written.",
        tools: [],
        x: 38,
        y: 6,
      },
      {
        title: "Build the Brain",
        description:
          "Compile everything into NotebookLM as the central knowledge repo. Set up Notion as the single source of truth — product docs, strategy, branding, design specs — connected to Claude Code via MCP.",
        tools: ["NotebookLM", "Notion"],
        x: 68,
        y: 14,
      },
      {
        title: "Collect Assets & Review",
        description:
          "Gather images, fonts, branding assets, and design files. Drop everything into the project folder. Read through all generated docs to align with the client's vision.",
        tools: ["Figma"],
        x: 62,
        y: 42,
      },
      {
        title: "Connect the Stack",
        description:
          "Wire up MCPs based on the project: Figma for design teams, Supabase for backend, GitHub + Vercel for deployment, PostHog for analytics.",
        tools: ["Supabase", "GitHub", "Vercel", "PostHog"],
        x: 28,
        y: 38,
      },
      {
        title: "Build",
        description:
          "Claude Code builds the full product against all the artifacts — docs, designs, assets, and live integrations. Notion tracks tasks in real time.",
        tools: ["Claude Code", "Notion"],
        x: 8,
        y: 68,
      },
    ],
    outputTools: ["Next.js", "React Native", "TypeScript", "Supabase", "Vercel"],
    example:
      "Swob — built 5 prototypes as investor demos and living specs for the founding team.",
  },
  {
    id: "solo-prototyping",
    number: "02",
    title: "Solo Rapid Prototyping",
    subtitle: "Idea to Full Stack Product",
    when: "For personal products where I'm the PM, designer, and developer. Speed of iteration is the priority.",
    gradient: "from-amber-500 to-orange-500",
    color: workflowColors.amber,
    steps: [
      {
        title: "Start with an Idea",
        description:
          "A problem I've experienced firsthand or spotted in a community. No formal discovery — the insight comes from living in the problem space.",
        tools: [],
        x: 42,
        y: 8,
      },
      {
        title: "Prototype Fast",
        description:
          "Build a front-end prototype directly in Claude or ChatGPT. Iterate on layout, flow, and feature scope until the best MVP surfaces.",
        tools: ["Claude", "ChatGPT"],
        x: 18,
        y: 30,
      },
      {
        title: "Write PRD & TRD",
        description:
          "Once the prototype is solid, write a Product Requirements Doc and Technical Requirements Doc. Both go into the project folder.",
        tools: ["Notion"],
        x: 58,
        y: 32,
      },
      {
        title: "Claude Code Builds It",
        description:
          "Claude Code reviews all artifacts — prototype, PRD, TRD, branding instructions — then builds the full stack product.",
        tools: ["Claude Code", "Notion"],
        x: 32,
        y: 58,
      },
      {
        title: "Connect & Ship",
        description:
          "Wire up Supabase for backend, GitHub + Vercel for deployment, PostHog for analytics. Same production-grade infrastructure as client work.",
        tools: ["Supabase", "GitHub", "Vercel", "PostHog"],
        x: 58,
        y: 68,
      },
    ],
    outputTools: ["Next.js", "React Native", "TypeScript", "Supabase", "Vercel"],
    example:
      "Pottery Friends — from studio observation to 150-member beta, built entirely with this workflow.",
  },
  {
    id: "internal-buy-in",
    number: "03",
    title: "Internal Buy-in",
    subtitle: "Interactive Prototypes for Stakeholders",
    when: "For getting executive and partner alignment. Not for customers — for internal decision-makers who need to see it to believe it.",
    gradient: "from-emerald-500 to-teal-500",
    color: workflowColors.emerald,
    steps: [
      {
        title: "Verbal Discussion",
        description:
          "Starts with a conversation — what does the team need, what's the vision, what would make this real?",
        tools: [],
        x: 12,
        y: 18,
      },
      {
        title: "Vibe Code It",
        description:
          "Pure vibe coding with Claude Code. Instead of PRDs or one-pagers, I build the interactive prototype directly from the conversation.",
        tools: ["Claude Code"],
        x: 52,
        y: 14,
      },
      {
        title: "Ship & Present",
        description:
          "Deploy to Vercel via GitHub so stakeholders can click through a live URL. An interactive prototype beats a slide deck every time.",
        tools: ["GitHub", "Vercel"],
        x: 62,
        y: 50,
      },
      {
        title: "Iterate on Feedback",
        description:
          "Take stakeholder feedback and update the prototype in real time. The speed of this loop is the whole point.",
        tools: ["Claude Code", "Vercel"],
        x: 18,
        y: 55,
      },
    ],
    outputTools: ["Next.js", "TypeScript", "Vercel"],
    example:
      "Frame Story — game studio prototypes and pitch materials built to secure funding and align the team.",
  },
];

/* ── Connection path helper ────────────────────────────── */

export function getConnectionPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  containerWidth: number,
  containerHeight: number,
): string {
  // Convert percentages to absolute pixels
  // Offset to center of node (~120px wide, ~80px tall approx)
  const nodeW = 140;
  const nodeH = 40;
  const x1 = (fromX / 100) * containerWidth + nodeW / 2;
  const y1 = (fromY / 100) * containerHeight + nodeH;
  const x2 = (toX / 100) * containerWidth + nodeW / 2;
  const y2 = (toY / 100) * containerHeight;

  // Cubic bezier with vertical bias
  const midY = (y1 + y2) / 2;
  const dx = Math.abs(x2 - x1);
  const cpOffset = Math.min(dx * 0.3, 80);

  return `M ${x1} ${y1} C ${x1 + cpOffset} ${midY}, ${x2 - cpOffset} ${midY}, ${x2} ${y2}`;
}

/* ── Get connections for a workflow ─────────────────────── */

export function getConnections(
  steps: StepData[],
): Array<{ from: number; to: number }> {
  return steps.slice(0, -1).map((_, i) => ({ from: i, to: i + 1 }));
}
