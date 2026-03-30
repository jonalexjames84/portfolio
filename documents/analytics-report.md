# Portfolio Analytics Report

**Site:** portfolio.jonnymartin.blog
**Date:** March 30, 2026
**Report Type:** Analytics Audit + Conversion Optimization

---

## 1. Current Analytics Setup

### What Is Tracked

PostHog is installed via `PostHogProvider.tsx` with the following configuration:

- **Manual pageview capture** (`capture_pageview: false`) -- good practice for Next.js SPA-style navigation. Pageviews are fired on every route change via `useEffect` on `pathname` and `searchParams`.
- **Page leave tracking** (`capture_pageleave: true`) -- captures when users navigate away.
- **Person profiles** set to `identified_only` -- anonymous visitors are not profiled, which means cohort analysis is limited to identified users only.

### What Is NOT Tracked (Critical Gaps)

The site has **zero custom event tracking**. The only `posthog.capture()` call in the entire codebase is the standard `$pageview`. This means the following high-value recruiter actions are invisible:

| Action | Component | Tracked? |
|--------|-----------|----------|
| Resume PDF download | `/api/resume` link on Experience page | NO |
| Calendly link click | Contact page "Schedule a Call" link | NO |
| Contact form submission | Formspree form on Contact page | NO |
| LinkedIn click | Contact page link | NO |
| GitHub click | Contact page link | NO |
| Substack click | Contact page link | NO |
| Floating "Let's Talk" CTA click | FloatingCTA component | NO |
| Blog post read depth/scroll | Blog post pages | NO |
| Work project card clicks | Work page ProjectCards | NO |

### Existing Dashboard

There is a built-in dashboard at `/dashboard` that queries PostHog via a server-side API route (`/api/dashboard/posthog`). It already tracks:

- Page views over time (total + unique sessions)
- Traffic sources (by `$referring_domain`)
- Top pages (by `$pathname`)
- Device breakdown (mobile/desktop/tablet)

This dashboard is functional but only shows aggregate pageview data -- it cannot answer conversion questions like "are recruiters reaching the contact page?" or "how many people downloaded the resume?"

---

## 2. Traffic Overview (What the Data Can Tell Us)

Based on the dashboard API queries, the site tracks:

- **Total pageviews** and **unique visitors** (session-based) over configurable date ranges
- **Traffic sources** bucketed into Direct, Google, LinkedIn, Meta, X/Twitter, and other referrers
- **Top pages by views** broken down by pathname
- **Device types** (Desktop, Mobile, Tablet)

### Site Structure (Pages Available for Analysis)

| Page | Path | Purpose |
|------|------|---------|
| Home | `/` | Hero + intro, first impression |
| Work | `/work` | Project portfolio (case studies) |
| Work Detail | `/work/[slug]` | Individual project deep dives |
| Experience | `/experience` | Career timeline + resume download |
| Blog | `/blog` | Blog listing (35+ posts) |
| Blog Post | `/blog/[slug]` | Individual articles |
| About | `/about` | Personal story |
| Vibe Stack | `/vibe-stack` | Tech stack showcase |
| Contact | `/contact` | Contact form + Calendly + social links |
| Workflow | `/workflow` | AI workflow diagrams |

---

## 3. Conversion Analysis

### The Recruiter Funnel (Theoretical)

The ideal recruiter journey is:

```
Landing (Home/Blog/Work) --> Explore (About/Experience/Work) --> Convert (Contact/Calendly/Resume)
```

**Current ability to measure this funnel: MINIMAL**

- We CAN see if visitors reach `/contact` (via pageview data)
- We CANNOT tell if they clicked "Schedule a Call" on Calendly
- We CANNOT tell if they downloaded the resume PDF
- We CANNOT tell if they submitted the contact form
- We CANNOT distinguish recruiters from casual visitors

### Key Conversion Points (Unmeasured)

1. **Resume download** (`/api/resume`) -- This is the single most important recruiter action. An `<a>` tag links to `/api/resume` on the Experience page, but no click event is captured.

2. **Calendly booking** (`calendly.com/jonalexjames/30min`) -- The contact page links externally to Calendly. There is also a `CalendlyEmbed` component, but clicks on the external link are not tracked.

3. **Contact form submission** -- The form POSTs to Formspree (`formspree.io/f/xojnywrp`). There is no `onSubmit` handler that fires a PostHog event.

4. **Floating CTA** -- The "Let's Talk" button appears on every page after 300px scroll. No click tracking.

---

## 4. Content Performance (What We Can Infer)

### Blog Content (35+ posts)

The blog covers a strong range of topics for the PM job search:

**AI/Product Leadership** (likely highest traffic from search/social):
- "Aakash Gupta: AI-Powered PM" (conference recap)
- "Managing Agents is the New Core Skill"
- "Speed is the Strategy"
- "The Death of the 5-Year Roadmap"
- "Why Hybrids Win"
- "Answer Engine Optimization"

**Personal/Career Narrative** (recruiter-relevant):
- "How I Prepare for PM Interviews"
- "The Anti-Resume"
- "Build First, Title Second"
- "Product-Team Fit"
- "From Skeptic to Vibe Coder"

**Personal Brand/Life** (audience building):
- "Finances and Mental Health"
- "From Anxious to Excited"
- "Empty the Cup"

Without custom event data, we cannot determine which posts drive the most engagement beyond raw pageviews. Critically, we cannot measure which blog posts lead to contact page visits or resume downloads.

---

## 5. Recommendations

### Priority 1: Add Custom Event Tracking (Immediate)

Add these PostHog events to measure recruiter conversion. Implementation requires adding `posthog.capture()` calls to the relevant components:

```typescript
// Resume download -- Experience page
posthog.capture('resume_downloaded', { source: 'experience_page' })

// Calendly click -- Contact page
posthog.capture('calendly_clicked', { source: 'contact_page' })

// Contact form submitted -- Contact page
posthog.capture('contact_form_submitted')

// Floating CTA clicked -- FloatingCTA component
posthog.capture('cta_clicked', { source: 'floating_cta', page: pathname })

// External link clicks -- Contact page social links
posthog.capture('external_link_clicked', {
  destination: 'linkedin' | 'github' | 'substack',
  source: 'contact_page'
})

// Work project viewed
posthog.capture('project_viewed', { project: slug })
```

### Priority 2: Build a Recruiter Conversion Funnel

Once custom events are in place, create a PostHog funnel:

1. **Step 1:** `$pageview` (any page -- entry)
2. **Step 2:** `$pageview` where `$pathname` contains `/about` OR `/experience` OR `/work`
3. **Step 3:** `$pageview` where `$pathname` = `/contact`
4. **Step 4:** `resume_downloaded` OR `calendly_clicked` OR `contact_form_submitted`

This will tell you exactly what percentage of visitors are converting to recruiter actions.

### Priority 3: Track UTM Parameters

When sharing the portfolio link on LinkedIn, in applications, or in emails, use UTM parameters:

```
https://portfolio.jonnymartin.blog?utm_source=linkedin&utm_medium=profile&utm_campaign=job_search
https://portfolio.jonnymartin.blog?utm_source=email&utm_medium=application&utm_campaign=company_name
```

PostHog automatically captures UTM parameters. This will let you see which channels drive the most recruiter traffic.

### Priority 4: Enable Person Profiles for All Visitors

The current config uses `person_profiles: "identified_only"`. Changing to `"always"` would allow:

- Session replay for anonymous visitors
- Cohort analysis of all visitors
- Better funnel attribution

Trade-off: slightly higher PostHog usage/costs.

### Priority 5: Add Blog Engagement Tracking

For blog posts, track:

```typescript
// Scroll depth (25%, 50%, 75%, 100%)
posthog.capture('blog_scroll_depth', { slug, depth: '50%' })

// Time on page (10s, 30s, 60s, 120s thresholds)
posthog.capture('blog_engaged_read', { slug, seconds: 60 })
```

This will show which posts actually get read vs. bounced, which is far more valuable than raw pageviews.

### Priority 6: Improve the Existing Dashboard

The `/dashboard` page already has the infrastructure. Extend it to show:

- Recruiter funnel conversion rates
- Resume download count
- Calendly click count
- Contact form submissions
- Top blog posts by engagement (not just views)
- Traffic source to conversion correlation

---

## 6. Quick Wins for Recruiter Conversion

Beyond analytics, based on the site audit:

1. **Add resume download to more pages** -- Currently only on `/experience`. Add it to the homepage hero and the contact page.

2. **Track the Formspree redirect** -- Add an `onSubmit` handler to the contact form that fires a PostHog event before the form POSTs to Formspree.

3. **Add a "View Resume" CTA to blog posts** -- High-traffic blog posts about PM skills should funnel to the resume/contact page.

4. **Use PostHog's autocapture** -- Consider enabling autocapture alongside manual pageviews. This would automatically track all clicks, including the Calendly link, resume download, and social links, without code changes.

---

## 7. Summary

| Area | Status | Action Needed |
|------|--------|---------------|
| Pageview tracking | Working | None |
| Page leave tracking | Working | None |
| Traffic source tracking | Working (via dashboard) | Add UTM discipline |
| Custom conversion events | NOT IMPLEMENTED | Add 6-8 key events |
| Recruiter funnel | NOT MEASURABLE | Build after events added |
| Blog engagement | Pageviews only | Add scroll/time tracking |
| Resume download tracking | NOT TRACKED | High priority |
| Calendly click tracking | NOT TRACKED | High priority |
| Contact form tracking | NOT TRACKED | High priority |
| Session replay | Disabled for anonymous | Consider enabling |

**Bottom line:** The analytics infrastructure is solid (PostHog is correctly installed, the dashboard API is well-built), but the site is only measuring traffic volume, not recruiter conversion. Adding 6-8 custom events would transform the data from "how many people visited" to "how many recruiters took action" -- which is the metric that actually matters for the job search.

---

*Report generated March 30, 2026. PostHog MCP direct query access was unavailable during this session; analysis is based on codebase audit of the analytics implementation, dashboard API, and site structure.*
