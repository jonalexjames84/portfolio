-- Why a role did or did not clear the hard gates.
--
-- Gated-out roles are still stored. A gate that silently drops rows cannot be
-- audited or tuned, and the first sign it is too aggressive would be an empty
-- funnel with no explanation. Storing the verdict makes the rejection list
-- readable.

ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS gate_result jsonb;

-- Downstream queries all ask "which rows passed", so index that directly.
CREATE INDEX IF NOT EXISTS idx_pipeline_gate_pass
  ON job_pipeline_entries (((gate_result ->> 'pass')::boolean));
