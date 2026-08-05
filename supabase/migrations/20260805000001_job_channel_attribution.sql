-- Channel attribution for the pipeline.
--
-- Context: the system tracked how the funnel was doing but never *where the
-- roles came from*, so there was no way to answer the only question that
-- changes how Jon spends a week — does the hour go into LinkedIn, into warm
-- intros, or into applying straight through company boards?
--
-- `source` already exists but records the ingestion mechanism ('manual' vs
-- 'ats_ingest'), not the outreach channel. Those are different questions and
-- both are worth keeping.

-- How the role was reached. Free text to match the existing style of
-- industry/stage/source, constrained by a CHECK so typos can't fragment a
-- channel into two rows in the report.
ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS channel text;

DO $$
BEGIN
  ALTER TABLE job_pipeline_entries
    ADD CONSTRAINT job_pipeline_entries_channel_check
    CHECK (channel IS NULL OR channel IN (
      'ats_direct',    -- applied straight through the company's job board
      'linkedin',      -- found or applied via LinkedIn
      'referral',      -- warm intro or employee referral
      'inbound',       -- a recruiter or hiring manager reached out first
      'cold_outreach', -- Jon opened the conversation with a human, no intro
      'other'
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Everything the ingest cron pulled came off a public ATS board by definition.
UPDATE job_pipeline_entries
  SET channel = 'ats_direct'
  WHERE channel IS NULL AND source = 'ats_ingest';

-- Deliberately NOT backfilling the rest to 'other'. Hand-added rows have a real
-- channel that only Jon knows; leaving them NULL surfaces them as
-- "unattributed" in the report instead of burying them in a junk bucket.

CREATE INDEX IF NOT EXISTS idx_pipeline_channel ON job_pipeline_entries(channel);
