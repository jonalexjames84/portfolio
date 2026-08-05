#!/usr/bin/env -S node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
/**
 * Find which ATS board tokens actually exist for a list of companies.
 *
 * Board tokens are unguessable. In the 2026-08-05 sweep, 130 educated guesses
 * produced 31 real boards — Zynga is `zyngacareers` not `zynga`, Skillz is
 * `skillzinc`, 2K is `2k`, Unity has no public board at all. Guessing wrong is
 * indistinguishable from "company isn't hiring", which is how an entire industry
 * stayed invisible to the pipeline for months.
 *
 * So: probe, never assume. This asks all three providers for every candidate and
 * reports only what answered.
 *
 * Usage:
 *   ./probe-boards.ts riotgames roblox unity            # try each token everywhere
 *   ./probe-boards.ts --greenhouse 2k --lever xsolla    # pin a provider
 *   ./probe-boards.ts --json roblox
 *   cat tokens.txt | ./probe-boards.ts
 *
 * Exits 0 always — a miss is information, not an error.
 */

type AtsType = "greenhouse" | "ashby" | "lever";

const ENDPOINTS: Record<AtsType, (t: string) => string> = {
  greenhouse: (t) => `https://boards-api.greenhouse.io/v1/boards/${t}/jobs`,
  ashby: (t) => `https://api.ashbyhq.com/posting-api/job-board/${t}`,
  lever: (t) => `https://api.lever.co/v0/postings/${t}?mode=json`,
};

const TIMEOUT_MS = 15_000;

function countJobs(type: AtsType, data: unknown): number | null {
  if (!data) return null;
  if (type === "lever") return Array.isArray(data) ? data.length : null;
  const jobs = (data as { jobs?: unknown }).jobs;
  return Array.isArray(jobs) ? jobs.length : null;
}

interface Result {
  token: string;
  atsType: AtsType;
  jobs: number | null;
  status: number | string;
}

async function probe(token: string, atsType: AtsType): Promise<Result> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINTS[atsType](token), {
      signal: controller.signal,
      headers: { "User-Agent": "job-search-os/1.0" },
    });
    if (!res.ok) return { token, atsType, jobs: null, status: res.status };
    return { token, atsType, jobs: countJobs(atsType, await res.json()), status: res.status };
  } catch (e) {
    return { token, atsType, jobs: null, status: `ERR:${(e as Error).name}` };
  } finally {
    clearTimeout(timer);
  }
}

/** Bounded concurrency — these are other people's APIs. */
async function mapPool<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await fn(items[i]);
      }
    })
  );
  return out;
}

const argv = process.argv.slice(2);
const json = argv.includes("--json");
const pairs: Array<{ token: string; atsType: AtsType }> = [];
const loose: string[] = [];

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--json") continue;
  if (a === "--greenhouse" || a === "--ashby" || a === "--lever") {
    const type = a.slice(2) as AtsType;
    const token = argv[++i];
    if (token) pairs.push({ token, atsType: type });
    continue;
  }
  loose.push(a);
}

if (!process.stdin.isTTY) {
  const piped = await new Promise<string>((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
  });
  loose.push(...piped.split(/\s+/).filter(Boolean));
}

for (const token of loose) {
  for (const atsType of ["greenhouse", "ashby", "lever"] as AtsType[]) {
    pairs.push({ token, atsType });
  }
}

if (pairs.length === 0) {
  console.error("usage: ./probe-boards.ts <token> [token...]  |  --greenhouse <token>");
  process.exit(2);
}

const results = await mapPool(pairs, 8, (p) => probe(p.token, p.atsType));
const hits = results.filter((r) => r.jobs && r.jobs > 0).sort((a, b) => b.jobs! - a.jobs!);
const misses = results.filter((r) => !r.jobs);

if (json) {
  console.log(JSON.stringify({ hits, misses }, null, 2));
} else {
  for (const h of hits) {
    console.log(`HIT  ${String(h.jobs).padStart(5)}  ${h.atsType.padEnd(11)} ${h.token}`);
  }
  if (hits.length === 0) console.log("(no live boards found)");
  console.log(`\n${hits.length} live · ${misses.length} miss`);
  console.log(
    "\nA miss means this token+provider pair does not exist — not that the company\n" +
      "isn't hiring. Check the careers page for the real ATS host before concluding."
  );
}
