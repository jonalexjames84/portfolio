/**
 * Market Radar: turns one day's market snapshot into the short brief at the
 * top of the daily email — four snapshot lines, up to five actions, three
 * companies to watch.
 *
 * Design: https://claude.ai/artifact/9vAoFTNMWXKEV5C9V7dMky (version 6), chosen
 * 2026-10-07 and recorded on the portfolio project page in Notion.
 *
 * Actions come from fixed rules, not judgment, so the brief can run unattended.
 * Application actions say "prep": Jon submits every application himself.
 */

import { companyApplicationCap, normalizeCompany } from "./application-guard";
import type { BoardSummary, ChartApp, FormDFiling } from "./market-sources";

const DAY_MS = 86_400_000;
const MAX_ACTIONS = 5;
/** A role this new is worth acting on today. */
const FRESH_DAYS = 3;
/** Apps released within a year count as breakouts. */
const BREAKOUT_DAYS = 365;

/** Statuses that hold a company slot; `closed` and `withdrawn` release it. */
const OCCUPIES_SLOT = new Set(["claimed", "prepared", "submitted"]);

export interface BriefConnection {
  name: string;
  company_name: string | null;
  linkedin_url: string | null;
  next_action: string | null;
}

export interface BriefApplication {
  company: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
}

export interface MarketBriefInput {
  boards: BoardSummary[];
  /** Tech-industry Form D filings from the last 30 days. */
  filings: FormDFiling[];
  apps: ChartApp[];
  connections: BriefConnection[];
  applications: BriefApplication[];
  now: Date;
}

export interface BriefTile { label: string; value: string; detail: string }
export interface BriefAction { what: string; why: string; url: string; linkLabel: string }
export interface BriefWatch { name: string; reason: string; url: string }

export interface MarketBrief {
  tiles: BriefTile[];
  actions: BriefAction[];
  watch: BriefWatch[];
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMoney(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`;
  return `$${Math.round(n / 1e3)}K`;
}

function formatDay(iso: string): string {
  const d = new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function formatAgo(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** SEC filings shout names in capitals: "CHASE LOCHMILLER" → "Chase Lochmiller". */
function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function linkedInSearch(query: string): string {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
}

const isHold = (c: BriefConnection) => /^\s*HOLD/i.test(c.next_action || "");

// ---------------------------------------------------------------------------
// The brief
// ---------------------------------------------------------------------------

export function buildMarketBrief(input: MarketBriefInput): MarketBrief {
  const { boards, filings, apps, connections, applications, now } = input;
  const ageDays = (iso: string) => Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS);

  const contactsBy = groupBy(connections.filter((c) => c.company_name), (c) => normalizeCompany(c.company_name));
  const liveAppsBy = groupBy(applications.filter((a) => OCCUPIES_SLOT.has(a.status)), (a) => normalizeCompany(a.company));
  const fundingBy = new Map<string, FormDFiling>();
  for (const f of filings) {
    const k = normalizeCompany(f.company);
    const prev = fundingBy.get(k);
    if (!prev || (f.amountSold ?? 0) > (prev.amountSold ?? 0)) fundingBy.set(k, f);
  }

  const hasOpenSlot = (company: string) =>
    (liveAppsBy.get(normalizeCompany(company))?.length ?? 0) < companyApplicationCap(company);

  const hiring = boards
    .filter((b) => b.pmRoles.length > 0)
    .map((b) => {
      const key = normalizeCompany(b.company);
      const newest = ageDays(b.pmRoles[0].postedAt);
      const score =
        (1 + Math.log2(b.pmRoles.length)) * (newest <= 7 ? 1.3 : 1) +
        (b.leaderRoles.length ? 0.8 : 0) +
        (fundingBy.has(key) ? 1 : 0);
      return { board: b, key, newest, score, contacts: contactsBy.get(key) ?? [], openSlot: hasOpenSlot(b.company) };
    })
    .sort((a, b) => b.score - a.score);
  const hiringKeys = new Set(hiring.map((h) => h.key));

  // ---- snapshot tiles ----
  const allPm = boards.flatMap((b) => b.pmRoles.map((r) => ({ company: b.company, age: ageDays(r.postedAt) })));
  const thisWeek = allPm.filter((r) => r.age <= 6);
  const lastWeek = allPm.filter((r) => r.age >= 7 && r.age <= 13);
  const change = lastWeek.length ? Math.round((thisWeek.length / lastWeek.length - 1) * 100) : null;
  const breakouts = apps.filter((a) => a.releasedOn && ageDays(a.releasedOn) <= BREAKOUT_DAYS);
  const grossing = (a: ChartApp) => Object.keys(a.ranks).some((k) => k.startsWith("Top grossing"));
  const raised = [...fundingBy.values()];

  const tiles: BriefTile[] = [
    {
      label: "PM market",
      value: change == null ? `${thisWeek.length} PM roles this week` : `${change >= 0 ? "Up" : "Down"} ${Math.abs(change)}% this week`,
      detail: `${thisWeek.length} PM roles posted at ${new Set(thisWeek.map((r) => r.company)).size} tracked companies`,
    },
    {
      label: "Where you can apply",
      value: `${hiring.filter((h) => h.openSlot).length} companies`,
      detail: "are hiring PMs and don’t have your application yet",
    },
    {
      label: "New money",
      value: `${formatMoney(raised.reduce((s, f) => s + (f.amountSold ?? 0), 0))} raised`,
      detail: `by ${raised.length} tech companies in 30 days`,
    },
    {
      label: "Mobile",
      value: `${breakouts.length} new apps charting`,
      detail: `${breakouts.filter(grossing).length} already in top grossing`,
    },
  ];

  // ---- actions, most valuable first; one per company ----
  const actions: (BriefAction & { key: string })[] = [];
  const push = (key: string, a: BriefAction) => { if (!actions.some((x) => x.key === key)) actions.push({ key, ...a }); };

  for (const h of hiring) for (const c of h.contacts.filter(isHold)) {
    push(h.key, {
      what: `Message ${c.name} at ${h.board.company}`,
      why: `You were waiting for a PM req. There ${h.board.pmRoles.length === 1 ? "is 1" : `are ${h.board.pmRoles.length}`} open now.`,
      url: c.linkedin_url || linkedInSearch(`${c.name} ${h.board.company}`),
      linkLabel: "Open LinkedIn",
    });
  }
  for (const h of hiring.filter((h) => h.openSlot)) for (const c of h.contacts.filter((c) => !isHold(c))) {
    push(h.key, {
      what: `Ask ${c.name} for a referral at ${h.board.company}`,
      why: `${h.board.pmRoles.length} PM role${h.board.pmRoles.length === 1 ? "" : "s"} open, newest ${formatAgo(h.newest)}.`,
      url: c.linkedin_url || linkedInSearch(`${c.name} ${h.board.company}`),
      linkLabel: "Open LinkedIn",
    });
  }
  for (const h of hiring.filter((h) => h.openSlot && h.newest <= FRESH_DAYS).slice(0, 2)) {
    const role = h.board.pmRoles[0];
    push(h.key, {
      what: `Prep an application: ${h.board.company}, ${role.title}`,
      why: `Posted ${formatAgo(h.newest)}. Check it’s still open, then claim it before writing.`,
      url: role.url,
      linkLabel: "See role",
    });
  }
  const unpostedRaises = raised
    .filter((f) => !hiringKeys.has(normalizeCompany(f.company)) && f.people.length)
    .sort((a, b) => (b.amountSold ?? 0) - (a.amountSold ?? 0));
  const topRaise = unpostedRaises[0];
  if (topRaise) {
    const person = titleCase(topRaise.people[0].name);
    push(normalizeCompany(topRaise.company), {
      what: `Introduce yourself to ${person} at ${topRaise.company}`,
      why: `They raised ${formatMoney(topRaise.amountSold ?? 0)} on ${formatDay(topRaise.filedOn)} and haven’t posted a PM role yet.`,
      url: linkedInSearch(`${person} ${topRaise.company}`),
      linkLabel: "Find on LinkedIn",
    });
  }
  const followUp = hiring.find((h) => !h.openSlot && h.contacts.length);
  if (followUp) {
    const c = followUp.contacts[0];
    const live = liveAppsBy.get(followUp.key)![0];
    push(followUp.key + ":follow-up", {
      what: `Ask ${c.name} about your ${followUp.board.company} application`,
      why: `Submitted ${formatDay(live.submitted_at || live.created_at)}; they’ve posted ${followUp.board.pmRoles.length} PM role${followUp.board.pmRoles.length === 1 ? "" : "s"} in the last 30 days.`,
      url: c.linkedin_url || linkedInSearch(`${c.name} ${followUp.board.company}`),
      linkLabel: "Open LinkedIn",
    });
  }

  // ---- watch: no PM role posted yet, but something just happened ----
  const watch: BriefWatch[] = [];
  const nextRaise = unpostedRaises[1];
  if (nextRaise) watch.push({ name: nextRaise.company, reason: `raised ${formatMoney(nextRaise.amountSold ?? 0)}, ${formatDay(nextRaise.filedOn)}`, url: nextRaise.filingUrl });
  const bestBreakout = breakouts
    .filter(grossing)
    .filter((a) => !hiringKeys.has(normalizeCompany(a.developer)))
    .sort((a, b) => Math.min(...Object.values(a.ranks)) - Math.min(...Object.values(b.ranks)))[0];
  if (bestBreakout) watch.push({ name: bestBreakout.developer, reason: `${bestBreakout.name} is top grossing, out ${formatDay(bestBreakout.releasedOn!)}`, url: bestBreakout.url });
  // A leader role is itself a PM title, so "only leader roles open" is the
  // signal: the head of product arrives first and hires the team after.
  const newLeader = boards.find((b) => b.leaderRoles.length && b.pmRoles.length === b.leaderRoles.length);
  if (newLeader) watch.push({ name: newLeader.company, reason: `hiring a ${newLeader.leaderRoles[0].title}. A team comes next`, url: newLeader.leaderRoles[0].url });

  return {
    tiles,
    actions: actions.slice(0, MAX_ACTIONS).map((a) => ({ what: a.what, why: a.why, url: a.url, linkLabel: a.linkLabel })),
    watch,
  };
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    m.set(k, [...(m.get(k) ?? []), it]);
  }
  return m;
}
