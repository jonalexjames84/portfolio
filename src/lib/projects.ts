export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  pitch: string;
  problem: string;
  tags: string[];
  stack: string[];
  featured: boolean;
  category: "software" | "design";
  liveUrl?: string;
  deliverables?: string[];
  repos?: { name: string; role: string }[];
  highlights: string[];
  outcomes: string[];
  decisions: string[];
  teamContext: string;
  userResearch: string[];
  failures: string[];
  strategy: string;
  screenshot?: string;
  cardImage?: string;
  screenshots?: string[];
  callout?: string;
  metrics?: { value: string; label: string }[];
  strategyPoints?: { label: string; text: string }[];
  features?: {
    title: string;
    description: string;
    screenshots: string[];
  }[];
};

export const projects: Project[] = [
  {
    slug: "memorang-pm-os",
    title: "An AI Operating System for a PM Job",
    subtitle: "51 Claude Code Skills, Nightly Automation, and a Quality Gate",
    description:
      "As founding technical PM at an AI edtech infrastructure company, I built the system that ran my own job. A library of 51 Claude Code skills encoded how the company actually works — how tickets get scoped, how PRDs get written, how status gets reported — so the standards executed themselves instead of living in my head. On top of it: nightly automation that assembled tomorrow's status before I opened my laptop, and a human-in-the-loop gate that graded every outbound write before it landed.",
    pitch:
      "Most PMs carry their operating standards in their head and re-apply them by hand, inconsistently, under deadline pressure. I encoded mine as executable skills. Fifty-one of them, covering scoping, PRD drafting, ticket hygiene, meeting notes, launch readiness, and status reporting — each one a written standard that an agent follows the same way every time. Ninety-four memory files held the company context the skills needed: the glossary, the delivery norms, the named anti-patterns, the corrections I'd been given. The result was a job that got more consistent as it got busier, not less.",
    problem:
      "I joined a company running four concurrent customer launches with overwhelming inbound demand and a small shared engineering bench. The failure mode of that environment is well known: standards erode under load, status goes stale, and the PM becomes a passthrough who relays information without adding judgment. Writing the standards down in a doc doesn't fix it, because nobody reads docs at 6pm on a launch week.",
    tags: ["AI Tooling", "Claude Code", "Agentic Workflows", "Internal Tools"],
    stack: [
      "Claude Code",
      "Node.js",
      "TypeScript",
      "launchd",
      "MCP",
    ],
    featured: true,
    callout: "51 skills · 94 memory files · Nightly automation · Quality gate",
    category: "software",
    metrics: [
      { value: "51", label: "Claude Code Skills" },
      { value: "94", label: "Context Memory Files" },
      { value: "7pm", label: "Nightly Status Job" },
    ],
    highlights: [],
    outcomes: [
      "Authored 51 Claude Code skills encoding the company's operating standards — scoping and minimum-feasible-version discipline, PRD drafting, ticket structure, meeting notes, launch readiness, and status reporting — so each one executed identically every time instead of depending on my attention that day",
      "Built a 94-file memory layer holding company context an agent needs to be useful: product glossary, delivery norms, communication standards, and every correction I'd received, so mistakes were made once rather than repeatedly",
      "Shipped a nightly automation job that pulled the last 72 hours of ticket activity across every active launch, bucketed it into completed / blockers / open questions / next steps, and wrote it to a private page before the morning standup",
      "Built the WWYD Gate: a pre-write hook that intercepts every agent write to the ticket tracker, docs, and chat, grades the payload against a written quality rubric, and holds it in a review dashboard for approval or rejection with a fix prompt returned to the terminal",
    ],
    decisions: [
      "Made the quality gate fail-open rather than fail-closed. If the grading server isn't running, writes proceed normally. A safety system that blocks work when it breaks gets disabled within a week, and a disabled gate protects nothing",
      "Kept the whole system files-first rather than building it inside the company's own tools. During the volatile early weeks the information architecture changed constantly, and restructuring with mv and grep beat migrating a schema every time",
      "Made the agent read-only against the ticket tracker after an early scare. It drafts tickets for me to file myself. The cost is a few minutes of copying; the benefit is that no automated system can corrupt the team's shared source of truth",
      "Kept my private daily brief entirely local with no sync to the company workspace. Mirroring unfiltered working notes into a space where leadership browses is a bell you can't un-ring, and I hadn't yet learned the etiquette",
    ],
    teamContext:
      "Built solo, as the founding technical PM reporting directly to the founder. The company ran distributed across two continents with two daily overlap windows, which meant most coordination was asynchronous and most status had to be assembled rather than asked for.",
    userResearch: [
      "The system's design came from observing my own failure modes first: two specific misses in the first six weeks (a triage doc that went stale, and client feedback I caught a day late) defined exactly which lane needed automation",
      "Skills were written after being corrected, not before. Each correction from the founder became a written rule, which is why the library reflects how the company actually operated rather than how a generic PM playbook says it should",
    ],
    failures: [
      "My first instinct was to automate the daily status into a cloud-scheduled agent. It couldn't reach local files, and pushing the repo to the cloud to fix that would have reintroduced the exact privacy problem I'd already decided against. I rebuilt it as a local scheduled job instead",
      "The first version of the automation pulled ticket data with archived items included by default. It surfaced stale, closed work as live blockers and badly miscounted an entire project's status. I now verify every count against the live source before trusting a generated snapshot",
    ],
    strategy:
      "The premise is that a PM's real product is judgment applied consistently, and consistency is exactly what degrades under load. So rather than trying to be more disciplined, I made the discipline executable. Standards became skills, context became memory, status became automation, and quality became a gate. The system was designed to be most useful precisely when I had the least attention to give it.",
    strategyPoints: [
      { label: "Standards as Code", text: "51 skills encoding how work actually gets scoped, written, and reported — executed identically every time rather than reconstructed from memory." },
      { label: "Context Layer", text: "94 memory files holding glossary, norms, and every correction received, so the same mistake isn't made twice." },
      { label: "Push, Not Pull", text: "A nightly job assembles tomorrow's status before the day starts, instead of requiring me to go ask four systems what happened." },
      { label: "Fail-Open Gate", text: "Every outbound write graded against a rubric and held for approval — but writes proceed normally if the gate is down, so it never blocks real work." },
    ],
  },
  {
    slug: "memorang-launch-program",
    title: "Four Launches, One Engineering Bench",
    subtitle: "Prioritization Frameworks for a Capacity-Constrained Program",
    description:
      "Four white-label learning apps, built for global testing and credentialing organizations, all targeting launch inside the same nine-week window — against one shared QA owner and an engineering bench split across every project. I owned launch readiness across the portfolio: the frameworks that decided what got built, the dashboards that made delivery state legible, and the analysis that identified what was actually blocking us.",
    pitch:
      "When four launches converge on one date and no project has dedicated capacity, the real work isn't tracking status. It's deciding what not to do, out loud, and being right often enough that people trust the call. I authored two frameworks for that: a Launch Gate that resolves any single piece of work in four questions, and a WSJF-light stack rank for allocating the next free engineer. Then I built the reporting surfaces that showed whether the calls were working.",
    problem:
      "Four customer programs, each proving a different layer of the platform to a different marquee partner, all with binding or near-binding dates in the same window. The bottleneck wasn't any individual project's backlog. It was that the same handful of people appeared on all four critical paths simultaneously, and no surface in the company made that visible until a date was already at risk.",
    tags: ["Program Management", "Prioritization", "Launch Readiness", "Edtech"],
    stack: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind",
      "Linear / Notion",
    ],
    featured: true,
    callout: "4 concurrent launches · 9-week window · Shared QA bench",
    category: "software",
    metrics: [
      { value: "4", label: "Concurrent Launches" },
      { value: "8M+", label: "Annual Test-Takers" },
      { value: "9wk", label: "Convergent Window" },
    ],
    highlights: [],
    outcomes: [
      "Authored the Launch Gate, a four-question decision rule that resolves any ticket, request, or 'should I do this' by stopping at the first yes — signed and date-binding beats strategic and unsigned, every time, until the contract closes",
      "Built a WSJF-light stack rank for allocating the next free engineer across the portfolio, using open-issue count as an effort proxy and flagging that proxy as a data gap rather than hiding it",
      "Shipped a QA/UAT program dashboard: a portfolio overview with a health pill and top risk per launch, drilling into a client-facing swim-lane board that showed partners what was in our inbox, in flight, and resolved",
      "Ran the capacity analysis that identified the actual constraint — one QA owner carrying the sign-off pass on three launches inside the same nine-day window, plus two engineers split across two-plus projects each — and reframed the conversation from per-project status to shared-bench sequencing",
      "Consolidated cross-project delivery hygiene into batch fixes after finding the same three gaps repeating on every launch, so nine separate to-dos collapsed into three",
    ],
    decisions: [
      "Published the WSJF ranking with an explicit warning that it was wrong in one specific way: the formula rewards 'cheapest to finish,' which floated a nearly-done project above the flagship launch with the nearest binding date. Naming the flaw made the framework usable; hiding it would have made it a liability the first time someone followed it off a cliff",
      "Overrode the ranking with the Launch Gate where a date was genuinely immovable, and said so in writing. A prioritization framework that can't be overridden by judgment is a bureaucracy, not a tool",
      "Designed the QA dashboard to read from agent-refreshed snapshot files rather than a live API. Snapshots meant a partner-facing board could never surface a half-written ticket, and refreshing was a deliberate act with a human in the loop",
      "Kept the dashboard local-only and declined to deploy it, because the same view that made delivery legible internally also aggregated information that should not sit behind a shareable URL",
      "Logged client-owned blockers as tracked dependencies with an internal chaser assigned, rather than leaving them as verbal 'waiting on the customer.' It made the board honest about who the action was actually on",
    ],
    teamContext:
      "Founding technical PM, reporting directly to the founder. I owned launch readiness across the portfolio while individual launches had their own engineering leads; my lane was the seam between them — sequencing, cross-project dependencies, and the reporting that made the whole program legible at once.",
    userResearch: [
      "Read the same three hygiene gaps — stale status updates, unreconciled launch dates, and unassigned client-decision tickets — repeating across all four launches, which reframed them as one systemic problem rather than twelve individual ones",
      "Traced a launch date that read as three different values across three systems, which is the clearest possible signal that no one had a shared definition of 'done'",
      "Found that severity labels had stopped being meaningful because the team had been asked to stop over-flagging, so most real bugs sat at no priority. Any dashboard inferring severity from labels alone would have been confidently wrong",
    ],
    failures: [
      "My first portfolio snapshot pulled ticket data with archived items included, which surfaced closed work as live P0s and inflated one project's untriaged count by an order of magnitude. Shipping a wrong number to a stakeholder costs more trust than shipping no number, so verification against the live source became a hard step",
      "I initially built per-project status views, which is the intuitive structure and the wrong one. It made every project look independently manageable and completely hid the shared-capacity constraint that was the actual risk",
    ],
    strategy:
      "A portfolio of launches converging on one window is not four projects. It's one capacity problem wearing four costumes. The frameworks existed to make tradeoffs decidable in the moment rather than escalated, and the dashboards existed to make the shared constraint visible before it became a missed date. Both were built so that the person who disagreed with a call could see exactly what reasoning produced it.",
    strategyPoints: [
      { label: "Launch Gate", text: "Four questions, stop at the first yes. Signed and date-binding beats strategic and unsigned until the contract closes." },
      { label: "WSJF-Light", text: "A stack rank for the next free engineer, published with its own known flaw stated up front." },
      { label: "Legible Delivery", text: "A program overview drilling into per-launch swim lanes, built so a partner could read it without translation." },
      { label: "Find the Real Constraint", text: "Per-project views hid the shared bench. Portfolio-level analysis found the one person on three critical paths." },
    ],
  },
  {
    slug: "memorang-prototypes",
    title: "Prototypes as Specs",
    subtitle: "Clickable Builds That Replaced Written Handoffs",
    description:
      "At an AI edtech company running a POC-driven engineering culture, I built prototypes instead of writing specs. A clickable user-acceptance-testing app that let partners review flows before engineering hardened them, a self-service client onboarding portal targeting the slowest step in every launch, a CMS concept, an end-to-end test suite, and an access-gated roadmap viewer. Each one was simultaneously a demo, an alignment artifact, and a living engineering spec.",
    pitch:
      "A written spec describes an experience. A prototype is one. In a culture where sprint plans reliably got blown up by day four and the standard was 'time-box a POC and see how far you get by 5pm,' the fastest path to alignment was building the thing at low fidelity and putting it in front of people. I shipped five of them across UAT review, client onboarding, content management, testing, and roadmap communication.",
    problem:
      "Handoff documents were losing to reality. Design specs ran to dozens of screens that were mostly responsive variants and state permutations of the same surface, so engineers had to reverse-engineer the actual architecture from a flat screen list. Meanwhile the single slowest step in every customer launch was client onboarding — work that sat open for months, almost all of it blocked on a customer handing over usable files with no way to know they were wrong until someone manually checked.",
    tags: ["Prototyping", "React", "Design Systems", "Multi-Tenant"],
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind 4",
      "Playwright",
      "Supabase",
    ],
    featured: false,
    callout: "5 prototypes · 38-screen spec → 6 routed surfaces",
    category: "software",
    metrics: [
      { value: "5", label: "Prototypes Shipped" },
      { value: "38→6", label: "Screens to Routes" },
      { value: "3", label: "Tenant Skins" },
    ],
    highlights: [],
    outcomes: [
      "Built a clickable UAT prototype that collapsed a 38-screen design spec into 6 routed surfaces plus one polymorphic test player, after recognizing that roughly half the 'screens' were responsive variants, component state matrices, or in-session states of the same shell",
      "Implemented multi-tenant theming as a CSS-variable swap on a single theme provider rather than parallel route trees, so three customer brand skins shared one codebase",
      "Shipped a self-service client onboarding portal prototype targeting the un-built depth of an in-flight initiative: content-completeness validation at submit time, self-serve DNS with live verification, and a 'what good looks like' exemplar layer",
      "Built a Playwright end-to-end suite covering authenticated smoke paths and core user flows for one of the launch apps",
      "Shipped an access-gated roadmap viewer behind magic-link auth with an email allowlist, served no-index and no-store so an internal planning artifact could be shared with named people without becoming a public URL",
    ],
    decisions: [
      "Shipped one clickable golden path end to end before building any breadth. It exercised every architectural seam — router, shell, modal, polymorphic player, results — without exhausting the question-format permutations, which meant the structure was reviewable days earlier",
      "Treated the test player as one route and one component with three swappable subsystems, rather than the twenty-odd screens the spec implied. The spec itself had named the shared-shell pattern; the screen list just obscured it",
      "Built the onboarding portal to deliberately target what the existing initiative had not built, rather than rebuilding what shipped. A prototype that duplicates working software teaches nothing",
      "Kept prototypes at scripted fidelity with canned fixtures and no real parsing. The question they had to answer was 'is this the right experience,' and real data pipelines would have delayed that answer by weeks",
      "Kept prototype work out of the formal spec process entirely. The canonical requirements doc already existed; adding a parallel design doc for a two-day build would have been ceremony, not clarity",
    ],
    teamContext:
      "Built solo as founding technical PM, inside an engineering culture that explicitly favored many small POCs over sprint planning, on the reasoning that AI capability was shifting faster than a two-week plan could survive. Prototypes fed the hardening process rather than replacing it.",
    userResearch: [
      "Audited why client onboarding was the slowest workstream and found the work sat open for months across customers, nearly always blocked on the client handing over unusable files with no validation until manual review",
      "Reviewed the existing onboarding initiative's shipped phases before designing, specifically to find the gaps rather than duplicate the working parts",
      "Learned to trust design screenshots over exported PDFs after PDF exports repeatedly showed wrong brand palettes and dropped content",
    ],
    failures: [
      "I initially read the 38-screen spec literally and started scaffolding toward that count. Recognizing that half of them were variants of one shell saved a large amount of work, but I should have found the pattern in the first read rather than the second",
    ],
    strategy:
      "In a POC-driven culture, the artifact that moves a decision is the one people can click. Every prototype was scoped to answer one question fast and cheaply, at whatever fidelity that question required — which was almost always lower than it felt like it should be. The prototypes then survived as living specs, because an engineer reading working code learns more than an engineer reading a document about code.",
    strategyPoints: [
      { label: "Golden Path First", text: "One end-to-end flow before any breadth, so every architectural seam is reviewable within days." },
      { label: "Find the Real Surface", text: "38 spec screens collapsed to 6 routes plus one polymorphic player once variants and state matrices were separated out." },
      { label: "Target the Gap", text: "The onboarding portal built only what the shipped initiative hadn't, rather than duplicating working software." },
      { label: "Fidelity to Fit", text: "Canned fixtures, no real parsing. The question was whether the experience was right, not whether the pipeline worked." },
    ],
  },
  {
    slug: "memorang-curriculum-model",
    title: "The Learner Curriculum Model",
    subtitle: "Product Design for High-Stakes Test Prep",
    description:
      "Every test-prep program the company launched shared one underlying learning model: a short diagnostic that places the learner, a study pack that teaches daily, and full-length practice tests that benchmark readiness. I defined and documented that model as the canonical product spec across programs, including the single design call that mattered most — that studying and testing must feel like different products.",
    pitch:
      "When you're launching four test-prep apps for different exams on the same platform, the temptation is to treat each as bespoke. The better move is to find the one model underneath all of them and make the items the only thing that differs. I defined that model: three components, three learner personas with distinct onboarding paths, and one universal core loop that recalibrates until exam day.",
    problem:
      "Test-prep products fail in a specific, repeatable way: they conflate studying with testing. When practice questions carry a timer and a score, learners feel judged during the part that's supposed to teach them. When practice tests offer hints and instant feedback, learners walk into the real exam having never experienced its actual conditions. Both failures come from one screen being ambiguous about which mode it belongs to.",
    tags: ["Product Strategy", "Edtech", "Learning Design", "Assessment"],
    stack: [
      "Knowledge Graphs",
      "Adaptive Selection",
      "Notion",
      "Figma",
    ],
    featured: false,
    callout: "3 components · 3 personas · 1 universal core loop",
    category: "software",
    metrics: [
      { value: "3", label: "Model Components" },
      { value: "3", label: "Onboarding Paths" },
      { value: "8wk", label: "Reference Plan" },
    ],
    highlights: [],
    outcomes: [
      "Defined the canonical three-component model — a ~20-item diagnostic for placement, a study pack sized several times a full test for daily learning, and full-length practice tests for periodic benchmarking — generalized so the same shape held across every exam program",
      "Established the formative/summative split as the highest-leverage design decision: study packs run untimed with immediate per-question feedback, an always-available assistant, adaptive item selection, and per-topic mastery; practice tests run with an enforced exam-matching timer, a fixed form, no assistant until post-test review, and a single score with percentile",
      "Set the hard rule that practice-test items must be disjoint from the study-pack bank, because reusing items turns a readiness benchmark into a memory check",
      "Designed three persona onboarding paths — returning test taker, new test taker with a date, and explorer — each collecting different inputs and routing differently, including skipping the diagnostic entirely when a concrete prior score already exists",
      "Specified the universal core loop and an eight-week reference plan that compresses for shorter timelines, giving every program a default study schedule rather than a blank calendar",
      "Captured the model as a reusable skill so any scoping or design review on any program could be checked against it, rather than relying on the spec being remembered",
    ],
    decisions: [
      "Made 'which mode does this screen belong to' the first question in any design review. Nearly every scoping mistake in test prep traces back to a screen that was ambiguous about whether it was teaching or measuring",
      "Positioned the platform as reorganizing a customer's existing curriculum into a learner-first structure rather than replacing it. Credentialing bodies own their content and their standards; a product that implies otherwise doesn't get bought",
      "Allowed a concrete prior score to skip the diagnostic. Making a returning learner who already knows their band sit through a placement test is friction that buys nothing",
      "Sequenced the content pipeline as import-then-decompose: bring customer lessons in as-is for launch and modernize images without changing intent, then decompose into reusable tagged artifacts afterward. Full knowledge-graph tagging before a binding launch date would have been the wrong trade",
      "Maintained an explicit list of items requiring customer sign-off before scope could lock — diagnostic length and composition, which items are eligible for which component, per-item metadata, and what the session report shows before the paywall",
    ],
    teamContext:
      "Defined as founding technical PM working with the founder and the engineering leads on each program. The model had to serve both the apps under construction and the platform layer underneath, which meant it needed to be specific enough to design against and general enough to survive the next exam program.",
    userResearch: [
      "Mapped three distinct entry states — a returning taker who knows their score, a new taker with a fixed exam date, and an explorer with neither — and found each needs different information collected and a different first session",
      "Identified the session report shown before the paywall as one of the highest-leverage surfaces in the product, since it's where a learner decides whether the assessment understood them",
      "Traced the underlying question behind three separate open design threads across programs and found they were the same one: what does a score mean, and what should the learner do next",
    ],
    failures: [
      "Deep adaptivity and full knowledge-graph tagging were both scoped out of the initial launches. That was the right call against binding dates, but it meant the first releases shipped a simpler item-selection model than the design describes, and I'd rather state that plainly than let the spec imply otherwise",
    ],
    strategy:
      "One learning model, many exams. The components, the personas, and the core loop stay fixed; only the item bank and the exam-specific question types change. That's what makes a fourth program cheaper to launch than the first, and it's the difference between a platform and four bespoke apps that happen to share a login.",
    strategyPoints: [
      { label: "Three Components", text: "Diagnostic places the learner, study pack teaches daily, practice tests benchmark readiness. Same shape across every exam." },
      { label: "Formative vs Summative", text: "Studying and testing must feel like different products. Identify a screen's mode before designing it." },
      { label: "Disjoint Item Banks", text: "Practice-test items never appear in the study pack, or the benchmark measures memory instead of readiness." },
      { label: "Reorganize, Don't Replace", text: "Customers own their curriculum and standards. The platform restructures it into a learner-first system." },
    ],
  },
  {
    slug: "wwe-champions-growth",
    title: "WWE Champions: The First Dollar",
    subtitle: "A Growth Diagnosis From 2,945 Player Reviews and 42 Screens of Firsthand Play",
    screenshot: "/screenshots/wwe-champions-case.jpg",
    screenshots: [
      "/screenshots/wwe-champions-case.jpg",
      "/screenshots/wwe-champions-prototype.jpg",
    ],
    liveUrl: "https://wwe-champions-growth.vercel.app",
    description:
      "An independent growth analysis of WWE Champions, built from a firsthand new-player playthrough and a quantitative read of 2,945 public player reviews. It ships as three linked artifacts: a structured case, a nine-act evidence page where every claim traces to a source, and an interactive wireframe prototype of the three proposed moves with a before/after toggle. Written as preparation for a Senior Growth PM interview, finished as a public case.",
    pitch:
      "ARPDAU has two factors — payers divided by DAU, times ARPPU. On this title ARPPU is at its ceiling and defended, while payer rate has never been worked on. So the opportunity is first-purchase conversion, not extraction and not retention. The evidence sits in two numbers: across 2,945 reviews the word 'fun' appears at essentially the same rate in one-star reviews as in five-star ones, while 'money' is the most-used word in the whole corpus and skews hard negative. The loop is loved and the transaction is hated. And the transaction has almost no bottom rung — the first thing the game asks a new player to buy is a rescue from a defeat.",
    problem:
      "Public evidence on a live mobile game is almost entirely qualitative, and the temptation is to treat loud player complaints as a diagnosis. That produces confident recommendations built on a vocal minority. The harder problem is building an argument that survives contact with internal telemetry you don't have — which means naming, up front, exactly which numbers you are missing and which query would settle each one.",
    tags: ["Growth", "Games", "Data Analysis", "Case Study"],
    stack: [
      "Python",
      "JavaScript",
      "iTunes & Google Play APIs",
      "Vercel",
    ],
    featured: true,
    callout: "2,945 reviews · 42 screens of firsthand play · Case, evidence page, and wireframes",
    category: "software",
    metrics: [
      { value: "2,945", label: "Player Reviews Analyzed" },
      { value: "+$367k", label: "Modeled Annual Lift" },
      { value: "42", label: "Screens of Firsthand Play" },
    ],
    highlights: [],
    outcomes: [
      "Shipped three linked artifacts: a case structured situation → cohort → blockers → priority → programme → tradeoffs → recommendation, a nine-act evidence page, and an interactive wireframe prototype of the three moves with a before/after toggle",
      "Analyzed 2,945 de-duplicated reviews — 474 from the iTunes customer-review feed, 2,471 from Google Play — sampled across newest, highest, lowest, and most-helpful orderings, then ran word frequency, keyword-family reach, and per-rating divergence",
      "Found the argument in two numbers: 'fun' appears at nearly the same rate in 1–2★ reviews as in 4–5★ reviews, a skew of −1.1 points, while 'money' is the corpus's most-used word and skews +26.7. People who don't care about spending don't talk about money",
      "Documented the store shelf from firsthand play: at League 2 it leads with a $99.99 pack and its cheapest item is a $14.99 starter pack on a countdown — three to five times the genre's conventional entry price, with nothing beneath it",
      "Built a transparent ROI model in Python with every input editable in the page. Base case moves ever-pay conversion from 2.00% to 2.80% for +$367k a year and +2.2% ARPDAU, against a retention-led portfolio that scores a bigger revenue number and moves the target metric the wrong way",
    ],
    decisions: [
      "Tagged every claim as verified fact, player-reported signal, or a named data gap requiring internal telemetry. Player sentiment is treated as a hypothesis to validate against funnel and cohort data, never as a measurement",
      "Priced added payers at the marginal converter's 180-day value rather than the incumbent's, because adding a cheap rung raises conversion and lowers average first-purchase value at the same time. Modeling them at the incumbent's value would have flattered the result",
      "Excluded every third-party revenue estimate, because the sources behind them sit behind a login and can't be re-verified. The competitive table is built only on store-API fields that re-fetch in a single call",
      "Shipped the prototype as deliberately low-fidelity wireframes, with the 'before' views as real screenshots shown whole and uncropped. Sequence and layout are the proposal; visual design is explicitly not",
      "Published the model as a model, not a forecast — every input editable in the page and backed by a committed JSON file, so a reader can disagree with an assumption and immediately see what it costs",
    ],
    teamContext:
      "Built solo as interview preparation for a Senior Growth PM role at Scopely, then finished and published as a standalone public case. Not affiliated with or endorsed by Scopely or WWE; screenshots and review text are reproduced for commentary and analysis.",
    userResearch: [
      "A new account was played to League 2 across a firsthand activation session, capturing 42 screenshots of the onboarding and first-purchase window. Every claim in the case cites a specific screen, and captions were re-verified against the images before publishing",
      "Google Play's full rating histogram — 402,333 ratings at 4.36★ against 50M+ installs — is used as the honest denominator. Only 8.1% of raters write text, which is why the written corpus skews negative and is quoted only for what people say, never for how many feel it",
      "Onboarding complaints are just 3% of the corpus, which is expected: players who churn on day one don't come back to write reviews. The cohort this case is about is doubly silent, because nobody writes a review about a purchase they didn't make",
    ],
    failures: [
      "The first version recommended a retention-first portfolio. That portfolio grows revenue by growing DAU — the denominator — so it cannot raise ARPDAU. I rewrote the entire analysis around first-purchase conversion. Converting a non-payer buys you retention; retaining a non-payer does not buy you a payer",
      "An early build claimed the League 2 shelf held only the $99.99 pack. Re-reading the source screenshot turned up a $14.99 starter pack beneath it. One move's modeled lift fell from +0.55 to +0.35 points and the programme's base case from $418k to $367k. The correction is published inside the case rather than quietly patched out",
      "The inherited model's base DAU of 37,395 only reconciled with the revenue figure if it meant DAU attributable to new installs, not total DAU of roughly 121,000 including a 9.5-year legacy base. Ignorable while the target metric was retention; load-bearing the moment it became ARPDAU",
      "Stated limitation, published in the case: the whole shelf argument rests on one store, on one account, at League 2, on one day. Storefronts are routinely geo- and cohort-tested. Confirming that observation is the second data pull, and the kill criterion is written into the proposal",
    ],
    strategy:
      "The ordering principle for the whole portfolio is that converting a non-payer buys you retention, while retaining a non-payer does not buy you a payer. Everything else follows from that. The analysis is deliberately problem-first — nothing is prescribed until the cohort, the pain, the evidence, and the confidence level are established — and every number that would normally require internal telemetry is either sourced publicly or named as a gap with the query that would close it.",
    strategyPoints: [
      { label: "Two-Factor Framing", text: "ARPDAU = (payers ÷ DAU) × ARPPU. ARPPU is at ceiling and defended; payer rate has never been worked. That's the opportunity." },
      { label: "Evidence Tiers", text: "Every claim tagged verified fact, player signal, or named data gap. Sentiment is a hypothesis to test, not a measurement." },
      { label: "Marginal Value", text: "New payers priced at the marginal converter's 180-day value, because a cheaper rung raises conversion and lowers first-purchase value at once." },
      { label: "Published Corrections", text: "Where the analysis was wrong, the correction and its cost to the model are printed in the case rather than edited away." },
    ],
  },
  {
    slug: "terra",
    title: "Terra",
    subtitle: "A Field Console for a Smallholding That Kept Failing Silently",
    screenshot: "/screenshots/terra-today.jpg",
    screenshots: [
      "/screenshots/terra-today.jpg",
      "/screenshots/terra-tend.jpg",
    ],
    description:
      "A solution architecture and working prototype for managing a rehabilitating smallholding — 53 plants, two irrigation controllers, and a decade of accumulated guesses. Every failure on the property had the same shape: two kinds of truth drifting apart with nothing comparing them. Terra is built around reconciling them, and around rendering 'I don't know' as a first-class answer instead of a plausible default.",
    pitch:
      "There are three independent kinds of truth in a growing system. Intent is what a plant needs, and it changes rarely. Configuration is what you've physically set up, and it changes whenever you touch hardware. Reality is what's actually happening, and it changes continuously. Three pairs, three reconcilers — and most garden software stores only Configuration, which is why it can't detect anything. Terra compares all three, and the design rule underneath it is that every derived number must trace back to an independently-stated Intent value. A number with no anchor cannot be checked, and it will drift.",
    problem:
      "An emitter labelled 2 GPH was actually delivering 0.65. Sixteen trees were under-watered for an unknown length of time, and nothing in any tool anyone uses would have caught it, because the label and the reality were never compared. Meanwhile a chlorotic lemon had been treated repeatedly without anyone ever establishing whether the diagnosis was right — apply chelated iron, feel productive, and three seasons later the plant is still yellow.",
    tags: ["Systems Design", "Solution Architecture", "Prototype"],
    stack: [
      "JavaScript",
      "HTML/CSS",
      "Claude Code",
    ],
    featured: true,
    callout: "53 plants · 5-layer architecture · Working single-file prototype",
    category: "software",
    metrics: [
      { value: "53", label: "Plants Tracked" },
      { value: "3", label: "Kinds of Truth Reconciled" },
      { value: "36", label: "Facts Flagged Unverified" },
    ],
    highlights: [],
    outcomes: [
      "Wrote a full solution architecture that deliberately excludes schema, API routes, and UI markup — five layers (Record, Reconcile, Observe, Compress, Surface), each depending only on the layers beneath it, so the build order falls out of the structure rather than out of preference",
      "Built a working single-file prototype: aerial site map with plant placement, a daily view that answers 'what fits in the time you have', a region-by-region tend view, a walk route, and a gaps view — all driven by the same ranked model",
      "Made provenance cross-cutting rather than decorative. Every fact carries a confidence, a source, and a verification timestamp, and an assumed value propagates its uncertainty to every number derived from it — visible wherever that number appears, not just at the source field",
      "Designed an attention ranking on cost of delay rather than severity: priority = severity × time sensitivity × irreversibility ÷ effort. The archetype it surfaces is a wire coil against a young trunk — a plant that looks fine today, five minutes of work, and death if ignored. No severity-sorted list finds it",
      "Made the diagnosis module store the entire differential, not just the chosen cause, so when a treatment fails the operator returns to hypothesis two instead of restarting the reasoning",
    ],
    decisions: [
      "Made the drift warning obstructive rather than informative. Above 30% deviation it is not dismissable — you can act or you can revert, but you cannot acknowledge and move on. The original failure was invisible for an unknown period, so making it visible isn't enough",
      "Made the follow-up date a mandatory field on every treatment. You cannot log an intervention without committing to check whether it worked, and the system generates that task and asks a specific question. Without it the loop never closes",
      "Treated map coordinates as an editable working guess rather than a survey, because they were hand-placed from a verbal description. Eight plant identifications are recorded as unknown rather than guessed at",
      "Kept the delivery calculator as pure functions with no I/O, database, or framework, because it had already failed twice on arithmetic a five-line unit test would have caught",
      "Drew hard boundaries: the system doesn't decide, doesn't identify plants from photos, doesn't control hardware, and doesn't gamify. Automated writes to an irrigation controller with a drift bug is a way to kill sixteen trees overnight",
    ],
    teamContext:
      "Designed and built solo — problem statement, solution architecture, and prototype — for a property being rehabilitated by one person working roughly twenty minutes at a time, one-handed, often with no signal.",
    userResearch: [
      "The weekly capture flow is shaped by the actual constraint: one person, one hand, twenty minutes, no signal. The route is generated by physical position rather than plant ID so there's one circuit and no backtracking, and photos carry a ghost overlay of the previous image so framing matches",
      "Health is assessed as component sliders with prompts rather than one vague number, and trend is surfaced more prominently than value — a plant at 60 and rising is fine; a plant at 78 that was 90 last month is the one to look at",
      "Every scheduled task carries its rationale, because 'prune the apricot in late summer' is forgettable and 'prune the apricot in late summer because Eutypa enters through wet-weather wounds' is not. Two rules that are destructive rather than merely suboptimal get blocking treatment",
    ],
    failures: [
      "The failure that started the project: an emitter labelled 2 GPH measured at 0.65, silently under-watering sixteen trees for an unknown period. Configuration and Reality had never been compared, so nothing could have caught it",
      "The delivery calculator failed twice on arithmetic errors that a trivial unit test would have caught. That is the reason it is now specified as pure functions testable in complete isolation, with no framework anywhere near it",
      "An earlier attempt stored what the setup was without storing what each plant needed. Requirements existed nowhere as independent data, which is precisely why every numerical failure was undetectable rather than merely undetected",
    ],
    strategy:
      "The thesis is that a rehabilitated system produces more with less, and that the improvement comes from mulch and soil biology rather than irrigation cleverness — which is why the headline outcome metric is gallons of water per pound of food, not acreage or yield alone. The software exists because the signals that matter are slower than human attention: a canopy thinning over two seasons is invisible day to day. Terra's whole job is to compress those gradients into something perceptible, then rank them by what it costs to wait.",
    strategyPoints: [
      { label: "Three Truths", text: "Intent, Configuration, and Reality drift apart silently. Three pairs, three reconcilers — that's the entire architecture." },
      { label: "Anchored Numbers", text: "Every derived figure traces to an independently-stated requirement. A number with no anchor cannot be checked, and it will drift." },
      { label: "Uncertainty Propagates", text: "'I don't know' is a first-class state. A plausible default is worse than a blank, because a blank prompts investigation." },
      { label: "Cost of Delay", text: "Attention ranked by severity × time sensitivity × irreversibility ÷ effort — which surfaces the five-minute job that prevents a dead tree." },
    ],
  },
  {
    slug: "tiger-sisters",
    title: "Tiger Sisters Tools",
    subtitle: "Podcast Episodes Rebuilt as Working Software",
    screenshot: "/screenshots/tiger-sisters-home.jpg",
    screenshots: ["/screenshots/tiger-sisters-home.jpg"],
    liveUrl: "https://tiger-sisters-linkedin.vercel.app",
    description:
      "Interactive tools built from Tiger Sisters podcast episodes. Each one takes a single episode's framework and attaches input fields to it — the same rules and the same tests, run live against whatever you type. Four tools across two episodes: a LinkedIn About Me builder, an AI onboarding doc builder, a prompt upgrader, and an automation recipe with a readiness gate.",
    pitch:
      "Good advice is easy to nod at and harder to actually do. A podcast episode gives you a framework and then it's gone; the listener is left to apply it from memory, badly, three weeks later. So I rebuilt the frameworks as software. Every scoring rule in the code maps to a rule written up in the knowledge docs, and they change together — the tool and the source are one thing in two places. Nothing has a backend, nothing has analytics, and nothing leaves the browser.",
    problem:
      "Advice content converts poorly into behavior. The gap isn't comprehension, it's application: people understand 'be specific' and still write a generic profile, because in the moment they have no way to tell whether what they just typed is specific. A live meter that scores the actual draft closes that gap in a way a checklist never does.",
    tags: ["Next.js", "Interactive Tools", "Brand Systems", "Content"],
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind v4",
      "Vercel",
    ],
    featured: true,
    callout: "4 tools · 2 episodes · No backend, no analytics",
    category: "software",
    metrics: [
      { value: "4", label: "Interactive Tools" },
      { value: "0", label: "Backends or Trackers" },
      { value: "100%", label: "Rules Traced to Source" },
    ],
    highlights: [],
    outcomes: [
      "Built the About Me builder as a three-step flow on Share, Sell, and Search-optimize, with a live specificity meter scoring the draft from 'one of a million' to 'one in a million' on real heuristics — first person, a concrete number, filler-phrase detection, a call to action, a human detail, and length",
      "Built the onboarding doc builder around the episode's central argument that using an AI tool resembles hiring: three steps for access, day-one context, and success criteria, with a live preview rendered as the markdown file that would sit in the folder the tool reads",
      "Built the prompt upgrader around six named techniques, with a job picker that resets the toggles to the set that fits and flags any technique that fights the job — asking an unattended automation to interview you, for instance",
      "Built the automation recipe as a readiness gate rather than a static checklist. It separates blockers from gaps and refuses to say 'ready to schedule' until irreversible-action, human-review, and proven-by-hand criteria are cleared",
      "Matched the podcast's brand system precisely — the five-colour palette, the button radius with its three rising layers and its tilt on hover, the rotated label chip, the shared easing curve, and the sans-line-then-serif-line headline device",
    ],
    decisions: [
      "Kept every scoring rule paired to a written knowledge doc, with a table in the README mapping each library to its source. The rules are not free-floating heuristics I invented; they're the episode's argument, made executable",
      "Stored everything in localStorage with no backend and no analytics. These tools ask people to type a draft of how they describe themselves, and the honest version of that is one where nothing is sent anywhere",
      "Made the prompt upgrader diagnose the rough ask itself before applying any technique, so a one-sentence prompt gets caught rather than dressed up",
      "Named the licensed brand faces first in the font stack with close free fallbacks shipped, so the site resolves correctly the moment the licences are added and looks right in the meantime without shipping fonts it has no rights to",
      "Wrote the add-an-episode path into the README as four steps — knowledge doc, episode entry, tool route, catalog entry — so the project grows by convention rather than by archaeology",
    ],
    teamContext:
      "Built solo, from the podcast's published episodes, as an independent companion to the show.",
    userResearch: [
      "The specificity meter's heuristics come straight from the episode's own worked examples of weak and strong profiles, rather than from generic copywriting advice — which is what makes the score arguable and therefore useful",
      "The About Me preview marks where LinkedIn truncates the section to 'see more', because the practical failure mode isn't a bad profile, it's a good profile whose point lands below the fold",
    ],
    failures: [
      "The first pass at the builder section changed colour partway down, which broke the podcast's field-based visual system. Rebuilt it to hold one colour end to end",
    ],
    strategy:
      "The bet is that a framework becomes useful at exactly the moment it can score your actual attempt. So each tool is the smallest possible wrapper around one episode's rules: input fields, a live meter that explains itself, a preview that shows the artifact in the form it will really take, and two output formats. Keeping the scoring rules and the knowledge docs in lockstep means the show and the software can't drift apart — and it makes adding the next episode a matter of writing the doc first.",
    strategyPoints: [
      { label: "Rules, Not Vibes", text: "Every check in the code maps to a written rule in the knowledge docs. Change one, change the other." },
      { label: "Live Scoring", text: "Meters that grade the actual draft and say why, instead of checklists that grade nothing." },
      { label: "Nothing Leaves", text: "localStorage only. No backend, no analytics, no account — appropriate for a tool people type honestly into." },
      { label: "Brand Fidelity", text: "Palette, button mechanics, easing, and the sans-then-serif headline device lifted from the podcast's own site." },
    ],
  },
  {
    slug: "crew-challenges",
    title: "Crew Challenges",
    subtitle: "A Shared Habit Board With the Day-Lock Enforced in the Database",
    liveUrl: "https://july-core-crew.vercel.app",
    description:
      "A gamified board where a group takes on challenges together. Anyone can add themselves and join whichever boards they like — no passwords, no accounts. The board auto-advances at midnight Pacific, past days stay open so you can log one late, and future days are locked mystery boxes. Daily check-ins, kudos and reactions, and a live leaderboard with totals and streaks that updates across everyone's devices at once.",
    pitch:
      "Group challenge apps fail on two things: signup friction kills the group before it starts, and the rules leak. If the day-lock is a UI conditional, someone opens dev tools or shifts their clock and the leaderboard stops meaning anything. So there are no passwords — you pick your name and it's saved on your device — and the current day is computed server-side per challenge in Pacific time, with row-level security allowing a check-in for any day from one up to today. Catch-up is deliberate and supported; jumping ahead is impossible at the database, not merely hidden in the interface.",
    problem:
      "Shared accountability works when the group can see each other, and dies when logging becomes a chore. Existing habit trackers are single-player with a social veneer bolted on, and every one of them wants an account before it will show you anything.",
    tags: ["Supabase", "Realtime", "Social", "Next.js"],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "Tailwind v4",
      "Framer Motion",
    ],
    featured: false,
    callout: "No accounts · Day-lock enforced in Postgres · Live leaderboard",
    category: "software",
    metrics: [
      { value: "0", label: "Passwords Required" },
      { value: "RLS", label: "Rules Enforced In-Database" },
      { value: "Live", label: "Cross-Device Leaderboard" },
    ],
    highlights: [],
    outcomes: [
      "Shipped open signup with no passwords — you pick your name, it saves on your device, and you can switch anytime",
      "Built the day-lock as a Postgres function computing the current day per challenge in America/Los_Angeles, with row-level security policies permitting a check-in for any day from one up to and including today",
      "Built a live leaderboard over Supabase realtime showing totals, streaks, and kudos received, updating across every participant's device without a refresh",
      "Added kudos and reactions as the social layer, with confetti and animation on check-in, because the reward for logging has to arrive immediately or people stop logging",
      "Made the app multi-challenge: challenges are defined in code, the home screen lists them, and members opt in per board",
    ],
    decisions: [
      "Enforced the day-lock in the database rather than the UI. A leaderboard whose rules live in client-side conditionals is a leaderboard nobody can trust, and this one is shared with people who will absolutely try it",
      "Allowed catch-up on any past day but no access to future days. Missing a day should cost you nothing but the streak; the alternative is people quietly abandoning the board after one bad week",
      "Skipped accounts entirely. The group is small and known, the stakes are a streak counter, and an auth flow would have cost more participants than it protected",
      "Prefixed every table for the shared Supabase project rather than standing up a new one, keeping the app out of the way of unrelated projects on the same database",
    ],
    teamContext:
      "Built solo for a group of friends, and running with real participants across multiple challenge boards.",
    userResearch: [
      "The catch-up rule came directly from watching how group challenges actually die: one missed day, a locked board, and a participant who never opens it again. Allowing a late log while still refusing future days keeps the record honest without punishing a busy Tuesday",
    ],
    failures: [
      "One table shipped without the shared-project prefix that every other table carries. It's knowingly left alone rather than fixed — renaming a live table that two running challenges read from is a bigger risk than the inconsistency, and it's written down as accepted debt rather than pretended away",
    ],
    strategy:
      "The product is the group, not the tracker. Every decision optimizes for the number of people who are still checking in during week three: no signup wall at the front, no punishment for a missed day, immediate feedback on every log, and a leaderboard whose numbers can be trusted because the rules that produce them are enforced where nobody can reach them.",
    strategyPoints: [
      { label: "Zero-Friction Entry", text: "Pick a name, join a board. No account, no password, no email." },
      { label: "Trustworthy Rules", text: "The current day is computed server-side and enforced by row-level security, not by a client-side conditional." },
      { label: "Forgiving By Design", text: "Past days stay open so a missed Tuesday doesn't end someone's participation. Future days stay locked." },
      { label: "Immediate Reward", text: "Confetti, reactions, and a live leaderboard — the feedback for logging arrives before you close the tab." },
    ],
  },
  {
    slug: "dpt-career-hub",
    title: "DPT Career Hub",
    subtitle: "A Single-Screen Planner for a Doctor of Physical Therapy Track",
    description:
      "A personal planning app for someone working toward a Doctor of Physical Therapy degree, built from a career roadmap that had been living in a spreadsheet. One screen, seven sections — dashboard, tasks, study hub, program research, fitness projects, milestones, and profile — with section state held in a single client-side store so the whole track is navigable without a page change.",
    pitch:
      "A DPT application track spans prerequisites, observation hours, program deadlines, GRE study, and a personal fitness practice, and it usually lives across a spreadsheet, a notes app, and a browser full of program tabs. This pulls the whole roadmap into one screen where the next action is always visible, because the failure mode of a multi-year plan isn't ambition, it's losing track of which of six parallel threads needs attention this week.",
    problem:
      "Long-horizon personal goals fragment across tools, and the fragmentation is what kills them. A spreadsheet holds the plan but never surfaces the next step; a task app holds the steps but loses the plan they belong to.",
    tags: ["Next.js", "Personal Tools", "Planning"],
    stack: [
      "Next.js",
      "React",
      "TypeScript",
      "Zustand",
      "Tailwind",
    ],
    featured: false,
    callout: "Seven sections · One screen · Built from a roadmap spreadsheet",
    category: "software",
    metrics: [
      { value: "7", label: "Sections In One View" },
      { value: "1", label: "Source Roadmap Consolidated" },
    ],
    highlights: [],
    outcomes: [
      "Consolidated a career roadmap spreadsheet into a working app with dashboard, tasks, study hub, program research, fitness projects, milestones, and profile sections",
      "Built section switching through a single client-side store so the app is one screen with no route changes, keeping the whole track in view rather than behind navigation",
      "Structured program research as first-class data alongside tasks, so deadlines and prerequisites for each target program sit next to the work required to meet them",
    ],
    decisions: [
      "Kept it a single screen with in-place section switching rather than routed pages, because the point of the app is seeing the whole track at once and routing would have hidden exactly what needed to stay visible",
      "Built it as a personal tool for one named user rather than a generalized product. The roadmap it encodes is specific, and generalizing it would have removed the thing that made it useful",
    ],
    teamContext:
      "Built solo as a personal tool for a family member working toward a DPT program.",
    userResearch: [
      "The section list came directly from the roadmap spreadsheet's own tabs, rather than from a guess at what a planning app should contain",
    ],
    failures: [],
    strategy:
      "A multi-year application track is a coordination problem disguised as a motivation problem. The app's only real job is to make the next action visible without requiring the person to reassemble the plan from three tools first — which is why everything lives on one screen and why the sections mirror the roadmap that already existed rather than a generic productivity structure.",
    strategyPoints: [
      { label: "One Screen", text: "Seven sections switched in place, so the whole multi-year track stays visible at once." },
      { label: "Mirrors The Source", text: "Sections come from the roadmap spreadsheet's own structure, not from a generic productivity template." },
    ],
  },
  {
    slug: "1406-adventures",
    title: "1406 Adventures",
    subtitle: "A Variant-Comparison Prototype for a Luxury Travel Advisory",
    screenshot: "/screenshots/1406-home.png",
    screenshots: ["/screenshots/1406-home.png"],
    description:
      "A marketing site for a luxury travel concierge, built as a comparison prototype rather than a mockup. Three layout systems, four brand-voice shells referenced against established players in the category, and swappable copy tones and photo sets — all live in the running site, so a non-technical client could pick a direction by toggling between real options instead of reviewing static comps. Written up as a PRD first, with two user journeys and an agent-referral attribution path.",
    pitch:
      "The usual way to give a client design options is three flat mockups and a meeting. That asks them to imagine the site rather than use it, and they choose on taste rather than on fit. So I built the site as a set of switchable variants: minimal, bold, and magazine layouts; four voice treatments benchmarked against the reference brands in luxury travel; copy tones and photo sets that swap through context providers at runtime. The client picks by clicking, and the decision is made against something real.",
    problem:
      "The business runs two entirely different acquisition paths — cold visitors who arrive from search and word of mouth, and warm clients referred by partner travel agents who need to feel acknowledged and whose referrals need to be attributed. A single undifferentiated brochure site serves neither, and the agent side has the additional constraint that partners will not adopt anything requiring a login or a portal.",
    tags: ["Marketing Site", "PRD", "Design Systems", "Prototyping"],
    stack: [
      "React",
      "Next.js",
      "Vite",
      "Tailwind",
    ],
    featured: false,
    callout: "3 layouts · 4 voice treatments · Swappable copy and photo sets",
    category: "software",
    metrics: [
      { value: "3", label: "Layout Systems Built" },
      { value: "4", label: "Brand Voice Treatments" },
      { value: "2", label: "User Journeys Specified" },
    ],
    highlights: [],
    outcomes: [
      "Wrote the PRD first — product summary, business context, two mapped user journeys, and an explicit platform decision made on client maintainability rather than developer preference",
      "Built three complete layout systems (minimal, bold, magazine) as swappable shells rather than as separate mockups",
      "Built four brand-voice treatments benchmarked against established luxury travel operators, plus a recommended default, so the direction could be chosen against real category references",
      "Made copy tone and photo set runtime-switchable through context providers, with every destination represented in each photo set so the comparison tested layout and voice rather than which photos happened to be nicer",
      "Specified the agent-referral journey as a plain link carrying a referral parameter, with acknowledgment on arrival and attribution captured on submit — no partner login, no portal, nothing for an agent to learn",
    ],
    decisions: [
      "Made the platform decision on who maintains the site rather than on what's most fun to build. The client is non-technical and the site has to be editable without a developer, so the PRD specifies a managed platform even though a custom build is the more impressive artifact",
      "Built comparison into the running site instead of producing static mockups, because a client choosing between three images chooses on taste and a client choosing between three working sites chooses on fit",
      "Kept every photo set covering the full destination range, so a variant couldn't win on photo selection when the thing being tested was layout and voice",
      "Specified referral attribution as a URL parameter with no agent-side login. Partners will forward a link they can remember; they will not maintain credentials for someone else's referral portal",
    ],
    teamContext:
      "Built solo — PRD, design variants, and front end — for a luxury travel advisory that partners with referring travel agents.",
    userResearch: [
      "The two journeys came from how the business actually acquires: organic visitors who need credentials and trust-building before they inquire, and agent-referred clients who arrive already warm and need acknowledgment that they're in the right place",
      "The agent constraints — a simple memorable link, confidence that referrals are tracked, and no login — shaped the attribution design more than any technical consideration did",
    ],
    failures: [],
    strategy:
      "Two audiences arriving through two doors, one of whom is a partner rather than a customer. The site's job is to serve both without splitting into two sites: shared content and credentials for everyone, a referral acknowledgment and silent attribution for the warm path, and a single inquiry form as the only conversion point. Building the visual and voice options as switchable variants meant the direction was chosen from evidence rather than from a taste argument in a meeting.",
    strategyPoints: [
      { label: "Choose By Using", text: "Layouts, voice treatments, copy tones, and photo sets all switchable in the live site — not three flat comps in a meeting." },
      { label: "Two Doors", text: "Organic visitors and agent-referred clients get the same content, with acknowledgment and attribution on the referred path." },
      { label: "No Partner Portal", text: "Referral tracking is a link parameter. Agents will forward a link; they will not maintain a login." },
      { label: "Maintainability First", text: "The platform decision was made on who edits the site after launch, not on what's most interesting to build." },
    ],
  },
  {
    slug: "cluck",
    title: "Cluck: Escape the Line",
    subtitle: "GTM Website & CRM Platform",
    screenshot: "/screenshots/cluck-home.png",
    screenshots: [],
    liveUrl: "https://www.cluckdev.com/",
    description:
      "Built the full go-to-market web platform for Cluck, a 3D puzzle-platformer. Evolved the site through three phases — beta signup, waitlist, and production — each designed to capture interest and convert it into a growing audience. The production site includes a fully built admin panel and CRM for managing email campaigns, subscriber segments, and community communications.",
    pitch:
      "Cluck needed more than a landing page — it needed a GTM engine. I built a phased web platform that started as a simple beta signup, grew into a waitlist with email capture, and shipped as a production site with a custom admin panel and CRM. The system manages subscriber lists, email campaigns, and audience segmentation, giving the team a direct channel to players without depending on third-party tools.",
    problem:
      "Indie games rely on wishlists and social media for pre-launch marketing, but those channels are rented — you don't own the audience. The team needed a direct communication channel with potential players, plus the tooling to manage that audience as it grew from early beta signups through launch.",
    tags: ["GTM", "Next.js", "CRM", "Email Systems"],
    stack: [
      "Next.js",
      "TypeScript",
      "PostHog",
      "Vercel",
    ],
    featured: true,
    callout: "Built solo · Beta → Waitlist → Production · Custom CRM",
    category: "software",
    metrics: [
      { value: "3", label: "Site Phases Shipped" },
      { value: "1", label: "Custom CRM Built" },
      { value: "100%", label: "Built Solo" },
    ],
    highlights: [],
    outcomes: [
      "Shipped three iterations of the site — beta signup, waitlist, and full production — each expanding functionality to match the game's GTM phase",
      "Built a custom admin panel and CRM from scratch: subscriber management, email campaigns, audience segmentation, and delivery tracking",
      "Designed the site to drive wishlist and email conversions, giving the team a direct owned channel to players",
      "Integrated PostHog analytics to track visitor behavior, signup funnels, and campaign attribution",
    ],
    decisions: [
      "Built a custom CRM instead of using Mailchimp or SendGrid because the team needed tight integration between the website, subscriber data, and campaign management without per-seat SaaS costs",
      "Shipped the site in phases rather than waiting for a polished production version — each phase captured real signups and validated messaging before investing in the next iteration",
      "Chose Next.js + Vercel for fast iteration and instant deployments, letting me ship updates same-day based on signup funnel data",
    ],
    teamContext:
      "Built the entire web platform solo as Co-Founder & Director of Product at Frame Story. The 10+ person game development team focuses on the title itself while I own the GTM tooling, web presence, and audience-building infrastructure.",
    userResearch: [
      "Steam Next Fest demo strategy informed by indie dev community research: wishlists convert at 5-15%, making owned email lists a critical complement to Steam's discovery",
      "Beta signup flow optimized through funnel analysis — reduced form friction after seeing drop-off data in PostHog",
    ],
    failures: [],
    strategy:
      "The web platform is the GTM engine for Cluck. Rather than relying solely on Steam wishlists and social media, the phased site builds an owned audience from day one. Beta signups validate interest, the waitlist grows the list, and the production site with CRM gives the team a direct, no-cost communication channel to players through launch and beyond.",
    strategyPoints: [
      { label: "Phased Rollout", text: "Beta signup → waitlist → production site. Each phase captures real signups and validates messaging." },
      { label: "Owned Audience", text: "Custom CRM and email system gives the team a direct channel to players, independent of Steam or social algorithms." },
      { label: "Admin Tooling", text: "Built-in admin panel for subscriber management, email campaigns, audience segmentation, and delivery tracking." },
      { label: "Data-Driven", text: "PostHog analytics on every page — signup funnels, campaign attribution, and visitor behavior inform each iteration." },
    ],
  },
  {
    slug: "pottery-friends",
    title: "Pottery Friends",
    subtitle: "Community Platform Ecosystem",
    screenshot: "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/feed.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/feed.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-post.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-filters.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-adjust.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-crop.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/video-edit.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-thread.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/forum.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/create-menu.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/glaze-library.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-date.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-location.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-guests.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-details.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-style.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/settings.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/privacy.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/notifications.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/welcome-members.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/comments.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/messages.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/landing-hero.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/landing-reviews.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/site-admin.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/email-management.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-weekly.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-retention.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-funnel.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-reach.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-retention-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/dashboard-dau.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/admin-home.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/content-moderation.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/business-profile.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/change-role.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/manage-team.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/directory.png",
    ],
    liveUrl: "https://potteryfriends.com/",
    description:
      "After embedding at Red Ox Ceramics 6 days a week for a year, I identified an unowned vertical: no one has built purpose-built software for craft studio communities. I built a connected platform, including a native app, web app, analytics dashboards, and docs, to prove the thesis.",
    pitch: "",
    problem:
      "The ops manager was spending 5+ hours per week on manual admin. Members missed 2-3 events per month because announcements got buried in group texts. And the community knowledge that makes a studio special, like glaze recipes, techniques, and inspiration, had no digital home. Mindbody and Glofox serve gyms, not craft communities.",
    tags: ["Platform", "Mobile", "E-Commerce", "Analytics"],
    stack: [
      "React Native",
      "Expo",
      "Next.js",
      "Supabase",
      "Stripe",
      "PostHog",
      "Sentry",
      "Nextra",
      "Recharts",
    ],
    featured: true,
    callout: "Full platform · 150 beta members · solo build",
    category: "software",
    repos: [
      { name: "red-ox-mobile", role: "Mobile app (iOS/Android)" },
      { name: "potteryfriends-web", role: "Marketing & web app" },
    ],
    metrics: [
      { value: "150", label: "Beta Members" },
      { value: "2x", label: "Engagement After Redesign" },
      { value: "20+", label: "User Interviews" },
      { value: "5+hrs", label: "Weekly Admin Time Saved" },
    ],
    highlights: [],
    outcomes: [
      "150 beta members onboarded with consistent weekly usage, validating that a purpose-built tool outperforms the Square + paper binders + group chat stack",
      "Gamification completion rates jumped from 5% to 35% after cutting 40 quests to 8 tied to real studio actions",
      "Home screen redesign (feed-first to events-first) doubled engagement. Data contradicted the original hypothesis, so I killed it and rebuilt around what users actually did",
    ],
    decisions: [
      "Started with a feed-first home screen, but usage data showed members skipped it and went straight to Events. Redesigned around upcoming events and quick actions. Engagement doubled.",
      "Cut the planned marketplace after user interviews revealed studio owners saw it as competition with their own retail. Redirected effort into analytics dashboards, the feature they actually wanted to pay for.",
    ],
    teamContext: "",
    userResearch: [
      "Embedded 6 days/week for a year and watched the ops manager run everything through Square, paper binders, and group texts. 5+ hours/week on manual admin alone",
      "Members at retreats confirmed the same problems exist at every studio. No one has purpose-built software",
      "Top user request wasn't scheduling. It was 'What glaze should I try next.' Community inspiration was the killer feature, not logistics",
    ],
    failures: [],
    strategy: "",
    strategyPoints: [
      { label: "Target", text: "Independent studios with 30 to 200 members, too small for enterprise software, too large for group texts." },
      { label: "Go-to-Market", text: "Lead with free analytics dashboards, then expand to the full platform once studios see engagement data." },
      { label: "Business Model", text: "Freemium subscriptions: free for events and messaging, paid for analytics, payments, and gamification." },
      { label: "Vision", text: "Start with pottery, expand to woodworking, glassblowing, and other craft communities." },
    ],
    features: [
      {
        title: "Social Feed & Content Creation",
        description:
          "Instagram-style photo editing (filters, adjustments, cropping) and video support, because potters are visual creators who want to showcase work without leaving the app.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/feed.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-post.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/photo-filters.png",
        ],
      },
      {
        title: "Events & Workshops",
        description:
          "Missing events was the #1 complaint. 6-step creation flow lets owners publish a workshop in under 2 minutes. RSVP tracking replaced the paper sign-up sheets.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-detail.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-date.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/event-style.png",
        ],
      },
      {
        title: "Forums & Glaze Library",
        description:
          "Searchable home for tribal knowledge: glaze recipes, firing schedules, and technique tips. Organized by topic because every studio conversation falls into the same natural categories.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/forum.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/glaze-library.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/potteryfriends/new-thread.png",
        ],
      },
    ],
  },
  {
    slug: "swob",
    title: "Swob",
    subtitle: "Swipe-to-Hire Job Matching Platform",
    liveUrl: "https://www.swobapp.com/",
    screenshot:
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-hero-employer.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-hero-employer.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-org-management.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-job-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/swob/swob-manager-dashboard.png",
    ],
    description:
      "Brought on by an ex-colleague to consult for Swob's founders as they prepare for fundraising and enterprise sales. My role: stress-test the product thesis, build functional prototypes that double as investor demos and living specs, and advise on strategy informed by sales calls and investor feedback. The founders have an existing candidate app with traction (10K+ hires, 500+ restaurant locations). I'm helping them expand into the employer side — hiring pipelines, shift management, and multi-source candidate aggregation — so the product story is complete before they raise.",
    pitch:
      "Swob's founders had a proven candidate product but needed the employer side to close enterprise deals and raise. I was brought in to define what that looks like: a swipe-to-match hiring interface, a pipeline that aggregates candidates from Indeed and ZipRecruiter into one AI-ranked dashboard, and a shift-swap system that removes managers from the loop. Each prototype is a standalone Next.js app that serves as both an investor demo and a living spec for engineering. The strategic work happens between builds — challenging assumptions about AI features that are really automations, questioning whether predictive turnover models create legal risk, and cutting scope to what actually moves the fundraise forward.",
    problem:
      "Hiring for hourly roles is stuck on platforms built for salaried positions. Managers post on Indeed, wait weeks, and get unqualified applicants. Shift swaps require texting through a staff list. No platform connects who you hire to how you schedule them — and most tools trying to solve this are building for enterprise chains, not the independent restaurants and franchises under 10 locations where Swob competes.",
    tags: ["SaaS", "Multi-Product", "Hiring", "Workflow"],
    stack: ["Next.js", "TypeScript", "TailwindCSS", "Supabase", "PostHog"],
    featured: true,
    callout: "Consulting PM · 5 prototypes · Investor demo + living specs",
    category: "software",
    repos: [
      { name: "swob-app", role: "Core application" },
      { name: "swob-candidate-dashboard", role: "Candidate-facing dashboard" },
      { name: "swob-candidate-pipeline", role: "Pipeline management" },
      { name: "swob-shift-swap", role: "Shift swap interface" },
      { name: "swob-marketing-site", role: "Marketing site" },
    ],
    highlights: [
      "5 functional prototypes serving as both investor demos and engineering specs, each deployable independently",
      "Smart candidate pipeline aggregating Indeed, ZipRecruiter, and native Swob applicants into one AI-ranked dashboard",
      "Swipe-to-match hiring interface designed around how managers actually evaluate: availability and proximity, not resumes",
      "Peer-to-peer shift swap system that removes manager bottleneck from schedule changes",
      "Marketing site overhaul with conversion-focused copy, social proof (Richard Branson endorsement, BNN Bloomberg coverage), and staged rollout",
      "PostHog analytics pipeline tracking conversion at every funnel stage",
    ],
    outcomes: [
      "Prototypes directly used in investor meetings and sales conversations with restaurant brands",
      "PostHog funnel tracking identified a 3x drop-off at onboarding — reduced form fields to email + business name, improving conversion significantly",
      "Swipe-to-match prototype tested with 3 restaurant managers: average time to shortlist dropped from days to under 2 minutes",
      "Strategic questioning during planning sessions surfaced legal risks in predictive turnover features and reframed 'AI' features as well-designed automations, saving months of misallocated engineering effort",
    ],
    decisions: [
      "Split into 5 apps instead of a monolith because each product serves a different persona (manager, candidate, admin) with its own deployment cycle and demo path",
      "Chose swipe UI over traditional list/filter because restaurant managers hire on gut + availability, not keyword matching — validated through founder sales calls",
      "Advised founders to cut the white-label theming system scope after early customers only wanted logo + brand color. Lesson: validate distribution thesis before building premium infrastructure",
      "Recommended building ZipRecruiter integration first over Indeed because Indeed's Partner Program takes months to approve — de-risk the timeline by shipping the faster integration",
    ],
    teamContext:
      "Consulting Product Manager, brought on by an ex-colleague (Chong Ahn) to advise Swob's founders (Stephanie & Alexander Florio) through fundraising and enterprise sales. I work directly with the founders: we review feedback from sales calls and investor conversations, then I translate that into product strategy, PRDs, and functional prototypes. The prototypes serve as living specifications for the engineering team. My role sits between strategic advisory and hands-on execution — stress-testing the product thesis, questioning assumptions, building what's needed to close deals, and cutting what isn't.",
    userResearch: [
      "Founders' sales calls with restaurant brands revealed the same pattern: post on Indeed, wait 2-3 weeks, get 50+ unqualified applicants, then hire whoever shows up",
      "Managers make hiring decisions in under 30 seconds based on availability, proximity, and vibe — not resumes. Traditional job boards force a workflow that doesn't match how they actually evaluate",
      "Challenged the founders' AI feature assumptions in planning sessions: predictive turnover models need more data than high-turnover restaurants generate, and flagging 'flight risk' employees creates legal exposure. Reframed as targeted automations instead",
      "The #1 scheduling pain point wasn't creating schedules, it was last-minute shift swaps. Managers spent evenings texting through their staff list. Peer-to-peer swap removed them from the loop entirely",
    ],
    failures: [
      "First version had a single monolithic app with all 5 features behind tabs. User testing showed managers were overwhelmed. Splitting into separate apps with focused UIs solved the cognitive overload. Takeaway: personas need separate products, not separate tabs.",
      "Founders wanted an AI-powered candidate ranking system scoring on 12 factors. Managers ignored the scores — they just needed to see Saturday night availability. Replaced with a swipe interface filtered by availability. Takeaway: the feature users want isn't always the feature you'd design from first principles.",
      "White-label theming (8 themes, 7 layouts) was built before talking to B2B partners. Early customers just wanted their logo and brand color. Takeaway: validate distribution thesis before building premium infrastructure.",
      "PostHog revealed a 3x drop-off at onboarding. Original flow asked for business details, team size, and scheduling preferences upfront. Reduced to email + business name, then collected progressively. Takeaway: every form field before the 'aha moment' is a reason to leave.",
    ],
    strategy:
      "Target customer: SMB restaurant franchises with under 10 locations — first market entry in Austin, Chicago, and Atlanta. Competitive landscape: Indeed and ZipRecruiter own job posting but stop at the hire. When I Work and Homebase own scheduling but don't touch hiring. No platform connects who you hire to how you schedule them. Go-to-market: Lead with the swipe-to-match hiring tool as a free wedge, the sharpest demo and easiest close. Once a manager hires through Swob, expand into scheduling and shift-swap. The candidate dashboard creates a two-sided network effect. Business model: Free hiring tool, paid scheduling suite with per-location pricing. The prototype suite is designed to close contracts and raise capital simultaneously.",
  },
  {
    slug: "fitness",
    title: "Fitness",
    subtitle: "Unified Training & Body Composition Analytics",
    screenshot:
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/strava-integration.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/strava-integration.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/data-sources.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/dexa-integration.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/progress.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/scan-summary.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/body-composition.png",
    ],
    liveUrl: "https://health.jonnymartin.blog/",
    description:
      "This project came from my own weightlifting and body recomposition journey. I found a system of fat reduction and muscle increase that helped me get tremendous results in 6 months, and I wanted to help others do the same. Fitness data is scattered across apps that don't talk to each other. Strava tracks your runs, COROS logs your heart rate, and a DEXA scan lives in a PDF. Fitness pulls it all into one dashboard and makes it actionable with training load analytics, body composition trends, and injury risk indicators. I'm now testing it within our gym community called Everfit Motion.",
    pitch:
      "After 6 months of weightlifting and body recomposition, I'd found a system that actually worked: fat reduction and muscle increase with measurable results. But the tools were all disconnected. Strava told me my pace, COROS told me my heart rate, and my DEXA scan was a PDF I never looked at. So I built a dashboard that married all these data sources together. The value isn't more charts, it's surfacing insights no single app can provide: training load ratios that predict injury, body composition trends that show whether your program is actually working, and recovery metrics that tell you when to push and when to rest. I'm now testing it with our gym community, Everfit Motion.",
    problem:
      "People pursuing body recomposition generate data across 5+ apps with no unified view. Strava doesn't know your body composition. Your DEXA scan doesn't factor into your training plan. Training load calculations require manual spreadsheets. The result: people collect data they never act on because synthesizing it takes more effort than the workout itself.",
    tags: ["Fitness", "Data Viz", "Integrations"],
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Strava API",
      "Recharts",
      "TailwindCSS",
    ],
    featured: true,
    callout: "3 data sources unified · Training load injury risk detection",
    category: "software",
    repos: [{ name: "health", role: "Fitness analytics dashboard" }],
    highlights: [
      "Strava webhook integration for real-time activity syncing without manual imports",
      "DEXA scan PDF parser that extracts body composition data into trackable trends",
      "COROS .FIT file decoder for heart rate zones, training load, and recovery metrics",
      "Training load analytics: ACWR ratios, monotony scoring, and polarization analysis",
      "Body composition dashboard with regional fat distribution and muscle balance tracking",
    ],
    outcomes: [
      "3 data sources unified into one dashboard, replacing manual spreadsheet tracking entirely",
      "Strava webhooks processing activities in real-time, with zero manual data entry after initial setup",
      "DEXA PDF parser extracting 20+ body composition data points from unstructured scan reports",
      "Training load dashboard surfacing injury risk indicators (ACWR > 1.5) that were invisible before",
    ],
    decisions: [
      "Used Strava webhooks instead of polling for real-time sync with no rate limit issues and instant dashboard updates after a workout",
      "Built a custom DEXA PDF parser instead of manual entry. Scans have a consistent format, so regex extraction is reliable and saves 15 minutes per scan",
      "Built with Recharts instead of D3 because the charts are standard (line, bar, scatter) and Recharts integrates natively with React, saving weeks of custom SVG work",
      "Stored everything in Supabase/Postgres instead of a time-series DB. The data volume is personal-scale, and Postgres's JSON columns handle the varied schemas from different devices",
    ],
    teamContext:
      "Built to solve my own problem during a 6-month body recomposition program. Designed the data model, built all integrations (Strava, DEXA, COROS), and use the dashboard daily. Now testing with members of Everfit Motion, our gym community, to validate whether the same systems that worked for me can help others achieve similar results. The API integration architecture mirrors challenges I faced at Treasure DAO, where I led the launch of a new blockchain on Arbitrum and shipped a gaming NFT marketplace, both of which required orchestrating multiple third-party APIs and data sources into a coherent product. The analytics dashboard design draws from my experience at Bandai Namco (PAC-MAN franchise, 10M+ weekly installs) and Big Fish Games, where I built analytics pipelines from scratch and used data visualization to drive product decisions.",
    userResearch: [
      "Dogfooding: Used the dashboard daily throughout my own 6-month body recomposition, and every design decision came from hitting my own pain points as a real user",
      "DEXA scan data was the most valuable and least accessible. Everyone I talked to had scans but never looked at the results more than once because the PDFs are dense and clinical. Making that data visual and trackable over time was the breakthrough insight",
    ],
    failures: [
      "First version tried to auto-import data from 6 different sources including Apple Health and Garmin. The integration complexity was unsustainable. Each API had different auth flows, rate limits, and data formats. Cut to 3 core sources (Strava, DEXA, COROS) that covered 90% of the value with 50% of the effort",
      "Originally displayed all metrics on a single dashboard page. Information overload made it useless. I couldn't find what I needed quickly. Reorganized into focused views: Training, Body Composition, and a daily summary. Usage went from checking once a week to checking daily",
    ],
    strategy:
      "Target customer: People pursuing body recomposition, specifically fat reduction and muscle increase, who track data across multiple devices and want actionable insights, not just more charts. Competitive landscape: Strava is social but not analytical. TrainingPeaks has deep analytics but no body composition. No product unifies training load with body composition tracking. Product thesis: The value isn't in collecting data, it's in connecting data across sources to surface insights no single app can provide. Current status: Testing with Everfit Motion gym community after proving the system on myself with 6 months of results.",
    features: [
      {
        title: "Body Composition Tracking",
        description:
          "Most fitness apps track weight, but weight alone is misleading during recomposition because you can gain muscle and lose fat while the scale barely moves. The progress dashboard shows body fat percentage, lean mass gained, and fat lost separately. The scan summary calculates net recomposition and weekly fat loss rate so you can see if your program is actually working.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/progress.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/scan-summary.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/body-composition.png",
        ],
      },
      {
        title: "Data Source Integrations",
        description:
          "Fitness data lives in silos. Strava knows your cardio, COROS has your heart rate zones, and BodySpec has your DEXA scans. I built integrations for all three so everything feeds into one dashboard. Strava syncs automatically via webhooks, COROS imports via .FIT files, and DEXA scans are parsed directly from PDF. Zero manual entry after initial setup.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/strava-integration.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/data-sources.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/dexa-integration.png",
        ],
      },
    ],
  },
  {
    slug: "macro-chef",
    title: "Macro Chef",
    subtitle: "AI-Powered Meal Planning & Nutrition Tracker",
    screenshot:
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/landing-hero.png",
    screenshots: [
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/landing-hero.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-engine.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/build-meal.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/mode-selection.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-plan-settings.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/pantry.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/shopping-list.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/food-preferences.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/preferred-proteins.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/health-goals.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/macro-targets.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/macro-targets-detail.png",
      "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/loading.png",
    ],
    liveUrl: "https://health.jonnymartin.blog/",
    description:
      "Nutrition is where most body recomposition programs fail. People know they need to hit their macros but don't know what to cook. Macro Chef is an AI-powered meal planner that takes your exact macro targets, dietary restrictions, and available ingredients, then generates recipes that actually fit. Three modes (Quick Meal, Meal Prep, Pantry Raid) for different needs on Tuesday night vs. Sunday afternoon. I built it because the #1 question from our gym community was 'What should I eat to hit my goals?' and nothing on the market answered it.",
    pitch:
      "The hardest part of any body recomposition program isn't the workout, it's the nutrition. Most people give up because they can't figure out what to eat to match their specific goals. Macro Chef solves this with AI: tell it your macro targets, dietary restrictions, and what's in your pantry, and it generates personalized recipes in under 3 seconds. Describe what you ate in plain text and the AI extracts the macros. No barcode scanning, no food database searching, just talk to it like a person. I'm testing it with our gym community, Everfit Motion.",
    problem:
      "Knowing what to eat to match your specific fat loss and muscle gain goals is left entirely to guesswork. MyFitnessPal tracks food but doesn't generate plans. Generic meal plans fail because everyone has different dietary constraints, preferences, and goals. The result: people know their macro targets but have no idea what to cook to hit them, and the friction of manual logging means most give up within a week.",
    tags: ["AI", "Nutrition", "Claude API"],
    stack: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Anthropic Claude API",
      "TailwindCSS",
    ],
    featured: true,
    callout: "AI meal plans in under 3 seconds · Plain-text macro logging",
    category: "software",
    repos: [{ name: "health", role: "AI meal planning engine" }],
    highlights: [
      "Claude-powered meal planning: generates recipes based on macros, goals, and available ingredients",
      "Three planning modes (Quick Meal, Meal Prep, Pantry Raid) for different contexts",
      "Plain-text meal logging: describe what you ate and AI extracts the macros",
      "Personalization engine: dietary restrictions, cuisine preferences, spice tolerance, preferred proteins, and cooking skill all fed into the AI prompt",
      "Weekly meal prep with consolidated, recipe-grouped shopping lists",
    ],
    outcomes: [
      "AI meal planning generating nutritionally-targeted recipes in under 3 seconds via Claude API",
      "Meal logging time reduced from 5 minutes to 30 seconds with plain-text AI extraction",
      "Full personalization system ensuring every generated recipe matches user constraints and preferences",
    ],
    decisions: [
      "Chose Claude over GPT for meal planning because of longer context windows. The prompt includes full macro targets, dietary restrictions, available ingredients, and recent meal history",
      "Replaced barcode scanning with plain-text AI extraction after dogfooding showed the friction of manual logging killed adherence",
      "Three distinct planning modes instead of one generic planner because the use case is fundamentally different when you need dinner in 20 minutes vs. prepping meals for the week",
    ],
    teamContext:
      "Built as the nutrition companion to my fitness dashboard during a 6-month body recomposition program. The AI integration work draws on my experience orchestrating third-party APIs at Treasure DAO and building data-driven product features at Bandai Namco and Big Fish Games.",
    userResearch: [
      "Talked to members of Everfit Motion (our gym community), and most tracked nutrition in spreadsheets or not at all. The gap wasn't motivation, it was that existing tools (MyFitnessPal, Cronometer) don't generate plans matched to your specific goals",
      "The #1 question from gym members was 'What should I eat to hit my goals?' Meal planning matched to specific macro targets and body recomposition phases was the killer feature they couldn't find anywhere else",
    ],
    failures: [
      "Built an elaborate meal logging UI with barcode scanning and food database search. Never used it because there was too much friction during a busy training day. Replaced it with a Claude-powered approach: describe what you ate in plain text, and AI extracts the macros. Logging time went from 5 minutes to 30 seconds",
    ],
    strategy:
      "Target customer: People pursuing body recomposition who know their macro targets but struggle with what to actually eat. Competitive landscape: MyFitnessPal tracks food but doesn't generate plans. Cronometer is detailed but doesn't connect to goals. No product generates personalized meal plans matched to specific body composition targets. Product thesis: The AI meal planner is the differentiator: nutrition matched to your specific goals is the hardest problem to solve and the one most people give up on. Current status: Testing with Everfit Motion gym community.",
    features: [
      {
        title: "AI Meal Planning Engine",
        description:
          "Nutrition is where most recomposition programs fail. People know they need to hit their macros but don't know what to cook. The AI planner takes your exact macro targets, dietary restrictions, and available ingredients, then generates recipes that actually fit. Three modes (Quick Meal, Meal Prep, Pantry Raid) because users have different needs on Tuesday night vs. Sunday afternoon.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-engine.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/build-meal.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/mode-selection.png",
        ],
      },
      {
        title: "Meal Prep & Shopping",
        description:
          "Meal prep is the bridge between planning and execution. The planner lets you set meals per day, servings per recipe, and max prep time, then generates a full week of meals with a consolidated shopping list. Items are grouped by recipe so you know exactly why each ingredient is on the list.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/meal-plan-settings.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/pantry.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/shopping-list.png",
        ],
      },
      {
        title: "Personalization & Preferences",
        description:
          "Generic meal plans fail because everyone has different constraints. The preference system captures dietary restrictions, cuisine preferences, spice tolerance, preferred proteins, food dislikes, cooking skill, and health goals, all fed into the AI prompt so every recipe is personalized. Macro targets are fully editable so the app grows with your goals.",
        screenshots: [
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/food-preferences.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/health-goals.png",
          "https://lohuzsjnztefixqbaoqf.supabase.co/storage/v1/object/public/portfolio-screenshots/macrochef/macro-targets.png",
        ],
      },
    ],
  },
  {
    slug: "krysta-mae-ceramics",
    title: "Krysta Mae Ceramics",
    subtitle: "Brand Identity & E-Commerce Website",
    category: "design",
    liveUrl: "https://krystamae.com",
    screenshot: "/screenshots/krysta-mae-home.png",
    description:
      "Complete brand identity and Squarespace e-commerce build for Krysta Mae, a ceramic artist creating handcrafted work inspired by travel, home, and California landscapes. I designed the logo, developed the brand system, built the website from scratch, shot all product and lifestyle photography, and wrote every line of copy. The site is organized around narrative-driven collections rather than traditional product filtering, with storytelling as the architecture.",
    pitch:
      "Krysta had beautiful work but no cohesive visual system to present it. I wanted to create a brand universe that felt like an extension of her studio: quiet, intentional, and grounded. Instead of a typical e-commerce grid, I organized the shop around seasonal and mood-based collections with narrative intros. The goal was to make browsing feel like discovering, not shopping.",
    problem:
      "Krysta's ceramics spoke for themselves in person, but online she had no visual identity: no logo, no consistent photography, no brand voice. Her work needed a digital home that could convey the same warmth and tactile quality that makes handmade ceramics special.",
    tags: ["Branding", "E-Commerce", "Photography"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Logo",
      "Squarespace Website Build",
      "Product & Lifestyle Photography",
      "Copywriting & Brand Voice",
    ],
    highlights: [
      "Complete brand identity: logo, color palette, typography, and brand guidelines",
      "Narrative-driven e-commerce organized by seasonal collections rather than product categories",
      "Full product and lifestyle photography shoot with soft natural light highlighting ceramic textures and glaze details",
      "Custom copywriting in a poetic, story-led voice guiding discovery through each collection",
      "Mobile-first responsive design with custom CSS grid layouts",
      "Integrated e-commerce with streamlined checkout and inventory management",
    ],
    outcomes: [
      "Delivered a complete brand asset library usable across print, digital, and packaging",
      "Photography library spanning product shots, lifestyle imagery, and studio behind-the-scenes",
      "Narrative-organized shop enabling intuitive product discovery without traditional filtering",
      "Performant, accessible website functioning as both commerce platform and artistic portfolio",
    ],
    decisions: [
      "Organized shop by mood-based collections instead of product type, prioritizing storytelling over conventional e-commerce to match how the artist thinks about her work",
      "Chose earth-tone palette with quiet neutral accents because the brand needed to support the ceramics, not compete with them",
      "Shot all photography in natural light to highlight ceramic textures and glaze details. Studio lighting would have flattened the handmade quality",
      "Wrote all copy in a poetic voice rather than commercial tone because the audience values craft and intention over sales mechanics",
    ],
    teamContext:
      "Solo designer and creative director. I handled brand strategy, logo design, web development, art direction, photography, and copywriting. This was a full-scope engagement where I owned every creative decision from initial concept through final delivery.",
    userResearch: [
      "Spent time in Krysta's studio understanding her process, influences, and how she talks about her own work. The brand voice needed to sound like her, not like a marketing agency",
      "Studied how her existing customers discovered and purchased her work. Most came through Instagram and studio shows, meaning the website needed to convert warm referrals, not cold traffic",
      "Analyzed competitor ceramic artist sites and found most defaulted to generic gallery templates. The opportunity was in creating something that felt as intentional as the work itself",
    ],
    failures: [
      "Initial logo concepts were too decorative and competed with the ceramics in product photography. Simplified to a clean wordmark that recedes behind the work",
      "First site structure had separate pages per collection. Realized visitors wanted to browse across collections fluidly, not click through multiple pages. Consolidated to a scroll-based gallery approach",
    ],
    strategy:
      "The website needed to serve two audiences: existing followers from Instagram who wanted to purchase, and galleries or press who needed to evaluate the work at a glance. The narrative collection structure handles both: casual browsers get drawn into the story, while professionals can quickly scan the range and quality of work.",
  },
  {
    slug: "joan-pinto-ceramics",
    title: "Joan Pinto Ceramics",
    subtitle: "Website Migration & E-Commerce Redesign",
    category: "design",
    liveUrl: "https://www.joanpintoceramics.com",
    screenshot: "/screenshots/joan-pinto-home.png",
    description:
      "Migrated and rebuilt Joan Pinto's ceramic art website from Wix to Squarespace. Joan creates handbuilt ceramics, including botanical studies, textured vessels, and sculptural wall pieces. The redesign introduced a gallery-like browsing experience with proper shop organization across five product categories, full SEO optimization, and a backend structure Joan could manage independently.",
    pitch:
      "Joan's Wix site was becoming limiting as her collection grew. The layout couldn't accommodate new categories, the shop was disorganized, and the overall feel didn't match the quality of her work. I rebuilt everything on Squarespace with a design philosophy centered on visual restraint: generous white space, soft tones, and minimal styling so the ceramics became the focal point. The layout rhythm was designed to encourage slow, contemplative browsing, like walking through a gallery.",
    problem:
      "Joan's existing Wix site was outgrowing her practice. Adding new products was cumbersome, the shop lacked proper categorization, and the site's generic template didn't reflect the intentional, handmade quality of her ceramics. She needed a platform she could manage herself without sacrificing design quality.",
    tags: ["E-Commerce", "Migration", "Design"],
    stack: ["Squarespace", "Custom CSS", "SEO"],
    featured: false,
    deliverables: [
      "Wix to Squarespace Migration",
      "Website Redesign & Build",
      "Shop Organization & Product Setup",
      "SEO Optimization",
    ],
    highlights: [
      "Full platform migration from Wix to Squarespace preserving brand continuity and existing content",
      "Shop organized into five curated categories: Plates, Bowls, Vases, Wall Pieces, and Sculptures",
      "Complete SEO setup: titles, descriptions, slugs, and alt text across every page and product",
      "Gallery-paced layout designed for contemplative browsing with generous whitespace",
      "Backend structured for easy self-service updates so Joan manages content independently",
      "Inventory tracking, pricing, and sold-out states configured across all products",
    ],
    outcomes: [
      "Seamless migration with zero content loss, with fonts, layout patterns, and brand voice preserved",
      "Organized product catalog enabling collectors to browse by category for the first time",
      "Clean, readable URLs and complete SEO metadata improving search discoverability",
      "Self-manageable backend allowing Joan to add products and update content without developer help",
    ],
    decisions: [
      "Preserved the original site's brand feel during migration rather than starting fresh because continuity mattered more than novelty for her existing collector audience",
      "Chose photography-led design over decorative elements because Joan's natural light imagery was strong enough to carry the aesthetic without embellishment",
      "Simplified navigation to four core sections rather than exposing every category in the menu, reducing cognitive load for first-time visitors",
      "Configured sold-out states to keep items visible rather than hiding them because collectors want to see the full range even when pieces are unavailable",
    ],
    teamContext:
      "Solo designer handling the full migration: auditing the existing Wix site, mapping content to the new structure, designing the Squarespace build, configuring the shop and SEO, and training Joan on self-service management.",
    userResearch: [
      "Audited Joan's Wix site and cataloged every page, product, and content block to ensure nothing was lost in migration",
      "Joan described her ideal browsing experience as 'walking through a quiet gallery,' and that became the design north star for spacing, pacing, and visual hierarchy",
      "Talked to several of her collectors who said they often revisited the site to check for new pieces, so the new layout prioritized 'what's new' visibility",
    ],
    failures: [
      "Initially designed the homepage with a large hero video. Joan preferred a static, image-forward approach that loaded faster and felt more aligned with her quiet aesthetic. Replaced with a curated image grid",
      "First product page layout showed all details upfront: dimensions, materials, price, description. Collectors found it overwhelming. Streamlined to essentials with expandable sections for details",
    ],
    strategy:
      "Joan's website serves a specific audience: collectors and gallery visitors who already appreciate handmade ceramics. The design strategy prioritized artistic integrity over commercial pressure: no popups, no urgency tactics, no aggressive CTAs. The calm, gallery-like experience reflects the values of both the artist and her audience.",
  },
  {
    slug: "fergus-folan-ceramics",
    title: "Fergus Folan",
    subtitle: "Brand Identity & E-Commerce for Ceramic Guitar Slides",
    category: "design",
    liveUrl: "https://ceramicslides.com",
    screenshot: "/screenshots/ceramicslides-home.png",
    description:
      "Full brand identity and e-commerce website for Fergus Folan, a blues guitarist who handcrafts ceramic guitar slides. This project required building a brand that bridged two worlds, music and ceramics. I designed the logo, built the Wix e-commerce site, organized approximately 100 one-of-a-kind slides with individual product names and photography, and produced video content showing the craft process. The brand needed to speak to guitarists while honoring the artisanal quality of each piece.",
    pitch:
      "Fergus doesn't sell generic guitar accessories. Each slide is a one-of-a-kind ceramic piece thrown on a wheel and finished with unique glazes. The brand needed to convey that these are handmade instruments, not factory products. I designed a custom monogram combining guitar headstock aesthetics with musical symbolism, established an earthy, music-forward visual system, and built a shop that could handle ~100 individually named products while keeping the browsing experience manageable.",
    problem:
      "Fergus had a growing collection of handmade ceramic guitar slides but no way to sell them online. Each piece is unique, with different glazes, dimensions, and tonal qualities, so a traditional product grid wouldn't work. He needed a brand identity that positioned his slides as artisanal instruments, not cheap accessories, and an e-commerce experience that could showcase ~100 one-of-a-kind items.",
    tags: ["Branding", "E-Commerce", "Video"],
    stack: ["Wix", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Custom Monogram",
      "Wix E-Commerce Website",
      "Product Photography",
      "Video Production",
    ],
    highlights: [
      "Custom 'ff' monogram combining guitar headstock aesthetics with musical infinity symbolism",
      "E-commerce setup organizing ~100 one-of-a-kind slides with individual names, dimensions, and photography",
      "Professional product photography with consistent lighting across the full catalog",
      "Short-form video content showing the throwing and glazing process",
      "Category organization with sold-out state management for unique pieces",
      "Earthy, music-forward visual system inspired by ceramic glazes and blues culture",
    ],
    outcomes: [
      "Fully branded online store converting Fergus from word-of-mouth sales to a scalable e-commerce operation",
      "Complete product catalog with individual photography, naming, and descriptions for ~100 slides",
      "Video content library connecting customers to the craft process behind each piece",
      "Manageable backend system allowing Fergus to add new slides as he produces them",
    ],
    decisions: [
      "Built on Wix instead of Squarespace because Fergus needed a platform he could update himself, and Wix's product management UX was more intuitive for someone managing 100+ unique items",
      "Designed a custom monogram rather than a wordmark because the 'ff' symbol works at small sizes on packaging and product labels where a full logo wouldn't",
      "Invested in video content early because guitarists want to hear and see a slide before buying, so demonstration videos became the primary conversion driver",
      "Named each slide individually rather than using generic SKUs, treating each piece as named art reinforced the handmade positioning",
    ],
    teamContext:
      "Solo creative lead handling brand strategy, logo design, web development, art direction, product photography, and video production. This project required bridging two distinct communities, ceramic artists and blues musicians, into one coherent brand.",
    userResearch: [
      "Spent time with Fergus in his studio understanding the relationship between clay, glaze, and tonal quality. Each slide sounds different based on its material and shape, which informed how I wrote product descriptions",
      "Researched the guitar slide market and found that most competitors sell mass-produced glass or metal slides, so Fergus's handmade ceramic slides occupied a completely uncontested niche",
      "Talked to blues guitarists about how they shop for gear, and they trust video demonstrations and word-of-mouth from other players over product descriptions",
    ],
    failures: [
      "First version of the shop displayed all ~100 slides in a single grid. Overwhelming. Added category organization by glaze type and size range, which matched how guitarists actually browse for tone",
      "Initially shot product photography on a white background. The slides looked generic and lost their handmade character. Switched to a warm, textured background that reinforced the craft aesthetic",
    ],
    strategy:
      "Fergus's audience is niche but passionate: blues and slide guitar players who care about tone and craftsmanship. The brand leans into authenticity over polish. The video content strategy was deliberate: a 30-second clip of someone playing a ceramic slide converts better than any product description. The e-commerce platform enables Fergus to scale beyond local sales and guitar shows to reach players worldwide.",
  },
  {
    slug: "wendy-friedman-ceramics",
    title: "Wendy Friedman Ceramics",
    subtitle: "Brand Identity & Portfolio Website",
    category: "design",
    liveUrl: "https://wendyfriedmanceramics.com",
    screenshot: "/screenshots/wendy-friedman-home.png",
    description:
      "Brand identity and Squarespace website for ceramic artist Wendy Friedman. Unlike the other ceramic artist projects, Wendy's site isn't a traditional e-commerce store. It's an inquiry-based experience where visitors browse the work and reach out directly for custom commissions. I designed the logo, built the site, shot all product photography, and crafted copy that reflected Wendy's quiet, intentional approach to hand-thrown ceramics.",
    pitch:
      "Wendy didn't want a shop. She wanted a digital extension of her studio. Every design element was chosen to echo her handmade practice: neutral palette, soft typography, generous whitespace. The site uses an inquiry-based flow instead of an add-to-cart model because Wendy's work is personal and she prefers conversation over transactions. The contact forms are warm and inviting, encouraging dialogue rather than orders.",
    problem:
      "Wendy needed an online presence that reflected the spirit of her hand-thrown ceramics without turning her practice into a transactional experience. Standard e-commerce templates felt wrong for work that's personal and process-driven. She needed a space that was simple, personal, and beautiful: a portrait of her practice, not a storefront.",
    tags: ["Branding", "Photography", "Design"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Logo",
      "Squarespace Website Build",
      "Product & Studio Photography",
      "Copywriting",
    ],
    highlights: [
      "Clean, grounded logo reflecting warmth and restraint, designed for print, digital, and packaging",
      "Inquiry-based shop flow replacing traditional e-commerce with warm contact forms encouraging personal conversation",
      "Custom studio photography emphasizing natural textures, glazes, and behind-the-scenes process",
      "Poetic copy reflecting Wendy's voice and rhythm throughout the site",
      "Mobile-optimized gallery layouts with calm, gallery-like browsing experience",
      "Three-section architecture (Work, Inquire, About) keeping navigation intentionally simple",
    ],
    outcomes: [
      "Complete visual identity system with logo, color palette, and brand guidelines",
      "Professional photo library of 13+ product images and studio portraits",
      "Conversion-friendly design supporting custom orders through inquiry rather than cart",
      "Authentic digital representation described as 'a portrait in digital form'",
    ],
    decisions: [
      "Chose inquiry-based flow over traditional e-commerce because Wendy's work is custom and personal, and she values the conversation that leads to a commission more than transactional efficiency",
      "Limited the site to three sections (Work, Inquire, About) instead of expanding with a blog or events page. Restraint in navigation mirrors the restraint in her ceramics",
      "Shot portraits of Wendy at work alongside product photos because the artist and the process are inseparable from the work, and collectors want to know who made their piece",
      "Used neutral palette with generous whitespace throughout so the design recedes and the ceramics are always the focal point",
    ],
    teamContext:
      "Solo designer and creative director handling brand strategy, logo design, web development, art direction, photography, and copywriting. This was a deeply collaborative engagement where every decision was grounded in understanding Wendy's artistic values and practice.",
    userResearch: [
      "Visited Wendy's studio multiple times to understand her process. The meditative quality of her throwing practice directly informed the calm, unhurried feel of the website",
      "Wendy described her ideal customer interaction as 'a conversation over tea, not a transaction at a register,' and this framed the entire inquiry-based approach",
      "Studied how other ceramic artists with inquiry-based models presented their work. Most buried the contact form, creating friction, so I made inquiry the second most prominent section after the work itself",
    ],
    failures: [
      "First design draft had too many decorative elements: custom borders, textured backgrounds, illustrated accents. Wendy's feedback was that it felt 'busy.' Stripped it back to pure whitespace and typography, which was exactly right",
      "Initially organized the Work section chronologically. Wendy preferred to curate by mood and form rather than timeline. Reorganized to let her arrange pieces as she would arrange a gallery wall",
    ],
    strategy:
      "Wendy's website isn't trying to maximize sales. It's trying to attract the right customer. Someone who discovers her work online and takes the time to write a personal inquiry is exactly the type of collector she wants. The inquiry-based model acts as a natural filter: people who value handmade, personal objects self-select through the process.",
  },
  {
    slug: "nancy-takaichi",
    title: "Nancy Takaichi",
    subtitle: "Brand Identity & Portfolio for Plein Air Painter",
    category: "design",
    liveUrl: "https://www.nancytakaichi.com",
    screenshot: "/screenshots/nancy-takaichi-home.png",
    description:
      "Brand identity and Squarespace website for Nancy Takaichi, a plein air oil painter specializing in California landscapes, florals, and urban scenes. This was the only non-ceramics project in my design portfolio. Nancy paints outdoors, capturing light and place in oil. I organized her work into six thematic collections, designed a calm typographic brand system, shot environmental portraits of her painting outdoors, and built a site that functions as both a gallery and a commerce platform for collectors.",
    pitch:
      "Nancy's paintings are about light, pattern, and the specific feeling of a place: coastal fog, Sierra granite, the geometry of an urban street. The website needed to honor that sense of place by organizing work into thematic collections rather than a generic gallery. Each collection opens with a narrative introduction framing the emotional and visual essence of the work. The brand system is calm and elegant, with soft whites and earthy tones that mirror her painted color range.",
    problem:
      "Nancy had a growing body of plein air work spanning years and multiple geographies but no organized way to present it. Her paintings were scattered across social media and local gallery shows. Collectors had no way to browse her full range, and galleries evaluating her work had to piece it together from fragmented sources.",
    tags: ["Branding", "Gallery", "Design"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Brand Identity & Logo",
      "Squarespace Website Build",
      "Environmental Portrait Photography",
      "Collection Curation & Copywriting",
    ],
    highlights: [
      "Six thematic collections: Coastal, Country, Floral, The Sierras, Urban, and Still Life, plus a Sold Work archive",
      "Calm, elegant logo and typography system matching her refined plein air aesthetic",
      "Environmental portraits capturing Nancy painting outdoors in her natural setting",
      "Narrative collection introductions framing the emotional context of each body of work",
      "Clean grids with generous spacing designed for calm, gallery-like browsing",
      "Product pages with medium, size, and narrative context connecting buyers to individual pieces",
    ],
    outcomes: [
      "Refined visual identity amplifying her plein air methodology and artistic voice",
      "Discoverable, theme-based galleries making it easy for collectors to explore by interest",
      "Warm, storytelling approach elevating both art and artist beyond a simple portfolio",
      "Sustainable, maintainable site structure Nancy can update as she completes new work",
    ],
    decisions: [
      "Organized by theme (Coastal, Sierras, Urban) instead of chronology or medium because collectors browse by what resonates emotionally, not by when it was painted",
      "Kept sold work visible in a dedicated archive because it demonstrates range and provides social proof for new collectors, even when pieces are unavailable",
      "Shot environmental portraits of Nancy working outdoors rather than posed studio shots because her practice is defined by being in the landscape, and the photography needed to reflect that",
      "Used neutral palette with soft whites and earthy tones. The brand colors were derived from her paintings so the website feels like a natural extension of the work",
    ],
    teamContext:
      "Solo designer handling brand strategy, logo design, web development, art direction, environmental photography, and collection copywriting. This was my first project outside ceramics, applying the same design philosophy (restraint, storytelling, artist-centered decisions) to a different medium.",
    userResearch: [
      "Spent time with Nancy at a plein air painting session to understand her process. She sets up at a location and paints what she sees in a single session, which informed the 'sense of place' narrative throughout the site",
      "Nancy's existing audience came from local gallery shows and plein air painting events, so the website needed to extend those in-person encounters, not replace them",
      "Talked to gallery owners who carry Nancy's work, and they wanted a clean online portfolio they could share with collectors, confirming the need for a professional, curated presentation",
    ],
    failures: [
      "Initially designed the site with a single scrolling gallery of all paintings. With 50+ works it was overwhelming and offered no structure for discovery. The six thematic collections solved this by creating natural browsing paths",
      "First brand direction was too formal and gallery-corporate. Nancy's personality is warm and approachable. Softened the typography and added personal touches to the copy to match her voice",
    ],
    strategy:
      "Nancy's website serves three audiences: collectors who discover her at shows and want to see more, galleries evaluating her for representation, and fellow plein air painters who follow her work. The thematic collection structure serves all three: collectors browse by interest, galleries assess range and consistency, and fellow artists appreciate the dedication to specific subjects and locations.",
  },
  {
    slug: "anu-gandhi-ceramics",
    title: "Anu Gandhi Ceramics",
    subtitle: "E-Commerce Website for Handcrafted Pottery",
    category: "design",
    liveUrl: "https://www.anugandhiceramics.com",
    screenshot: "/screenshots/anu-gandhi-home.png",
    description:
      "Full e-commerce Squarespace website for Anu Gandhi, a ceramic artist based in Walnut Creek, California. Anu's pottery is inspired by the places she's lived, including Kerala, North Carolina, and California, and the site needed to convey that sense of place and memory. I built a clean, minimalist storefront with a product shop, artist gallery, FAQ section, and newsletter integration, all designed around Anu's tagline: 'Pottery Inspired By The Places We Live And Love.'",
    pitch:
      "Anu's work carries stories from three very different places: Kerala, North Carolina, and California. The website needed to feel like a bridge between those worlds. I built a Squarespace site that leads with storytelling: the homepage introduces Anu and her influences before showing a single product. The shop is clean and functional, but the real design work was in the pacing, making sure visitors understood the 'why' behind the pottery before they saw the 'what.'",
    problem:
      "Anu had a growing body of ceramic work and an active local following but no online presence to reach customers beyond markets and studio shows. She needed an e-commerce site that could handle shipping, inventory, and payments while still feeling personal and handmade, not like a generic online store.",
    tags: ["E-Commerce", "Design", "Branding"],
    stack: ["Squarespace", "Custom CSS"],
    featured: false,
    deliverables: [
      "Squarespace E-Commerce Website",
      "Shop Setup & Product Configuration",
      "Brand Styling & Visual Direction",
      "Newsletter Integration",
    ],
    highlights: [
      "Storytelling-first homepage introducing the artist's background and influences before showcasing products",
      "Full e-commerce setup with product catalog, shopping cart, and shipping configuration",
      "Free shipping promotion system with discount code integration (SHIP100 for orders over $100)",
      "Clean, minimalist design with generous whitespace and grid-based responsive layouts",
      "Newsletter signup integration for ongoing customer engagement",
      "Wave and jagged decorative highlights on key headings adding handmade personality to the typography",
    ],
    outcomes: [
      "Fully operational e-commerce site enabling Anu to sell pottery beyond local markets for the first time",
      "Shipping, returns, and payment policies professionally configured and clearly communicated",
      "Mobile-responsive design ensuring a smooth browsing and purchasing experience across devices",
      "Self-manageable platform allowing Anu to add new products and update inventory independently",
    ],
    decisions: [
      "Led with the artist's story on the homepage instead of products. Anu's pottery is deeply personal, and customers who understand the inspiration behind the work become loyal repeat buyers",
      "Added decorative wave elements to headings, a subtle visual nod to the handmade nature of the work that breaks the rigidity of a typical grid layout",
      "Configured a free shipping threshold ($100) rather than flat-rate free shipping, which encourages larger orders while keeping margins sustainable for a solo artist",
      "Kept the navigation simple: Shop, About, Gallery, FAQs, Contact. Every page earns its place, no filler sections",
    ],
    teamContext:
      "Solo designer and developer. I built the complete Squarespace site from scratch, configured the e-commerce backend, established the visual direction, and set up all shipping and payment policies. Anu and I are connected through the pottery studio community.",
    userResearch: [
      "Anu described her ideal customer as someone who 'treasures handmade objects and wants to know the story behind them,' which framed the storytelling-first approach to the homepage",
      "Observed that Anu's strongest sales channel was in-person markets where she could tell her story, so the website needed to replicate that personal connection digitally",
      "Reviewed other ceramic artist e-commerce sites and found that most jumped straight to products, so leading with the artist's story and sense of place was a clear differentiator",
    ],
    failures: [
      "First homepage design was product-forward with a grid of ceramics above the fold. Felt impersonal and interchangeable with any pottery site. Restructured to lead with Anu's story and influences, with products introduced further down the page",
      "Initially set up the shop with detailed pottery-specific categorization (by technique, clay type, firing method). Anu's customers don't shop that way. They browse by what looks beautiful. Simplified to a visual browsing experience",
    ],
    strategy:
      "Anu's ceramics business is built on personal connection. People buy because they know her story and feel connected to the places that inspire her work. The website extends that personal brand from markets and studio shows to an always-available online storefront. The free shipping threshold encourages larger orders while the newsletter captures visitors who aren't ready to buy yet but want to stay connected.",
  },
  {
    slug: "private-listing-site",
    title: "A Password-Gated Listing Site",
    subtitle: "A Brochure Site for a Private Residential Rental",
    description:
      "A single-page, password-protected brochure site for a private rental, replacing a third-party listing the owner didn't control. Every route is gated — including the photo files themselves — the whole site is excluded from search three separate ways, and all inquiries route to a domain address so the owner's personal email is never exposed. All copy and photo ordering live in one file, so a content change touches nothing else.",
    pitch:
      "The owner had a listing on a third-party site. It worked, but as she put it, it's someone else's page and she'd rather have her own that she can manage and that stays live as long as she wants. So the brief was deliberately modest: same information, her domain, her control. Her framing of the bar was that this is about the photos and communicating the information, not a polished website displaying her work — it's a brochure. Building to that bar rather than past it was the whole job.",
    problem:
      "A rental listing needs to be shareable with prospects and invisible to everyone else. Third-party listing sites solve the first and not the second, and they can change, expire, or restructure without warning. But an owner-controlled site introduces the opposite risk: a public page indexed forever, with a home's photos and a personal email address attached to it.",
    tags: ["Next.js", "Access Control", "Client Work"],
    stack: [
      "Next.js",
      "TypeScript",
      "Resend",
      "Vercel",
    ],
    featured: false,
    callout: "Gated at the edge · Three layers of search exclusion · 46 photos as a walkthrough",
    category: "design",
    metrics: [
      { value: "46", label: "Photos, Sequenced" },
      { value: "3", label: "Layers Keeping It Unindexed" },
      { value: "1", label: "File To Edit The Listing" },
    ],
    highlights: [],
    outcomes: [
      "Gated every route in middleware, including the photo files themselves — without a valid signed cookie, an image request redirects to the gate rather than serving",
      "Compared the password server-side in constant time so it never reaches the client bundle, with 30-day sessions and an immediate global sign-out available by rotating the signing secret",
      "Kept the site off search three ways: noindex headers on every response, a blanket-disallow robots file, and the gate itself, which means crawlers only ever reach the password screen",
      "Routed inquiries through a form to a domain address, with a mailto fallback, so the owner's personal email never appears on the page",
      "Put all copy and photo ordering in a single config file — rent, dates, amenities, neighborhood text, policy, and which photo appears in which section — so a content change requires touching nothing else",
      "Used all 46 photographs, grouped as a walkthrough of the house rather than curated down to a gallery, which answered an open question from the spec rather than deferring it",
    ],
    decisions: [
      "Built to the stated bar rather than past it. The client was explicit that this is about photos and information, not a showcase, so the site is a brochure and the engineering went into access control and maintainability instead of into interaction design",
      "Documented every place the build diverged from the spec, in the repo, with the reason for each — six changes made during the build, written down rather than silently absorbed",
      "Wrote down the accepted trade rather than overselling the gate: anyone with the link and the password can pass both along. It keeps the page off the open web, which is what was asked for, and it is not a secrecy guarantee",
      "Held the inquiry form disabled until the custom domain is verified, because sending from an unverified domain and falling back to a bouncing address is worse than a page that tells people to email directly — with the three places to re-enable it written into the README",
      "Named the licensed reference typeface first in the stack with the closest free match shipped behind it, so adding the licence later changes nothing else",
    ],
    teamContext:
      "Built solo for a private client, from a single discovery call. Client details are withheld here — the site is deliberately unlisted and password-gated.",
    userResearch: [
      "The whole flow came from how the owner actually shares the listing: she texts or emails the link with the password in the same message, prospects look, and everything after that happens over email. There is no funnel beyond that, so the site's only job is the look and the inquiry",
      "The spec's non-goals were as informative as its goals — a 'no longer available' state was raised and declined, which is why the site has no lifecycle logic to maintain",
    ],
    failures: [
      "The spec called for photos first with facts below. Built that way, the full-bleed hero obscured the text entirely, so the order was inverted to title and key details first with photos as their own section",
      "The spec said no street address anywhere. The copy has none, but several of the photographs still show the house number and street sign. That was raised with the client rather than quietly cropped, and left in at their choice",
    ],
    strategy:
      "The client wanted control and permanence, not sophistication — a page she can send, that stays up, that she isn't renting from anyone. So the build spends its complexity on the two things that actually matter for that: an access model that holds at the edge and covers the images, and a content model where the entire listing is one editable file. Everything else is deliberately plain, because a brochure that needs a developer to update is not control.",
    strategyPoints: [
      { label: "Gated At The Edge", text: "Middleware covers every route including the photo files. No cookie, no images." },
      { label: "Unlisted By Construction", text: "noindex headers, a blanket robots disallow, and a gate crawlers can't get past." },
      { label: "One File To Edit", text: "Copy, photo order, policy, and details all live in a single config module." },
      { label: "Honest About Limits", text: "The link and password can be forwarded. That trade is documented, not glossed over." },
    ],
  },
  {
    slug: "luxury-fragrance-platform-selection",
    title: "Platform Selection for a Luxury Fragrance House",
    subtitle: "A No-Code Evaluation for an Invite-Only, Pre-Launch Brand",
    description:
      "A platform evaluation and digital strategy for a luxury fragrance house building in stealth toward a later public launch. Two gated audiences, an iterative product model with no held inventory, and a founder who is digitally fluent but doesn't code and refuses to call a developer to swap a hero image — which ruled out every custom-build option before the evaluation started.",
    pitch:
      "The proposal opens by playing back what I heard, because everything downstream depends on getting it right. This is a venture, not a startup — steady growth matched to capacity, no investor-driven hockey stick — so the platform should be skeletal now with room to grow without ever being torn down. Stealth for the next year and a half, word of mouth only, two audiences behind a gate. Full self-edit, end to end. Given that last constraint, every option in the proposal is a no-code platform the founder fully controls. There is no custom-build path, and saying so explicitly was the most useful part of the document.",
    problem:
      "A pre-launch luxury brand with gated audiences has requirements that pull against each other. It needs commerce with customer-group pricing and application-only access, brand control fine enough for a luxury aesthetic, and an editing experience a non-developer will actually use — while avoiding the outcome the founder named directly, which is a duct-taped stack that has to be peeled apart in eighteen months.",
    tags: ["Strategy", "Platform Evaluation", "Client Work", "E-Commerce"],
    stack: [
      "Shopify",
      "Webflow",
      "BigCommerce",
    ],
    featured: false,
    callout: "3 finalists · 6 platforms evaluated · No custom-build path, by design",
    category: "design",
    metrics: [
      { value: "3", label: "Finalist Options" },
      { value: "2", label: "Gated Audiences Modeled" },
      { value: "0", label: "Custom-Build Options" },
    ],
    highlights: [],
    outcomes: [
      "Opened with a written playback of the discovery call — venture not startup, stealth through the launch window, two gated audiences, full self-edit, no CMS-migration trauma, recurring cost sensitivity — and asked for correction before going further",
      "Evaluated six realistic platforms and carried three forward: a commerce-first option with the strongest gating ecosystem, a brand-control option pairing a site builder with an external cart and a membership layer, and a third with native business-to-business customer groups and a page builder",
      "Wrote the rejections with reasons rather than omitting them, including one platform already ruled out on the call and two more rejected on maintenance burden and product-line direction",
      "Modeled both gated audiences explicitly: a hard-capped evaluation group on wholesale pricing with feedback forms, and an application-only list requiring a referrer, growing toward a soft cap at pre-launch pricing",
      "Modeled the product structure as it actually works — a repeating rendition pattern where the same name ships in multiple versions, sold across sizes and bundles, with batch production triggered by monthly invitation responses and no held inventory",
    ],
    decisions: [
      "Eliminated custom builds entirely, up front, and said why. The founder wants to swap a hero image without calling anyone; a custom build fails that test on day one no matter how well it's built, so including one as an option would have been flattering and useless",
      "Chose to name the real bottleneck rather than the technical one. The limiting factor is the founder's time producing refined, on-brand content — not the tooling — which changes what the platform needs to be good at",
      "Weighted the evaluation toward five-year durability over launch-day capability, because the explicit requirement was a stack that carries the brand to year three to five without a migration",
      "Kept recurring cost as a first-class criterion, adding tools only as they earn their seat, because the business is cash-flow negative during the stealth period",
    ],
    teamContext:
      "Independent consulting engagement — discovery call, written proposal, and a follow-up strategy regroup. The client is in stealth, so the brand is not named here.",
    userResearch: [
      "Two structured calls with the founder, with the proposal built from a playback of the first and revised against the second",
      "The founder's background in digital strategy and digital marketing at large financial institutions meant the proposal could skip platform basics entirely and argue at the level of trade-offs, gating mechanics, and migration risk",
    ],
    failures: [],
    strategy:
      "The proposal's structure is the argument: establish what was heard, get it confirmed, then let every recommendation fall out of it. The single constraint that determines the answer is full self-edit by a non-coding founder, and once that's stated plainly, whole categories of option disappear and the remaining evaluation gets honest. Skeletal now, expandable later, and never torn down — because a rebuild in eighteen months costs more than any feature gap on day one.",
    strategyPoints: [
      { label: "Playback First", text: "The proposal opens by restating what was heard and asks for correction before recommending anything." },
      { label: "One Deciding Constraint", text: "Full self-edit by a non-coding founder eliminates custom builds outright. Naming that early makes the rest of the evaluation honest." },
      { label: "Five-Year Test", text: "Options are weighted on whether they carry the brand to year three to five, not on launch-day feature lists." },
      { label: "The Real Bottleneck", text: "Content production, not tooling, is the limiting factor — which changes what the platform has to be good at." },
    ],
  },
  {
    slug: "fine-art-growth-strategy",
    title: "Fine Art Growth Strategy",
    subtitle: "A Six-Month Plan for a Painter With a Thousand Finished Works",
    description:
      "A growth strategy for an established plein-air painter whose constraint was never talent, reach, or supply. She had recognition, a loyal repeat-buying collector base, an audience of around a hundred thousand people, and over a thousand finished paintings sitting idle. The machinery around the art was the problem: two competing websites, a store converting far below benchmark, thousands of blog readers a year with no email capture, and most sales requiring her to be physically in the room.",
    pitch:
      "The honest read is that the inventory removes the ceiling. Reaching the target at a realistic blended price means selling a few hundred pieces a year — a pace the existing inventory can sustain for two to three years before counting a single new painting. So growth doesn't hinge on painting more, and it doesn't hinge on building a licensing business from scratch. It hinges on one thing: building the demand and the distribution to move the work that already exists. That reframing is the entire plan, and it turns an intimidating revenue goal into a solvable distribution problem.",
    problem:
      "Working artists are routinely advised to make more, post more, or license more. For an artist with a large finished inventory, all three are wrong answers — they add supply to a business whose actual constraint is channels. Meanwhile the revenue that does exist depends almost entirely on physical presence, which caps the business at the artist's calendar and concentrates it into one season.",
    tags: ["Growth Strategy", "E-Commerce", "Client Work"],
    stack: [],
    featured: false,
    callout: "4 pillars · Inventory-first · Channels, not more supply",
    category: "design",
    metrics: [
      { value: "4", label: "Strategy Pillars" },
      { value: "1,000+", label: "Finished Works To Distribute" },
      { value: "18mo", label: "Planning Horizon" },
    ],
    highlights: [],
    outcomes: [
      "Diagnosed the constraint as distribution rather than production, and built the whole plan on moving existing inventory rather than on making or licensing more",
      "Pillar one — fix the store so it sells: rebuild the homepage, product pages, and checkout path, consolidate two competing websites into one, and filter the bot traffic distorting the conversion numbers",
      "Pillar two — put the existing audience to work: capture blog readers, social followers, and in-person buyers into one email list, then sell to them with scheduled studio-release drops. The fastest revenue in the plan, because the audience already exists",
      "Pillar three — systematize what already works offline: turn event, open-studio, and word-of-mouth buyers into repeat year-round customers, and smooth a heavily seasonal revenue curve with a second release moment and quarterly online drops",
      "Pillar four — open volume and partner channels: multiple galleries, an interior-designer and trade program, and corporate and hospitality placements, where a single hotel needing art for eighty rooms is eighty pieces already painted",
      "Laid out a tiered price architecture — an accessible entry tier to move volume and win new collectors, the existing mid tier, and premium pricing on signature work to protect brand value — with a staged revenue path across six, twelve, and eighteen months",
    ],
    decisions: [
      "Led with the arithmetic rather than the tactics, because a revenue target only becomes credible once you show the pieces-per-year it implies and that the existing inventory can cover it for years",
      "Demoted licensing and consumer products to upside rather than making them a pillar. They're welcome, they already sell out, and the plan must not depend on standing up a new business line to hit its number",
      "Named the bot traffic distorting the store's conversion rate before recommending any conversion work, because optimizing against a contaminated denominator produces confident nonsense",
      "Recommended consolidating to one website even though the portfolio site refers real revenue, because split search authority and an extra step between wanting a piece and buying it cost more than the referrals are worth",
      "Wrote the current-state section as an honest ledger of what's working and what isn't, and kept specific client financials out of anything public",
    ],
    teamContext:
      "Independent consulting engagement for a working plein-air painter. Business specifics — revenue, conversion rates, and inventory economics — stay with the client; only the strategy shape is described here.",
    userResearch: [
      "Traffic analysis showed the artist's technique articles, not her homepage, were the single biggest source of site visitors — an audience arriving with genuine interest and no path to buy or subscribe",
      "Buyer behavior showed a strongly repeat-purchasing collector base, which is what makes the email pillar the fastest revenue in the plan rather than a long-horizon bet",
      "Inventory audit found that only a minority of finished works were listed for sale anywhere at all",
    ],
    failures: [],
    strategy:
      "Every plan for a working artist has to answer one question first: is the constraint supply or demand? Here it was unambiguously demand and distribution, and the plan is ordered by speed to revenue as a result — fix the store that already has traffic, activate the audience that already exists, systematize the offline sales that already happen, and only then open the slower partner and volume channels. Licensing sits on top as upside precisely so the plan doesn't depend on it.",
    strategyPoints: [
      { label: "Constraint Is Channels", text: "A thousand finished works means the answer is never 'paint more.' It's distribution." },
      { label: "Fastest Money First", text: "Pillars ordered by speed to revenue: existing traffic, then existing audience, then existing offline buyers, then new channels." },
      { label: "Tiered Pricing", text: "An accessible entry tier to win new collectors, without eroding premium pricing on signature work." },
      { label: "Upside, Not Dependency", text: "Licensing and consumer products are welcome additions the plan deliberately does not rely on." },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getDesignProjects(): Project[] {
  return projects.filter((p) => p.category === "design");
}
