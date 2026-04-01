"use client";

function FitScoreRing({ score }: { score: number }) {
  const color =
    score >= 75
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const bgColor =
    score >= 75
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : score >= 60
        ? "bg-amber-50 dark:bg-amber-900/20"
        : "bg-red-50 dark:bg-red-900/20";

  const bandLabel =
    score >= 75 ? "Apply Immediately" : score >= 60 ? "Referral Only" : "Skip";

  return (
    <div className={`rounded-xl ${bgColor} p-3 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{score}</div>
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
        Fit Score
      </div>
      <div className={`text-[10px] font-medium mt-1 ${color}`}>{bandLabel}</div>
    </div>
  );
}

function CoverageScore({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const bgColor =
    score >= 70
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : score >= 50
        ? "bg-amber-50 dark:bg-amber-900/20"
        : "bg-red-50 dark:bg-red-900/20";

  return (
    <div className={`rounded-xl ${bgColor} p-3 text-center`}>
      <div className={`text-2xl font-bold ${color}`}>{score}%</div>
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
        Resume Coverage
      </div>
    </div>
  );
}

function AtsBadge({ result }: { result: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pass: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      label: "PASS",
    },
    pass_with_warnings: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      label: "WARNINGS",
    },
    fail: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      label: "FAIL",
    },
  };

  const style = styles[result] || styles.pass_with_warnings;

  return (
    <div className={`rounded-xl ${style.bg} p-3 text-center`}>
      <div className={`text-lg font-bold ${style.text}`}>{style.label}</div>
      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
        ATS Check
      </div>
    </div>
  );
}

export function ScoreIndicators({
  fitScore,
  coverageScore,
  atsResult,
}: {
  fitScore: number | null;
  coverageScore: number | null;
  atsResult: string | null;
}) {
  const hasAny = fitScore !== null || coverageScore !== null || atsResult !== null;

  if (!hasAny) {
    return (
      <p className="text-sm text-zinc-400 italic">
        Run <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs">/job-fit-scorer</code> with the JD to score this role.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {fitScore !== null ? (
        <FitScoreRing score={fitScore} />
      ) : (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center text-zinc-400 text-xs">No fit score</div>
      )}
      {coverageScore !== null ? (
        <CoverageScore score={coverageScore} />
      ) : (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center text-zinc-400 text-xs">No coverage</div>
      )}
      {atsResult !== null ? (
        <AtsBadge result={atsResult} />
      ) : (
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center text-zinc-400 text-xs">No ATS check</div>
      )}
    </div>
  );
}
