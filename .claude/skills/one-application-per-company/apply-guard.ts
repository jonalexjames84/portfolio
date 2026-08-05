#!/usr/bin/env -S node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
/**
 * Claim a job before applying to it, so two agents cannot both apply.
 *
 * A thin CLI over src/lib/job-search/application-guard.ts (canonical keys, per
 * company caps) and the `job_claim_application` Postgres function (the atomic
 * decision). Same modules the API route uses — there is no second copy of the
 * rule to drift.
 *
 * The check TypeScript does alone is advisory: two agents can both read "no
 * conflict" a millisecond apart. The claim is what actually decides, because it
 * takes a per-company advisory lock inside the database.
 *
 * Node 22.6+ runs TypeScript directly, so there is no build step.
 *
 * Usage:
 *   ./apply-guard.ts claim   --agent <id> --company "Stedi" --role "Product Manager" --url <url>
 *   ./apply-guard.ts check   --company "Stedi" --role "Product Manager" --url <url>
 *   ./apply-guard.ts advance --url <url> --status prepared|submitted|closed|withdrawn [--note "..."]
 *   ./apply-guard.ts list    [--company "Stedi"]
 *   ./apply-guard.ts release --agent <id> --url <url>
 *
 * `claim` exits 1 when the application is blocked, so it can gate a batch.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  CLAIM_TTL_MINUTES,
  canonicalJobKey,
  companyApplicationCap,
  normalizeCompany,
} from "../../../src/lib/job-search/application-guard.ts";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

/** .env.local, without pulling in a dotenv dependency for one CLI. */
function loadEnv(): void {
  try {
    for (const line of readFileSync(new URL("../../../.env.local", import.meta.url), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // Env may already be present (CI, or exported by the shell).
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Is .env.local present?");
  process.exit(2);
}
const db = createClient(url, key);

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const command = argv[0];

function arg(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
}

function requireArg(name: string): string {
  const v = arg(name);
  if (!v) {
    console.error(`Missing --${name}`);
    process.exit(2);
  }
  return v;
}

/**
 * Agent identity. Defaults to something traceable rather than "agent", so a
 * stuck claim can be tracked back to the session that took it.
 */
function agentId(): string {
  return arg("agent") || process.env.CLAUDE_AGENT_ID || `pid-${process.pid}`;
}

/**
 * The employer's cap: the hand-set column if there is one, else the code
 * default. Looked up by normalized key so "Apollo.io" and "Apollo" agree.
 */
async function capFor(company: string): Promise<number> {
  const companyKey = normalizeCompany(company);
  const { data } = await db
    .from("job_target_companies")
    .select("name, max_concurrent_applications, company_key")
    .or(`company_key.eq.${companyKey},name.eq.${company}`)
    .limit(1);

  return companyApplicationCap(company, { override: data?.[0]?.max_concurrent_applications ?? null });
}

function jobFromArgs() {
  const company = requireArg("company");
  const role = requireArg("role");
  const jobUrl = arg("url") ?? null;
  return { company, role, jobUrl };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/** Read-only preview. Never writes, so it can never be the thing that claims. */
async function check(): Promise<number> {
  const job = jobFromArgs();
  const dedupeKey = canonicalJobKey(job);
  const companyKey = normalizeCompany(job.company);
  const cap = await capFor(job.company);

  const { data, error } = await db
    .from("job_applications")
    .select("dedupe_key, company, role, status, agent_id, claimed_at, submitted_at")
    .eq("company_key", companyKey)
    .neq("status", "withdrawn");

  if (error) {
    console.error(`Query failed: ${error.message}`);
    return 2;
  }

  const rows = data ?? [];
  const sameReq = rows.find((r) => r.dedupe_key === dedupeKey);
  const live = rows.filter(
    (r) =>
      r.dedupe_key !== dedupeKey &&
      (r.status === "prepared" ||
        r.status === "submitted" ||
        (r.status === "claimed" && Date.now() - Date.parse(r.claimed_at) < CLAIM_TTL_MINUTES * 60_000)),
  );

  console.log(`key      ${dedupeKey}`);
  console.log(`company  ${job.company} (${companyKey}) — cap ${cap}, ${live.length} open`);

  if (sameReq) {
    console.log(`\nBLOCKED  this req already has a ${sameReq.status} application (${sameReq.agent_id})`);
    return 1;
  }
  if (live.length >= cap) {
    console.log(`\nBLOCKED  company cap reached:`);
    for (const r of live) console.log(`         ${r.status.padEnd(9)} ${r.role}`);
    return 1;
  }
  console.log(`\nOK       nothing conflicting — run \`claim\` to reserve it.`);
  return 0;
}

/** The real thing. Atomic, and the only command whose verdict is binding. */
async function claim(): Promise<number> {
  const job = jobFromArgs();
  const agent = agentId();
  const dedupeKey = canonicalJobKey(job);

  const { data, error } = await db.rpc("job_claim_application", {
    p_dedupe_key: dedupeKey,
    p_company_key: normalizeCompany(job.company),
    p_company: job.company,
    p_role: job.role,
    p_agent_id: agent,
    p_job_url: job.jobUrl,
    p_cap: await capFor(job.company),
    p_claim_ttl_minutes: CLAIM_TTL_MINUTES,
    p_pipeline_entry_id: arg("pipeline-id") ?? null,
  });

  if (error) {
    console.error(`Claim failed: ${error.message}`);
    return 2;
  }

  const v = data as { allowed: boolean; outcome: string; reason: string; application_id?: string };
  console.log(`${v.allowed ? "CLAIMED " : "BLOCKED "} ${v.outcome}`);
  console.log(`         ${v.reason}`);
  console.log(`         key ${dedupeKey}`);
  if (v.allowed) {
    console.log(`         agent ${agent} · expires in ${CLAIM_TTL_MINUTES} min`);
    console.log(`\nWhen the materials are written:`);
    console.log(`  ./apply-guard.ts advance --url "${job.jobUrl ?? ""}" --status prepared`);
  }
  return v.allowed ? 0 : 1;
}

async function advance(): Promise<number> {
  const status = requireArg("status");
  const jobUrl = arg("url");
  const dedupeKey =
    arg("key") ??
    canonicalJobKey({ company: arg("company") ?? "", role: arg("role") ?? "", jobUrl: jobUrl ?? null });

  const { data, error } = await db.rpc("job_advance_application", {
    p_dedupe_key: dedupeKey,
    p_status: status,
    p_agent_id: agentId(),
    p_notes: arg("note") ?? null,
  });

  if (error) {
    console.error(`Failed: ${error.message}`);
    return 2;
  }
  const v = data as { ok: boolean; reason?: string; status?: string };
  console.log(v.ok ? `OK       now ${v.status} (${dedupeKey})` : `FAILED   ${v.reason}`);
  return v.ok ? 0 : 1;
}

/** Withdraw a claim you took but decided against, so the slot reopens now. */
async function release(): Promise<number> {
  const jobUrl = arg("url");
  const dedupeKey =
    arg("key") ??
    canonicalJobKey({ company: arg("company") ?? "", role: arg("role") ?? "", jobUrl: jobUrl ?? null });

  const { data, error } = await db.rpc("job_advance_application", {
    p_dedupe_key: dedupeKey,
    p_status: "withdrawn",
    p_agent_id: agentId(),
    p_notes: arg("note") ?? `Released by ${agentId()}.`,
  });

  if (error) {
    console.error(`Failed: ${error.message}`);
    return 2;
  }
  console.log((data as { ok: boolean }).ok ? `RELEASED ${dedupeKey}` : `Nothing to release for ${dedupeKey}`);
  return 0;
}

async function list(): Promise<number> {
  let q = db
    .from("job_applications")
    .select("company, role, status, agent_id, claimed_at, submitted_at, dedupe_key")
    .neq("status", "withdrawn")
    .order("company");

  const company = arg("company");
  if (company) q = q.eq("company_key", normalizeCompany(company));

  const { data, error } = await q;
  if (error) {
    console.error(error.message);
    return 2;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    console.log("No open applications.");
    return 0;
  }

  for (const r of rows) {
    const when = r.submitted_at ?? r.claimed_at;
    console.log(
      `${r.status.padEnd(10)} ${r.company.padEnd(22)} ${r.role.slice(0, 44).padEnd(46)} ${String(when).slice(0, 10)}  ${r.agent_id}`,
    );
  }

  const byCompany = new Map<string, number>();
  for (const r of rows) {
    if (r.status === "closed") continue;
    byCompany.set(r.company, (byCompany.get(r.company) ?? 0) + 1);
  }
  const over: string[] = [];
  for (const [co, n] of byCompany) {
    if (n > companyApplicationCap(co)) over.push(`${co} (${n})`);
  }
  console.log(`\n${rows.length} record(s)${over.length ? ` · over cap: ${over.join(", ")}` : ""}`);
  return 0;
}

// ---------------------------------------------------------------------------

const commands: Record<string, () => Promise<number>> = { claim, check, advance, release, list };

if (!command || !commands[command]) {
  console.error(`Usage: apply-guard.ts <claim|check|advance|release|list> [options]

  claim   --agent <id> --company <name> --role <title> [--url <url>] [--pipeline-id <uuid>]
  check   --company <name> --role <title> [--url <url>]
  advance --status <prepared|submitted|closed|withdrawn> (--url <url> | --key <key>) [--note <text>]
  release --agent <id> (--url <url> | --key <key>)
  list    [--company <name>]`);
  process.exit(2);
}

process.exit(await commands[command]());
