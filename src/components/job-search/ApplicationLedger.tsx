"use client";

import { useState } from "react";
import type { LedgerReport } from "@/lib/job-search/application-ledger";

/**
 * The ledger view. Ordered by what Jon can act on, not by what is tidy:
 * everything waiting on his hands comes first, then what he cannot apply to,
 * then what is already out.
 */

function Chip({ label, tone }: { label: string; tone: "block" | "info" }) {
  const styles =
    tone === "block"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${styles}`}>
      {label}
    </span>
  );
}

export function ApplicationLedger({ report }: { report: LedgerReport }) {
  const [showAllSubmitted, setShowAllSubmitted] = useState(false);
  const { waiting, submitted, blocking, closedCount } = report;

  const dueCount = submitted.filter((s) => s.followUpDue).length;
  const visibleSubmitted = showAllSubmitted ? submitted : submitted.slice(0, 6);

  if (waiting.length === 0 && submitted.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Applications
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Nothing in the ledger yet. Claim a role before writing for it and it
          shows up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Applications
        </h2>
        <span className="text-[11px] text-zinc-400">
          {submitted.length} out &middot; {waiting.length} waiting on you
          {closedCount > 0 && <> &middot; {closedCount} closed</>}
        </span>
      </div>

      {/* The whole point of the panel: what needs Jon's hands. */}
      {waiting.length > 0 && (
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Waiting on you
            </h3>
            <span className="text-[11px] text-zinc-400">
              materials written — each is minutes, not hours
            </span>
          </div>

          <ul className="space-y-1.5">
            {waiting.map((w) => (
              <li
                key={w.id}
                className="flex items-baseline justify-between gap-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {w.jobUrl ? (
                      <a
                        href={w.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {w.company}
                      </a>
                    ) : (
                      w.company
                    )}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {" "}
                    — {w.role}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {w.blocker && <Chip label={w.blocker} tone="block" />}
                  {w.preparedByAgent && <Chip label="agent draft" tone="info" />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blocked roles. This is the thing no other panel can show. */}
      {blocking.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Saved but unreachable
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            These companies are at their application cap, so the roles below
            cannot be applied to — however good the fit score looks. A rejection
            frees the company, never the req.
          </p>
          <ul className="space-y-1.5">
            {blocking.map((s) => (
              <li key={s.companyKey} className="text-sm">
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {s.company}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {" "}
                  {s.used}/{s.cap} — holding {s.roles.join(", ")}
                </span>
                <ul className="mt-0.5 ml-3 space-y-0.5">
                  {s.blockedRoles.map((role) => (
                    <li
                      key={role}
                      className="text-xs text-zinc-500 dark:text-zinc-400 line-through decoration-zinc-300 dark:decoration-zinc-600"
                    >
                      {role}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Already out. */}
      {submitted.length > 0 && (
        <div>
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Submitted
            </h3>
            {dueCount > 0 && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {dueCount} ready to follow up
              </span>
            )}
          </div>

          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visibleSubmitted.map((s) => (
              <li
                key={s.id}
                className="flex items-baseline justify-between gap-3 py-1.5"
              >
                <span className="min-w-0 truncate">
                  <span className="text-sm text-zinc-800 dark:text-zinc-200">
                    {s.jobUrl ? (
                      <a
                        href={s.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {s.company}
                      </a>
                    ) : (
                      s.company
                    )}
                  </span>
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">
                    {" "}
                    — {s.role}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] tabular-nums">
                  {s.daysSince === null ? (
                    <span className="text-zinc-400">no date</span>
                  ) : s.followUpDue ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {s.daysSince}d — follow up
                    </span>
                  ) : (
                    <span className="text-zinc-400">{s.daysSince}d</span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {submitted.length > 6 && (
            <button
              onClick={() => setShowAllSubmitted((v) => !v)}
              className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {showAllSubmitted
                ? "Show fewer"
                : `Show all ${submitted.length}`}
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] text-zinc-400 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        The ledger holds one row per req, so a role applied to twice still shows
        once here. Check before you apply —{" "}
        <code className="text-[10px]">apply-guard.ts list --company &quot;X&quot;</code>
        {" "}— the guard stops agents, not you.
      </p>
    </div>
  );
}
