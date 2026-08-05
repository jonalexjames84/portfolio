export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Building2, Users, FileText, MessageSquare } from "lucide-react";
import { localDateStr } from "@/lib/job-search/dates";

async function getStats() {
  const [companies, connections, materials, interviews] = await Promise.all([
    supabase.from("job_target_companies").select("id", { count: "exact", head: true }),
    supabase.from("job_connections").select("id", { count: "exact", head: true }),
    supabase.from("job_materials").select("id", { count: "exact", head: true }),
    supabase.from("job_interviews").select("id", { count: "exact", head: true }).gte("date", localDateStr(new Date())),
  ]);

  return {
    companies: companies.count || 0,
    connections: connections.count || 0,
    materials: materials.count || 0,
    upcomingInterviews: interviews.count || 0,
  };
}

export default async function JobSearchOverview() {
  const stats = await getStats();

  const cards = [
    { label: "Target Companies", value: stats.companies, href: "/job-search/companies", icon: Building2, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Connections", value: stats.connections, href: "/job-search/network", icon: Users, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Materials", value: stats.materials, href: "/job-search/materials", icon: FileText, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Upcoming Interviews", value: stats.upcomingInterviews, href: "/job-search/interviews", icon: MessageSquare, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${card.bg} mb-3`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{card.label}</div>
        </Link>
      ))}
    </div>
  );
}
