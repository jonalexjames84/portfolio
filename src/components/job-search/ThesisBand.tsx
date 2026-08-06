import type { ThesisReport } from "@/lib/job-search/strategy";

/**
 * What Jon said he was looking for, and what he actually applied to.
 *
 * The gap between those two is the whole argument for this page. A share is
 * withheld rather than shown as 0% when nothing has been submitted — the same
 * rule the funnel uses, for the same reason.
 */

function Stat({
  label,
  value,
  bad,
  hint,
}: {
  label: string;
  value: string;
  bad?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div
        className={`text-xl font-semibold tabular-nums ${
          bad
            ? "text-red-600 dark:text-red-400"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      {hint && (
        <div className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
          {hint}
        </div>
      )}
    </div>
  );
}

export function ThesisBand({ report }: { report: ThesisReport }) {
  const { onThesisPct, referralPct, avgScoreApplied, applicationsSubmitted } = report;

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        The thesis
      </div>
      <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {report.summary}
      </p>

      {applicationsSubmitted === 0 ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Nothing submitted yet, so there is nothing to measure the thesis
          against.
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Stat
              label="On thesis"
              value={onThesisPct === null ? "—" : `${onThesisPct}%`}
              bad={onThesisPct !== null && onThesisPct < 60}
            />
            <Stat
              label="Via referral"
              value={referralPct === null ? "—" : `${referralPct}%`}
              bad={referralPct === 0}
              hint={referralPct === 0 ? "every one cold" : undefined}
            />
            <Stat
              label="Avg fit"
              value={avgScoreApplied === null ? "—" : String(avgScoreApplied)}
              bad={avgScoreApplied !== null && avgScoreApplied < 80}
            />
          </div>
          <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
            Measured against {applicationsSubmitted} submitted{" "}
            {applicationsSubmitted === 1 ? "application" : "applications"}.
          </p>
        </>
      )}
    </div>
  );
}
