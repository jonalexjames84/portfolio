# Prototype Prompt Template

After completing your 1-pager work product, use this prompt to generate a clickable prototype of your key recommendation. A working prototype turns your written analysis into something a hiring manager can click through -- it demonstrates execution ability, not just strategic thinking.

**Time budget:** ~30 minutes of iteration. Do not over-invest. The prototype supports the 1-pager; it is not the main deliverable.

**Tools:** Paste the prompt below into any of these:
- **Claude Code** (best for complex interactions, API mockups)
- **Lovable** (best for polished UI, fast iteration)
- **v0 by Vercel** (best for component-level prototypes)
- **Bolt** (good for full-stack mockups)
- **Replit** (good for data-heavy prototypes)

---

## The Prompt

Copy everything between the `---` markers. Fill in the bracketed sections.

---

Build a clickable prototype for [Company Name]'s [product area].

Context: I'm interviewing for [role title] at [Company Name] and created a product analysis with these recommendations:
1. [Recommendation 1 - the one to prototype. Be specific: what does it do, who is it for, what problem does it solve?]
2. [Recommendation 2 - brief description]
3. [Recommendation 3 - brief description]

Build an interactive prototype of recommendation #1.

**User flow:**
- [Step 1: What the user sees first, e.g., "Dashboard showing invoice status with a new 'Smart Reminders' panel"]
- [Step 2: What the user clicks/does, e.g., "User clicks 'Configure Reminders' and sees a setup wizard"]
- [Step 3: The key interaction, e.g., "User sets reminder rules based on invoice age and amount, sees preview of reminder email"]
- [Step 4: The outcome, e.g., "Confirmation screen showing projected impact: '34% fewer late payments based on your invoice history'"]

**Screens needed:**
1. [Screen 1 name and what it shows]
2. [Screen 2 name and what it shows]
3. [Screen 3 name and what it shows]

**Design requirements:**
- Match [Company Name]'s design language. Their brand colors are [colors if known, or "look up their website"]. Their UI style is [clean/dense/playful/enterprise -- describe what you see on their product].
- Use their typography style (serif/sans-serif, weight, spacing)
- Navigation should feel like it belongs inside their existing product
- Include realistic dummy data that matches their domain (e.g., real-sounding company names for a B2B product, realistic dollar amounts for a fintech product)

**Tech stack:** Use React and Tailwind CSS.

**Priority:** Looking real > being complete. This is for a job application, not production. Focus on:
1. The main happy path working end-to-end
2. Realistic-looking data and UI polish
3. One or two micro-interactions that feel premium (hover states, transitions)

Do NOT build:
- Authentication or login flows
- Backend logic (mock all data)
- Edge cases or error states
- Mobile responsiveness (desktop only is fine)

---

## After Generation: Iteration Checklist

Spend your remaining time on these, in order:

1. **Does it look like it belongs in their product?** If not, adjust colors, typography, spacing.
2. **Does the main flow work end-to-end?** Click through every step. Fix broken navigation.
3. **Is the dummy data realistic?** Replace "Lorem ipsum" and "Company A" with domain-appropriate examples.
4. **One polish pass:** Add one hover state, one transition, or one data visualization that makes it feel premium.
5. **Screenshot or deploy:** Take 2-3 screenshots for your work product doc, or deploy to Vercel/Netlify for a live link.

## How to Include in Your Work Product

**Option A: Live link (preferred)**
Deploy to Vercel or Netlify (free). Include the URL in your work product under recommendations:
"I prototyped this recommendation: [link]. It demonstrates the core user flow for [feature]."

**Option B: Screenshots**
Take 2-3 screenshots of the key screens. Include them in your work product doc with captions explaining the flow.

**Option C: Screen recording**
Record a 30-60 second walkthrough using macOS screen recording (Cmd+Shift+5) or Loom. Attach the video link.

## Example: Completed Prompt (for reference)

```
Build a clickable prototype for Stripe's Billing product area.

Context: I'm interviewing for Senior PM, Billing at Stripe and created
a product analysis with these recommendations:
1. Smart Invoice Reminders -- automated, ML-powered reminder sequences
   that adapt timing and tone based on customer payment history, reducing
   late payments by an estimated 20-30%.
2. Invoice Analytics Dashboard -- consolidated view of payment health
   metrics for finance teams.
3. Multi-currency autopay -- let customers set up autopay in their
   preferred currency with automatic FX handling.

Build an interactive prototype of recommendation #1.

User flow:
- Step 1: Billing dashboard showing invoice list with a new "Reminders"
  column showing status (Active, Paused, Not Set Up)
- Step 2: User clicks "Configure" on an invoice and sees reminder
  settings: timing (days before due, days after due), tone (friendly,
  firm, final notice), channel (email, SMS)
- Step 3: User sees a preview of each reminder in the sequence with
  predicted send dates based on the invoice's due date
- Step 4: Confirmation with projected impact: "Based on this customer's
  payment history, reminders are predicted to reduce late payment by 4 days"

Screens needed:
1. Invoice list with Reminders column integrated
2. Reminder configuration panel (slide-out or modal)
3. Reminder preview showing the full sequence
4. Confirmation with impact projection

Design requirements:
- Match Stripe's design language: clean, lots of white space, purple
  accents (#635BFF), SF Pro or Inter font, subtle shadows
- Dense but readable data tables (Stripe's signature style)
- Include realistic invoice data: company names like "Acme Corp,"
  "TechStart Inc," amounts between $500-$50,000

Tech stack: React and Tailwind CSS.

Priority: Looking real > being complete.
```

## Common Mistakes to Avoid

- **Over-building:** You need 3-4 screens, not 15. Stop at the happy path.
- **Wrong fidelity:** This should look like a real product, not a wireframe. Use colors, real text, realistic data.
- **Ignoring their design language:** A prototype that looks nothing like their product undermines the point. Spend 5 minutes on their website first.
- **No context in the prompt:** The more specific you are about the user flow, the better the output. Vague prompts produce vague prototypes.
- **Spending more than 30 minutes:** Diminishing returns. Ship it and move on.
