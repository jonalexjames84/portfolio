"use client";

import type { Signal } from "@/lib/job-search/signals";

interface Props {
  signals: Signal[];
}

export function SignalsBlock({ signals }: Props) {
  if (signals.length === 0) return null;
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-4">
      <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">
        ⚠️ Signals
      </h2>
      {signals.map((s) => (
        <p key={s.id} className="text-sm text-amber-800 dark:text-amber-300 my-1">
          {s.message}
        </p>
      ))}
    </div>
  );
}
