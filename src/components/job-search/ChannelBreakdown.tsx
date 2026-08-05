"use client";

import type { ChannelReport, ChannelStat } from "@/lib/job-search/channel-attribution";
import { MIN_SAMPLE, UNATTRIBUTED } from "@/lib/job-search/channel-attribution";

function rateColor(rate: number): string {
  if (rate >= 20) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= 10) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

/** Width of the volume bar, relative to the busiest channel. */
function barWidth(stat: ChannelStat, max: number): string {
  if (max === 0) return "0%";
  return `${Math.max((stat.applied / max) * 100, stat.applied > 0 ? 4 : 0)}%`;
}

export function ChannelBreakdown({ report }: { report: ChannelReport }) {
  const { stats, bestChannel, unattributedCount, totalApplied } = report;
  const maxApplied = Math.max(0, ...stats.map((s) => s.applied));

  if (totalApplied === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Channels
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No applications yet. Once roles start moving past <em>saved</em>, this
          shows which channel is worth more of your week.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Channels
        </h2>
        <span className="text-[11px] text-zinc-400">
          {totalApplied} applied
        </span>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        {bestChannel ? (
          <>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {bestChannel.label}
            </span>{" "}
            is converting best — {bestChannel.responseRate}% response on{" "}
            {bestChannel.applied} applications.
          </>
        ) : (
          <>
            No channel has {MIN_SAMPLE}+ applications yet, so any rate here is
            still noise. Keep going before you cut anything.
          </>
        )}
      </p>

      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.channel}>
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span
                className={
                  s.channel === UNATTRIBUTED
                    ? "text-zinc-400 dark:text-zinc-500 italic"
                    : "text-zinc-700 dark:text-zinc-300"
                }
              >
                {s.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-[11px] text-zinc-400">
                  {s.applied} applied
                </span>
                {s.applied >= MIN_SAMPLE ? (
                  <span className={`font-semibold ${rateColor(s.responseRate)}`}>
                    {s.responseRate}%
                  </span>
                ) : (
                  <span
                    className="text-zinc-400 text-xs"
                    title={`Needs ${MIN_SAMPLE}+ applications before the rate means anything`}
                  >
                    —
                  </span>
                )}
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500"
                style={{ width: barWidth(s, maxApplied) }}
              />
            </div>

            {s.applied > 0 && (
              <div className="text-[11px] text-zinc-400 mt-1">
                {s.responded} responded &middot; {s.interviewed} interviewed
                {s.offers > 0 && <> &middot; {s.offers} offer{s.offers > 1 && "s"}</>}
                {s.closed > 0 && <> &middot; {s.closed} closed</>}
              </div>
            )}
          </div>
        ))}
      </div>

      {unattributedCount > 0 && (
        <p className="text-[11px] text-zinc-400 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {unattributedCount} role{unattributedCount > 1 && "s"} have no channel
          set. Attribute them on the pipeline board to sharpen this.
        </p>
      )}

      <p className="text-[11px] text-zinc-400 mt-2">
        Response counts current status only — a role rejected after a screen
        reads as no response, so these rates are a floor.
      </p>
    </div>
  );
}
