-- Game studios with momentum (mobile breakouts and growing Steam games),
-- grouped by company, each with its public job board when one is found.
ALTER TABLE job_market_snapshots ADD COLUMN IF NOT EXISTS studios jsonb;
