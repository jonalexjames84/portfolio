"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Pencil, Check, X } from "lucide-react";

type Company = {
  id: string;
  rank: number | null;
  name: string;
  stage: string | null;
  industry: string | null;
  product_focus: string | null;
  hiring_status: string | null;
  recent_news: string | null;
  connections_count: number;
  notes: string | null;
  updated_at: string;
};

const hiringStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  unknown: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  frozen: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function CompaniesTable({ companies: initial }: { companies: Company[] }) {
  const [companies, setCompanies] = useState(initial);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Company>>({});
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rank");

  const filtered = companies.filter((c) => {
    if (filter === "all") return true;
    return c.hiring_status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    if (sortBy === "updated_at") return (b.updated_at || "").localeCompare(a.updated_at || "");
    return (a.rank || 999) - (b.rank || 999);
  });

  async function saveEdit(id: string) {
    const res = await fetch(`/api/job-search/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editValues),
    });
    if (res.ok) {
      const updated = await res.json();
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    }
    setEditingId(null);
    setEditValues({});
  }

  return (
    <div>
      {/* Filters and sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["all", "active", "unknown", "frozen"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                filter === f
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
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
        </select>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {sorted.map((company) => {
          const isExpanded = expandedId === company.id;
          const isEditing = editingId === company.id;

          return (
            <div
              key={company.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isExpanded
                  ? "border-accent-500 dark:border-accent-600 shadow-md"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              {/* Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
              >
                <span className="text-xs font-mono text-zinc-400 w-6 text-right shrink-0">
                  {company.rank || "—"}
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
                {company.industry && (
                  <span className="hidden sm:inline text-xs text-zinc-400">{company.industry}</span>
                )}
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${hiringStyles[company.hiring_status || "unknown"]}`}>
                  {company.hiring_status || "unknown"}
                </span>
                {company.connections_count > 0 && (
                  <span className="text-xs text-zinc-400">{company.connections_count} conn</span>
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Rank</label>
                          <input
                            type="number"
                            value={editValues.rank ?? company.rank ?? ""}
                            onChange={(e) => setEditValues({ ...editValues, rank: parseInt(e.target.value) || null })}
                            className="w-full mt-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Hiring Status</label>
                          <select
                            value={editValues.hiring_status ?? company.hiring_status ?? "unknown"}
                            onChange={(e) => setEditValues({ ...editValues, hiring_status: e.target.value })}
                            className="w-full mt-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5"
                          >
                            <option value="active">Active</option>
                            <option value="unknown">Unknown</option>
                            <option value="frozen">Frozen</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">Notes</label>
                        <textarea
                          value={editValues.notes ?? company.notes ?? ""}
                          onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                          rows={3}
                          className="w-full mt-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(company.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-white hover:bg-teal-600">
                          <Check className="h-3.5 w-3.5" /> Save
                        </button>
                        <button onClick={() => { setEditingId(null); setEditValues({}); }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {company.product_focus && (
                        <div>
                          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Product Focus</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300">{company.product_focus}</div>
                        </div>
                      )}
                      {company.recent_news && (
                        <div>
                          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Recent News</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300">{company.recent_news}</div>
                        </div>
                      )}
                      {company.notes && (
                        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Notes</div>
                          <div className="text-sm text-zinc-700 dark:text-zinc-300">{company.notes}</div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(company.id); setEditValues({}); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <a
                          href={`/job-search/intel/${company.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Intel
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg font-medium">No target companies yet</p>
          <p className="text-sm mt-1">Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/company-research generate target list</code> in Claude Code</p>
        </div>
      )}
    </div>
  );
}
