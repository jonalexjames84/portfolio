import { MIN_LEAK_SAMPLE, type LeakStage } from "@/lib/job-search/strategy";

/**
 * Where the search leaks, including the stages that happen before applying.
 *
 * The dashboard's funnel starts at Applications, which means the two things
 * that decide whether an application is worth sending — is this on thesis, and
 * does anyone inside know me — are invisible.
 *
 * Vertical rather than the dashboard's horizontal chain: six labelled stages do
 * not fit across a phone, and a leak reads more naturally as a drop than as a
 * narrowing. Two states get special treatment, both of which looked like bugs
 * before they were named: a branch (coverage of a stage, not a step after it)
 * and an overflow (a stage wider than its parent).
 */
export function LeakFunnel({ stages }: { stages: LeakStage[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        Where it leaks
      </div>

      <div className="mt-4 space-y-1">
        {stages.map((stage, i) => {
          const width = Math.max(2, (stage.count / max) * 100);
          // An overflowing stage has a rate above 100, and "185%" reads as a
          // broken chart rather than as the finding. The overflow badge beside
          // it says the same thing in the terms that matter.
          const rateLabel =
            stage.overflow !== null
              ? null
              : stage.conversionFromParent === null
                ? stage.sample > 0
                  ? `n=${stage.sample}`
                  : "—"
                : `${stage.conversionFromParent}%`;

          return (
            <div key={stage.key} className={stage.isBranch ? "pl-6" : undefined}>
              {i > 0 && (
                <div className="flex items-center gap-2 py-1 pl-1">
                  <span className="text-zinc-300 dark:text-zinc-600">
                    {stage.isBranch ? "↳" : "↓"}
                  </span>
                  {rateLabel && (
                    <span
                      className={`text-[10px] tabular-nums ${
                        stage.isLeak
                          ? "font-semibold text-red-600 dark:text-red-400"
                          : "text-zinc-400 dark:text-zinc-500"
                      }`}
                      title={
                        stage.conversionFromParent === null && stage.sample > 0
                          ? `Needs ${MIN_LEAK_SAMPLE - stage.sample} more upstream before this rate means anything`
                          : undefined
                      }
                    >
                      {rateLabel}
                    </span>
                  )}
                  {stage.isLeak && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                      ← the leak
                    </span>
                  )}
                  {stage.overflow !== null && (
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                      +{stage.overflow} beyond what qualifies
                    </span>
                  )}
                </div>
              )}

              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  stage.isLeak
                    ? "bg-red-50 dark:bg-red-950/30"
                    : stage.overflow !== null
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : "bg-zinc-50 dark:bg-zinc-800/50"
                }`}
              >
                <div className="w-16 shrink-0 sm:w-24">
                  <div
                    className={`h-1.5 rounded-full ${
                      stage.isLeak
                        ? "bg-red-400 dark:bg-red-500"
                        : stage.overflow !== null
                          ? "bg-amber-400 dark:bg-amber-500"
                          : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div
                  className={`w-10 shrink-0 text-right text-lg font-semibold tabular-nums ${
                    stage.count > 0
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-300 dark:text-zinc-600"
                  }`}
                >
                  {stage.count}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {stage.label}
                  </div>
                  <div className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                    {stage.note}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
        Referral path is indented because it measures coverage of the stage
        above, not a step after it. A stage wider than its parent is not a
        rendering error — it is applying past what qualifies. Rates appear once{" "}
        {MIN_LEAK_SAMPLE} have reached the parent stage.
      </p>
    </div>
  );
}
