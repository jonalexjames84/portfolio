import { describe, expect, it } from "vitest";
import {
  classify,
  isFilledOut,
  lastFriday,
  parsePlan,
  planDayRange,
  reminderOrdinal,
  renderQuestSheetEmail,
  renderReminderEmail,
  rowMatchesWeek,
  summarize,
  upcomingFriday,
  weekNumberForFriday,
  type PlanBlock,
} from "./quest-sheet";

describe("weeks", () => {
  it("numbers weeks from Fri Sep 25", () => {
    expect(weekNumberForFriday("2026-09-25")).toBe(1);
    expect(weekNumberForFriday("2026-10-09")).toBe(3);
    expect(weekNumberForFriday("2026-12-18")).toBe(13);
  });

  it("plans the coming week from a Sunday, and the same week from a Monday", () => {
    expect(upcomingFriday("2026-10-04")).toBe("2026-10-09"); // Sun
    expect(upcomingFriday("2026-10-05")).toBe("2026-10-09"); // Mon (cron drift)
  });

  it("chases the most recent Friday from Fri, Sat and Sun", () => {
    expect(lastFriday("2026-10-09")).toBe("2026-10-09");
    expect(lastFriday("2026-10-10")).toBe("2026-10-09");
    expect(lastFriday("2026-10-11")).toBe("2026-10-09");
    expect(reminderOrdinal("2026-10-09")).toBe(1);
    expect(reminderOrdinal("2026-10-11")).toBe(3);
  });

  it("matches row titles without wk 1 catching wk 12", () => {
    expect(rowMatchesWeek("Fri Sep 25 · wk 1", 1)).toBe(true);
    expect(rowMatchesWeek("Fri Dec 11 · wk 12", 1)).toBe(false);
    expect(rowMatchesWeek("Fri Nov 13 · wk 8 · in-process deadline", 8)).toBe(true);
    expect(rowMatchesWeek("Wed Dec 23 · day 100", 14)).toBe(true);
  });

  it("counts plan days, clamped to day 1", () => {
    expect(planDayRange("2026-10-09")).toEqual({ first: 14, last: 18 });
    expect(planDayRange("2026-09-25")).toEqual({ first: 1, last: 4 });
  });
});

const WEEK3: PlanBlock[] = [
  { type: "heading", text: "Week 3 plan · Mon Oct 5 – Fri Oct 9" },
  { type: "other", text: "Teed up Sun Oct 4." },
  { type: "heading", text: "Mon Oct 5 · 9–12 · Outreach: recruiters first (5 touches)" },
  { type: "todo", text: "Quang Nguyen (Sr Recruiter, Atoms) · draft ready" },
  { type: "todo", text: "Jung Suh (Mythical) · ONLY if Martin Tegner hasn't replied" },
  { type: "heading", text: "Tue Oct 6 · 9–12 · Applications" },
  { type: "todo", text: "Scopely · Sr Director, Publishing Production · submitted cold Sun Oct 4", checked: true },
  { type: "todo", text: "Pylon · Senior Agent PM" },
  { type: "heading", text: "Wed Oct 7 · 9–12 · Conversations + interview prep" },
  { type: "todo", text: "Chong Ahn (Meta) · direct ask" },
  { type: "todo", text: "Record one interview story out loud" },
  { type: "heading", text: "Fri Oct 9" },
  { type: "todo", text: "9–11 · Work product: Johan's two work samples" },
  { type: "todo", text: "4:30 · Friday Seven" },
  { type: "heading", text: "Decisions only you can make" },
  { type: "todo", text: "not a quest" },
];

describe("parsePlan", () => {
  const days = parsePlan(WEEK3);

  it("keeps day sections and drops non-day headings", () => {
    expect(days.map((d) => d.day)).toEqual(["Mon", "Tue", "Wed", "Fri"]);
    expect(days[0].when).toBe("9–12 · Outreach: recruiters first (5 touches)");
  });

  it("splits title and note, and reads checked and optional", () => {
    const [quang, jung] = days[0].quests;
    expect(quang).toMatchObject({ title: "Quang Nguyen (Sr Recruiter, Atoms)", note: "draft ready", kind: "out", optional: false });
    expect(jung.optional).toBe(true);
    expect(days[1].quests[0].done).toBe(true);
  });

  it("classifies by heading, with asks and the Friday Seven as exceptions", () => {
    expect(days[2].quests.map((q) => q.kind)).toEqual(["out", "conv"]);
    expect(days[3].quests.map((q) => q.kind)).toEqual(["work", "boss"]);
    expect(classify("Pylon", "9–12 · Applications")).toBe("app");
  });

  it("scores required quests only", () => {
    const s = summarize(days);
    expect(s.tiers).toBe(7); // 8 quests, Jung Suh optional
    expect(s.tiersDone).toBe(1);
    expect(s.xp).toBe(50);
    expect(s.apps).toEqual({ total: 2, done: 1 });
  });
});

describe("filled out", () => {
  it("needs all four job-search numbers, and zero counts", () => {
    expect(isFilledOut({ Applications: 1, Outreach: 3, Conversations: 2, Screens: 0 })).toBe(true);
    expect(isFilledOut({ Applications: 1, Outreach: 3, Conversations: 2, Screens: null })).toBe(false);
    expect(isFilledOut({})).toBe(false);
  });
});

describe("emails", () => {
  it("renders the quest sheet with the last-week nag when it's empty", () => {
    const { subject, html } = renderQuestSheetEmail({
      week: 3, friday: "2026-10-09", days: parsePlan(WEEK3), rowUrl: "https://notion.so/x",
      lastWeek: { numbers: { Applications: null }, rowUrl: "https://notion.so/y" },
    });
    expect(subject).toBe("Week 3 quest sheet: 7 quests, 235 XP");
    expect(html).toContain("Last week's Friday Seven is still empty");
    expect(html).toContain("Days 14–18 of 93");
    expect(html).not.toContain("not a quest");
  });

  it("says so when the week has no plan", () => {
    const { subject, html } = renderQuestSheetEmail({ week: 4, friday: "2026-10-16", days: [], rowUrl: null, lastWeek: null });
    expect(subject).toBe("Week 4 quest sheet: nothing planned yet");
    expect(html).toContain("No quests planned yet");
  });

  it("escapes Notion text", () => {
    const days = parsePlan([{ type: "heading", text: "Mon · Outreach" }, { type: "todo", text: "<script>x</script>" }]);
    const { html } = renderQuestSheetEmail({ week: 3, friday: "2026-10-09", days, rowUrl: null, lastWeek: null });
    expect(html).not.toContain("<script>");
  });

  it("names the missing numbers in the reminder", () => {
    const { subject, html } = renderReminderEmail({ week: 3, numbers: { Applications: 4, Outreach: 5 }, rowUrl: "u", attempt: 2 });
    expect(subject).toBe("Friday Seven, week 3: 5 minutes (second reminder)");
    expect(html).toContain("Conversations, Screens");
  });
});
