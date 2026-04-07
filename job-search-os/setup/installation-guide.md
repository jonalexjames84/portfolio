# Installation Guide

## Before You Start

**You need a Claude subscription.** Claude Pro ($20/mo) or Claude Max ($100-200/mo) at [claude.ai](https://claude.ai). The Job Search OS is the system; Claude is the engine that runs it. The OS is a one-time $49 purchase. The Claude subscription is separate and required.

**Never used a terminal before?** No problem. See `terminal-basics.md` in this folder — it's a 2-minute read that covers everything you need. No coding required. You'll type plain English and paste job descriptions.

**On Windows?** Install WSL (Windows Subsystem for Linux) first. Open PowerShell as admin and run: `wsl --install`. Restart. Then follow all steps below inside your WSL terminal. Everything else works the same.

## Step 1: Install Claude Code

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Verify it works:
```bash
claude --version
```

## Step 2: Open the OS in Cursor

1. Download the OS folder from your purchase email
2. Unzip it
3. Open Cursor > File > Open Folder > select the `job-search-os` folder
4. Set up three-pane layout: file tree (left), editor (center), terminal (bottom)

## Step 3: Start Claude Code

In the Cursor terminal:
```bash
claude
```

Claude automatically reads `CLAUDE.md` and understands the full OS.

## Step 4: Explore the OS

```
Read CLAUDE.md and summarize what this Job Search OS does
```

Browse the folders. Right-click any `.md` file > Open Preview to read it formatted.

## Step 5: Build Your Experience Library (~30 min)

```
Help me build my experience library
```

Paste your resume AND your LinkedIn profile (copy the text or export). Claude merges both, deduplicates, and organizes by skill category. Then it asks about projects neither source captures.

Tip: Use dictation instead of typing. 30 min of talking produces a richer library than an hour of typing.

This is the most important step. If your experience library is thin, everything the OS produces will be generic. If it's rich, everything is surgical.

## Step 6: Fill the Q&A Master Doc

```
Help me fill out the Q&A master doc
```

Claude walks you through compensation strategy, common application questions, and logistics. Fill once, used everywhere.

## Step 7: Create Your Career Plan

```
Help me fill out my career plan
```

Rank your preferences (level, industry, function). Claude identifies your weaknesses by comparing your resume to typical JDs. The addressing-weaknesses analysis drives everything: resume positioning, "tell me about yourself," and interview prep.

Spend 15 minutes getting the weaknesses section right. It's the highest-leverage 15 minutes in the entire setup.

## Step 8: Generate Target Companies

```
/company-research generate target list
```

Describe your ideal companies in 2-3 sentences. Claude generates ~100 entries. Review, edit, and reorder.

## Step 9: Set Up the Morning Briefing

See `morning-briefing-setup.md` for exact Cowork configuration.

## Step 10: Set Up Interview Recording

This step is optional. Granola is a meeting transcription tool (granola.ai) that records and transcribes your interviews automatically. If you don't use Granola, you can manually paste interview transcripts into `/interview-debrief` after each interview.

Install Granola (granola.ai) for automatic meeting transcription. Configure it to auto-record meetings. Point the OS at the transcript folder so debriefs fire automatically after interviews.

## Step 11: First Manual Run

Before trusting automation, run the briefing manually:

```
Read cowork-tasks/daily-morning-briefing.md and execute it
```

Review the output. Are roles relevant? Resumes good? Adjust context files if anything is off. Trust the automation after 2-3 good runs.

## Prerequisites & Costs

- **Claude Pro subscription** ($20/mo) is required to run Claude Code. The OS itself is a one-time purchase; Claude Pro is your runtime.
- **Cursor** (free tier works). Any editor with a terminal works, but Cursor's three-pane layout is ideal.
- **Cowork** (optional, free tier available). Only needed for the automated morning briefing. All 18 skills work standalone in Claude Code without Cowork.
- **Granola** (optional, free tier available). Only needed for automatic interview transcription.

## Troubleshooting

**"claude: command not found"**
Close and reopen your terminal after installing. If still not working, try: `export PATH="$HOME/.claude/bin:$PATH"` then run `claude` again. On Windows, use WSL2.

**"Permission denied" during install**
Run with admin privileges: `sudo curl -fsSL https://claude.ai/install.sh | bash`

**Claude Code starts but doesn't read CLAUDE.md**
Make sure you opened the `job-search-os` folder directly in Cursor (not a parent folder). Claude Code reads CLAUDE.md from the current working directory.

**Resumes are generic / output is low quality**
Your experience library is too thin. This is the #1 cause of poor output. Go back to Step 5 and add more detail. Aim for 12+ STAR stories in the story bank and detailed metrics in every bullet.

**"I'm not a PM — will this work for me?"**
The OS is optimized for PM roles but the core system (resume tailoring, networking, interview prep, negotiation) works for any knowledge worker role. The insider data and interview frameworks are PM-specific. If you're in engineering, design, marketing, or other functions, the skills still run — just skip the PM-specific insider data.

**"I'm not in the US"**
The salary research skill uses US-centric sources (levels.fyi, Glassdoor). If you're targeting roles outside the US, supplement with local comp data. The company intel database focuses on US companies. For international job searches, use `/company-research` to build your own target list. All other skills (resume, networking, interview prep, negotiation) work globally.

**Morning briefing isn't running automatically**
Your laptop must be awake and Claude Desktop must be open at the scheduled time. If you're on a laptop, check sleep settings. Consider scheduling 30 min after your alarm.

**Company intel seems outdated**
The insider data was current as of the OS build date. For any company, run `/company-research [company]` to get fresh data from the web. The pre-loaded intel is a starting point — always supplement with current research before interviews.

**Skills produce errors or incomplete output**
Run `/clear` and try again. Long conversations degrade Claude's context. Start fresh between unrelated tasks. If a skill consistently fails, check that the required context-library files are filled in (not just template placeholders).
