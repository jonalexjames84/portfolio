export type Role = {
  company: string;
  title: string;
  period: string;
  startYear: number;
  context?: string;
  highlights: string[];
  tags: string[];
};

export const career: Role[] = [
  {
    company: "Frame Story",
    title: "Co-Founder & Director of Product",
    period: "Feb 2025 – Present",
    startYear: 2025,
    context: "Co-founded a collaborative game studio modeled after Finji and Raw Fury. Small creative pods own their IP and earn 70% of net revenue; the studio centralizes ops, legal, finance, and publishing so creators focus on making great games.",
    highlights: [
      "Led business formation end-to-end: LLC, banking, payments, contributor agreements, IP assignment",
      "Built 5-year financial model and investor materials: $3M cap SAFE, 1-to-12 title portfolio strategy",
      "Designed phased GTM for Cluck: Steam Next Fest, indie festivals, creator partnerships, Kickstarter",
      "Executing $100K pre-seed raise via SAFEs, grants (Epic MegaGrant, Wings Fund), and crowdfunding",
      "Leading product on Cluck (3D platformer) with 10+ person team through milestone-driven Steam release",
    ],
    tags: ["Game Studio", "Co-Founder", "GTM Strategy", "Fundraising", "Financial Modeling"],
  },
  {
    company: "Indie Builder",
    title: "Founder / PM / Dev",
    period: "Feb 2025 – Present",
    startYear: 2025,
    context: "Built Pottery Friends from zero to 150-member early access beta using AI-native development. Currently running user testing to validate product-market fit for an unowned vertical: purpose-built software for craft studio communities.",
    highlights: [
      "Running a structured early access beta: tracking D1/D7 retention cohorts, activation funnels, and PMF surveys to validate whether purpose-built studio software beats the Square + group chat status quo",
      "Built the full product ecosystem solo using AI-assisted development (Claude Code): native mobile app, marketing site, analytics dashboards, and internal docs, shipping production features in days, not sprints",
      "Prioritized by killing scope ruthlessly: cut a planned marketplace after user interviews, pivoted the home screen when engagement data contradicted the hypothesis, reduced 40 onboarding quests to 8 tied to real studio actions",
      "15+ repos, 59 migrations, 19 edge functions across React Native, Next.js, Supabase, Stripe, and PostHog, one PM with modern AI tooling replacing a small product team",
    ],
    tags: ["AI-Native Dev", "Early Access Beta", "150 Beta Members"],
  },
  {
    company: "Treasure DAO",
    title: "Senior PM",
    period: "Apr 2024 – Nov 2024",
    startYear: 2024,
    context: "Owned the full product stack: marketplace, quest engagement system, developer platform, and a new chain launch from scratch.",
    highlights: [
      "Launched Quest v2 and Verified Actions, increasing user engagement by 30% and reducing data integration time by 40%",
      "Defined 2024 roadmap; improved team delivery velocity by 25%",
      "Led the launch of a new chain on Arbitrum, expanding user base by 20% and boosting transaction speeds by 50%",
      "Shipped refactored web app, gaming marketplace, testnet, and developer portal, increasing active developers by 35%",
    ],
    tags: ["Developer Platform", "Marketplace", "Quest Systems"],
  },
  {
    company: "Mythical Games",
    title: "Senior Technical PM",
    period: "May 2022 – Dec 2023",
    startYear: 2022,
    context: "Wanted to build at the intersection of gaming and digital marketplaces, focusing on platform-level services that power multiple titles.",
    highlights: [
      "Shipped a cross-title game services platform that unified engagement and monetization. Player retention up 20%, revenue up 15%",
      "Led a cross-functional team to deliver digital asset marketplace on time and under budget, opening a new revenue stream across multiple titles",
      "Defined the game services roadmap by identifying gaps competitors missed: live ops tooling, unified player identity, and cross-title progression",
    ],
    tags: ["Game Services", "Digital Marketplace", "Live Ops"],
  },
  {
    company: "Genies",
    title: "Founding Product Manager",
    period: "Feb 2021 – May 2022",
    startYear: 2021,
    context: "First PM hire at an 85-person startup. No product infrastructure, celebrity partnerships to manage, everything to prove.",
    highlights: [
      "Built the Creator Ecosystem from concept to launch, the product story that helped secure $150M in funding with partners like Gucci and GIPHY",
      "Launched e-commerce storefront generating $100K in weekly sales; shipped mobile app with GIPHY integration, scaling to 3K early users",
      "Defined GTM strategy that grew alpha community to 1K users",
    ],
    tags: ["Avatar Ecosystem", "Creator Tools", "E-Commerce"],
  },
  {
    company: "AAA",
    title: "Digital Product Manager",
    period: "Mar 2018 – Aug 2020",
    startYear: 2018,
    context: "First role outside gaming. Different domain, same core muscle.",
    highlights: [
      "Launched an API-driven mobile app to 6M members with real-time vehicle tracking, saving $2M/year in call center costs by shifting support to self-service",
      "Owned product strategy end-to-end with weekly C-Suite and VP presentations, the only PM reporting directly to executive leadership",
      "Ran competitive analysis, focus groups, and multivariate tests that drove a 30% improvement in onboarding completion",
    ],
    tags: ["Mobile App", "Enterprise", "6M Users"],
  },
  {
    company: "Big Fish Games",
    title: "Product Manager",
    period: "Mar 2017 – Oct 2017",
    startYear: 2017,
    context: "Wanted to deepen my analytics craft. Built a data pipeline from scratch.",
    highlights: [
      "Built the analytics pipeline from scratch (ETL + Tableau), giving the team its first real-time view of player behavior and monetization",
      "Ran multivariate tests on onboarding and core loop. Engagement up 20%, session length up 50%",
    ],
    tags: ["Casino Games", "Analytics", "Live Ops"],
  },
  {
    company: "Bandai Namco",
    title: "Product Manager",
    period: "Aug 2016 – Mar 2017",
    startYear: 2016,
    context: "First franchise-scale role: every decision reaches millions of people.",
    highlights: [
      "Ran product operations for the PAC-MAN franchise: 10M+ weekly installs, 1M+ MAU at global launch",
      "Pivoted acquisition from organic to paid after analyzing cohort data. Retention improved 20% because paid users had higher intent",
    ],
    tags: ["PAC-MAN", "Global Launch", "10M+ Installs"],
  },
  {
    company: "Flow State Media",
    title: "Director of Product",
    period: "Nov 2015 – Aug 2016",
    startYear: 2015,
    context: "First leadership title. Owned strategy for a full suite of games.",
    highlights: [
      "Owned product strategy for a suite of mobile games, where content and monetization optimizations drove 8 consecutive months of revenue growth",
    ],
    tags: ["Mobile Games", "Monetization", "Growth"],
  },
  {
    company: "SUPERLABS",
    title: "Product Manager",
    period: "Mar 2015 – Sep 2015",
    startYear: 2015,
    context: "Bet on frontier tech: VR gaming, pre-production. Company later acquired by Zynga.",
    highlights: [
      "Led pre-production product definition for a VR game, where competitive research across VR, open world, and MMO genres shaped the design direction (company later acquired by Zynga)",
    ],
    tags: ["VR", "Pre-Production", "Acquired by Zynga"],
  },
  {
    company: "Jam City",
    title: "Product Manager",
    period: "Aug 2013 – Mar 2015",
    startYear: 2013,
    context: "First PM role. After four years at Zynga, I wanted to own a product. Jam City gave me that.",
    highlights: [
      "Launched and scaled product to 1M+ DAU",
      "Developed a $50M product by refining content, design, and monetization",
      "Drove 20% MoM revenue growth through currency optimizations and content production",
    ],
    tags: ["$50M Product", "1M+ DAU", "Live Ops"],
  },
  {
    company: "Zynga",
    title: "Content Manager",
    period: "Jun 2009 – Apr 2013",
    startYear: 2009,
    context: "Where it all started. Social gaming was inventing itself in real time.",
    highlights: [
      "Shipped features across 4 franchises (FarmVille, FrontierVille, Treasure Isle, PetVille) during Zynga's peak, learning live ops at a scale few companies have matched",
      "Built Zynga's first mobile raiding feature (Mafia Wars iPhone), an early bet on mobile that shaped the company's platform shift",
    ],
    tags: ["FarmVille", "Live Ops at Scale", "Mobile Pioneer"],
  },
];

export const metrics = [
  { value: "15+", label: "Years Shipping Products" },
  { value: "10M+", label: "Installs/Week Launched" },
  { value: "$50M", label: "Revenue Driven" },
  { value: "$150M", label: "Funding Secured" },
  { value: "6M", label: "Users Reached" },
  { value: "1M+", label: "DAU at Scale" },
];

export type Company = {
  name: string;
  logo: string;
  invertInLight?: boolean;
  invertInDark?: boolean;
};

export const companies: Company[] = [
  { name: "Zynga", logo: "/logos/zynga.png" },
  { name: "Jam City", logo: "/logos/jamcity.png" },
  { name: "Bandai Namco", logo: "/logos/bandainamcoent.png" },
  { name: "Big Fish Games", logo: "/logos/bigfishgames.png" },
  { name: "AAA", logo: "/logos/aaa.png" },
  { name: "Genies", logo: "/logos/genies.png", invertInLight: true },
  { name: "Mythical Games", logo: "/logos/mythicalgames.png", invertInDark: true },
  { name: "Treasure DAO", logo: "/logos/treasure.png" },
];

export const skillCategories = [
  {
    name: "Product Leadership",
    skills: [
      "Product Strategy & Vision",
      "Roadmapping & Prioritization",
      "Cross-Functional Team Leadership",
      "Go-to-Market Strategy",
      "Stakeholder Management",
    ],
  },
  {
    name: "Growth & Engagement",
    skills: [
      "Retention Loops & Growth Levers",
      "Pricing, Packaging & Monetization",
      "A/B Testing & Experimentation",
      "Live Service Operations",
      "Funnel Optimization & Analytics",
    ],
  },
  {
    name: "Technical Execution",
    skills: [
      "React / Next.js / React Native",
      "TypeScript & Full-Stack Development",
      "Supabase / PostgreSQL / APIs",
      "Marketplace & Transaction Systems",
      "AI Integration (Claude API)",
    ],
  },
  {
    name: "Tools & Platforms",
    skills: [
      "Figma & Design Systems",
      "PostHog / Tableau / Analytics",
      "Stripe Payments & Commerce",
      "Vercel / CI/CD / DevOps",
      "Agile / Scrum / Sprint Planning",
    ],
  },
];
