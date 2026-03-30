"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Task = {
  id: string;
  task: string;
  category: string;
  impact: string;
  company: string | null;
  link: string | null;
  done: boolean;
};

const categoryEmoji: Record<string, string> = {
  apply: "\ud83d\udcdd",
  outreach: "\ud83d\udce7",
  follow_up: "\ud83d\udd04",
  content: "\u270d\ufe0f",
  prep: "\ud83d\udcda",
  admin: "\u2699\ufe0f",
};

const impactStyles: Record<string, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function TaskList({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  async function toggleComplete(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: true } : t))
    );
    await fetch(`/api/job-search/tasks/${id}/complete`, { method: "POST" });
  }

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;

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
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                task.done
                  ? "bg-zinc-50 border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 opacity-60"
                  : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-700"
              }`}
              onClick={() => !task.done && toggleComplete(task.id)}
            >
              <div className="mt-0.5 shrink-0">
                {task.done ? (
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
                {task.company && (
                  <p className="text-xs text-zinc-500 mt-0.5 ml-7">{task.company}</p>
                )}
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

      {tasks.length === 0 && (
        <div className="text-center py-8 text-zinc-400">
          <p className="text-lg font-medium">No tasks today</p>
          <p className="text-sm mt-1">Check back tomorrow morning</p>
        </div>
      )}
    </div>
  );
}
