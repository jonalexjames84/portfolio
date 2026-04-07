# Morning Briefing - Part 2: Networking
# Connection requests, follow-ups, referral nudges

> **Cowork setup:** Schedule at 7:15 AM weekdays. Saves output to `briefings/[YYYY-MM-DD]-part2-networking.md`.
> This part runs independently. It reads Part 1 output if available for role context.

---

Read all files in the job-search-os/context-library/ folder. Also read job-search-os/CLAUDE.md for system rules. If today's Part 1 output exists at `briefings/[YYYY-MM-DD]-part1-roles.md`, read it for top role context.

## Quality Gate

Verify these files contain real data (not template placeholders):
1. **connection-tracker.md** -- Needed for follow-ups and referral nudges. If empty, networking will be limited to new outreach only.
2. **target-companies.md** -- Needed to identify coverage gaps. If empty, STOP and say: "Fill in target-companies.md first."
3. **career-plan.md** -- Needed for function detection and persona modes. If empty, STOP and say: "Fill in career-plan.md first."

## Role Type Detection

Read `career-plan.md` to detect the user's target function. Target function-appropriate networking contacts (not PMs for non-PM users).

---

## New Connection Requests

Identify companies in target-companies.md where the user has fewer than 4 connections in connection-tracker.md. These are coverage gaps.

**Default: 25 connection requests**, round-robin distributed across gap companies (do not send all 25 to one company).

**SENIOR-LEVEL / EMPLOYED MODE:** If career-plan.md shows Director+ AND currently employed, reduce to 5-10 requests. Target only VP/Director peers, CPO/SVP hiring executives, and executive recruiters. Provide strategic rationale for each. Add confidentiality note: "Employed executive mode: All outreach framed as professional networking, not job searching. No 'Open to Work' signals."

**REMOTE-ONLY MODE:** If career-plan.md shows remote-only preference, prioritize remote-friendly companies (GitLab, Automattic, Zapier, Buffer, and any flagged in target-companies.md). Allocate at least 50% of batch to confirmed remote-friendly companies. Also suggest 1-2 virtual communities: PM: Product School Slack, Lenny's community. SWE: Discord servers, open-source communities. Design: ADPList. Format: "This week's virtual networking: Join [community] and comment on 2-3 relevant threads."

**VETERAN / 15+ YEARS MODE:** If career-plan.md shows 15+ years or legacy/enterprise employers, prioritize connections who also have 10+ years of experience. Avoid over-indexing on early-career contacts.

**FOUNDER-TO-EMPLOYEE MODE:** If career-plan.md shows founder/CEO at shut-down company, frame connection requests based on target company type. Enterprise targets: lead with strongest employer brand identity. Startup targets: leading with "former founder" is an asset. Format: "CONNECTION REQUEST FRAMING: [N] enterprise targets, [N] startup targets."

**CAREER RETURNER MODE:** If career-plan.md shows a career gap, check if user has re-engaged any dormant connections this week. If not: "NETWORK RE-ENGAGEMENT: Send 3-5 messages to former colleagues at or near target companies. Template: 'Hi [Name], it's been a while! I'm exploring [function] roles again -- would love to hear what you've been up to. Any chance you'd be open to a quick catch-up?'"

For each connection request:
- One personalized message (300 characters max, LinkedIn limit)
- Must include: specific reference to the person's work/background, a connection point (mutual connection, shared school, shared company, location, or role-specific detail), and user's one-line qualifier
- Tone: warm, human, slightly casual. Not corporate. Not desperate.

Output as table:
| # | Name | Company | Role | Message |
|---|------|---------|------|---------|

---

## Follow-Ups (Connections Accepted in Last 48 Hours)

Check connection-tracker.md for connections that went from "requested" to "connected" in the last 48 hours.

For each newly accepted connection, draft a follow-up:
- Thank them for connecting
- Reference something specific about their background
- Soft ask for a 15-minute conversation (not a referral -- too early)
- Under 500 characters

---

## Referral Nudges (Stale Requests)

Check connection-tracker.md and referral-tracker-template.md for:
- **Referral requests sent 5+ days ago with no response:** Draft a gentle one-time nudge. Short. Low pressure. Example: "Hey [Name], just checking in on the referral for the [Role] position. Totally understand if the timing doesn't work -- appreciate you either way."
- **Roles applied to in the last 48 hours with no referral:** Identify closest connection at that company and draft a referral request.

---

## Military Networking

If `career-plan.md` shows military background, add:
- 1-2 veteran-to-tech events, communities, or networking opportunities this week (Shift.org, VetsinTech, Service2Software, BreakLine, Hiring Our Heroes, Military MBA networks)
- Defense tech hiring events or veteran-specific career fairs
- Fellow military transitioners at target companies who recently posted on LinkedIn

Format: "VETERAN NETWORKING: [Event/Community] -- [date if applicable] -- [why relevant]. Action: [specific thing to do today]."

If pursuing BOTH defense tech and general tech, split networking into dual tracks:
- **Defense Tech Track:** Target defense tech veteran communities, clearance value emphasized
- **General Tech Track:** Target general communities and military-to-tech transitioners at general tech companies

---

## Output

Save everything to `job-search-os/briefings/[YYYY-MM-DD]-part2-networking.md` using this format:

```markdown
# Part 2: Networking - [Full Date]

## Connection Requests ([N] total)

| # | Name | Company | Role | Message |
|---|------|---------|------|---------|
| 1 | [Name] | [Company] | [Role] | [300 char message] |
| ... | | | | |

## Follow-Ups (Newly Accepted)

### [Name] at [Company]
Connected: [date]
Message: [draft follow-up]

## Referral Requests & Nudges

### New Referral Requests
- [Name] for [Role] at [Company]: [draft message]

### Nudges (5+ days, no response)
- [Name] for [Role] at [Company]: [draft nudge]
```
