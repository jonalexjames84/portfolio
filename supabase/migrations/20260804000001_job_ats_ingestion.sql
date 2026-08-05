-- Automated job ingestion from public ATS boards.
--
-- Context: nothing had written to job_pipeline_entries since 2026-04-02, so the
-- daily brief's "new jobs in last 24h" section was empty every single day.
-- These columns let a cron pull fresh postings straight from each target
-- company's public job board.

-- Which public job board each target company publishes to.
ALTER TABLE job_target_companies
  ADD COLUMN IF NOT EXISTS ats_type text,
  ADD COLUMN IF NOT EXISTS ats_token text;

-- Provenance + dedupe for ingested postings.
ALTER TABLE job_pipeline_entries
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS posted_at timestamptz;

-- job_url is the dedupe key across ingestion runs.
--
-- Deliberately NOT a partial index (`WHERE job_url IS NOT NULL`): ON CONFLICT
-- cannot bind to a partial index unless the statement repeats its predicate,
-- which PostgREST's upsert does not emit. A plain unique index is equivalent
-- here anyway, since Postgres treats NULLs as distinct — manually added rows
-- with no URL are still unrestricted.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_job_url_unique
  ON job_pipeline_entries(job_url);

CREATE INDEX IF NOT EXISTS idx_pipeline_source ON job_pipeline_entries(source);
CREATE INDEX IF NOT EXISTS idx_target_companies_ats ON job_target_companies(ats_type, ats_token);

-- Seed verified board tokens. Every token below was confirmed live (returned
-- >0 open postings) against the provider's public API on 2026-08-04.
WITH boards(name, ats_type, ats_token) AS (
  VALUES
  ('1Password', 'ashby', '1password'),
  ('Abnormal Security', 'greenhouse', 'abnormalsecurity'),
  ('Adyen', 'greenhouse', 'adyen'),
  ('Affirm', 'greenhouse', 'affirm'),
  ('Airbnb', 'greenhouse', 'airbnb'),
  ('Airbyte', 'ashby', 'airbyte'),
  ('Airtable', 'greenhouse', 'airtable'),
  ('Amplitude', 'greenhouse', 'amplitude'),
  ('Anthropic', 'greenhouse', 'anthropic'),
  ('Anyscale', 'ashby', 'anyscale'),
  ('Apollo.io', 'greenhouse', 'apolloio'),
  ('Asana', 'greenhouse', 'asana'),
  ('AssemblyAI', 'greenhouse', 'assemblyai'),
  ('Baidu', 'greenhouse', 'baidu'),
  ('Benchling', 'ashby', 'benchling'),
  ('Bill.com', 'greenhouse', 'billcom'),
  ('Block (Square)', 'greenhouse', 'block'),
  ('Braze', 'greenhouse', 'braze'),
  ('Brex', 'greenhouse', 'brex'),
  ('CRED', 'lever', 'cred'),
  ('Calendly', 'greenhouse', 'calendly'),
  ('Calm', 'greenhouse', 'calm'),
  ('Celonis', 'greenhouse', 'celonis'),
  ('Character AI', 'ashby', 'character'),
  ('Chime', 'greenhouse', 'chime'),
  ('ClickUp', 'ashby', 'clickup'),
  ('Cloudflare', 'greenhouse', 'cloudflare'),
  ('CockroachDB', 'greenhouse', 'cockroachlabs'),
  ('Cohere', 'ashby', 'cohere'),
  ('Cohere Health', 'greenhouse', 'coherehealth'),
  ('Coinbase', 'greenhouse', 'coinbase'),
  ('Comet ML', 'greenhouse', 'comet'),
  ('Confluent', 'ashby', 'confluent'),
  ('Contentful', 'greenhouse', 'contentful'),
  ('Coupa', 'lever', 'coupa'),
  ('Coursera', 'greenhouse', 'coursera'),
  ('Cribl', 'greenhouse', 'cribl'),
  ('Culture Amp', 'greenhouse', 'cultureamp'),
  ('Cursor', 'ashby', 'cursor'),
  ('Databricks', 'greenhouse', 'databricks'),
  ('Datadog', 'greenhouse', 'datadog'),
  ('DeepMind (Google)', 'greenhouse', 'deepmind'),
  ('Discord', 'greenhouse', 'discord'),
  ('Disney+', 'greenhouse', 'disney'),
  ('Drata', 'ashby', 'drata'),
  ('Dropbox', 'greenhouse', 'dropbox'),
  ('Duolingo', 'greenhouse', 'duolingo'),
  ('Elastic', 'greenhouse', 'elastic'),
  ('ElevenLabs', 'ashby', 'elevenlabs'),
  ('Faire', 'greenhouse', 'faire'),
  ('Figma', 'greenhouse', 'figma'),
  ('Fivetran', 'greenhouse', 'fivetran'),
  ('GitLab', 'greenhouse', 'gitlab'),
  ('Grafana Labs', 'greenhouse', 'grafanalabs'),
  ('Gusto', 'greenhouse', 'gusto'),
  ('Harvey', 'ashby', 'harvey'),
  ('Hightouch', 'greenhouse', 'hightouch'),
  ('Inflection AI', 'greenhouse', 'inflectionai'),
  ('Instacart', 'greenhouse', 'instacart'),
  ('Intercom', 'greenhouse', 'intercom'),
  ('Kavak', 'lever', 'kavak'),
  ('Labelbox', 'greenhouse', 'labelbox'),
  ('Lambda', 'ashby', 'lambda'),
  ('Lattice', 'greenhouse', 'lattice'),
  ('LaunchDarkly', 'greenhouse', 'launchdarkly'),
  ('Linear', 'ashby', 'linear'),
  ('LinkedIn (Microsoft)', 'greenhouse', 'linkedin'),
  ('Lyft', 'greenhouse', 'lyft'),
  ('Marqeta', 'greenhouse', 'marqeta'),
  ('Materialize', 'ashby', 'materialize'),
  ('Mercari', 'greenhouse', 'mercari'),
  ('Mercury', 'greenhouse', 'mercury'),
  ('Midjourney', 'ashby', 'midjourney'),
  ('Miro', 'ashby', 'miro'),
  ('Mixpanel', 'greenhouse', 'mixpanel'),
  ('Modal', 'ashby', 'modal'),
  ('Mollie', 'ashby', 'mollie'),
  ('MongoDB', 'greenhouse', 'mongodb'),
  ('N26', 'greenhouse', 'n26'),
  ('Neon', 'ashby', 'neon'),
  ('NerdWallet', 'ashby', 'nerdwallet'),
  ('New Relic', 'greenhouse', 'newrelic'),
  ('Notion', 'ashby', 'notion'),
  ('Nubank', 'ashby', 'nubank'),
  ('Okta', 'greenhouse', 'okta'),
  ('OpenAI', 'ashby', 'openai'),
  ('Outreach', 'lever', 'outreach'),
  ('Oyster HR', 'ashby', 'oyster'),
  ('PagerDuty', 'greenhouse', 'pagerduty'),
  ('Palantir', 'lever', 'palantir'),
  ('Peloton', 'greenhouse', 'peloton'),
  ('Pendo', 'greenhouse', 'pendo'),
  ('Perplexity', 'ashby', 'perplexity'),
  ('Persona', 'ashby', 'persona'),
  ('PhonePe', 'greenhouse', 'phonepe'),
  ('Pinecone', 'ashby', 'pinecone'),
  ('Pinterest', 'greenhouse', 'pinterest'),
  ('Plaid', 'ashby', 'plaid'),
  ('Poshmark', 'ashby', 'poshmark'),
  ('PostHog', 'ashby', 'posthog'),
  ('Railway', 'ashby', 'railway'),
  ('Ramp', 'ashby', 'ramp'),
  ('Reddit', 'greenhouse', 'reddit'),
  ('Remote', 'greenhouse', 'remote'),
  ('Render', 'ashby', 'render'),
  ('Replit', 'ashby', 'replit'),
  ('Robinhood', 'greenhouse', 'robinhood'),
  ('Runway', 'ashby', 'runway'),
  ('SafetyCulture', 'ashby', 'safetyculture'),
  ('Salesloft', 'greenhouse', 'salesloft'),
  ('Samsara', 'greenhouse', 'samsara'),
  ('Scale AI', 'greenhouse', 'scaleai'),
  ('Snowflake', 'ashby', 'snowflake'),
  ('SoFi', 'greenhouse', 'sofi'),
  ('Spotify', 'lever', 'spotify'),
  ('Squarespace', 'greenhouse', 'squarespace'),
  ('Stability AI', 'greenhouse', 'stabilityai'),
  ('Strava', 'ashby', 'strava'),
  ('Stripe', 'greenhouse', 'stripe'),
  ('Stytch', 'ashby', 'stytch'),
  ('Supabase', 'ashby', 'supabase'),
  ('Temporal', 'ashby', 'temporal'),
  ('Thumbtack', 'ashby', 'thumbtack'),
  ('Toast', 'greenhouse', 'toast'),
  ('Trade Republic', 'greenhouse', 'traderepublic'),
  ('Twilio', 'greenhouse', 'twilio'),
  ('Twitch (Amazon)', 'greenhouse', 'twitch'),
  ('Typeform', 'greenhouse', 'typeform'),
  ('UiPath', 'ashby', 'uipath'),
  ('Upstart', 'greenhouse', 'upstart'),
  ('Veeva Systems', 'lever', 'veeva'),
  ('Vercel', 'greenhouse', 'vercel'),
  ('Webflow', 'greenhouse', 'webflow'),
  ('Writer', 'ashby', 'writer'),
  ('Xero', 'ashby', 'xero'),
  ('ZoomInfo', 'greenhouse', 'zoominfo'),
  ('Zscaler', 'greenhouse', 'zscaler'),
  ('xAI', 'greenhouse', 'xai')
)
UPDATE job_target_companies c
SET ats_type = b.ats_type, ats_token = b.ats_token
FROM boards b
WHERE c.name = b.name;
