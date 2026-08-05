# PostHog Work Product Page — Design Spec

## Overview

A standalone interactive page at `/posthog` presenting Jon's product analysis "PostHog Onboarding for Solo Builders: The Missing Activation Path." This replaces a static Google Doc as the work product attached to a hiring manager LinkedIn DM to James Hawkins (PostHog CEO). The page should demonstrate product thinking AND technical/design chops simultaneously.

## Target Audience

James Hawkins, CEO/Co-founder of PostHog, opening a link from a LinkedIn message on desktop or mobile.

## URL & Routing

- Route: `src/app/posthog/page.tsx`
- URL: `portfolio.jonnymartin.blog/posthog`
- Standalone page — no site nav, no footer from the main portfolio
- Custom OG metadata for LinkedIn link preview:
  - Title: "PostHog Onboarding for Solo Builders — Product Analysis"
  - Description: "3 activation walls costing PostHog a fast-growing segment, and 3 ways to fix them. By Jon Martin."

## Design System

**Hybrid approach — Jon's portfolio layout + PostHog brand accents:**

- Typography: DM Serif Display for headings, Geist Sans for body (matches portfolio)
- Primary accent: PostHog blue `#2563eb`
- Secondary accent: Jon's coastal teal (subtle, backgrounds only)
- Dark text: `#111827`
- Backgrounds: White with subtle gray sections for visual rhythm
- Dark mode: Support it since the portfolio already does

## Page Sections (top to bottom)

### 1. Minimal Header

- Top left: "Jon Martin — Product Analysis"
- Top right: Subtle link to `portfolio.jonnymartin.blog`
- No main site nav, no hamburger menu
- Thin PostHog blue accent line at very top of page (4px)

### 2. Hero

- Large headline: "PostHog Onboarding for Solo Builders"
- Subtitle: "The Missing Activation Path"
- Date and author line: "April 2026 — Jon Martin"
- Clean, editorial. No background image or illustration. Let the typography breathe.

### 3. Executive Summary

- 3-4 sentence hook paragraph from the work product
- Key stat callout: something like "PostHog replaces 8+ tools for solo builders — but the onboarding assumes you have a team"
- Styled as a slightly indented/bordered pull quote or callout box

### 4. Why Listen to Me

- Compact credibility card, not a resume dump
- Jon's name and one-liner: "Product manager and founder. Daily PostHog power user."
- Three horizontal stat badges:
  - "15+ years shipping products"
  - "150 beta members tracked in PostHog"
  - "5 products built solo with AI"
- Subtle background, rounded corners. Not flashy.

### 5. The 3 Activation Walls (Interactive)

**Funnel visualization:**
- Horizontal animated funnel showing the solo builder journey:
  - Stage 1: "SDK Installed" (wide, full color)
  - Stage 2: "Events Designed" (narrower, drop-off)
  - Stage 3: "Dashboards Built" (narrower still)
  - Stage 4: "Full Platform Adopted" (narrowest)
- Each gap between stages represents a "wall"
- Animate on scroll — funnel narrows as user scrolls into view
- Drop-off labels at each gap (directional, not fabricated percentages — e.g., "Most solo builders stall here")

**Wall detail cards:**
- Three cards below the funnel, one per wall
- Each card has: number, title, 2-3 sentence description, a real user quote (from G2/GitHub research)
- Cards animate in staggered on scroll (framer-motion)
- Wall 1: Event Design Paralysis
- Wall 2: Dashboard Cold Start
- Wall 3: Feature Discovery Lag

### 6. The 3 Recommendations (Interactive)

- Three cards in a row (stack on mobile)
- Each card shows: number, title, short description
- On click/tap, card expands to reveal full recommendation detail
- Visual element per card:
  - Card 1 (Solo Builder Template): Mini illustration/icon of a pre-built dashboard
  - Card 2 (Progressive Unlocking): Simple timeline showing milestones (1K events -> Session Replay, first funnel -> Feature Flags, 7 days data -> Experiments)
  - Card 3 (Max AI as Co-Analyst): Example prompt bubbles ("What's my D7 retention?" / "Why did signups drop Tuesday?")
- PostHog blue accent on active/expanded card

### 7. Closing CTA

- Brief paragraph: "Happy to walk through the data behind these recommendations."
- No "hire me" language. Peer offering insight.
- Subtle contact link or just let the LinkedIn conversation continue

## Technical Implementation

- **Single page component:** `src/app/posthog/page.tsx` with sub-components for each section
- **Animations:** Framer Motion (already installed) for scroll-triggered reveals and card expansions
- **Funnel diagram:** CSS + SVG, no charting library
- **Responsive:** Mobile-first. James may open on phone from LinkedIn notification.
- **No new dependencies.** Tailwind + Framer Motion + SVG covers everything.
- **Content:** All hardcoded in the component. No CMS, no data fetching, no API calls.
- **Performance:** Static page, no client-side data loading. Should be near-instant.

## Component Structure

```
src/app/posthog/
  page.tsx              — metadata + page layout
  components/
    PostHogHeader.tsx    — minimal header with accent line
    Hero.tsx             — headline, subtitle, author
    ExecSummary.tsx      — summary callout
    CredibilityCard.tsx  — "Why Listen to Me" section
    ActivationFunnel.tsx — animated SVG funnel
    WallCard.tsx         — individual wall detail card
    RecommendationCard.tsx — expandable recommendation card
    ClosingCTA.tsx       — closing paragraph
```

## Content (hardcoded)

All content comes from the work product already generated in this conversation. No new content creation needed — just formatting what exists into the component structure.

## What This Is NOT

- Not a blog post (no comments, no tags, no related posts)
- Not a case study (no process documentation)
- Not a full product spec (no PRD, no user stories, no roadmap)
- It's a polished product analysis designed to impress one person and earn a conversation

## Success Criteria

- James Hawkins clicks the LinkedIn link and reads the full page
- The page demonstrates both product thinking (the analysis) and technical skill (the build quality)
- The interactive elements add clarity, not complexity — they help tell the story
- Loads fast on mobile
- Looks polished enough that James might forward it to his team
