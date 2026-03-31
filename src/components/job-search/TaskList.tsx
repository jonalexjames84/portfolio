"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Flame, Clock, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Task = {
  id: string;
  task: string;
  category: string;
  impact: string;
  company: string | null;
  link: string | null;
  date: string;
  done: boolean;
  blocked_by: string | null;
  is_blocked: boolean;
  notes: string | null;
};

const categoryEmoji: Record<string, string> = {
  apply: "\ud83d\udcdd",
  outreach: "\ud83d\udce7",
  follow_up: "\ud83d\udd04",
  content: "\u270d\ufe0f",
  linkedin_post: "\ud83d\udcf1",
  prep: "\ud83d\udcda",
  admin: "\u2699\ufe0f",
};

const impactStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

type TaskListProps = {
  tasks: Task[];
  backlogCount: number;
  allDone: boolean;
};

export function TaskList({ tasks: initialTasks, backlogCount: initialBacklog, allDone: initialAllDone }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [backlogCount, setBacklogCount] = useState(initialBacklog);
  const [pullingFuture, setPullingFuture] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = total > 0 && done === total;
  const today = new Date().toISOString().split("T")[0];

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function toggleComplete(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.is_blocked) return;

    const newDone = !task.done;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) return { ...t, done: newDone };
        // Unblock tasks that were blocked by this one
        if (t.blocked_by === id) return { ...t, is_blocked: !newDone };
        return t;
      })
    );
    // Collapse card when marking done from the card
    if (newDone && expandedId === id) {
      setExpandedId(null);
    }
    await fetch(`/api/job-search/tasks/${id}/complete`, { method: "POST" });
  }

  async function snoozeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setExpandedId(null);
    await fetch(`/api/job-search/tasks/${id}/snooze`, { method: "POST" });
  }

  async function pullFutureTask() {
    setPullingFuture(true);
    try {
      const res = await fetch(`/api/job-search/tasks?date=${today}&pull_future=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.futurePulled?.length > 0) {
          setTasks((prev) => [...prev, ...data.futurePulled]);
        }
        setBacklogCount(data.backlogCount);
      }
    } finally {
      setPullingFuture(false);
    }
  }

  function isFromPastDay(task: Task): boolean {
    return task.date < today;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Today&apos;s Tasks
        </h2>
        <span className="text-sm font-medium text-zinc-500">
          {done}/{total} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => {
            const isExpanded = expandedId === task.id;
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded
                    ? "border-teal-500 dark:border-teal-600 shadow-md"
                    : task.is_blocked
                      ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-50"
                      : task.done
                        ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-60"
                        : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700"
                }`}
              >
                {/* Header row */}
                <div
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${
                    isExpanded ? "border-b border-zinc-100 dark:border-zinc-800" : ""
                  }`}
                  onClick={() => !task.is_blocked && toggleExpand(task.id)}
                >
                  <div
                    className="mt-0.5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(task.id);
                    }}
                  >
                    {task.is_blocked ? (
                      <Lock className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                    ) : task.done ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600 hover:text-teal-400 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="text-base shrink-0 leading-5">{categoryEmoji[task.category]}</span>
                      <span className={`text-sm font-medium leading-snug ${task.done ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                        {task.task}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-7 mt-1">
                      {task.company && (
                        <span className="text-xs text-zinc-500">{task.company}</span>
                      )}
                      {task.is_blocked && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400">
                          <Lock className="h-3 w-3" />
                          do {tasks.find((t) => t.id === task.blocked_by)?.task.split(" ").slice(0, 4).join(" ") || "prerequisite"} first
                        </span>
                      )}
                      {!task.is_blocked && isFromPastDay(task) && !task.done && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3" />
                          rolled over
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${impactStyles[task.impact]}`}>
                      {task.impact}
                    </span>
                    {task.link && !isExpanded && (
                      <a
                        href={task.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-teal-500 hover:text-teal-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded card body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-3">
                        {/* Company */}
                        {task.company && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Company</span>
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{task.company}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {task.notes && (
                          <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mb-1">Notes</div>
                            <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{task.notes}</div>
                          </div>
                        )}

                        {/* Blocked indicator */}
                        {task.is_blocked && (
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                            <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs text-amber-700 dark:text-amber-300">
                              Blocked by: <strong>{tasks.find((t) => t.id === task.blocked_by)?.task || "prerequisite"}</strong>
                            </span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(task.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              task.done
                                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                : "bg-teal-500 text-white hover:bg-teal-600"
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {task.done ? "Undo" : "Mark Done"}
                          </button>
                          {task.link && (
                            <a
                              href={task.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Open Link
                            </a>
                          )}
                          {!task.done && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                snoozeTask(task.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              Snooze
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Backlog indicator */}
      {backlogCount > 0 && !allDone && (
        <p className="text-xs text-zinc-400 mt-3 text-center">
          +{backlogCount} more task{backlogCount > 1 ? "s" : ""} waiting in the backlog
        </p>
      )}

      {/* All done — opt into pulling future tasks */}
      {allDone && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-3">
            All done. Nice work.
          </p>
          <button
            onClick={pullFutureTask}
            disabled={pullingFuture}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
          >
            <Flame className="h-4 w-4" />
            {pullingFuture ? "Pulling..." : "I'm on fire, give me more"}
          </button>
        </motion.div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="text-center py-8 text-zinc-400">
          <p className="text-lg font-medium">No tasks today</p>
          <p className="text-sm mt-1">Check back tomorrow morning</p>
        </div>
      )}
    </div>
  );
}
