-- Stop parallel agents from applying to the same job — or the same company — twice.
--
-- Context: agents running concurrently each prepared an application for roles
-- that were already spoken for. Stedi received three. Two holes allowed it:
--
--   1. The only dedupe key was the raw `job_url`, so one Greenhouse req stored
--      three ways was three rows, and the 45 rows with a null `job_url` were
--      exempt from the unique index entirely.
--   2. Nothing recorded that an application had *happened*. The sole evidence
--      was `status` on a pipeline row, invisible to an agent working from its
--      own queue file. Stedi appears exactly once in job_pipeline_entries.
--
-- Canonical keys are computed in TypeScript (`src/lib/job-search/application-guard.ts`)
-- and passed in. SQL deliberately does not reimplement the normalization rules —
-- one copy, one place to fix. What SQL owns is the part TypeScript cannot do:
-- deciding the winner atomically when two agents ask at the same instant.

-- ---------------------------------------------------------------------------
-- 1. Canonical identity on the pipeline
-- ---------------------------------------------------------------------------

ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS dedupe_key text,
  ADD COLUMN IF NOT EXISTS company_key text;

-- Plain (not partial) unique index, matching the reasoning in the ATS ingestion
-- migration: PostgREST's upsert cannot bind ON CONFLICT to a partial index.
-- Postgres treats NULLs as distinct, so legacy rows whose key could not be
-- backfilled without colliding stay unconstrained rather than blocking the
-- migration. Those rows are reported by the backfill script, not silently kept.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_dedupe_key_unique
  ON job_pipeline_entries(dedupe_key);

CREATE INDEX IF NOT EXISTS idx_pipeline_company_key ON job_pipeline_entries(company_key);

-- ---------------------------------------------------------------------------
-- 2. Per-company cap
-- ---------------------------------------------------------------------------

-- NULL means "use the code default" (1, or more for the large employers listed
-- in application-guard.ts). Set this to override for a specific company.
ALTER TABLE job_target_companies
  ADD COLUMN IF NOT EXISTS max_concurrent_applications integer,
  ADD COLUMN IF NOT EXISTS company_key text;

CREATE INDEX IF NOT EXISTS idx_target_companies_company_key ON job_target_companies(company_key);

-- ---------------------------------------------------------------------------
-- 3. The application ledger
-- ---------------------------------------------------------------------------

-- Append-mostly record of every application Jon has going. This is the table an
-- agent must consult; `job_pipeline_entries.status` is a view of the pipeline,
-- not a record of intent, and an agent with its own queue never reads it.
--
-- Status lifecycle:
--   claimed   — an agent holds a lease and is preparing materials
--   prepared  — cover letter and resume exist, waiting on Jon to submit
--   submitted — Jon sent it
--   closed    — the process ended (rejected, passed). Frees the company slot;
--               the req itself stays blocked forever.
--   withdrawn — never really applied. Frees both the slot and the req.
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_entry_id uuid REFERENCES job_pipeline_entries(id) ON DELETE SET NULL,
  dedupe_key text NOT NULL,
  company_key text NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  job_url text,
  status text NOT NULL DEFAULT 'claimed'
    CHECK (status IN ('claimed', 'prepared', 'submitted', 'closed', 'withdrawn')),
  agent_id text NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  prepared_at timestamptz,
  submitted_at timestamptz,
  closed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- The hard guarantee: one live application record per req. A withdrawn record
-- steps aside so a genuine re-application is still possible by hand.
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_dedupe_live
  ON job_applications(dedupe_key)
  WHERE status <> 'withdrawn';

CREATE INDEX IF NOT EXISTS idx_job_applications_company_key ON job_applications(company_key);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- ---------------------------------------------------------------------------
-- 4. Atomic claim
-- ---------------------------------------------------------------------------

-- Mirrors `evaluateApplication()` in application-guard.ts. That function is the
-- readable statement of the rule and carries the tests; this one enforces it.
-- Edit them together.
--
-- The advisory lock is the whole point. Without it two agents both COUNT one
-- open application at a company whose cap is one, both see room, and both
-- proceed — which is exactly how Stedi got three. Taking a transaction-scoped
-- lock on the company key serializes claims per employer, so the second agent
-- reads the first agent's row instead of racing it. The lock is released when
-- the transaction ends, including on error.
CREATE OR REPLACE FUNCTION job_claim_application(
  p_dedupe_key text,
  p_company_key text,
  p_company text,
  p_role text,
  p_agent_id text,
  p_job_url text DEFAULT NULL,
  p_cap integer DEFAULT 1,
  p_claim_ttl_minutes integer DEFAULT 90,
  p_pipeline_entry_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing job_applications%ROWTYPE;
  v_cutoff timestamptz;
  v_live integer;
  v_conflicts jsonb;
  v_id uuid;
BEGIN
  IF p_dedupe_key IS NULL OR p_dedupe_key = '' THEN
    RAISE EXCEPTION 'dedupe_key is required — compute it with canonicalJobKey()';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('job_application:' || p_company_key));

  v_cutoff := now() - make_interval(mins => p_claim_ttl_minutes);

  SELECT * INTO v_existing
    FROM job_applications
   WHERE dedupe_key = p_dedupe_key AND status <> 'withdrawn'
   LIMIT 1;

  IF FOUND THEN
    -- Already a real application against this exact req. Permanent.
    IF v_existing.status IN ('prepared', 'submitted', 'closed') THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'outcome', 'duplicate_application',
        'reason', format('Already %s an application for this req (%s) on %s by %s.',
                         v_existing.status, p_dedupe_key,
                         to_char(v_existing.created_at, 'YYYY-MM-DD'), v_existing.agent_id),
        'application_id', v_existing.id,
        'existing_status', v_existing.status
      );
    END IF;

    -- status = 'claimed'. The holder may re-enter and refresh its own lease.
    IF v_existing.agent_id = p_agent_id THEN
      UPDATE job_applications
         SET claimed_at = now(), updated_at = now(),
             pipeline_entry_id = COALESCE(p_pipeline_entry_id, pipeline_entry_id),
             job_url = COALESCE(p_job_url, job_url)
       WHERE id = v_existing.id;
      RETURN jsonb_build_object(
        'allowed', true, 'outcome', 'allowed',
        'reason', 'Refreshed your own claim.',
        'application_id', v_existing.id
      );
    END IF;

    IF v_existing.claimed_at > v_cutoff THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'outcome', 'claimed_by_other_agent',
        'reason', format('Agent %s claimed this req at %s. Claims expire after %s minutes.',
                         v_existing.agent_id,
                         to_char(v_existing.claimed_at, 'YYYY-MM-DD HH24:MI'),
                         p_claim_ttl_minutes),
        'application_id', v_existing.id
      );
    END IF;

    -- Stale claim: the holding agent died mid-preparation. Take it over rather
    -- than let one crash park a role forever.
    UPDATE job_applications
       SET agent_id = p_agent_id, claimed_at = now(), updated_at = now(),
           pipeline_entry_id = COALESCE(p_pipeline_entry_id, pipeline_entry_id),
           job_url = COALESCE(p_job_url, job_url),
           notes = concat_ws(E'\n', notes,
                    format('CLAIM TAKEN OVER %s: previous holder %s went stale.',
                           to_char(now(), 'YYYY-MM-DD'), v_existing.agent_id))
     WHERE id = v_existing.id;
    RETURN jsonb_build_object(
      'allowed', true, 'outcome', 'allowed',
      'reason', format('Took over a stale claim from %s.', v_existing.agent_id),
      'application_id', v_existing.id
    );
  END IF;

  -- No record for this req. Check the employer's cap. A fresh claim counts:
  -- it is about to become an application and already occupies the slot.
  SELECT count(*), COALESCE(jsonb_agg(jsonb_build_object(
           'role', a.role, 'status', a.status, 'agent_id', a.agent_id,
           'dedupe_key', a.dedupe_key)), '[]'::jsonb)
    INTO v_live, v_conflicts
    FROM job_applications a
   WHERE a.company_key = p_company_key
     AND a.dedupe_key <> p_dedupe_key
     AND a.status IN ('claimed', 'prepared', 'submitted')
     AND (a.status <> 'claimed' OR a.claimed_at > v_cutoff);

  IF v_live >= p_cap THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'outcome', 'company_cap_reached',
      'reason', format(
        '%s application(s) already open at %s (cap %s). Apply to one role per company; close or withdraw the other first.',
        v_live, p_company, p_cap),
      'conflicting', v_conflicts
    );
  END IF;

  INSERT INTO job_applications (
    pipeline_entry_id, dedupe_key, company_key, company, role, job_url, agent_id, status
  ) VALUES (
    p_pipeline_entry_id, p_dedupe_key, p_company_key, p_company, p_role, p_job_url, p_agent_id, 'claimed'
  )
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'allowed', true, 'outcome', 'allowed',
    'reason', 'Claim granted.', 'application_id', v_id
  );
END;
$$;

-- Advance a claim through the lifecycle. Separate from the claim so an agent
-- cannot accidentally mark something submitted without having held the lease.
CREATE OR REPLACE FUNCTION job_advance_application(
  p_dedupe_key text,
  p_status text,
  p_agent_id text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_row job_applications%ROWTYPE;
BEGIN
  IF p_status NOT IN ('prepared', 'submitted', 'closed', 'withdrawn') THEN
    RAISE EXCEPTION 'invalid status %', p_status;
  END IF;

  UPDATE job_applications
     SET status = p_status,
         prepared_at  = CASE WHEN p_status = 'prepared'  THEN now() ELSE prepared_at  END,
         submitted_at = CASE WHEN p_status = 'submitted' THEN now() ELSE submitted_at END,
         closed_at    = CASE WHEN p_status IN ('closed', 'withdrawn') THEN now() ELSE closed_at END,
         notes = concat_ws(E'\n', notes, p_notes),
         updated_at = now()
   WHERE dedupe_key = p_dedupe_key AND status <> 'withdrawn'
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason',
      format('No live application for %s — claim it first.', p_dedupe_key));
  END IF;

  RETURN jsonb_build_object('ok', true, 'application_id', v_row.id, 'status', v_row.status);
END;
$$;
