export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  stack: string[];
  featured: boolean;
  repos: { name: string; role: string }[];
  highlights: string[];
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
      "A full product ecosystem for the pottery community — mobile app, web platform, analytics dashboards, and documentation site. Built to connect makers, manage events, and process payments across every surface.",
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
      "4-product ecosystem across mobile, web, dashboards, and docs",
      "Stripe payment processing for events and memberships",
      "PostHog analytics pipeline and Sentry error monitoring",
      "Native mobile features: camera, video, location, calendar",
    ],
  },
  {
    slug: "swob",
    title: "SWOB",
    subtitle: "Shift Management & Hiring Platform",
    screenshot: "/screenshots/swob-home.png",
    description:
      "A multi-product platform rethinking how shift-based businesses manage hiring and scheduling. Designed a candidate pipeline, shift-swap mechanism, and marketing funnel as interconnected products.",
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
      "5 interconnected products serving different user personas",
      "Candidate pipeline with multi-stage tracking",
      "Shift-swap system for real-time schedule management",
      "Full marketing funnel with analytics",
    ],
  },
  {
    slug: "1406-adventures",
    title: "1406 Adventures",
    subtitle: "Luxury Travel Agency Platform",
    screenshot: "/screenshots/1406-home.png",
    description:
      "A cross-platform luxury travel agency experience — responsive web and native mobile app for a high-touch, referral-driven travel planning service. Built a referral tracking system, agent partner network, and lead capture funnel for a business serving 10-12 exclusive clients per year.",
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
      "URL-based referral tracking system with agent partner registry",
      "Cross-platform web + native mobile with consistent brand experience",
      "Lead capture funnel with referral attribution and inquiry routing",
      "Multiple layout variants tested for conversion optimization",
    ],
  },
  {
    slug: "health-dashboard",
    title: "Health Dashboard",
    subtitle: "AI-Powered Fitness & Nutrition Analytics",
    screenshot: "/screenshots/health-home.png",
    screenshots: ["/screenshots/health-home.png", "/screenshots/health-meals.png"],
    description:
      "A comprehensive personal health analytics platform that aggregates data from DEXA scans, Strava, COROS fitness devices, and nutrition logs. Features AI-powered meal suggestions via Claude, training load analysis, body composition tracking, and recovery metrics — all in one dashboard.",
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
      "AI meal suggestions and recipe generation powered by Claude",
      "Multi-source data aggregation: Strava, DEXA scans, COROS devices, nutrition logs",
      "Training load analysis with ACWR, monotony, and polarization scoring",
      "Body composition tracking with regional fat analysis and muscle balance",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
