/**
 * The 100-Day Plan's weekly quest sheet, delivered by email.
 *
 * Source of truth is Notion: each week is a row in the Friday Seven database
 * ("Fri Oct 9 · wk 3"), and that row's page carries the week's plan as day
 * headings ("Mon Oct 5 · 9–12 · Outreach: …") with to-dos under them. This
 * module turns that page into quests and renders the email. It does no I/O, so
 * all of it is tested; the Notion calls live in notion-plan.ts.
 *
 * Layout follows the approved artifact
 * https://claude.ai/artifact/HrZfdMiQEv39Z9ZyzA5c24, adapted for email: no
 * script, inline styles, tables, and days stacked so it reads on a phone.
 */

import { addDays, dayOfWeek, upcomingMonday } from "./dates";

/** Friday of week 1. Day 1 of the plan was Tue Sep 22, 2026. */
export const PLAN_FIRST_FRIDAY = "2026-09-25";
/** Week 14 is the short last week, and its row is titled "Wed Dec 23 · day 100". */
export const PLAN_LAST_WEEK = 14;
export const PLAN_LAST_DAY = "2026-12-23";
export const PLAN_TOTAL_DAYS = 93;
export const PLAN_FIRST_DAY = "2026-09-22";

export type QuestKind = "app" | "out" | "conv" | "work" | "boss";

// OPEN QUESTION (Jon): these are the prototype's first guess and not decided.
export const XP: Record<QuestKind, number> = { app: 50, out: 20, conv: 30, work: 40, boss: 25 };

export const TARGETS = { applications: 5, floor: 4, outreach: 5 };

export interface Quest {
  title: string;
  note: string;
  kind: QuestKind;
  done: boolean;
  optional: boolean;
}

export interface QuestDay {
  day: string; // "Mon"
  when: string; // "9–12 · Outreach: recruiters first (5 touches)"
  quests: Quest[];
}

/** The Friday Seven numbers that have to be entered for the week to count as filled out. */
export const FRIDAY_SEVEN_FIELDS = ["Applications", "Outreach", "Conversations", "Screens"] as const;
export type FridaySevenNumbers = Partial<Record<(typeof FRIDAY_SEVEN_FIELDS)[number] | "Listed" | "Sold", number | null>>;

// ------------------------------------------------------------------ weeks

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

export function weekNumberForFriday(friday: string): number {
  return daysBetween(PLAN_FIRST_FRIDAY, friday) / 7 + 1;
}

/** The Friday of the week the Sunday email is planning. */
export function upcomingFriday(today: string): string {
  return addDays(upcomingMonday(today), 4);
}

/** The most recent Friday on or before `today`: the week a reminder is chasing. */
export function lastFriday(today: string): string {
  const back = (dayOfWeek(today) - 5 + 7) % 7;
  return addDays(today, -back);
}

/** Is week `n` inside the 100 days? */
export function inPlan(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= PLAN_LAST_WEEK;
}

/** Which Friday Seven row title belongs to week `n`. */
export function rowMatchesWeek(title: string, n: number): boolean {
  if (n === PLAN_LAST_WEEK) return /day 100/i.test(title);
  const m = title.match(/\bwk (\d+)\b/i);
  return m !== null && Number(m[1]) === n;
}

/** "Fri Oct 9" for a YYYY-MM-DD. */
export function shortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  }).replace(",", "");
}

// ------------------------------------------------------------------ parsing

export interface PlanBlock {
  type: "heading" | "todo" | "other";
  text: string;
  checked?: boolean;
}

const DAY_HEADING = /^(Mon|Tue|Wed|Thu|Fri)\b/;

/**
 * Day headings start a day; any other heading ends it ("Decisions only you can
 * make" is not a quest list). To-dos outside a day are ignored.
 */
export function parsePlan(blocks: PlanBlock[]): QuestDay[] {
  const days: QuestDay[] = [];
  let current: QuestDay | null = null;
  for (const b of blocks) {
    if (b.type === "heading") {
      const m = b.text.match(DAY_HEADING);
      if (m) {
        const parts = b.text.split(" · ");
        current = { day: m[1], when: parts.slice(1).join(" · "), quests: [] };
        days.push(current);
      } else {
        current = null;
      }
    } else if (b.type === "todo" && current) {
      current.quests.push(toQuest(b.text, b.checked ?? false, current.when));
    }
  }
  return days.filter((d) => d.quests.length > 0);
}

function toQuest(text: string, done: boolean, heading: string): Quest {
  const [title, ...rest] = text.split(" · ");
  return {
    title: title.trim(),
    note: rest.join(" · ").trim(),
    kind: classify(text, heading),
    done,
    optional: /\b(only if|optional)\b/i.test(text),
  };
}

/** The day's heading names the block; a few quests inside it are another kind. */
export function classify(text: string, heading: string): QuestKind {
  if (/friday seven/i.test(text)) return "boss";
  if (/outreach/i.test(heading)) return "out";
  if (/application/i.test(heading)) return "app";
  if (/conversation/i.test(heading)) {
    return /\b(ask|referral)\b/i.test(text) ? "out" : "conv";
  }
  return "work";
}

// ------------------------------------------------------------------ scoring

export function isFilledOut(numbers: FridaySevenNumbers): boolean {
  return FRIDAY_SEVEN_FIELDS.every((f) => typeof numbers[f] === "number");
}

export function summarize(days: QuestDay[]) {
  const quests = days.flatMap((d) => d.quests);
  const required = quests.filter((q) => !q.optional);
  const count = (kind: QuestKind, done?: boolean) =>
    quests.filter((q) => q.kind === kind && (done === undefined || q.done === done)).length;
  return {
    tiers: required.length,
    tiersDone: required.filter((q) => q.done).length,
    xp: quests.filter((q) => q.done).reduce((s, q) => s + XP[q.kind], 0),
    maxXp: required.reduce((s, q) => s + XP[q.kind], 0),
    apps: { total: count("app"), done: count("app", true) },
    outreach: { total: count("out"), done: count("out", true) },
  };
}

// ------------------------------------------------------------------ email

const C = {
  ink: "#1b1f2a", muted: "#5d6472", rule: "#d6d3cc", gold: "#b07800", goldSoft: "#f7ecd0",
  done: "#2f7a4f", paper: "#fbfaf7",
};
const DISPLAY = "'Chakra Petch', 'Arial Narrow', Arial, sans-serif";
const BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

export function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

export interface QuestSheetEmailInput {
  week: number;
  friday: string;
  days: QuestDay[];
  rowUrl: string | null;
  /** Last week's Friday Seven, to show the score and nag if it's still empty. */
  lastWeek: { numbers: FridaySevenNumbers; rowUrl: string | null } | null;
}

function pips(total: number, on: number, floor: number): string {
  const cells = Array.from({ length: total }, (_, i) => {
    const bg = i < on ? C.ink : "#ffffff";
    const under = floor && i + 1 === floor ? `box-shadow: inset 0 -3px 0 ${C.gold};` : "";
    return `<td style="width:20px;height:12px;border:1.5px solid ${C.ink};background:${bg};${under}"></td><td style="width:3px"></td>`;
  }).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

function passTrack(tiers: number, done: number): string {
  const half = Math.ceil(tiers / 2);
  const cells = Array.from({ length: tiers }, (_, i) => {
    const n = i + 1;
    const star = n === half || n === tiers;
    const bg = n <= done ? C.ink : "#ffffff";
    const fg = n <= done ? "#ffffff" : C.muted;
    const border = star ? `2.5px solid ${C.gold}` : `1.5px solid ${C.ink}`;
    return `<td style="border:${border};background:${bg};color:${fg};font:600 9px ${MONO};text-align:center;height:26px;vertical-align:bottom;padding:0 0 2px">${star ? `<div style="color:${C.gold};font-size:10px;line-height:1">★</div>` : ""}${n}</td>`;
  }).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="2" style="table-layout:fixed"><tr>${cells}</tr></table>
    <div style="font:11px ${BODY};color:${C.muted};margin-top:4px"><b style="color:${C.gold}">★ ${half}</b> Halfway &nbsp; <b style="color:${C.gold}">★ ${tiers}</b> Full clear</div>`;
}

function questRow(q: Quest): string {
  const box = q.done
    ? `<td style="width:16px;height:16px;background:${C.done};border:1.6px solid ${C.done};color:#fff;font:700 11px ${BODY};text-align:center">✓</td>`
    : `<td style="width:16px;height:16px;border:1.6px ${q.optional ? "dashed" : "solid"} ${C.ink}"></td>`;
  const title = q.done
    ? `<s style="color:${C.muted}">${esc(q.title)}</s>`
    : esc(q.title);
  const note = [q.note, q.optional ? "optional" : ""].filter(Boolean).join(" · ");
  return `<tr><td style="padding:5px 0;vertical-align:top;width:24px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>${box}</tr></table></td>
    <td style="padding:4px 0;font:500 14px ${BODY};color:${C.ink}">${title}
      ${note ? `<div style="font:12px ${BODY};color:${C.muted}">${esc(note)}</div>` : ""}</td>
    <td style="padding:4px 0;text-align:right;vertical-align:top;font:600 11px ${MONO};color:${C.gold};white-space:nowrap">+${XP[q.kind]} XP</td></tr>`;
}

function card(inner: string, opts: { border?: string; bg?: string } = {}): string {
  return `<div style="background:${opts.bg ?? "#ffffff"};border:${opts.border ?? `1px solid ${C.rule}`};padding:16px 18px;margin-bottom:14px">${inner}</div>`;
}

function h3(text: string): string {
  return `<div style="font:700 13px ${DISPLAY};letter-spacing:.08em;text-transform:uppercase;color:${C.ink};margin:0 0 8px">${esc(text)}</div>`;
}

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${C.ink};color:#ffffff;padding:10px 18px;font:700 13px ${DISPLAY};letter-spacing:.06em;text-transform:uppercase;text-decoration:none">${esc(label)}</a>`;
}

function shell(eyebrow: string, title: string, sub: string, body: string): string {
  return `<div style="background:${C.paper};padding:20px 12px">
  <div style="max-width:600px;margin:0 auto;font:14px ${BODY};color:${C.ink}">
    <div style="border-bottom:3px solid ${C.ink};padding-bottom:10px;margin-bottom:16px">
      <div style="font:600 11px ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${C.muted}">${esc(eyebrow)}</div>
      <div style="font:700 30px/1.1 ${DISPLAY};margin:4px 0">${esc(title)}</div>
      <div style="font:600 11px ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">${esc(sub)}</div>
    </div>
    ${body}
  </div></div>`;
}

export function planDayRange(friday: string): { first: number; last: number } {
  const monday = addDays(friday, -4);
  const first = Math.max(1, daysBetween(PLAN_FIRST_DAY, monday) + 1);
  const last = Math.min(PLAN_TOTAL_DAYS, daysBetween(PLAN_FIRST_DAY, friday) + 1);
  return { first, last };
}

export function phaseFor(week: number): string {
  if (week <= 2) return "Phase 1 · Clear the decks";
  if (week <= 8) return "Phase 2 · Build the pipeline";
  if (week <= 12) return "Phase 3 · Convert";
  return "Phase 4 · Land or position";
}

export function renderQuestSheetEmail(input: QuestSheetEmailInput): { subject: string; html: string } {
  const { week, friday, days, rowUrl, lastWeek } = input;
  const s = summarize(days);
  const { first, last } = planDayRange(friday);
  const monday = addDays(friday, -4);
  const sub = `${shortDate(monday)} – ${shortDate(friday)} · Days ${first}–${last} of ${PLAN_TOTAL_DAYS}`;

  const parts: string[] = [];

  if (lastWeek && !isFilledOut(lastWeek.numbers)) {
    parts.push(card(
      `${h3("Last week's Friday Seven is still empty")}
       <p style="margin:0 0 10px;font:14px ${BODY}">Enter last week's numbers before this week starts. The under-floor check only works if every week has a score.</p>
       ${lastWeek.rowUrl ? button(lastWeek.rowUrl, "Fill in last week") : ""}`,
      { border: `2px solid ${C.gold}`, bg: C.goldSoft },
    ));
  }

  if (days.length === 0) {
    parts.push(card(
      `${h3("No quests planned yet")}
       <p style="margin:0 0 10px;font:14px ${BODY}">The week ${week} row in Friday Seven has no day-by-day plan. Add headings like "Mon · 9–12 · Outreach" with to-dos under them, or ask Claude to tee up the week, and the next email will carry them.</p>
       ${rowUrl ? button(rowUrl, "Open week " + week + " in Notion") : ""}`,
    ));
  } else {
    parts.push(card(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>${h3("Weekly pass")}</td>
        <td style="text-align:right;font:700 18px ${DISPLAY}">${s.xp} <span style="color:${C.muted};font-size:14px">/ ${s.maxXp} XP</span></td></tr></table>
       ${passTrack(s.tiers, s.tiersDone)}`,
    ));

    for (const d of days) {
      parts.push(card(
        `<div style="font:600 11px ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${C.muted};margin-bottom:2px">${esc(d.day)}</div>
         ${h3(d.when || d.day)}
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${d.quests.map(questRow).join("")}</table>`,
        { border: `1px solid ${C.rule}` },
      ));
    }

    parts.push(card(
      `${h3("Weekly challenges")}
       <div style="font:13px ${BODY};margin:0 0 4px">Applications <span style="color:${C.muted};font:11px ${MONO}">target ${TARGETS.applications} · floor ${TARGETS.floor} (gold)</span></div>
       ${pips(Math.max(s.apps.total, TARGETS.floor), s.apps.done, TARGETS.floor)}
       <div style="font:13px ${BODY};margin:10px 0 4px">Outreach touches <span style="color:${C.muted};font:11px ${MONO}">target ${TARGETS.outreach}</span></div>
       ${pips(Math.max(s.outreach.total, TARGETS.outreach), s.outreach.done, 0)}`,
    ));
  }

  parts.push(card(
    `${h3("Boss: the Friday Seven · Fri 4:30")}
     <p style="margin:0 0 10px;font:14px ${BODY}">Five minutes. Applications, outreach, conversations, screens, listed, sold, and one sentence on what moved. Reminders start Friday at 5pm and stop as soon as the numbers are in.</p>
     ${rowUrl ? button(rowUrl, `Open week ${week} in Notion`) : ""}`,
    { border: `2.5px solid ${C.ink}` },
  ));

  parts.push(`<div style="font:11px ${MONO};color:${C.muted};text-align:center">Tick quests in Notion and the next email shows them crossed off. Notion is the source of truth.</div>`);

  const subject = days.length === 0
    ? `Week ${week} quest sheet: nothing planned yet`
    : `Week ${week} quest sheet: ${s.tiers} quests, ${s.maxXp} XP`;
  return { subject, html: shell(`100-Day Plan · ${phaseFor(week)}`, `Week ${week} Quest Sheet`, sub, parts.join("")) };
}

/** Friday 5pm is the first ask; Saturday and Sunday mornings escalate. */
export function reminderOrdinal(today: string): number {
  const d = dayOfWeek(today);
  return d === 5 ? 1 : d === 6 ? 2 : 3;
}

export function renderReminderEmail(input: {
  week: number;
  numbers: FridaySevenNumbers;
  rowUrl: string | null;
  attempt: number;
}): { subject: string; html: string } {
  const { week, numbers, rowUrl, attempt } = input;
  const missing = FRIDAY_SEVEN_FIELDS.filter((f) => typeof numbers[f] !== "number");
  const label = attempt === 1 ? "" : attempt === 2 ? " (second reminder)" : " (third reminder)";
  const subject = `Friday Seven, week ${week}: 5 minutes${label}`;
  const body = card(
    `${h3("The boss is waiting")}
     <p style="margin:0 0 8px;font:14px ${BODY}">Week ${week}'s Friday Seven still needs: <b>${missing.map(esc).join(", ")}</b>.</p>
     <p style="margin:0 0 12px;font:14px ${BODY}">Two weeks in a row under the floor means change the plan, not try harder, and that check only works with numbers in it. Fill them in and these reminders stop.</p>
     ${rowUrl ? button(rowUrl, `Fill in week ${week}`) : ""}`,
    { border: `2.5px solid ${C.ink}` },
  );
  return { subject, html: shell("100-Day Plan · Friday Seven", `Week ${week} isn't scored yet`, "Reminders stop when the numbers are in", body) };
}
