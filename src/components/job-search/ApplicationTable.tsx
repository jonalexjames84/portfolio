"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Linkedin } from "lucide-react";
import { localDateStr } from "@/lib/job-search/dates";
import {
  buildPipelineViews,
  groupByCompany,
  STATUS_LABELS,
  STATUS_ORDER,
  type ApplicationRow,
  type CompanyGroup,
  type UrgentRow,
} from "@/lib/job-search/pipeline-views";
import type { Contact } from "@/lib/job-search/referrals";
import type { PipelineStatus } from "@/lib/job-search/types";

/**
 * The action plan: one table of applications, shown three ways.
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

/** How many companies a list shows before it needs asking. */
const CAP = 10;

type ChangeHandler = (id: string, status: PipelineStatus) => void;

function StatusSelect({
  row,
  pending,
  onChange,
}: {
  row: ApplicationRow;
  pending: boolean;
  onChange: ChangeHandler;
}) {
  return (
    <select
      value={row.status}
      disabled={pending}
      onChange={(e) => onChange(row.id, e.target.value as PipelineStatus)}
      aria-label={`Status for ${row.role} at ${row.company}`}
      className={`shrink-0 cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-xs font-medium ${
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

/**
 * The referral prompt. Rendered at company level, not role level: Jon asks a
 * person about a company once, however many of its reqs he is watching.
 */
function Referrals({ contacts }: { contacts: Contact[] }) {
  const fresh = contacts.filter((c) => !c.contacted);
  const shown = (fresh.length > 0 ? fresh : contacts).slice(0, 2);
  const hidden = (fresh.length > 0 ? fresh : contacts).length - shown.length;

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
        {fresh.length > 0
          ? `${fresh.length} to ask`
          : `${contacts.length} contacted`}
      </span>
      {shown.map((c) => (
        <a
          key={c.id}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          title={
            c.isProfile
              ? `Message ${c.name} on LinkedIn`
              : `No profile on file — search LinkedIn for ${c.name}`
          }
          className={`inline-flex items-center gap-0.5 text-[10px] hover:underline ${
            c.isProfile
              ? "text-teal-700 dark:text-teal-300"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          <Linkedin className="h-2.5 w-2.5" />
          {c.name}
          {!c.isProfile && "?"}
        </a>
      ))}
      {hidden > 0 && (
        <span className="text-[10px] text-zinc-400">+{hidden}</span>
      )}
    </span>
  );
}

function RoleLine({ row, note }: { row: ApplicationRow; note?: string }) {
  return (
    <>
      <span className="truncate">{row.role}</span>
      {row.jobUrl ? (
        <a
          href={row.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open the posting"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 text-zinc-400 hover:text-blue-500"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        // Said out loud rather than left blank: a row with no posting cannot be
        // re-checked for liveness, which is why the March cohort went stale
        // unnoticed.
        <span className="shrink-0 text-[10px] text-amber-600 dark:text-amber-500">
          no link
        </span>
      )}
      {note && <span className="shrink-0 text-zinc-400">· {note}</span>}
    </>
  );
}

/** A company with exactly one role: company, role and status on one line. */
function SingleRow({
  row,
  note,
  contacts,
  pending,
  onChange,
}: {
  row: ApplicationRow;
  note?: string;
  contacts: Contact[];
  pending: boolean;
  onChange: ChangeHandler;
}) {
  return (
    <li className="flex items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {row.company}
          </span>
          {row.score != null && (
            <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">
              {row.score}
            </span>
          )}
          {contacts.length > 0 && <Referrals contacts={contacts} />}
        </div>
        <div className="flex items-baseline gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <RoleLine row={row} note={note} />
        </div>
      </div>
      <StatusSelect row={row} pending={pending} onChange={onChange} />
    </li>
  );
}

/**
 * A company with several roles, collapsed to one line.
 *
 * Scopely has eleven, Brex and Roblox ten each. Flat, three companies filled
 * the whole list; collapsed, the company is one line until asked.
 */
function CompanyRows({
  group,
  noteOf,
  contacts,
  pendingId,
  onChange,
}: {
  group: CompanyGroup<ApplicationRow>;
  noteOf?: (row: ApplicationRow) => string | undefined;
  contacts: Contact[];
  pendingId: string | null;
  onChange: ChangeHandler;
}) {
  const [open, setOpen] = useState(false);
  const best = group.rows.reduce(
    (max, r) => Math.max(max, r.score ?? -1),
    -1
  );
  const statuses = [...new Set(group.rows.map((r) => r.status))];

  return (
    <li className="py-2">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-1.5">
            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {group.company}
            </span>
            {best >= 0 && (
              <span className="shrink-0 text-[11px] tabular-nums text-zinc-400">
                {best}
              </span>
            )}
            {contacts.length > 0 && <Referrals contacts={contacts} />}
          </span>
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            {group.rows.length} roles ·{" "}
            {statuses.map((s) => STATUS_LABELS[s]).join(", ")}
          </span>
        </span>
      </button>

      {open && (
        <ul className="ml-5 mt-1 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {group.rows.map((row) => (
            <li key={row.id} className="flex items-center gap-2 py-1">
              <span className="flex min-w-0 flex-1 items-baseline gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <RoleLine row={row} note={noteOf?.(row)} />
              </span>
              <StatusSelect
                row={row}
                pending={pendingId === row.id}
                onChange={onChange}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function RowList({
  rows,
  noteOf,
  contactsFor,
  pendingId,
  onChange,
}: {
  rows: ApplicationRow[];
  noteOf?: (row: ApplicationRow) => string | undefined;
  contactsFor: (key: string) => Contact[];
  pendingId: string | null;
  onChange: ChangeHandler;
}) {
  const [expanded, setExpanded] = useState(false);
  const companies = groupByCompany(rows);
  const visible = expanded ? companies : companies.slice(0, CAP);
  const hiddenRoles = companies
    .slice(CAP)
    .reduce((n, g) => n + g.rows.length, 0);

  return (
    <>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {visible.map((group) =>
          group.rows.length === 1 ? (
            <SingleRow
              key={group.key}
              row={group.rows[0]}
              note={noteOf?.(group.rows[0])}
              contacts={contactsFor(group.key)}
              pending={pendingId === group.rows[0].id}
              onChange={onChange}
            />
          ) : (
            <CompanyRows
              key={group.key}
              group={group}
              noteOf={noteOf}
              contacts={contactsFor(group.key)}
              pendingId={pendingId}
              onChange={onChange}
            />
          )
        )}
      </ul>
      {companies.length > CAP && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {expanded
            ? `Show top ${CAP} companies`
            : `Show all ${companies.length} companies — ${hiddenRoles} more role${
                hiddenRoles === 1 ? "" : "s"
              }`}
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
  contacts,
}: {
  rows: ApplicationRow[];
  today: string;
  /** Company key → contacts, from `buildContactIndex`. */
  contacts: Record<string, Contact[]>;
}) {
  const [rows, setRows] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const { urgent, fresh, groups } = buildPipelineViews(rows, today);
  const contactsFor = (key: string) => contacts[key] ?? [];

  async function onChange(id: string, status: PipelineStatus) {
    const before = rows.find((r) => r.id === id);
    setPendingId(id);
    setFailed(false);
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
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      // Roll back only this row rather than the whole array, so a failure
      // cannot discard edits made while the request was in flight.
      setRows((prev) => prev.map((r) => (r.id === id && before ? before : r)));
      setFailed(true);
    } finally {
      setPendingId(null);
    }
  }

  const listProps = { contactsFor, pendingId, onChange };

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
        hint="Live conversations first, then the applications that have waited longest."
        empty="Nothing urgent. Apply to something from New or Saved below."
      >
        <RowList
          rows={urgent}
          noteOf={(row) => (row as UrgentRow).reason}
          {...listProps}
        />
      </Section>

      <Section
        title="New"
        count={fresh.length}
        hint="Added in the last three days."
        empty="No new roles in the last three days."
      >
        <RowList rows={fresh} {...listProps} />
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
              <RowList rows={group.rows} {...listProps} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
