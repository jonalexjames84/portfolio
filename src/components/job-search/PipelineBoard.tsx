"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

type PipelineEntry = {
  id: string;
  company: string;
  role: string;
  status: string;
  applied_date: string | null;
  last_update: string;
  notes: string | null;
  job_url: string | null;
  fit_score: number | null;
};

const columns = [
  { key: "saved", label: "Saved", color: "border-violet-400 dark:border-violet-600", bg: "bg-violet-50 dark:bg-violet-900/10", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { key: "applied", label: "Applied", color: "border-blue-400 dark:border-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { key: "screen", label: "Screen", color: "border-amber-400 dark:border-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { key: "interview", label: "Interview", color: "border-emerald-400 dark:border-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { key: "offer", label: "Offer", color: "border-pink-400 dark:border-pink-600", bg: "bg-pink-50 dark:bg-pink-900/10", badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
] as const;

const archiveColumns = ["rejected", "passed"] as const;

function FitBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
      : score >= 60
        ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
        : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";

  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{score}</span>;
}

function EntryCard({
  entry,
  onStatusChange,
  updating,
}: {
  entry: PipelineEntry;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
}) {
  const daysSince = entry.last_update
    ? Math.floor((Date.now() - new Date(entry.last_update + "T00:00:00").getTime()) / 86400000)
    : null;

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${updating ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {entry.company}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {entry.role}
          </p>
        </div>
        {entry.fit_score != null && <FitBadge score={entry.fit_score} />}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {entry.job_url && (
            <a
              href={entry.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600"
              title="View posting"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {daysSince !== null && daysSince > 0 && (
            <span className={`text-[10px] ${daysSince > 7 ? "text-amber-500" : "text-zinc-400"}`}>
              {daysSince}d ago
            </span>
          )}
        </div>
        <select
          value={entry.status}
          onChange={(e) => onStatusChange(entry.id, e.target.value)}
          className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 border-0 rounded px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400 cursor-pointer"
        >
          {columns.map((col) => (
            <option key={col.key} value={col.key}>{col.label}</option>
          ))}
          <option value="rejected">Rejected</option>
          <option value="passed">Passed</option>
        </select>
      </div>
    </div>
  );
}

export function PipelineBoard({ entries: initial }: { entries: PipelineEntry[] }) {
  const [entries, setEntries] = useState(initial);
  const [showArchive, setShowArchive] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const archived = entries.filter((e) => archiveColumns.includes(e.status as typeof archiveColumns[number]));

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdating(id);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: newStatus, last_update: new Date().toISOString().split("T")[0] } : e
      )
    );

    try {
      const res = await fetch(`/api/job-search/pipeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) setEntries(initial);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pipeline</h2>
        {archived.length > 0 && (
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {showArchive ? "Hide" : "Show"} archived ({archived.length})
          </button>
        )}
      </div>

      {/* Board */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => {
          const colEntries = entries.filter((e) => e.status === col.key);
          return (
            <div key={col.key} className="flex-shrink-0 w-48">
              {/* Column header */}
              <div className={`border-t-2 ${col.color} rounded-t-lg`}>
                <div className={`${col.bg} px-3 py-2 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{col.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}>
                      {colEntries.length}
                    </span>
                  </div>
                </div>
              </div>
              {/* Cards */}
              <div className="space-y-2 mt-2 min-h-[60px]">
                {colEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onStatusChange={handleStatusChange}
                    updating={updating === entry.id}
                  />
                ))}
                {colEntries.length === 0 && (
                  <div className="text-center py-4 text-zinc-300 dark:text-zinc-700 text-xs">
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Archive */}
      {showArchive && archived.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs font-medium text-zinc-400 mb-2">Archived</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {archived.map((entry) => (
              <div
                key={entry.id}
                className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 opacity-60"
              >
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{entry.company}</p>
                <p className="text-[10px] text-zinc-400 truncate">{entry.role}</p>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                  entry.status === "rejected"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
