import { describe, expect, it } from "vitest";
import { isOperatingCompany, isPmTitle, isProductLeaderTitle, isTechIndustry, parseFormD, summarizeBoard } from "./market-sources";

describe("isPmTitle", () => {
  it.each([
    "Product Manager, Billing",
    "Senior Product Manager - Okta Identity Governance",
    "Head of Product",
    "Director of Product, Growth",
    "Group Product Manager",
  ])("accepts %s", (t) => expect(isPmTitle(t)).toBe(true));

  it.each([
    "Product Marketing Manager",
    "Senior Director, Product and Brand Communications",
    "VP, Product Engineering",
    "Staff Product Designer",
    "Software Engineer",
  ])("rejects %s", (t) => expect(isPmTitle(t)).toBe(false));
});

describe("isProductLeaderTitle", () => {
  it("separates leaders from individual PMs", () => {
    expect(isProductLeaderTitle("VP of Product")).toBe(true);
    expect(isProductLeaderTitle("Senior Product Manager")).toBe(false);
  });
});

describe("isOperatingCompany", () => {
  it.each(["Harvey AI Corp", "Exa Labs Inc.", "Crusoe Inc.", "Superhuman Platform Inc."])("keeps %s", (n) => expect(isOperatingCompany(n)).toBe(true));
  it.each(["Sequoia Capital Fund XV, L.P.", "Acme Opportunity Fund LLC", "Main Street Properties Inc.", "Blue Holdings Inc."])("drops %s", (n) => expect(isOperatingCompany(n)).toBe(false));
});

describe("isTechIndustry", () => {
  it("keeps technology and drops biotech", () => {
    expect(isTechIndustry("Other Technology")).toBe(true);
    expect(isTechIndustry("Biotechnology")).toBe(false);
    expect(isTechIndustry(null)).toBe(false);
  });
});

describe("parseFormD", () => {
  const xml = `<edgarSubmission><primaryIssuer><issuerAddress><city>DENVER</city><stateOrCountry>CO</stateOrCountry></issuerAddress></primaryIssuer>
    <relatedPersonsList>
      <relatedPersonInfo><relatedPersonName><firstName>CHASE</firstName><lastName>LOCHMILLER</lastName></relatedPersonName><relatedPersonRelationshipList><relationship>Executive Officer</relationship><relationship>Director</relationship></relatedPersonRelationshipList><relationshipClarification>CEO</relationshipClarification></relatedPersonInfo>
    </relatedPersonsList>
    <offeringData><industryGroup><industryGroupType>Other Technology</industryGroupType></industryGroup>
    <offeringSalesAmounts><totalOfferingAmount>Indefinite</totalOfferingAmount><totalAmountSold>3100000000</totalAmountSold></offeringSalesAmounts></offeringData></edgarSubmission>`;

  it("reads amount, industry, location and named people", () => {
    const f = parseFormD(xml, { company: "Crusoe Inc.", cik: "1234567", path: "edgar/data/1234567/0001234567-26-000042.txt" }, "2026-09-17");
    expect(f).toMatchObject({
      accession: "0001234567-26-000042",
      industry: "Other Technology",
      city: "DENVER",
      state: "CO",
      amountSold: 3_100_000_000,
      people: [{ name: "CHASE LOCHMILLER", relationship: "Executive Officer, Director", title: "CEO" }],
      filingUrl: "https://www.sec.gov/Archives/edgar/data/1234567/000123456726000042/",
    });
  });
});

describe("summarizeBoard", () => {
  it("counts recent postings and keeps PM roles newest first", () => {
    const now = new Date("2026-10-07T12:00:00Z");
    const s = summarizeBoard("Acme", "Tech", [
      { title: "Product Manager", url: "u1", location: "SF", postedAt: "2026-09-20T00:00:00Z" },
      { title: "Head of Product", url: "u2", location: "SF", postedAt: "2026-10-05T00:00:00Z" },
      { title: "Software Engineer", url: "u3", location: "SF", postedAt: "2026-07-20T00:00:00Z" },
      { title: "Product Manager, Old", url: "u4", location: "SF", postedAt: "2026-06-01T00:00:00Z" },
    ], now);
    expect(s).toMatchObject({ totalOpen: 4, engineeringOpen: 1, pmOpen: 3, postedLast30: 2, postedPrior60: 1 });
    expect(s.pmRoles.map((r) => r.url)).toEqual(["u2", "u1"]);
    expect(s.leaderRoles.map((r) => r.url)).toEqual(["u2"]);
  });
});
