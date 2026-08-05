#!/usr/bin/env -S node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
/**
 * Give every existing pipeline row a canonical key, and seed the application
 * ledger from the applications Jon has already sent.
 *
 * Without this the guard starts blind: it would happily hand out a claim for
 * Retool or Replit because `job_applications` is empty, even though those went
 * out in April. The ledger has to know the past before it can police the future.
 *
 * Idempotent — safe to re-run. Rows whose key would collide with another row's
 * are left NULL and reported rather than merged, because deciding which of two
 * near-identical rows is the real one is Jon's call, not a script's.
 *
 * Usage:
 *   .claude/skills/one-application-per-company/backfill.ts --dry-run
 *   .claude/skills/one-application-per-company/backfill.ts
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  canonicalJobKey,
  normalizeCompany,
} from "../../../src/lib/job-search/application-guard.ts";

function loadEnv(): void {
  try {
    const raw = readFileSync(new URL("../../../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* already exported */
  }
}
loadEnv();

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const dryRun = process.argv.includes("--dry-run");

/**
 * Pipeline statuses that mean an application actually went out.
 *
 * `passed` is deliberately absent: it means Jon looked and declined, so there is
 * no application to record and no slot to occupy. `saved` likewise.
 */
const SUBMITTED_STATUSES = new Set(["applied", "screen", "interview", "offer"]);
const CLOSED_STATUSES = new Set(["rejected"]);

interface Row {
  id: string;
  company: string;
  role: string;
  status: string;
  job_url: string | null;
  external_id: string | null;
  applied_date: string | null;
  dedupe_key: string | null;
}

const { data, error } = await db
  .from("job_pipeline_entries")
  .select("id, company, role, status, job_url, external_id, applied_date, dedupe_key");

if (error) {
  console.error(error.message);
  process.exit(1);
}

const rows = (data ?? []) as Row[];
console.log(`${rows.length} pipeline rows\n`);

// --- 1. Canonical keys, collisions held back -------------------------------

const byKey = new Map<string, Row[]>();
for (const r of rows) {
  const key = canonicalJobKey({
    company: r.company,
    role: r.role,
    jobUrl: r.job_url,
    externalId: r.external_id,
    atsType: r.job_url ? null : "greenhouse",
  });
  byKey.set(key, [...(byKey.get(key) ?? []), r]);
}

const collisions: Array<[string, Row[]]> = [];
let keyed = 0;

for (const [key, group] of byKey) {
  if (group.length > 1) {
    collisions.push([key, group]);
    continue;
  }
  const r = group[0];
  if (r.dedupe_key === key) continue;

  if (!dryRun) {
    const { error: e } = await db
      .from("job_pipeline_entries")
      .update({ dedupe_key: key, company_key: normalizeCompany(r.company) })
      .eq("id", r.id);
    if (e) {
      console.error(`  ! ${r.company} — ${r.role}: ${e.message}`);
      continue;
    }
  }
  keyed++;
}

console.log(`${dryRun ? "would key" : "keyed"}: ${keyed} rows`);

if (collisions.length > 0) {
  console.log(`\n${collisions.length} duplicate group(s) left unkeyed — merge by hand:`);
  for (const [key, group] of collisions) {
    console.log(`\n  ${key}`);
    for (const r of group) {
      console.log(`    ${r.id}  ${r.status.padEnd(9)} ${r.company} — ${r.role}`);
    }
  }
}

// --- 2. Company keys on the target list ------------------------------------

const { data: companies } = await db
  .from("job_target_companies")
  .select("id, name, company_key");

let companyKeyed = 0;
for (const c of (companies ?? []) as Array<{ id: string; name: string; company_key: string | null }>) {
  const key = normalizeCompany(c.name);
  if (c.company_key === key) continue;
  if (!dryRun) await db.from("job_target_companies").update({ company_key: key }).eq("id", c.id);
  companyKeyed++;
}
console.log(`\n${dryRun ? "would key" : "keyed"}: ${companyKeyed} target companies`);

// --- 3. Seed the ledger from applications already sent ---------------------

const applied = rows.filter(
  (r) => SUBMITTED_STATUSES.has(r.status) || CLOSED_STATUSES.has(r.status),
);

console.log(`\n${applied.length} row(s) represent a real application:`);

let seeded = 0;
for (const r of applied) {
  const key = canonicalJobKey({
    company: r.company,
    role: r.role,
    jobUrl: r.job_url,
    externalId: r.external_id,
  });
  const status = CLOSED_STATUSES.has(r.status) ? "closed" : "submitted";

  const { data: existing } = await db
    .from("job_applications")
    .select("id")
    .eq("dedupe_key", key)
    .neq("status", "withdrawn")
    .limit(1);

  if (existing?.length) {
    console.log(`  = ${r.company} — ${r.role} (already in ledger)`);
    continue;
  }

  console.log(`  ${dryRun ? "+" : "+"} ${status.padEnd(9)} ${r.company} — ${r.role}`);
  if (dryRun) continue;

  const { error: e } = await db.from("job_applications").insert({
    pipeline_entry_id: r.id,
    dedupe_key: key,
    company_key: normalizeCompany(r.company),
    company: r.company,
    role: r.role,
    job_url: r.job_url,
    status,
    agent_id: "backfill",
    submitted_at: r.applied_date ? `${r.applied_date}T00:00:00Z` : null,
    closed_at: status === "closed" ? new Date().toISOString() : null,
    notes: `Backfilled from job_pipeline_entries (status ${r.status}).`,
  });
  if (e) console.error(`    ! ${e.message}`);
  else seeded++;
}

console.log(`\n${dryRun ? "would seed" : "seeded"}: ${seeded} ledger record(s)`);
if (dryRun) console.log("\nDry run — nothing written. Re-run without --dry-run to apply.");
