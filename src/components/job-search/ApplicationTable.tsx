"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { localDateStr } from "@/lib/job-search/dates";
import {
  buildPipelineViews,
  STATUS_LABELS,
  STATUS_ORDER,
  type ApplicationRow,
  type UrgentRow,
} from "@/lib/job-search/pipeline-views";
import type { PipelineStatus } from "@/lib/job-search/types";

/**
 * The whole dashboard: one table of applications, shown three ways.
 *
 * State lives here rather than in each section so that changing a status in
 * "Do next" moves the row in "All applications" in the same click — the three
 * views are filters over one array, not three copies of it.
 */

const STATUS_STYLES: Record<PipelineStatus, string> = {
  offer: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  interview:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  screen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  applied: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  saved: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  passed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

function StatusSelect({
  row,
  pending,
  onChange,
}: {
  row: ApplicationRow;
  pending: boolean;
  onChange: (id: string, status: PipelineStatus) => void;
}) {
  return (
    <select
      value={row.status}
      disabled={pending}
      onChange={(e) => onChange(row.id, e.target.value as PipelineStatus)}
      aria-label={`Status for ${row.role} at ${row.company}`}
      className={`shrink-0 cursor-pointer appearance-none rounded-full border-0 py-1 pl-2.5 pr-2.5 text-xs font-medium ${
        STATUS_STYLES[row.status]
      } ${pending ? "opacity-50" : ""}`}
    >
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}

function Row({
  row,
  note,
  pending,
  onChange,
}: {
  row: ApplicationRow;
  note?: string;
  pending: boolean;
  onChange: (id: string, status: PipelineStatus) => void;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {row.company}
          </span>
          {row.jobUrl && (
            <a
              href={row.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open the posting"
              className="shrink-0 text-zinc-400 hover:text-blue-500"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {row.score != null && (
            <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">
              {row.score}
            </span>
          )}
        </div>
        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {row.role}
          {note && (
            <span className="text-zinc-400 dark:text-zinc-500"> · {note}</span>
          )}
        </div>
      </div>
      <StatusSelect row={row} pending={pending} onChange={onChange} />
    </li>
  );
}

/**
 * How many rows a list shows before it needs asking.
 *
 * Not cosmetic: the ATS ingest can add 250+ saved roles in one night, and an
 * uncapped "everything by status" is a longer page than the eleven panels this
 * replaced. Rows are sorted by fit score, so the cap keeps the best ones.
 */
const CAP = 10;

function RowList({
  rows,
  noteOf,
  rowProps,
}: {
  rows: ApplicationRow[];
  noteOf?: (row: ApplicationRow) => string | undefined;
  rowProps: (row: ApplicationRow) => Omit<
    React.ComponentProps<typeof Row>,
    "note"
  >;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, CAP);

  return (
    <>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {visible.map((row) => (
          <Row key={row.id} {...rowProps(row)} note={noteOf?.(row)} />
        ))}
      </ul>
      {rows.length > CAP && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {expanded
            ? `Show top ${CAP}`
            : `Show all ${rows.length} — ${rows.length - CAP} more`}
        </button>
      )}
    </>
  );
}

function Section({
  title,
  count,
  hint,
  empty,
  children,
}: {
  title: string;
  count: number;
  hint?: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">
          {count}
        </span>
      </div>
      {hint && <p className="mb-2 text-xs text-zinc-400">{hint}</p>}
      {count === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{empty}</p>
      ) : (
        children
      )}
    </section>
  );
}

export function ApplicationTable({
  rows: initial,
  today,
}: {
  rows: ApplicationRow[];
  today: string;
}) {
  const [rows, setRows] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const { urgent, fresh, groups } = buildPipelineViews(rows, today);

  async function handleStatusChange(id: string, status: PipelineStatus) {
    const previous = rows;
    setPending(id);
    setFailed(null);
    // `last_update` is bumped locally too, or a row Jon just touched would keep
    // showing the follow-up reason it was flagged with a second ago.
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, lastUpdate: localDateStr(new Date()) } : r
      )
    );

    try {
      const res = await fetch(`/api/job-search/pipeline/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
    } catch {
      // Roll back only this row's change rather than the whole array, so a
      // failure cannot discard edits Jon made while the request was in flight.
      setRows((prev) =>
        prev.map((r) => (r.id === id ? previous.find((p) => p.id === id) || r : r))
      );
      setFailed(id);
    } finally {
      setPending(null);
    }
  }

  const rowProps = (row: ApplicationRow) => ({
    row,
    pending: pending === row.id,
    onChange: handleStatusChange,
  });

  return (
    <div className="space-y-4">
      {failed && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          That status change did not save. The row has been put back — try again.
        </p>
      )}

      <Section
        title="Do next"
        count={urgent.length}
        hint="Live conversations first, then applications that have gone quiet."
        empty="Nothing urgent. Apply to something from New or Saved below."
      >
        <RowList
          rows={urgent}
          rowProps={rowProps}
          noteOf={(row) => (row as UrgentRow).reason}
        />
      </Section>

      <Section
        title="New"
        count={fresh.length}
        hint="Added in the last three days."
        empty="No new roles in the last three days."
      >
        <RowList rows={fresh} rowProps={rowProps} />
      </Section>

      <Section
        title="All applications"
        count={rows.length}
        empty="Nothing in the pipeline yet."
      >
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.status}>
              <div className="mb-1 flex items-baseline gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {group.label}
                </h3>
                <span className="text-[11px] tabular-nums text-zinc-400">
                  {group.rows.length}
                </span>
              </div>
              <RowList rows={group.rows} rowProps={rowProps} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
