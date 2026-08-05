---
name: one-application-per-company
description: Use before preparing or submitting any job application — writing a cover letter, tailoring a resume, filling an ATS form, or marking a role applied. Required when more than one agent is working the job search at once. Covers the claim-before-you-write rule, the one-application-per-company cap, and how to release or close a claim.
---

# One Application Per Company

## Overview

Parallel agents applied to the same jobs twice. **Stedi received three
applications** — three different roles, three different agents, one ~100-person
company. Nothing in the system noticed, because nothing in the system knew.

Two separate failures made it possible, and both are now closed:

1. **No canonical job identity.** The only dedupe key was the raw `job_url`, so
   one Greenhouse req arriving as `job-boards.greenhouse.io/webflow/jobs/8097749`
   from the queue and `webflow.com/careers?gh_jid=8097749` from the scraper was
   two rows. The 45 rows with a null `job_url` were exempt from the index
   entirely — which is how *PM, Accounts* and *Product Manager, Accounts* both
   survived as separate Vercel roles.
2. **No record that an application happened.** The sole evidence was `status` on
   a pipeline row. An agent working from its own queue file never read it. Stedi
   appears exactly **once** in `job_pipeline_entries` and got three applications.

## The Rule

**Claim the job before you write anything for it.** Not before submitting —
before the first tailored word exists. A blocked claim after the cover letter is
written has already cost the work it was meant to save.

```bash
.claude/skills/one-application-per-company/apply-guard.ts claim \
  --agent "$CLAUDE_AGENT_ID" \
  --company "Stedi" --role "Product Manager" \
  --url "https://jobs.ashbyhq.com/stedi/65b38320-..."
```

Exit 0 means it is yours for 90 minutes. **Exit 1 means stop** — pick a different
role and say in your summary which one you skipped and why.

## Quick Reference

```bash
G=.claude/skills/one-application-per-company/apply-guard.ts

$G check   --company "Stedi" --role "PM" --url <url>     # read-only preview
$G claim   --agent <id> --company … --role … --url <url> # binding; exits 1 if blocked
$G advance --url <url> --status prepared                 # materials written
$G advance --url <url> --status submitted                # Jon sent it
$G advance --url <url> --status closed --note "rejected" # frees the company slot
$G release --agent <id> --url <url>                      # changed your mind; frees both
$G list    [--company "Stedi"]                           # everything open
```

`check` is a preview and **is not binding**. Two agents can both read "no
conflict" a millisecond apart. Only `claim` decides, because it takes a
per-company advisory lock inside Postgres. Never substitute `check` for `claim`.

## The Company Cap

**One open application per company.** Three landing on the same small company's
desk in a week reads as spray-and-pray and costs more than the extra shot wins.

The exception is employers big enough that their product orgs genuinely do not
talk to each other — a Google Cloud req and a YouTube req are not competing for
one recruiter's attention.

| Tier | Cap | Examples |
|---|---|---|
| Default — everything not listed below | **1** | Stedi, Artisan, Baselayer, Careforce, Harvey |
| Large, separate product surfaces | 2 | Anthropic, OpenAI, Figma, Notion, Discord, Brex |
| Very large, many independent orgs | 3 | Google, Amazon, Microsoft, Roblox, Stripe, Databricks |

The lists live in `src/lib/job-search/application-guard.ts`. **They are explicit
on purpose** — inferring size from funding stage put Stedi (Series C, ~100
people) in the same bucket as Snowflake. To change one company, set
`job_target_companies.max_concurrent_applications`; it always wins over the list.

A **closed** application (rejected, passed over) frees the company slot. The
**req itself stays blocked forever** — a rejection is not an invitation to
reapply to the same posting.

## Statuses

| Status | Means | Blocks the req | Occupies a company slot |
|---|---|---|---|
| `claimed` | an agent is preparing materials | yes, for 90 min | yes |
| `prepared` | letter and resume exist, waiting on Jon | yes | yes |
| `submitted` | Jon sent it | yes | yes |
| `closed` | rejected, or the process ended | yes, forever | **no** |
| `withdrawn` | never really applied | no | no |

**Advance the status.** A claim you take and never advance expires in 90 minutes
and the role reopens to another agent — which is correct when your session died,
and wrong when you finished the letter and forgot to say so.

## Claim Expiry

90 minutes, because a real preparation run — reading the JD, tailoring the
resume, drafting the letter — took 20–40 minutes in practice, and an agent that
dies mid-letter must not park a role forever. Re-claiming your own job refreshes
the lease, so a long run is safe.

## Where This Sits In The Flow

1. `verifying-job-listings` — is the req actually open? (Cheapest check; do it first.)
2. **`one-application-per-company` — is it ours to take?** ← you are here
3. Write the cover letter, tailor the resume → `advance --status prepared`
4. `applying-to-jobs` — fill the ATS form in Chrome
5. Jon submits → `advance --status submitted`

Steps 1 and 2 are both cheap and both prevent wasted writing. Neither is
optional when more than one agent is running.

## Rationalizations

| Excuse | Reality |
|---|---|
| "I checked the pipeline, nothing's there" | Stedi appears once in the pipeline and got three applications. The pipeline is not the ledger. |
| "It's a different role at the same company" | That is exactly the Stedi case. The cap counts companies, not reqs. |
| "I'll claim it right before submitting" | The letter is already written by then. Claim before the work, not after. |
| "`check` said it was clear" | `check` is advisory. Two agents can both pass it in the same millisecond. Run `claim`. |
| "The URL is different, so it's a different job" | One Greenhouse req has at least three URL spellings. `canonicalJobKey()` collapses them; your eyes do not. |
| "No other agent is running right now" | You cannot see the other sessions. The claim costs one command. |
| "I'll note it in the queue file instead" | Queue files are per-agent. The other agent has its own. |
| "It was rejected, so I can reapply" | A rejection frees the *company* slot, never the req. |
| "The claim expired, so my letter is still fine" | If it expired, someone else may hold it now. Re-claim before continuing. |

## Red Flags — Stop And Claim

- About to write or tailor anything for a role you have not claimed
- About to open an ATS form in Chrome without a claim
- Two roles at one company in the same batch — only one can proceed
- A queue or batch built without running `check` over it first
- Marking a pipeline row `applied` with no matching ledger record

## Related

- `src/lib/job-search/application-guard.ts` — canonical keys, company caps, and
  `evaluateApplication()`, the readable statement of the rule with its tests.
  The `job_claim_application` Postgres function enforces the same rule
  atomically; **edit them together.**
- `verifying-job-listings` — run first, always.
- `applying-to-jobs` — the Chrome/ATS mechanics, once the role is yours.
- `.claude/skills/one-application-per-company/backfill.ts` — re-keys the pipeline and seeds the
  ledger from applications already sent. Idempotent.
