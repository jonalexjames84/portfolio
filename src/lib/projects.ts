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
  userResearch: string[];
  failures: string[];
  strategy: string;
  screenshot?: string;
  screenshots?: string[];
};

export const projects: Project[] = [
  {
    slug: "pottery-friends",
    title: "Pottery Friends",
    subtitle: "Community Platform Ecosystem",
    screenshot: "/screenshots/potteryfriends-home.png",
    screenshots: ["/screenshots/potteryfriends-home.png", "/screenshots/potteryfriends-admin.png"],
    description:
      "Pottery Friends grew out of my time as a member at Red Ox Ceramics in Concord, CA. Over months of daily studio sessions, I became close friends with the members and staff — and got a front-row seat to every operational pain point. The operations manager was drowning in manual billing, paper sign-up sheets, and group texts. Members were missing firings, had no way to track what glazes they'd used, and the community that made the studio special had no digital home. I built a 4-product ecosystem to solve this end-to-end: a native mobile app for members, a marketing site for studios, analytics dashboards for owners, and documentation for onboarding.",
    pitch:
      "After spending nearly a year at Red Ox Ceramics — going six days a week, befriending the operations manager, and becoming embedded in the community — I realized every studio runs the same way: Venmo for billing, group texts for announcements, and spreadsheets for everything else. Members who travel to retreats at other studios told me it's the same everywhere. I built Pottery Friends to mirror the real pain points I heard firsthand, from the admin side (billing, member management, event scheduling) all the way to the end user who wants to know what glaze to try next and find inspiration within their community. The mobile app alone has 59 database migrations, 19 edge functions, Stripe payments, and a gamification system with quests and badges — it's a real product built on real relationships.",
    problem:
      "Studio communities are fragmented across group chats, paper schedules, and generic tools like Mindbody that were designed for gyms, not potters. The operations manager at Red Ox was spending hours every week on manual billing and member tracking. Members were missing events because announcements got buried in group chat noise. And the social fabric that makes a studio special — sharing techniques, glaze results, inspiration — had no digital home.",
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
      "Solo founder — conceived, designed, built, and shipped all 4 products. This project came directly from being a daily member at Red Ox Ceramics in Concord, CA. I'm close friends with the operations manager and nearly every member, giving me deep insight into both sides of the studio experience. I didn't need to guess at pain points — I lived them. The multi-product architecture decisions draw directly from my experience leading cross-functional teams at Genies (where I built the product function from scratch as the first PM hire) and Mythical Games (where I owned game services powering multiple titles). The community engagement model is informed by 4 years at Zynga and Jam City managing live products with 1M+ DAU.",
    userResearch: [
      "Embedded in the Red Ox Ceramics community for nearly a year — attending 6 days a week, building relationships with the operations manager, instructors, and members at every skill level",
      "The operations manager walked me through her entire workflow: Venmo for billing, a spreadsheet for member tracking, group texts for event announcements, and a paper sign-up sheet for kiln reservations. She spent 5+ hours per week on manual admin",
      "Members who travel to retreats at other studios confirmed the same problems exist everywhere — no studio has purpose-built software",
      "Members reported missing 2-3 events per month because announcements were buried in group chat noise",
      "The most common request from members wasn't scheduling — it was 'What glaze should I try next?' and 'I want to see what other people are making.' Community inspiration was the killer feature, not logistics",
    ],
    failures: [
      "Initially built the mobile app with a feed-first home screen, assuming members wanted a social timeline. Usage data showed they skipped the feed entirely and went straight to Events. Redesigned the home screen around upcoming events and quick actions — engagement doubled",
      "Spent 3 weeks building a real-time chat system before discovering that studio members preferred async communication. Pivoted to a stories/announcements model inspired by Instagram, which matched how studios actually share updates",
      "The first version of the gamification system had 40+ quest types — too complex. Members ignored it. Simplified to 8 core quests tied to real studio actions (attend an event, try a new technique, share a photo). Completion rates went from 5% to 35%",
      "Originally planned a marketplace for members to sell pottery — cut it after interviews revealed owners saw it as competition with their own retail. Redirected that effort into the analytics dashboards, which owners actually wanted to pay for",
    ],
    strategy:
      "Target customer: Independent pottery studios with 30-200 members — large enough to need digital tools but too small for enterprise solutions. These studios have a passionate community but no purpose-built software. Competitive landscape: Mindbody and Glofox dominate fitness booking but don't serve craft communities. Mighty Networks and Circle are too generic. No one owns the pottery/ceramics vertical. Go-to-market: Land with a free analytics dashboard (the feature owners asked for most), then expand to the full platform once studios see engagement data. The documentation site doubles as onboarding — studios self-serve setup without a sales call. Business model: Freemium with studio-level subscriptions. Free tier gives basic events and messaging. Paid tier unlocks analytics, payments, gamification, and custom theming. Vision: Start with pottery, then expand to other craft communities (woodworking, glassblowing, printmaking) that share the same studio-and-membership model.",
  },
  {
    slug: "swob",
    title: "SWOB",
    subtitle: "Shift Management & Hiring Platform",
    description:
      "SWOB is a consulting project where I serve as the product manager. I build prototypes and manage delivery for the team. The platform tackles shift-based hiring and scheduling — a Tinder-style swipe interface lets managers match with candidates in seconds, a candidate pipeline tracks applicants from first contact to first shift, and a shift-swap system lets employees trade hours without manager bottlenecks. Each product is a standalone Next.js app sharing a Supabase backend. The sites and prototypes serve as living specifications for the engineering team.",
    pitch:
      "As a consulting PM on SWOB, I'm responsible for building prototypes that serve as living specs and managing delivery across the product suite. Hiring in shift-based businesses is broken because the tools are built for office jobs. SWOB reimagines the whole flow. Managers swipe through pre-qualified candidates like a dating app. The candidate dashboard gives applicants a clean view of their applications and upcoming shifts. A pipeline tool tracks every applicant through customizable stages. And when someone can't make a shift, the swap system handles it peer-to-peer. I built 5 product prototypes because the problem isn't just hiring or just scheduling — it's the gap between them.",
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
      "Consulting Product Manager — I build prototypes and manage delivery for this team. The sites and prototypes function as living specifications that guide engineering implementation. The multi-persona product design (manager vs. candidate vs. admin) is informed by my experience at AAA, where I led mobile strategy for a 60M+ member organization and reported weekly to C-Suite and VP stakeholders. The funnel analytics approach comes from Jam City, where I owned P&L on a $50M product and drove 20% MoM revenue growth through data-driven optimizations.",
    userResearch: [
      "Interviewed 6 restaurant and retail managers — all described the same pattern: post on Indeed, wait 2-3 weeks, get 50+ unqualified applicants, then hire whoever shows up to the interview",
      "Managers said they make hiring decisions in under 30 seconds based on availability, proximity, and vibe — not resumes. Traditional job boards force a workflow that doesn't match how they actually evaluate candidates",
      "Shift workers reported applying to 10+ jobs at once and ghosting interviews because they had no visibility into application status. The candidate dashboard was built to solve this transparency gap",
      "The #1 scheduling pain point wasn't creating schedules — it was last-minute shift swaps. Managers spent evenings texting through their staff list to find replacements. Peer-to-peer swap removed them from the loop entirely",
    ],
    failures: [
      "First version had a single monolithic app with all 5 features behind tabs. User testing showed managers were overwhelmed — they wanted to hire OR manage shifts, not both at once. Splitting into separate apps with focused UIs solved the cognitive overload problem",
      "Built an AI-powered candidate ranking system that scored applicants on 12 factors. Managers ignored the scores completely — they said 'I just need to see if they're available Saturday night.' Replaced the ranking with a simple swipe interface filtered by availability. Usage tripled",
      "The white-label theming system was built before talking to potential B2B partners. In retrospect, the 8 themes and 7 layouts were over-engineered — early customers just wanted their logo and brand color. Learned to validate demand before building the premium version",
      "PostHog revealed a 3x drop-off at the onboarding step. The original flow asked for business details, team size, and scheduling preferences upfront. Reduced onboarding to just email + business name, then collected the rest progressively. Drop-off decreased significantly",
    ],
    strategy:
      "Target customer: Independent restaurants, bars, and retail shops with 10-50 hourly employees — high turnover, always hiring, and managing schedules manually. Competitive landscape: Indeed and ZipRecruiter own job posting but stop at the hire. When I Work and Homebase own scheduling but don't touch hiring. No platform connects who you hire to how you schedule them. Go-to-market: Start with the swipe-to-match hiring tool as a free standalone product — it's the sharpest wedge and easiest to demo. Once a manager hires through SWOB, upsell the scheduling and shift-swap tools. The candidate dashboard creates a two-sided network: candidates prefer SWOB because they get transparency, which attracts more managers. Business model: Free hiring tool, paid scheduling suite. Per-location pricing for multi-unit operators. The white-label system enables B2B2C distribution through staffing agencies.",
  },
  {
    slug: "1406-adventures",
    title: "1406 Adventures",
    subtitle: "Luxury Travel Agency Platform",
    screenshot: "/screenshots/1406-home.png",
    description:
      "I'm building out the entire digital presence for 1406 Adventures — a white-glove experience for a couple who run their own luxury travel agency. They book 10-12 exclusive clients per year, all through personal referrals. The web app is a conversion-optimized marketing site with a URL-based referral tracking system that attributes every lead to the agent or client who sent them. The native mobile app mirrors the brand experience and lets clients browse destinations and submit inquiries on the go. Every design decision — from the multi-layout A/B tests to the agent partner registry — is built around one metric: qualified referral conversions.",
    pitch:
      "A couple who run their own luxury travel agency came to me because their entire business ran on word of mouth, but they had no way to track which referrals actually converted. Their website was a brochure that didn't capture leads, and their clients couldn't easily share their info. I'm building out their entire site as a white-glove experience: a React web app with a referral tracking system that ties every inquiry to its source, and a React Native mobile app that gives clients a premium browsing experience. The web app includes an agent partner registry, multiple layout variants for conversion testing, and a lead capture funnel with referral attribution. It turns a relationship-driven business into a measurable one — without losing the personal touch.",
    problem:
      "Luxury travel advisors depend on referrals but have no infrastructure to track them. Leads come through texts and emails with no attribution. Agents who send clients get no visibility. The advisors can't tell which relationships drive revenue, making it impossible to invest in the right partnerships.",
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
      "Building the entire site for a real client — a couple who run their own luxury travel agency. Conducted discovery interviews to map their referral workflow, designed the referral attribution system, built both the web and mobile apps, and iterate on conversion based on lead data. This is a white-glove engagement where I'm working with non-technical stakeholders who have strong opinions about brand and experience but need me to translate their vision into a product. The dynamic mirrors my work at Genies, where I collaborated with celebrity partners like Gucci and GIPHY to launch the creator ecosystem — navigating stakeholders who care deeply about brand consistency while pushing for technical decisions that serve the product.",
    userResearch: [
      "Discovery interviews with the travel advisor revealed she could name her top 5 referral sources from memory but had no data to back it up — her 'analytics' was a notebook with checkmarks",
      "Mapped her full referral workflow: agent partner sends a client → client emails or calls → advisor books a consultation → trip is booked 2-6 months later. Zero digital touchpoints in the entire flow",
      "Interviewed 3 of her referring agents — they wanted to know when their referrals converted but felt uncomfortable asking. The partner registry solved a relationship pain point, not just a data problem",
      "The advisor's existing website had beautiful photography but no call-to-action above the fold. Heatmap analysis of the old site showed 80% of visitors never scrolled past the hero image",
    ],
    failures: [
      "First design was a multi-page site with separate pages for each destination. Analytics showed users visited 1.2 pages on average — they weren't browsing, they were trying to make an inquiry. Redesigned as a single-page experience with the lead form always visible",
      "Initially built the referral system with unique tracking codes that agents had to remember and share. Adoption was near zero — too much friction. Switched to simple URL parameters (?ref=agentname) that agents could bookmark and share naturally",
      "The mobile app v1 tried to replicate the full web experience. Usage was minimal — luxury travel clients don't browse destinations on their phone the way they browse a website. Simplified the mobile app to focus on trip galleries (post-booking) and quick inquiry submission",
    ],
    strategy:
      "Target customer: High-touch luxury travel advisors who book 10-50 clients per year through personal referrals — not volume businesses, but relationship businesses where every lead matters. Competitive landscape: Squarespace and Wix handle basic travel websites but offer no referral tracking or agent management. CRMs like Salesforce are overkill for a solo advisor. Travel-specific tools like TravelJoy focus on itinerary management, not lead attribution. Go-to-market: Direct client work — this was built for a specific advisor, designed to be a template for similar businesses. The referral tracking system is the differentiator that generic website builders can't match. Business model: Project-based build with potential for recurring revenue through a hosted white-label version for other luxury advisors.",
  },
  {
    slug: "health-dashboard",
    title: "Health Dashboard",
    subtitle: "AI-Powered Fitness & Nutrition Analytics",
    screenshot: "/screenshots/health-home.png",
    screenshots: ["/screenshots/health-home.png", "/screenshots/health-meals.png", "/screenshots/health-training.png"],
    description:
      "This project came from my own weightlifting and body recomposition journey. I found a system of fat reduction and muscle increase that helped me get tremendous results in 6 months, and I wanted to help others do the same. Fitness data is scattered across apps that don't talk to each other — Strava tracks your runs, COROS logs your heart rate, a DEXA scan lives in a PDF, and your meals are in a spreadsheet. Health Dashboard pulls it all into one place and makes it actionable, with an AI-generated meal planner that matches your specific goals — one of the hardest things to get right. I'm now testing it within our gym community called Everfit Motion.",
    pitch:
      "After 6 months of weightlifting and body recomposition, I'd found a system that actually worked — fat reduction and muscle increase with measurable results. But the tools were all disconnected. Strava told me my pace, COROS told me my heart rate, my DEXA scan was a PDF I never looked at, and my nutrition tracking was a guess. So I built a platform that married all these systems together. The killer feature is an AI-generated meal planner that matches your specific goals — because nutrition is the hardest part of any body recomposition program and most people give up there. I'm now testing it with our gym community, Everfit Motion, to help others use the same systems I used.",
    problem:
      "People pursuing body recomposition generate data across 5+ apps with no unified view. Strava doesn't know your body composition. Your DEXA scan doesn't factor into your meal plan. Training load calculations require manual spreadsheets. And the hardest part — knowing what to eat to match your specific fat loss and muscle gain goals — is left entirely to guesswork. The result: people collect data they never act on because synthesizing it takes more effort than the workout itself.",
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
      "Built to solve my own problem during a 6-month body recomposition program. Designed the data model, built all integrations (Strava, DEXA, COROS, Claude), and use the dashboard daily. Now testing with members of Everfit Motion, our gym community, to validate whether the same systems that worked for me can help others achieve similar results. The API integration architecture mirrors challenges I faced at Treasure DAO, where I led the launch of a new blockchain on Arbitrum and shipped a gaming NFT marketplace — both required orchestrating multiple third-party APIs and data sources into a coherent product. The analytics dashboard design draws from my experience at Bandai Namco (PAC-MAN franchise, 10M+ weekly installs) and Big Fish Games, where I built analytics pipelines from scratch and used data visualization to drive product decisions.",
    userResearch: [
      "Dogfooding: Used the dashboard daily throughout my own 6-month body recomposition — every design decision came from hitting my own pain points as a real user",
      "Talked to members of Everfit Motion (our gym community) — most tracked nutrition in spreadsheets or not at all. The gap wasn't motivation, it was that existing tools (MyFitnessPal, Cronometer) don't connect nutrition to training load and body composition goals",
      "DEXA scan data was the most valuable and least accessible — everyone I talked to had scans but never looked at the results more than once because the PDFs are dense and clinical. Making that data visual and trackable over time was the breakthrough insight",
      "The #1 question from gym members was 'What should I eat to hit my goals?' — meal planning matched to specific macro targets and body recomposition phases was the killer feature they couldn't find anywhere else",
    ],
    failures: [
      "First version tried to auto-import data from 6 different sources including Apple Health and Garmin. The integration complexity was unsustainable — each API had different auth flows, rate limits, and data formats. Cut to 3 core sources (Strava, DEXA, COROS) that covered 90% of the value with 50% of the effort",
      "Built an elaborate meal logging UI with barcode scanning and food database search. Never used it — too much friction during a busy training day. Replaced it with a Claude-powered approach: describe what you ate in plain text, and AI extracts the macros. Logging time went from 5 minutes to 30 seconds",
      "Originally displayed all metrics on a single dashboard page. Information overload made it useless — I couldn't find what I needed quickly. Reorganized into focused views: Training, Nutrition, Body Composition, and a daily summary. Usage went from checking once a week to checking daily",
    ],
    strategy:
      "Target customer: People pursuing body recomposition — fat reduction and muscle increase — who track data across multiple devices and want actionable insights, not just more charts. Competitive landscape: Strava is social but not analytical. TrainingPeaks has deep analytics but no nutrition or body composition. MyFitnessPal tracks food but is disconnected from training. No product unifies all three. Product thesis: The value isn't in collecting data — it's in connecting data across sources to surface insights no single app can provide. The AI meal planner is the differentiator — nutrition matched to your specific body composition goals is the hardest problem to solve and the one most people give up on. Current status: Testing with Everfit Motion gym community after proving the system on myself with 6 months of results.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
