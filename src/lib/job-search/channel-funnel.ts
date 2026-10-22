/**
 * The channel funnel for the Sunday quest sheet: which way of reaching people
 * turns into a referral or JD, and which of those turn into interviews.
 *
 * The numbers come from the `plan_channel_funnel` view (red-ox-mobile), built
 * on `plan_touchpoints`. The hundred-days Channels panel reads the same view, so
 * the email and the dashboard can't disagree. This module does no I/O.
 *
 * Spec: the approved artifact https://claude.ai/artifact/NrVYT7fMYSp7Tyv1YagjAD
 * ("Sunday email · new section"). Decided there: the referral is the conversion,
 * meetings are tracked but aren't one, and it's one running total since Sep 22.
 *
 * OPEN QUESTION (Jon): does an agency recruiter's JD count the same as an inside
 * referral? Right now it does.
 * OPEN QUESTION (Jon): is an interview only a live call with the hiring company?
 * Right now recruiter calls are meetings and assessments are assessments.
 */

import { esc, shortDate } from "./quest-sheet";

/** The hundred-days Channels panel, where touches get logged. */
export const CHANNELS_APP_URL = "https://hundred-days-pi.vercel.app/#channels";

/** One row of `plan_channel_funnel`. Null means the stage isn't tracked for that bucket, never zero. */
export interface FunnelRow {
  bucket: string;
  label: string;
  sort: number;
  sent: number | null;
  replied: number | null;
  meetings: number;
  referrals: number | null;
  assessments: number | null;
  interviews: number;
  interview_companies: string[];
}

/** A referral someone has promised but not made yet. */
export interface AlmostReferral {
  person: string;
  company: string | null;
  note: string | null;
}

/** A logged touch with no channel, so it can't land in any funnel. */
export interface MissingChannel {
  person: string;
  kind: string;
  format: string | null;
  occurred_on: string;
}

export interface ChannelSectionInput {
  rows: FunnelRow[];
  almost: AlmostReferral[];
  missing: MissingChannel[];
}

/** Buckets where Jon sends the first message. Their rate is referrals per message sent. */
export const OUTBOUND = ["email", "linkedin", "text", "phone", "in_person", "other"];

export function referralRate(r: FunnelRow): number | null {
  if (!r.sent || r.referrals == null) return null;
  return Math.round((100 * r.referrals) / r.sent);
}

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

function interviewSource(r: FunnelRow): string {
  const who = r.interview_companies.join(", ");
  if (r.bucket === "inbound") return `a recruiter who reached out (${who})`;
  if (r.bucket === "ats") return `an application (${who})`;
  return `a referral (${who})`;
}

/** The section's lead: which channel converts best, and where the interviews came from. */
export function channelLead(rows: FunnelRow[]): string {
  const ranked = rows
    .filter((r) => OUTBOUND.includes(r.bucket) && (r.sent ?? 0) > 0)
    .map((r) => ({ r, rate: referralRate(r) ?? 0 }))
    .sort((a, b) => b.rate - a.rate);

  const parts: string[] = [];
  if (ranked.length > 0) {
    const [top, ...rest] = ranked;
    const others = rest.map((x) => `${x.r.label} ${x.rate}%`).join(", ");
    parts.push(`${top.r.label} turns ${top.rate}% of messages into a referral or JD${others ? `, ${others}` : ""}.`);
  }

  const sources = rows.filter((r) => r.interviews > 0).sort((a, b) => a.sort - b.sort);
  const total = sources.reduce((n, r) => n + r.interviews, 0);
  if (total === 0) {
    parts.push("No interviews yet.");
  } else {
    const fromApps = sources.some((r) => r.bucket === "ats");
    const count = total === 1 ? "The one interview" : total === 2 ? "Both interviews" : `All ${WORDS[total] ?? total} interviews`;
    const list = sources.map(interviewSource);
    const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}` : list[0];
    parts.push(`${count} so far came from ${fromApps ? "" : "people, not applications: "}${joined}.`);
  }
  return parts.join(" ");
}

/** Rows worth a line in the table: anything with activity, plus Text, which is the one most likely to be missing. */
export function visibleRows(rows: FunnelRow[]): FunnelRow[] {
  return rows
    .filter((r) => r.bucket === "text" || (r.sent ?? 0) > 0 || (r.referrals ?? 0) > 0 || r.interviews > 0)
    .sort((a, b) => a.sort - b.sort);
}

/** "coffee Thu Oct 22", "reply Fri Sep 25". */
export function missingWhat(m: MissingChannel): string {
  const what = m.format && m.format !== "message" ? m.format : m.kind;
  return `${what} ${shortDate(m.occurred_on)}`;
}

const C = { ink: "#1b1f2a", muted: "#5d6472", rule: "#d6d3cc", blue: "#1c5cab", track: "#efece4" };
const DISPLAY = "'Chakra Petch', 'Arial Narrow', Arial, sans-serif";
const BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

const dash = (n: number | null) => (n == null ? "—" : String(n));

function lastCell(r: FunnelRow): string {
  const rate = OUTBOUND.includes(r.bucket) ? referralRate(r) : null;
  if (rate != null) {
    // A 70px track; the fill is the rate, with a sliver so a 1% still shows.
    const w = Math.max(rate > 0 ? 2 : 0, Math.round((70 * rate) / 100));
    return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:70px;height:8px;background:${C.track};padding:0"><div style="width:${w}px;height:8px;background:${C.blue}"></div></td>
      <td style="padding-left:6px;font:600 12px ${MONO};color:${C.ink}">${rate}%</td></tr></table>`;
  }
  if (r.bucket === "ats") {
    const n = r.assessments ?? 0;
    return n > 0 ? `${n} assessment${n === 1 ? "" : "s"}` : "";
  }
  return esc(r.interview_companies.join(", "));
}

function row(r: FunnelRow): string {
  const td = `padding:9px 5px;border-bottom:1px solid ${C.rule};text-align:right;font:13px ${MONO};white-space:nowrap`;
  if (r.bucket === "text" && !r.sent && !r.referrals && !r.interviews) {
    return `<tr><td style="padding:9px 0;border-bottom:1px solid ${C.rule};font:600 13px ${BODY};color:${C.muted}">Text</td>
      <td colspan="6" style="padding:9px 5px;border-bottom:1px solid ${C.rule};font:12.5px ${BODY};color:${C.muted}">Nothing logged yet. Texts only count if you log them on the dashboard.</td></tr>`;
  }
  const sent = r.bucket === "inbound" && r.sent != null ? `${r.sent} in` : dash(r.sent);
  return `<tr><td style="padding:9px 0;border-bottom:1px solid ${C.rule};font:600 13px ${BODY}">${esc(r.label)}</td>
    <td style="${td}">${sent}</td>
    <td style="${td}">${dash(r.replied)}</td>
    <td style="${td}">${r.meetings}</td>
    <td style="${td};font-weight:700;color:${C.blue}">${dash(r.referrals)}</td>
    <td style="${td}">${r.interviews}</td>
    <td style="padding:9px 0 9px 8px;border-bottom:1px solid ${C.rule};font:12px ${BODY};color:${C.muted}">${lastCell(r)}</td></tr>`;
}

function box(title: string, lines: string[], foot: string): string {
  return `<div style="border:1px solid ${C.rule};background:#ffffff;padding:14px 16px;margin-bottom:14px">
    <div style="font:700 13px ${DISPLAY};letter-spacing:.08em;text-transform:uppercase;color:${C.ink};margin:0 0 8px">${esc(title)}</div>
    <div style="font:13px/1.6 ${BODY};color:${C.ink}">${lines.join("<br>")}</div>
    <div style="font:12px ${BODY};color:${C.muted};margin-top:6px">${foot}</div></div>`;
}

/** The email section: the funnel table, then the follow-ups and the touches missing a channel. */
export function renderChannelSection(input: ChannelSectionInput): string {
  const { rows, almost, missing } = input;
  const link = `<a href="${CHANNELS_APP_URL}" style="color:${C.ink}">hundred-days › Channels</a>`;
  const th = `padding:6px 5px;border-bottom:1px solid ${C.rule};font:600 10px ${MONO};letter-spacing:.05em;text-transform:uppercase;color:${C.muted};text-align:right`;
  const heads = ["Sent", "Replied", "Meetings", "Referral / JD", "Interview"].map((h) => `<th style="${th}">${h}</th>`).join("");

  const parts = [`<div style="background:#ffffff;border:1px solid ${C.rule};padding:16px 18px;margin-bottom:14px">
    <div style="font:700 13px ${DISPLAY};letter-spacing:.08em;text-transform:uppercase;color:${C.ink};margin:0 0 8px">Funnel by channel · since Sep 22</div>
    <p style="margin:0 0 12px;font:15px/1.45 ${BODY};color:${C.ink}">${esc(channelLead(rows))}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr><th style="${th};text-align:left;padding-left:0">Channel</th>${heads}<th style="${th};text-align:left;padding-left:8px;width:120px">Sent → referral</th></tr>
      ${visibleRows(rows).map(row).join("")}
    </table>
    <div style="font:12.5px/1.5 ${BODY};color:${C.muted};margin-top:10px">The referral is the conversion. Meetings are tracked but don't count as a conversion. The full chart is on the dashboard: ${link}</div>
  </div>`];

  if (almost.length > 0) {
    parts.push(box(
      "Almost a referral",
      almost.map((a) => [a.person, a.company, a.note].filter(Boolean).map((s) => esc(s!)).join(" · ")),
      "Follow up on these first. Each one is a reply away from turning into a referral.",
    ));
  }

  if (missing.length > 0) {
    parts.push(box(
      "Missing a channel",
      missing.map((m) => `${esc(m.person)} · ${esc(missingWhat(m))} · how did you connect?`),
      `One tap on the dashboard logs it: ${link}`,
    ));
  }

  return parts.join("");
}
