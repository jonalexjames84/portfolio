# Project Instructions

## Who Is Jon

Jon Martin is a Senior Product Manager with 15+ years shipping products at Zynga, Jam City, Bandai Namco, Big Fish Games, AAA, Genies, Mythical Games, and Treasure DAO. He was laid off in November 2024, then co-founded Frame Story (a collaborative game studio) and built Pottery Friends (a craft studio community app) solo using AI-native development with Claude Code.

From May to July 2026 he was **Founding Technical Product Manager at Memorang**, an AI edtech infrastructure company, reporting directly to the founder. He owned launch readiness across four concurrent white-label learning apps, authored the prioritization frameworks the team ran on, and built a 51-skill Claude Code operating system plus nightly automation that ran his own job. He is searching again as of August 2026.

His differentiator: he's a PM who builds production software with AI tools, and who has now done it inside a company at scale, not just solo. This repo — a Next.js portfolio site built entirely with Claude Code — is one proof point of that.

**Memorang NDA rule:** Jon signed an NDA. Never publish or write into any external-facing artifact: client names (ETS, Pearson, McGraw-Hill, AAPA, JBJS, PSI, TherapyEd), contract values or revenue-share terms, coworker or executive names, internal ticket/doc/channel links, bug counts or at-risk statuses, unreleased product architecture, or security findings. Describe customers generically ("a global testing organization"). Jon's own frameworks, the systems he built, and generic scale figures are fine.

## Goal

**Find his next Product Management role** in the growing AI market, searching as of August 2026. Ideal targets: seed-to-Series B startups in AI/ML, SaaS, dev tools, or consumer platforms. Bay Area, open to remote.

Jon wants to showcase his AI skills to attract recruiters and hiring managers at AI-forward companies. He's not just talking about AI — he's building with it daily, and the Memorang role is the proof that it holds up inside a company under real deadlines.

## How To Help

This repo exists as **context about Jon** — his career, skills, projects, writing, and how he thinks about product. Use it to understand who he is when helping with:

- Job search strategy and positioning
- Resume and cover letter tailoring
- Interview prep and storytelling
- LinkedIn and professional branding
- Networking outreach and cold emails
- Blog content and thought leadership
- Evaluating companies and roles for fit
- Salary negotiation and offer evaluation
- Any other career or professional task

## Applying To Jobs — Claim First

Multiple agents run this job search at once. **Stedi received three applications**
— three roles, three agents, one ~100-person company — because nothing recorded
that an application had happened.

Before writing a cover letter, tailoring a resume, or opening an ATS form:

```bash
.claude/skills/one-application-per-company/apply-guard.ts claim \
  --agent "$CLAUDE_AGENT_ID" --company "<name>" --role "<title>" --url "<url>"
```

Exit 1 means stop and pick a different role. The rules:

- **One application per req, ever.** URL spelling does not create a new job.
- **One open application per company**, unless it is large enough to have
  genuinely separate product orgs (Google, Amazon, Roblox: 3; Anthropic, OpenAI,
  Figma: 2). Everything else is 1.
- A rejection frees the company slot. It never reopens the req.

Full rules in the `one-application-per-company` skill. Do not mark a pipeline row
`applied` without a matching ledger record.

## Key Reference Files

| File | What It Contains |
|---|---|
| `src/lib/experience.ts` | Full career history, metrics, companies, skill categories |
| `src/lib/projects.ts` | Project case studies with outcomes and technical details |
| `src/lib/posts.ts` | Blog posts — conference takeaways, AI/PM thinking |
| `src/app/about/page.tsx` | Career narrative and testimonials |
| `documents/` | Resumes (PDF), AI conference notes/transcripts from Berkeley |
| `src/lib/job-search/application-guard.ts` | Canonical job keys, per-company application caps |
| `scripts/render-pdfs.mjs` | Renders cover letter and resume PDFs from source |
| `scripts/sync-materials.mjs` | Pushes `documents/` into the Materials tab |

## The Materials Tab

`/job-search/materials` is backed by the `job_materials` table, not the
filesystem. `documents/` is gitignored and `.vercelignore`'d because this repo
is public, so the deployed site can never read a resume off disk.

`scripts/sync-materials.mjs` bridges the gap. It walks `documents/resumes/` and
`documents/applications/cover-letters/`, pairs each markdown body with its
rendered PDF, upserts one row per material keyed on `source_path`, and uploads
the PDFs to the private `job-materials` Supabase Storage bucket. The tab serves
them back through short-lived signed URLs at
`/api/job-search/materials/[id]/file`.

Every material is a **one-page PDF**. `scripts/render-pdfs.mjs` builds them:
cover letters from their markdown through a Helvetica Neue template that matches
the letters Jon has already sent, and the `.html` resume variants by printing
them with their own `@page` rules. Letters are measured and rendered at the
loosest of four densities that still fits one page; resumes that overrun by a
line get a 2% scale nudge rather than a near-empty second page.

**The rule that matters:** a letter's markdown opens with notes written *to Jon*
— JD verification, comp, "honest gap," "you already applied here." The renderer
drops everything above the `---` rule, and **refuses to render a letter that has
no `---`** rather than risk printing those notes on something Jon sends. Never
remove that separator from a letter.

**You don't have to run any of it.** `.claude/hooks/sync-materials.sh` fires on
PostToolUse and Stop, renders any missing PDF, then syncs. It exits in
milliseconds unless something under `documents/` actually changed. By hand:
`npm run materials:sync`, `npm run materials:check` for a dry run, or
`npm run materials:render:all` after changing the letter template.

Two things worth knowing before you touch it:

- Rows carry `origin`. `repo` rows are owned by the sync and are **deleted when
  their file disappears**. Rows POSTed by the `/cover-letter` and
  `/resume-tailor` skills are `origin='agent'` and survive the prune.
- To pull in another folder (screening answers, conference notes), add one entry
  to `SOURCES` at the top of the script. Everything else keys off that.

## Jon's Positioning

- **15+ years** shipping products across gaming, consumer tech, enterprise, edtech, and web3
- **AI-native builder**: Built Pottery Friends (150 beta users), this portfolio, and multiple projects solo using Claude Code
- **AI-native operator**: At Memorang, built 51 Claude Code skills, a 94-file context memory layer, nightly status automation, and a quality gate that graded every agent write before it landed
- **Founder experience**: Co-founded Frame Story, built financial models, raised funding via SAFEs
- **Metrics-driven**: $50M product revenue, 10M+ installs, 6M users, 8M+ annual test-takers reached
- **Technical PM**: Codes in React/Next.js/TypeScript, runs PostHog analytics, ships without engineering support

## Tone When Writing For Jon

- Direct, confident, not arrogant
- Specific numbers over vague claims
- "I built this" not "I managed a team that built this"
- No corporate jargon or buzzword stuffing
- Show the work, don't just describe the title
