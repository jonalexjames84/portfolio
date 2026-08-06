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
});
