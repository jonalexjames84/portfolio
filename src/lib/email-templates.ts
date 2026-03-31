const DASHBOARD_URL = "https://portfolio.jonnymartin.blog/dashboard/job-search";

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

export function pipelineBoxes(funnel: { applied: number; screen: number; interview: number; offer: number }): string {
  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h2 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 12px;">Pipeline</h2>
      <div style="display: flex; gap: 12px; text-align: center;">
        <div style="flex: 1; padding: 8px; background: #eff6ff; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${funnel.applied}</div>
          <div style="font-size: 11px; color: #6b7280;">Applied</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fefce8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${funnel.screen}</div>
          <div style="font-size: 11px; color: #6b7280;">Screens</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #f0fdf4; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${funnel.interview}</div>
          <div style="font-size: 11px; color: #6b7280;">Interviews</div>
        </div>
        <div style="flex: 1; padding: 8px; background: #fdf2f8; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: 700; color: #ec4899;">${funnel.offer}</div>
          <div style="font-size: 11px; color: #6b7280;">Offers</div>
        </div>
      </div>
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
