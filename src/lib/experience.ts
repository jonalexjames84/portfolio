export type Role = {
  company: string;
  title: string;
  period: string;
  startYear: number;
  highlights: string[];
  tags: string[];
};

export const career: Role[] = [
  {
    company: "Indie Builder",
    title: "Founder / PM / Dev",
    period: "Nov 2024 – Present",
    startYear: 2024,
    highlights: [
      "Shipped 4 complete product ecosystems across web and mobile — community platform, hiring platform, travel agency, and AI health dashboard",
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
    highlights: [
      "Launched Quest v2 and Verified Actions, increasing user engagement by 30% and reducing data integration time by 40%",
      "Developed 2024 roadmap and strategy, improving project completion efficiency by 25%",
      "Led the launch of a new blockchain on Arbitrum, expanding user base by 20% and boosting transaction speeds by 50%",
      "Launched refactored web app, gaming NFT marketplace, testnet, and developer portal, increasing active developers by 35%",
    ],
    tags: ["Blockchain", "Gaming", "Developer Platform"],
  },
  {
    company: "Mythical Games",
    title: "Senior Technical PM",
    period: "May 2022 – Dec 2023",
    startYear: 2022,
    highlights: [
      "Developed and launched a game services platform, enhancing functionality, engagement, and monetization across multiple titles",
      "Led cross-functional team to deliver game service features on time and under budget, increasing player retention by 20% and revenue by 15%",
      "Integrated blockchain technology and NFTs, creating new revenue streams through digital asset transactions",
      "Conducted market research and competitor analysis to ensure cutting-edge game services",
    ],
    tags: ["Game Services", "Blockchain", "Live Ops"],
  },
  {
    company: "Genies",
    title: "Founding Product Manager",
    period: "Feb 2021 – May 2022",
    startYear: 2021,
    highlights: [
      "Launched mobile app with GIPHY, scaling to 3K early users; built e-commerce storefront generating $100K in weekly sales",
      "Led the Genies Creator Ecosystem from concept to launch, securing $150M in funding with partners like Gucci and GIPHY",
      "Implemented Agile methodologies, improving development efficiency and fostering continuous improvement",
      "Established GTM strategy, scaling product to 1K alpha community",
    ],
    tags: ["Avatar Ecosystem", "Creator Tools", "E-Commerce"],
  },
  {
    company: "AAA",
    title: "Digital Product Manager",
    period: "Mar 2018 – Aug 2020",
    startYear: 2018,
    highlights: [
      "Developed and launched a mobile app strategy, providing weekly updates to C-Suite and VP stakeholders",
      "Launched a tech-forward API-driven app with real-time vehicle tracking, reaching 6M members and saving $2M in call center costs",
      "Conducted design research through competitive analysis, focus groups, and multivariate tests to optimize UX",
    ],
    tags: ["Mobile App", "Enterprise", "6M Users"],
  },
  {
    company: "Big Fish Games",
    title: "Product Manager",
    period: "Mar 2017 – Oct 2017",
    startYear: 2017,
    highlights: [
      "Created and executed roadmap, go-to-market, and launch strategy for a casino mobile game",
      "Developed analytics from scratch, integrating ETLs and creating custom Tableau reports",
      "Implemented multivariate tests, improving engagement by 20% and session length by 50%",
    ],
    tags: ["Casino Games", "Analytics", "Live Ops"],
  },
  {
    company: "Bandai Namco",
    title: "Product Manager",
    period: "Aug 2016 – Mar 2017",
    startYear: 2016,
    highlights: [
      "Managed mobile game operations for the PAC-MAN franchise, overseeing a global launch with 10M+ weekly installs and 1M+ MAU",
      "Conducted marketing acquisition analysis, pivoting towards a paid strategy and improving retention rate by 20%",
      "Developed reports for monitoring performance and managed design frameworks",
    ],
    tags: ["PAC-MAN", "Global Launch", "10M+ Installs"],
  },
  {
    company: "Flow State Media",
    title: "Director of Product",
    period: "Nov 2015 – Aug 2016",
    startYear: 2015,
    highlights: [
      "Charted roadmap and strategic plan for a suite of mobile games",
      "Optimized content and monetization, leading to consistent revenue growth for 8 months",
      "Executed growth plans, scaling products to benchmarks",
    ],
    tags: ["Mobile Games", "Monetization", "Growth"],
  },
  {
    company: "SUPERLABS",
    title: "Product Manager",
    period: "Mar 2015 – Sep 2015",
    startYear: 2015,
    highlights: [
      "Conducted research on a pre-production VR game, guiding design through competitive research for VR, open world, and MMO gaming",
      "Facilitated brainstorming sessions with industry veterans, resulting in comprehensive insights",
      "Authored technical and product documents for engineering and art/design teams",
    ],
    tags: ["VR", "Pre-Production", "Acquired by Zynga"],
  },
  {
    company: "Jam City",
    title: "Product Manager",
    period: "Aug 2013 – Mar 2015",
    startYear: 2013,
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
    highlights: [
      "Managed evergreen feature integration for the FarmVille franchise",
      "Integrated digital assets for FrontierVille and Treasure Isle",
      "Executed market research to guide PetVille's creative vision",
      "Developed raiding feature for Zynga's first mobile app (Mafia Wars iPhone)",
    ],
    tags: ["FarmVille", "Live Ops at Scale", "Mobile Pioneer"],
  },
];

export const metrics = [
  { value: "15+", label: "Years in Games & Tech" },
  { value: "10M+", label: "Weekly Installs (PAC-MAN)" },
  { value: "$50M", label: "Product Revenue (Jam City)" },
  { value: "$150M", label: "Funding Secured (Genies)" },
  { value: "6M", label: "App Users (AAA)" },
  { value: "1M+", label: "DAU at Scale" },
];

export const companies = [
  "Zynga",
  "Jam City",
  "Bandai Namco",
  "Big Fish Games",
  "AAA",
  "Genies",
  "Mythical Games",
  "Treasure DAO",
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
    name: "Games & Live Ops",
    skills: [
      "Live Service Operations",
      "Economy Design & Balancing",
      "Retention & Engagement Loops",
      "Monetization Strategy",
      "Player Analytics & A/B Testing",
    ],
  },
  {
    name: "Technical Execution",
    skills: [
      "React / Next.js / React Native",
      "TypeScript & Full-Stack Development",
      "Supabase / PostgreSQL / APIs",
      "Blockchain & Digital Assets",
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
