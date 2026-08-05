import { describe, expect, it } from "vitest";
import {
  CLAIM_TTL_MINUTES,
  canonicalJobKey,
  companyApplicationCap,
  evaluateApplication,
  isClaimExpired,
  jobKeyFromUrl,
  normalizeCompany,
  normalizeRole,
  type ExistingApplication,
} from "./application-guard";

describe("normalizeCompany", () => {
  it("collapses casing, punctuation and legal suffixes", () => {
    expect(normalizeCompany("Stedi")).toBe("stedi");
    expect(normalizeCompany("  STEDI, Inc. ")).toBe("stedi");
    expect(normalizeCompany("Apollo.io")).toBe("apollo");
    expect(normalizeCompany("Recall.ai")).toBe("recall-ai");
  });

  it("drops the parent-company parenthetical from the ATS seed data", () => {
    // Jon applies to LinkedIn's PM org, not Microsoft's — merging them would
    // wrongly block one on the other.
    expect(normalizeCompany("LinkedIn (Microsoft)")).toBe("linkedin");
    expect(normalizeCompany("Twitch (Amazon)")).toBe("twitch");
  });

  it("maps known aliases onto one key", () => {
    expect(normalizeCompany("DeepMind (Google)")).toBe("google");
    expect(normalizeCompany("Block (Square)")).toBe("block");
    expect(normalizeCompany("Weights & Biases")).toBe("weights-and-biases");
  });
});

describe("normalizeRole", () => {
  it("expands the abbreviations that split one req into two rows", () => {
    // Both of these were live rows for the same 2K req.
    expect(normalizeRole("Sr. Technical Product Manager")).toBe(
      normalizeRole("Senior Technical Product Manager"),
    );
    // And both of these were live rows for the same Vercel req.
    expect(normalizeRole("PM, Accounts")).toBe(normalizeRole("Product Manager, Accounts"));
  });

  it("strips level codes and parentheticals", () => {
    expect(normalizeRole("Product Manager [IC4]")).toBe("product-manager");
    expect(normalizeRole("Product Manager (first PM)")).toBe("product-manager");
  });

  it("keeps genuinely different scopes apart", () => {
    // The queue once shipped a Claude Code letter against the Claude Tag req.
    expect(normalizeRole("Product Manager, Claude Code")).not.toBe(
      normalizeRole("Product Manager, Claude Code Model Performance"),
    );
    expect(normalizeRole("Senior Product Manager, AI")).not.toBe(
      normalizeRole("Senior Product Manager, AI Agents"),
    );
  });
});

describe("jobKeyFromUrl", () => {
  it("collapses every Greenhouse spelling of one req", () => {
    const expected = "greenhouse:8097749";
    expect(jobKeyFromUrl("https://job-boards.greenhouse.io/webflow/jobs/8097749")).toBe(expected);
    expect(jobKeyFromUrl("https://boards.greenhouse.io/webflow/jobs/8097749")).toBe(expected);
    expect(jobKeyFromUrl("https://webflow.com/careers?gh_jid=8097749")).toBe(expected);
    // The board-to-employer redirect that already tripped the liveness checker.
    expect(jobKeyFromUrl("https://careers.roblox.com/jobs/8014742?gh_jid=8014742")).toBe(
      "greenhouse:8014742",
    );
  });

  it("keys Ashby and Lever on their globally unique posting uuid", () => {
    expect(jobKeyFromUrl("https://jobs.ashbyhq.com/stedi/65b38320-75df-4386-b5e5-25b411e7a6a4")).toBe(
      "ashby:65b38320-75df-4386-b5e5-25b411e7a6a4",
    );
    expect(jobKeyFromUrl("https://jobs.lever.co/spotify/65b38320-75df-4386-b5e5-25b411e7a6a4")).toBe(
      "lever:65b38320-75df-4386-b5e5-25b411e7a6a4",
    );
  });

  it("keys YC postings on the company plus posting id", () => {
    expect(
      jobKeyFromUrl("https://www.ycombinator.com/companies/artisan/jobs/9a5WFVO-product-manager"),
    ).toBe("yc:artisan:9a5WFVO");
  });

  it("ignores tracking params but keeps meaningful ones", () => {
    expect(jobKeyFromUrl("https://acme.com/careers/pm?utm_source=x&ref=y")).toBe(
      "url:acme.com/careers/pm",
    );
    expect(jobKeyFromUrl("https://acme.com/careers?reqId=42")).toBe("url:acme.com/careers?reqId=42");
  });

  it("returns null for missing or unparseable urls", () => {
    expect(jobKeyFromUrl(null)).toBeNull();
    expect(jobKeyFromUrl("")).toBeNull();
    expect(jobKeyFromUrl("not a url")).toBeNull();
  });
});

describe("canonicalJobKey", () => {
  it("prefers the url", () => {
    expect(
      canonicalJobKey({
        company: "Webflow",
        role: "Senior Product Manager, AI",
        jobUrl: "https://job-boards.greenhouse.io/webflow/jobs/8097749",
      }),
    ).toBe("greenhouse:8097749");
  });

  it("falls back to the ATS req id when the url is missing", () => {
    expect(
      canonicalJobKey({
        company: "Asana",
        role: "Senior Product Manager, AI",
        jobUrl: null,
        atsType: "greenhouse",
        externalId: "8070671",
      }),
    ).toBe("greenhouse:8070671");
  });

  it("still produces a key for a row with no url at all", () => {
    // 45 of 98 pipeline rows had a null job_url and were exempt from the old
    // unique index entirely. That exemption is what this branch closes.
    const a = canonicalJobKey({ company: "2K Games", role: "Sr. Technical Product Manager" });
    const b = canonicalJobKey({ company: "2K Games", role: "Senior Technical Product Manager" });
    expect(a).toBe("title:2k-games:senior-technical-product-manager");
    expect(a).toBe(b);
  });
});

describe("companyApplicationCap", () => {
  it("defaults to one application per company", () => {
    expect(companyApplicationCap("Stedi")).toBe(1);
    expect(companyApplicationCap("Artisan")).toBe(1);
    expect(companyApplicationCap("Baselayer")).toBe(1);
  });

  it("allows more at employers with genuinely separate product orgs", () => {
    expect(companyApplicationCap("Google")).toBe(3);
    expect(companyApplicationCap("Roblox")).toBe(3);
    expect(companyApplicationCap("Anthropic")).toBe(2);
  });

  it("lets a hand-set override win", () => {
    expect(companyApplicationCap("Stedi", { override: 2 })).toBe(2);
    expect(companyApplicationCap("Google", { override: 1 })).toBe(1);
    expect(companyApplicationCap("Stedi", { override: null })).toBe(1);
  });
});

describe("isClaimExpired", () => {
  const now = new Date("2026-08-05T12:00:00Z");

  it("treats a missing or unparseable timestamp as expired", () => {
    expect(isClaimExpired(null, now)).toBe(true);
    expect(isClaimExpired("nonsense", now)).toBe(true);
  });

  it("holds a claim for the full ttl and releases it after", () => {
    const fresh = new Date(now.getTime() - (CLAIM_TTL_MINUTES - 1) * 60_000).toISOString();
    const stale = new Date(now.getTime() - (CLAIM_TTL_MINUTES + 1) * 60_000).toISOString();
    expect(isClaimExpired(fresh, now)).toBe(false);
    expect(isClaimExpired(stale, now)).toBe(true);
  });
});

describe("evaluateApplication", () => {
  const now = new Date("2026-08-05T12:00:00Z");
  const stedi = {
    company: "Stedi",
    role: "Product Manager",
    jobUrl: "https://jobs.ashbyhq.com/stedi/65b38320-75df-4386-b5e5-25b411e7a6a4",
  };
  const stediKey = canonicalJobKey(stedi);

  it("allows the first application", () => {
    const v = evaluateApplication(stedi, [], { agentId: "agent-1", now });
    expect(v.allowed).toBe(true);
    expect(v.outcome).toBe("allowed");
  });

  it("blocks a second application to the same req", () => {
    const existing: ExistingApplication[] = [
      { dedupeKey: stediKey, companyKey: "stedi", active: true },
    ];
    const v = evaluateApplication(stedi, existing, { agentId: "agent-2", now });
    expect(v.outcome).toBe("duplicate_application");
    expect(v.allowed).toBe(false);
  });

  it("blocks the same req even after it went cold", () => {
    // A rejection frees the company slot but never re-opens the same posting.
    const existing: ExistingApplication[] = [
      { dedupeKey: stediKey, companyKey: "stedi", active: false },
    ];
    expect(evaluateApplication(stedi, existing, { agentId: "agent-2", now }).outcome).toBe(
      "duplicate_application",
    );
  });

  it("blocks a second role at the same company under the default cap", () => {
    // This is the Stedi case: three different agents, three different roles,
    // one small company.
    const existing: ExistingApplication[] = [
      { dedupeKey: "ashby:other-req", companyKey: "stedi", active: true },
    ];
    const v = evaluateApplication(stedi, existing, { agentId: "agent-2", now });
    expect(v.outcome).toBe("company_cap_reached");
    expect(v.reason).toContain("cap 1");
  });

  it("allows a second role at a very large employer", () => {
    const roblox = { company: "Roblox", role: "Senior PM, Marketplace", jobUrl: null };
    const existing: ExistingApplication[] = [
      { dedupeKey: "greenhouse:1", companyKey: "roblox", active: true },
      { dedupeKey: "greenhouse:2", companyKey: "roblox", active: true },
    ];
    expect(evaluateApplication(roblox, existing, { agentId: "a", now }).allowed).toBe(true);

    existing.push({ dedupeKey: "greenhouse:3", companyKey: "roblox", active: true });
    expect(evaluateApplication(roblox, existing, { agentId: "a", now }).outcome).toBe(
      "company_cap_reached",
    );
  });

  it("frees the company slot once an application is no longer live", () => {
    const existing: ExistingApplication[] = [
      { dedupeKey: "ashby:other-req", companyKey: "stedi", active: false },
    ];
    expect(evaluateApplication(stedi, existing, { agentId: "agent-2", now }).allowed).toBe(true);
  });

  it("blocks an agent racing another agent's fresh claim", () => {
    const existing: ExistingApplication[] = [
      {
        dedupeKey: stediKey,
        companyKey: "stedi",
        active: false,
        claimedBy: "agent-1",
        claimedAt: new Date(now.getTime() - 5 * 60_000).toISOString(),
      },
    ];
    const v = evaluateApplication(stedi, existing, { agentId: "agent-2", now });
    expect(v.outcome).toBe("claimed_by_other_agent");
  });

  it("lets the holding agent re-enter its own claim", () => {
    const existing: ExistingApplication[] = [
      {
        dedupeKey: stediKey,
        companyKey: "stedi",
        active: false,
        claimedBy: "agent-1",
        claimedAt: new Date(now.getTime() - 5 * 60_000).toISOString(),
      },
    ];
    expect(evaluateApplication(stedi, existing, { agentId: "agent-1", now }).allowed).toBe(true);
  });

  it("releases a dead agent's stale claim", () => {
    const existing: ExistingApplication[] = [
      {
        dedupeKey: stediKey,
        companyKey: "stedi",
        active: false,
        claimedBy: "agent-1",
        claimedAt: new Date(now.getTime() - (CLAIM_TTL_MINUTES + 10) * 60_000).toISOString(),
      },
    ];
    expect(evaluateApplication(stedi, existing, { agentId: "agent-2", now }).allowed).toBe(true);
  });

  it("counts another agent's fresh claim against the company cap", () => {
    // Otherwise two agents both pass the cap check and both go on to apply.
    const existing: ExistingApplication[] = [
      {
        dedupeKey: "ashby:other-req",
        companyKey: "stedi",
        active: false,
        claimedBy: "agent-1",
        claimedAt: new Date(now.getTime() - 5 * 60_000).toISOString(),
      },
    ];
    expect(evaluateApplication(stedi, existing, { agentId: "agent-2", now }).outcome).toBe(
      "company_cap_reached",
    );
  });
});
