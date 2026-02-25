import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gamepad2, Trophy, Globe, Rocket, Wrench, Heart, Target, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "15 years shipping products at scale. Then I got laid off and built four myself. The story of a PM who proves product instincts by building the thing.",
};

const sections = [
  {
    icon: Gamepad2,
    title: "Where It Started",
    gradient: "from-indigo-500 to-violet-500",
    content: [
      "I walked into Zynga in 2009, the same month FarmVille crossed 10 million players. Social gaming was inventing itself in real time, and I had no product experience and no idea what a DAU was. Within a year, I was shipping features on FarmVille, building Mafia Wars' first mobile raiding system, and learning the lesson that would define the next fifteen years: great products come from obsessing over what players actually do, not what your roadmap says they should do.",
      "After four years I'd contributed to some of the biggest titles in social gaming — but I was still a content manager. I wanted to own a product, not feed content into someone else's.",
    ],
  },
  {
    icon: Trophy,
    title: "Learning to Own the Outcome",
    gradient: "from-violet-500 to-purple-500",
    content: [
      "Jam City gave me that ownership. I launched a game and scaled it to 1M+ DAU and $50M in revenue. The insight that stuck: 20% month-over-month revenue growth came from running currency optimizations weekly instead of quarterly. Speed of iteration beat any single brilliant idea. But after scaling one game, I wanted to know what product work looked like at franchise scale — the kind where every decision reaches millions of people.",
      "A short stint at SUPERLABS exploring VR and MMO gaming (later acquired by Zynga) led to a Director of Product role at Flow State Media, where I ran strategy for a suite of mobile games and drove eight straight months of revenue growth. Then Bandai Namco offered me the PAC-MAN franchise — 10M+ weekly installs, 1M+ MAU. I learned what acquisition looks like at massive volume and drove a 20% retention improvement. But a franchise role means optimizing someone else's vision. I wanted to build from scratch again.",
    ],
  },
  {
    icon: Globe,
    title: "Beyond Games",
    gradient: "from-amber-500 to-orange-500",
    content: [
      "Big Fish Games deepened my analytics craft — I built a reporting pipeline from scratch and ran multivariate tests that improved engagement by 20% and session length by 50%. But I was starting to wonder: could my PM instincts transfer outside of gaming entirely?",
      "AAA answered that question. I shipped a mobile app to 6M members, saved $2M in annual call center costs, and presented strategy weekly to C-Suite leadership. The domain was different but the core muscle was the same — understand the user, ship fast, measure what matters. That experience widened my lens from entertainment to enterprise utility and proved the skills were portable.",
    ],
  },
  {
    icon: Rocket,
    title: "Betting on Myself",
    gradient: "from-rose-500 to-pink-500",
    content: [
      "When Genies hired me as their first PM, I knew the risk. A 15-person startup with no product infrastructure, celebrity partnerships to manage (Gucci, GIPHY), and everything to prove. I built their creator ecosystem from concept to launch, an e-commerce storefront doing $100K in weekly sales, and helped position the company to close $150M in funding. It was the closest I'd come to founder energy — and it changed what I wanted next.",
      "Mythical Games and Treasure DAO took me deeper into blockchain gaming. At Mythical, I led game services across multiple titles, improving retention by 20% and revenue by 15%. At Treasure, I shipped a quest system, a marketplace, and a new blockchain on Arbitrum that expanded the user base by 20%. Then, in November 2024, I was laid off.",
    ],
  },
  {
    icon: Wrench,
    title: "The Last Year",
    gradient: "from-emerald-500 to-teal-500",
    content: [
      "I didn't jump back into the job market. I took a few months to decompress — lifting weights, overhauling my nutrition, fighting through anxiety and depression. And then I started building.",
      "I co-founded a game studio with a group of recently unemployed developers and designers. What started as a way to keep our skills sharp became something real — about six months in, I was converted to a full founder role. That taught me what zero-to-one actually feels like when there's no salary safety net. Around the same time, I started freelancing for my local pottery studio, building websites for artists who needed an online presence. My wife sells her fine art online — she grew to 100K followers and sells over $15K in art every year — and I used her playbook to help other artists do the same. That freelance work planted the seed for Pottery Friends.",
      "I started consulting for Swob, helping them build a swipe-to-hire job matching platform for hourly workers — real startup work with early-stage fundraising and investor demos. On my own time, I built two more products: Macro Chef, which connects Strava, DEXA scans, and COROS devices into one intelligent view with AI-powered meal planning — born from my own fitness transformation — and Pottery Friends, a full platform ecosystem for pottery studio communities that I'm testing with 150 members to incredible feedback.",
      "Four products. Fifteen repos. Fifty-nine database migrations. All of it conceived, designed, built, and shipped by one person who also happens to be a fifteen-year product manager.",
    ],
  },
  {
    icon: Sparkles,
    title: "The Thread",
    gradient: "from-sky-500 to-cyan-500",
    content: [
      "Looking back, every move was deliberate — even when it didn't feel like it at the time. From contributor to owner. From one game to franchise scale. From games to enterprise. From employee to founding PM. From founding PM to actual founder. The common thread: the best product decisions come from understanding what it actually costs to build the thing. Not from a sprint planning estimate — from building it yourself. The last year has been the proof.",
    ],
  },
  {
    icon: Heart,
    title: "How I Work",
    gradient: "from-fuchsia-500 to-pink-500",
    content: [
      "I've led cross-functional teams at companies ranging from 15-person startups to organizations with 60M+ members. I write PRDs that engineers actually want to read, run sprints without micromanaging, and say no to features that don't move the metric that matters. My builder background means I can unblock technical conversations faster than most PMs — I don't need a meeting to understand why a migration is risky or an API design decision matters. That shared vocabulary earns trust with engineering teams quickly.",
      "I prioritize by asking one question: what's the fastest path to learning something we don't know? Discovery and delivery aren't separate phases — they're parallel tracks. I define product success by behavior change, not feature completion. A shipped feature nobody uses is worse than one that was cut because the data said no.",
    ],
  },
  {
    icon: Target,
    title: "What I'm Looking For",
    gradient: "from-indigo-500 to-blue-500",
    content: [
      "I'm targeting Senior PM roles at seed-to-Series B startups or growth-stage companies in SaaS, developer tools, AI/ML, or consumer platforms. I want to be close to the product — not three layers of process away from it. The right fit is a team that ships weekly, values technical depth in their PMs, and cares more about outcomes than outputs. I'm based in the Bay Area and open to remote.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Hero area */}
      <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-8 sm:p-12 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/10" />
        <div className="relative flex flex-col items-center gap-8 sm:flex-row">
          <div className="shrink-0">
            <Image
              src="/jonny-headshot.jpg"
              alt="Jon Martin"
              width={160}
              height={160}
              className="h-32 w-32 rounded-2xl object-cover shadow-lg ring-4 ring-white/80 sm:h-40 sm:w-40 dark:ring-zinc-800/80"
              priority
            />
          </div>
          <div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              About Me
            </h1>
            <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
              Most product managers talk about what their teams shipped. I can show
              you what <em className="text-indigo-600 not-italic font-medium dark:text-indigo-400">I</em> shipped — the products, the code, the databases,
              the user research. But the more interesting story is how I got here.
            </p>
          </div>
        </div>
      </div>

      {/* Career at a glance */}
      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { value: "2009", label: "First day at Zynga", gradient: "from-indigo-500 to-violet-500" },
          { value: "10+", label: "Companies shipped at", gradient: "from-violet-500 to-purple-500" },
          { value: "$50M", label: "Product revenue (Jam City)", gradient: "from-amber-500 to-orange-500" },
          { value: "4", label: "Products built solo", gradient: "from-emerald-500 to-teal-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className={`text-2xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Story sections with visual timeline */}
      <div className="relative">
        {/* Vertical gradient line connecting sections */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-300 via-violet-300 via-50% to-emerald-300 opacity-30 dark:from-indigo-700 dark:via-violet-700 dark:to-emerald-700 dark:opacity-20" />

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${section.gradient} shadow-lg`}>
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4 pl-[52px]">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifestyle photos */}
      <div className="mt-14 mb-12">
        <div className="grid grid-cols-3 gap-3">
          <div className="aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src="/jonny-pottery-studio.jpg"
              alt="Jon at the pottery studio"
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src="/jonny-hiking.jpg"
              alt="Jon hiking with dogs"
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src="/jonny-couple.jpg"
              alt="Jon and his wife"
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/work"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
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
