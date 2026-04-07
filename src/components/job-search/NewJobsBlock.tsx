"use client";

import type { NewJob } from "@/lib/email-templates";

interface Props {
  jobs: NewJob[];
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 65) return "text-blue-600 bg-blue-50";
  return "text-amber-600 bg-amber-50";
}

export function NewJobsBlock({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          🆕 New Jobs (last 24h)
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No new jobs in the last 24h.
        </p>
      </div>
    );
  }

  const top = jobs.slice(0, 5);
  const rest = jobs.slice(5);

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        🆕 New Jobs (last 24h, ranked by fit)
      </h2>
      <div className="space-y-2">
        {top.map((j, i) => (
          <div
            key={j.id}
            className="flex items-start justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                #{i + 1} {j.role}
              </div>
              <div className="text-xs text-zinc-500">{j.company}</div>
              {j.breakdown && (
                <div className="text-[11px] text-zinc-400 mt-1">
                  Title {j.breakdown.title_match} · Sen {j.breakdown.seniority_fit} · Kw {j.breakdown.keyword_match} · Ind {j.breakdown.industry_fit} · Stg {j.breakdown.stage_fit}
                  {j.breakdown.red_flags ? ` · Flags ${j.breakdown.red_flags}` : ""}
                </div>
              )}
              {j.job_url && (
                <a
                  href={j.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal-600 hover:underline mt-1 inline-block"
                >
                  View posting →
                </a>
              )}
            </div>
            <span
              className={`shrink-0 ml-3 px-2 py-0.5 rounded-full text-xs font-bold ${scoreColor(j.score)}`}
            >
              {j.score}/100
              {j.scoreSource === "auto" && (
                <span className="ml-1 text-[9px] opacity-60">auto</span>
              )}
            </span>
          </div>
        ))}
      </div>
      {rest.length > 0 && (
        <p className="text-xs text-zinc-500 mt-2">
          <strong>Also found:</strong>{" "}
          {rest.map((j) => `${j.company} ${j.role} (${j.score})`).join(" · ")}
        </p>
      )}
    </div>
  );
}
