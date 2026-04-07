# Morning Briefing - Part 1: New Roles
# Scan target companies, score roles, tailor resumes for top matches

> **Cowork setup:** Schedule at 7:00 AM weekdays. Saves output to `briefings/[YYYY-MM-DD]-part1-roles.md`.
> This part runs independently. Parts 2 and 3 reference its output.

---

Read all files in the job-search-os/context-library/ folder. Also read job-search-os/CLAUDE.md for system rules.

## Quality Gate

Before running, verify these files contain real data (not template placeholders like `[FILL IN]`):

1. **experience-library.md** -- If empty or placeholder-only, STOP. Say: "Your experience library is not filled in. Run `Help me build my experience library` first."
2. **career-plan.md** -- If empty or placeholder-only, STOP. Say: "Your career plan is not filled in. Fill in career-plan.md first."
3. **target-companies.md** -- If empty or placeholder-only, STOP. Say: "Your target companies list is not filled in. Fill in target-companies.md first."

If any check fails, do NOT proceed.

## Role Type Detection

Read `career-plan.md` to detect the user's target function (PM, SWE, Design, Data Science, Marketing, CS/Sales). All sections below adapt to the detected function. Search for function-appropriate roles, not PM roles by default.

---

## Motivation & Status

Determine what week of the job search this is by counting from the earliest application date in app-tracker (or OS creation date if no applications yet).

**If app-tracker.md does not exist or is empty:** Assemble pipeline data from `target-companies.md` (Status fields, Summary by Status table), `connection-tracker.md` (referral dates), `interview-history.md` (interview dates), and `briefings/` folder (recent activity). Note: "Pipeline stats assembled from alternative sources. For precise tracking, run `/app-tracker add` for each active application."

Display:
```
Week [N] of your search.
Stats since start: Applications: [N] | Interviews: [N] | Offers: [N]
[One sentence of data-driven coaching -- NOT generic motivation. Base it on actual patterns.]
```

---

## New Roles Scan

Search each company in target-companies.md for new postings in the user's target function from the last 24 hours. Check careers pages and LinkedIn.

**DATA QUALITY GATE:** If web search is unavailable or returns errors for a company, skip it and note: "[Company]: could not verify -- check manually." NEVER fabricate job listings. If you cannot find a real URL, do not include it.

**Prioritize checking:**
- Companies where the user has connections (from connection-tracker.md)
- Top 20 companies in target-companies.md
- Companies with recent funding rounds or product launches

**SENIOR-LEVEL / EMPLOYED MODE:** If career-plan.md shows Director+ level AND currently employed, scan only the top 10 companies and only surface roles scoring 75+.

**REMOTE-ONLY MODE:** If career-plan.md shows remote-only preference, filter for roles mentioning "remote," "distributed," or "work from anywhere." Flag "hybrid" or "onsite" roles with a WARNING before scoring.

## Scoring & Tailoring

For each new role found:
1. Run job-fit-scorer (score 1-100 across 5 dimensions: skill match, seniority fit, culture signals, comp range, growth trajectory)
2. **Roles scoring 70+:**
   - Run resume-tailor using experience-library.md as source
   - Calculate keyword coverage score (% of JD requirements matched)
   - Run recruiter-reviewer sub-agent on the tailored resume
   - Run ats-checker sub-agent on the tailored resume
   - Auto-correct flagged issues and note all changes
3. **Roles scoring 60-69:** Flag as "Apply with referral only" and note which connections could refer
4. **Roles below 60:** Skip but log that they were reviewed

Surface the top 3 roles ranked by fit score.

## Top Role Cards

For each of the top 3 roles (scoring 70+), include:

### [Role Title] at [Company] (Fit Score: [X]/100)

**Why this is a strong match:** [2-sentence summary highlighting strongest dimensions]

**Tailored Resume:**
- Status: [Generated / Auto-corrected / Needs manual review]
- Keyword coverage: [X]% ([N]/[M] JD requirements matched)
- Recruiter review: First impression [X]/10, Relevance [X]/10, Readability [X]/10
- ATS check: [PASS / PASS WITH WARNINGS / FAIL]
- Gaps: [JD requirements not matched by experience library]
- Auto-correction changes: [list specific changes]

**Referral Path:**
- Closest connection: [Name] at [Company] ([relationship strength])
- Draft referral message: [personalized message ready to send]
- If no connection: "No existing connection. Add to networking priority for this week."

**Work Product Prompt:**
Function-appropriate prompt for `/work-product`:
```
/work-product [Company] [Role Title] get-interview
```
Research hooks:
- [Specific thing to research about this company's product]
- [Specific recent event or launch to reference]
- [Specific user complaint or market dynamic to analyze]

**EXPERIENCE-FRIENDLY (Veteran Mode):** If career-plan.md shows 15+ years or legacy/enterprise employers, flag roles with signals like "seasoned leader," "deep expertise," "10+ years preferred." Format: "EXPERIENCE-FRIENDLY: [Company] [Role] -- JD values [signal]."

---

## Output

Save everything to `job-search-os/briefings/[YYYY-MM-DD]-part1-roles.md` using this format:

```markdown
# Part 1: Roles - [Full Date, e.g., Monday, March 24, 2026]

## Week [N] | [Motivational line]

## Top Roles Today

### 1. [Role Title] at [Company] (Fit: [score]/100)
[2-sentence match summary]
**Resume:** [status + coverage score]
**Referral:** [connection name + draft message OR "No connection -- network first"]
**Work product prompt:** `/work-product [Company] [Role] get-interview`
**Research hooks:** [bulleted list]

### 2. [Role Title] at [Company] (Fit: [score]/100)
[Same structure]

### 3. [Role Title] at [Company] (Fit: [score]/100)
[Same structure]

### Other Roles Reviewed
- [Company] [Role] - Fit: [score] - [SKIP / APPLY WITH REFERRAL ONLY]

### Search Failures
- [Company]: could not verify -- check manually
```
