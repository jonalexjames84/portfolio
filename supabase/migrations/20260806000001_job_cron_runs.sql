-- Execution log for every job-search cron and the local apply agent.
--
-- Nothing currently records whether any of the seven crons ran. A silent
-- failure and a quiet week are indistinguishable from the inbox, which is
-- fatal for a system whose whole promise is running unattended.
--
-- One row per execution. Opened on entry, closed on exit, including on error.

CREATE TABLE IF NOT EXISTS job_cron_runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name    text NOT NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status      text NOT NULL DEFAULT 'running'
                CHECK (status IN ('running', 'ok', 'error')),
  counts      jsonb,
  error       text
);

-- The health query is always "latest run for this job", so order matters.
CREATE INDEX IF NOT EXISTS job_cron_runs_recent
  ON job_cron_runs (job_name, started_at DESC);

-- The stall query filters to successful runs specifically: a cron that has
-- errored every hour for two days is stalled, not healthy.
CREATE INDEX IF NOT EXISTS job_cron_runs_ok
  ON job_cron_runs (job_name, started_at DESC) WHERE status = 'ok';
