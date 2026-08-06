#!/usr/bin/env npx tsx
/**
 * Apply the hard gates to every pipeline row written before gating existed.
 *
 * Run `--dry-run` first, always. A gate that is wrong about a whole category
 * is easy to see in a list of 200 rejections and nearly invisible in an empty
 * dashboard three days later.
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateGates, type GateOverride } from "../src/lib/job-search/gates";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Same .env.local loader as scripts/sync-materials.mjs — real environment wins.
function loadEnv(): void {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i === -1 || line.trim().startsWith("#")) continue;
    const key = line.slice(0, i).trim();
    if (process.env[key]) continue;
    process.env[key] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const dryRun = process.argv.includes("--dry-run");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const { data: overrides } = await supabase
  .from("job_gate_overrides")
  .select("company_key, decision, gate, reason");

const { data: rows, error } = await supabase
  .from("job_pipeline_entries")
  .select("id, company, industry, location, jd_text, status");

if (error) throw error;

const rejections: Array<{ company: string; status: string; reason: string | null }> = [];
let passed = 0;

for (const row of rows ?? []) {
  const gate = evaluateGates(
    {
      company: row.company,
      industry: row.industry,
      location: row.location,
      jd_text: row.jd_text,
    },
    (overrides ?? []) as GateOverride[],
  );

  if (gate.pass) passed += 1;
  else rejections.push({ company: row.company, status: row.status, reason: gate.reason });

  if (!dryRun) {
    await supabase.from("job_pipeline_entries").update({ gate_result: gate }).eq("id", row.id);
  }
}

console.log(`${rows?.length ?? 0} rows · ${passed} pass · ${rejections.length} rejected\n`);
for (const r of rejections) {
  console.log(`  REJECT  ${r.company.padEnd(28)} [${r.status}]  ${r.reason}`);
}
if (dryRun) console.log("\n(dry run — nothing written)");
