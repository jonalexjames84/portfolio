import type { Metadata } from "next";
import {
  Headphones,
  Brain,
  FolderOpen,
  Plug,
  Rocket,
  Zap,
  Repeat,
  FileText,
  Code,
  Presentation,
  MessageSquare,
  ArrowDown,
  Users,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
  title: "AI Workflow",
  description:
    "How I build products using AI-native workflows. Three approaches for client consulting, solo rapid prototyping, and internal stakeholder buy-in.",
};

type Step = {
  icon: typeof Headphones;
  title: string;
  description: string;
};

type Workflow = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  when: string;
  gradient: string;
  accentBorder: string;
  steps: Step[];
  tools: string[];
  example: string;
};

const workflows: Workflow[] = [
  {
    id: "client-consulting",
    number: "01",
    title: "Client Consulting",
    subtitle: "Discovery to Delivery",
    when: "For clients who know roughly what they want but need help articulating it clearly and building it right.",
    gradient: "from-indigo-500 to-violet-500",
    accentBorder: "border-indigo-500",
    steps: [
      {
        icon: Headphones,
        title: "Discovery Call",
        description:
          "Recorded session with Fireflies note-taker. PM-focused questions: who are we building for, what pain points are we solving, what do they like and dislike, what does success look like.",
      },
      {
        icon: Users,
        title: "Client Homework",
        description:
          "Client identifies competitors they like/dislike and why, defines their goals, mission, and purpose. This surfaces the real priorities before any code gets written.",
      },
      {
        icon: Brain,
        title: "Build the Brain",
        description:
          "Compile everything into NotebookLM as the central knowledge repo. Set up Notion as the single source of truth — product docs, strategy, branding, design specs — connected to Claude Code via MCP.",
      },
      {
        icon: FolderOpen,
        title: "Collect Assets",
        description:
          "Gather images, fonts, branding assets, and any design files from the client. Drop everything into the project folder that Claude Code reads from directly.",
      },
      {
        icon: FileText,
        title: "Review & Align",
        description:
          "Read through all generated docs to make sure everything aligns with the client's vision. This checkpoint usually takes a few days. Nothing gets built until the foundation is solid.",
      },
      {
        icon: Plug,
        title: "Connect the Stack",
        description:
          "Wire up MCPs based on the project: Figma for design teams, Supabase for backend, GitHub + Vercel for deployment, PostHog for analytics. Each project gets exactly the integrations it needs.",
      },
      {
        icon: Rocket,
        title: "Build",
        description:
          "Claude Code builds the full product against all the artifacts — docs, designs, assets, and live integrations. Notion tracks tasks in real time so I can watch agents run, see what they're working on, and catch issues as they happen. Mostly JavaScript frameworks (Next.js, React Native, TypeScript) end to end.",
      },
    ],
    tools: [
      "Fireflies",
      "NotebookLM",
      "Notion",
      "Claude Code",
      "Figma",
      "Supabase",
      "GitHub",
      "Vercel",
      "PostHog",
    ],
    example: "Swob — built 5 prototypes as investor demos and living specs for the founding team.",
  },
  {
    id: "solo-prototyping",
    number: "02",
    title: "Solo Rapid Prototyping",
    subtitle: "Idea to Full Stack Product",
    when: "For personal products where I'm the PM, designer, and developer. Speed of iteration is the priority.",
    gradient: "from-amber-500 to-orange-500",
    accentBorder: "border-amber-500",
    steps: [
      {
        icon: Lightbulb,
        title: "Start with an Idea",
        description:
          "A problem I've experienced firsthand or spotted in a community. No formal discovery — the insight comes from living in the problem space.",
      },
      {
        icon: Zap,
        title: "Prototype in Claude or ChatGPT",
        description:
          "Build a front-end prototype directly in Claude or ChatGPT. Iterate on layout, flow, and feature scope until the best MVP surfaces. This is fast — many cycles in a single day.",
      },
      {
        icon: Repeat,
        title: "Iterate Until It Clicks",
        description:
          "Rapid iteration on the prototype. Kill features, rearrange flows, test different approaches. The goal is to find the shape of the product before writing production code.",
      },
      {
        icon: FileText,
        title: "Write the PRD & TRD",
        description:
          "Once the prototype is solid, write a Product Requirements Doc and Technical Requirements Doc. Both go into the project folder alongside the prototype files.",
      },
      {
        icon: Code,
        title: "Claude Code Builds It",
        description:
          "Claude Code reviews all artifacts — prototype, PRD, TRD, branding instructions, and any special requirements — then builds the full stack product against those specs. Notion tracks tasks so I can monitor agent progress and resolve issues in real time.",
      },
      {
        icon: Plug,
        title: "Connect & Ship",
        description:
          "Wire up Supabase for backend, GitHub + Vercel for deployment, PostHog for analytics. Same production-grade infrastructure as client work, just faster to decision.",
      },
    ],
    tools: [
      "Claude",
      "ChatGPT",
      "Claude Code",
      "Notion",
      "Supabase",
      "GitHub",
      "Vercel",
      "PostHog",
    ],
    example: "Pottery Friends — from studio observation to 150-member beta, built entirely with this workflow.",
  },
  {
    id: "internal-buy-in",
    number: "03",
    title: "Internal Buy-in",
    subtitle: "Interactive Prototypes for Stakeholders",
    when: "For getting executive and partner alignment. Not for customers — for internal decision-makers who need to see it to believe it.",
    gradient: "from-emerald-500 to-teal-500",
    accentBorder: "border-emerald-500",
    steps: [
      {
        icon: MessageSquare,
        title: "Verbal Discussion",
        description:
          "Starts with a conversation — what does the team need, what's the vision, what would make this real? No formal docs. The input is a shared understanding of the goal.",
      },
      {
        icon: Zap,
        title: "Vibe Code It",
        description:
          "Pure vibe coding with Claude Code. Instead of PRDs or one-pagers, I build the interactive prototype directly from the conversation. The prototype is the spec.",
      },
      {
        icon: Presentation,
        title: "Ship & Present",
        description:
          "Deploy to Vercel via GitHub so stakeholders can click through a live URL. An interactive prototype beats a slide deck every time for getting buy-in.",
      },
      {
        icon: BarChart3,
        title: "Iterate on Feedback",
        description:
          "Take stakeholder feedback and update the prototype in real time. The speed of this loop is the whole point — show, don't tell, and close the gap between vision and reality fast.",
      },
    ],
    tools: ["Claude Code", "GitHub", "Vercel"],
    example: "Frame Story — game studio prototypes and pitch materials built to secure funding and align the team.",
  },
];

function StepConnector() {
  return (
    <div className="flex justify-center py-1">
      <ArrowDown className="h-4 w-4 text-zinc-300 dark:text-zinc-700" />
    </div>
  );
}

function ToolBadge({ name }: { name: string }) {
  return (
    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {name}
    </span>
  );
}

function WorkflowSection({ workflow, index }: { workflow: Workflow; index: number }) {
  return (
    <AnimatedSection className="mb-20" delay={index * 0.05}>
      {/* Section header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${workflow.gradient} text-sm font-bold text-white shadow-md`}
          >
            {workflow.number}
          </span>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {workflow.title}
            </h2>
            <p className={`text-sm font-medium bg-gradient-to-r ${workflow.gradient} bg-clip-text text-transparent`}>
              {workflow.subtitle}
            </p>
          </div>
        </div>
        <p className="ml-[52px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {workflow.when}
        </p>
      </div>

      {/* Steps */}
      <div className="ml-[52px]">
        <div className="space-y-0">
          {workflow.steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title}>
                {i > 0 && <StepConnector />}
                <div
                  className={`group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${workflow.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                  />
                  <div className="flex gap-4">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${workflow.gradient} shadow-sm`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tools */}
        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Tools
          </p>
          <div className="flex flex-wrap gap-2">
            {workflow.tools.map((tool) => (
              <ToolBadge key={tool} name={tool} />
            ))}
          </div>
        </div>

        {/* Example */}
        <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/20">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className={`font-semibold bg-gradient-to-r ${workflow.gradient} bg-clip-text text-transparent`}>
              Example:
            </span>{" "}
            {workflow.example}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function WorkflowPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero */}
      <AnimatedSection className="mb-14">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-6 sm:p-8 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
          <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl dark:bg-violet-600/10" />
          <div className="relative">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              How I Build with AI
            </h1>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Three workflows for three contexts. The tools change depending on who I&apos;m building for and what the goal is, but the principle is the same: AI handles the execution, I handle the judgment.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {workflows.map((w) => (
                <a
                  key={w.id}
                  href={`#${w.id}`}
                  className={`inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md dark:bg-zinc-800/80 dark:text-zinc-300 dark:ring-zinc-700`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${w.gradient} text-[10px] font-bold text-white`}
                  >
                    {w.number}
                  </span>
                  {w.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Workflows */}
      {workflows.map((workflow, i) => (
        <div key={workflow.id} id={workflow.id}>
          <WorkflowSection workflow={workflow} index={i} />
        </div>
      ))}

      {/* Footer note */}
      <AnimatedSection>
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
