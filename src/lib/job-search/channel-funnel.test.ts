import { describe, expect, it } from "vitest";
import { channelLead, missingWhat, referralRate, renderChannelSection, visibleRows, type FunnelRow } from "./channel-funnel";
import { renderQuestSheetEmail } from "./quest-sheet";

const r = (bucket: string, label: string, sort: number, o: Partial<FunnelRow>): FunnelRow => ({
  bucket, label, sort, sent: 0, replied: 0, meetings: 0, referrals: 0, assessments: null, interviews: 0, interview_companies: [], ...o,
});

// plan_channel_funnel as of Oct 22, 2026: the numbers the artifact was reviewed on.
const ROWS: FunnelRow[] = [
  r("email", "Email", 1, { sent: 14, replied: 6, meetings: 2, referrals: 2 }),
  r("linkedin", "LinkedIn DM", 2, { sent: 28, replied: 8, referrals: 3 }),
  r("text", "Text", 3, {}),
  r("phone", "Phone", 4, {}),
  r("inbound", "Recruiters who reached out", 7, { sent: 4, replied: null, referrals: 3, interviews: 1, interview_companies: ["Stash"] }),
  r("ats", "Applications", 8, { sent: 38, replied: null, referrals: null, assessments: 2 }),
  r("no_ask", "Referral, ask not logged", 9, { sent: null, replied: null, referrals: 1, interviews: 1, interview_companies: ["Bobyard"] }),
];

describe("channel funnel", () => {
  it("rates referrals per message sent", () => {
    expect(referralRate(ROWS[0])).toBe(14);
    expect(referralRate(ROWS[1])).toBe(11);
    expect(referralRate(ROWS[2])).toBeNull(); // nothing sent
  });

  it("leads with the best channel and where the interviews came from", () => {
    expect(channelLead(ROWS)).toBe(
      "Email turns 14% of messages into a referral or JD, LinkedIn DM 11%. " +
        "Both interviews so far came from people, not applications: a recruiter who reached out (Stash) and a referral (Bobyard).",
    );
  });

  it("says so plainly when there are no interviews", () => {
    expect(channelLead([ROWS[0]])).toMatch(/No interviews yet\.$/);
  });

  it("drops empty channels but always keeps Text", () => {
    expect(visibleRows(ROWS).map((x) => x.bucket)).toEqual(["email", "linkedin", "text", "inbound", "ats", "no_ask"]);
  });

  it("shows untracked stages as a dash, never a zero", () => {
    const html = renderChannelSection({ rows: ROWS, almost: [], missing: [] });
    expect(html).toContain("4 in");
    expect(html).toContain("2 assessments");
    expect(html).toContain("Nothing logged yet. Texts only count");
    expect(html).not.toContain("Almost a referral");
    expect(html).not.toContain("Missing a channel");
  });

  it("lists follow-ups and touches with no channel", () => {
    const html = renderChannelSection({
      rows: ROWS,
      almost: [{ person: "Brian Kahrs", company: "Ridgeline", note: "Will refer after his time off" }],
      missing: [{ person: "Eric", kind: "conversation", format: "coffee", occurred_on: "2026-10-22" }],
    });
    expect(html).toContain("Brian Kahrs · Ridgeline · Will refer after his time off");
    expect(html).toContain("Eric · coffee Thu Oct 22 · how did you connect?");
    expect(missingWhat({ person: "Matt", kind: "reply", format: "message", occurred_on: "2026-09-25" })).toBe("reply Fri Sep 25");
  });

  it("rides in the quest sheet under the boss panel", () => {
    const { html } = renderQuestSheetEmail({
      week: 6, friday: "2026-10-30", days: [], rowUrl: null, lastWeek: null,
      channelsHtml: renderChannelSection({ rows: ROWS, almost: [], missing: [] }),
    });
    expect(html.indexOf("Funnel by channel")).toBeGreaterThan(html.indexOf("Boss: the Friday Seven"));
  });
});
