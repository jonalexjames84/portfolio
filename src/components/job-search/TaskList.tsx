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

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const allDone = total > 0 && done === total;
  const today = new Date().toISOString().split("T")[0];

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
    await fetch(`/api/job-search/tasks/${id}/complete`, { method: "POST" });
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
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                task.is_blocked
                  ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-50 cursor-not-allowed"
                  : task.done
                    ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-60 cursor-pointer"
                    : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer"
              }`}
              onClick={() => toggleComplete(task.id)}
            >
              <div className="mt-0.5 shrink-0">
                {task.is_blocked ? (
                  <Lock className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                ) : task.done ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{categoryEmoji[task.category]}</span>
                  <span className={`text-sm font-medium ${task.done ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-100"}`}>
                    {task.task}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-7 mt-0.5">
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
                {task.link && (
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
            </motion.div>
          ))}
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
