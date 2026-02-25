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
    context: "Went deeper into web3 to own the full stack — marketplace, quest system, and a new blockchain from scratch.",
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
    context: "Blockchain gaming felt like the next frontier. Wanted to be at the intersection of the two industries I knew best.",
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
    context: "First PM hire at an 85-person startup. No product infrastructure, celebrity partnerships to manage, everything to prove. The closest I'd come to founder energy — and it changed what I wanted next.",
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
    context: "Could my PM instincts transfer outside of gaming entirely? AAA proved the skills were portable — different domain, same core muscle.",
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
    context: "Wanted to deepen my analytics and monetization craft. Built a data pipeline from scratch and learned how rigorous testing drives engagement.",
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
    context: "After scaling one game, I wanted to see what product work looked like at franchise scale — where every decision reaches millions of people.",
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
    context: "First leadership title. Wanted to prove I could own product strategy for an entire suite, not just execute on a single game.",
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
    context: "Took a bet on frontier tech — VR and MMO gaming were nascent and I wanted in early. The company was later acquired by Zynga.",
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
      "Managed evergreen feature integration for the FarmVille franchise",
      "Integrated digital assets for FrontierVille and Treasure Isle",
      "Executed market research to guide PetVille's creative vision",
      "Developed raiding feature for Zynga's first mobile app (Mafia Wars iPhone)",
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
