import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Resume",
  description: "Jonny Martin's resume — Senior Product Manager with 10+ years shipping products at Zynga, Jam City, Genies, Mythical Games, and more.",
};

const experience = [
  {
    title: "Senior PM",
    company: "Treasure DAO",
    dates: "Apr 2024 – Nov 2024",
    context: "Led product for a blockchain gaming ecosystem. Cross-functional team of 12 (engineering, design, data, marketing).",
    bullets: [
      "Launched Quest v2 and Verified Actions, increasing user engagement by 30% and reducing data integration time by 40%",
      "Developed 2024 roadmap and strategy, improving project completion efficiency by 25%",
      "Led the launch of a new blockchain on Arbitrum, expanding the user base by 20% and boosting transaction speeds by 50%",
      "Launched refactored web application, gaming NFT marketplace, testnet, and developer portal, increasing active developers by 35%",
    ],
  },
  {
    title: "Senior Technical PM",
    company: "Mythical Games",
    dates: "May 2022 – Dec 2023",
    context: "Owned game services platform powering multiple titles. Worked with engineering, game design, and monetization teams.",
    bullets: [
      "Developed and launched a game services platform, enhancing functionality, engagement, and monetization across multiple titles",
      "Led a cross-functional team to deliver game service features on time and under budget, increasing player retention by 20% and revenue by 15%",
      "Integrated blockchain technology and NFTs, creating new revenue streams through digital asset transactions",
      "Conducted market research and competitor analysis to ensure cutting-edge game services",
    ],
  },
  {
    title: "Founding Product Manager",
    company: "Genies",
    dates: "Feb 2021 – May 2022",
    context: "First PM hire. Built the product function from scratch and led the creator ecosystem launch.",
    bullets: [
      "Launched mobile app with GIPHY, scaling to 3K early users; built e-commerce storefront generating $100K in weekly sales",
      "Led the Genies Creator Ecosystem from concept to launch, securing $150M in funding with partners like Gucci and GIPHY",
      "Implemented Agile methodologies, improving development efficiency and fostering continuous improvement",
      "Established GTM strategy, scaling product to 1K alpha community",
    ],
  },
  {
    title: "Digital Product Manager",
    company: "AAA",
    dates: "Mar 2018 – Aug 2020",
    context: "Led mobile strategy for a 60M+ member organization. Reported to VP and C-Suite stakeholders weekly.",
    bullets: [
      "Developed and launched a mobile app strategy, providing weekly updates to C-Suite and VP stakeholders",
      "Launched a tech-forward API-driven app with real-time vehicle tracking, reaching 6M members and saving $2M in call center costs",
      "Conducted design research through competitive analysis, focus groups, and multivariate tests to optimize UX",
    ],
  },
  {
    title: "Product Manager",
    company: "Big Fish Games",
    dates: "Mar 2017 – Oct 2017",
    context: "Owned roadmap and go-to-market for a casino mobile game. Built analytics pipeline from scratch.",
    bullets: [
      "Created and executed roadmap, go-to-market, and launch strategy for a casino mobile game",
      "Developed analytics from scratch, integrating ETLs and creating custom Tableau reports",
      "Implemented multivariate tests, improving engagement by 20% and session length by 50%",
    ],
  },
  {
    title: "Product Manager",
    company: "Bandai Namco Ent.",
    dates: "Aug 2016 – Mar 2017",
    context: "Managed PAC-MAN franchise mobile operations globally.",
    bullets: [
      "Managed mobile game operations for the PAC-MAN franchise, overseeing a global launch with 10M+ weekly installs and 1M+ MAU",
      "Conducted marketing acquisition analysis, pivoting towards a paid strategy and improving retention rate by 20%",
    ],
  },
  {
    title: "Director of Product",
    company: "Flow State Media",
    dates: "Nov 2015 – Aug 2016",
    context: "Led product strategy for a portfolio of mobile games.",
    bullets: [
      "Charted roadmap and strategic plan for a suite of mobile games",
      "Optimized content and monetization, leading to consistent revenue growth for 8 months",
    ],
  },
  {
    title: "Product Manager",
    company: "SUPERLABS (acquired by Zynga)",
    dates: "Mar 2015 – Sep 2015",
    context: "Pre-production VR game research and product definition.",
    bullets: [
      "Conducted research on a pre-production VR game, guiding design through competitive research for VR, open world, and MMO gaming",
      "Authored technical and product documents for engineering and art/design teams",
    ],
  },
  {
    title: "Product Manager",
    company: "Jam City",
    dates: "Aug 2013 – Mar 2015",
    context: "Owned a live game with 1M+ DAU. Full P&L responsibility.",
    bullets: [
      "Launched and scaled product to 1M+ DAU through effective marketing and retention strategies",
      "Developed a $50M product by refining content, design, and monetization",
      "Drove 20% MoM revenue growth through currency optimizations and content production",
    ],
  },
  {
    title: "Content Manager",
    company: "Zynga",
    dates: "Jun 2009 – Apr 2013",
    context: "Started career at the company that defined social gaming. Worked on FarmVille, FrontierVille, and Mafia Wars.",
    bullets: [
      "Managed evergreen feature integration for the FarmVille franchise",
      "Developed raiding feature for Zynga's first mobile app (Mafia Wars iPhone)",
    ],
  },
];

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Resume
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            10+ years in product management across gaming, web3, mobile, and SaaS
          </p>
        </div>
        <Link
          href="/resume.pdf"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
        >
          <Download size={14} />
          Download PDF
        </Link>
      </div>

      <div className="space-y-10">
        {/* Summary */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Summary
          </h2>
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            Senior Product Manager with 10+ years shipping products at companies
            like Zynga, Jam City, Bandai Namco, Genies, Mythical Games, and
            Treasure DAO. I&apos;ve managed products with 1M+ DAU, launched apps
            reaching 6M members, and built e-commerce experiences generating
            $100K/week. Now I also build — my personal portfolio includes 4
            multi-product ecosystems I designed, developed, and shipped end-to-end.
          </p>
        </section>

        {/* Experience */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Experience
          </h2>
          <div className="space-y-8">
            {experience.map((role) => (
              <div key={`${role.company}-${role.dates}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {role.title}, {role.company}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {role.context}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                    {role.dates}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {role.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Skills & Tools
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Product
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Product Strategy, Roadmapping, User Research, PRDs, A/B Testing, Analytics, Go-to-Market, P&L Ownership, Agile/Scrum
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Technical
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                React, Next.js, React Native, TypeScript, Supabase, PostgreSQL, Stripe, TailwindCSS, Vercel, PostHog
              </p>
            </div>
          </div>
        </section>

        {/* Side Projects callout */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Personal Projects (2024–Present)
          </h3>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            In addition to my professional experience, I&apos;ve designed, built,
            and shipped 4 multi-product ecosystems from scratch — including a
            React Native mobile app with 59 database migrations, Stripe payments,
            and a gamification engine.
          </p>
          <Link
            href="/work"
            className="text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
          >
            See all projects &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}
