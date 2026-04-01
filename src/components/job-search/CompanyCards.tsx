"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { EnrichedCompany, PipelineEntry, ConnectionEntry } from "@/app/job-search/companies/page";
import { CompanyCardExpanded } from "./CompanyCardExpanded";

const statusStyles: Record<string, string> = {
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  screen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  interview: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offer: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  passed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const outreachColors: Record<string, string> = {
  identified: "bg-zinc-400",
  contacted: "bg-blue-500",
  followed_up: "bg-indigo-500",
  responded: "bg-green-500",
  referral_requested: "bg-amber-500",
  referral_received: "bg-emerald-500",
};

function bestOutreachStage(connections: ConnectionEntry[]): string | null {
  const order = ["referral_received", "referral_requested", "responded", "followed_up", "contacted", "identified"];
  for (const stage of order) {
    if (connections.some((c) => c.outreach_stage === stage)) return stage;
  }
  return null;
}

function FitScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
      : score >= 60
        ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
        : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

export function CompanyCards({ companies: initial }: { companies: EnrichedCompany[] }) {
  const [companies, setCompanies] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rank");

  const filtered = companies.filter((c) => {
    if (filter === "all") return true;
    if (filter === "active") return c.pipeline && !["rejected", "passed"].includes(c.pipeline.status);
    return c.pipeline?.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "updated_at") return (b.updated_at || "").localeCompare(a.updated_at || "");
    if (sortBy === "fit_score") return (b.pipeline?.fit_score || 0) - (a.pipeline?.fit_score || 0);
    return (a.rank || 999) - (b.rank || 999);
  });

  async function handleUpdatePipeline(pipelineId: string, updates: Partial<PipelineEntry>) {
    setCompanies((prev) =>
      prev.map((c) =>
        c.pipeline?.id === pipelineId
          ? { ...c, pipeline: { ...c.pipeline!, ...updates } }
          : c
      )
    );

    const res = await fetch(`/api/job-search/pipeline/${pipelineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      setCompanies(initial);
    }
  }

  async function handleUpdateConnection(connectionId: string, updates: Partial<ConnectionEntry>) {
    setCompanies((prev) =>
      prev.map((c) => ({
        ...c,
        connections: c.connections.map((conn) =>
          conn.id === connectionId ? { ...conn, ...updates } : conn
        ),
      }))
    );

    const res = await fetch(`/api/job-search/connections/${connectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      setCompanies(initial);
    }
  }

  async function handleUpdateCompany(companyId: string, updates: { notes?: string; rank?: number; hiring_status?: string }) {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, ...updates } : c
      )
    );

    const res = await fetch(`/api/job-search/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      setCompanies(initial);
    }
  }

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "saved", label: "Saved" },
    { key: "applied", label: "Applied" },
    { key: "screen", label: "Screen" },
    { key: "interview", label: "Interview" },
  ];

  return (
    <div>
      {/* Filters and sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 overflow-x-auto">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filter === f.key
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg px-3 py-1.5 text-zinc-600 dark:text-zinc-400"
        >
          <option value="rank">Sort by Rank</option>
          <option value="name">Sort by Name</option>
          <option value="updated_at">Last Updated</option>
          <option value="fit_score">Fit Score</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {sorted.map((company) => {
          const isExpanded = expandedId === company.id;
          const outreachStage = bestOutreachStage(company.connections);

          return (
            <div
              key={company.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded
                  ? "border-accent-500 dark:border-accent-600 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Collapsed row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
              >
                <span className="text-xs font-mono text-zinc-400 w-6 text-right shrink-0">
                  {company.rank || "\u2014"}
                </span>
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {company.name}
                  </span>
                  {company.stage && (
                    <span className="text-xs text-zinc-400 ml-2">{company.stage}</span>
                  )}
                </div>
                {company.pipeline && (
                  <>
                    <span className="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">
                      {company.pipeline.role}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[company.pipeline.status] || statusStyles.applied}`}>
                      {company.pipeline.status}
                    </span>
                  </>
                )}
                {outreachStage && (
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${outreachColors[outreachStage] || "bg-zinc-400"}`} title={`Outreach: ${outreachStage}`} />
                )}
                {company.pipeline?.fit_score != null && (
                  <FitScoreBadge score={company.pipeline.fit_score} />
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <CompanyCardExpanded
                  company={company}
                  onUpdatePipeline={handleUpdatePipeline}
                  onUpdateConnection={handleUpdateConnection}
                  onUpdateCompany={handleUpdateCompany}
                />
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg font-medium">No target companies yet</p>
          <p className="text-sm mt-1">
            Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/company-research generate target list</code> in Claude Code
          </p>
        </div>
      )}
    </div>
  );
}
