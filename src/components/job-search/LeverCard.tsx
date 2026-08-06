import Link from "next/link";
import type { Lever, LeverState } from "@/lib/job-search/strategy";

/**
 * One Job OS principle, graded against what the data shows.
 *
 * `unknown` is styled grey and explicitly not red. It means the data cannot
 * support a verdict, and conflating it with failure is how a dashboard teaches
 * you to ignore it — the page has to be quiet where it has nothing to say for
 * the two places it shouts to carry weight.
 */

const STATE_STYLE: Record<
  LeverState,
  { dot: string; bar: string; label: string; text: string }
> = {
  critical: {
    dot: "bg-red-500",
    bar: "bg-red-500",
    label: "Fix first",
    text: "text-red-600 dark:text-red-400",
  },
  weak: {
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    label: "Needs work",
    text: "text-amber-600 dark:text-amber-400",
  },
  working: {
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    label: "Working",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  unknown: {
    dot: "bg-zinc-300 dark:bg-zinc-600",
    bar: "bg-zinc-300 dark:bg-zinc-600",
    label: "Too early to read",
    text: "text-zinc-400 dark:text-zinc-500",
  },
};

export function LeverCard({ lever, rank }: { lever: Lever; rank: number }) {
  const style = STATE_STYLE[lever.state];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <span className="mt-1 shrink-0 text-sm font-semibold tabular-nums text-zinc-300 dark:text-zinc-600">
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {lever.headline}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${style.text}`}
            >
              {style.label}
            </span>
          </div>

          {lever.score !== null && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full ${style.bar}`}
                style={{ width: `${Math.min(100, Math.max(0, lever.score))}%` }}
              />
            </div>
          )}

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {lever.finding}
          </p>

          <p className="mt-2 border-l-2 border-zinc-200 pl-3 text-[11px] italic text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            {lever.principle}
          </p>

          {lever.move &&
            (lever.href ? (
              <Link
                href={lever.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                {lever.move}
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {lever.move}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
