export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  pitch: string;
  problem: string;
  tags: string[];
  stack: string[];
  featured: boolean;
  repos: { name: string; role: string }[];
  highlights: string[];
  outcomes: string[];
  decisions: string[];
  teamContext: string;
  screenshot?: string;
  screenshots?: string[];
};

export const projects: Project[] = [
  {
    slug: "pottery-friends",
    title: "Pottery Friends",
    subtitle: "Community Platform Ecosystem",
    screenshot: "/screenshots/potteryfriends-home.png",
    description:
      "Pottery studios run on group chats, paper sign-up sheets, and word of mouth. Members don't know when the next raku firing is, studio owners can't track who's paid, and the community that makes pottery special gets buried in noise. Pottery Friends replaces that chaos with a purpose-built platform — a native mobile app for members, a marketing site for studios, analytics dashboards for owners, and documentation for onboarding. It's the operating system for the studio experience.",
    pitch:
      "Every pottery studio I visited ran on text threads and cork boards. Members missed events, owners couldn't track payments, and the community energy that makes studios special was invisible. I built Pottery Friends as a 4-product ecosystem to solve this: a mobile app with stories, events, messaging, and a materials library; a web platform with waitlist-to-launch funnel and admin theming; analytics dashboards tracking engagement and revenue; and a documentation site for studio onboarding. The mobile app alone has 59 database migrations, 19 edge functions, Stripe payments, and a gamification system with quests and badges — it's a real product, not a prototype.",
    problem:
      "Studio communities are fragmented across group chats, paper schedules, and generic tools like Mindbody that were designed for gyms, not potters. Members miss events, owners waste hours on manual admin, and the social fabric that makes studios special has no digital home.",
    tags: ["Platform", "Mobile", "E-Commerce", "Analytics"],
    stack: [
      "React Native",
      "Expo",
      "Next.js",
      "Supabase",
      "Stripe",
      "PostHog",
      "Sentry",
      "Nextra",
      "Recharts",
    ],
    featured: true,
    repos: [
      { name: "red-ox-mobile", role: "Mobile app (iOS/Android)" },
      { name: "potteryfriends-web", role: "Marketing & web app" },
      { name: "pottery-friends-dashboards", role: "Analytics dashboards" },
      { name: "pottery-friends-docs", role: "Documentation site" },
    ],
    highlights: [
      "4-product ecosystem: native mobile app, web platform, analytics dashboards, and docs site",
      "Mobile app with stories, events, messaging, materials library, quests, and profile customization",
      "Stripe payment processing with subscription management and event ticketing",
      "59 database migrations and 19 Supabase edge functions powering the full backend",
      "PostHog analytics pipeline, Sentry error monitoring, and real-time data via Supabase subscriptions",
      "Admin theming system: studio owners customize colors, typography, and copy without code",
    ],
    outcomes: [
      "59 database migrations shipped — each one a schema evolution reflecting real product learning",
      "19 Supabase edge functions handling auth, payments, notifications, and content moderation",
      "Waitlist-to-launch funnel on the web platform converting studio sign-ups through a multi-step onboarding flow",
      "Gamification system driving repeat engagement: quests, badges, streaks, and XP leveling",
      "Stripe integration processing subscriptions and event ticket sales with webhook-driven fulfillment",
    ],
    decisions: [
      "Chose React Native over Flutter for code sharing with the web platform's React/Next.js stack — one mental model across 4 products",
      "Built on Supabase instead of Firebase to get PostgreSQL and row-level security without managing infrastructure",
      "Split into 4 products (mobile, web, dashboards, docs) instead of one monolith — each serves a different user and deploys independently",
      "Invested in a theming system early so studios could customize without developer time — a bet on self-serve onboarding at scale",
      "Used Nextra for documentation instead of building custom — saved weeks and got search, MDX, and versioning for free",
    ],
    teamContext:
      "Solo founder — conceived, designed, built, and shipped all 4 products. Conducted user interviews with 8 studio owners to validate the problem. Managed the full product lifecycle: research, design, development, QA, deployment, and analytics.",
  },
  {
    slug: "swob",
    title: "SWOB",
    subtitle: "Shift Management & Hiring Platform",
    screenshot: "/screenshots/swob-home.png",
    description:
      "Restaurants, bars, and retail shops lose staff to slow hiring and rigid schedules. SWOB is a 5-product platform that fixes both sides: a Tinder-style swipe interface lets managers match with candidates in seconds, a candidate pipeline tracks applicants from first contact to first shift, and a shift-swap system lets employees trade hours without manager bottlenecks. The marketing site drives top-of-funnel with PostHog analytics tracking every conversion point. Each product is a standalone Next.js app sharing a Supabase backend — built to scale independently.",
    pitch:
      "I kept hearing the same thing from restaurant managers: 'I posted on Indeed three weeks ago and still can't fill Saturday night.' Hiring in shift-based businesses is broken because the tools are built for office jobs. SWOB reimagines the whole flow. Managers swipe through pre-qualified candidates like a dating app. The candidate dashboard gives applicants a clean view of their applications and upcoming shifts. A pipeline tool tracks every applicant through customizable stages. And when someone can't make a shift, the swap system handles it peer-to-peer. I built 5 products because the problem isn't just hiring or just scheduling — it's the gap between them.",
    problem:
      "Shift-based businesses rely on job boards designed for salaried roles, then manage schedules through group texts and spreadsheets. Hiring takes weeks when it should take hours. Shift swaps require manager approval chains that cause no-shows. There's no unified system connecting who you hire to how you schedule them.",
    tags: ["SaaS", "Multi-Product", "Hiring", "Workflow"],
    stack: ["Next.js", "TypeScript", "TailwindCSS", "Supabase", "PostHog"],
    featured: true,
    repos: [
      { name: "swob-app", role: "Core application" },
      { name: "swob-candidate-dashboard", role: "Candidate-facing dashboard" },
      { name: "swob-candidate-pipeline", role: "Pipeline management" },
      { name: "swob-shift-swap", role: "Shift swap interface" },
      { name: "swob-marketing-site", role: "Marketing site" },
    ],
    highlights: [
      "5 standalone Next.js apps sharing a Supabase backend — each deployable independently",
      "Tinder-style swipe-to-match hiring interface for rapid candidate screening",
      "Multi-stage candidate pipeline with customizable columns and drag-and-drop",
      "Peer-to-peer shift swap system that removes manager bottleneck from schedule changes",
      "8 color themes, 4 font themes, and 7 layout templates for white-label customization",
      "PostHog analytics pipeline tracking conversion at every funnel stage",
    ],
    outcomes: [
      "5 standalone apps sharing one Supabase backend — proving a micro-frontend architecture for small teams",
      "White-label theming system with 8 color themes, 4 font themes, and 7 layout templates — designed for multi-tenant SaaS",
      "PostHog funnel tracking from marketing site visit → sign-up → first candidate match, identifying a 3x drop-off at onboarding",
      "Swipe-to-match prototype tested with 3 restaurant managers — average time to shortlist dropped from 'days' to under 2 minutes",
    ],
    decisions: [
      "Split into 5 apps instead of feature flags in one app — each product serves a different persona (manager, candidate, admin) with its own deployment cycle",
      "Chose swipe UI over traditional list/filter because restaurant managers hire on gut + availability, not keyword matching",
      "Built the white-label system before finding customers — a deliberate bet that B2B2C distribution would be the growth lever",
      "Used PostHog over Mixpanel for analytics because of the self-hostable option and session recordings at no extra per-seat cost",
    ],
    teamContext:
      "Solo founder — designed the multi-product architecture, built all 5 apps, and conducted user interviews with restaurant and retail managers to validate the hiring workflow. Ran PostHog analytics to measure conversion and identify UX bottlenecks.",
  },
  {
    slug: "1406-adventures",
    title: "1406 Adventures",
    subtitle: "Luxury Travel Agency Platform",
    screenshot: "/screenshots/1406-home.png",
    description:
      "Luxury travel runs on trust and relationships — clients come through personal referrals, not ad clicks. 1406 Adventures is a cross-platform digital experience for a high-touch travel agency that books 10-12 exclusive clients per year. The web app is a conversion-optimized marketing site with a URL-based referral tracking system that attributes every lead to the agent or client who sent them. The native mobile app mirrors the brand experience and lets clients browse destinations and submit inquiries on the go. Every design decision — from the multi-layout A/B tests to the agent partner registry — is built around one metric: qualified referral conversions.",
    pitch:
      "A luxury travel advisor told me her entire business ran on word of mouth, but she had no way to track which referrals actually converted. Her website was a brochure that didn't capture leads, and her clients couldn't easily share her info. I built 1406 Adventures as two products: a React web app with a referral tracking system that ties every inquiry to its source, and a React Native mobile app that gives clients a premium browsing experience. The web app includes an agent partner registry, multiple layout variants for conversion testing, and a lead capture funnel with referral attribution. It turns a relationship-driven business into a measurable one — without losing the personal touch.",
    problem:
      "Luxury travel advisors depend on referrals but have no infrastructure to track them. Leads come through texts and emails with no attribution. Agents who send clients get no visibility. The advisor can't tell which relationships drive revenue, making it impossible to invest in the right partnerships.",
    tags: ["Travel", "Cross-Platform", "Lead Gen", "Mobile"],
    stack: [
      "React",
      "React Native",
      "Expo",
      "Vite",
      "TailwindCSS",
      "React Navigation",
    ],
    featured: true,
    repos: [
      { name: "1406-adventures", role: "Web app (React + Vite)" },
      { name: "1406-adventures-mobile", role: "Native mobile app (iOS/Android)" },
    ],
    highlights: [
      "URL-based referral tracking system that attributes every lead to its source",
      "Agent partner registry connecting travel advisors to their referral network",
      "Cross-platform web + native mobile with consistent luxury brand experience",
      "Multi-layout A/B testing system for conversion optimization",
      "Lead capture funnel with referral attribution and automated inquiry routing",
      "Mobile app with destination browsing, trip galleries, and direct inquiry submission",
    ],
    outcomes: [
      "Referral tracking system attributing 100% of leads to their source — replacing a notebook and guesswork",
      "Multiple layout variants A/B tested to optimize conversion on the lead capture funnel",
      "Agent partner registry giving referring advisors visibility into their pipeline for the first time",
      "Cross-platform consistency: web and mobile share brand assets, copy, and interaction patterns",
    ],
    decisions: [
      "Built as a React SPA with Vite instead of Next.js — the site is purely client-side with no server-side data, so SSR added complexity without value",
      "Chose React Native for mobile instead of a responsive web app — the client's audience expects a native feel, and the referral share flow works better as a deep link into an installed app",
      "Designed the referral system as URL parameters rather than auth-gated tracking — lower friction for referrers who just want to share a link",
      "Tested multiple layout variants rather than picking one — the client serves a niche audience, so data beats intuition on what converts",
    ],
    teamContext:
      "Built for a real client — a luxury travel advisor. Conducted discovery interviews to map her referral workflow, designed the referral attribution system, built both the web and mobile apps, and iterated on conversion based on lead data.",
  },
  {
    slug: "health-dashboard",
    title: "Health Dashboard",
    subtitle: "AI-Powered Fitness & Nutrition Analytics",
    screenshot: "/screenshots/health-home.png",
    screenshots: ["/screenshots/health-home.png", "/screenshots/health-meals.png"],
    description:
      "Fitness data is scattered across apps that don't talk to each other. Strava tracks your runs, COROS logs your heart rate, a DEXA scan lives in a PDF, and your meals are in a spreadsheet. Health Dashboard pulls it all into one place and makes it actionable. Strava webhooks stream activity data in real-time. DEXA PDFs get parsed into body composition trends. COROS .FIT files are decoded into training load metrics. And Claude generates personalized meal plans based on your macros, goals, and what's in your fridge. It's the single pane of glass for everything about your body.",
    pitch:
      "I was training for a marathon and realized I had data everywhere but insights nowhere. Strava told me my pace, COROS told me my heart rate, my DEXA scan was a PDF I never looked at, and my nutrition tracking was a guess. So I built a dashboard that connects all of it. Strava webhooks push activity data automatically. I wrote a parser that extracts body composition data from DEXA scan PDFs. COROS .FIT files get decoded into training load metrics with ACWR ratios and polarization scoring. And instead of guessing what to eat, Claude analyzes my macros, training load, and goals to generate meal plans and recipes. One product, four data sources, and AI that ties it all together.",
    problem:
      "Athletes and health-conscious people generate data across 5+ apps with no unified view. Strava doesn't know your body composition. Your DEXA scan doesn't factor into your meal plan. Training load calculations require manual spreadsheets. The result: people collect data they never act on because synthesizing it takes more effort than the workout itself.",
    tags: ["Health", "AI", "Data Viz", "Integrations"],
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Anthropic Claude API",
      "Strava API",
      "Recharts",
      "TailwindCSS",
    ],
    featured: true,
    repos: [{ name: "health", role: "Full health analytics dashboard" }],
    highlights: [
      "Claude-powered meal planning: generates recipes based on macros, goals, and available ingredients",
      "Strava webhook integration for real-time activity syncing without manual imports",
      "DEXA scan PDF parser that extracts body composition data into trackable trends",
      "COROS .FIT file decoder for heart rate zones, training load, and recovery metrics",
      "Training load analytics: ACWR ratios, monotony scoring, and polarization analysis",
      "Body composition dashboard with regional fat distribution and muscle balance tracking",
    ],
    outcomes: [
      "4 data sources unified into one dashboard — replacing manual spreadsheet tracking entirely",
      "AI meal planning generating nutritionally-targeted recipes in under 3 seconds via Claude API",
      "Strava webhooks processing activities in real-time — zero manual data entry after initial setup",
      "DEXA PDF parser extracting 20+ body composition data points from unstructured scan reports",
      "Training load dashboard surfacing injury risk indicators (ACWR > 1.5) that were invisible before",
    ],
    decisions: [
      "Used Strava webhooks instead of polling — real-time sync with no rate limit issues and instant dashboard updates after a workout",
      "Built a custom DEXA PDF parser instead of manual entry — scans have a consistent format, so regex extraction is reliable and saves 15 minutes per scan",
      "Chose Claude over GPT for meal planning because of longer context windows — the prompt includes full macro targets, dietary restrictions, available ingredients, and recent meal history",
      "Built with Recharts instead of D3 — the charts are standard (line, bar, scatter) and Recharts integrates natively with React, saving weeks of custom SVG work",
      "Stored everything in Supabase/Postgres instead of a time-series DB — the data volume is personal-scale, and Postgres's JSON columns handle the varied schemas from different devices",
    ],
    teamContext:
      "Personal project built to solve my own problem as a marathon runner. Designed the data model, built all integrations (Strava, DEXA, COROS, Claude), and use the dashboard daily. The project demonstrates API integration architecture, data pipeline design, and AI product thinking.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
