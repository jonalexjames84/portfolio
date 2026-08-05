import { describe, it, expect } from "vitest";
import {
  isRelevantTitle,
  isRelevantLocation,
  isGamingBoard,
  stripHtml,
} from "./ats";

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

describe("isRelevantTitle — gaming boards", () => {
  const gaming = { gaming: true };

  it("accepts production titles, which are Jon's craft in games", () => {
    expect(isRelevantTitle("Senior Producer", gaming)).toBe(true);
    expect(isRelevantTitle("Executive Producer", gaming)).toBe(true);
    expect(isRelevantTitle("Production Director – Seasonal Content", gaming)).toBe(true);
    expect(isRelevantTitle("Director, Production", gaming)).toBe(true);
    expect(isRelevantTitle("Development Director", gaming)).toBe(true);
  });

  it("accepts program, project and live-ops titles Jon said yes to", () => {
    expect(isRelevantTitle("Senior Technical Program Manager", gaming)).toBe(true);
    expect(isRelevantTitle("Senior Project Manager (Agile)", gaming)).toBe(true);
    expect(isRelevantTitle("Live Ops Manager", gaming)).toBe(true);
    expect(isRelevantTitle("Platform Product Owner", gaming)).toBe(true);
  });

  it("still rejects other crafts that merely contain a shared noun", () => {
    expect(isRelevantTitle("Senior Producer, Art", gaming)).toBe(false);
    expect(isRelevantTitle("Technical Artist", gaming)).toBe(false);
    expect(isRelevantTitle("Game Designer", gaming)).toBe(false);
    expect(isRelevantTitle("Product Marketing Manager", gaming)).toBe(false);
    expect(isRelevantTitle("Gameplay Engineer", gaming)).toBe(false);
  });

  it("still rejects roles below Jon's level", () => {
    expect(isRelevantTitle("Associate Producer", gaming)).toBe(false);
    expect(isRelevantTitle("Production Intern", gaming)).toBe(false);
    expect(isRelevantTitle("Production Coordinator", gaming)).toBe(false);
  });

  it("rejects HR, real-estate and localization work that borrows the words", () => {
    expect(isRelevantTitle("Global Benefits Program Manager", gaming)).toBe(false);
    expect(isRelevantTitle("Project Manager, Corporate Real Estate", gaming)).toBe(false);
    expect(isRelevantTitle("Localization Program Manager", gaming)).toBe(false);
  });

  it("leaves non-gaming boards exactly as they were", () => {
    // Widening this globally would flood the pipeline with TPM reqs from all
    // 269 target companies, so the extra titles must be gaming-only.
    expect(isRelevantTitle("Senior Technical Program Manager")).toBe(false);
    expect(isRelevantTitle("Senior Producer")).toBe(false);
    expect(isRelevantTitle("Live Ops Manager")).toBe(false);
    expect(isRelevantTitle("Senior Product Manager")).toBe(true);
  });
});

describe("isGamingBoard", () => {
  it("recognises the industry label the sweep writes", () => {
    expect(isGamingBoard("Gaming")).toBe(true);
    expect(isGamingBoard("gaming")).toBe(true);
    expect(isGamingBoard("Games / Interactive")).toBe(true);
  });

  it("does not fire on unrelated industries", () => {
    expect(isGamingBoard("AI/ML")).toBe(false);
    expect(isGamingBoard(null)).toBe(false);
    expect(isGamingBoard(undefined)).toBe(false);
  });
});
