import type { FunnelReport } from "@/lib/job-search/funnel";

/**
 * Bands 1 and 2: the one number that matters, and the chain that produces it.
 *
 * A conversion rate is rendered only when the lib supplies one. Below sample
 * threshold it shows `n=12` instead, because a percentage on a dashboard gets
 * read as a finding regardless of the caveat printed beside it.
 */
export function NorthStar({ report }: { report: FunnelReport }) {
  const { offers, applicationsOut, interviewsInFlight, daysRunning, stages } = report;

  return (
    <div>
      {/* Band 1 — the north star */}
      <div className="text-center py-2">
        <div className="text-6xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
          {offers}
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {offers === 1 ? "Offer" : "Offers"}
        </div>
        {/* Built as one string: splitting a plural across JSX children makes
            React emit "12 application s out". */}
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {[
            `${applicationsOut} application${applicationsOut === 1 ? "" : "s"} out`,
            `${interviewsInFlight} interview${interviewsInFlight === 1 ? "" : "s"} in flight`,
            daysRunning === null
              ? null
              : daysRunning === 0
                ? "first went out today"
                : `${daysRunning} day${daysRunning === 1 ? "" : "s"} in`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {/* Band 2 — the funnel */}
      <div className="mt-6 flex items-stretch">
        {stages.map((stage, i) => (
          <div key={stage.key} className="flex-1 flex items-stretch">
            {i > 0 && (
              <div className="flex flex-col items-center justify-center px-1 sm:px-2 shrink-0">
                <span className="text-[10px] tabular-nums leading-none text-zinc-400 dark:text-zinc-500">
                  {stage.conversionFromPrevious !== null ? (
                    `${stage.conversionFromPrevious}%`
                  ) : (
                    <span
                      title={
                        stage.sample > 0
                          ? `Needs ${20 - stage.sample} more before this rate means anything`
                          : "Nothing has reached the previous stage yet"
                      }
                    >
                      {stage.sample > 0 ? `n=${stage.sample}` : "—"}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 text-zinc-300 dark:text-zinc-600 leading-none">
                  ›
                </span>
              </div>
            )}

            <div className="flex-1 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-2 py-3 text-center">
              <div
                className={`text-2xl font-semibold tabular-nums ${
                  stage.count > 0
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
              >
                {stage.count}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                {stage.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-zinc-400 text-center">
        Rates appear once a stage has 20 through it. Before that they would be a
        percentage resting on two data points.
      </p>
    </div>
  );
}
