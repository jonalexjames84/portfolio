import { describe, it, expect } from "vitest";
import { classifyListing, extractListingUrl, type LivenessInput } from "./listing-liveness";

function input(overrides: Partial<LivenessInput> = {}): LivenessInput {
  return {
    originalUrl: "https://job-boards.greenhouse.io/acme/jobs/12345",
    finalUrl: "https://job-boards.greenhouse.io/acme/jobs/12345",
    httpStatus: 200,
    body: "<h1>Product Manager</h1><p>We are hiring.</p>",
    ...overrides,
  };
}

describe("classifyListing", () => {
  it("treats a normal 200 with content as live", () => {
    expect(classifyListing(input()).liveness).toBe("live");
  });

  it("treats 404 and 410 as dead", () => {
    expect(classifyListing(input({ httpStatus: 404 })).liveness).toBe("dead");
    expect(classifyListing(input({ httpStatus: 410 })).liveness).toBe("dead");
  });

  // Regression: the real Baselayer failure from 2026-08-04.
  it("detects the Greenhouse ?error=true bounce", () => {
    const v = classifyListing(
      input({
        originalUrl: "https://job-boards.greenhouse.io/baselayer/jobs/5288970008",
        finalUrl: "https://job-boards.greenhouse.io/baselayer?error=true",
      })
    );
    expect(v.liveness).toBe("dead");
    expect(v.reason).toContain("board index");
  });

  // Regression: the real Vercel failure from 2026-08-04.
  it("detects a redirect that drops path depth", () => {
    const v = classifyListing(
      input({
        originalUrl: "https://vercel.com/careers/senior-product-manager-us-4547564004",
        finalUrl: "https://vercel.com/careers",
      })
    );
    expect(v.liveness).toBe("dead");
  });

  // Regression: the real Kilo Code failure from 2026-08-04.
  it("detects BuiltIn's removal notice", () => {
    const v = classifyListing(
      input({ body: "Sorry, this job was removed at 12:15 p.m. (UTC) on Wednesday, Dec 03, 2025" })
    );
    expect(v.liveness).toBe("dead");
    expect(v.reason).toContain("this job was removed");
  });

  it("detects other common closure phrasings", () => {
    for (const body of [
      "This position is no longer available.",
      "We are no longer accepting applications for this role.",
      "This job has been filled.",
      "Applications are now closed.",
    ]) {
      expect(classifyListing(input({ body })).liveness).toBe("dead");
    }
  });

  it("does not fire on JD prose that merely contains 'closed' or 'filled'", () => {
    const body =
      "You will build closed-loop feedback systems and have filled a similar role before. Applications welcome.";
    expect(classifyListing(input({ body })).liveness).toBe("live");
  });

  it("returns unknown — never dead — on server errors and timeouts", () => {
    expect(classifyListing(input({ httpStatus: 500 })).liveness).toBe("unknown");
    expect(classifyListing(input({ httpStatus: 429 })).liveness).toBe("unknown");
    expect(classifyListing(input({ httpStatus: 0 })).liveness).toBe("unknown");
  });

  it("returns unknown on an empty body, since JS-rendered boards look like that", () => {
    expect(classifyListing(input({ body: "   " })).liveness).toBe("unknown");
  });

  it("does not treat a deeper or equal-depth redirect as dead", () => {
    expect(
      classifyListing(
        input({
          originalUrl: "https://jobs.ashbyhq.com/stedi/abc-123",
          finalUrl: "https://jobs.ashbyhq.com/stedi/abc-123/application",
        })
      ).liveness
    ).toBe("live");
  });

  it("ignores a trailing-slash-only difference", () => {
    expect(
      classifyListing(
        input({
          originalUrl: "https://example.com/careers/pm",
          finalUrl: "https://example.com/careers/pm/",
        })
      ).liveness
    ).toBe("live");
  });

  it("does not crash on an unparseable URL", () => {
    expect(
      classifyListing(input({ originalUrl: "not a url", finalUrl: "also not a url" })).liveness
    ).toBe("live");
  });
});

describe("extractListingUrl", () => {
  it("prefers job_url when set", () => {
    expect(extractListingUrl("https://a.example/jobs/1", "Link: https://b.example/jobs/2")).toBe(
      "https://a.example/jobs/1"
    );
  });

  it("treats a blank job_url as absent", () => {
    expect(extractListingUrl("   ", "Link: https://b.example/jobs/2")).toBe(
      "https://b.example/jobs/2"
    );
  });

  // Regression: the exact scraper note format that hid 22 rows from the sweep
  // on 2026-08-04, 17 of which turned out to be dead.
  it("pulls the link out of a scraper note", () => {
    expect(
      extractListingUrl(
        null,
        "Location: San Francisco, CA | Link: https://job-boards.greenhouse.io/vercel/jobs/5808590004 | Auto-scraped"
      )
    ).toBe("https://job-boards.greenhouse.io/vercel/jobs/5808590004");
  });

  it("stops at the pipe delimiter rather than swallowing the rest of the note", () => {
    const url = extractListingUrl(null, "Link: https://x.example/jobs/9 | Auto-scraped 2026-08-04");
    expect(url).toBe("https://x.example/jobs/9");
  });

  it("strips trailing sentence punctuation", () => {
    expect(extractListingUrl(null, "Apply at https://x.example/jobs/9.")).toBe(
      "https://x.example/jobs/9"
    );
  });

  it("returns null when there is no URL anywhere", () => {
    expect(extractListingUrl(null, "Jon is a power user of this product.")).toBeNull();
    expect(extractListingUrl(null, null)).toBeNull();
  });
});

describe("board handoff to an employer careers site", () => {
  // Regression: caught by the 2026-08-05 dry run. This exact redirect was
  // classified dead while the req was verifiably open on Greenhouse's API.
  it("stays live when the destination keeps the req id in the path", () => {
    expect(
      classifyListing({
        originalUrl: "https://boards.greenhouse.io/roblox/jobs/8014742",
        finalUrl: "https://careers.roblox.com/jobs/8014742?gh_jid=8014742",
        httpStatus: 200,
        body: "<html>Senior Product Manager, User Life Cycle: Engagement</html>",
      }).liveness
    ).toBe("live");
  });

  it("stays live when the req id survives only in the query string", () => {
    expect(
      classifyListing({
        originalUrl: "https://boards.greenhouse.io/acme/jobs/998877",
        finalUrl: "https://acme.com/careers?gh_jid=998877",
        httpStatus: 200,
        body: "<html>a real posting</html>",
      }).liveness
    ).toBe("live");
  });

  it("still retires a bounce to an index that drops the req id", () => {
    expect(
      classifyListing({
        originalUrl: "https://vercel.com/careers/senior-product-manager-us-4547564004",
        finalUrl: "https://vercel.com/careers",
        httpStatus: 200,
        body: "<html>all open roles</html>",
      }).liveness
    ).toBe("dead");
  });
});
