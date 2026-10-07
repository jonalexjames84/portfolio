-- Market Radar: the data behind the "Market Radar" section of the daily email.
--
-- ATS boards only list roles that are still open, so a board read today can't
-- say how many roles were posted in August. Saving one compact snapshot a day
-- is what gives the brief a real week-over-week comparison, and later lets it
-- see chart movement and reposted roles.

-- One row per day: what every tracked board and the App Store charts showed.
CREATE TABLE IF NOT EXISTS job_market_snapshots (
  snapshot_date date PRIMARY KEY,
  taken_at      timestamptz NOT NULL DEFAULT now(),
  -- Per company: posting counts plus the PM and product-leader roles themselves.
  boards        jsonb NOT NULL,
  -- US App Store top-100 charts, enriched with each app's first release date.
  apps          jsonb NOT NULL,
  board_errors  text[] NOT NULL DEFAULT '{}'
);

-- SEC Form D filings from operating companies, one row per filing.
CREATE TABLE IF NOT EXISTS job_market_filings (
  accession    text PRIMARY KEY,
  company      text NOT NULL,
  cik          text NOT NULL,
  filed_on     date NOT NULL,
  industry     text,
  city         text,
  state        text,
  amount_sold  numeric,
  -- Executives and directors named on the filing: [{ name, relationship, title }].
  people       jsonb NOT NULL DEFAULT '[]',
  filing_url   text NOT NULL
);

CREATE INDEX IF NOT EXISTS job_market_filings_recent ON job_market_filings (filed_on DESC);

-- Which daily EDGAR indexes have been fully read, so the collector can resume
-- a backfill across runs instead of re-reading days it already finished.
CREATE TABLE IF NOT EXISTS job_market_filing_days (
  day        date PRIMARY KEY,
  filings    integer NOT NULL,
  read_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_market_snapshots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_market_filings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_market_filing_days ENABLE ROW LEVEL SECURITY;
