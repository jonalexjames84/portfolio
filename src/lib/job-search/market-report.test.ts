import { describe, expect, it } from "vitest";
import { buildMarketReport, renderMarketReport } from "./market-report";
import type { BoardSummary, ChartApp, FormDFiling } from "./market-sources";

const NOW = new Date("2026-10-07T16:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

const role = (title: string, age: number) => ({ title, url: `https://jobs.example/${encodeURIComponent(title)}`, location: "Remote", postedAt: daysAgo(age) });
function board(company: string, industry: string, roles: ReturnType<typeof role>[]): BoardSummary {
  return { company, industry, totalOpen: 40, engineeringOpen: 10, pmOpen: roles.length, postedLast30: 10, postedPrior60: 10, pmRoles: roles, leaderRoles: roles.filter((r) => /head|director|vp/i.test(r.title)) };
}
const filing = (company: string, amount: number): FormDFiling => ({ accession: company, company, cik: "1", filedOn: "2026-09-17", industry: "Other Technology", city: "SAN FRANCISCO", state: "CA", amountSold: amount, people: [{ name: "PRIVATE PERSON", relationship: "Executive Officer", title: "" }], filingUrl: `https://sec.example/${company}` });
const app = (name: string, ranks: Record<string, number>, releasedOn: string): ChartApp => ({ id: name, name, developer: "Studio", url: `https://apps.example/${name}`, ranks, releasedOn, sellerUrl: null });

const input = () => ({
  asOf: "2026-10-07",
  now: NOW,
  boards: [
    board("Stripe", "Tech", [role("Product Manager, Ecosystem", 1), role("Staff Product Manager", 9), role("PM, Radar", 2)]),
    board("Lambda", "Emerging", [role("Senior Director, Product Management", 20)]),
    board("Quiet Co", "SaaS", []),
  ],
  apps: [app("Block Out!", { "Top free · games": 2, "Top grossing · games": 17 }, "2025-10-31"), app("Old Hit", { "Top free · apps": 1 }, "2018-01-01")],
  filings: [filing("Crusoe Inc.", 3.1e9), filing("Crusoe Inc.", 1e8), filing("Tiny Inc.", 5e5)],
});

describe("buildMarketReport", () => {
  it("summarizes the week, hiring, funding and breakouts", () => {
    const r = buildMarketReport(input());
    expect(r).toMatchObject({ thisWeek: 2, lastWeek: 1, companiesThisWeek: 1, hiringCount: 2, raiseCount: 1, raiseSum: 3.1e9, breakoutCount: 1, breakoutGrossing: 1 });
    expect(r.hiring[0]).toMatchObject({ company: "Stripe", roles: 3, newestTitle: "Product Manager, Ecosystem", newestDays: 1 });
    expect(r.sectors).toEqual([["Tech", 3], ["Emerging", 1]]);
    expect(r.studios).toEqual([]);
  });

  it("lists companies whose only open PM roles are leadership roles", () => {
    expect(buildMarketReport(input()).leaders.map((l) => l.company)).toEqual(["Lambda"]);
  });
});

describe("studios", () => {
  it("links each studio to its job board, or a careers search when none was found", () => {
    const r = buildMarketReport({ ...input(), studios: [
      { key: "iron-gate", name: "Iron Gate AB", score: 3, titles: [{ name: "Valheim", platform: "PC", signal: "players +625% in 3 months", url: "u", score: 3 }], board: { atsType: "greenhouse", token: "irongate", careersUrl: "https://job-boards.greenhouse.io/irongate", totalOpen: 12, productOpen: 2 } },
      { key: "grand", name: "Grand Games A.Ş.", score: 2, titles: [{ name: "Block Out!", platform: "Mobile", signal: "#2 free, out Oct 31", url: "u", score: 2 }], board: null },
    ] });
    expect(r.studios[0]).toEqual({ name: "Iron Gate AB", titles: "Valheim (PC, players +625% in 3 months)", url: "https://job-boards.greenhouse.io/irongate", jobs: "12 open · 2 PM/producer" });
    expect(r.studios[1]).toMatchObject({ jobs: "no job board found · search", url: "https://www.google.com/search?q=Grand%20Games%20A.%C5%9E.%20careers" });
  });
});

describe("renderMarketReport", () => {
  it("never prints the people named on SEC filings", () => {
    const html = renderMarketReport(buildMarketReport(input()));
    expect(html).toContain("Crusoe Inc.");
    expect(html).toContain("$3.1B");
    expect(html).not.toMatch(/private person/i);
  });

  it("escapes HTML in titles from job boards", () => {
    const i = input();
    i.boards[0].pmRoles[0].title = `Product Manager <script>alert(1)</script>`;
    expect(renderMarketReport(buildMarketReport(i))).not.toContain("<script>alert");
  });
});
