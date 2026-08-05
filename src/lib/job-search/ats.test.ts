import { describe, it, expect } from "vitest";
import { isRelevantTitle, isRelevantLocation, stripHtml } from "./ats";

describe("isRelevantTitle", () => {
  it("accepts PM titles at Jon's level", () => {
    expect(isRelevantTitle("Senior Product Manager")).toBe(true);
    expect(isRelevantTitle("Product Manager, AI Platform")).toBe(true);
    expect(isRelevantTitle("Principal Product Manager, Creator Hub")).toBe(true);
    expect(isRelevantTitle("Head of Product")).toBe(true);
    expect(isRelevantTitle("Director, Product Management")).toBe(true);
    expect(isRelevantTitle("Staff Product Manager, AI Platform")).toBe(true);
  });

  it("rejects adjacent roles that merely contain 'manager' or 'product'", () => {
    expect(isRelevantTitle("Product Marketing Manager")).toBe(false);
    expect(isRelevantTitle("Technical Program Manager")).toBe(false);
    expect(isRelevantTitle("Senior Project Manager")).toBe(false);
    expect(isRelevantTitle("Product Designer")).toBe(false);
    expect(isRelevantTitle("Engineering Manager, Product")).toBe(false);
    expect(isRelevantTitle("Software Engineer")).toBe(false);
  });

  it("rejects roles below Jon's level", () => {
    expect(isRelevantTitle("Associate Product Manager")).toBe(false);
    expect(isRelevantTitle("Product Manager Intern")).toBe(false);
    expect(isRelevantTitle("Product Manager, New Grad")).toBe(false);
  });

  it("keeps the PostHog-style title that names product engineering", () => {
    expect(
      isRelevantTitle("Product Manager (ex-founder or ex-product engineer)")
    ).toBe(true);
  });
});

describe("isRelevantLocation", () => {
  it("accepts Bay Area, US metros and remote", () => {
    expect(isRelevantLocation("San Francisco, CA")).toBe(true);
    expect(isRelevantLocation("Remote - United States")).toBe(true);
    expect(isRelevantLocation("Foster City, CA")).toBe(true);
    expect(isRelevantLocation("New York, NY")).toBe(true);
  });

  it("rejects foreign offices", () => {
    expect(isRelevantLocation("Sydney, Australia")).toBe(false);
    expect(isRelevantLocation("Tokyo, Japan")).toBe(false);
    expect(isRelevantLocation("Bengaluru, India")).toBe(false);
    expect(isRelevantLocation("GB-London")).toBe(false);
  });

  it("rejects remote roles that are remote somewhere else", () => {
    expect(isRelevantLocation("Remote - Canada")).toBe(false);
    expect(isRelevantLocation("Remote, EMEA")).toBe(false);
    expect(isRelevantLocation("Remote - United Kingdom")).toBe(false);
  });

  it("keeps a US office even when a foreign one is listed alongside it", () => {
    expect(isRelevantLocation("San Francisco, CA | London, UK")).toBe(true);
    expect(isRelevantLocation("Vancouver, Washington, United States")).toBe(true);
  });

  it("passes empty locations rather than dropping the posting", () => {
    expect(isRelevantLocation("")).toBe(true);
  });
});

describe("stripHtml", () => {
  it("unwraps ATS description markup into scoreable text", () => {
    expect(
      stripHtml("<p>Build <strong>AI</strong> &amp; LLM agents</p>")
    ).toBe("Build AI & LLM agents");
  });

  it("drops script and style blocks", () => {
    expect(stripHtml("<style>.a{color:red}</style><p>Hi</p>")).toBe("Hi");
  });
});
