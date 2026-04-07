# Updating the Job Search OS

When a new version is released, follow these steps to update without losing your personal data.

## Update Process

1. **Download the new version** from the distribution source.
2. **Copy these folders and files** from the new version into your existing job-search-os folder, replacing the old versions:
   - `.claude/skills/` (all skill files)
   - `sub-agents/` (all sub-agent files)
   - `insider-data/` (company intel profiles and frameworks)
   - `cowork-tasks/` (scheduled task prompts)
   - `templates/` (template files)
   - `CLAUDE.md` (root config file)
3. **Do NOT overwrite `context-library/`.** This folder contains your personal data (experience library, career plan, target companies, connection tracker, interview history, etc.). It stays untouched during updates.
4. **Check `CLAUDE.md` for the version number** after copying to confirm the update applied correctly.

## What Gets Updated vs. What Stays

| Updated (replace with new version) | Preserved (never overwrite) |
|-------------------------------------|-----------------------------|
| `.claude/skills/` | `context-library/` |
| `sub-agents/` | `briefings/` |
| `insider-data/` | Any personal notes or files you added |
| `cowork-tasks/` | |
| `templates/` | |
| `CLAUDE.md` | |

## If Something Breaks

If an update causes issues, check the `CHANGELOG.md` at the project root for what changed in each version. If a skill behaves differently, the changelog will note breaking changes.
