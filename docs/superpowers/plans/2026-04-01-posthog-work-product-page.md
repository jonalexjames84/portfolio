# PostHog Work Product Interactive Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone interactive page at `/posthog` that presents Jon's product analysis for PostHog's CEO, with animated funnel visualization and expandable recommendation cards.

**Architecture:** Single Next.js page route with 8 client components. Framer Motion for scroll animations and card interactions. SVG + CSS for the funnel diagram. All content hardcoded — no API calls or data fetching. Standalone layout (no site nav/footer).

**Tech Stack:** Next.js App Router, Tailwind CSS, Framer Motion (already installed), Lucide icons (already installed), SVG

---

## File Structure

```
src/app/posthog/
  layout.tsx              — standalone layout (no Nav/Footer), PostHog blue accent line
  page.tsx                — metadata + page assembly
  components/
    PostHogHeader.tsx      — minimal "Jon Martin — Product Analysis" header
    Hero.tsx               — headline, subtitle, author/date
    ExecSummary.tsx        — callout box with summary text
    CredibilityCard.tsx    — "Why Listen to Me" with 3 stat badges
    ActivationFunnel.tsx   — animated SVG funnel with 4 stages and 3 drop-off labels
    WallCard.tsx           — wall detail card (number, title, description, quote)
    RecommendationCard.tsx — expandable card with visual element per recommendation
    ClosingCTA.tsx         — closing paragraph with subtle contact link
```

---

### Task 1: Standalone Layout

**Files:**
- Create: `src/app/posthog/layout.tsx`

This layout wraps only `/posthog` and excludes the main site's Nav, Footer, and FloatingCTA. It keeps the ThemeProvider and fonts from the root layout.

- [ ] **Step 1: Create the layout file**

```tsx
// src/app/posthog/layout.tsx
import type { ReactNode } from "react";

export default function PostHogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* PostHog blue accent line */}
      <div className="h-1 w-full bg-[#2563eb]" />
      <main className="min-h-screen bg-white dark:bg-[#0a0f12]">
        {children}
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify the root layout still applies fonts and ThemeProvider**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds, `/posthog` route appears in output.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/layout.tsx
git commit -m "feat: add standalone layout for /posthog page"
```

---

### Task 2: Page Metadata & Assembly

**Files:**
- Create: `src/app/posthog/page.tsx`

Server component that exports OG metadata and assembles all section components.

- [ ] **Step 1: Create the page file**

```tsx
// src/app/posthog/page.tsx
import type { Metadata } from "next";
import { PostHogHeader } from "./components/PostHogHeader";
import { Hero } from "./components/Hero";
import { ExecSummary } from "./components/ExecSummary";
import { CredibilityCard } from "./components/CredibilityCard";
import { ActivationFunnel } from "./components/ActivationFunnel";
import { WallCard } from "./components/WallCard";
import { RecommendationCard } from "./components/RecommendationCard";
import { ClosingCTA } from "./components/ClosingCTA";

export const metadata: Metadata = {
  title: "PostHog Onboarding for Solo Builders — Product Analysis",
  description:
    "3 activation walls costing PostHog a fast-growing segment, and 3 ways to fix them. By Jon Martin.",
  openGraph: {
    title: "PostHog Onboarding for Solo Builders — Product Analysis",
    description:
      "3 activation walls costing PostHog a fast-growing segment, and 3 ways to fix them. By Jon Martin.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostHog Onboarding for Solo Builders — Product Analysis",
    description:
      "3 activation walls costing PostHog a fast-growing segment, and 3 ways to fix them. By Jon Martin.",
  },
};

export default function PostHogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <PostHogHeader />
      <Hero />
      <ExecSummary />
      <CredibilityCard />
      <ActivationFunnel />
      <section className="mb-16 space-y-6">
        <h2 className="font-[family-name:var(--heading-font)] text-2xl text-zinc-900 dark:text-zinc-100">
          The 3 Activation Walls
        </h2>
        <WallCard
          number={1}
          title="Event Design Paralysis"
          description="PostHog's event system is powerful and flexible — which is the problem. A solo builder staring at 'Create Custom Event' doesn't need flexibility. They need a starting point."
          quote="Event and action manipulation/creation is unclear and longwinded to achieve."
          quoteSource="GitHub Issue #901"
        />
        <WallCard
          number={2}
          title="Dashboard Cold Start"
          description="After installing the SDK and verifying events fire, the next step is unclear. PostHog drops you into an empty project with a sidebar full of products."
          quote="PostHog's interface can feel overwhelming, demanding more time and technical skill for setup and reporting."
          quoteSource="Userpilot, 2026"
        />
        <WallCard
          number={3}
          title="Feature Discovery Lag"
          description="Each PostHog product solves a real problem for solo builders, but there's no guided path from 'I installed analytics' to 'I'm running my entire product stack here.'"
          quote="The free tier is genuinely generous... but the main downside is the learning curve."
          quoteSource="G2 Review"
        />
      </section>
      <section className="mb-16">
        <h2 className="mb-6 font-[family-name:var(--heading-font)] text-2xl text-zinc-900 dark:text-zinc-100">
          3 Ways to Fix It
        </h2>
        <div className="space-y-4">
          <RecommendationCard
            number={1}
            title="Solo Builder Onboarding Template"
            summary="At SDK install, ask: 'Are you building alone or with a team?' If solo, auto-generate a starter event schema and pre-build three dashboards."
            detail="Detect the framework (React, Next.js, React Native) and generate an event schema matched to it. Pre-build three dashboards: Activation Funnel, Retention Cohort, and Feature Usage. This is similar to what worked at Big Fish Games — the team couldn't use Tableau until default views existed. Give people something to react to, not a blank canvas."
            visual="dashboard"
          />
          <RecommendationCard
            number={2}
            title="Progressive Feature Unlocking"
            summary="Instead of showing all products on day one, introduce them based on usage milestones."
            detail="After 1,000 events captured, surface Session Replay: 'See what your users actually do.' After first funnel created, surface Feature Flags: 'Test changes before shipping to everyone.' After 7 days of data, surface Experiments: 'Now you have enough data to run your first A/B test.' This maps PostHog's product suite to the solo builder's natural workflow progression."
            visual="timeline"
          />
          <RecommendationCard
            number={3}
            title="Max AI as Solo Builder Co-Analyst"
            summary="Position Max as the data analyst a solo builder doesn't have."
            detail="PostHog's AI blog reveals that PMs and marketers use Max more than product engineers. Solo builders are a similar persona — they need analysis help, not engineering help. Example prompts: 'What's my D7 retention this week?' or 'Why did signups drop on Tuesday?' This plays directly into PostHog's vision that 'with enough data, your product should be able to build itself.'"
            visual="prompts"
          />
        </div>
      </section>
      <ClosingCTA />
    </div>
  );
}
```

- [ ] **Step 2: Create placeholder components so the page compiles**

Create each component file with a minimal placeholder:

```tsx
// For each of: PostHogHeader, Hero, ExecSummary, CredibilityCard, ActivationFunnel, WallCard, RecommendationCard, ClosingCTA
// Example placeholder (repeat for each):
export function PostHogHeader() {
  return <div>PostHogHeader placeholder</div>;
}
```

Files to create with placeholders:
- `src/app/posthog/components/PostHogHeader.tsx`
- `src/app/posthog/components/Hero.tsx`
- `src/app/posthog/components/ExecSummary.tsx`
- `src/app/posthog/components/CredibilityCard.tsx`
- `src/app/posthog/components/ActivationFunnel.tsx`
- `src/app/posthog/components/WallCard.tsx`
- `src/app/posthog/components/RecommendationCard.tsx`
- `src/app/posthog/components/ClosingCTA.tsx`

- [ ] **Step 3: Verify build**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds, `/posthog` appears in routes.

- [ ] **Step 4: Commit**

```bash
git add src/app/posthog/
git commit -m "feat: add /posthog page scaffold with placeholder components"
```

---

### Task 3: PostHogHeader Component

**Files:**
- Modify: `src/app/posthog/components/PostHogHeader.tsx`

- [ ] **Step 1: Implement the header**

```tsx
// src/app/posthog/components/PostHogHeader.tsx
import Link from "next/link";

export function PostHogHeader() {
  return (
    <header className="mb-12 flex items-center justify-between">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Jon Martin — Product Analysis
      </span>
      <Link
        href="https://portfolio.jonnymartin.blog"
        className="text-sm text-zinc-400 transition-colors hover:text-[#2563eb] dark:text-zinc-500 dark:hover:text-[#2563eb]"
      >
        portfolio.jonnymartin.blog
      </Link>
    </header>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npm run dev`
Visit: `http://localhost:3000/posthog`
Expected: Minimal header with name left, portfolio link right. Blue accent line at top from layout.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/PostHogHeader.tsx
git commit -m "feat: implement PostHog page header"
```

---

### Task 4: Hero Component

**Files:**
- Modify: `src/app/posthog/components/Hero.tsx`

- [ ] **Step 1: Implement the hero**

```tsx
// src/app/posthog/components/Hero.tsx
"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <motion.section
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="mb-3 font-[family-name:var(--heading-font)] text-4xl leading-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
        PostHog Onboarding for Solo Builders
      </h1>
      <p className="mb-4 text-xl text-zinc-500 dark:text-zinc-400">
        The Missing Activation Path
      </p>
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        April 2026 — Jon Martin
      </p>
    </motion.section>
  );
}
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Large serif headline, subtitle, date/author. Fades in on load.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/Hero.tsx
git commit -m "feat: implement PostHog page hero section"
```

---

### Task 5: ExecSummary Component

**Files:**
- Modify: `src/app/posthog/components/ExecSummary.tsx`

- [ ] **Step 1: Implement the summary callout**

```tsx
// src/app/posthog/components/ExecSummary.tsx
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
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Blue left-bordered callout with summary text. Animates in on scroll.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/ExecSummary.tsx
git commit -m "feat: implement PostHog page executive summary"
```

---

### Task 6: CredibilityCard Component

**Files:**
- Modify: `src/app/posthog/components/CredibilityCard.tsx`

- [ ] **Step 1: Implement the credibility section**

```tsx
// src/app/posthog/components/CredibilityCard.tsx
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
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Card with name, tagline, three stat badges in a row. Blue numbers.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/CredibilityCard.tsx
git commit -m "feat: implement PostHog page credibility card"
```

---

### Task 7: ActivationFunnel Component

**Files:**
- Modify: `src/app/posthog/components/ActivationFunnel.tsx`

This is the key interactive element — a horizontal SVG funnel that animates on scroll.

- [ ] **Step 1: Implement the animated funnel**

```tsx
// src/app/posthog/components/ActivationFunnel.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  { label: "SDK Installed", width: 100 },
  { label: "Events Designed", width: 70 },
  { label: "Dashboards Built", width: 40 },
  { label: "Full Platform Adopted", width: 20 },
];

const walls = [
  "Most solo builders stall here",
  "Without defaults, many give up",
  "Features stay undiscovered",
];

export function ActivationFunnel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="mb-8">
      <div className="overflow-x-auto pb-4">
        <div className="flex items-end gap-1 min-w-[500px]">
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex items-end gap-1">
              <div className="flex flex-col items-center">
                <motion.div
                  className="rounded-t-lg bg-[#2563eb]"
                  style={{ width: `${stage.width * 1.2}px` }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? { height: stage.width * 1.5, opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                />
                <p className="mt-2 max-w-[120px] text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {stage.label}
                </p>
              </div>
              {i < stages.length - 1 && (
                <motion.div
                  className="mb-8 flex flex-col items-center px-2"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.4 }}
                >
                  <div className="h-px w-8 bg-red-400" />
                  <p className="mt-1 max-w-[100px] text-center text-[10px] font-medium text-red-500">
                    {walls[i]}
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Horizontal bar chart / funnel that animates bars growing from bottom when scrolled into view. Red drop-off labels between stages. Scrollable on mobile.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/ActivationFunnel.tsx
git commit -m "feat: implement animated activation funnel visualization"
```

---

### Task 8: WallCard Component

**Files:**
- Modify: `src/app/posthog/components/WallCard.tsx`

- [ ] **Step 1: Implement the wall card**

```tsx
// src/app/posthog/components/WallCard.tsx
"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

export function WallCard({
  number,
  title,
  description,
  quote,
  quoteSource,
}: {
  number: number;
  title: string;
  description: string;
  quote: string;
  quoteSource: string;
}) {
  return (
    <AnimatedSection as="div" delay={number * 0.1}>
      <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {number}
          </span>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <blockquote className="border-l-2 border-zinc-300 pl-3 dark:border-zinc-700">
          <p className="text-sm italic text-zinc-500 dark:text-zinc-500">
            &ldquo;{quote}&rdquo;
          </p>
          <cite className="mt-1 block text-xs text-zinc-400">
            — {quoteSource}
          </cite>
        </blockquote>
      </div>
    </AnimatedSection>
  );
}
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Three wall cards with red number badges, description text, and indented blockquotes. Staggered animation on scroll.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/WallCard.tsx
git commit -m "feat: implement activation wall detail cards"
```

---

### Task 9: RecommendationCard Component

**Files:**
- Modify: `src/app/posthog/components/RecommendationCard.tsx`

This is the most interactive component — cards expand on click with visual elements.

- [ ] **Step 1: Implement the expandable recommendation card**

```tsx
// src/app/posthog/components/RecommendationCard.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
        onClick={() => setOpen(!open)}
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
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Three recommendation cards. Click each to expand. Card 1 shows mini dashboard grid. Card 2 shows milestone timeline. Card 3 shows prompt bubbles. Active card has blue border/background.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/RecommendationCard.tsx
git commit -m "feat: implement expandable recommendation cards with visuals"
```

---

### Task 10: ClosingCTA Component

**Files:**
- Modify: `src/app/posthog/components/ClosingCTA.tsx`

- [ ] **Step 1: Implement the closing**

```tsx
// src/app/posthog/components/ClosingCTA.tsx
"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

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
          >
            Connect on LinkedIn
          </a>
          <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
          <a
            href="mailto:jonalexjames@gmail.com"
            className="text-sm font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
          >
            jonalexjames@gmail.com
          </a>
        </p>
      </div>
    </AnimatedSection>
  );
}
```

- [ ] **Step 2: Verify visually**

Visit: `http://localhost:3000/posthog`
Expected: Subtle closing with centered text, LinkedIn and email links in PostHog blue.

- [ ] **Step 3: Commit**

```bash
git add src/app/posthog/components/ClosingCTA.tsx
git commit -m "feat: implement PostHog page closing CTA"
```

---

### Task 11: Final Visual QA & Polish

**Files:**
- Potentially modify any component for visual polish

- [ ] **Step 1: Full page review on desktop**

Run: `npm run dev`
Visit: `http://localhost:3000/posthog`
Check: All sections render, animations trigger on scroll, recommendation cards expand/collapse, funnel animates, dark mode works (toggle via site theme).

- [ ] **Step 2: Mobile responsive check**

Open Chrome DevTools, toggle device toolbar, check at 375px (iPhone) and 768px (iPad).
Check: Funnel scrolls horizontally, cards stack, text is readable, nothing overflows.

- [ ] **Step 3: Fix any visual issues found**

Address spacing, font sizes, or responsive breakpoint issues.

- [ ] **Step 4: Production build test**

Run: `cd "/Users/jonathanmartin/Desktop/Claude Projects/portfolio" && npx next build --no-lint 2>&1 | tail -20`
Expected: Build succeeds with no errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "polish: final QA and responsive fixes for /posthog page"
```
