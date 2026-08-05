"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import { localDateStr } from "@/lib/job-search/dates";
import { CHANNELS, CHANNEL_LABELS, type Channel } from "@/lib/job-search/types";

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
  channel: Channel | null;
};

type Subtask = {
  id: string;
  pipeline_entry_id: string;
  phase: string;
  task_key: string;
  label: string;
  skill_command: string | null;
  done: boolean;
  sort_order: number;
};

const columns = [
  { key: "saved", label: "Saved", color: "border-violet-400 dark:border-violet-600", bg: "bg-violet-50 dark:bg-violet-900/10", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { key: "applied", label: "Applied", color: "border-blue-400 dark:border-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { key: "screen", label: "Screen", color: "border-amber-400 dark:border-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { key: "interview", label: "Interview", color: "border-emerald-400 dark:border-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { key: "offer", label: "Offer", color: "border-pink-400 dark:border-pink-600", bg: "bg-pink-50 dark:bg-pink-900/10", badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
] as const;

const archiveColumns = ["rejected", "passed"] as const;

// Which subtask phases are visible for each pipeline status
const phaseVisibility: Record<string, string[]> = {
  saved: ["saved"],
  applied: ["saved", "applied"],
  screen: ["saved", "applied", "screen"],
  interview: ["saved", "applied", "screen", "interview"],
  offer: ["saved", "applied", "screen", "interview", "offer"],
};

const phaseLabels: Record<string, string> = {
  saved: "Evaluate & Prepare",
  applied: "Follow Up",
  screen: "Interview Prep",
  interview: "Post-Interview",
  offer: "Negotiate",
};

function FitBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
      : score >= 60
        ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
        : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";

  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{score}</span>;
}

function SubtaskItem({
  subtask,
  active,
  onToggle,
}: {
  subtask: Subtask;
  active: boolean;
  onToggle: (id: string, done: boolean) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (active) onToggle(subtask.id, !subtask.done);
      }}
      disabled={!active}
      className={`flex items-center gap-1.5 w-full text-left ${!active ? "opacity-30 cursor-default" : "cursor-pointer"}`}
    >
      {subtask.done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
      ) : (
        <Circle className={`h-3.5 w-3.5 shrink-0 ${active ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-200 dark:text-zinc-700"}`} />
      )}
      <span className={`text-[11px] leading-tight ${subtask.done ? "line-through text-zinc-400" : active ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"}`}>
        {subtask.label}
      </span>
      {subtask.skill_command && active && !subtask.done && (
        <code className="text-[9px] text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded ml-auto shrink-0">
          {subtask.skill_command}
        </code>
      )}
    </button>
  );
}

function EntryCard({
  entry,
  subtasks,
  onStatusChange,
  onChannelChange,
  onToggleSubtask,
  updating,
}: {
  entry: PipelineEntry;
  subtasks: Subtask[];
  onStatusChange: (id: string, status: string) => void;
  onChannelChange: (id: string, channel: string) => void;
  onToggleSubtask: (id: string, done: boolean) => void;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const daysSince = entry.last_update
    ? Math.floor((Date.now() - new Date(entry.last_update + "T00:00:00").getTime()) / 86400000)
    : null;

  // Get subtasks for current phase (active) and count progress
  const visiblePhases = phaseVisibility[entry.status] || ["saved"];
  const currentPhase = entry.status;
  const activeSubtasks = subtasks.filter((s) => s.phase === currentPhase);
  const completedActive = activeSubtasks.filter((s) => s.done).length;
  const totalActive = activeSubtasks.length;

  // All prior phases' subtasks (already completed phases)
  const priorSubtasks = subtasks.filter((s) => visiblePhases.includes(s.phase) && s.phase !== currentPhase);

  // Future phases (locked)
  const futureSubtasks = subtasks.filter((s) => !visiblePhases.includes(s.phase));

  // Group by phase for display
  const subtasksByPhase = new Map<string, Subtask[]>();
  for (const st of subtasks) {
    const list = subtasksByPhase.get(st.phase) || [];
    list.push(st);
    subtasksByPhase.set(st.phase, list);
  }

  const allPhaseKeys = ["saved", "applied", "screen", "interview", "offer"];

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-shadow ${updating ? "opacity-50" : ""}`}>
      {/* Card header */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {entry.company}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              {entry.role}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {entry.fit_score != null && <FitBadge score={entry.fit_score} />}
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            )}
          </div>
        </div>

        {/* Progress bar + meta row */}
        <div className="mt-2 space-y-1.5">
          {totalActive > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${(completedActive / totalActive) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 shrink-0">
                {completedActive}/{totalActive}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {entry.job_url && (
                <a
                  href={entry.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                  title="View posting"
                  onClick={(e) => e.stopPropagation()}
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
              onChange={(e) => { e.stopPropagation(); onStatusChange(entry.id, e.target.value); }}
              onClick={(e) => e.stopPropagation()}
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
      </div>

      {/* Expanded subtasks */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-100 dark:border-zinc-800 pt-2 space-y-3">
          {/* Attribution. Unattributed rows are excluded from every channel
              rate, so an unset value is a real gap in the report, not cosmetic. */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wide text-zinc-400">
              Channel
            </span>
            <select
              value={entry.channel ?? ""}
              onChange={(e) => {
                e.stopPropagation();
                onChannelChange(entry.id, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className={`text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 border-0 rounded px-1.5 py-0.5 cursor-pointer ${
                entry.channel
                  ? "text-zinc-500 dark:text-zinc-400"
                  : "text-amber-600 dark:text-amber-500"
              }`}
            >
              <option value="">Unattributed</option>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {allPhaseKeys.map((phaseKey) => {
            const phaseTasks = subtasksByPhase.get(phaseKey);
            if (!phaseTasks || phaseTasks.length === 0) return null;

            const isActive = phaseKey === currentPhase;
            const isCompleted = visiblePhases.includes(phaseKey) && phaseKey !== currentPhase;
            const isLocked = !visiblePhases.includes(phaseKey);

            const phaseComplete = phaseTasks.filter((s) => s.done).length;
            const phaseTotal = phaseTasks.length;

            return (
              <div key={phaseKey}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isActive
                      ? "text-teal-600 dark:text-teal-400"
                      : isCompleted
                        ? "text-zinc-400"
                        : "text-zinc-300 dark:text-zinc-700"
                  }`}>
                    {phaseLabels[phaseKey] || phaseKey}
                  </span>
                  {isActive && (
                    <span className="text-[9px] text-teal-500 font-medium">(current)</span>
                  )}
                  {isLocked && (
                    <span className="text-[9px] text-zinc-300 dark:text-zinc-700">locked</span>
                  )}
                  {isCompleted && phaseComplete < phaseTotal && (
                    <span className="text-[9px] text-amber-500">{phaseComplete}/{phaseTotal}</span>
                  )}
                </div>
                <div className="space-y-1 ml-0.5">
                  {phaseTasks.map((st) => (
                    <SubtaskItem
                      key={st.id}
                      subtask={st}
                      active={isActive || isCompleted}
                      onToggle={onToggleSubtask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PipelineBoard({ entries: initial, subtasks: initialSubtasks }: { entries: PipelineEntry[]; subtasks: Subtask[] }) {
  const [entries, setEntries] = useState(initial);
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [showArchive, setShowArchive] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const archived = entries.filter((e) => archiveColumns.includes(e.status as typeof archiveColumns[number]));

  // Build subtask lookup by pipeline entry ID
  function getSubtasksForEntry(entryId: string) {
    return subtasks.filter((s) => s.pipeline_entry_id === entryId);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdating(id);
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: newStatus, last_update: localDateStr(new Date()) } : e
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

  async function handleChannelChange(id: string, newChannel: string) {
    const channel = (newChannel || null) as Channel | null;
    setUpdating(id);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, channel } : e))
    );

    try {
      const res = await fetch(`/api/job-search/pipeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: newChannel }),
      });
      if (!res.ok) setEntries(initial);
    } finally {
      setUpdating(null);
    }
  }

  async function handleToggleSubtask(subtaskId: string, done: boolean) {
    // Optimistic update
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subtaskId ? { ...s, done } : s))
    );

    const res = await fetch(`/api/job-search/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });

    if (!res.ok) {
      setSubtasks(initialSubtasks);
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
            <div key={col.key} className="flex-shrink-0 w-56">
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
                    subtasks={getSubtasksForEntry(entry.id)}
                    onStatusChange={handleStatusChange}
                    onChannelChange={handleChannelChange}
                    onToggleSubtask={handleToggleSubtask}
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
