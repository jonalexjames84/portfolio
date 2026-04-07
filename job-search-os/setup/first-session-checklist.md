# First Session Checklist

Work through this in order. ~45 minutes total for setup, then you're running.

## Setup

- [ ] Claude Code installed (`claude --version` works)
- [ ] OS folder open in Cursor (three-pane layout)
- [ ] Claude Code started in terminal (`claude`)
- [ ] CLAUDE.md read and summarized

## Context Library (The Foundation)

- [ ] `experience-library.md` filled
  - Resume text pasted
  - LinkedIn profile pasted
  - Claude merged and organized by category
  - Follow-up questions answered (projects not on resume/LinkedIn)
  - Story bank started (aim for 10-15 STAR stories)
- [ ] `qa-master.md` filled
  - Compensation strategy and scripts
  - Common questions answered
  - Logistics (visa, relocation, start date)
- [ ] `career-plan.md` filled
  - Level/industry/function ranked
  - Addressing-weaknesses analysis complete (2-3 weaknesses with strategies)
  - Dream offer defined

### Career Changers

If you are transitioning into PM from another function (engineering, consulting, design, etc.):
- When building your experience library, tell Claude your current function and that you are pivoting to PM. It will automatically map your experience to PM-equivalent skills.
- In career-plan.md, set Weakness 1 to 'No PM title' -- Claude builds an addressing-weaknesses strategy specifically for career transitions.
- The resume-tailor, interview-prep, and work-product skills all have career-changer modes that activate when your experience library has no PM titles.
- Your experience IS relevant. Consulting = stakeholder management, strategic thinking, data analysis. Engineering = technical depth, user empathy, system thinking. Design = user research, prototyping, iteration.

### Non-PM Roles (SWE, Design, Data Science, Marketing, CS/Sales)

The OS auto-detects your target function from career-plan.md. When filling your context library:
- **Experience library:** Organize by YOUR function's skill categories, not PM categories. Claude adapts the categories when it processes your resume.
- **Career plan:** Set your Function/Role Type clearly (e.g., "Staff Software Engineer" or "Head of Design"). This triggers function-specific behavior across all 18 skills.
- **Story bank:** Your stories should demonstrate YOUR function's core competencies. SWE: technical decisions, system design, debugging. Design: design critique, user advocacy, stakeholder alignment. DS: experiment design, model decisions, business translation.
- **Target companies:** /company-research works for any role. The 250 company profiles in insider-data/ are PM-focused, but /company-research generates function-specific intel from the web.

All 18 skills adapt:
- /resume-tailor generates function-appropriate resumes (not PM resumes)
- /mock-interview uses function-specific question types (system design for SWE, portfolio review for Design, case study for DS)
- /negotiate uses function-specific comp data and negotiation strategies
- /weekly-retro uses function-specific benchmarks

## Targeting

- [ ] `target-companies.md` generated (~100 companies)
- [ ] List reviewed and reordered by priority
- [ ] Top 10 companies checked for accuracy

## Infrastructure

**Note:** Cowork and Granola are optional enhancements. The OS works fully without them — just run skills manually in Claude Code.

- [ ] Morning briefing configured in Cowork (see `morning-briefing-setup.md`)
- [ ] Google Calendar connected
- [ ] Granola installed and transcript folder configured

## Verification

- [ ] First manual briefing run
- [ ] Output reviewed: roles relevant, resumes accurate, no fabrication
- [ ] Adjusted context files if output was off
- [ ] Second run confirms improvements

## You're Live

After this checklist, your daily routine is 20-30 minutes:
1. Review morning briefing
2. Check top resumes (3 min each)
3. Submit applications
4. Send connection requests and follow-ups
5. Build work product for top-choice company (optional, 30-45 min)
