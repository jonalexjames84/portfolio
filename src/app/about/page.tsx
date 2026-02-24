import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "From Zynga to founding my own products — the story of a PM who learned that the best way to understand engineering tradeoffs is to make them yourself.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        About Me
      </h1>

      <div className="space-y-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
        <p>
          I started my career at Zynga in 2009, when social gaming was inventing
          itself in real time. I shipped features on FarmVille, built Mafia
          Wars&apos; first mobile raiding feature, and learned that great
          products come from obsessing over player behavior, not roadmap
          checkboxes.
        </p>

        <p>
          Over the next decade I carried that lesson through Jam City (scaling a
          game to 1M+ DAU and $50M in revenue), Bandai Namco (10M+ weekly
          installs on PAC-MAN), AAA (a mobile app reaching 6M members and saving
          $2M in call center costs), and Genies (first PM hire — launched a
          creator ecosystem that helped secure $150M in funding). At Mythical
          Games I led game services across multiple titles. At Treasure DAO I
          shipped a quest system, a marketplace, and a new blockchain that
          expanded the user base by 20%.
        </p>

        <p>
          Along the way I noticed a pattern: the best product decisions I made
          were the ones where I understood the engineering cost firsthand. Not
          from a sprint planning estimate — from actually knowing what it takes
          to build the thing. So I started building.
        </p>

        <p>
          I taught myself React Native, Next.js, Supabase, and the modern web
          stack. Then I built four complete product ecosystems from scratch — a
          community platform with a mobile app, stories, payments, and a
          gamification engine; a 5-product hiring platform; a cross-platform
          travel agency with referral tracking; and an AI-powered health
          dashboard that pulls from Strava, DEXA scans, and COROS devices. Not
          prototypes. Real products with real backends, real auth, real payments.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          How I Work
        </h2>

        <p>
          I&apos;ve led cross-functional teams of engineers, designers, data
          analysts, and marketers at companies ranging from 15-person startups to
          organizations with 60M+ members. I know how to write a PRD that
          engineers actually want to read, how to run a sprint without
          micromanaging, and how to say no to features that don&apos;t move the
          metric that matters.
        </p>

        <p>
          My builder background means I can unblock technical conversations
          faster than most PMs. I don&apos;t need to schedule a meeting to
          understand why a migration is risky or why an API design decision
          matters. I&apos;ve made those decisions myself, and that shared
          vocabulary earns trust with engineering teams quickly.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          What I&apos;m Looking For
        </h2>

        <p>
          I&apos;m targeting Senior PM roles at seed-to-Series B startups or
          growth-stage companies in SaaS, developer tools, AI/ML, or consumer
          platforms. I want to be close to the product — not three layers of
          process away from it. The right fit is a team that ships weekly, values
          technical depth in their PMs, and cares more about outcomes than
          outputs. I&apos;m based in the Bay Area and open to remote.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/work"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          See my work
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/experience"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
        >
          View experience
        </Link>
      </div>
    </div>
  );
}
