> **New here?** Read [START-HERE.md](START-HERE.md) to get running in 45 minutes.

# Job Search OS v1.0

An AI-powered job search system built for Claude Code + Cowork. 18 skills, 4 sub-agents, insider interview data for 250 companies, and a daily morning briefing that runs your search in 20-30 minutes.

Built by [Aakash Gupta](https://product-growth.com).

## Who This Is For

- **Product managers** at any level (APM through VP/CPO)
- **Software engineers** targeting Staff+ or EM roles
- **Designers** targeting Lead/Director/Head of Design roles
- **Data scientists** targeting Senior DS or ML Engineering roles
- **Marketing managers** targeting Director+ growth/demand-gen roles
- **Customer success leaders** targeting Director/VP CS roles
- **Career changers** transitioning into PM from consulting, engineering, design, research, or other functions
- **International professionals** targeting US roles (visa-sponsorship guidance included)

The 18 skills auto-detect your target function from your career plan and adapt accordingly. The insider data and interview frameworks are PM-focused, but the core engine (resume tailoring, networking, interview prep, negotiation) works for any knowledge worker.

## What's Inside

```
job-search-os/
├── CLAUDE.md              # System prompt - Claude reads this automatically
├── setup/                 # Installation guide + first-session checklist
├── .claude/skills/        # 18 skills (resume, interviews, networking, etc.)
├── context-library/       # Your personal data (experience, career plan, targets)
├── cowork-tasks/          # Daily morning briefing prompt for Cowork
├── templates/             # Resume, work product, prototype templates
├── sub-agents/            # 4 reviewer agents (recruiter, ATS, HM, interviewer)
├── insider-data/          # Interview intel for 250 companies + frameworks
└── briefings/             # Daily briefing outputs
```

## Quick Start

1. Open this folder in your editor (Cursor, VS Code, or any terminal)
2. Start Claude Code in the terminal: `claude`
3. Run: `Read CLAUDE.md and summarize what this Job Search OS does`
4. Follow the setup guide: `Read setup/installation-guide.md`

## Try It Now (No Setup Required)

Paste any job description and run `/quick-start`. Find out if it's worth your time in 60 seconds — red flags, salary estimate, interview intel. No context library needed.

## First Session (~45 min)

Three parts — context, targeting, and your first briefing:

1. **Context (20 min):** `Help me build my experience library` → `Help me fill out the Q&A master doc` → `Help me fill out my career plan`
2. **Targeting (15 min):** `/company-research generate target list` → Review and reorder ~100 companies
3. **First briefing (10 min):** Set up the morning briefing, run it, and verify output quality

See `setup/first-session-checklist.md` for the full checklist.

## Daily Use (20-30 min)

Your morning briefing delivers: top roles scored and ranked, tailored resumes, outreach drafts, follow-ups, and pipeline coaching. Review, submit, send. Done.

## All 18 Skills

| Skill | What It Does |
|-------|-------------|
| `/quick-start` | Paste any JD, find out if it's worth your time in 60 seconds. Zero setup. |
| `/resume-tailor` | Tailored resume from real experience with coverage score |
| `/job-fit-scorer` | Score JDs 1-100 across 5 dimensions |
| `/company-research` | Research companies or generate target list |
| `/connection-request` | 25 personalized LinkedIn connection requests |
| `/referral-request` | Full referral sequence with HM identification |
| `/hiring-manager-msg` | HM outreach leading with work product |
| `/work-product` | 1-pager analysis + prototype prompt |
| `/cover-letter` | Top 3 experiences mapped to top 3 requirements |
| `/linkedin-audit` | Profile optimization against target JDs |
| `/app-tracker` | Pipeline tracker with auto-updates |
| `/interview-prep` | Prep package from web + insider data |
| `/mock-interview` | Interactive mock with Three Laws grading |
| `/interview-debrief` | Post-interview analysis with rewrites |
| `/thank-you-note` | Personalized note from transcript |
| `/salary-research` | Market comp data with sources |
| `/negotiate` | Offer analysis + counter-offer language |
| `/weekly-retro` | Performance analysis with coaching |

## Updates

Your context-library files are never overwritten by updates. Check the version number in CLAUDE.md.

## Support

Questions? Reach out at [product-growth.com](https://product-growth.com).
