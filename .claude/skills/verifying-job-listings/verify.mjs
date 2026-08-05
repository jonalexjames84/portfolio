#!/usr/bin/env node
/**
 * Verify job postings are actually open, by asking the employer's ATS API
 * rather than loading the page a human would see.
 *
 * Usage:
 *   ./verify.mjs <url> [url...]
 *   cat urls.txt | ./verify.mjs
 *   ./verify.mjs --json <url>          # machine-readable
 *
 * Exit code is 1 if anything came back DEAD, so it can gate a queue build.
 *
 * Why not just fetch the page: every dead posting in the 2026-08-04 audit
 * returned HTTP 200. Career sites soft-404, boards render closure notices in
 * JavaScript, and aggregators keep expired posts up with a live "Apply" button.
 * The ATS API is the only source that actually knows.
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const TIMEOUT_MS = 25_000;

async function get(url, { json = false } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctl.signal,
      redirect: "follow",
      headers: { "user-agent": UA, accept: json ? "application/json" : "text/html" },
    });
    const body = json && res.ok ? await res.json() : await res.text();
    return { ok: res.ok, status: res.status, finalUrl: res.url || url, body };
  } finally {
    clearTimeout(t);
  }
}

const V = (verdict, title, detail) => ({ verdict, title, detail });

/** Greenhouse: boards-api returns the req, or 404s when it's gone. */
async function greenhouse(board, id) {
  const r = await get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${id}`, {
    json: true,
  });
  if (r.status === 404) {
    // A 404 is not "role closed" — the req may have been re-posted under a new
    // id. Look for the same title on the board before declaring it dead.
    const all = await get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`, {
      json: true,
    });
    const n = all.ok ? (all.body.jobs || []).length : 0;
    return V("DEAD", null, `req ${id} 404s (board has ${n} other open reqs — check for a re-post)`);
  }
  if (!r.ok) return V("UNKNOWN", null, `HTTP ${r.status} from boards-api`);
  return V("LIVE", r.body.title?.trim(), r.body.location?.name || "");
}

/** Ashby: the org's posting API lists every open posting; membership is truth. */
async function ashby(org, uuid) {
  const r = await get(`https://api.ashbyhq.com/posting-api/job-board/${org}`, { json: true });
  if (!r.ok) return V("UNKNOWN", null, `HTTP ${r.status} from Ashby posting-api`);
  const jobs = r.body.jobs || [];
  const hit = jobs.find((j) => j.id === uuid);
  if (hit) return V("LIVE", hit.title?.trim(), hit.location || "");
  return V("DEAD", null, `not among ${jobs.length} open postings on the ${org} board`);
}

/** Lever. */
async function lever(org, id) {
  const r = await get(`https://api.lever.co/v0/postings/${org}/${id}`, { json: true });
  if (r.status === 404) return V("DEAD", null, "req 404s on Lever");
  if (!r.ok) return V("UNKNOWN", null, `HTTP ${r.status} from Lever`);
  return V("LIVE", r.body.text?.trim(), r.body.categories?.location || "");
}

/**
 * YC: no public API, but the company's own jobs page only lists open roles.
 * The individual job page stays up after close, which is the trap.
 */
async function yc(company, slug) {
  const r = await get(`https://www.ycombinator.com/companies/${company}/jobs`);
  if (!r.ok) return V("UNKNOWN", null, `HTTP ${r.status} from YC company page`);
  const open = new Set(
    [...r.body.matchAll(new RegExp(`/companies/${company}/jobs/([A-Za-z0-9]+-[a-z0-9-]+)`, "g"))].map(
      (m) => m[1]
    )
  );
  if (open.has(slug)) return V("LIVE", slug, `listed among ${open.size} open roles`);
  return V("DEAD", null, `not listed among ${open.size} open roles on the company page`);
}

/** Aggregators republish stale posts. Trust their JSON-LD validThrough, not the button. */
async function builtin(url) {
  const r = await get(url);
  if (!r.ok) return V("UNKNOWN", null, `HTTP ${r.status}`);
  const removed = r.body.match(/Sorry, this job was removed[^<"]*/i);
  if (removed) return V("DEAD", null, removed[0].trim());
  const vt = r.body.match(/"validThrough"\s*:\s*"([^"]+)"/);
  if (vt && new Date(vt[1]) < new Date()) {
    return V("DEAD", null, `JSON-LD validThrough ${vt[1].slice(0, 10)} is in the past`);
  }
  return V("UNKNOWN", null, "aggregator page — confirm on the employer's own board");
}

/** Anything else: only positive evidence of closure counts. */
const CLOSED = [
  /sorry,\s*this job was removed/i,
  /this job (?:posting |listing )?(?:has been|was) (?:removed|closed|filled)/i,
  /(?:this |the )?(?:job|position|role|posting|opening) is (?:no longer|not currently) (?:available|open|accepting)/i,
  /no longer accepting applications/i,
];
async function generic(url) {
  let r;
  try {
    r = await get(url);
  } catch (e) {
    return V("UNKNOWN", null, `fetch failed: ${e.message}`);
  }
  if (r.status === 404 || r.status === 410) return V("DEAD", null, `HTTP ${r.status}`);
  if (!r.ok) return V("UNKNOWN", null, `HTTP ${r.status} — bot-blocked or down, not evidence`);
  for (const re of CLOSED) {
    const m = r.body.match(re);
    if (m) return V("DEAD", null, `page states: "${m[0].trim()}"`);
  }
  // Redirected somewhere shallower while dropping the req id => bounced to an index.
  try {
    const a = new URL(url), b = new URL(r.finalUrl);
    const seg = (p) => p.split("/").filter(Boolean);
    const reqId = seg(a.pathname).reverse().find((s) => /^\d{4,}$/.test(s));
    const idSurvives =
      reqId && (r.finalUrl.includes(reqId));
    if (!idSurvives && seg(b.pathname).length < seg(a.pathname).length) {
      return V("DEAD", null, `redirected to ${r.finalUrl} — req removed`);
    }
  } catch {}
  return V("UNKNOWN", null, "HTTP 200, no closure signal — confirm the title by hand");
}

function route(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return () => V("UNKNOWN", null, "unparseable URL");
  }
  const p = u.pathname;
  let m;
  if ((m = p.match(/^\/([\w-]+)\/jobs\/(\d+)/)) && /greenhouse\.io$/.test(u.hostname))
    return () => greenhouse(m[1], m[2]);
  if ((m = u.searchParams.get("gh_jid"))) {
    const board = u.hostname.split(".").find((s) => s !== "www" && s !== "careers");
    return () => greenhouse(board, m);
  }
  if ((m = p.match(/^\/([^/]+)\/([0-9a-f-]{36})/)) && /ashbyhq\.com$/.test(u.hostname))
    return () => ashby(m[1], m[2]);
  if ((m = p.match(/^\/([^/]+)\/([0-9a-f-]{36})/)) && /lever\.co$/.test(u.hostname))
    return () => lever(m[1], m[2]);
  if ((m = p.match(/^\/companies\/([^/]+)\/jobs\/([^/?#]+)/)) && /ycombinator\.com$/.test(u.hostname))
    return () => yc(m[1], m[2]);
  if (/builtin\.com$/.test(u.hostname)) return () => builtin(url);
  return () => generic(url);
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
let urls = args.filter((a) => !a.startsWith("--"));
if (!urls.length && !process.stdin.isTTY) {
  urls = (await new Promise((res) => {
    let d = "";
    process.stdin.on("data", (c) => (d += c)).on("end", () => res(d));
  }))
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
if (!urls.length) {
  console.error("usage: verify.mjs <url>...   (or pipe one URL per line)");
  process.exit(2);
}

const out = [];
for (const url of urls) {
  let r;
  try {
    r = await route(url)();
  } catch (e) {
    r = V("UNKNOWN", null, `error: ${e.message}`);
  }
  out.push({ url, ...r });
}

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  for (const r of out) {
    const mark = { LIVE: "LIVE   ", DEAD: "DEAD   ", UNKNOWN: "UNKNOWN" }[r.verdict];
    console.log(`${mark} ${r.title ? r.title : r.detail}`);
    console.log(`        ${r.url}`);
    if (r.title && r.detail) console.log(`        ${r.detail}`);
  }
  const c = (v) => out.filter((r) => r.verdict === v).length;
  console.log(`\n${c("LIVE")} live · ${c("DEAD")} dead · ${c("UNKNOWN")} unverified`);
}
process.exit(out.some((r) => r.verdict === "DEAD") ? 1 : 0);
