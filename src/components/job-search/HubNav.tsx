"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, FileText, MessageSquare, Search, LayoutDashboard, Compass, Target, ArrowUpRight } from "lucide-react";
import { FRIDAY_SEVEN_APP_URL } from "@/lib/job-search/plan-links";

const tabs = [
  // Strategy leads: it is the page that says whether the work on the dashboard
  // is the right work. `exact` on the dashboard keeps /strategy from lighting
  // both tabs.
  { href: "/dashboard/job-search/strategy", label: "Strategy", icon: Compass },
  { href: "/dashboard/job-search", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/job-search", label: "Overview", icon: Search, exact: true },
  { href: "/job-search/companies", label: "Companies", icon: Building2 },
  { href: "/job-search/network", label: "Network", icon: Users },
  { href: "/job-search/materials", label: "Materials", icon: FileText },
  { href: "/job-search/interviews", label: "Interviews", icon: MessageSquare },
];

/** The 100-Day Plan lives in its own app (hundred-days), so this tab leaves the site. */
const PLAN_URL = new URL(FRIDAY_SEVEN_APP_URL).origin;

export function HubNav() {
  const pathname = usePathname();

  function isActive(tab: (typeof tabs)[number]) {
    if (tab.exact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  }

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-400"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
      <a
        href={PLAN_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
      >
        <Target className="h-4 w-4" />
        100-Day Plan
        <ArrowUpRight className="h-3.5 w-3.5" aria-label="opens in a new tab" />
      </a>
    </nav>
  );
}
