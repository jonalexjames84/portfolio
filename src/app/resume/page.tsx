import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Resume",
  description: "Jonny Martin's resume — Product Manager & Builder.",
};

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Resume
        </h1>
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
            Product manager with a unique builder background. I don&apos;t just
            manage products — I design, build, and ship them. Experienced
            across the full product lifecycle from concept to deployed
            application, with a portfolio of live web and mobile products.
          </p>
        </section>

        {/* Products Shipped */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Products Shipped
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Pottery Friends — Community Platform
                </h3>
                <span className="text-sm text-zinc-500">Founder / PM / Dev</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                4-product ecosystem: mobile app (React Native), web platform, analytics dashboards, and documentation site. Stripe payments, PostHog analytics, Sentry monitoring.
              </p>
            </div>
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  SWOB — Shift Management & Hiring
                </h3>
                <span className="text-sm text-zinc-500">Founder / PM / Dev</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                5-product platform: core app, candidate dashboard, pipeline management, shift-swap system, and marketing site. Supabase backend, PostHog analytics.
              </p>
            </div>
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  1406 Adventures — Luxury Travel Platform
                </h3>
                <span className="text-sm text-zinc-500">Founder / PM / Dev</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Cross-platform luxury travel agency: responsive web app and native mobile app. Referral tracking system, agent partner network, and lead capture funnel.
              </p>
            </div>
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Health Dashboard — AI Fitness Analytics
                </h3>
                <span className="text-sm text-zinc-500">Founder / PM / Dev</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Personal health analytics aggregating DEXA, Strava, COROS, and nutrition data. AI-powered meal suggestions via Claude, training load analysis, and body composition tracking.
              </p>
            </div>
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
                Product Strategy, User Research, Roadmapping, PRDs, A/B Testing, Analytics, Go-to-Market
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Technical
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                React, Next.js, React Native, TypeScript, Supabase, PostgreSQL, Stripe, TailwindCSS, Vercel
              </p>
            </div>
          </div>
        </section>

        {/* Placeholder for more resume content */}
        <section className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add your full work history, education, and other details here.
            <br />
            Drop a resume.pdf in the /public folder for the download button.
          </p>
        </section>
      </div>
    </div>
  );
}
