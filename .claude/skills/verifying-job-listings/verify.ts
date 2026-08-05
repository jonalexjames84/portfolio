#!/usr/bin/env -S node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
/**
 * Verify job postings are actually open.
 *
 * This is a thin CLI over src/lib/job-search/listing-liveness.ts — the exact
 * module the nightly /api/job-search/recheck-listings cron uses. There is no
 * second implementation to drift out of sync: if the cron would retire a role,
 * so does this, and vice versa.
 *
 * Node 22.6+ runs TypeScript directly, so there is no build step.
 *
 * Usage:
 *   ./verify.ts <url> [url...]
 *   cat urls.txt | ./verify.ts
 *   ./verify.ts --json <url>
 *   ./verify.ts --expect "Product Manager, Claude Code" <url>   # flag title drift
 *
 * Exits 1 if anything came back DEAD, so it can gate a queue build.
 */

import { checkListing, titlesDiverge } from "../../../src/lib/job-search/listing-liveness.ts";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const expectIdx = argv.indexOf("--expect");
const expected = expectIdx >= 0 ? argv[expectIdx + 1] : null;

let urls = argv.filter((a, i) => {
  if (a.startsWith("--")) return false;
  if (expectIdx >= 0 && i === expectIdx + 1) return false;
  return true;
});

if (!urls.length && !process.stdin.isTTY) {
  const piped: string = await new Promise((resolve) => {
    let d = "";
    process.stdin.on("data", (c) => (d += c)).on("end", () => resolve(d));
  });
  urls = piped.split("\n").map((s) => s.trim()).filter(Boolean);
}

if (!urls.length) {
  console.error("usage: verify.ts <url>...   (or pipe one URL per line)");
  process.exit(2);
}

const out = [];
for (const url of urls) {
  const r = await checkListing(url);
  const drift = expected ? titlesDiverge(expected, r.title) : false;
  out.push({ url, ...r, expected, titleDrift: drift });
}

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const r of out) {
    const mark = { live: "LIVE   ", dead: "DEAD   ", unknown: "UNKNOWN" }[r.liveness];
    console.log(`${mark} ${r.title ?? r.reason}`);
    console.log(`        ${r.url}  [via ${r.via}]`);
    if (r.title) console.log(`        ${r.reason}${r.location ? ` — ${r.location}` : ""}`);
    if (r.titleDrift) {
      console.log(`        ⚠ TITLE DRIFT — you queued this as "${r.expected}"`);
    }
  }
  const n = (v: string) => out.filter((r) => r.liveness === v).length;
  const drifted = out.filter((r) => r.titleDrift).length;
  console.log(
    `\n${n("live")} live · ${n("dead")} dead · ${n("unknown")} unverified` +
      (drifted ? ` · ${drifted} title drift` : "")
  );
}

process.exit(out.some((r) => r.liveness === "dead") ? 1 : 0);
