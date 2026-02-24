import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm Jonny Martin — a product manager who builds. From founding products to shipping code, I bring ideas to life across web and mobile.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        About Me
      </h1>

      <div className="space-y-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
        <p>
          I&apos;m Jonny Martin — a product manager who builds. While most PMs
          communicate through slide decks and specs, I communicate through
          shipped products. I&apos;ve founded, designed, built, and shipped
          multiple products across web and mobile, from concept to deployed
          application.
        </p>

        <p>
          My background as a founder means I think about products holistically —
          not just features and user stories, but business models, go-to-market,
          analytics, and the technical architecture that makes it all work. When
          I say I understand engineering tradeoffs, it&apos;s because I&apos;ve
          made them myself.
        </p>

        <p>
          I work primarily with modern tooling: React, Next.js, React Native,
          Supabase, Stripe, and TailwindCSS. I&apos;m fluent in TypeScript and
          comfortable across the full stack. But more importantly, I know when
          to build and when to use an off-the-shelf solution — a critical PM
          skill that only comes from actually shipping.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          How I Work
        </h2>

        <p>
          I believe the best products come from tight feedback loops. I sketch
          ideas, prototype fast, get them in front of users, and iterate. I
          don&apos;t wait for perfect specs — I ship an MVP and learn from real
          usage.
        </p>

        <p>
          As a PM, I bring this builder mindset to every team. I can speak
          engineering&apos;s language because it&apos;s my language too. I can
          unblock conversations about feasibility because I&apos;ve built
          similar things. And I can make better prioritization decisions because
          I understand the real cost of complexity.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          What I&apos;m Looking For
        </h2>

        <p>
          I&apos;m looking for a product management role where my ability to
          build is seen as a superpower, not an oddity. Ideally at a company
          where product and engineering work closely together, where shipping
          fast matters, and where there&apos;s real ownership over outcomes.
        </p>
      </div>

      <div className="mt-12">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          See my work
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
