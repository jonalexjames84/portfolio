import { describe, it, expect } from "vitest";
import { buildContactIndex, linkedinSearchUrl, type ConnectionLike } from "./referrals";

function conn(over: Partial<ConnectionLike> & { id: string }): ConnectionLike {
  return {
    name: `Person ${over.id}`,
    company_name: "Anthropic",
    linkedin_url: null,
    last_contact: null,
    ...over,
  };
}

describe("linkedinSearchUrl", () => {
  it("searches for the person and their company", () => {
    const url = linkedinSearchUrl("Ada Lovelace", "Zynga");
    expect(url).toContain("/search/results/people/");
    expect(url).toContain("Ada%20Lovelace%20Zynga");
  });

  it("escapes characters that would truncate the query string", () => {
    const keywords = new URL(linkedinSearchUrl("Jo & Sam", "A/B Co")).searchParams.get(
      "keywords"
    );
    // An unescaped `&` would silently drop everything after it.
    expect(keywords).toBe("Jo & Sam A/B Co");
  });
});

describe("buildContactIndex", () => {
  it("keys contacts by normalized company so spellings match the job board", () => {
    const index = buildContactIndex([
      conn({ id: "1", company_name: "Assort Health, Inc." }),
    ]);
    expect([...index.keys()]).toEqual(["assort-health"]);
  });

  it("collects several contacts at one company", () => {
    const index = buildContactIndex([
      conn({ id: "1" }),
      conn({ id: "2" }),
      conn({ id: "3", company_name: "Zynga" }),
    ]);
    expect(index.get("anthropic")).toHaveLength(2);
    expect(index.get("zynga")).toHaveLength(1);
  });

  it("uses the profile URL when one is on file", () => {
    const index = buildContactIndex([
      conn({ id: "1", linkedin_url: "https://www.linkedin.com/in/someone" }),
    ]);
    const contact = index.get("anthropic")![0];
    expect(contact.url).toBe("https://www.linkedin.com/in/someone");
    expect(contact.isProfile).toBe(true);
  });

  it("falls back to a search rather than guessing a profile slug", () => {
    // Zynga's three contacts are all in this state. A guessed
    // linkedin.com/in/<slug> is a dead link most of the time.
    const contact = buildContactIndex([
      conn({ id: "1", name: "Ada Lovelace", company_name: "Zynga" }),
    ]).get("zynga")![0];
    expect(contact.isProfile).toBe(false);
    expect(contact.url).toContain("/search/results/people/");
  });

  it("treats a blank profile URL as missing, not as a link", () => {
    const contact = buildContactIndex([
      conn({ id: "1", linkedin_url: "   " }),
    ]).get("anthropic")![0];
    expect(contact.isProfile).toBe(false);
  });

  it("puts never-contacted people first — those are the ones to message", () => {
    const index = buildContactIndex([
      conn({ id: "reached", last_contact: "2026-07-01" }),
      conn({ id: "fresh" }),
    ]);
    expect(index.get("anthropic")!.map((c) => c.id)).toEqual(["fresh", "reached"]);
    expect(index.get("anthropic")!.map((c) => c.contacted)).toEqual([false, true]);
  });

  it("skips a contact with no company, which cannot be matched to a role", () => {
    expect(buildContactIndex([conn({ id: "1", company_name: null })]).size).toBe(0);
    expect(buildContactIndex([conn({ id: "1", company_name: "" })]).size).toBe(0);
  });

  it("returns an empty index for an empty contact list", () => {
    expect(buildContactIndex([]).size).toBe(0);
  });
});
