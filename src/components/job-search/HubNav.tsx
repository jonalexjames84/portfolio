"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Users, FileText, MessageSquare, Search } from "lucide-react";

const tabs = [
  { href: "/job-search", label: "Overview", icon: Search, exact: true },
  { href: "/job-search/companies", label: "Companies", icon: Building2 },
  { href: "/job-search/network", label: "Network", icon: Users },
  { href: "/job-search/materials", label: "Materials", icon: FileText },
  { href: "/job-search/interviews", label: "Interviews", icon: MessageSquare },
];

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
    </nav>
  );
}
