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
  category: "software" | "design";
  liveUrl?: string;
  deliverables?: string[];
  repos?: { name: string; role: string }[];
  highlights: string[];
  outcomes: string[];
  decisions: string[];
  teamContext: string;
  userResearch: string[];
  failures: string[];
  strategy: string;
  screenshot?: string;
  screenshots?: string[];
  callout?: string;
  metrics?: { value: string; label: string }[];
  strategyPoints?: { label: string; text: string }[];
  features?: {
    title: string;
    description: string;
    screenshots: string[];
  }[];
};

export const projects: Project[] = [
  {
    slug: "pottery-friends",
    title: "Pottery Friends",
    subtitle: "Community Platform Ecosystem",
    screenshot:
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/feed.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/feed.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-post.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-filters.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-adjust.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-crop.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/video-edit.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-thread.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/forum.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/create-menu.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/glaze-library.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-date.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-location.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-guests.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-details.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-style.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/settings.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/privacy.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/notifications.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/welcome-members.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/comments.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/messages.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/landing-hero.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/landing-reviews.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/site-admin.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/email-management.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-weekly.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-retention.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-funnel.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-reach.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-retention-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-dau.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/admin-home.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/content-moderation.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/business-profile.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/change-role.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/manage-team.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/directory.png",
    ],
    liveUrl: "https://potteryfriends.com/",
    description:
      "Every pottery studio runs the same way: Venmo for billing, group texts for announcements, spreadsheets for everything else. After embedding at Red Ox Ceramics 6 days a week for a year — building relationships with staff and 150 members — I identified an unowned vertical: no one has built purpose-built software for craft studio communities. I built a 4-product ecosystem (native app, web platform, analytics dashboards, docs site) to prove the thesis.",
    pitch: "",
    problem:
      "The operations manager at Red Ox was spending 5+ hours per week on manual billing and member tracking. Members were missing 2-3 events per month because announcements got buried in group chat noise. And the social fabric that makes a studio special — sharing techniques, glaze results, inspiration — had no digital home. Generic tools like Mindbody were designed for gyms, not craft communities.",
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
    callout: "4-product ecosystem · 150 beta members · solo build",
    category: "software",
    repos: [
      { name: "red-ox-mobile", role: "Mobile app (iOS/Android)" },
      { name: "potteryfriends-web", role: "Marketing & web app" },
    ],
    metrics: [
      { value: "150", label: "Beta Members" },
      { value: "4", label: "Products Shipped" },
      { value: "59", label: "DB Migrations" },
      { value: "19", label: "Edge Functions" },
      { value: "35%", label: "Quest Completion" },
      { value: "2x", label: "Engagement After Redesign" },
    ],
    highlights: [],
    outcomes: [
      "150 beta members onboarded at Red Ox Ceramics with consistent weekly usage — validating that a purpose-built tool outperforms the Venmo + spreadsheet + group chat stack studios default to",
      "Gamification completion rates jumped from 5% to 35% after simplifying from 40 quests to 8 tied to real studio actions — proving that fewer, meaningful incentives beat volume",
      "Home screen redesign (feed-first → events-first) doubled member engagement — the data contradicted the original hypothesis, so I killed the feed-first design and rebuilt around what users actually did",
      "Solo-shipped a production 4-product ecosystem (59 DB migrations, 19 edge functions) in under 6 months — proving a PM with technical depth can go from user research to deployed product without a team",
    ],
    decisions: [
      "Started with a feed-first home screen — usage data showed members skipped it entirely and went straight to Events. Redesigned around upcoming events and quick actions. Engagement doubled.",
      "Split into 4 independent products (mobile, web, dashboards, docs) instead of a monolith — each serves a different persona (member, owner, admin) with its own release cycle. Result: I could ship dashboard improvements to studio owners without touching the member-facing app.",
      "Cut the planned marketplace after user interviews revealed studio owners saw it as competition with their own retail. Redirected effort into analytics dashboards — the feature they actually wanted to pay for.",
    ],
    teamContext: "",
    userResearch: [
      "Embedded in the studio 6 days/week for a year — observed every workflow, pain point, and workaround firsthand",
      "Ops manager demo'd her full workflow: Venmo billing, spreadsheet tracking, group texts, paper sign-ups — 5+ hrs/week on manual admin alone",
      "Members at retreats confirmed the same problems exist at every studio — no one has purpose-built software",
      "Top user request wasn't scheduling — it was 'What glaze should I try next?' Community inspiration was the killer feature, not logistics",
    ],
    failures: [],
    strategy: "",
    strategyPoints: [
      { label: "Target", text: "Independent pottery studios with 30–200 members — large enough to need tools, too small for enterprise software. No one owns this vertical." },
      { label: "Go-to-Market", text: "Lead with free analytics dashboards (the feature owners asked for most), then expand to the full platform once studios see engagement data." },
      { label: "Business Model", text: "Freemium studio subscriptions — free tier for events and messaging, paid for analytics, payments, gamification, and theming." },
      { label: "Vision", text: "Start with pottery, expand to woodworking, glassblowing, and other craft communities sharing the same studio model." },
    ],
    features: [
      {
        title: "Social Feed & Content Creation",
        description:
          "Instagram-style photo editing (filters, adjustments, cropping) and video support — potters are visual creators who want to showcase work without leaving the app.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/feed.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-post.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-filters.png",
        ],
      },
      {
        title: "Events & Workshops",
        description:
          "Missing events was the #1 complaint. 6-step creation flow lets owners publish a workshop in under 2 minutes. RSVP tracking replaced the paper sign-up sheets.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-detail.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-date.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-style.png",
        ],
      },
      {
        title: "Forums & Glaze Library",
        description:
          "Searchable home for tribal knowledge — glaze recipes, firing schedules, technique tips. Organized by topic because every studio conversation falls into the same natural categories.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/forum.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/glaze-library.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-thread.png",
        ],
      },
      {
        title: "Analytics Dashboards",
        description:
          "Weekly active members, activation funnels, and retention cohorts — the data studio owners need to understand engagement, not vanity metrics.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-weekly.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-funnel.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-dau.png",
        ],
      },
      {
        title: "Studio Owner Admin",
        description:
          "Separate admin experience with role-based access (Owner, Admin, Student, Guest), content moderation, member management, and custom theming — no code required.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/admin-home.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/manage-team.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/change-role.png",
        ],
      },
    ],
  },
  {
    slug: "swob",
    title: "Swob",
    subtitle: "Swipe-to-Hire Job Matching Platform",
    liveUrl: "https://www.swobapp.com/",
    screenshot:
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-hero-employer.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-hero-employer.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-org-management.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-job-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-manager-dashboard.png",
    ],
    description:
      "Swob is a consulting project where I serve as the product manager. I build prototypes and manage delivery for the team. The platform makes job hunting easy — candidates swipe through 8M+ active jobs and apply instantly to hourly gigs, full-time roles, or internships. On the employer side, a candidate pipeline tracks applicants from first contact to first shift, and a shift-swap system lets employees trade hours without manager bottlenecks. Each product is a standalone Next.js app sharing a Supabase backend. The sites and prototypes serve as living specifications for the engineering team.",
    pitch:
      "As a consulting PM on Swob, I'm responsible for building prototypes that serve as living specs and managing delivery across the product suite. Hiring in shift-based businesses is broken because the tools are built for office jobs. Swob reimagines the whole flow — candidates swipe right on jobs to apply instantly, and managers match with candidates in seconds. The candidate dashboard gives applicants a clean view of their applications and upcoming shifts. A pipeline tool tracks every applicant through customizable stages. And when someone can't make a shift, the swap system handles it peer-to-peer. I built 5 product prototypes because the problem isn't just hiring or just scheduling — it's the gap between them.",
    problem:
      "Job seekers applying for hourly roles are stuck using platforms built for salaried positions. Hiring takes weeks when it should take hours. Shift swaps require manager approval chains that cause no-shows. There's no unified system connecting who you hire to how you schedule them.",
    tags: ["SaaS", "Multi-Product", "Hiring", "Workflow"],
    stack: ["Next.js", "TypeScript", "TailwindCSS", "Supabase", "PostHog"],
    featured: true,
    callout: "5 apps, 1 backend · Hiring time from days to 2 minutes",
    category: "software",
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
      "Built the white-label system before finding customers — a deliberate bet on B2B2C distribution. In hindsight, early customers just wanted logo + brand color. Lesson: validate demand before building the premium version",
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
      "First version had a single monolithic app with all 5 features behind tabs. User testing showed managers were overwhelmed — they wanted to hire OR manage shifts, not both at once. Splitting into separate apps with focused UIs solved the cognitive overload problem. Takeaway: personas need separate products, not separate tabs.",
      "Built an AI-powered candidate ranking system that scored applicants on 12 factors. Managers ignored the scores completely — they said 'I just need to see if they're available Saturday night.' Replaced the ranking with a simple swipe interface filtered by availability. Usage tripled. Takeaway: the feature users want isn't always the feature you'd design from first principles.",
      "The white-label theming system (8 themes, 7 layouts) was built before talking to potential B2B partners. Early customers just wanted their logo and brand color — the rest was over-engineered. Takeaway: validate distribution thesis before building premium infrastructure.",
      "PostHog revealed a 3x drop-off at onboarding. The original flow asked for business details, team size, and scheduling preferences upfront. Reduced to just email + business name, then collected the rest progressively. Drop-off decreased significantly. Takeaway: every form field before the 'aha moment' is a reason to leave.",
    ],
    strategy:
      "Target customer: Independent restaurants, bars, and retail shops with 10-50 hourly employees — high turnover, always hiring, and managing schedules manually. Competitive landscape: Indeed and ZipRecruiter own job posting but stop at the hire. When I Work and Homebase own scheduling but don't touch hiring. No platform connects who you hire to how you schedule them. Go-to-market: Start with the swipe-to-match hiring tool as a free standalone product — it's the sharpest wedge and easiest to demo. Once a manager hires through Swob, upsell the scheduling and shift-swap tools. The candidate dashboard creates a two-sided network: candidates prefer Swob because they get transparency, which attracts more managers. Business model: Free hiring tool, paid scheduling suite. Per-location pricing for multi-unit operators. The white-label system enables B2B2C distribution through staffing agencies.",
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
    featured: false,
    callout: "100% lead attribution · Cross-platform web + mobile",
    category: "software",
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
    title: "Macro Chef",
    subtitle: "AI-Powered Fitness & Nutrition Analytics",
    screenshot:
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/landing-hero.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/landing-hero.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-engine.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/build-meal.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/mode-selection.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-plan-settings.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/pantry.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/shopping-list.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/progress.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/scan-summary.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/body-composition.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/strava-integration.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/data-sources.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/dexa-integration.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/food-preferences.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/preferred-proteins.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/health-goals.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/macro-targets.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/macro-targets-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/loading.png",
    ],
    liveUrl: "https://health.jonnymartin.blog/",
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
    callout: "4 data sources unified · AI meal plans in under 3 seconds",
    category: "software",
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
    features: [
      {
        title: "AI Meal Planning Engine",
        description:
          "Nutrition is where most recomposition programs fail — people know they need to hit their macros but don't know what to cook. The AI planner takes your exact macro targets, dietary restrictions, and available ingredients, then generates recipes that actually fit. Three modes (Quick Meal, Meal Prep, Pantry Raid) because users have different needs on Tuesday night vs. Sunday afternoon.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-engine.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/build-meal.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/mode-selection.png",
        ],
      },
      {
        title: "Meal Prep & Shopping",
        description:
          "Meal prep is the bridge between planning and execution. The planner lets you set meals per day, servings per recipe, and max prep time — then generates a full week of meals with a consolidated shopping list. Items are grouped by recipe so you know exactly why each ingredient is on the list.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-plan-settings.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/pantry.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/shopping-list.png",
        ],
      },
      {
        title: "Body Composition Tracking",
        description:
          "Most fitness apps track weight, but weight alone is misleading during recomposition — you can gain muscle and lose fat while the scale barely moves. The progress dashboard shows body fat percentage, lean mass gained, and fat lost separately. The scan summary calculates net recomposition and weekly fat loss rate so you can see if your nutrition strategy is actually working.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/progress.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/scan-summary.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/body-composition.png",
        ],
      },
      {
        title: "Data Source Integrations",
        description:
          "Fitness data lives in silos — Strava knows your cardio, MacroFactor knows your nutrition, BodySpec has your DEXA scans. I built integrations for all three so everything feeds into one dashboard. Strava syncs automatically via webhooks, MacroFactor imports via CSV, and DEXA scans are parsed directly from PDF. Zero manual entry after initial setup.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/strava-integration.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/data-sources.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/dexa-integration.png",
        ],
      },
      {
        title: "Personalization & Preferences",
        description:
          "Generic meal plans fail because everyone has different constraints. The preference system captures dietary restrictions, cuisine preferences, spice tolerance, preferred proteins, food dislikes, cooking skill, and health goals — all fed into the AI prompt so every recipe is personalized. Macro targets are fully editable so the app grows with your goals.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/food-preferences.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/health-goals.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/macro-targets.png",
        ],
      },
    ],
  },
  {
    slug: "krysta-mae-ceramics",
    title: "Krysta Mae Ceramics",
    subtitle: "Brand Identity & E-Commerce Website",
    category: "design",
    liveUrl: "https://krystamae.com",
    screenshot: "/screenshots/krysta-mae-home.png",
    description:
      "Complete brand identity and Squarespace e-commerce build for Krysta Mae, a ceramic artist creating handcrafted work inspired by travel, home, and California landscapes. I designed the logo, developed the brand system, built the website from scratch, shot all product and lifestyle photography, and wrote every line of copy. The site is organized around narrative-driven collections rather than traditional product filtering — storytelling as the architecture.",
    pitch:
      "Krysta had beautiful work but no cohesive visual system to present it. I wanted to create a brand universe that felt like an extension of her studio — quiet, intentional, and grounded. Instead of a typical e-commerce grid, I organized the shop around seasonal and mood-based collections with narrative intros. The goal was to make browsing feel like discovering, not shopping.",
    problem:
      "Krysta's ceramics spoke for themselves in person, but online she had no visual identity — no logo, no consistent photography, no brand voice. Her work needed a digital home that could convey the same warmth and tactile quality that makes handmade ceramics special.",
    tags: ["Branding", "E-Commerce", "Photography"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Logo",
      "Squarespace Website Build",
      "Product & Lifestyle Photography",
      "Copywriting & Brand Voice",
    ],
    highlights: [
      "Complete brand identity: logo, color palette, typography, and brand guidelines",
      "Narrative-driven e-commerce organized by seasonal collections rather than product categories",
      "Full product and lifestyle photography shoot — soft natural light highlighting ceramic textures and glaze details",
      "Custom copywriting in a poetic, story-led voice guiding discovery through each collection",
      "Mobile-first responsive design with custom CSS grid layouts",
      "Integrated e-commerce with streamlined checkout and inventory management",
    ],
    outcomes: [
      "Delivered a complete brand asset library usable across print, digital, and packaging",
      "Photography library spanning product shots, lifestyle imagery, and studio behind-the-scenes",
      "Narrative-organized shop enabling intuitive product discovery without traditional filtering",
      "Performant, accessible website functioning as both commerce platform and artistic portfolio",
    ],
    decisions: [
      "Organized shop by mood-based collections instead of product type — prioritized storytelling over conventional e-commerce to match how the artist thinks about her work",
      "Chose earth-tone palette with quiet neutral accents — the brand needed to support the ceramics, not compete with them",
      "Shot all photography in natural light to highlight ceramic textures and glaze details — studio lighting would have flattened the handmade quality",
      "Wrote all copy in a poetic voice rather than commercial tone — the audience values craft and intention over sales mechanics",
    ],
    teamContext:
      "Solo designer and creative director — I handled brand strategy, logo design, web development, art direction, photography, and copywriting. This was a full-scope engagement where I owned every creative decision from initial concept through final delivery.",
    userResearch: [
      "Spent time in Krysta's studio understanding her process, influences, and how she talks about her own work — the brand voice needed to sound like her, not like a marketing agency",
      "Studied how her existing customers discovered and purchased her work — most came through Instagram and studio shows, meaning the website needed to convert warm referrals, not cold traffic",
      "Analyzed competitor ceramic artist sites and found most defaulted to generic gallery templates — the opportunity was in creating something that felt as intentional as the work itself",
    ],
    failures: [
      "Initial logo concepts were too decorative — they competed with the ceramics in product photography. Simplified to a clean wordmark that recedes behind the work",
      "First site structure had separate pages per collection. Realized visitors wanted to browse across collections fluidly, not click through multiple pages. Consolidated to a scroll-based gallery approach",
    ],
    strategy:
      "The website needed to serve two audiences: existing followers from Instagram who wanted to purchase, and galleries or press who needed to evaluate the work at a glance. The narrative collection structure handles both — casual browsers get drawn into the story, while professionals can quickly scan the range and quality of work.",
  },
  {
    slug: "joan-pinto-ceramics",
    title: "Joan Pinto Ceramics",
    subtitle: "Website Migration & E-Commerce Redesign",
    category: "design",
    liveUrl: "https://www.joanpintoceramics.com",
    screenshot: "/screenshots/joan-pinto-home.png",
    description:
      "Migrated and rebuilt Joan Pinto's ceramic art website from Wix to Squarespace. Joan creates handbuilt ceramics — botanical studies, textured vessels, and sculptural wall pieces. The redesign introduced a gallery-like browsing experience with proper shop organization across five product categories, full SEO optimization, and a backend structure Joan could manage independently.",
    pitch:
      "Joan's Wix site was becoming limiting as her collection grew — the layout couldn't accommodate new categories, the shop was disorganized, and the overall feel didn't match the quality of her work. I rebuilt everything on Squarespace with a design philosophy centered on visual restraint: generous white space, soft tones, and minimal styling so the ceramics became the focal point. The layout rhythm was designed to encourage slow, contemplative browsing — like walking through a gallery.",
    problem:
      "Joan's existing Wix site was outgrowing her practice. Adding new products was cumbersome, the shop lacked proper categorization, and the site's generic template didn't reflect the intentional, handmade quality of her ceramics. She needed a platform she could manage herself without sacrificing design quality.",
    tags: ["E-Commerce", "Migration", "Design"],
    stack: ["Squarespace", "Custom CSS", "SEO"],
    featured: false,
    deliverables: [
      "Wix to Squarespace Migration",
      "Website Redesign & Build",
      "Shop Organization & Product Setup",
      "SEO Optimization",
    ],
    highlights: [
      "Full platform migration from Wix to Squarespace preserving brand continuity and existing content",
      "Shop organized into five curated categories: Plates, Bowls, Vases, Wall Pieces, and Sculptures",
      "Complete SEO setup: titles, descriptions, slugs, and alt text across every page and product",
      "Gallery-paced layout designed for contemplative browsing with generous whitespace",
      "Backend structured for easy self-service updates — Joan manages content independently",
      "Inventory tracking, pricing, and sold-out states configured across all products",
    ],
    outcomes: [
      "Seamless migration with zero content loss — fonts, layout patterns, and brand voice preserved",
      "Organized product catalog enabling collectors to browse by category for the first time",
      "Clean, readable URLs and complete SEO metadata improving search discoverability",
      "Self-manageable backend allowing Joan to add products and update content without developer help",
    ],
    decisions: [
      "Preserved the original site's brand feel during migration rather than starting fresh — continuity mattered more than novelty for her existing collector audience",
      "Chose photography-led design over decorative elements — Joan's natural light imagery was strong enough to carry the aesthetic without embellishment",
      "Simplified navigation to four core sections rather than exposing every category in the menu — reduced cognitive load for first-time visitors",
      "Configured sold-out states to keep items visible rather than hiding them — collectors want to see the full range even when pieces are unavailable",
    ],
    teamContext:
      "Solo designer handling the full migration: auditing the existing Wix site, mapping content to the new structure, designing the Squarespace build, configuring the shop and SEO, and training Joan on self-service management.",
    userResearch: [
      "Audited Joan's Wix site and cataloged every page, product, and content block to ensure nothing was lost in migration",
      "Joan described her ideal browsing experience as 'walking through a quiet gallery' — that became the design north star for spacing, pacing, and visual hierarchy",
      "Talked to several of her collectors who said they often revisited the site to check for new pieces — the new layout prioritized 'what's new' visibility",
    ],
    failures: [
      "Initially designed the homepage with a large hero video. Joan preferred a static, image-forward approach that loaded faster and felt more aligned with her quiet aesthetic. Replaced with a curated image grid",
      "First product page layout showed all details upfront — dimensions, materials, price, description. Collectors found it overwhelming. Streamlined to essentials with expandable sections for details",
    ],
    strategy:
      "Joan's website serves a specific audience: collectors and gallery visitors who already appreciate handmade ceramics. The design strategy prioritized artistic integrity over commercial pressure — no popups, no urgency tactics, no aggressive CTAs. The calm, gallery-like experience reflects the values of both the artist and her audience.",
  },
  {
    slug: "fergus-folan-ceramics",
    title: "Fergus Folan",
    subtitle: "Brand Identity & E-Commerce for Ceramic Guitar Slides",
    category: "design",
    liveUrl: "https://ceramicslides.com",
    screenshot: "/screenshots/ceramicslides-home.png",
    description:
      "Full brand identity and e-commerce website for Fergus Folan, a blues guitarist who handcrafts ceramic guitar slides. This project required building a brand that bridged two worlds — music and ceramics. I designed the logo, built the Wix e-commerce site, organized approximately 100 one-of-a-kind slides with individual product names and photography, and produced video content showing the craft process. The brand needed to speak to guitarists while honoring the artisanal quality of each piece.",
    pitch:
      "Fergus doesn't sell generic guitar accessories — each slide is a one-of-a-kind ceramic piece thrown on a wheel and finished with unique glazes. The brand needed to convey that these are handmade instruments, not factory products. I designed a custom monogram combining guitar headstock aesthetics with musical symbolism, established an earthy, music-forward visual system, and built a shop that could handle ~100 individually named products while keeping the browsing experience manageable.",
    problem:
      "Fergus had a growing collection of handmade ceramic guitar slides but no way to sell them online. Each piece is unique — different glazes, dimensions, and tonal qualities — so a traditional product grid wouldn't work. He needed a brand identity that positioned his slides as artisanal instruments, not cheap accessories, and an e-commerce experience that could showcase ~100 one-of-a-kind items.",
    tags: ["Branding", "E-Commerce", "Video"],
    stack: ["Wix", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Custom Monogram",
      "Wix E-Commerce Website",
      "Product Photography",
      "Video Production",
    ],
    highlights: [
      "Custom 'ff' monogram combining guitar headstock aesthetics with musical infinity symbolism",
      "E-commerce setup organizing ~100 one-of-a-kind slides with individual names, dimensions, and photography",
      "Professional product photography with consistent lighting across the full catalog",
      "Short-form video content showing the throwing and glazing process",
      "Category organization with sold-out state management for unique pieces",
      "Earthy, music-forward visual system inspired by ceramic glazes and blues culture",
    ],
    outcomes: [
      "Fully branded online store converting Fergus from word-of-mouth sales to a scalable e-commerce operation",
      "Complete product catalog with individual photography, naming, and descriptions for ~100 slides",
      "Video content library connecting customers to the craft process behind each piece",
      "Manageable backend system allowing Fergus to add new slides as he produces them",
    ],
    decisions: [
      "Built on Wix instead of Squarespace — Fergus needed a platform he could update himself, and Wix's product management UX was more intuitive for someone managing 100+ unique items",
      "Designed a custom monogram rather than a wordmark — the 'ff' symbol works at small sizes on packaging and product labels where a full logo wouldn't",
      "Invested in video content early — guitarists want to hear and see a slide before buying, so demonstration videos became the primary conversion driver",
      "Named each slide individually rather than using generic SKUs — treating each piece as named art reinforced the handmade positioning",
    ],
    teamContext:
      "Solo creative lead handling brand strategy, logo design, web development, art direction, product photography, and video production. This project required bridging two distinct communities — ceramic artists and blues musicians — into one coherent brand.",
    userResearch: [
      "Spent time with Fergus in his studio understanding the relationship between clay, glaze, and tonal quality — each slide sounds different based on its material and shape, which informed how I wrote product descriptions",
      "Researched the guitar slide market and found that most competitors sell mass-produced glass or metal slides — Fergus's handmade ceramic slides occupied a completely uncontested niche",
      "Talked to blues guitarists about how they shop for gear — they trust video demonstrations and word-of-mouth from other players over product descriptions",
    ],
    failures: [
      "First version of the shop displayed all ~100 slides in a single grid. Overwhelming. Added category organization by glaze type and size range, which matched how guitarists actually browse for tone",
      "Initially shot product photography on a white background. The slides looked generic and lost their handmade character. Switched to a warm, textured background that reinforced the craft aesthetic",
    ],
    strategy:
      "Fergus's audience is niche but passionate — blues and slide guitar players who care about tone and craftsmanship. The brand leans into authenticity over polish. The video content strategy was deliberate: a 30-second clip of someone playing a ceramic slide converts better than any product description. The e-commerce platform enables Fergus to scale beyond local sales and guitar shows to reach players worldwide.",
  },
  {
    slug: "wendy-friedman-ceramics",
    title: "Wendy Friedman Ceramics",
    subtitle: "Brand Identity & Portfolio Website",
    category: "design",
    liveUrl: "https://wendyfriedmanceramics.com",
    screenshot: "/screenshots/wendy-friedman-home.png",
    description:
      "Brand identity and Squarespace website for ceramic artist Wendy Friedman. Unlike the other ceramic artist projects, Wendy's site isn't a traditional e-commerce store — it's an inquiry-based experience where visitors browse the work and reach out directly for custom commissions. I designed the logo, built the site, shot all product photography, and crafted copy that reflected Wendy's quiet, intentional approach to hand-thrown ceramics.",
    pitch:
      "Wendy didn't want a shop — she wanted a digital extension of her studio. Every design element was chosen to echo her handmade practice: neutral palette, soft typography, generous whitespace. The site uses an inquiry-based flow instead of an add-to-cart model because Wendy's work is personal and she prefers conversation over transactions. The contact forms are warm and inviting, encouraging dialogue rather than orders.",
    problem:
      "Wendy needed an online presence that reflected the spirit of her hand-thrown ceramics without turning her practice into a transactional experience. Standard e-commerce templates felt wrong for work that's personal and process-driven. She needed a space that was simple, personal, and beautiful — a portrait of her practice, not a storefront.",
    tags: ["Branding", "Photography", "Design"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Logo",
      "Squarespace Website Build",
      "Product & Studio Photography",
      "Copywriting",
    ],
    highlights: [
      "Clean, grounded logo reflecting warmth and restraint — designed for print, digital, and packaging",
      "Inquiry-based shop flow replacing traditional e-commerce with warm contact forms encouraging personal conversation",
      "Custom studio photography emphasizing natural textures, glazes, and behind-the-scenes process",
      "Poetic copy reflecting Wendy's voice and rhythm throughout the site",
      "Mobile-optimized gallery layouts with calm, gallery-like browsing experience",
      "Three-section architecture — Work, Inquire, About — keeping navigation intentionally simple",
    ],
    outcomes: [
      "Complete visual identity system with logo, color palette, and brand guidelines",
      "Professional photo library of 13+ product images and studio portraits",
      "Conversion-friendly design supporting custom orders through inquiry rather than cart",
      "Authentic digital representation described as 'a portrait in digital form'",
    ],
    decisions: [
      "Chose inquiry-based flow over traditional e-commerce — Wendy's work is custom and personal, and she values the conversation that leads to a commission more than transactional efficiency",
      "Limited the site to three sections (Work, Inquire, About) instead of expanding with a blog or events page — restraint in navigation mirrors the restraint in her ceramics",
      "Shot portraits of Wendy at work alongside product photos — the artist and the process are inseparable from the work, and collectors want to know who made their piece",
      "Used neutral palette with generous whitespace throughout — the design recedes so the ceramics are always the focal point",
    ],
    teamContext:
      "Solo designer and creative director — brand strategy, logo design, web development, art direction, photography, and copywriting. This was a deeply collaborative engagement where every decision was grounded in understanding Wendy's artistic values and practice.",
    userResearch: [
      "Visited Wendy's studio multiple times to understand her process — the meditative quality of her throwing practice directly informed the calm, unhurried feel of the website",
      "Wendy described her ideal customer interaction as 'a conversation over tea, not a transaction at a register' — this framed the entire inquiry-based approach",
      "Studied how other ceramic artists with inquiry-based models presented their work — most buried the contact form, creating friction. I made inquiry the second most prominent section after the work itself",
    ],
    failures: [
      "First design draft had too many decorative elements — custom borders, textured backgrounds, illustrated accents. Wendy's feedback was that it felt 'busy.' Stripped it back to pure whitespace and typography, which was exactly right",
      "Initially organized the Work section chronologically. Wendy preferred to curate by mood and form rather than timeline. Reorganized to let her arrange pieces as she would arrange a gallery wall",
    ],
    strategy:
      "Wendy's website isn't trying to maximize sales — it's trying to attract the right customer. Someone who discovers her work online and takes the time to write a personal inquiry is exactly the type of collector she wants. The inquiry-based model acts as a natural filter: people who value handmade, personal objects self-select through the process.",
  },
  {
    slug: "nancy-takaichi",
    title: "Nancy Takaichi",
    subtitle: "Brand Identity & Portfolio for Plein Air Painter",
    category: "design",
    liveUrl: "https://www.nancytakaichi.com",
    screenshot: "/screenshots/nancy-takaichi-home.png",
    description:
      "Brand identity and Squarespace website for Nancy Takaichi, a plein air oil painter specializing in California landscapes, florals, and urban scenes. This was the only non-ceramics project in my design portfolio — Nancy paints outdoors, capturing light and place in oil. I organized her work into six thematic collections, designed a calm typographic brand system, shot environmental portraits of her painting outdoors, and built a site that functions as both a gallery and a commerce platform for collectors.",
    pitch:
      "Nancy's paintings are about light, pattern, and the specific feeling of a place — coastal fog, Sierra granite, the geometry of an urban street. The website needed to honor that sense of place by organizing work into thematic collections rather than a generic gallery. Each collection opens with a narrative introduction framing the emotional and visual essence of the work. The brand system is calm and elegant — soft whites and earthy tones that mirror her painted color range.",
    problem:
      "Nancy had a growing body of plein air work spanning years and multiple geographies but no organized way to present it. Her paintings were scattered across social media and local gallery shows. Collectors had no way to browse her full range, and galleries evaluating her work had to piece it together from fragmented sources.",
    tags: ["Branding", "Gallery", "Design"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Logo",
      "Squarespace Website Build",
      "Environmental Portrait Photography",
      "Collection Curation & Copywriting",
    ],
    highlights: [
      "Six thematic collections: Coastal, Country, Floral, The Sierras, Urban, and Still Life — plus a Sold Work archive",
      "Calm, elegant logo and typography system matching her refined plein air aesthetic",
      "Environmental portraits capturing Nancy painting outdoors in her natural setting",
      "Narrative collection introductions framing the emotional context of each body of work",
      "Clean grids with generous spacing designed for calm, gallery-like browsing",
      "Product pages with medium, size, and narrative context connecting buyers to individual pieces",
    ],
    outcomes: [
      "Refined visual identity amplifying her plein air methodology and artistic voice",
      "Discoverable, theme-based galleries making it easy for collectors to explore by interest",
      "Warm, storytelling approach elevating both art and artist beyond a simple portfolio",
      "Sustainable, maintainable site structure Nancy can update as she completes new work",
    ],
    decisions: [
      "Organized by theme (Coastal, Sierras, Urban) instead of chronology or medium — collectors browse by what resonates emotionally, not by when it was painted",
      "Kept sold work visible in a dedicated archive — it demonstrates range and provides social proof for new collectors, even when pieces are unavailable",
      "Shot environmental portraits of Nancy working outdoors rather than posed studio shots — her practice is defined by being in the landscape, and the photography needed to reflect that",
      "Used neutral palette with soft whites and earthy tones — the brand colors were derived from her paintings so the website feels like a natural extension of the work",
    ],
    teamContext:
      "Solo designer handling brand strategy, logo design, web development, art direction, environmental photography, and collection copywriting. This was my first project outside ceramics, applying the same design philosophy — restraint, storytelling, artist-centered decisions — to a different medium.",
    userResearch: [
      "Spent time with Nancy at a plein air painting session to understand her process — she sets up at a location and paints what she sees in a single session, which informed the 'sense of place' narrative throughout the site",
      "Nancy's existing audience came from local gallery shows and plein air painting events — the website needed to extend those in-person encounters, not replace them",
      "Talked to gallery owners who carry Nancy's work — they wanted a clean online portfolio they could share with collectors, confirming the need for a professional, curated presentation",
    ],
    failures: [
      "Initially designed the site with a single scrolling gallery of all paintings. With 50+ works it was overwhelming and offered no structure for discovery. The six thematic collections solved this by creating natural browsing paths",
      "First brand direction was too formal and gallery-corporate. Nancy's personality is warm and approachable. Softened the typography and added personal touches to the copy to match her voice",
    ],
    strategy:
      "Nancy's website serves three audiences: collectors who discover her at shows and want to see more, galleries evaluating her for representation, and fellow plein air painters who follow her work. The thematic collection structure serves all three — collectors browse by interest, galleries assess range and consistency, and fellow artists appreciate the dedication to specific subjects and locations.",
  },
  {
    slug: "anu-gandhi-ceramics",
    title: "Anu Gandhi Ceramics",
    subtitle: "E-Commerce Website for Handcrafted Pottery",
    category: "design",
    liveUrl: "https://www.anugandhiceramics.com",
    screenshot: "/screenshots/anu-gandhi-home.png",
    description:
      "Full e-commerce Squarespace website for Anu Gandhi, a ceramic artist based in Walnut Creek, California. Anu's pottery is inspired by the places she's lived — Kerala, North Carolina, and California — and the site needed to convey that sense of place and memory. I built a clean, minimalist storefront with a product shop, artist gallery, FAQ section, and newsletter integration, all designed around Anu's tagline: 'Pottery Inspired By The Places We Live And Love.'",
    pitch:
      "Anu's work carries stories from three very different places — Kerala, North Carolina, and California. The website needed to feel like a bridge between those worlds. I built a Squarespace site that leads with storytelling: the homepage introduces Anu and her influences before showing a single product. The shop is clean and functional, but the real design work was in the pacing — making sure visitors understood the 'why' behind the pottery before they saw the 'what.'",
    problem:
      "Anu had a growing body of ceramic work and an active local following but no online presence to reach customers beyond markets and studio shows. She needed an e-commerce site that could handle shipping, inventory, and payments while still feeling personal and handmade — not like a generic online store.",
    tags: ["E-Commerce", "Design", "Branding"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Squarespace E-Commerce Website",
      "Shop Setup & Product Configuration",
      "Brand Styling & Visual Direction",
      "Newsletter Integration",
    ],
    highlights: [
      "Storytelling-first homepage introducing the artist's background and influences before showcasing products",
      "Full e-commerce setup with product catalog, shopping cart, and shipping configuration",
      "Free shipping promotion system with discount code integration (SHIP100 for orders over $100)",
      "Clean, minimalist design with generous whitespace and grid-based responsive layouts",
      "Newsletter signup integration for ongoing customer engagement",
      "Wave and jagged decorative highlights on key headings adding handmade personality to the typography",
    ],
    outcomes: [
      "Fully operational e-commerce site enabling Anu to sell pottery beyond local markets for the first time",
      "Shipping, returns, and payment policies professionally configured and clearly communicated",
      "Mobile-responsive design ensuring a smooth browsing and purchasing experience across devices",
      "Self-manageable platform allowing Anu to add new products and update inventory independently",
    ],
    decisions: [
      "Led with the artist's story on the homepage instead of products — Anu's pottery is deeply personal, and customers who understand the inspiration behind the work become loyal repeat buyers",
      "Added decorative wave elements to headings — a subtle visual nod to the handmade nature of the work that breaks the rigidity of a typical grid layout",
      "Configured a free shipping threshold ($100) rather than flat-rate free shipping — encourages larger orders while keeping margins sustainable for a solo artist",
      "Kept the navigation simple: Shop, About, Gallery, FAQs, Contact — every page earns its place, no filler sections",
    ],
    teamContext:
      "Solo designer and developer — built the complete Squarespace site from scratch, configured the e-commerce backend, established the visual direction, and set up all shipping and payment policies. Anu and I are connected through the pottery studio community.",
    userResearch: [
      "Anu described her ideal customer as someone who 'treasures handmade objects and wants to know the story behind them' — this framed the storytelling-first approach to the homepage",
      "Observed that Anu's strongest sales channel was in-person markets where she could tell her story — the website needed to replicate that personal connection digitally",
      "Reviewed other ceramic artist e-commerce sites and found that most jumped straight to products — leading with the artist's story and sense of place was a clear differentiator",
    ],
    failures: [
      "First homepage design was product-forward with a grid of ceramics above the fold. Felt impersonal and interchangeable with any pottery site. Restructured to lead with Anu's story and influences, with products introduced further down the page",
      "Initially set up the shop with detailed pottery-specific categorization (by technique, clay type, firing method). Anu's customers don't shop that way — they browse by what looks beautiful. Simplified to a visual browsing experience",
    ],
    strategy:
      "Anu's ceramics business is built on personal connection — people buy because they know her story and feel connected to the places that inspire her work. The website extends that personal brand from markets and studio shows to an always-available online storefront. The free shipping threshold encourages larger orders while the newsletter captures visitors who aren't ready to buy yet but want to stay connected.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getDesignProjects(): Project[] {
  return projects.filter((p) => p.category === "design");
}
