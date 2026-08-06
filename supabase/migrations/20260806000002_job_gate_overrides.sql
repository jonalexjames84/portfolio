-- Manual escape hatch for both hard gates.
--
-- A gate is the one thing in this system that can silently shrink the pipeline
-- to nothing. When it is wrong about a specific company, the fix must be one
-- row and no deploy — otherwise the pressure is to loosen the gate for
-- everyone, which is how a filter stops filtering.
--
-- company_key matches the canonical key produced by
-- src/lib/job-search/application-guard.ts (normalizeCompany).

CREATE TABLE IF NOT EXISTS job_gate_overrides (
  company_key text PRIMARY KEY,
  decision    text NOT NULL CHECK (decision IN ('allow', 'deny')),
  gate        text CHECK (gate IN ('location', 'ethics')),
  reason      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
