---
name: quick-start
description: Paste any JD, find out if it's worth your time in 60 seconds. Red flags, salary estimate, interview intel, and a verdict. Zero setup required.
---

# /quick-start - Is This Role Worth Your Time? (No Setup Required)

## When to Use

- User says `/quick-start` and pastes a JD
- User pastes a JD when `experience-library.md` and `career-plan.md` are empty or template-only
- First interaction after downloading the OS — give immediate value before asking for setup

## Inputs

- **Required:** Job description text (pasted directly)
- **Does NOT require:** `experience-library.md`, `career-plan.md`, `qa-master.md`, or any filled context files

### Step 1: Parse the JD
Extract: company name, role title, level, location, remote policy, listed comp range, requirements (required vs preferred), team structure, reporting line, company stage signals.

### Step 2: Role Quality Score (0-100)
Score whether this role is worth pursuing across 5 dimensions (each 0-20). A high score means the posting describes a real, well-defined opportunity. A low score means red flags, vague scope, or misaligned expectations — save your time.

| Dimension | What to Evaluate |
|-----------|-----------------|
| **Role Clarity** | Are responsibilities specific and measurable? Or vague ("wear many hats," "other duties as assigned")? |
| **Comp Transparency** | Is comp listed? Is the range reasonable (not $80K-$300K)? If missing, penalize. |
| **Growth Indicators** | New team, greenfield product, scaling signals, promotion path mentioned, manager quality signals? |
| **Red Flag Count** | Penalize for each red flag detected (see Step 3). Start at 20, subtract 4 per red flag. Floor at 0. |
| **Seniority Calibration** | Do the years required, scope described, and level title align? Or is it a "Senior" role wanting 2 years or an IC role with VP scope? |

### Step 3: JD Red Flags
Check for and flag each of these. Be specific — quote the JD language:

- **Unrealistic experience requirements:** 10+ years for mid-level, or requiring 5+ years in a technology that is 3 years old
- **Missing comp:** No salary range listed (estimate based on company tier, level, and location)
- **Unicorn JD:** Wants PM + engineering + design + data science at a single level's comp. Count the distinct skill categories demanded — 6+ is a unicorn flag
- **Vague responsibilities:** "Drive impact," "own the roadmap," "be strategic" without describing what the product is or what success looks like
- **Title inflation/deflation:** VP title with IC scope, or "Senior" title with 1-2 years required
- **Revolving door signals:** "Fast-paced" + "ambiguity" + "self-starter" + no mention of team support or mentorship
- **Scope mismatch:** Role describes 3 full-time jobs crammed into one posting

### Step 4: JD Analysis
- **Top 5 requirements:** Ranked by emphasis in the JD — the skills that make or break your application
- **Hidden requirements:** What the JD implies but does not state (e.g., "cross-functional" at a 50-person startup means you ARE the PM team)
- **Culture signals:** What the language reveals about work style, pace, autonomy, and management philosophy

### Step 5: Interview Intel
Check `insider-data/company-intel/[company].md`:
- **If found:** Pull interview format, common questions, what they screen for, and any process notes. Check the `Last updated` date — if older than 6 months, flag: `[VERIFY: Intel last updated [date]. Details may have changed.]`
- **If not found:** Output: `No insider intel for [Company]. Run /company-research [company] for full interview data.`

### Step 6: Salary Estimate
Estimate comp range based on: company tier (FAANG / public tech / late-stage / early-stage), role level, and location. State confidence as LOW (no user data, estimate only). Note if JD lists a range.

## Output

```markdown
## Quick Start — [Company] [Role Title]

### Role Quality Score: [XX]/100
| Dimension | Score | Note |
|-----------|-------|------|
| Role Clarity | [X]/20 | [one line] |
| Comp Transparency | [X]/20 | [one line] |
| Growth Indicators | [X]/20 | [one line] |
| Red Flag Count | [X]/20 | [N flags detected] |
| Seniority Calibration | [X]/20 | [one line] |

### JD Red Flags
[List each flag with quoted JD language. If none: "No major red flags detected."]

### JD Analysis
**Top 5 Requirements (ranked):** 1. [Requirement] — why it matters ... 5.
**Hidden Requirements:** [What the JD implies but does not say]
**Culture Signals:** [What the language tells you about working here]

### Interview Intel
[Company-intel data or redirect to /company-research]

### Estimated Salary Range
[Range] (confidence: LOW — based on company tier and role level, not personalized)

### Next Steps
To apply to this role, set up your OS:
1. Fill your experience library (30 min): `Help me build my experience library`
2. Fill your career plan (15 min): `Help me fill out my career plan`
3. Then run: `/resume-tailor [paste this JD again]`

The OS will tailor your resume, auto-review it, and generate a cover letter — all matched to YOUR real experience.
```

## Quality Checks

- Every red flag must quote specific JD language, not just name the category
- Salary estimate must state LOW confidence. Interview intel must check insider-data, not skip it
- Output must end with the setup CTA — this is the conversion point to full OS usage
- Never pretend to evaluate personal fit without user context. This scores the role's quality as an opportunity. Say: "To score YOUR personal fit, fill your context library and run /job-fit-scorer."
