-- Job search report redesign — schema additions
-- Run against the shared red-ox-mobile Supabase project

-- job_pipeline_entries: scoring + auto-source fields
ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS fit_score_auto integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown jsonb,
  ADD COLUMN IF NOT EXISTS jd_text text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS stage text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS interview_date date;

-- job_daily_tasks: probability + provenance + carry-forward
ALTER TABLE job_daily_tasks
  ADD COLUMN IF NOT EXISTS probability_lift integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS carried_over boolean DEFAULT false;

-- job_weekly_metrics: new KPI columns
ALTER TABLE job_weekly_metrics
  ADD COLUMN IF NOT EXISTS response_rate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active_pipeline_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interviews_completed integer DEFAULT 0;

-- job_connections: reply tracking for response rate
ALTER TABLE job_connections
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

-- Helpful indexes for the "new jobs in last 24h" query
CREATE INDEX IF NOT EXISTS idx_pipeline_created_at ON job_pipeline_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_fit_score_auto ON job_pipeline_entries(fit_score_auto DESC);
