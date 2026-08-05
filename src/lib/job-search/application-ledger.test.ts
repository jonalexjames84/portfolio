import { describe, it, expect } from "vitest";
import { buildLedgerReport, type LedgerRow, type LedgerStatus } from "./application-ledger";

const NOW = new Date("2026-08-12T00:00:00Z");

function row(over: Partial<LedgerRow> & { company: string; status: LedgerStatus }): LedgerRow {
  return {
    id: over.id ?? `${over.company}-${over.role ?? "r"}`,
    company: over.company,
    company_key: over.company_key ?? over.company.toLowerCase().replace(/\s+/g, "-"),
    role: over.role ?? "Product Manager",
    job_url: over.job_url ?? null,
    status: over.status,
    agent_id: over.agent_id ?? "backfill",
    claimed_at: over.claimed_at ?? "2026-08-05T00:00:00Z",
    prepared_at: over.prepared_at ?? null,
    submitted_at: over.submitted_at ?? null,
    closed_at: over.closed_at ?? null,
    notes: over.notes ?? null,
  };
}

describe("buildLedgerReport", () => {
  it("puts prepared and claimed work in the waiting list", () => {
    const r = buildLedgerReport(
      [
        row({ company: "Baselayer", status: "prepared" }),
        row({ company: "Careforce", status: "claimed" }),
        row({ company: "Webflow", status: "submitted", submitted_at: "2026-08-04T00:00:00Z" }),
      ],
      { now: NOW },
    );
    expect(r.waiting.map((w) => w.company)).toEqual(["Baselayer", "Careforce"]);
  });

  it("reads the blocker out of the note rather than guessing", () => {
    const r = buildLedgerReport(
      [
        row({ company: "Broccoli AI", status: "prepared", notes: "blocked on hCaptcha." }),
        row({
          company: "Baselayer",
          status: "prepared",
          notes: "blocked on an 8-character emailed verification code",
        }),
        row({ company: "Orb", status: "prepared", notes: "something unrecognised" }),
      ],
      { now: NOW },
    );
    const byCompany = Object.fromEntries(r.waiting.map((w) => [w.company, w.blocker]));
    expect(byCompany["Broccoli AI"]).toBe("hCaptcha");
    expect(byCompany["Baselayer"]).toBe("emailed code");
    // An unknown note must not invent a reason.
    expect(byCompany["Orb"]).toBeNull();
  });

  it("flags follow-up once a submission is a week old", () => {
    const r = buildLedgerReport(
      [
        row({ company: "Webflow", status: "submitted", submitted_at: "2026-08-05T00:00:00Z" }),
        row({ company: "Stedi", status: "submitted", submitted_at: "2026-08-10T00:00:00Z" }),
      ],
      { now: NOW },
    );
    const byCompany = Object.fromEntries(r.submitted.map((s) => [s.company, s]));
    expect(byCompany["Webflow"].daysSince).toBe(7);
    expect(byCompany["Webflow"].followUpDue).toBe(true);
    expect(byCompany["Stedi"].followUpDue).toBe(false);
  });

  it("stays quiet about an at-cap company when nothing is actually blocked", () => {
    // Every applied-to company is trivially 1/1. Saying so is noise.
    const r = buildLedgerReport([row({ company: "Stedi", status: "submitted" })], { now: NOW });
    expect(r.blocking).toHaveLength(0);
  });

  it("reports an at-cap company only when it costs a saved role", () => {
    const r = buildLedgerReport([row({ company: "Stedi", status: "submitted" })], {
      now: NOW,
      savedRoles: [{ companyKey: "stedi", role: "Staff PM, Platform" }],
    });
    expect(r.blocking).toHaveLength(1);
    expect(r.blocking[0]).toMatchObject({
      company: "Stedi",
      used: 1,
      cap: 1,
      blockedRoles: ["Staff PM, Platform"],
    });
  });

  it("gives Anthropic two slots and only blocks at the second", () => {
    const saved = [{ companyKey: "anthropic", role: "Web Product Manager" }];

    const one = buildLedgerReport(
      [row({ company: "Anthropic", company_key: "anthropic", role: "A", status: "prepared" })],
      { now: NOW, savedRoles: saved },
    );
    // 1 of 2 used — the Web PM req is still reachable.
    expect(one.blocking).toHaveLength(0);

    const two = buildLedgerReport(
      [
        row({ company: "Anthropic", company_key: "anthropic", role: "A", status: "prepared" }),
        row({ company: "Anthropic", company_key: "anthropic", role: "B", status: "submitted" }),
      ],
      { now: NOW, savedRoles: saved },
    );
    expect(two.blocking).toHaveLength(1);
    expect(two.blocking[0]).toMatchObject({ used: 2, cap: 2, atCap: true });
  });

  it("frees the slot when an application closes, unblocking the saved role", () => {
    const r = buildLedgerReport(
      [
        row({ company: "Anthropic", company_key: "anthropic", role: "Consumer", status: "closed" }),
        row({ company: "Anthropic", company_key: "anthropic", role: "Enterprise", status: "prepared" }),
      ],
      { now: NOW, savedRoles: [{ companyKey: "anthropic", role: "Web PM" }] },
    );
    expect(r.blocking).toHaveLength(0);
    expect(r.closedCount).toBe(1);
  });

  it("withdrawn does not hold a slot either", () => {
    const r = buildLedgerReport([row({ company: "Tailor", status: "withdrawn" })], {
      now: NOW,
      savedRoles: [{ companyKey: "tailor", role: "Other PM" }],
    });
    expect(r.blocking).toHaveLength(0);
    expect(r.totalOpen).toBe(0);
  });

  it("does not list a role as blocked when it is the one being worked", () => {
    // The pipeline row stays `saved` while the ledger row is `prepared`, so the
    // same role appears on both sides. It must not read as unreachable.
    const r = buildLedgerReport(
      [
        row({
          company: "Anthropic",
          company_key: "anthropic",
          role: "Product Manager, Enterprise",
          status: "prepared",
        }),
        row({
          company: "Anthropic",
          company_key: "anthropic",
          role: "Product Manager, Claude Code Model Performance",
          status: "prepared",
        }),
      ],
      {
        now: NOW,
        savedRoles: [
          { companyKey: "anthropic", role: "Product Manager, Enterprise" },
          { companyKey: "anthropic", role: "Web Product Manager" },
        ],
      },
    );
    expect(r.blocking[0].blockedRoles).toEqual(["Web Product Manager"]);
  });

  it("matches held roles through abbreviation spelling", () => {
    const r = buildLedgerReport(
      [row({ company: "Harvey", company_key: "harvey", role: "Senior PM, Command Center", status: "submitted" })],
      {
        now: NOW,
        savedRoles: [
          // Same req, spelled out — must not count as a second, blocked role.
          { companyKey: "harvey", role: "Senior Product Manager, Command Center" },
          { companyKey: "harvey", role: "Staff Product Manager, Vault" },
        ],
      },
    );
    expect(r.blocking[0].blockedRoles).toEqual(["Staff Product Manager, Vault"]);
  });

  it("ranks the company losing the most roles first", () => {
    const r = buildLedgerReport(
      [
        row({ company: "Assort Health", company_key: "assort-health", status: "submitted" }),
        row({ company: "Zebra", company_key: "zebra", status: "submitted" }),
      ],
      {
        now: NOW,
        savedRoles: [
          { companyKey: "zebra", role: "One" },
          { companyKey: "assort-health", role: "Senior PM, AI Agents" },
          { companyKey: "assort-health", role: "Senior Agent PM" },
        ],
      },
    );
    expect(r.blocking.map((b) => b.company)).toEqual(["Assort Health", "Zebra"]);
  });

  it("marks agent-prepared work so Jon knows it is not his own draft", () => {
    const r = buildLedgerReport(
      [
        row({ company: "Trellis AI", status: "prepared", agent_id: "session-9f0da98b" }),
        row({ company: "Baselayer", status: "prepared", agent_id: "backfill-2026-08-05" }),
      ],
      { now: NOW },
    );
    const byCompany = Object.fromEntries(r.waiting.map((w) => [w.company, w.preparedByAgent]));
    expect(byCompany["Trellis AI"]).toBe(true);
    expect(byCompany["Baselayer"]).toBe(false);
  });

  it("survives a null submitted_at without claiming a follow-up is due", () => {
    const r = buildLedgerReport(
      [row({ company: "Retool", status: "submitted", submitted_at: null })],
      { now: NOW },
    );
    expect(r.submitted[0].daysSince).toBeNull();
    expect(r.submitted[0].followUpDue).toBe(false);
  });
});
