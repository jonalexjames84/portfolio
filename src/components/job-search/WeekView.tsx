"use client";

import type { WeekDay } from "@/lib/email-templates";

interface Props {
  days: WeekDay[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  apply: "📝",
  outreach: "📧",
  follow_up: "🔄",
  content: "✍️",
  linkedin_post: "📱",
  prep: "📚",
  admin: "⚙️",
};

const IMPACT_COLOR: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-zinc-100 text-zinc-500",
};

export function WeekView({ days }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        📅 This Week's Tasks
      </h2>
      <div className="space-y-3">
        {days.map((d) => {
          const doneCount = d.tasks.filter((t) => t.done).length;
          return (
            <div key={d.date}>
              <div
                className={`flex justify-between items-center px-3 py-1.5 rounded-md text-xs font-bold ${
                  d.isToday
                    ? "bg-teal-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span>
                  {d.label}
                  {d.isToday && " (today)"}
                </span>
                <span>
                  {doneCount}/{d.tasks.length}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {d.tasks.length === 0 && (
                  <div className="text-xs text-zinc-400 px-3 py-1">No tasks</div>
                )}
                {d.tasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-2 px-3 py-1 text-sm ${
                      t.done ? "line-through text-zinc-400" : "text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <span>{t.done ? "☑" : "☐"}</span>
                    <span>{CATEGORY_EMOJI[t.category] || "📋"}</span>
                    <span className="flex-1">{t.task}</span>
                    {t.company && (
                      <span className="text-xs text-zinc-500">— {t.company}</span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${IMPACT_COLOR[t.impact]}`}
                    >
                      {t.impact.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
