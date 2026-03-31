"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

type PipelineEntry = {
  id: string;
  company: string;
  role: string;
  status: string;
  applied_date: string | null;
  last_update: string;
  notes: string | null;
};

const statusOptions = ["applied", "screen", "interview", "offer", "rejected", "passed"];

const statusStyles: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  screen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  interview: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offer: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  passed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export function PipelineBacklog({ entries: initialEntries }: { entries: PipelineEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [filter, setFilter] = useState<string>("active");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = entries.filter((e) => {
    if (filter === "active") return !["rejected", "passed"].includes(e.status);
    if (filter === "all") return true;
    return e.status === filter;
  });

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/job-search/pipeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: newStatus, last_update: new Date().toISOString().split("T")[0] } : e
          )
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  const counts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Pipeline ({filtered.length})
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300"
        >
          <option value="active">Active ({(counts.applied || 0) + (counts.screen || 0) + (counts.interview || 0) + (counts.offer || 0)})</option>
          <option value="all">All ({entries.length})</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {entry.company}
                </span>
                <span className="text-xs text-zinc-400 truncate">
                  {entry.role}
                </span>
              </div>
              {entry.applied_date && (
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Applied {new Date(entry.applied_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>

            <div className="relative shrink-0">
              <select
                value={entry.status}
                onChange={(e) => updateStatus(entry.id, e.target.value)}
                disabled={updating === entry.id}
                className={`appearance-none text-[11px] font-medium pl-2.5 pr-6 py-1 rounded-full border-0 cursor-pointer ${statusStyles[entry.status] || statusStyles.applied} ${updating === entry.id ? "opacity-50" : ""}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-current opacity-60" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-zinc-400 text-sm">
          No entries match this filter
        </div>
      )}
    </div>
  );
}
