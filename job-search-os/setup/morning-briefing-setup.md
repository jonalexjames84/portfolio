# Morning Briefing Setup

The daily morning briefing is the core of the OS. It scans for new roles, scores them, tailors resumes, generates outreach, and coaches you on your pipeline. Here's how to set it up.

## What is Cowork?

Cowork is Claude's built-in task scheduling feature within Claude Desktop. It runs tasks automatically on a schedule (like a daily morning briefing). Requirements:
- Claude Desktop app (not just the terminal CLI)
- Claude Pro or Max subscription

If you are running Claude Code in a terminal without Claude Desktop, Cowork is not available -- use Option 2 (Manual Run) instead. All 18 skills work without Cowork.

## Option 1: Cowork Scheduled Task (Recommended)

1. Open Cowork
2. Type `/schedule`
3. Configure:
   - **Name:** Daily Job Search Briefing
   - **Cadence:** Weekdays
   - **Time:** 7:00 AM (customize to your schedule)
4. Paste the EXACT prompt from `cowork-tasks/daily-morning-briefing.md`
5. Save

## Option 2: Manual Run

In Claude Code:
```
Read cowork-tasks/daily-morning-briefing.md and execute it
```

Run this each morning until you're confident in the automated output.

## Connect Google Calendar

1. Open Claude Desktop app
2. Go to Settings > Connectors
3. Click 'Google Calendar'
4. A Google sign-in window will appear. Sign in with the Google account that has your interview calendar.
5. Click 'Allow' to grant access
6. You should see a green checkmark confirming the connection

This lets the briefing check for scheduled interviews and include prep reminders in your daily output.

## What to Check in Output

After your first few runs, verify:

- **Role relevance:** Are the top roles actually matching your career plan?
- **Fit scores:** Do the 1-100 scores feel right? A role you'd skip should be below 60.
- **Resume accuracy:** Every bullet must come from your experience library. Zero fabrication.
- **Connection requests:** Are they personalized? Would you accept one?
- **Pipeline coaching:** Does the advice match your actual situation?

## Troubleshooting

- **Briefing not running:** Laptop must be awake and Claude Desktop open at the scheduled time
- **Roles irrelevant:** Refine your career plan and target companies list
- **Resumes generic:** Your experience library is too thin. Add more detail.
- **Connection requests bland:** Add more detail to your experience library (shared schools, past companies, locations)

## Adjusting Over Time

The briefing gets better as your context library grows. After each week:
- Update `connection-tracker.md` with new connections
- Update `app-tracker` with application statuses
- Review and adjust `target-companies.md` based on what's working
