"use client";

import { motion } from "framer-motion";

type Metrics = {
  applications_sent: number;
  outreach_sent: number;
  follow_ups_sent: number;
  linkedin_posts: number;
  conversations: number;
};

type Targets = {
  applications_sent: number;
  outreach_sent: number;
  follow_ups_sent: number;
  linkedin_posts: number;
  conversations: number;
};

const labels: Record<string, string> = {
  applications_sent: "Applications",
  outreach_sent: "Outreach",
  follow_ups_sent: "Follow-ups",
  linkedin_posts: "LinkedIn Posts",
  conversations: "Conversations",
};

function barColor(pct: number): string {
  if (pct >= 100) return "from-emerald-400 to-emerald-500";
  if (pct >= 60) return "from-amber-400 to-amber-500";
  return "from-red-400 to-red-500";
}

export function WeeklyScorecard({ metrics, targets }: { metrics: Metrics; targets: Targets }) {
  const keys = Object.keys(labels) as (keyof Metrics)[];

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        This Week
      </h2>
      <div className="space-y-3">
        {keys.map((key) => {
          const actual = metrics[key] || 0;
          const target = targets[key] || 1;
          const pct = Math.min(Math.round((actual / target) * 100), 100);

          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600 dark:text-zinc-400">{labels[key]}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {actual}<span className="text-zinc-400 font-normal">/{target}</span>
                </span>
              </div>
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor(pct)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
