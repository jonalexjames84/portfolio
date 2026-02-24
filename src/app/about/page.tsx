import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "15 years shipping products at scale. Then I got laid off and built four myself. The story of a PM who proves product instincts by building the thing.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        About Me
      </h1>

      <div className="space-y-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
        <p className="text-lg text-zinc-700 dark:text-zinc-300">
          Most product managers talk about what their teams shipped. I can show
          you what <em>I</em> shipped — the products, the code, the databases,
          the user research. But the more interesting story is how I got here.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Where It Started
        </h2>

        <p>
          I walked into Zynga in 2009, the same month FarmVille crossed 10
          million players. Social gaming was inventing itself in real time, and I
          had no product experience and no idea what a DAU was. Within a year, I
          was shipping features on FarmVille, building Mafia Wars&apos; first
          mobile raiding system, and learning the lesson that would define the
          next fifteen years: great products come from obsessing over what
          players actually do, not what your roadmap says they should do.
        </p>

        <p>
          After four years I&apos;d contributed to some of the biggest titles in
          social gaming — but I was still a content manager. I wanted to{" "}
          <em>own</em> a product, not feed content into someone else&apos;s.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Learning to Own the Outcome
        </h2>

        <p>
          Jam City gave me that ownership. I launched a game and scaled it to
          1M+ DAU and $50M in revenue. The insight that stuck: 20%
          month-over-month revenue growth came from running currency
          optimizations weekly instead of quarterly. Speed of iteration beat any
          single brilliant idea. But after scaling one game, I wanted to know
          what product work looked like at franchise scale — the kind where every
          decision reaches millions of people.
        </p>

        <p>
          A short stint at SUPERLABS exploring VR and MMO gaming (later acquired
          by Zynga) led to a Director of Product role at Flow State Media, where
          I ran strategy for a suite of mobile games and drove eight straight
          months of revenue growth. Then Bandai Namco offered me the PAC-MAN
          franchise — 10M+ weekly installs, 1M+ MAU. I learned what acquisition
          looks like at massive volume and drove a 20% retention improvement. But
          a franchise role means optimizing someone else&apos;s vision. I wanted
          to build from scratch again.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Beyond Games
        </h2>

        <p>
          Big Fish Games deepened my analytics craft — I built a reporting
          pipeline from scratch and ran multivariate tests that improved
          engagement by 20% and session length by 50%. But I was starting to
          wonder: could my PM instincts transfer outside of gaming entirely?
        </p>

        <p>
          AAA answered that question. I shipped a mobile app to 6M members,
          saved $2M in annual call center costs, and presented strategy weekly to
          C-Suite leadership. The domain was different but the core muscle was
          the same — understand the user, ship fast, measure what matters. That
          experience widened my lens from entertainment to enterprise utility and
          proved the skills were portable.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Betting on Myself
        </h2>

        <p>
          When Genies hired me as their first PM, I knew the risk. A 15-person
          startup with no product infrastructure, celebrity partnerships to
          manage (Gucci, GIPHY), and everything to prove. I built their creator
          ecosystem from concept to launch, an e-commerce storefront doing $100K
          in weekly sales, and helped position the company to close $150M in
          funding. It was the closest I&apos;d come to founder energy — and it
          changed what I wanted next.
        </p>

        <p>
          Mythical Games and Treasure DAO took me deeper into blockchain gaming.
          At Mythical, I led game services across multiple titles, improving
          retention by 20% and revenue by 15%. At Treasure, I shipped a quest
          system, a marketplace, and a new blockchain on Arbitrum that expanded
          the user base by 20%. Then, in November 2024, I was laid off.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          The Last Year
        </h2>

        <p>
          I didn&apos;t jump back into the job market. I took a few months to
          decompress — lifting weights, overhauling my nutrition, fighting
          through anxiety and depression. And then I started building.
        </p>

        <p>
          I co-founded a game studio with a group of recently unemployed
          developers and designers. What started as a way to keep our skills
          sharp became something real — about six months in, I was converted to a
          full founder role. That taught me what zero-to-one actually feels like
          when there&apos;s no salary safety net. Around the same time, I started
          freelancing for my local pottery studio, building websites for artists
          who needed an online presence. My wife sells her fine art online — she
          grew to 100K followers and sells over $15K in art every year — and I
          used her playbook to help other artists do the same. That freelance
          work planted the seed for Pottery Friends.
        </p>

        <p>
          I started consulting for SWOB, helping them build an AI-enabled hiring
          platform for restaurant chains — real startup work with early-stage
          fundraising and investor demos. On my own time, I built two more
          products: a health dashboard that connects Strava, DEXA scans, and
          COROS devices into one intelligent view with AI-powered meal
          planning — born from my own fitness transformation — and Pottery
          Friends, a full platform ecosystem for pottery studio communities
          that I&apos;m testing with 150 members to incredible feedback.
        </p>

        <p>
          Four products. Fifteen repos. Fifty-nine database migrations.
          All of it conceived, designed, built, and shipped by one person
          who also happens to be a fifteen-year product manager.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          The Thread
        </h2>

        <p>
          Looking back, every move was deliberate — even when it didn&apos;t feel
          like it at the time. From contributor to owner. From one game to
          franchise scale. From games to enterprise. From employee to founding
          PM. From founding PM to actual founder. The common thread: the best
          product decisions come from understanding what it actually costs to
          build the thing. Not from a sprint planning estimate — from building
          it yourself. The last year has been the proof.
        </p>

        <h2 className="pt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          How I Work
        </h2>

        <p>
          I&apos;ve led cross-functional teams at companies ranging from
          15-person startups to organizations with 60M+ members. I write PRDs
          that engineers actually want to read, run sprints without
          micromanaging, and say no to features that don&apos;t move the metric
          that matters. My builder background means I can unblock technical
          conversations faster than most PMs — I don&apos;t need a meeting to
          understand why a migration is risky or an API design decision matters.
          That shared vocabulary earns trust with engineering teams quickly.
        </p>

        <p>
          I prioritize by asking one question:{" "}
          <em>what&apos;s the fastest path to learning something we don&apos;t
          know?</em> Discovery and delivery aren&apos;t separate phases —
          they&apos;re parallel tracks. I define product success by behavior
          change, not feature completion. A shipped feature nobody uses is worse
          than one that was cut because the data said no.
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
