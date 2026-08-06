-- Materials tab: back it with the files that actually live in documents/.
--
-- documents/ is gitignored and .vercelignore'd because this repo is public, so
-- the deployed site can never read those files off disk. The only way a resume
-- or cover letter reaches the Materials tab is by being pushed into this table
-- from Jon's machine. scripts/sync-materials.mjs does that walk; these columns
-- are what let it upsert idempotently instead of duplicating on every run.

alter table job_materials
  -- Repo-relative path of the primary file. The sync's identity key: same path
  -- means same material, so re-running updates in place. Null for rows created
  -- by the /cover-letter and /resume-tailor skills, which have no file behind
  -- them. Postgres allows many nulls under a unique index, so both coexist.
  add column if not exists source_path text,
  -- Human title for the card, e.g. "Cover Letter — Anthropic (Claude Code)".
  add column if not exists label text,
  -- 'markdown' | 'html' | 'pdf' — what `content` holds, if anything.
  add column if not exists format text,
  -- sha256 of the primary file. Lets the sync skip unchanged files instead of
  -- re-uploading every PDF on every keystroke-triggered hook run.
  add column if not exists content_hash text,
  -- Object key in the private `job-materials` bucket. A cover letter usually
  -- has both a markdown body (content) and a rendered PDF (storage_path).
  add column if not exists storage_path text,
  add column if not exists file_bytes integer,
  -- Filesystem mtime. Sorting by created_at alone would order everything by
  -- when the sync first ran, which tells you nothing about when Jon wrote it.
  add column if not exists file_modified_at timestamptz,
  add column if not exists synced_at timestamptz,
  -- 'repo' rows are owned by the sync and get pruned when their file is
  -- deleted. 'agent' rows were POSTed to /api/job-search/materials and must
  -- survive the prune.
  add column if not exists origin text not null default 'agent';

create unique index if not exists job_materials_source_path_idx
  on job_materials (source_path)
  where source_path is not null;

create index if not exists job_materials_origin_idx on job_materials (origin);

-- `content` is required today, but a PDF-only material (a resume variant with
-- no markdown source) has no text body to put there.
alter table job_materials alter column content drop not null;
