import { describe, expect, it } from "vitest";
import { buildMarketBrief, formatMoney, type MarketBriefInput } from "./market-brief";
import type { BoardSummary, ChartApp, FormDFiling } from "./market-sources";

const NOW = new Date("2026-10-07T16:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function board(company: string, pmAges: number[], extra: Partial<BoardSummary> = {}): BoardSummary {
  return {
    company,
    industry: "Tech",
    totalOpen: 50,
    engineeringOpen: 20,
    pmOpen: pmAges.length,
    postedLast30: 20,
    postedPrior60: 20,
    pmRoles: pmAges.map((a, i) => ({ title: `Product Manager ${i + 1}`, url: `https://jobs.example/${company}/${i}`, location: "Remote", postedAt: daysAgo(a) })),
    leaderRoles: [],
    ...extra,
  };
}

function filing(company: string, amount: number, person = "JANE DOE"): FormDFiling {
  return { accession: company, company, cik: "1", filedOn: "2026-09-17", industry: "Other Technology", city: "DENVER", state: "CO", amountSold: amount, people: [{ name: person, relationship: "Executive Officer", title: "" }], filingUrl: `https://sec.example/${company}` };
}

function app(name: string, developer: string, ranks: Record<string, number>, releasedOn: string): ChartApp {
  return { id: name, name, developer, url: `https://apps.example/${name}`, ranks, releasedOn, sellerUrl: null };
}

const base = (over: Partial<MarketBriefInput> = {}): MarketBriefInput => ({ boards: [], filings: [], apps: [], connections: [], applications: [], now: NOW, ...over });

describe("tiles", () => {
  it("compares PM roles posted this week with last week", () => {
    const brief = buildMarketBrief(base({ boards: [board("Acme", [1, 2, 3]), board("Beta", [8, 9])] }));
    expect(brief.tiles[0]).toEqual({ label: "PM market", value: "Up 50% this week", detail: "3 PM roles posted at 1 tracked companies" });
  });

  it("counts only hiring companies that still have an open slot", () => {
    const brief = buildMarketBrief(base({
      boards: [board("Acme", [1]), board("Beta", [2])],
      applications: [{ company: "Acme", status: "submitted", submitted_at: "2026-09-01", created_at: "2026-09-01" }],
    }));
    expect(brief.tiles[1].value).toBe("1 companies");
  });

  it("sums funding once per company, keeping the largest filing", () => {
    const brief = buildMarketBrief(base({ filings: [filing("Acme Inc.", 10e6), filing("Acme Inc.", 30e6), filing("Beta Inc.", 5e6)] }));
    expect(brief.tiles[2]).toMatchObject({ value: "$35M raised", detail: "by 2 tech companies in 30 days" });
  });

  it("counts apps released in the last year as breakouts", () => {
    const brief = buildMarketBrief(base({ apps: [
      app("New", "Dev A", { "Top grossing · games": 17 }, "2026-06-13"),
      app("Old", "Dev B", { "Top free · apps": 3 }, "2019-01-01"),
    ] }));
    expect(brief.tiles[3]).toMatchObject({ value: "1 new apps charting", detail: "1 already in top grossing" });
  });
});

describe("actions", () => {
  it("puts a held contact first once their company is hiring again", () => {
    const brief = buildMarketBrief(base({
      boards: [board("Vercel", [8, 9, 10, 12]), board("Pinterest", [2])],
      connections: [{ name: "Kathy Korevec", company_name: "Vercel", linkedin_url: "https://li/kathy", next_action: "HOLD — reconnect when a PM req reappears" }],
    }));
    expect(brief.actions[0]).toMatchObject({ what: "Message Kathy Korevec at Vercel", why: "You were waiting for a PM req. There are 4 open now.", url: "https://li/kathy" });
  });

  it("asks for a referral only where Jon can still apply", () => {
    const brief = buildMarketBrief(base({
      boards: [board("Acme", [5]), board("Beta", [5])],
      connections: [
        { name: "Ann", company_name: "Acme", linkedin_url: null, next_action: null },
        { name: "Bob", company_name: "Beta", linkedin_url: null, next_action: null },
      ],
      applications: [{ company: "Beta", status: "prepared", submitted_at: null, created_at: "2026-09-20" }],
    }));
    const whats = brief.actions.map((a) => a.what);
    expect(whats).toContain("Ask Ann for a referral at Acme");
    expect(whats).not.toContain("Ask Bob for a referral at Beta");
    expect(whats).toContain("Ask Bob about your Beta application");
  });

  it("respects larger caps for big employers", () => {
    const brief = buildMarketBrief(base({
      boards: [board("Stripe", [1])],
      applications: [{ company: "Stripe", status: "submitted", submitted_at: "2026-09-25", created_at: "2026-09-25" }],
    }));
    expect(brief.actions[0].what).toBe("Prep an application: Stripe, Product Manager 1");
  });

  it("suggests prepping only roles posted in the last 3 days, at most two", () => {
    const brief = buildMarketBrief(base({ boards: [board("A", [0]), board("B", [1]), board("C", [2]), board("D", [5])] }));
    const preps = brief.actions.filter((a) => a.what.startsWith("Prep"));
    expect(preps).toHaveLength(2);
    expect(preps.every((a) => !a.what.includes(" D,"))).toBe(true);
  });

  it("introduces Jon to the biggest raise that has no PM role yet", () => {
    const brief = buildMarketBrief(base({
      boards: [board("Harvey", [3])],
      filings: [filing("Harvey AI Corp", 550e6), filing("Crusoe Inc.", 3.1e9, "CHASE LOCHMILLER"), filing("Exa Labs Inc.", 247e6)],
    }));
    expect(brief.actions.find((a) => a.what.startsWith("Introduce"))).toMatchObject({
      what: "Introduce yourself to Chase Lochmiller at Crusoe Inc.",
      why: "They raised $3.1B on Sep 17 and haven’t posted a PM role yet.",
    });
  });

  it("caps the list at five and never repeats a company", () => {
    const boards = ["A", "B", "C", "D", "E", "F"].map((c) => board(c, [1]));
    const connections = ["A", "B", "C", "D", "E", "F"].flatMap((c) => [
      { name: `${c}1`, company_name: c, linkedin_url: null, next_action: null },
      { name: `${c}2`, company_name: c, linkedin_url: null, next_action: null },
    ]);
    const brief = buildMarketBrief(base({ boards, connections }));
    expect(brief.actions).toHaveLength(5);
    const companies = brief.actions.map((a) => a.what.split(" at ").pop());
    expect(new Set(companies).size).toBe(5);
  });

  it("returns no actions on an empty market", () => {
    expect(buildMarketBrief(base()).actions).toEqual([]);
  });
});

describe("watch", () => {
  it("lists the next raise, the best grossing breakout and a new product leader", () => {
    const leader = { title: "Head of Product", url: "https://jobs.example/lead", location: "", postedAt: daysAgo(4) };
    const brief = buildMarketBrief(base({
      boards: [board("Lattice", [4], { pmRoles: [leader], leaderRoles: [leader] })],
      filings: [filing("Crusoe Inc.", 3.1e9), filing("Exa Labs Inc.", 247e6)],
      apps: [app("Block Out!", "Grand Games", { "Top grossing · games": 17, "Top free · games": 2 }, "2025-10-31")],
    }));
    expect(brief.watch.map((w) => w.name)).toEqual(["Exa Labs Inc.", "Grand Games", "Lattice"]);
    expect(brief.watch[0].reason).toBe("raised $247M, Sep 17");
  });
});

describe("formatMoney", () => {
  it("scales units", () => {
    expect(formatMoney(3.1e9)).toBe("$3.1B");
    expect(formatMoney(550.3e6)).toBe("$550M");
    expect(formatMoney(400e3)).toBe("$400K");
  });
});
