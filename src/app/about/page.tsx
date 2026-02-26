import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gamepad2, Trophy, Globe, Rocket, Wrench, Heart, Target, Sparkles, Quote } from "lucide-react";

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
      "I walked into Zynga in 2009, the same month FarmVille crossed 10 million players. No product experience, no idea what a DAU was. Within a year I was shipping features on FarmVille and building Mafia Wars' first mobile raiding system. The lesson that stuck: obsess over what players actually do, not what the roadmap says they should do.",
      "After four years I'd contributed to some of the biggest titles in social gaming, but I was still a content manager. I wanted to own a product, not feed content into someone else's.",
    ],
  },
  {
    icon: Trophy,
    title: "Learning to Own the Outcome",
    gradient: "from-violet-500 to-purple-500",
    content: [
      "Jam City gave me that ownership. I launched a game and scaled it to 1M+ DAU and $50M in revenue. The insight that stuck: 20% month-over-month revenue growth came from running currency optimizations weekly instead of quarterly. Speed of iteration beat any single brilliant idea. But after scaling one game, I wanted to know what product work looked like at franchise scale, the kind where every decision reaches millions of people.",
      "SUPERLABS (VR gaming, later acquired by Zynga), then Director of Product at Flow State Media where I drove eight straight months of revenue growth. Bandai Namco gave me the PAC-MAN franchise: 10M+ weekly installs, 1M+ MAU, 20% retention improvement. But franchise work means optimizing someone else's vision. I wanted to build from scratch again.",
    ],
  },
  {
    icon: Globe,
    title: "Beyond Games",
    gradient: "from-amber-500 to-orange-500",
    content: [
      "Big Fish Games deepened my analytics craft: reporting pipeline from scratch, multivariate tests that improved engagement 20% and session length 50%. Then I tested whether PM instincts transfer outside gaming.",
      "AAA answered that. Mobile app to 6M members, $2M saved in annual call center costs, weekly C-Suite strategy presentations. Different domain, same core muscle: understand the user, ship fast, measure what matters.",
    ],
  },
  {
    icon: Rocket,
    title: "Betting on Myself",
    gradient: "from-rose-500 to-pink-500",
    content: [
      "Genies hired me as their first PM. 85-person startup, no product infrastructure, celebrity partnerships (Gucci, GIPHY), everything to prove. I built the creator ecosystem from concept to launch, an e-commerce storefront doing $100K/week, and helped close $150M in funding.",
      "Mythical Games and Treasure DAO took me deeper into digital marketplaces and developer platforms. Mythical: cross-title game services, +20% retention, +15% revenue. Treasure: quest system, marketplace, new chain on Arbitrum, +20% user base. Then, in November 2024, I was laid off.",
    ],
  },
  {
    icon: Wrench,
    title: "The Last Year",
    gradient: "from-emerald-500 to-teal-500",
    content: [
      "I didn't jump back into the job market. I took a few months to decompress: lifting weights, overhauling my nutrition, fighting through anxiety and depression. And then I started building.",
      "I co-founded a game studio with recently laid-off developers and designers. Six months in, I was a full founder: zero-to-one with no salary safety net. I also started freelancing for my local pottery studio, which planted the seed for Pottery Friends.",
      "Then came consulting on Swob (swipe-to-hire for hourly workers) and building two more products solo: Macro Chef (AI nutrition + fitness data) and Pottery Friends (community platform for pottery studios, 150 beta members).",
      "Four products. Fifteen repos. Fifty-nine database migrations. All of it conceived, designed, built, and shipped by one person who also happens to be a fifteen-year product manager.",
    ],
  },
  {
    icon: Sparkles,
    title: "The Thread",
    gradient: "from-sky-500 to-cyan-500",
    content: [
      "The common thread across 15 years: the best product decisions come from understanding what it actually costs to build. Not from a sprint planning estimate, from building it yourself.",
    ],
  },
  {
    icon: Heart,
    title: "How I Work",
    gradient: "from-fuchsia-500 to-pink-500",
    content: [
      "I've led cross-functional teams at companies ranging from 85-person startups to organizations with 6M members. I write PRDs that engineers actually want to read, run sprints without micromanaging, and say no to features that don't move the metric that matters. My builder background means I can unblock technical conversations faster than most PMs. I don't need a meeting to understand why a migration is risky or an API design decision matters. That shared vocabulary earns trust with engineering teams quickly.",
      "I prioritize by asking one question: what's the fastest path to learning something we don't know? Discovery and delivery aren't separate phases. They're parallel tracks. I define product success by behavior change, not feature completion. A shipped feature nobody uses is worse than one that was cut because the data said no.",
    ],
  },
  {
    icon: Target,
    title: "What I'm Looking For",
    gradient: "from-indigo-500 to-blue-500",
    content: [
      "I want a company where product drives growth, not a support function. The right fit: PM owns the outcome, team ships weekly, technical depth matters.",
      "Seed-to-Series B startups in SaaS, dev tools, AI/ML, or consumer platforms. Bay Area, open to remote.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
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
              Most PMs talk about what their teams shipped. I can show you what <em className="text-indigo-600 not-italic font-medium dark:text-indigo-400">I</em> shipped. Here&apos;s how I got here.
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

      {/* Testimonials */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
            <Quote className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            What People Say
          </h2>
        </div>
        <div className="space-y-4">
          {[
            {
              quote: "Jon Martin was crucial to the success of Panda Pop, which is currently the number 1 bubble shooter in the world. He is reliable and makes good product decisions based on data and knowledge of the marketplace. He fought to be heard within the company, and argued for changes that ultimately took Panda Pop up a level to the top grossing hit it is today.",
              name: "Mike Chera",
              context: "Creative Director, Video Games. Managed Jon at Jam City",
              accent: "from-indigo-500 to-violet-500",
            },
            {
              quote: "Jon is a pro at getting things done and a great morale boost to any team. I watched him transition from artist to designer, and quickly learn the ropes and technical wranglings of design and content implementation. He could always be relied upon to get things done, and spot process and tool improvements to increase efficiency.",
              name: "Eric Zimmerman",
              context: "Engineer at Dolby. Managed Jon at Zynga",
              accent: "from-violet-500 to-purple-500",
            },
            {
              quote: "Jon is a great individual to work with and have on your team. He can be counted on to approach his work with charisma and a positive attitude, characteristics that make him a pleasure to work with under pressure. Jon is also a strong creative contributor who can pick up technical tasks with ease.",
              name: "Brian Kahrs",
              context: "Product @ Ridgeline. Worked with Jon at Zynga",
              accent: "from-emerald-500 to-teal-500",
            },
            {
              quote: "Being able to walk up to Jon's desk has always been a pleasure, he's willing to help in explaining any design questions I've ever had. He's task oriented and keeps to a tight schedule while not cutting corners, he actually helps solves problems. Working with Jon is a great experience personally and professionally.",
              name: "Randall Smith",
              context: "3D Character Artist. Worked with Jon at Zynga",
              accent: "from-rose-500 to-pink-500",
            },
            {
              quote: "Jon is an accomplished tech artist, UI designer and game designer. I worked with him at Zynga when he was first starting out and he impressed the team with his talent and dedication. Plus, Jon is a great team player.",
              name: "Steven Lurie",
              context: "Founder at Team Builder Ventures. Senior to Jon at Zynga",
              accent: "from-sky-500 to-cyan-500",
            },
          ].map((t) => (
            <blockquote
              key={t.name}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${t.accent}`} />
              <p className="pl-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-3 pl-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.context}</p>
              </footer>
            </blockquote>
          ))}
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
