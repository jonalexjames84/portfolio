import Link from "next/link";
import type { NextAction } from "@/lib/job-search/next-actions";

/**
 * Band 3: at most five rows, ranked, each carrying the reason it ranks there.
 *
 * The rationale is shown rather than implied. A priority list whose ordering
 * you have to take on faith gets ignored the first time it looks wrong.
 */

const WEIGHT_STYLES: Record<1 | 2 | 3, { dot: string; label: string }> = {
  3: { dot: "bg-emerald-500", label: "biggest impact" },
  2: { dot: "bg-amber-400", label: "worth doing" },
  1: { dot: "bg-zinc-300 dark:bg-zinc-600", label: "background" },
};

export function NextActions({ actions }: { actions: NextAction[] }) {
  if (actions.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Do this next
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nothing queued. Source new roles or reach out — the funnel only moves
          from the top.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Do this next
        </h2>
        <span className="text-[11px] text-zinc-400">ranked by impact</span>
      </div>

      <ol className="space-y-2">
        {actions.map((action, i) => {
          const style = WEIGHT_STYLES[action.weight];
          const body = (
            <div className="flex items-start gap-3">
              <span className="flex items-center gap-2 shrink-0 pt-0.5">
                <span className="text-xs tabular-nums text-zinc-400 w-3">
                  {i + 1}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${style.dot}`}
                  title={style.label}
                  aria-label={style.label}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {action.label}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {action.rationale}
                </span>
              </span>
            </div>
          );

          return (
            <li
              key={action.key}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2.5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              {action.href ? (
                <Link href={action.href} className="block">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
