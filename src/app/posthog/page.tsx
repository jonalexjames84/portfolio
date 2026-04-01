import type { Metadata } from "next";
import { PostHogHeader } from "./components/PostHogHeader";
import { Hero } from "./components/Hero";
import { ExecSummary } from "./components/ExecSummary";
import { CredibilityCard } from "./components/CredibilityCard";
import { ActivationFunnel } from "./components/ActivationFunnel";
import { WallCard } from "./components/WallCard";
import { RecommendationCard } from "./components/RecommendationCard";
import { ClosingCTA } from "./components/ClosingCTA";
import { ScrollDepthTracker } from "./components/ScrollDepthTracker";

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
      <ScrollDepthTracker />
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
