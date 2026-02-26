"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gamepad2, Trophy, Globe, Rocket, Wrench, Heart, Target, Sparkles, Quote, User } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeAnimations } from "@/lib/animations";

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
      "I co-founded Frame Story, a collaborative game studio modeled after Finji and Raw Fury, with recently laid-off developers and designers. Not just a creative project: I incorporated the company, set up banking and payment processing, wrote contributor agreements and IP assignments, and built the financial model from scratch. Five-year projections, investor pitch materials, a SAFE structure at a $3M cap, and a phased fundraising strategy spanning grants (Epic MegaGrant, Wings Fund), angel investors, and a planned Kickstarter.",
      "I designed the go-to-market pipeline for our first title, Cluck: Steam Next Fest demos, indie festival submissions, content creator partnerships, and a marketing roadmap that ties wishlist campaigns to funding milestones. I wrote the 90-day operational plan covering business formation, MVP scoping, community growth, and live ops. Six months in, I was a full founder: zero-to-one with no salary safety net.",
      "I also started freelancing for my local pottery studio, which planted the seed for Pottery Friends. After embedding at the studio six days a week for a year, I identified an unowned vertical: no one has built purpose-built software for craft studio communities. So I built it myself, a native mobile app, marketing site, analytics dashboards, and internal docs, using AI-assisted development with Claude Code to ship production features in days, not sprints.",
      "150 beta members. Fifteen repos. Fifty-nine database migrations. Currently running structured user testing to validate product-market fit. All of it conceived, designed, built, and shipped by one PM proving that modern AI tooling changes what a single builder can do.",
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
  const { fadeIn, staggerContainer, staggerItem } = useThemeAnimations();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero area */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative mb-12 overflow-hidden rounded-2xl gradient-bg-subtle p-8 sm:p-10"
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-accent-400/20 blur-3xl dark:bg-accent-600/10" />
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
            <div className="mb-3 flex items-center gap-3">
              <div className="icon-container">
                <User className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                About Me
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Most PMs talk about what their teams shipped. I can show you what <em className="text-accent-600 not-italic font-medium dark:text-accent-400">I</em> shipped. Here&apos;s how I got here.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Career at a glance */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="mb-12 theme-grid grid grid-cols-2 sm:grid-cols-4"
      >
        {[
          { value: "2009", label: "First day at Zynga", gradient: "from-indigo-500 to-violet-500" },
          { value: "10+", label: "Companies shipped at", gradient: "from-violet-500 to-purple-500" },
          { value: "$50M", label: "Product revenue (Jam City)", gradient: "from-amber-500 to-orange-500" },
          { value: "150", label: "Pottery Friends beta members", gradient: "from-emerald-500 to-teal-500" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={staggerItem} className="theme-card p-4 text-center">
            <p className={`text-2xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Story sections with visual timeline */}
      <div className="relative">
        {/* Vertical gradient line connecting sections */}
        <div className="absolute left-5 top-0 bottom-0 w-px gradient-divider opacity-30 dark:opacity-20" />

        <div className="space-y-10">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: idx * 0.05, ease: "easeOut" }}
              className="relative"
            >
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lifestyle photos */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="mt-14 mb-12"
      >
        <div className="grid grid-cols-3 gap-3">
          <motion.div variants={staggerItem} className="aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src="/jonny-pottery-studio.jpg"
              alt="Jon at the pottery studio"
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </motion.div>
          <motion.div variants={staggerItem} className="aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src="/jonny-hiking.jpg"
              alt="Jon hiking with dogs"
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </motion.div>
          <motion.div variants={staggerItem} className="aspect-[3/4] overflow-hidden rounded-xl">
            <Image
              src="/jonny-couple.jpg"
              alt="Jon and his wife"
              width={400}
              height={533}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={staggerContainer}
        className="mb-12"
      >
        <motion.div variants={staggerItem} className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
            <Quote className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            What People Say
          </h2>
        </motion.div>
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
            <motion.blockquote
              key={t.name}
              variants={staggerItem}
              className="theme-card relative overflow-hidden p-5"
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${t.accent}`} />
              <p className="pl-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-3 pl-3">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.context}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeIn}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/work"
          className="inline-flex items-center justify-center gap-2 rounded-lg gradient-btn px-5 py-2.5 text-sm font-medium transition-all"
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
      </motion.div>
    </div>
  );
}
