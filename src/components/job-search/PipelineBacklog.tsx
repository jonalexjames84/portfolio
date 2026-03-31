"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";

type PipelineEntry = {
  id: string;
  company: string;
  role: string;
  status: string;
  applied_date: string | null;
  last_update: string;
  notes: string | null;
};

type TaskEntry = {
  id: string;
  task: string;
  category: string;
  impact: string;
  company: string | null;
  date: string;
  done: boolean;
};

const statusOptions = ["saved", "applied", "screen", "interview", "offer", "rejected", "passed"];

const statusStyles: Record<string, string> = {
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  screen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  interview: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  offer: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  passed: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const categoryEmoji: Record<string, string> = {
  outreach: "\ud83d\udce7",
  follow_up: "\ud83d\udd04",
  content: "\u270d\ufe0f",
  linkedin_post: "\ud83d\udcf1",
  prep: "\ud83d\udcda",
  admin: "\u2699\ufe0f",
};

type Props = {
  entries: PipelineEntry[];
  tasks: TaskEntry[];
};

export function PipelineBacklog({ entries: initialEntries, tasks: initialTasks }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [tasks, setTasks] = useState(initialTasks);
  const [tab, setTab] = useState<"applications" | "tasks">("applications");
  const [appFilter, setAppFilter] = useState<string>("active");
  const [taskFilter, setTaskFilter] = useState<string>("open");
  const [updating, setUpdating] = useState<string | null>(null);

  // Application filtering
  const filteredApps = entries.filter((e) => {
    if (appFilter === "active") return !["rejected", "passed"].includes(e.status);
    if (appFilter === "all") return true;
    return e.status === appFilter;
  });

  const appCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const activeAppCount = (appCounts.saved || 0) + (appCounts.applied || 0) + (appCounts.screen || 0) + (appCounts.interview || 0) + (appCounts.offer || 0);

  // Task filtering
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "open") return !t.done;
    if (taskFilter === "done") return t.done;
    return true;
  });

  const openTaskCount = tasks.filter((t) => !t.done).length;
  const doneTaskCount = tasks.filter((t) => t.done).length;

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

  async function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: newDone } : t));
    await fetch(`/api/job-search/tasks/${id}/complete`, { method: "POST" });
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setTab("applications")}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            tab === "applications"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Applications ({activeAppCount})
        </button>
        <button
          onClick={() => setTab("tasks")}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            tab === "tasks"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Tasks ({openTaskCount})
        </button>
      </div>

      {/* Applications tab */}
      {tab === "applications" && (
        <>
          <div className="flex justify-end mb-3">
            <select
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300"
            >
              <option value="active">Active ({activeAppCount})</option>
              <option value="all">All ({entries.length})</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} ({appCounts[s] || 0})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {filteredApps.map((entry) => (
              <div
                key={entry.id}
                className="px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.company}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      {entry.role}
                    </p>
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
                {entry.applied_date && (
                  <p className="text-[11px] text-zinc-400 mt-1.5">
                    Applied {new Date(entry.applied_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-6 text-zinc-400 text-sm">
              No applications match this filter
            </div>
          )}
        </>
      )}

      {/* Tasks tab */}
      {tab === "tasks" && (
        <>
          <div className="flex justify-end mb-3">
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300"
            >
              <option value="open">Open ({openTaskCount})</option>
              <option value="done">Done ({doneTaskCount})</option>
              <option value="all">All ({tasks.length})</option>
            </select>
          </div>

          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  task.done
                    ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-teal-300 dark:hover:border-teal-700"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {task.done ? (
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0 leading-5">{categoryEmoji[task.category] || "\ud83d\udccc"}</span>
                    <span className={`text-sm font-medium leading-snug ${task.done ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                      {task.task}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-7 mt-1">
                    {task.company && (
                      <span className="text-xs text-zinc-500">{task.company}</span>
                    )}
                    <span className="text-[11px] text-zinc-400">
                      {new Date(task.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-6 text-zinc-400 text-sm">
              No tasks match this filter
            </div>
          )}
        </>
      )}
    </div>
  );
}
