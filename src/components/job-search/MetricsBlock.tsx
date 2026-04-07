"use client";

import { Sparkline } from "./Sparkline";
import type { MetricRow } from "@/lib/email-templates";

interface Props {
  rows: MetricRow[];
}

function delta(history: number[]): { symbol: string; color: string } {
  if (history.length < 2) return { symbol: "—", color: "text-zinc-400" };
  const cur = history[history.length - 1];
  const prev = history[history.length - 2];
  if (cur > prev) return { symbol: "↑", color: "text-emerald-600" };
  if (cur < prev) return { symbol: "↓", color: "text-red-600" };
  return { symbol: "flat", color: "text-zinc-400" };
}

function display(r: MetricRow): string {
  if (r.unit === "%") return `${Math.round(r.current * 100)}%`;
  if (r.target) return `${r.current}/${r.target}`;
  return String(r.current);
}

export function MetricsBlock({ rows }: Props) {
  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        📊 Metrics
      </h2>
      <table className="w-full">
        <tbody>
          {rows.map((r) => {
            const d = delta(r.history);
            return (
              <tr key={r.label} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <td className="py-2 text-sm text-zinc-600 dark:text-zinc-400">{r.label}</td>
                <td className="py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {display(r)}
                </td>
                <td className="py-2">
                  <Sparkline values={r.history} />
                </td>
                <td className={`py-2 text-xs text-right ${d.color}`}>{d.symbol}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
