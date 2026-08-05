---
name: verifying-job-listings
description: Use when adding jobs to a queue or pipeline, before writing a cover letter or tailoring a resume for a role, before ranking or scoring a batch of postings, when a job link is more than a few days old, or when marking a role closed. Covers job_pipeline_entries rows, application queues in documents/applications/, and any scraped or hand-collected job link.
---

# Verifying Job Listings

## Overview

A job link that loads is not a job that exists. **Every dead posting in the 2026-08-04 audit returned HTTP 200** — career sites soft-404, boards render closure notices in JavaScript, and aggregators keep expired posts up with a working "Apply" button. One had been closed for eight months and had a tailored cover letter written against it.

**The employer's ATS API is the only source that knows.** Ask it, before spending effort on the role.

## The Rule

**Verify a posting before you write for it.** Not after the letter is drafted, not before submitting — before the tailoring work starts. A cover letter written against a dead req is pure waste, and you cannot tell it is dead by looking.

Run this on every new batch, and on any queue older than a few days.

## Quick Reference

```bash
.claude/skills/verifying-job-listings/verify.mjs <url> [url...]
cat urls.txt | .claude/skills/verifying-job-listings/verify.mjs
.claude/skills/verifying-job-listings/verify.mjs --json <url>   # for scripting
```

Exits 1 if anything is DEAD, so it can gate a queue build. It routes each URL to the right authority:

| Source | Authority | Dead when |
|---|---|---|
| Greenhouse | `boards-api.greenhouse.io/v1/boards/{board}/jobs/{id}` | 404 |
| Ashby | `api.ashbyhq.com/posting-api/job-board/{org}` | id absent from the list |
| Lever | `api.lever.co/v0/postings/{org}/{id}` | 404 |
| Y Combinator | the company's `/companies/{co}/jobs` page | slug absent (the job page itself stays up) |
| BuiltIn / aggregators | JSON-LD `validThrough`, removal notice | date passed — never trust the Apply button |
| Anything else | page fetch | 404/410, closure phrase, or redirect that drops the req id |

## Three Verdicts, Not Two

**LIVE** — the API returned the req. The script prints its **canonical title**; compare it to what you queued.

**DEAD** — positive evidence of closure. Retire it.

**UNVERIFIED** — a 403, a timeout, a 5xx, or a 200 with no signal. **This is not dead.** Leave the row alone and check by hand. All five ZoomInfo postings that 403'd a scripted request were open.

## Read the Title the API Returns

The queue said `Anthropic — Product Manager, Claude Code`. The link was live, so it passed. The req behind it was **Product Manager, Claude Tag** — a different job. The cover letter argued for the wrong role.

A LIVE verdict answers "does this req exist," not "is this the job you think it is." Diff the returned title against the queued one every time.

## A 404 Kills the Req ID, Not the Role

Three roles in the audit had been re-posted under new ids. Retiring them on the 404 would have thrown away open jobs.

When a Greenhouse req 404s, the script tells you how many other reqs are on that board. Pull the board and look for the same title:

```bash
curl -s "https://boards-api.greenhouse.io/v1/boards/{board}/jobs" \
  | python3 -c "import json,sys;[print(j['id'],j['title']) for j in json.load(sys.stdin)['jobs'] if 'product manager' in j['title'].lower()]"
```

Exact or near-exact title match → **relink the row**, keep it in the queue. No match anywhere on the board → retire it. Fuzzy matching lies: it paired "Account Security" with "AI Content Safety." Require the titles to actually correspond.

## After Verifying

- Store the working URL in the row's **`job_url` column**, never only in `notes` prose. 22 rows kept their link in notes and were invisible to the nightly re-check for months; 17 had died in the meantime.
- Retiring a row: set `status = passed`, prepend `CLOSED — verified {date}: {reason}`, and **keep the prior notes** so the decision is reversible.
- Relinking a row: update `job_url`, prepend `RELINKED {date}: {why}`, leave status alone.
- A row with no URL in any field cannot be verified. Say so — never let it age in the pipeline as if it were open.

## Rationalizations

| Excuse | Reality |
|---|---|
| "The link loads fine" | Every dead posting in the audit returned HTTP 200. |
| "I checked these in a browser yesterday" | A browser pass that same day missed Baselayer's rotted req. The page rendered; the req was gone. |
| "Big company, the role is obviously still open" | Vercel had 80 open reqs and zero PM roles. |
| "404, so the role is closed" | Three roles were open under new req ids. Check the board first. |
| "The board 403'd, assume it's gone" | All five ZoomInfo 403s were live roles. |
| "Close enough title" | "Claude Code" was Claude Tag. Different team, different job. |
| "I'll verify right before submitting" | The cover letter is already written by then. Verify before the work, not after. |
| "The nightly cron covers this" | The cron only sees rows with `job_url` set, and only runs once a day. New batches get checked now. |

## Red Flags — Stop and Verify

- About to write or tailor anything for a role you have not run through `verify.mjs`
- Ranking or scoring a batch whose links you have not checked today
- Marking a role closed because a page 404'd, without pulling the board
- Marking a role closed on a timeout, a 403, or a redirect
- Pasting a job link into `notes` instead of `job_url`
- A queue file that claims "verified" with no date on the claim

## Related

- `src/lib/job-search/listing-liveness.ts` — the same logic used by the nightly `/api/job-search/recheck-listings` cron, which sweeps `saved` rows. This skill is the front door for **new** batches; the cron is the backstop for rows that sit.
- `job-search-os/context-library/app-tracker.md` — where audit results get recorded.
