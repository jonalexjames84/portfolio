# Job Posting Monitor: Senior PM Roles at AI/ML Startups

**Target:** Senior Product Manager roles at AI/ML, SaaS, developer tools, or consumer platform companies (Seed to Series B, Bay Area or remote)

**Last updated:** 2026-03-30

---

## Part 1: Search Queries by Platform

### LinkedIn Job Search

**Direct search URLs** (log in, then paste these into your browser):

```
https://www.linkedin.com/jobs/search/?keywords=%22Senior%20Product%20Manager%22%20AI&location=San%20Francisco%20Bay%20Area&f_WT=2%2C3&f_TPR=r604800&sortBy=DD
```

Key LinkedIn search strings to paste into the Jobs search bar:

```
"Senior Product Manager" AND (AI OR "machine learning" OR LLM OR "generative AI")
```
```
"Senior Product Manager" AND ("developer tools" OR devtools OR "dev tools" OR API)
```
```
"Technical Product Manager" AND (AI OR ML OR "artificial intelligence")
```
```
"Product Manager" AND "AI-native" AND (startup OR "Series A" OR "Series B")
```
```
"Senior PM" AND (AI OR LLM) AND (SaaS OR platform)
```

**LinkedIn filters to apply:**
- Experience level: Mid-Senior level
- Date posted: Past week
- Remote: On-site, Remote, Hybrid
- Location: San Francisco Bay Area (add "United States" for remote)
- Company size: 1-10, 11-50, 51-200 (covers seed through Series B)

---

### Y Combinator - Work at a Startup (https://www.workatastartup.com)

Search queries to use on the site:

```
Senior Product Manager
```
```
Product Manager AI
```
```
Technical Product Manager
```

**Filters to apply:**
- Role: Product
- Location: San Francisco, Remote
- Company size: 1-50, 51-200
- Stage: Seed, Series A, Series B
- Industry: AI/ML, Developer Tools, SaaS, Consumer

---

### Wellfound (AngelList) (https://wellfound.com/jobs)

Search queries:

```
Senior Product Manager
```
```
Product Manager AI ML
```
```
Technical PM AI
```

**Filters to apply:**
- Role: Product Manager
- Location: San Francisco, Remote
- Company size: 1-10, 11-50, 51-200
- Markets: Artificial Intelligence, Machine Learning, SaaS, Developer Tools

---

### Greenhouse Job Boards

Many startups use Greenhouse. Use Google to search across all Greenhouse-hosted job boards:

```
site:boards.greenhouse.io "Senior Product Manager" (AI OR ML OR LLM)
```
```
site:boards.greenhouse.io "Product Manager" ("artificial intelligence" OR "machine learning") (remote OR "San Francisco")
```
```
site:boards.greenhouse.io "Technical Product Manager" (AI OR "developer tools")
```
```
site:boards.greenhouse.io "Senior Product Manager" ("Series A" OR "Series B" OR startup)
```

---

### Lever Job Boards

```
site:jobs.lever.co "Senior Product Manager" (AI OR ML OR LLM)
```
```
site:jobs.lever.co "Product Manager" ("machine learning" OR "artificial intelligence")
```
```
site:jobs.lever.co "Technical Product Manager" AI
```

---

### Ashby Job Boards (popular with newer startups)

```
site:jobs.ashbyhq.com "Senior Product Manager" (AI OR ML)
```
```
site:jobs.ashbyhq.com "Product Manager" ("developer tools" OR devtools)
```

---

### Google Search Operators (Broad Sweep)

These search across multiple ATS platforms and company career pages at once:

```
(site:greenhouse.io OR site:lever.co OR site:ashbyhq.com) "Senior Product Manager" (AI OR ML OR LLM) (remote OR "San Francisco" OR "Bay Area")
```

```
(site:greenhouse.io OR site:lever.co OR site:ashbyhq.com) "Product Manager" "AI-native" (startup OR "early stage")
```

```
(site:greenhouse.io OR site:lever.co OR site:ashbyhq.com) "Product Manager" ("developer tools" OR "dev tools" OR API OR SDK)
```

```
"Senior Product Manager" (AI OR "machine learning") ("Series A" OR "Series B" OR "seed") -director -VP site:*.com
```

**Tip:** Append `&tbs=qdr:w` to any Google search URL to filter results from the past week.

---

### Additional Niche Sources

**Hacker News "Who is Hiring" threads:**
- Check the first of each month at https://news.ycombinator.com
- Ctrl+F for: `product manager`, `PM`, `AI`, `ML`

**AI-specific job boards:**
- https://aijobs.net - Search "Product Manager"
- https://ai-jobs.net - Search "Senior PM"

**Startup-focused boards:**
- https://startup.jobs - Filter: Product, AI/ML, Bay Area
- https://otta.com - Set preferences for PM + AI + Bay Area
- https://builtin.com/jobs - Filter: Product, AI, San Francisco

**VC portfolio career pages (check weekly):**
- a16z: https://jobs.a16z.com
- Sequoia: https://jobs.sequoiacap.com
- Benchmark: portfolio company pages
- Greylock: https://greylock.com/portfolio (check individual companies)
- Y Combinator: https://www.ycombinator.com/companies (filter by AI, hiring)

---

## Part 2: Keywords to Monitor

Set up alerts (Google Alerts, LinkedIn alerts, or RSS) for these keyword combinations:

| Primary Title | Combined With | Location Filter |
|---|---|---|
| "Senior Product Manager" | AI, ML, LLM, "generative AI" | Bay Area, Remote |
| "Technical Product Manager" | AI, "machine learning", NLP | Bay Area, Remote |
| "Product Manager" | "AI-native", "AI-first" | Bay Area, Remote |
| "Product Manager" | "developer tools", devtools, API, SDK | Bay Area, Remote |
| "Senior PM" | AI, ML, SaaS, platform | Bay Area, Remote |
| "Staff Product Manager" | AI, ML, LLM | Bay Area, Remote |

### Google Alerts to Create

Go to https://www.google.com/alerts and create alerts for:

1. `"Senior Product Manager" AI startup "San Francisco" OR remote`
2. `"Product Manager" "machine learning" (Series A OR Series B)`
3. `"Technical Product Manager" AI (Bay Area OR remote)`
4. `"Senior Product Manager" "developer tools" startup`

Set frequency to: **Once a day** or **As-it-happens**

---

## Part 3: Automated Monitoring Setup

### What I Attempted

I tried to set up a Claude Code scheduled agent (weekly cron trigger) to automatically search for new job postings every Monday at 9am PT. The `schedule` skill exists in Claude Code but was not available in this session. The PostHog scheduled-changes tools only support feature flag operations, not general-purpose automation.

### Option A: Claude Code Scheduled Agent (Recommended)

When you have access to the `schedule` skill in Claude Code, run:

```
/schedule create
```

Configure it with:
- **Name:** `weekly-pm-job-search`
- **Schedule:** `0 9 * * 1` (every Monday at 9am)
- **Prompt:**

```
Search the web for new "Senior Product Manager" job postings at AI/ML startups
(Seed to Series B, Bay Area or remote) posted in the last 7 days.

Search these queries:
1. "Senior Product Manager" AI startup San Francisco posted this week
2. "Product Manager" ML LLM startup remote posted this week
3. site:boards.greenhouse.io "Senior Product Manager" AI
4. site:jobs.lever.co "Senior Product Manager" AI
5. "Technical Product Manager" AI developer tools Bay Area OR remote

Compile a summary with:
- Company name and stage (if known)
- Role title
- Location (remote/hybrid/onsite)
- Direct link to the posting
- Brief note on what the company does

Save the results to:
/Users/jonathanmartin/Desktop/Claude Projects/portfolio/documents/job-search-results-YYYY-MM-DD.md
```

### Option B: macOS launchd + Claude CLI (DIY Automation)

Create a script that runs Claude Code headless on a schedule:

**Step 1:** Create the search script at `~/scripts/job-search.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
OUTPUT="$HOME/Desktop/Claude Projects/portfolio/documents/job-search-results-${DATE}.md"

claude -p "Search the web for new Senior Product Manager job postings at AI/ML startups (Seed to Series B, Bay Area or remote) posted in the last 7 days. Use these searches: 1) 'Senior Product Manager' AI startup San Francisco, 2) 'Product Manager' ML LLM startup remote, 3) site:boards.greenhouse.io 'Senior Product Manager' AI, 4) site:jobs.lever.co 'Senior Product Manager' AI. Compile a summary with company name, role, location, link, and company description. Write results to: ${OUTPUT}"
```

**Step 2:** Make it executable: `chmod +x ~/scripts/job-search.sh`

**Step 3:** Create a launchd plist at `~/Library/LaunchAgents/com.jon.jobsearch.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.jon.jobsearch</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/jonathanmartin/scripts/job-search.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Weekday</key>
        <integer>1</integer>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/jobsearch.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/jobsearch.err</string>
</dict>
</plist>
```

**Step 4:** Load it: `launchctl load ~/Library/LaunchAgents/com.jon.jobsearch.plist`

### Option C: Manual Weekly Routine (No Setup Required)

Every Monday morning, open Claude Code and run:

```
Search the web for new "Senior Product Manager" job postings at AI/ML startups
(Seed to Series B) in Bay Area or remote, posted in the last 7 days.
Check greenhouse.io, lever.co, and ashbyhq.com job boards.
Compile results to documents/job-search-results-YYYY-MM-DD.md
```

---

## Part 4: Weekly Search Checklist

Use this as a Monday morning routine (15-20 minutes):

- [ ] Run LinkedIn saved searches (3 queries above)
- [ ] Check Work at a Startup (YC) for new PM roles
- [ ] Check Wellfound for new PM postings
- [ ] Run the top 2 Google site: searches (Greenhouse + Lever)
- [ ] Scan Hacker News "Who is Hiring" (if first of month)
- [ ] Check 2-3 VC portfolio pages (rotate through the list)
- [ ] Review Google Alerts digest
- [ ] Log interesting roles in a tracking spreadsheet

---

## Part 5: Application Tracking

Consider tracking applications in a simple spreadsheet or Notion database with these columns:

| Column | Purpose |
|---|---|
| Company | Company name |
| Role | Exact title |
| Stage | Seed / A / B |
| Source | Where you found it |
| Date Found | When you spotted the listing |
| Date Applied | When you submitted |
| Status | Applied / Phone Screen / Interview / Offer / Rejected |
| Contact | Recruiter or hiring manager name |
| Notes | Key details, interview prep notes |
| Link | Direct URL to posting |
