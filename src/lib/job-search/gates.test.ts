import { describe, it, expect } from "vitest";
import { locationGate, onsiteDays, type GateInput } from "./gates";

function input(overrides: Partial<GateInput> = {}): GateInput {
  return {
    company: "Acme",
    industry: null,
    location: null,
    jd_text: null,
    ...overrides,
  };
}

describe("onsiteDays", () => {
  it("reads 'N days a week'", () => {
    expect(onsiteDays("We work 3 days a week in the office")).toBe(3);
  });

  it("reads 'N days per week'", () => {
    expect(onsiteDays("Hybrid: 2 days per week onsite")).toBe(2);
  });

  it("reads 'Nx/week'", () => {
    expect(onsiteDays("Onsite 4x/week")).toBe(4);
  });

  it("reads 'N days in office' with no cadence word", () => {
    expect(onsiteDays("Hybrid — 2 days in office")).toBe(2);
  });

  it("returns null when no cadence is stated", () => {
    expect(onsiteDays("We are a hybrid company")).toBeNull();
  });

  it("returns null for empty text", () => {
    expect(onsiteDays("")).toBeNull();
  });

  it("prefers a specific 'in office' cadence over a later generic 'days a week'", () => {
    // The specific onsite marker (1 day in office) is the true cadence; the
    // generic form later in the sentence describes the remote days, not the
    // onsite days. Reading this as 4 would reject a role that's actually
    // well within the 3-day cap.
    expect(onsiteDays("1 day in office, other 4 days a week remote")).toBe(1);
  });

  it("does not read a zip code's trailing digit as a cadence", () => {
    // "94105" is a location artifact, not a schedule. Fabricating 5 here
    // would reject a role on cadence language that was never stated.
    expect(onsiteDays("San Francisco, CA 94105 days a week hybrid schedule")).toBeNull();
  });

  it("does not read an address suite number as a cadence", () => {
    // "Suite 4" is an address number, not a schedule. Fabricating 4 here
    // would reject a role right at the edge of the cap on a number that
    // means something else entirely.
    expect(onsiteDays("Suite 4 days a week onsite required")).toBeNull();
  });

  it("reads a marker-before-number cadence over a later, unrelated 'days a week'", () => {
    // "Onsite 1 day" is the true cadence; "remote 4 days a week" describes
    // the remote days, not the onsite days. Every specific pattern used to
    // expect number-then-marker, so this fell through to the generic
    // pattern and grabbed the wrong (remote) figure — a false rejection on
    // a role that's actually well within the 3-day cap.
    expect(onsiteDays("Onsite 1 day, remote 4 days a week")).toBe(1);
  });

  it("reads 'In office N days per week' (marker before number)", () => {
    expect(onsiteDays("In office 2 days per week")).toBe(2);
  });

  it("reads 'On-site N days' (marker before number, no 'a/per week' suffix)", () => {
    expect(onsiteDays("On-site 3 days")).toBe(3);
  });

  it("still reads the real cadence past an unrelated reference number followed by a comma", () => {
    // "No. 4" / "Level 4" / "Door 4" are reference numbers, not a schedule,
    // but none of them sits directly against a cadence word — a comma and
    // the real "3 days a week onsite" phrase always intervene. No pattern
    // can match on the "4" at all, so the genuine cadence (3) is what's
    // read; this isn't a case of getting fooled into the right answer by
    // luck of position, it's the only number the patterns can reach.
    expect(onsiteDays("No. 4, 3 days a week onsite")).toBe(3);
    expect(onsiteDays("Level 4, 3 days a week onsite")).toBe(3);
    expect(onsiteDays("Door 4, 3 days a week onsite")).toBe(3);
  });
});

describe("locationGate", () => {
  it("passes a fully remote US role", () => {
    const r = locationGate(input({ location: "Remote (US)" }));
    expect(r.pass).toBe(true);
  });

  it("passes remote-first stated in the JD", () => {
    const r = locationGate(input({ location: null, jd_text: "We are remote-first." }));
    expect(r.pass).toBe(true);
  });

  it("passes a Bay Area role at 3 days onsite", () => {
    const r = locationGate(input({ location: "San Francisco, CA", jd_text: "Hybrid, 3 days a week in office" }));
    expect(r.pass).toBe(true);
  });

  it("rejects a Bay Area role at 4 days onsite", () => {
    const r = locationGate(input({ location: "San Francisco, CA", jd_text: "4 days a week in office" }));
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("location");
    expect(r.reason).toContain("4");
  });

  it("rejects a hybrid role outside the Bay Area", () => {
    const r = locationGate(input({ location: "Austin, TX", jd_text: "Hybrid, 2 days a week" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("outside");
  });

  it("passes a Bay Area hybrid role with no stated cadence, and says it assumed", () => {
    const r = locationGate(input({ location: "Oakland, CA", jd_text: "This is a hybrid role." }));
    expect(r.pass).toBe(true);
    expect(r.reason).toBe("cadence_assumed");
  });

  it("rejects a Bay Area role with no remote or hybrid language at all", () => {
    const r = locationGate(input({ location: "Palo Alto, CA", jd_text: "Join us at HQ." }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("onsite");
  });

  it("rejects a role with no location signal whatsoever", () => {
    const r = locationGate(input());
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("no location");
  });

  it("does not treat 'remote-friendly' on a hybrid role as fully remote", () => {
    const r = locationGate(input({ location: "New York, NY", jd_text: "Remote-friendly, hybrid 3 days a week" }));
    expect(r.pass).toBe(false);
  });

  it("passes a 1-day-onsite Bay Area role even with a zip code sitting right next to the cadence text", () => {
    // location's zip code butts directly against jd_text's cadence sentence
    // once haystack() concatenates them. The gate must still find the real
    // 1-day cadence and not choke on, or misread, the distractor number.
    const r = locationGate(
      input({
        location: "San Francisco, CA 94105",
        jd_text: "1 day in office, other 4 days a week remote.",
      }),
    );
    expect(r.pass).toBe(true);
    expect(r.reason).toBeNull();
  });

  it("does not let a zip code in the location fabricate a cadence", () => {
    // Concatenated, this reads as "...94105 days a week onsite..." — the
    // exact shape that used to let a zip code's last digit pass as a
    // 5-day-a-week cadence. It must fall back to the permissive
    // cadence-unstated path instead of fabricating a number.
    const r = locationGate(
      input({
        location: "San Francisco, CA 94105",
        jd_text: "days a week onsite; hybrid schedule still being finalized.",
      }),
    );
    expect(r.pass).toBe(true);
    expect(r.reason).toBe("cadence_assumed");
  });

  it("passes a Bay Area role phrased marker-before-number instead of rejecting on the remote figure", () => {
    // "Onsite 1 day, remote 4 days a week" is a 1-day-onsite role. Before
    // the marker-before-number pattern existed, this fell through to the
    // generic pattern and read 4 (the remote day count) instead of 1,
    // silently rejecting a role well within the 3-day cap.
    const r = locationGate(
      input({
        location: "San Francisco, CA",
        jd_text: "Onsite 1 day, remote 4 days a week.",
      }),
    );
    expect(r.pass).toBe(true);
    expect(r.reason).toBeNull();
  });
});

import { ethicsGate, detectFlags } from "./gates";

describe("ethicsGate", () => {
  it("passes an ordinary SaaS company", () => {
    const r = ethicsGate(input({ company: "Linear", industry: "SaaS" }));
    expect(r.pass).toBe(true);
  });

  it("rejects a defense contractor named in the industry", () => {
    const r = ethicsGate(input({ company: "Anduril", industry: "Defense contractor" }));
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("ethics");
    expect(r.reason).toContain("defense");
  });

  it("rejects a data broker named in the company", () => {
    const r = ethicsGate(input({ company: "Acme Data Broker LLC", industry: "Analytics" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("surveillance");
  });

  it("rejects a payday lender", () => {
    const r = ethicsGate(input({ company: "FastCash", industry: "Payday lending" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("predatory_finance");
  });

  it("does not reject on JD text alone", () => {
    const r = ethicsGate(
      input({ company: "Honest Bank", industry: "Fintech", jd_text: "We do not do predatory lending." }),
    );
    expect(r.pass).toBe(true);
  });

  it("does not phantom-match a reject term spanning the company/industry seam", () => {
    // Joined ("securedata broker analytics"), this would falsely contain
    // "data broker" even though neither field does on its own.
    const r = ethicsGate(input({ company: "SecureData", industry: "Broker Analytics" }));
    expect(r.pass).toBe(true);
  });

  it("still rejects a multi-word term that lives entirely within one field", () => {
    const r = ethicsGate(input({ company: "Acme Data Broker LLC", industry: "Analytics" }));
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("surveillance");
  });
});

describe("detectFlags", () => {
  it("flags social casino without rejecting", () => {
    const i = input({ company: "Playtika", industry: "Social casino games" });
    expect(detectFlags(i)).toContain("gambling");
    expect(ethicsGate(i).pass).toBe(true);
  });

  it("flags web3 gaming without rejecting", () => {
    const i = input({ company: "Treasure", industry: "Web3 gaming", jd_text: "Own our tokenomics." });
    expect(detectFlags(i)).toContain("crypto");
    expect(ethicsGate(i).pass).toBe(true);
  });

  it("flags gacha monetization without rejecting", () => {
    const i = input({ company: "Some Studio", industry: "Mobile games", jd_text: "Own the gacha economy." });
    expect(detectFlags(i)).toContain("aggressive_monetization");
    expect(ethicsGate(i).pass).toBe(true);
  });

  it("returns no flags for an ordinary company", () => {
    expect(detectFlags(input({ company: "Linear", industry: "SaaS" }))).toEqual([]);
  });

  it("carries flags through on a passing ethics result", () => {
    const r = ethicsGate(input({ company: "Playtika", industry: "Social casino" }));
    expect(r.pass).toBe(true);
    expect(r.flags).toContain("gambling");
  });

  it("does not flag the word 'whale' outside a monetization context", () => {
    expect(detectFlags(input({ company: "Whale Shark Labs", industry: "SaaS" }))).toEqual([]);
  });

  it("does not flag 'defi' as a substring of an unrelated word", () => {
    expect(detectFlags(input({ company: "Deficit Solutions Inc", industry: "SaaS" }))).toEqual([]);
  });

  it("does not flag 'slots' as a substring of an unrelated word", () => {
    expect(detectFlags(input({ company: "TimeSlots App", industry: "SaaS" }))).toEqual([]);
  });

  it("still flags a legitimate hyphenated/multi-word term at a real word boundary", () => {
    const i = input({ company: "Some Studio", industry: "Mobile games", jd_text: "Play-to-earn economy design." });
    expect(detectFlags(i)).toContain("crypto");
  });
});

import { evaluateGates, type GateOverride } from "./gates";

describe("evaluateGates", () => {
  const remoteOk = { location: "Remote (US)" };

  it("passes a role that clears both gates", () => {
    const r = evaluateGates(input({ ...remoteOk, company: "Linear", industry: "SaaS" }), []);
    expect(r.pass).toBe(true);
  });

  it("rejects on location before consulting ethics", () => {
    const r = evaluateGates(input({ location: "Austin, TX", jd_text: "Hybrid 2 days a week" }), []);
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("location");
  });

  it("rejects on ethics when location passes", () => {
    const r = evaluateGates(input({ ...remoteOk, company: "Anduril", industry: "Defense contractor" }), []);
    expect(r.pass).toBe(false);
    expect(r.gate).toBe("ethics");
  });

  it("preserves disclosure flags on a passing result", () => {
    const r = evaluateGates(input({ ...remoteOk, company: "Playtika", industry: "Social casino" }), []);
    expect(r.pass).toBe(true);
    expect(r.flags).toContain("gambling");
  });

  it("an allow override rescues a rejected role", () => {
    const overrides: GateOverride[] = [
      { company_key: "anduril", decision: "allow", gate: "ethics", reason: "manual review" },
    ];
    const r = evaluateGates(
      input({ ...remoteOk, company: "Anduril", industry: "Defense contractor" }),
      overrides,
    );
    expect(r.pass).toBe(true);
    expect(r.reason).toContain("override");
  });

  it("a deny override rejects a role that would otherwise pass", () => {
    const overrides: GateOverride[] = [
      { company_key: "linear", decision: "deny", gate: null, reason: "already applied twice" },
    ];
    const r = evaluateGates(input({ ...remoteOk, company: "Linear", industry: "SaaS" }), overrides);
    expect(r.pass).toBe(false);
    expect(r.reason).toContain("already applied twice");
  });

  it("matches overrides on the normalized company key, not raw text", () => {
    const overrides: GateOverride[] = [
      { company_key: "anduril", decision: "allow", gate: "ethics", reason: "manual review" },
    ];
    const r = evaluateGates(
      input({ ...remoteOk, company: "Anduril, Inc.", industry: "Defense contractor" }),
      overrides,
    );
    expect(r.pass).toBe(true);
  });

  it("still reports flags on an overridden role", () => {
    const overrides: GateOverride[] = [
      { company_key: "playtika", decision: "deny", gate: null, reason: "not interested" },
    ];
    const r = evaluateGates(
      input({ ...remoteOk, company: "Playtika", industry: "Social casino" }),
      overrides,
    );
    expect(r.flags).toContain("gambling");
  });
});
