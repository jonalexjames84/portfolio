# Morning Briefing - Part 3: Pipeline & Coaching
# Pipeline health, interview coaching, priority stack

> **Cowork setup:** Schedule at 7:30 AM weekdays. Saves output to `briefings/[YYYY-MM-DD]-part3-coaching.md`.
> This part reads today's Part 1 and Part 2 outputs for full context.

---

Read all files in the job-search-os/context-library/ folder. Also read job-search-os/CLAUDE.md for system rules. Read today's outputs: `briefings/[YYYY-MM-DD]-part1-roles.md` and `briefings/[YYYY-MM-DD]-part2-networking.md`.

## Quality Gate

Verify these files contain real data (not template placeholders):
1. **career-plan.md** -- Required for persona detection and coaching. If empty, STOP.
2. **interview-history.md** -- Needed for weakness coaching. If empty, skip that section.
3. **app-tracker.md** or alternative sources (`target-companies.md`, `connection-tracker.md`) -- Needed for pipeline summary.

Read `career-plan.md` to detect the user's target function. Pipeline benchmarks and drills adapt to function.

---

## Pipeline Summary

Build from app-tracker.md (or assemble from target-companies.md, connection-tracker.md, interview-history.md, briefings/).

| Stage | Count | Details |
|---|---|---|
| Applied (waiting) | [N] | Oldest: [Company] ([N] days) |
| Referral requested | [N] | |
| Interview scheduled | [N] | Next: [Company] on [date] |
| Interviewed (awaiting result) | [N] | |
| Offer stage | [N] | |
| Rejected this week | [N] | |

**Active applications total:** [N]
**Interviews this week:** [N]

---

## Pipeline Health Check

Analyze the pipeline and flag the single biggest bottleneck:

- **High volume, no referrals** (apps > 10, referrals = 0): "YOUR BOTTLENECK: Referrals. Cold apps have 3-5% callback vs 15-25% with referrals. Focus on networking. No more cold applications without a referral path."
- **Referrals not converting** (referrals > 5, interviews = 0): "YOUR BOTTLENECK: Resume/Positioning. Referrals not converting. Check coverage scores. Run `/linkedin-audit`."
- **Interviews without prep** (interviews > 2 this week, no `/interview-prep` run): "YOUR BOTTLENECK: Preparation. [N] interviews without prep. Run `/interview-prep` for each before anything else."
- **Zero volume** (0 apps this week): "YOUR BOTTLENECK: Volume. Submit at least 2 today. If no 70+ roles, expand target list or adjust career-plan.md."
- **Early career, early weeks** (< 3yr exp AND weeks 1-4): "EARLY-CAREER PACING: Prioritize referral coverage over volume. 3-5 quality apps/week with referral paths. Create 1 work product this week."
- **Healthy pipeline** (steady apps, referral rate > 40%, interviews converting): "Pipeline healthy. [N] apps, [X]% referral rate, [N] interviews. Focus: [most impactful single action]."
- **Visa + weak US network** (visa needs AND near-zero US connections): "YOUR BOTTLENECK: US Network. Prioritize networking. Target alumni and diaspora connections."
- **Comp framing weakness** (comp score < 7/10 AND interviews scheduled): "PREP ALERT: Comp framing scored [X/10]. Rehearse: never state current non-US comp, cite levels.fyi market rate. Run `/mock-interview behavioral` for comp drill."
- **Career changer translation gap** (career changer AND translation < 6/10): "TRANSLATION BOTTLENECK: [question type] scored [X/10]. Run `/mock-interview behavioral` 5 times. Experience is strong -- problem is translation."
- **Dual-track interviews** (split strategy AND different-domain interviews this week): "DUAL-TRACK PREP: Run `/interview-prep` for EACH separately. Do not use same TMAY for both."
- **Relocating + weak target-location network**: "RELOCATION NETWORKING: Allocate 40%+ of connection requests to [target location]. Mention relocation in follow-ups."
- **Unknown employer brands**: "BRAND AWARENESS: Employers not household names. Verify LinkedIn About includes parentheticals. Practice TMAY with embedded employer context."

---

## Persona-Specific Coaching

### Remote-Only Candidate
If career-plan.md shows remote-only or caregiver/family constraints: review Part 1 role scan for hybrid/onsite warnings. Confirm Part 2 prioritized remote-friendly companies.

### Career Returner
If career-plan.md shows a career gap:
- **Return-to-work programs:** Search for active returnship programs at target companies (Path Forward, iRelaunch, company-specific). Report findings or suggest companies with known programs.
- **Gap narrative tracking:** If interview-history.md shows gap questions were asked, report scores and coaching: "If improving: 'Gap answer is tightening.' If not: 'Run `/mock-interview behavioral` -- target under 45 seconds, forward-looking, no over-justification.'"

### Senior-Level / Employed
If Director+ AND currently employed:
- Condense priority stack to 60-90 minute morning block: (1) respond to active conversations, (2) send 3-5 high-quality requests, (3) review new roles at top 10, (4) advance one work product. Everything else to weekend.
- Confidentiality note at top of output.

### Founder-to-Employee
If founder/CEO at shut-down company:
- **Founder narrative drill:** "Practice 30-second founder story. Lead with [Strong Brand], then: what you built, what you learned, why THIS role. Time yourself -- cut the middle if over 30 seconds."
- **Comp anchor warning:** "Your founder salary was $[X]. Market rate is $[Y]. Do NOT disclose founder comp. Use market-rate framing from qa-master.md."
- **Stability signal prep:** "Rehearse one story where you deferred to someone else's judgment or supported another leader's vision."

### Veteran / 15+ Years Experience
If 15+ years or legacy/enterprise employers:
- **Resume-stage rejection monitoring:** If rejection rate > 70% at resume stage, surface warning with actions: run resume-tailor with veteran compression, run linkedin-audit for age-signal review, increase referral coverage to 80%+.
- **Interview energy reminder:** "Lead with curiosity, not authority. Reference recent work (last 2-3 years) first. Avoid 'back in my day' framing."

### Military Background
If military background detected:
- **Dual-track split** (if both defense and general tech): Defense track uses mission-context framing, clearance emphasized. General track uses fully translated civilian language.
- **Translation drill:** "Today's story: [story from experience-library.md]. Practice in 90 seconds with zero military jargon. Record yourself. Flag terms a civilian recruiter would not understand."

---

## Interview Weakness Coaching

Read `interview-history.md` for documented weakness patterns. If any question type averages 6/10 or below:

- "SKILL GAP: [Question type] averaging [X]/10. Today's drill: Run `/mock-interview [type]` and practice [specific question] until you score 7+. Estimated time: 30 minutes."

- If interviews scheduled this week match a weakness: "URGENT PREP: [interview type] at [Company] this week, and [weakness] score is [X]/10. Run `/interview-prep [Company]` and `/mock-interview [type]` before the interview. Highest-priority action today."

- If fewer than 3 interviews logged, skip this section.

---

## Today's Priority Stack

Based on pipeline health check, persona coaching, and interview weakness coaching, generate the priority order:

1. [Highest priority action with specific instruction]
2. [Second priority]
3. [Third priority]
4. [If time permits]

Estimated time: [X] minutes total

**SENIOR-LEVEL / EMPLOYED MODE:** Cap at 60-90 minutes. Structure for a focused morning block.

---

## Output

Save everything to `job-search-os/briefings/[YYYY-MM-DD]-part3-coaching.md` using this format:

```markdown
# Part 3: Pipeline & Coaching - [Full Date]

## Pipeline Summary
[Pipeline table]

## Pipeline Health Check
[Bottleneck analysis]

## Persona Coaching
[Any applicable persona sections]

## Interview Weakness Coaching
[Drills and urgent prep]

## Today's Priority Stack
1. [Action]
2. [Action]
3. [Action]
4. [If time permits]

Estimated time: [X] minutes
```
