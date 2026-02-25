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
    period: "2025 – Present",
    startYear: 2025,
    context: "After 15 years shipping games for other people, I co-founded a studio to ship our own. Frame Story is a collaborative game studio where small creative teams own their games while the studio handles ops, legal, and publishing.",
    highlights: [
      "Co-founded a collaborative game studio with a 70/30 revenue-share model — creators retain IP and creative control",
      "Leading product on Cluck, a 3D atmospheric horror-lite platformer (Little Nightmares meets animal rights) with a 10+ person team",
      "Designing the studio-as-a-platform model: shared infrastructure for legal, finance, publishing, and production across multiple game pods",
      "Building toward a $100K pre-seed raise via grants (Epic MegaGrant, Wings Fund) and investor outreach",
    ],
    tags: ["Game Studio", "Co-Founder", "Indie Games"],
  },
  {
    company: "Indie Builder",
    title: "Founder / PM / Dev",
    period: "Nov 2024 – 2025",
    startYear: 2024,
    context: "Instead of jumping back into the job market, I spent three months decompressing — then started building. Four products later, I proved that fifteen years of product instincts translate directly into shipping real software.",
    highlights: [
      "Shipped 4 complete product ecosystems across web and mobile — community platform, hiring platform, travel agency, and AI nutrition coach",
      "15+ repositories, 59 database migrations, 19 edge functions — production-grade apps, not prototypes",
      "Full-stack TypeScript: React Native, Next.js, Supabase, Stripe, PostHog, Claude API",
      "Conducted user research with 20+ users across all projects to validate problems and iterate on solutions",
    ],
    tags: ["Full-Stack", "4 Products Shipped", "React Native + Next.js"],
  },
  {
    company: "Treasure DAO",
    title: "Senior PM",
    period: "Apr 2024 – Nov 2024",
    startYear: 2024,
    context: "Owned the full product stack — marketplace, quest engagement system, developer platform, and a new chain launch from scratch.",
    highlights: [
      "Launched Quest v2 and Verified Actions, increasing user engagement by 30% and reducing data integration time by 40%",
      "Developed 2024 roadmap and strategy, improving project completion efficiency by 25%",
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
    context: "Wanted to build at the intersection of gaming and digital marketplaces — platform-level services that power multiple titles.",
    highlights: [
      "Shipped a cross-title game services platform that unified engagement and monetization — player retention up 20%, revenue up 15%",
      "Led a cross-functional team to deliver digital asset marketplace on time and under budget, opening a new revenue stream across multiple titles",
      "Defined the game services roadmap by identifying gaps competitors missed — live ops tooling, unified player identity, and cross-title progression",
    ],
    tags: ["Game Services", "Digital Marketplace", "Live Ops"],
  },
  {
    company: "Genies",
    title: "Founding Product Manager",
    period: "Feb 2021 – May 2022",
    startYear: 2021,
    context: "First PM hire at an 85-person startup. No product infrastructure, celebrity partnerships to manage, everything to prove. The closest I'd come to founder energy — and it changed what I wanted next.",
    highlights: [
      "Built the Creator Ecosystem from concept to launch — the product story that helped secure $150M in funding with partners like Gucci and GIPHY",
      "Launched e-commerce storefront generating $100K in weekly sales; shipped mobile app with GIPHY integration, scaling to 3K early users",
      "Defined and executed the GTM strategy that grew the alpha community to 1K users — validating product-market fit for the avatar platform",
    ],
    tags: ["Avatar Ecosystem", "Creator Tools", "E-Commerce"],
  },
  {
    company: "AAA",
    title: "Digital Product Manager",
    period: "Mar 2018 – Aug 2020",
    startYear: 2018,
    context: "Could my PM instincts transfer outside of gaming entirely? AAA proved the skills were portable — different domain, same core muscle.",
    highlights: [
      "Launched an API-driven mobile app to 6M members with real-time vehicle tracking — saving $2M/year in call center costs by shifting support to self-service",
      "Owned product strategy end-to-end with weekly C-Suite and VP presentations — the only PM reporting directly to executive leadership",
      "Ran competitive analysis, focus groups, and multivariate tests that drove a 30% improvement in onboarding completion",
    ],
    tags: ["Mobile App", "Enterprise", "6M Users"],
  },
  {
    company: "Big Fish Games",
    title: "Product Manager",
    period: "Mar 2017 – Oct 2017",
    startYear: 2017,
    context: "Wanted to deepen my analytics and monetization craft. Built a data pipeline from scratch and learned how rigorous testing drives engagement.",
    highlights: [
      "Built the analytics pipeline from scratch (ETL + Tableau) — gave the team its first real-time view of player behavior and monetization",
      "Ran multivariate tests on onboarding and core loop — engagement up 20%, session length up 50%",
    ],
    tags: ["Casino Games", "Analytics", "Live Ops"],
  },
  {
    company: "Bandai Namco",
    title: "Product Manager",
    period: "Aug 2016 – Mar 2017",
    startYear: 2016,
    context: "After scaling one game, I wanted to see what product work looked like at franchise scale — where every decision reaches millions of people.",
    highlights: [
      "Ran product operations for the PAC-MAN franchise — 10M+ weekly installs, 1M+ MAU at global launch",
      "Pivoted acquisition from organic to paid after analyzing cohort data — retention improved 20% because paid users had higher intent",
    ],
    tags: ["PAC-MAN", "Global Launch", "10M+ Installs"],
  },
  {
    company: "Flow State Media",
    title: "Director of Product",
    period: "Nov 2015 – Aug 2016",
    startYear: 2015,
    context: "First leadership title. Wanted to prove I could own product strategy for an entire suite, not just execute on a single game.",
    highlights: [
      "Owned product strategy for a suite of mobile games — content and monetization optimizations drove 8 consecutive months of revenue growth",
    ],
    tags: ["Mobile Games", "Monetization", "Growth"],
  },
  {
    company: "SUPERLABS",
    title: "Product Manager",
    period: "Mar 2015 – Sep 2015",
    startYear: 2015,
    context: "Took a bet on frontier tech — VR and MMO gaming were nascent and I wanted in early. The company was later acquired by Zynga.",
    highlights: [
      "Led pre-production product definition for a VR game — competitive research across VR, open world, and MMO genres shaped the design direction (company later acquired by Zynga)",
    ],
    tags: ["VR", "Pre-Production", "Acquired by Zynga"],
  },
  {
    company: "Jam City",
    title: "Product Manager",
    period: "Aug 2013 – Mar 2015",
    startYear: 2013,
    context: "After four years as a content manager at Zynga, I wanted to own a product — not just feed content into someone else's. Jam City gave me that ownership.",
    highlights: [
      "Launched and scaled product to 1M+ DAU through effective marketing and retention strategies",
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
    context: "Where it all started. Social gaming was inventing itself in real time, and I learned the lesson that defined the next fifteen years: obsess over what players actually do, not what the roadmap says they should do.",
    highlights: [
      "Shipped features across 4 franchises (FarmVille, FrontierVille, Treasure Isle, PetVille) during Zynga's peak — learning live ops at a scale few companies have matched",
      "Built Zynga's first mobile raiding feature (Mafia Wars iPhone) — an early bet on mobile that shaped the company's platform shift",
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
