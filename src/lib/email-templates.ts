import { renderSparklineSvg } from "@/lib/job-search/sparkline";
import type { Signal } from "@/lib/job-search/signals";

const DASHBOARD_URL = "https://portfolio.jonnymartin.blog/dashboard/job-search";
const HUB_URL = "https://portfolio.jonnymartin.blog/job-search";

export const TARGETS = {
  applications_sent: 5,
  outreach_sent: 5,
  follow_ups_sent: 3,
  linkedin_posts: 3,
  conversations: 2,
};

export function emailWrapper(title: string, subtitle: string, body: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="padding: 24px 0;">
        <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0;">${title}</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">${subtitle}</p>
      </div>
      ${body}
      <div style="padding: 16px 0; text-align: center;">
        <a href="${DASHBOARD_URL}" style="display: inline-block; background: #0d9488; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard</a>
        <a href="${HUB_URL}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-left: 8px;">Job Search Hub</a>
      </div>
    </div>
  `;
}

export function progressBar(actual: number, target: number, label: string): string {
  const pct = Math.min(Math.round((actual / target) * 100), 100);
  const color = pct >= 100 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
        <span style="color: #374151; font-weight: 500;">${label}</span>
        <span style="color: ${color}; font-weight: 700;">${actual}/${target}</span>
      </div>
      <div style="background: #f3f4f6; border-radius: 6px; height: 8px; overflow: hidden;">
        <div style="background: ${color}; height: 100%; width: ${pct}%; border-radius: 6px;"></div>
      </div>
    </div>
  `;
}

export function scorecardSection(counts: Record<string, number>, headerExtra?: string): string {
  const header = headerExtra
    ? `<h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 4px;">Weekly Progress</h2>
       <p style="font-size: 12px; color: #6b7280; margin: 0 0 16px;">${headerExtra}</p>`
    : `<h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px;">Weekly Progress</h2>`;

  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      ${header}
      ${progressBar(counts.apply || 0, TARGETS.applications_sent, "Applications")}
      ${progressBar(counts.outreach || 0, TARGETS.outreach_sent, "Outreach")}
      ${progressBar(counts.follow_up || 0, TARGETS.follow_ups_sent, "Follow-ups")}
      ${progressBar(counts.linkedin_post || 0, TARGETS.linkedin_posts, "LinkedIn Posts")}
      ${progressBar(counts.conversations || 0, TARGETS.conversations, "Conversations")}
    </div>
  `;
}

export function signalBox(signals: string[]): string {
  if (signals.length === 0) return "";
  return `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 8px;">Signals</h2>
      ${signals.map((s) => `<p style="color: #78350f; font-size: 13px; margin: 4px 0;">${s}</p>`).join("")}
    </div>
  `;
}

export function networkGrowthSection(stats: { newConnections: number; referralChanges: number; materialsCreated: number }): string {
  const items = [
    { label: "New Connections", value: stats.newConnections, color: "#10b981" },
    { label: "Referral Updates", value: stats.referralChanges, color: "#8b5cf6" },
    { label: "Materials Created", value: stats.materialsCreated, color: "#3b82f6" },
  ];
  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">This Week's Activity</h2>
      <div style="display: flex; gap: 12px; text-align: center;">
        ${items.map((i) => `
          <div style="flex: 1; padding: 8px; background: ${i.color}10; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: 700; color: ${i.color};">${i.value}</div>
            <div style="font-size: 11px; color: #6b7280;">${i.label}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function checkAuth(request: { headers: { get: (name: string) => string | null } }): boolean {
  if (request.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`) return true;
  if (request.headers.get("authorization") === `Bearer ${process.env.JOB_SEARCH_API_KEY}`) return true;
  return false;
}

export function getWeekBounds(): { weekStartStr: string; weekEndStr: string; dayOfWeek: number; weekdaysPassed: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = new Date(weekStart.getTime() + 6 * 86400000).toISOString().split("T")[0];
  const weekdaysPassed = dayOfWeek === 0 ? 5 : Math.min(dayOfWeek, 5);
  return { weekStartStr, weekEndStr, dayOfWeek, weekdaysPassed };
}

export const categoryEmoji: Record<string, string> = {
  apply: "\ud83d\udcdd",
  outreach: "\ud83d\udce7",
  follow_up: "\ud83d\udd04",
  content: "\u270d\ufe0f",
  linkedin_post: "\ud83d\udcf1",
  prep: "\ud83d\udcda",
  admin: "\u2699\ufe0f",
};

export const impactColor: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export type NewJob = {
  id: string;
  company: string;
  role: string;
  score: number;
  scoreSource: "manual" | "auto";
  breakdown: {
    title_match: number;
    seniority_fit: number;
    keyword_match: number;
    industry_fit: number;
    stage_fit: number;
    red_flags: number;
  } | null;
  job_url: string | null;
};

export function newJobsSection(jobs: NewJob[]): string {
  if (jobs.length === 0) {
    return `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 8px;">🆕 New Jobs (last 24h)</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">No new jobs in the last 24h.</p>
      </div>
    `;
  }

  const top = jobs.slice(0, 5);
  const rest = jobs.slice(5);

  const cards = top
    .map((j, i) => {
      const color = j.score >= 80 ? "#10b981" : j.score >= 65 ? "#3b82f6" : "#f59e0b";
      const breakdownLine = j.breakdown
        ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Title ${j.breakdown.title_match} · Seniority ${j.breakdown.seniority_fit} · Keywords ${j.breakdown.keyword_match} · Industry ${j.breakdown.industry_fit} · Stage ${j.breakdown.stage_fit}${j.breakdown.red_flags ? ` · Flags ${j.breakdown.red_flags}` : ""}</div>`
        : "";
      const sourceTag =
        j.scoreSource === "auto"
          ? `<span style="font-size: 10px; color: #9ca3af; margin-left: 6px;">auto</span>`
          : "";
      return `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-size: 14px; font-weight: 700; color: #111827;">#${i + 1} ${j.role}</div>
              <div style="font-size: 12px; color: #6b7280;">${j.company}</div>
            </div>
            <div style="background: ${color}15; color: ${color}; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 700;">${j.score}/100${sourceTag}</div>
          </div>
          ${breakdownLine}
          ${j.job_url ? `<a href="${j.job_url}" style="display: inline-block; margin-top: 8px; color: #0d9488; text-decoration: none; font-size: 12px; font-weight: 600;">View posting →</a>` : ""}
        </div>
      `;
    })
    .join("");

  const restLine =
    rest.length > 0
      ? `<p style="font-size: 12px; color: #6b7280; margin: 8px 0 0;"><strong>Also found:</strong> ${rest.map((j) => `${j.company} ${j.role} (${j.score})`).join(" · ")}</p>`
      : "";

  return `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #166534; margin: 0 0 12px;">🆕 New Jobs (last 24h, ranked by fit)</h2>
      ${cards}
      ${restLine}
    </div>
  `;
}

export type WeekViewTask = {
  id: string;
  task: string;
  company: string | null;
  category: string;
  impact: "high" | "medium" | "low";
  done: boolean;
};

export type WeekDay = {
  date: string;
  label: string;     // "MON", "TUE", etc.
  isToday: boolean;
  tasks: WeekViewTask[];
};

export function weekViewSection(days: WeekDay[]): string {
  const dayBlocks = days
    .map((d) => {
      const doneCount = d.tasks.filter((t) => t.done).length;
      const headerBg = d.isToday ? "#0d9488" : "#f3f4f6";
      const headerColor = d.isToday ? "white" : "#374151";
      const taskRows = d.tasks
        .map((t) => {
          const emoji = categoryEmoji[t.category] || "📋";
          const checkbox = t.done ? "☑" : "☐";
          const strike = t.done ? "text-decoration: line-through; color: #9ca3af;" : "color: #111827;";
          const impactBadge = `<span style="background: ${impactColor[t.impact]}15; color: ${impactColor[t.impact]}; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-left: 6px;">${t.impact.toUpperCase()}</span>`;
          return `
            <div style="font-size: 13px; margin: 4px 0; ${strike}">
              ${checkbox} ${emoji} ${t.task}${t.company ? ` <span style="color: #6b7280;">— ${t.company}</span>` : ""}${impactBadge}
            </div>
          `;
        })
        .join("");
      const empty =
        d.tasks.length === 0
          ? `<div style="font-size: 12px; color: #9ca3af; padding: 4px 0;">No tasks</div>`
          : "";
      return `
        <div style="margin-bottom: 12px;">
          <div style="background: ${headerBg}; color: ${headerColor}; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; display: flex; justify-content: space-between;">
            <span>${d.label}${d.isToday ? " (today)" : ""}</span>
            <span>${doneCount}/${d.tasks.length}</span>
          </div>
          <div style="padding: 6px 10px;">${taskRows}${empty}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">📅 This Week's Tasks</h2>
      ${dayBlocks}
    </div>
  `;
}

export type MetricRow = {
  label: string;
  current: number;
  target: number | null;
  history: number[]; // 5 values: last 4 weeks + this week
  unit?: "" | "%" | "/wk";
};

function deltaArrow(history: number[]): string {
  if (history.length < 2) return "—";
  const cur = history[history.length - 1];
  const prev = history[history.length - 2];
  if (cur > prev) return `<span style="color: #10b981;">↑</span>`;
  if (cur < prev) return `<span style="color: #ef4444;">↓</span>`;
  return `<span style="color: #6b7280;">flat</span>`;
}

export function metricsSection(rows: MetricRow[]): string {
  const rowsHtml = rows
    .map((r) => {
      const display =
        r.unit === "%"
          ? `${Math.round(r.current * 100)}%`
          : r.target
          ? `${r.current}/${r.target}`
          : `${r.current}`;
      return `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #374151;">${r.label}</td>
          <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600;">${display}</td>
          <td style="padding: 8px 0;">${renderSparklineSvg(r.history)}</td>
          <td style="padding: 8px 0; font-size: 12px; text-align: right;">${deltaArrow(r.history)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">📊 Metrics</h2>
      <table style="width: 100%; border-collapse: collapse;">${rowsHtml}</table>
    </div>
  `;
}

export function signalsSection(signals: Signal[]): string {
  if (signals.length === 0) return "";
  return `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #92400e; margin: 0 0 8px;">⚠️ Signals</h2>
      ${signals.map((s) => `<p style="color: #78350f; font-size: 13px; margin: 4px 0;">${s.message}</p>`).join("")}
    </div>
  `;
}
