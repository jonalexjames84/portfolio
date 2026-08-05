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

import { routeListing, checkListing, titlesDiverge } from "./listing-liveness";

/** Minimal Response stand-in so these tests never touch the network. */
function res(body: unknown, { status = 200, url = "" } = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    url,
    json: async () => JSON.parse(text),
    text: async () => text,
  } as unknown as Response;
}
const stub = (map: Record<string, Response>) => async (u: string) => {
  const hit = Object.entries(map).find(([k]) => u.includes(k));
  if (!hit) throw new Error(`unstubbed fetch: ${u}`);
  return hit[1];
};

describe("routeListing", () => {
  it("routes each ATS to its own API", () => {
    expect(routeListing("https://job-boards.greenhouse.io/webflow/jobs/8097749")).toEqual({
      kind: "greenhouse",
      board: "webflow",
      id: "8097749",
    });
    expect(
      routeListing("https://jobs.ashbyhq.com/stedi/65b38320-75df-4386-b5e5-25b411e7a6a4")
    ).toEqual({ kind: "ashby", org: "stedi", id: "65b38320-75df-4386-b5e5-25b411e7a6a4" });
    expect(
      routeListing("https://www.ycombinator.com/companies/artisan/jobs/9a5WFVO-product-manager")
    ).toEqual({ kind: "yc", company: "artisan", slug: "9a5WFVO-product-manager" });
    expect(routeListing("https://builtin.com/job/product-manager/7570967").kind).toBe("aggregator");
    expect(routeListing("https://vercel.com/careers/senior-pm-4547564004").kind).toBe("generic");
  });

  // An employer careers site fronting a Greenhouse board still has a real
  // Greenhouse req behind it — worth far more than scraping their HTML.
  it("recovers the Greenhouse board from a gh_jid on an employer domain", () => {
    expect(routeListing("https://careers.roblox.com/jobs/8014742?gh_jid=8014742")).toEqual({
      kind: "greenhouse",
      board: "roblox",
      id: "8014742",
    });
  });

  it("does not throw on an unparseable URL", () => {
    expect(routeListing("not a url").kind).toBe("generic");
  });
});

describe("checkListing", () => {
  it("returns the canonical title for a live Greenhouse req", async () => {
    const v = await checkListing(
      "https://job-boards.greenhouse.io/webflow/jobs/8097749",
      stub({
        "/jobs/8097749": res({
          title: "Senior Product Manager, AI",
          location: { name: "U.S. Remote" },
        }),
      })
    );
    expect(v.liveness).toBe("live");
    expect(v.title).toBe("Senior Product Manager, AI");
    expect(v.via).toBe("greenhouse");
  });

  // Regression: Baselayer. The req 404'd but the role was open under a new id,
  // so the reason must point at the re-post rather than read as "role gone".
  it("flags a 404 as a dead req id and counts what else is on the board", async () => {
    const v = await checkListing(
      "https://job-boards.greenhouse.io/baselayer/jobs/5288970008",
      stub({
        "/jobs/5288970008": res("", { status: 404 }),
        "/boards/baselayer/jobs": res({ jobs: new Array(16).fill({ id: 1 }) }),
      })
    );
    expect(v.liveness).toBe("dead");
    expect(v.reason).toContain("16 other reqs open");
    expect(v.reason).toContain("re-post");
  });

  // Regression: ZoomInfo. A 403 is bot-blocking, not closure.
  it("never retires on a non-404 error status", async () => {
    const v = await checkListing(
      "https://job-boards.greenhouse.io/zoominfo/jobs/1",
      stub({ "/jobs/1": res("", { status: 403 }) })
    );
    expect(v.liveness).toBe("unknown");
  });

  it("treats absence from the Ashby board as dead", async () => {
    const ID = "7a3b9337-ac67-4255-8db5-08bb3d57541e";
    const live = await checkListing(
      `https://jobs.ashbyhq.com/harvey/${ID}`,
      stub({
        "job-board/harvey": res({
          jobs: [{ id: ID, title: "Senior Product Manager, Command Center", location: "SF" }],
        }),
      })
    );
    expect(live.liveness).toBe("live");
    expect(live.title).toBe("Senior Product Manager, Command Center");

    const gone = await checkListing(
      "https://jobs.ashbyhq.com/harvey/00000000-0000-0000-0000-000000000000",
      stub({ "job-board/harvey": res({ jobs: [{ id: ID }] }) })
    );
    expect(gone.liveness).toBe("dead");
    expect(gone.reason).toContain("1 open postings");
  });

  it("uses the YC company index, not the job page that outlives the role", async () => {
    const index = (slugs: string[]) =>
      res(slugs.map((s) => `<a href="/companies/tailor/jobs/${s}">x</a>`).join(""));
    const open = await checkListing(
      "https://www.ycombinator.com/companies/tailor/jobs/CCOEa0I-forward-deployed-product-manager",
      stub({ "/companies/tailor/jobs": index(["CCOEa0I-forward-deployed-product-manager"]) })
    );
    expect(open.liveness).toBe("live");
    const closed = await checkListing(
      "https://www.ycombinator.com/companies/tailor/jobs/CCOEa0I-forward-deployed-product-manager",
      stub({ "/companies/tailor/jobs": index(["zzz-some-other-role"]) })
    );
    expect(closed.liveness).toBe("dead");
  });

  // Regression: Kilo Code, live "Apply Now" button over an expired post.
  it("retires an aggregator post whose validThrough has passed", async () => {
    const v = await checkListing(
      "https://builtin.com/job/product-manager/7570967",
      stub({ builtin: res('<script>{"validThrough":"2025-12-03T12:15:45+00:00"}</script>') })
    );
    expect(v.liveness).toBe("dead");
    expect(v.reason).toContain("validThrough");
  });

  it("reports unknown rather than dead when the network fails", async () => {
    const v = await checkListing("https://job-boards.greenhouse.io/x/jobs/1", async () => {
      throw new Error("ECONNRESET");
    });
    expect(v.liveness).toBe("unknown");
    expect(v.reason).toContain("ECONNRESET");
  });
});

describe("titlesDiverge", () => {
  // Regression: the queue said "Claude Code", the live req was "Claude Tag".
  it("catches a link pointing at a different job", () => {
    expect(titlesDiverge("Product Manager, Claude Code", "Product Manager, Claude Tag")).toBe(true);
  });

  // Regression: the first dry run of the deduped route flagged this real pair
  // as a mismatch. "PM" and "Product Manager" are the same job.
  it("expands the PM abbreviation rather than reporting it as drift", () => {
    expect(
      titlesDiverge("Senior PM, Command Center", "Senior Product Manager, Command Center")
    ).toBe(false);
  });

  // Same dry run, the genuine catch: different seniority AND different scope.
  it("still flags a real scope change", () => {
    expect(
      titlesDiverge(
        "Principal Product Manager, Engineering Efficiency",
        "Senior Product Manager, Engineering Acceleration"
      )
    ).toBe(true);
  });

  it("tolerates ordinary rewording", () => {
    expect(titlesDiverge("Sr. Product Manager", "Senior Product Manager")).toBe(false);
    expect(
      titlesDiverge("Senior Product Manager, User Lifecycle", "Senior Product Manager, User Life Cycle: Engagement")
    ).toBe(false);
    expect(titlesDiverge("Product Manager", "Product Manager")).toBe(false);
  });

  it("stays quiet when either side is missing", () => {
    expect(titlesDiverge(null, "Product Manager")).toBe(false);
    expect(titlesDiverge("Product Manager", null)).toBe(false);
  });
});

describe("routeListing — gh_jid on a Greenhouse-hosted URL", () => {
  it("takes the board from the path, not the subdomain", () => {
    // Regression: the gh_jid branch ran first and derived the board from the
    // hostname, so job-boards.greenhouse.io/scopely/jobs/123?gh_jid=123 queried
    // board "job-boards", 404'd, and reported a live A-tier req as DEAD.
    const r = routeListing(
      "https://job-boards.greenhouse.io/scopely/jobs/5287656008?gh_jid=5287656008"
    );
    expect(r).toEqual({ kind: "greenhouse", board: "scopely", id: "5287656008" });
  });

  it("still routes an employer-fronted careers site by subdomain", () => {
    const r = routeListing("https://careers.roblox.com/jobs/8014742?gh_jid=8014742");
    expect(r).toEqual({ kind: "greenhouse", board: "roblox", id: "8014742" });
  });

  it("handles boards.greenhouse.io with a redundant gh_jid too", () => {
    const r = routeListing("https://boards.greenhouse.io/2k/jobs/7655914003?gh_jid=7655914003");
    expect(r).toEqual({ kind: "greenhouse", board: "2k", id: "7655914003" });
  });
});
