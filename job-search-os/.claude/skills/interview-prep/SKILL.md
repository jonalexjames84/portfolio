---
name: interview-prep
description: Generate a comprehensive interview prep package from web research, insider data, and your context library.
---

# /interview-prep - Interview Preparation Package

## When to Use

Run this skill when you have an interview scheduled (or expect one soon) at a specific company for a specific role. Ideally run 24-48 hours before the interview to give yourself time to review and practice. Also useful when you want to prepare speculatively for a company you are actively pursuing.

**Trigger:** `/interview-prep [company] [role] [optional: interviewer name]`

Examples:
- `/interview-prep Google Senior PM`
- `/interview-prep Anthropic Product Manager Sarah Chen`
- `/interview-prep Stripe Growth PM Round 2`

## Role Type Detection

Before executing any step, read `career-plan.md` and detect the user's **target function** from their target role title:
- **Product Management (PM):** Product Manager, Group PM, Director of Product, VP Product, CPO
- **Software Engineering (SWE):** Software Engineer, Staff Engineer, Principal Engineer, Engineering Manager
- **Design:** Product Designer, UX Designer, Design Lead, Head of Design, VP Design
- **Data Science / Analytics:** Data Scientist, ML Engineer, Analytics Manager, Head of Data
- **Marketing:** Marketing Manager, Growth Marketing, Brand Manager, VP Marketing, CMO
- **Customer Success / Sales:** CSM, CS Manager, Director of CS, Account Executive, Sales Manager, CRO
- **Other:** Infer function from role description

All instructions below use PM as the default. When the detected function is NOT PM, substitute function-appropriate equivalents as marked with **[FUNCTION-ADAPTIVE]** notes throughout.

## Inputs

**Required:**
- Company name
- Role title

**Optional:**
- Interviewer name (triggers background research)
- Round number (adjusts question focus: Round 1 = behavioral/fit, Round 2+ = product sense/execution)
- Specific areas of concern (e.g., "I'm weak on product sense questions")

**Auto-read (do not ask the user for these -- read them directly):**
- `context-library/experience-library.md` -- stories, metrics, organized experience
- `context-library/career-plan.md` -- addressing-weaknesses analysis, dream offer, level preference
- `context-library/qa-master.md` -- pre-drafted answers to common questions
- `context-library/interview-history.md` -- past interview scores, weakness patterns, signals
- `context-library/target-companies.md` -- prior research and notes on this company
- `insider-data/behavioral-interview-frameworks.md` -- question frameworks, Three Laws, addressing-weaknesses framework
- `insider-data/company-intel/[company].md` -- company-specific interview format, question bank, tips (if exists)

## Process

### Step 1: Web Research
Search the web for current interview intelligence:
- `"[company] PM interview questions glassdoor [current year]"`
- `"[company] interview process blind [current year]"`
- `"[company] product manager interview rounds"`
- `"[company] [specific role] interview experience"`

**[FUNCTION-ADAPTIVE]** Search for function-specific interview questions, NOT PM questions. SWE: `"[company] software engineer interview questions"`, `"[company] system design interview"`. Design: `"[company] product design interview"`, `"[company] design challenge"`. Data Science: `"[company] data scientist interview"`, `"[company] ML interview"`. Marketing: `"[company] marketing manager interview"`. CS: `"[company] customer success interview"`.

Extract: number of rounds, interview types per round, commonly reported questions, recent process changes.

### Step 2: Insider Data Lookup
- Check `insider-data/company-intel/[company].md` for the company profile. If it exists, extract: interview format, question bank by round, screening signals, tips, comp data.
- If no company-specific file exists, note this gap and rely on web research and general frameworks.
- **If no company-intel file exists AND web search returns little or no useful interview data** (e.g., a small startup, stealth company, or company with no Glassdoor presence): flag this clearly at the top of the prep package with `[LIMITED DATA: No insider data or web interview reports found for [company]. Prep below is based on role-type patterns and general frameworks. Prioritize networking -- reach out to current/former employees for intel before the interview.]`. Fall back to: (1) general PM interview patterns for the role level, (2) company website/blog/press for product context, (3) LinkedIn profiles of the team for culture signals. Do NOT generate fake interview questions attributed to Glassdoor or Blind -- mark all questions as `[Predicted from role type]`.

### Step 3: Framework Loading
- Read `insider-data/behavioral-interview-frameworks.md` for:
  - The Addressing-Weaknesses Framework (drives "Tell Me About Yourself")
  - The 12 Most Common Behavioral Questions and their frameworks
  - The Three Laws of Answer Grading (so user knows how they will be evaluated)
  - Comp Question Strategy

### Step 4: Interviewer Research (if name provided)
- Search the web for the interviewer: `"[name] [company] LinkedIn"`, `"[name] [company] product"`
- Extract: their role, tenure at company, background, product areas they own, any published content (blog posts, talks, tweets)
- Infer likely focus areas based on their background (e.g., a data-focused PM will probe analytics and metrics harder)

### Step 4b: Multi-Round Adaptation (if round 2+)
- Check `context-library/interview-history.md` for prior rounds at THIS company
- If the user has completed 2+ prior rounds at this company:
  - Summarize what was covered in each prior round (questions asked, scores, signals)
  - Identify topics the user already answered well (do NOT re-prep these in detail -- just list them as "covered")
  - Identify concerns or weak answers from prior rounds that interviewers likely flagged internally -- these WILL resurface
  - Predict which prior-round signals will drive this round's questions (e.g., "Round 2 interviewer probed collaboration 3x -- expect Round 3 to test this again from a different angle")
  - Adjust question predictions: later rounds probe deeper on concerns from earlier rounds and introduce new dimensions (strategy, technical depth, culture adds)
- If the user has 5+ rounds logged at this company, add a "Cumulative Signal Map" section showing: every concern raised across all rounds, which ones have been addressed, and which remain open. This is the interviewer panel's collective scorecard -- the user must address every open concern in the remaining rounds.

### Step 4c: Prior-Round Mistake Recovery
- If interview-history.md logs specific fumbles, mistakes, or low-scoring answers from prior rounds at THIS company, build explicit recovery strategies into the prep package:
  - For comp fumbles (e.g., user anchored too high or revealed current comp when they should not have): include a "Comp Course Correction" section with an exact script for walking back the anchor without seeming inconsistent. E.g., "If comp comes up again: 'I've done more research since we last spoke and I'm flexible on comp -- the role and team are the priority. I'm confident we can find a number that works.'"
  - For product sense fumbles (e.g., jumped to solutions): include a "Structured Framework Reminder" card with the exact framework to follow in this round, printed in a format the user can keep visible during a phone screen.
  - For weak "why this company" answers: include a rewritten, company-specific "why here" answer that addresses the specific weakness noted in the prior round (e.g., "too generic" becomes a version with 3 specific, non-interchangeable reasons).
  - For any answer scored below 6/10 in a prior round at this company: assume the interviewer panel has flagged it. Build a proactive reframe that the user can deploy if the topic resurfaces from a different angle.

### Step 5: Weakness-Aware Customization
- Read `career-plan.md` for the addressing-weaknesses analysis
- Read `interview-history.md` for patterns from past interviews (if any entries exist)
- Identify the 2-3 gaps an interviewer at THIS company will notice for THIS role
- Build the "Tell Me About Yourself" script using the Addressing-Weaknesses Framework: lead with strengths, address each weakness head-on, make this role feel like the natural next step

**Interview-history pattern integration for TMAY:** If `interview-history.md` shows recurring weaknesses across interviews (not just at this company), the TMAY script must directly counter them:
- If conciseness is flagged (scores below 7/10, answers running long): the TMAY MUST be timed to under 2 minutes (~280 words max). Add an explicit note: "TIMED TARGET: Practice this to exactly [X] minutes. Your interview history shows answers running [Y] minutes on average. Lead with your headline, then 2-3 proof points, then the bridge. Do NOT add context unless asked."
- If assertiveness/opinionated communication is flagged: the TMAY must lead with a strong point of view, not a balanced overview. Open with "I'm a [specific identity] who [specific strong claim]" not "I have experience in various areas including..." Include a coaching note: "Your interview history shows interviewers want your opinion first. Practice saying 'The right approach is X because Y' instead of 'There are several things we could consider.'"
- If unknown employer brands are flagged: the TMAY must include company context parentheticals spoken naturally. Practice embedding "Rakuten Ichiba -- Japan's largest e-commerce marketplace, $15B in GMV" as a fluid part of the narrative, not a forced aside.
- If compensation framing is flagged: add a specific "Comp Question Rehearsal" section to the prep package with the exact script from `qa-master.md` and a note: "Your interview history shows this question caused friction. Rehearse the redirect: never state current comp, always frame as market rate with data."

**Career Changer Direct-Challenge Prep:**
If the user has zero PM-titled roles (career changer), generate a dedicated "Direct Challenge Responses" section in the prep package. Career changers WILL be asked some version of these questions, and fumbling them ends the process:

1. **"What PM experience do you have?"** -- The script must NOT be defensive. Structure: (a) Reframe immediately: "I've been doing PM work under a different title for [N] years." (b) Name 3 specific PM activities from experience-library.md using PM vocabulary: "I defined product roadmaps, wrote requirements documents, ran user research, prioritized features with data, and aligned cross-functional teams." (c) Give ONE concrete example with a metric. (d) Bridge to why the title gap exists: "The work was identical -- the title was different." Practice until it takes under 60 seconds.

2. **"Walk me through a product you've built"** -- If the user's only shipped product is old (3+ years), prep two versions: (a) The actual shipped product, refreshed with vivid detail and crisp metrics -- practice until it does NOT sound stale. (b) A consulting/adjacent engagement reframed as "a product I defined and helped ship" with enough specificity that it sounds like ownership. Both must be practiced to fluency.

3. **"Why should we hire someone without PM experience?"** -- Structure: (a) Acknowledge honestly: "You're right that I don't have a PM title on my resume." (b) Flip to advantage: "What I bring that most PM candidates with 3 years of title don't: [specific unique value]." (c) Evidence with external validation (client PM testimony, interview feedback, etc.).

4. **For engineering-to-PM career changers -- PM vocabulary translation drill:** Engineer candidates often default to implementation language ("I built," "I coded," "I architected") when they need decision language ("I decided," "I prioritized," "I defined," "I evaluated tradeoffs"). Generate a translation table of the user's 5 most common engineering phrases mapped to their PM equivalents, drawn from experience-library.md. Include this as a wallet card the user reviews before the interview. Also generate 2-3 "PM framing" versions of the user's strongest engineering stories.

5. **For UXR/design-to-PM career changers -- 4th challenge question:** "You're a researcher -- can you actually make decisions with incomplete data?" Structure the response: (a) Acknowledge the perception head-on: "Research teaches you to seek certainty, but product teaches you to act on 60% confidence." (b) Give a specific example where you made a product recommendation with incomplete data and it worked. (c) Bridge: "My research background means I know when more data will change the decision and when it won't. Most PMs over-invest in data collection. I ship when the signal is clear enough." Practice to under 90 seconds.

Include these in the "Your Game Plan" section AFTER the TMAY script and BEFORE Key Stories. Mark them as HIGH PRIORITY practice items.

**IC-to-Manager Transition Direct-Challenge Prep:**
If `career-plan.md` indicates the user is transitioning from IC to first-time manager (e.g., "first-time manager," targeting Manager/EM/Director without prior management experience), generate a dedicated "IC-to-Manager Direct Challenge Responses" section. First-time manager candidates WILL face these questions:

1. **"You've never managed anyone -- why should we trust you with a team?"** -- Structure: (a) Acknowledge directly: "You're right that I haven't had the title." (b) Reframe with evidence of informal leadership from experience-library.md: mentoring, tech leads, project leads, onboarding new hires. (c) Name a specific example where you drove outcomes THROUGH others, not just alongside them.

2. **"How would you handle a low-performing direct report?"** -- Structure: (a) Show a framework: diagnose root cause (skill gap vs. motivation vs. clarity), (b) describe a specific intervention approach (1:1 cadence, clear expectations, timeline), (c) acknowledge when to escalate. Pull from any experience managing vendors, contractors, or cross-functional partners.

3. **"Describe your management philosophy."** -- TRAP: IC candidates default to platitudes ("servant leadership," "empowering the team"). Structure: (a) State a concrete principle with a specific example: "I believe in [principle] -- at [Company], I applied this when [situation]." (b) Name one thing you would NOT do and why. Specificity defeats platitudes.

4. **"How would you prioritize between your IC work and team development?"** -- Structure: (a) Acknowledge the tension honestly. (b) Give a framework: "In the first 90 days, I'd spend [X]% on team, [Y]% on IC, shifting to [ratio] as the team ramps." (c) Name what IC work you'd delegate or stop doing.

5. **"What's your approach to hiring?"** -- Structure: (a) Describe how you'd define the role (skills, team gaps, level). (b) Share a specific example of evaluating talent, even informally (interview loops, vendor selection, intern mentoring). (c) Name one hiring mistake you've seen and what you'd do differently.

Practice each in 30-second and 60-second versions.

**Early-Career Direct-Challenge Prep:**
If `career-plan.md` shows < 3 years of experience or an APM/Associate-level current title, generate a dedicated "Early-Career Direct Challenge Responses" section in the prep package. Early-career candidates WILL face these questions, and fumbling them ends the process:

1. **"You only have [X] years of experience. Why should we hire you over someone with 5+ years?"**
   Response structure: "What I lack in years, I make up for in [specific recent high-impact achievement]. In [time period], I [metric]. That output rate is what you'd want from a [target level] PM. I also bring [unique advantage: recent technical skills, current market intuition, high energy]."

2. **"This role requires someone who has launched a product from 0-to-1. Have you done that?"**
   Response structure: IF yes: lead with it. IF no: "I haven't done full 0-to-1, but I owned [closest equivalent: feature launch, significant initiative, side project]. Here's what that required: [scope, decisions, stakeholders]. The skills are the same."

3. **"What if you're in over your head?"**
   Response structure: "I've already been in over my head -- at [Company], I was thrown into [specific challenge] and figured it out by [specific approach]. My approach is to identify my gaps quickly, ask for help early, and over-prepare. That's how I delivered [metric] in my first [timeframe]."

Practice each in 30-second and 60-second versions.

**Domain-Locked Direct-Challenge Prep:**
If `career-plan.md` shows 5+ years in a single industry (healthcare, fintech, defense, etc.) AND the user is targeting roles outside that industry, generate a dedicated "Domain-Locked Direct Challenge Responses" section in the prep package. Domain-locked candidates transitioning out will face these questions:

1. **"All your experience is in [domain]. How do you know you can do general tech PM work?"**
   Response structure: "The PM fundamentals are identical -- I ran [X] experiments, prioritized a backlog of [Y] features, and grew [metric]. I did this in [domain], but the discipline of hypothesis -> experiment -> iterate is universal. What I bring that generalist PMs don't: deep experience in [transferable skill from domain: regulated environments, enterprise sales cycles, mission-critical systems]."

2. **"Won't you be bored without [domain-specific challenge]?"**
   Response structure: "Actually, I'm excited to APPLY [domain skill] to a new context. [Domain] taught me [specific skill]. I'm eager to use that in [target domain/company] where I see similar challenges: [specific parallel]."

3. **"Our users are completely different from [domain] users. How will you ramp?"**
   Response structure: "I've ramped into new user segments before -- at [Company], I went from [segment A] to [segment B]. My research approach: [specific method]. I'm confident I can get to deep user understanding in [X] weeks. And honestly, sometimes an outsider perspective catches what incumbents miss."

Practice each in 30-second and 60-second versions.

**Employer Brand & Product Trajectory Analysis:**
- Assess the user's current/previous employer brand perception at the TARGET company. Big Tech companies carry stereotypes (e.g., Amazon = process-heavy/LP-driven, Google = consensus-slow, Meta = growth-hacking, Apple = secrecy). Identify the specific stigma the target company's interviewers are likely to hold about the user's background.
- Assess the user's current product line trajectory. If the user worked on a declining, deprioritized, or publicly struggling product (e.g., a voice assistant losing market share, a shuttered product line, a division with layoffs), interviewers WILL notice. Build a proactive reframe: what transferable skills did the user gain, and how does that experience map to the target role's challenges?
- For each identified stigma or product concern, generate a specific 1-2 sentence reframe the user can deploy when the topic surfaces (it will surface). These reframes go in the "Tell Me About Yourself" script AND in a separate "Stigma Defenses" section in the prep package.
- Check the target company's culture against the user's background. If there is a culture mismatch perception (e.g., big-company PM applying to startup, process-heavy company PM applying to speed-focused company), address it explicitly.

### Function-Specific Interview Round Types [FUNCTION-ADAPTIVE]

**SWE interviews** typically include these round types (in addition to behavioral):
- **System Design:** Design a scalable system. Prep: capacity estimation, API design, data model, failure modes, CAP theorem tradeoffs. Output includes: system architecture diagram approach, component deep-dive strategy, operational concerns checklist.
- **Coding/Algorithmic:** Solve algorithmic problems live. Prep: data structures, algorithm patterns, language-specific idioms, time/space complexity analysis.
- **Architecture Review:** Walk through a past technical decision. Prep: ADR format, tradeoff articulation, alternative approaches considered.

**Design interviews** typically include:
- **Portfolio Review:** Walk through 2-3 case studies. Prep: problem framing, process narrative, outcome metrics, "what I'd do differently."
- **Design Challenge:** Live or take-home design exercise. Prep: structured design process (understand, define, ideate, prototype, test), stakeholder consideration, accessibility.
- **Design Critique:** Review an existing product's UX. Prep: heuristic evaluation frameworks, constructive feedback structure.

**Data Science interviews** typically include:
- **Technical Screen:** SQL, Python/R, statistics. Prep: window functions, A/B test analysis, probability, ML fundamentals.
- **Case Study:** Analyze a business problem with data. Prep: metric definition, hypothesis formation, statistical rigor, business recommendation.
- **Modeling:** Build or explain an ML model. Prep: feature engineering, model selection, evaluation metrics, deployment considerations.

**NOTE -- DS-to-MLE transitions:** If the user is moving from Data Science to MLE (Machine Learning Engineer), interviews are a HYBRID format combining three dimensions: (1) **ML system design** -- model serving, monitoring, feature stores, training pipelines, A/B testing infrastructure; (2) **DS case study** -- experimentation design, statistical methodology, causal inference; (3) **People management behavioral** -- team building, technical mentorship, performance management. The candidate must prepare for ALL three, not just the DS or SWE prep path alone. Generate prep across all three dimensions when this transition is detected.

**Marketing interviews** typically include:
- **Campaign Strategy:** Design a go-to-market or growth campaign. Prep: audience segmentation, channel strategy, measurement framework.
- **Analytics Case:** Analyze marketing data and make recommendations. Prep: attribution models, funnel analysis, cohort analysis.

**CS/Sales interviews** typically include:
- **CS Strategy:** Design a health score, build a CS org, segment accounts. Prep: CS methodology frameworks, tech stack design.
- **Role-Play:** Conduct a mock QBR, handle executive escalation, save an at-risk account. Prep: executive communication, objection handling, value articulation.
- **CS Case Study:** Analyze account data and present a retention/expansion strategy.
- **CS Operations:** Design playbooks, renewal processes, onboarding programs.

When generating the prep package, include round-type-specific preparation matching the detected function, NOT PM round types for non-PM roles.

### Step 6: Story Mapping
- Read `experience-library.md` for the Story Bank and organized experience bullets
- Map stories to the most likely questions for this company/role
- Identify any question types where no strong story exists and flag them

### Step 7: Generate Prep Package
Assemble the full output (see Output section below). Save the prep package to `briefings/[YYYY-MM-DD]-prep-[company].md` so it can be referenced by `/mock-interview` and future interview rounds.

## Output

```markdown
# Interview Prep - [Company] [Role]
Generated: [date]
Sources: [list data sources used: company-intel, Glassdoor, Blind, web, interviewer research]

## Interview Format
- Total rounds: [N]
- Round 1: [Type - e.g., Recruiter Screen] ([duration], [what it covers])
- Round 2: [Type - e.g., Hiring Manager Behavioral] ([duration], [what it covers])
- Round 3: [Type - e.g., Product Sense Case] ([duration], [what it covers])
- Round 4: [Type - e.g., Cross-functional/Bar Raiser] ([duration], [what it covers])
[Source: company-intel / Glassdoor / predicted]

## Likely Questions by Round

### Round 1: [Type]
1. [Question] — Source: [Glassdoor / company-intel / predicted]
   Best story: [story title from experience-library, or "GAP - no strong story"]
2. [Question] — Source: [source]
   Best story: [story title]
[Continue for 4-6 questions per round]

### Round 2: [Type]
[Same format]

### Round 3: [Type]
[Same format]

## Interviewer Background
[Only if interviewer name was provided]
- **Name:** [full name]
- **Role:** [their title and team]
- **Background:** [career history, tenure, areas of expertise]
- **Likely focus areas:** [what they will probably probe based on their background]
- **Published content:** [any blog posts, talks, or tweets that reveal their thinking]
- **Suggested approach:** [how to connect with this person's interests]

## Company Context
- **Recent launches:** [2-3 recent product launches or announcements]
- **Product priorities:** [what the company is focused on right now]
- **2-3 product areas to have opinions on:** [FUNCTION-ADAPTIVE] SWE: '2-3 technical architecture decisions to have opinions on.' Design: '2-3 UX/design choices to have opinions on.' Data Science: '2-3 data/ML decisions to have opinions on.' CS: '2-3 customer success strategy choices to have opinions on.'
  1. [Specific area per function] — Your take: [have a brief opinion ready]
  2. [Specific area per function] — Your take: [have a brief opinion ready]
  3. [Specific area per function] — Your take: [have a brief opinion ready]
- **Competitive landscape:** [key competitors and positioning]
- **Recent press/earnings:** [anything from the last 30 days worth knowing]

## Your Game Plan

### "Tell Me About Yourself" (2 min max)
[Customized script built using the Addressing-Weaknesses Framework from career-plan.md]

**Structure:**
- Open: [1 sentence positioning statement that leads with your strongest fit]
- Address Weakness 1: [how this role is the natural progression despite gap]
- Address Weakness 2: [reframe or counter with evidence]
- Close: [why THIS company, THIS role, right now -- tie to their priorities]

**What to lead with:** [specific strength that maps to their top requirement]
**What to preempt:** [the concern they will have from reading your resume]

### Employer Brand & Product Stigma Defenses
[Built from Step 5 employer brand analysis]
1. **Stigma: "[specific perception, e.g., 'Amazon PMs are process-heavy and LP-obsessed']"**
   Reframe: "[1-2 sentence counter, e.g., 'The PRFAQ discipline forced me to think customer-backward on every feature. That rigor is exactly what [target company] needs for [specific challenge].']"
2. **Stigma: "[product trajectory concern, e.g., 'Alexa is a declining product line']"**
   Reframe: "[1-2 sentence counter, e.g., 'Leading product on a platform facing headwinds taught me to prioritize ruthlessly and find growth in constrained environments -- I shipped [specific win] while the broader org was contracting.']"
3. **Stigma: "[culture mismatch perception, e.g., 'Big-company PM may not move fast enough']"**
   Reframe: "[1-2 sentence counter with evidence]"

**When these will surface:** [Predict which interview rounds/question types will trigger these concerns. E.g., "The behavioral round will probe your Amazon LP-style answers -- be ready for follow-ups like 'How would you operate differently here?'"]

### Key Stories to Have Ready
1. **[Story title]** — Maps to: [their top requirement]
   Quick version: [2-3 sentence summary with the key metric]
2. **[Story title]** — Addresses: [your biggest weakness for this role]
   Quick version: [2-3 sentence summary]
3. **[Story title]** — Accomplishment with U-shaped arc and metrics
   Quick version: [2-3 sentence summary]
4. **[Story title]** — Conflict/cross-functional (commonly asked)
   Quick version: [2-3 sentence summary]
5. **[Story title]** — Failure story (commonly asked)
   Quick version: [2-3 sentence summary]

### Dual Application Prep

If the user is applying to multiple roles at the same company (check app-tracker or ask):
- Prepare for: "I see you also applied for [Other Role]. Which do you actually want?"
- Script: "I'm genuinely excited about both -- [Role A] appeals because [specific reason] and [Role B] because [specific reason]. If I had to choose, [primary] is the slightly better fit because [reason]. But I'd be thrilled with either and would bring [shared strength] to both."
- Prepare for internal routing: some companies will route you to whichever team has the better fit after your loop.

### Re-Application (Prior Rejection)

If interview-history.md shows a prior rejected application at this company:
- Treat prior cycle data as strategic intel, not current-cycle data.
- Prepare for: "Why are you re-applying?" Script: "I interviewed [N months] ago and learned a lot -- both about [Company]'s bar and about areas I needed to strengthen. Since then, I've [2-3 specific improvements]. I'm a meaningfully stronger candidate now."
- Prepare for: "What's changed since your last interview?" Have 2-3 concrete new experiences/skills ready.
- Review prior rejection weakness areas and build specific counters for each.

### Weakness Areas to Practice
[From interview-history.md patterns and career-plan.md weaknesses]
1. **[Weakness area]** — Past score: [X/10 avg if available]
   Practice prompt: "[specific mock question targeting this weakness]"
2. **[Weakness area]** — Past score: [X/10 avg if available]
   Practice prompt: "[specific mock question targeting this weakness]"

### Compensation Prep
[From qa-master.md and salary-research if available]
- Their likely range for this level: $[X]-$[Y]
- Your target: $[X] (from career-plan.md)
- If asked about current pay: [script from qa-master.md]
- If asked about expectations: [script from qa-master.md]

## Pre-Interview Checklist
- [ ] Read this prep package fully
- [ ] Practice "Tell Me About Yourself" out loud (time it -- must be under 2 min)
- [ ] Run `/mock-interview behavioral` for at least 5 questions
- [ ] Review the 2-3 product areas and form your opinions
- [ ] Have 2-3 questions ready for the interviewer
- [ ] Check Glassdoor for any last-minute intel
```

## Example

**Input:** `/interview-prep Anthropic Senior PM David Park`

**Output would include:**
- Interview format: 5 rounds (recruiter, hiring manager, product sense, technical, team/culture)
- Likely questions mapped to Anthropic's focus on AI safety, developer tools, and responsible scaling
- David Park's background as a former Google PM now leading developer experience
- "Tell Me About Yourself" addressing: only 4 years PM experience (counter: built at startup scale), no AI/ML listed (counter: Claude Code projects, AI prototyping)
- Key stories mapped to Anthropic's priorities: developer tools experience, technical product work, 0-to-1 building
- Product areas to have opinions on: Claude Code roadmap, API pricing strategy, enterprise vs consumer focus

## Quality Checks

1. **No generic content.** Every question, story mapping, and recommendation must reference specific data from the user's context library or web research. If a section would be generic, flag it with `[NEED: specific data from X]`.
2. **Source attribution.** Every question must be tagged with its source (Glassdoor, company-intel, Blind, predicted). "Predicted" is acceptable but must be clearly labeled.
3. **Story coverage.** If any likely question type has no matching story in experience-library.md, flag it explicitly: "GAP: No strong story for [question type]. Consider adding one to your experience library or run `/mock-interview` to develop one."
4. **Addressing-weaknesses integration.** The "Tell Me About Yourself" script must directly address the weaknesses listed in career-plan.md. If career-plan.md has no weaknesses filled in, prompt the user: "Your career plan doesn't have an addressing-weaknesses analysis yet. Run `Help me fill out my career plan` first for a much stronger prep package."
5. **Freshness.** Web research should target current-year results. Flag if all available data is more than 12 months old.
6. **Actionability.** Every section must give the user something to DO, not just information to absorb. Practice prompts, scripts to rehearse, opinions to form.
7. **Under 2 minutes.** The "Tell Me About Yourself" script, when read aloud at normal pace, must fit in under 2 minutes (~300 words max).
8. **Employer brand stigma addressed.** If the user's current or most recent employer is a well-known company, the prep package MUST include a "Stigma Defenses" section. Every major tech company carries perceptions at other companies. If the user worked on a declining or deprioritized product line, this MUST be addressed with a specific reframe. An interviewer will ask about it -- the user must not be caught flat-footed.
9. **Product trajectory acknowledged.** If the user's most prominent product experience is on a product that has publicly declined, been deprioritized, or faced significant negative press, the prep package must proactively address this. Do not ignore it and hope interviewers will not notice. They will.
10. **Career changer direct challenges included.** If the user has zero PM titles, the prep package MUST include the "Direct Challenge Responses" section with practiced scripts for "What PM experience do you have?" and "Walk me through a product you built."
11. **Prior-round mistakes addressed.** If this is Round 2+ at this company AND interview-history.md logs fumbles or low scores from prior rounds, the prep package MUST include Step 4c recovery strategies. No prep package for Round 2+ should ignore Round 1 data.
12. **International employer brand contextualized.** If the user's employers are not US-famous, the TMAY script and Stigma Defenses section must include parenthetical context (e.g., "Rakuten Ichiba -- Japan's largest e-commerce marketplace with $15B GMV") so the interviewer immediately calibrates scale. The Stigma Defenses section must address the "unknown brand" stigma directly with a reframe script: "Interviewers may not recognize your employer names. Deliver the parenthetical context naturally -- practice embedding 'Rakuten Ichiba -- Japan's largest e-commerce marketplace' as a fluid clause, not a forced aside."
13. **Interview-history patterns integrated into TMAY.** If interview-history.md shows measured weaknesses (e.g., conciseness 5.5/10), the TMAY script must include explicit pacing guidance (word count, time target) and the prep package must flag these as rehearsal priorities.
14. **Visa logistics prep.** If career-plan.md indicates the user needs visa sponsorship, include a "Visa Question Prep" section in the prep package with: (a) the exact 30-second confident logistics script from qa-master.md, (b) coaching on tone: "Matter-of-fact, not apologetic. This is logistics, not a request. Say it like you are explaining your start date, not asking for a favor," (c) company-specific sponsorship data from target-companies.md (petition count, L-1 transfer possibility), (d) response for "Will you need sponsorship?" that includes the Master's degree advantage and the company's own track record.
15. **Cross-cultural communication coaching.** If career-plan.md or interview-history.md flags assertiveness, conciseness, or communication-style weaknesses tied to cultural adaptation (e.g., Japanese consensus-driven style, German debate-driven style transitioning to US direct style), the prep package must include a dedicated "Communication Style Coaching" card with: (a) the specific pattern to watch for (hedging, over-qualifying, burying the conclusion), (b) a "first sentence" rule for every answer type (lead with the conclusion, not the context), (c) a timed practice drill: "Set a 90-second timer. Answer the question. If the timer goes off before your conclusion, you buried the lead."
### Regional Interview Norms

Adapt interview prep to regional expectations when career-plan.md specifies a non-US target market:

**UK:** Similar to US but more conversational. "Competency-based" framing common. Expect questions about teamwork and stakeholder management. Less focus on metrics, more on narrative quality.

**Germany:** More formal. Direct/blunt feedback from interviewers is normal, not hostile. Expect questions about Probezeit (6-month trial period). Prepare for thorough technical depth -- German interviewers go deep. Questions about notice period (3-6 months standard) will come up.

**India:** More hierarchical interview panels. Expect questions about family/personal stability at traditional companies. MNC India offices follow US patterns. Prepare for case studies + technical rounds in the same loop.

**Middle East (MENA):** Relationship-focused. Wasta (connections) carry significant weight. Personal questions (family, marital status, nationality) are legal and common -- prepare brief, comfortable answers. More formal tone expected.

16. **Military Translation Prep (military-to-PM career changers).** If career-plan.md shows military background (active duty, veteran, reserves, or military titles like Captain, Major, Lieutenant, Colonel, etc.), the prep package MUST include a dedicated "Military Translation Prep" section:
    - **STORY BANK:** Help the user pre-translate 5-7 military stories into STAR format with ALL jargon removed. Each story should have a "defense tech version" (some jargon OK, mission context preserved) and a "general tech version" (fully civilian language). Pull from experience-library.md and translate: "I commanded..." becomes "I led...", "mission" becomes "initiative" or "project", "AOR" becomes "area of responsibility", "OPORD" becomes "operational plan", "battle rhythm" becomes "operating cadence", "MDMP" becomes "structured decision-making process", "IPB" becomes "competitive analysis."
    - **CLEARANCE INTERVIEW PREP:** For defense tech roles, prepare how to discuss classified experience: "I can share that I led a team of 12 analysts producing intelligence products for senior military leaders. The analytical framework I built is still in use. I can discuss the methodology and impact but not the specific content." Practice delivering this naturally -- it should sound confident, not evasive.
    - **For non-defense companies:** Interviewers won't understand why you can't share details. Pre-empt: "I worked on classified programs, so I can discuss the methodology and scale but not the specifics. For example, the analytical framework I built is used by [N] teams and processes [scale] inputs daily. I'm happy to go deep on the approach and what I learned."
    - Prepare for follow-up probes ("What exactly did you do?" / "Can you give a specific example?") -- practice redirecting to methodology, leadership scope, and transferable outcomes without revealing classified content.
    - **"How does your military experience translate to PM?" question:** This WILL be asked. Grade on specificity, civilian language, and concrete PM skill mapping. Structure: (a) Name the PM skill being demonstrated, (b) Give the military example translated to civilian language, (c) Connect to the specific role's requirements. Good: "In military intelligence, I built analytical frameworks that synthesized data from 12+ sources into actionable recommendations for senior leaders -- that's the same skill a PM uses when defining metrics and turning data into product decisions." Bad: "The military taught me leadership and discipline."
    - **Dual-track TMAY:** If the user is pursuing both defense tech and general tech, prepare TWO versions of the "Tell Me About Yourself" script. The defense tech version can reference mission context and use some military framing. The general tech version must be fully translated with zero military jargon.

**CAREER RETURNER INTERVIEW PREP:** If `career-plan.md` shows a career gap (e.g., gap_years > 0, or explicit mention of career break/return), add the following to the prep package:

- **Dedicated "Gap Question" preparation block:** Prepare 2-3 versions of the gap answer at different lengths:
  - **30-second version:** Brief factual acknowledgment + one staying-sharp activity + pivot to enthusiasm for THIS role. Example structure: "I took [N] years to [brief neutral framing]. During that time, I [one specific professional activity]. I'm excited about [this role] because [specific reason tied to the JD]."
  - **60-second version:** Same as above but with a second professional activity and a stronger bridge to why NOW is the right time. Include a specific metric from the staying-sharp activity if possible.
  - **If-pressed version (90 seconds max):** For when the interviewer probes deeper. Adds: specific evidence of current relevance (recent certification, advisory project with metrics, industry trend you've been following). Still pivots to the role within 90 seconds.

- **The answer structure for all versions:** (1) Brief factual acknowledgment (never apologize, never over-explain) -> (2) What you did to stay sharp (specific, not vague) -> (3) Why NOW is the right time (tied to the company or role, not personal circumstances) -> (4) Pivot to enthusiasm for THIS role (the answer ends looking forward, not backward).

- **Prepare for the unasked question:** Even if the interviewer does not explicitly ask about the gap, they are thinking about it. The prep must include how to proactively weave "current relevance" signals into EVERY answer -- not just the gap-specific one. For each key story, add a "currency bridge" -- a brief connection to a current industry trend, tool, or methodology that shows the candidate is not stuck in the past. Example: "I built that experimentation framework in 2020, and the principles are the same ones driving [current trend like AI-powered testing or multi-armed bandit approaches] today."

- **"Recency bias" drill:** Practice telling stories that feel CURRENT even if the experience is 3+ years old. The trick: connect old experience to current industry trends. For each story in the prep package, include a one-sentence "currency bridge" that the user can deploy: "The [old experience] is directly relevant because [current industry context]." This makes a 2019 story feel like it could have happened last quarter.

- **PRIVACY GUARDRAIL:** The gap answer must NEVER include the reason for the gap. No mention of health, caregiving, family, personal circumstances, or any detail that is not professionally relevant. The answer acknowledges the gap existed and immediately moves to professional content.

16. **Founder story preparation (failed founder / shut-down company).** If career-plan.md shows founder/CEO/co-founder experience at a company that shut down, failed, or was acqui-hired at low value, add a "Founder Story" section to the prep package. Prepare the "founder story" in 3 versions: (a) **30-second (elevator):** What they built, what they learned, why they are excited about THIS role. No failure narrative. Structure: "I built [product] serving [users/customers]. The biggest thing I took from it was [specific skill]. That's exactly why [this role] excites me -- [connection to JD]." (b) **2-minute (interview):** Deeper on the work, the decisions, the outcomes, and the transition. Still no failure narrative -- frame as a chapter that taught specific skills. Structure: "I co-founded [company] to solve [problem]. Over [N] years, I [built/shipped/scaled specific things]. The experience taught me [2-3 specific PM skills with examples]. When I decided to bring those skills to a larger organization, I started looking for roles where [connection to this company's challenges]." (c) **The "full story" they should NEVER tell:** Flag the version that includes excuses, blame, extended failure analysis, or anything over 3 minutes. This version exists only so the user knows what NOT to say. Write it out explicitly with annotations: "[This part triggers 'bitter founder' perception]", "[This part makes the interviewer wonder if you can move on]", "[This detail is irrelevant to the PM role]." The contrast between version (b) and version (c) teaches the user where the line is.
    - **"Why did your startup fail?" direct question prep:** This WILL be asked. Prepare a 45-second answer that: (1) owns the outcome without dwelling on it, (2) names 1-2 specific learnings, (3) pivots to how those learnings make them a better PM. Grade on: brevity, ownership, forward-looking pivot. Bad answer: 3+ minutes explaining market conditions, co-founder conflicts, or fundraising challenges. Good answer: "We built [product] for [market]. We got [traction metric] but couldn't find product-market fit in [specific segment]. The biggest lesson was [specific PM skill]. That experience is why I'm so focused on [relevant skill for this role] now."
    - **"Can you take direction from a manager?" question prep:** Prepare a specific answer that demonstrates followership with a real example. Pull from experience-library.md any story where the founder worked WITH advisors, board members, investors, or co-founders and deferred to their judgment. If no such story exists, flag: "GAP: No strong 'following someone else's lead' story in your experience library. Add one before this interview."
    - **Dual-track TMAY for founders:** Prepare two versions of TMAY -- one that leads with the startup experience (for companies that value entrepreneurial backgrounds) and one that leads with the PM skills and buries the startup as context (for companies where founder background may be a concern). Flag which version to use based on company-research signals.

    **COMPOUND FAILURE NARRATIVE PREP (Two+ Consecutive Non-Successes)**
    If career-plan.md shows founder/CEO at TWO or more companies that shut down, failed, or underperformed:
    - Prepare a SPECIFIC script for: "Why did you go to [Company B] after [Company A] failed?" This is the hardest question a compound-failure candidate faces. Structure: "After [Company A], I saw an opportunity to apply what I learned about [specific lesson] to [Company B]'s challenge with [specific problem]. The work I did there -- [specific achievement] -- validated that learning. Now I'm ready to bring both those perspectives to a team like [target company] where I can focus on [specific area]."
    - The script must: (a) show Company B was a DELIBERATE choice, not desperation; (b) demonstrate Company A lessons were APPLIED at Company B; (c) end with forward momentum toward the target role.
    - Prepare a separate script for "Won't you just leave to start another company?": "I've had my founder chapter. What I learned is that I love [specific PM skill -- discovery, growth, scaling] more than I love company-building. That's why I'm focused on roles where I can go deep on [area]."

17. **Remote-only interview prep.** If `career-plan.md` shows a remote-only preference, the prep package MUST include a "Remote Pushback Drill" section as a dedicated prep module. Prepare answers for these 4 standard remote pushback questions, each in 30-second and 60-second versions:
    - **"Why do you prefer remote?"** -- Answer with outcomes and productivity, not personal reasons. Structure: "I do my best work in a distributed environment because [async collaboration win], [deep focus benefit], [measurable output improvement]." PRIVACY GUARDRAIL: NEVER prepare answers that reference caregiving, family, health, or personal location constraints as reasons for remote preference.
    - **"Would you consider hybrid?"** -- Prepare an honest, non-apologetic response: "I do my best work in a distributed environment -- here's the evidence: [async wins, shipped projects across time zones, measurable output in remote settings]." No waffling, no over-explaining.
    - **"How do you handle collaboration/culture remotely?"** -- Prep specific examples of async collaboration wins, virtual team building initiatives, and distributed decision-making. Not just "Slack and Zoom" -- concrete processes and outcomes.
    - **"What about occasional travel?"** -- Clarify travel tolerance level based on career-plan.md preferences. Prepare a direct, confident answer that sets clear expectations without being rigid.

18. **Energy and presence coaching (veteran / 15+ years experience).** If career-plan.md shows 15+ years of experience, or experience at legacy/enterprise companies (Oracle, IBM, SAP, HP, Cisco, Dell, Accenture, Deloitte, etc.), or explicit mention of age-related concerns, add an "Energy and Presence Coaching" section to the prep package:
    - **Interview energy note:** Include a prep note: "Interviewers at [Company] skew [younger/mixed/senior -- infer from company-research]. Match their energy: curious, collaborative, forward-looking. Avoid: lecture mode, 'back in my day' framing, referencing decades of experience as a credential rather than citing specific recent work."
    - **"Genuine curiosity" questions:** Prepare 3-5 questions the candidate can ask that signal genuine curiosity about the company's current challenges, not just seniority-appropriate strategic questions. Good: "I've been digging into how [specific product feature] handles [specific edge case] -- what's the team's current thinking on that?" Bad: "What's the 5-year strategic vision?" The first signals hands-on engagement; the second signals executive distance.
    - **"Beginner's mind" framing:** For every answer in the prep package, add a coaching note: "Lead with the LEARNING, not the authority. Instead of 'In my 20 years of experience, I've learned that...' say 'One of the most useful things I picked up at [recent company] was...' The second version sounds curious and growing; the first sounds like someone who stopped learning."
    - **Tech currency signal stories:** Identify 2-3 stories from experience-library.md that demonstrate recent technology adoption, modern methodology usage, or comfort with current tools. These stories should be woven into answers proactively, not saved for when asked. If the user's experience-library.md has no stories involving recent tech/methods (last 2-3 years), flag: "GAP: Your experience library has no recent tech-currency stories. Add at least 2 examples of recent tool adoption, modern methodology usage, or new skill learning before this interview."
    - **Communication style check:** Review the user's interview-history.md for patterns. If the user's answers tend to be longer than 2 minutes, or if they reference experiences from 5+ years ago more than recent ones, add a specific coaching note: "PATTERN: Your interview answers average [X] words ([Y] seconds). Target 200 words (90 seconds) for most answers. Your references skew toward [older company/era] -- consciously pull from the last 3 years instead."

**Ageism Probe Preparation (pre-interview):**
If `career-plan.md` shows 15+ years of experience OR age 40+ (inferred from graduation year, career start date, or explicit mention), add a dedicated "Ageism Probe Prep" section to the prep package. These questions surface in interviews as indirect probes. Prepare BEFORE the interview, not just detect after:

1. **"How do you stay current with technology?"** -- Script: Lead with a RECENT specific example (last 6 months): tool adopted, framework learned, side project built. Then name your learning system (newsletters, communities, hands-on experimentation). Never say "I've always been a learner" -- prove it with dated evidence.

2. **"Are you comfortable with a younger manager?"** -- Script: "Absolutely. At [Company], I reported to [name/role] who was [younger/less tenured]. What I valued was [specific thing you learned from them]. I care about working with smart people, not org chart seniority."

3. **"Where do you see yourself in 5 years?"** -- TRAP: implies "are you going to retire soon?" Script: Answer with growth IN the role and company, not exit plans. "In 5 years, I want to have [specific impact at this company]. This role is the start of that -- I'm excited about [specific multi-year challenge here]." Never reference retirement, winding down, or "one last chapter."

4. **"How do you adapt to fast-moving environments?"** -- Script: Give a RECENT example of operating at speed. Name the pace explicitly: "We shipped [X] in [short timeframe] by [approach]." Counter the slow-and-steady perception with evidence of velocity. Pull from the most recent, fastest-moving project in experience-library.md.

Mark these as HIGH PRIORITY rehearsal items. Practice until each is under 45 seconds and sounds natural, not defensive.

### Security Clearance Interview Prep (Non-Military)

If career-plan.md has security_clearance filled AND the user is NOT from a military background (civilian intelligence, defense contractors, government agencies):
- Use the same clearance interview guidance from the Military Translation Prep section above (lines on CLEARANCE INTERVIEW PREP and non-defense companies).
- Key script for non-defense companies: "I worked on classified programs, so I can discuss the methodology and scale but not the specifics. For example, the analytical framework I built is used by [N] teams and processes [scale] inputs daily. I'm happy to go deep on the approach and what I learned."
- Prepare for follow-up probes ("What exactly did you do?") -- practice redirecting to methodology, leadership scope, and transferable outcomes.

### Involuntary Departure Prep

If career-plan.md indicates the user was fired (not laid off) from their most recent role:

**"Why did you leave [Company]?"** -- Brief, ownership-taking, pivot-forward:
"The role wasn't the right fit -- specifically, [brief honest reason: different expectations around pace/scope/style]. I take responsibility for [specific thing]. What I learned is [specific lesson]. That's actually why [Target Role] is a better match: [connection to why this role fits better]."

**If asked directly "Were you fired?"** -- Honesty is mandatory (background checks will confirm):
"Yes, the company and I parted ways. The core issue was [brief, professional framing]. Here's what I took from it: [lesson]. Since then, I've [evidence of growth]."

**Timing rules:**
- NEVER bring it up proactively in applications or cover letters.
- Have the script ready for interviews. Practice delivering it with zero hesitation and no emotional charge.
- If it doesn't come up in the interview, don't volunteer it.

### Accommodation Disclosure Strategy

If career-plan.md has accommodation_needs filled:

**Phase 1 -- Application/Resume/Cover Letter:** Do NOT disclose. Existing privacy guardrails are correct.

**Phase 2 -- Interview Process:** Disclose ONLY if the accommodation is needed to participate in the interview itself (e.g., captioning, sign language interpreter, extended time). Script: "I'd like to request [specific accommodation] for the interview. This will help me perform my best."

**Phase 3 -- Post-Offer (recommended disclosure point):** "I'm thrilled about the offer. I'd like to discuss a workplace accommodation: [specific need]. This is covered under [ADA/Equality Act/applicable law]. Companies I've worked with have typically [how it was handled]. I'd welcome a conversation about how [Company] supports this."

**Phase 4 -- After starting:** Some prefer to disclose after establishing reputation. Note trade-offs: delayed accommodation vs. demonstrated capability first.

DISCLAIMER: This is strategic career coaching, not legal advice. Consult an employment attorney for your specific situation.

### Criminal History Disclosure Prep

If career-plan.md has background_check_considerations filled:

**Application checkbox (where legally required):** Brief, factual, no over-explaining: "[Offense category], [year]. Since then, I have [specific evidence of rehabilitation/professional growth]."

**Interview question:** "I had a [general category] matter [N] years ago. I've since [specific professional and personal growth]. It has no bearing on my ability to perform this role, but I'm happy to discuss if helpful."

**Ban-the-box awareness:** In ban-the-box jurisdictions, the company cannot ask before a conditional offer. Research the target company's jurisdiction. NEVER volunteer information that isn't asked for.

**Background check timing:** Help the user understand when in the process the check occurs (pre-offer vs post-offer) to manage expectations.

DISCLAIMER: This is strategic career coaching, not legal advice. Consult an attorney specializing in employment law in your jurisdiction.
