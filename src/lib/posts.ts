export type Post = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  content: string[];
  source?: string;
};

export const posts: Post[] = [
  {
    slug: "how-intercom-restarted-their-company-in-a-weekend",
    title: "How Intercom Restarted Their Company in a Weekend",
    subtitle:
      "The playbook for pivoting an incumbent product to AI-first, from the people who actually did it.",
    date: "2024-12-02",
    tags: ["AI Strategy", "Product Management", "Case Study"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "At the Berkeley Haas AI Conference, I sat in on a panel with go-to-market leaders from Intercom, Perplexity, and OpenAI. The Intercom story stood out as one of the most dramatic examples of a company pivoting to AI-first — not over months of deliberation, but in a single weekend.",

      "## The Weekend That Changed Everything",

      "When ChatGPT launched in late 2022, Intercom's leadership team gathered that same weekend. Their conclusion was immediate and unambiguous: this technology would be completely game-changing to their company. What happened next was remarkable — they didn't form a committee or commission a strategy review. They ripped everything up.",

      "The roadmap. The company strategy. The metrics. The organizational structure. Even the company values. As their go-to-market leader put it: \"We kind of restarted the company.\"",

      "## Why Most Incumbents Can't Do This",

      "The speaker was candid about why this is nearly impossible for most companies. Intercom had hundreds of millions of dollars in revenue from their existing product. That's a machine that's working, generating real money. The natural instinct is to protect that machine — to keep making more money from what you've already built.",

      "But their CEO, Owen, made the counterintuitive call: if you look 3-5 years ahead, the world will be fundamentally different. The short-term pain of disrupting yourself is nothing compared to the existential risk of being disrupted by someone else. They had to invest now.",

      "## The Startup-Within-a-Startup (But Actually Done Right)",

      "Everyone talks about building a startup within a startup. Intercom actually did it in a way I haven't seen before. They created a completely self-contained, self-functioning team. This team sat in a different part of the office. They weren't burdened by any existing red tape. While the rest of the company went through transformation, this team had one mandate: just build.",

      "The key difference from typical innovation theaters: this wasn't a side project or a 20% time experiment. This was the company's future. They gave the team real autonomy, real resources, and real urgency. Once the product reached escape velocity, they merged it back into the main company.",

      "## The Market Validation",

      "The results speak for themselves. One year ago, Intercom's biggest go-to-market challenge was convincing prospects they even needed an AI agent for customer service. Today, that question literally never comes up anymore. The new question is: \"How do I know your AI agent is the best one?\"",

      "In traditional SaaS, a shift like that would take three years of market education. In the AI era, it happened in six months.",

      "## The Pricing Revolution",

      "Perhaps the boldest move was shifting to outcome-based pricing. Instead of charging per seat (the standard SaaS model), Intercom charges per resolution — they make money when their AI actually solves a customer's problem. This aligns incentives perfectly but requires massive customer education, especially for support leaders who've only ever bought seat-based products.",

      "## What This Means for Product Leaders",

      "Three takeaways I keep coming back to:",

      "**1. Speed of decision > quality of decision.** Intercom didn't have a perfect plan that weekend. They had conviction that the world was changing and that standing still was the riskiest option.",

      "**2. Real autonomy means real separation.** The startup-within-a-startup only works if the team is genuinely free from the parent company's processes, politics, and pace. Different office. Different rules. Different urgency.",

      "**3. Your pricing model is a product decision.** Moving from seats to outcomes isn't just a finance change — it fundamentally shapes how the product is built, measured, and sold. It forces you to optimize for customer value, not headcount.",

      "The AI era rewards companies that can move with startup speed while leveraging enterprise scale. Intercom showed that incumbents can do this — but it requires the willingness to tear down what's working today to build what will work tomorrow.",
    ],
  },
  {
    slug: "chat-is-ais-radio-drama",
    title: "Chat Is AI's Radio Drama",
    subtitle:
      "GitHub Next's thesis on why chatbots are a transitional form, not the destination.",
    date: "2024-12-09",
    tags: ["AI Products", "UX Design", "Product Thinking"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "One of the most thought-provoking talks at the Berkeley Haas AI Conference came from Idan Gazit, Senior Director of Research at GitHub Next — GitHub's internal R&D innovation lab within Microsoft. His central argument challenged an assumption most of us have internalized without questioning: that chat interfaces are the natural way to interact with AI.",

      "## The Television Analogy",

      "When television was invented, what was the most popular form of serialized content? Radio dramas. So what was the first television show? A camera pointed at people performing a radio drama — complete with props that made sound effects, like popping a balloon to simulate a gunshot.",

      "They didn't yet know the language of the new medium. Did they know that television would eventually produce MTV Cribs, or cinematic prestige TV? Of course not. Radio was what people knew, so radio was what they recreated.",

      "Idan's argument: we're at exactly this moment with AI. Chat is our radio drama. We default to chat because it's the obvious interface, the one that made ChatGPT a phenomenon. But that doesn't mean it's the best — or even a particularly good — way to interact with AI for most use cases.",

      "## The Ladder of AI Value",

      "Idan proposed a hierarchy of AI value that reframes how we should think about product design:",

      "**Highest value: Invisible.** You walk into the kitchen wanting a salad, and the cutting board and vegetables are already there. Like an invisible butler. You never think about it.",

      "**Next level: Predictive.** The AI guesses what you'll do next based on prior interactions. This is achievable today.",

      "**Current level: Conversational.** You tell the AI what you want. This works, but it's not the ceiling — it's closer to the floor.",

      "True \"AI native\" product design means finding the right moments and matching them with the right modalities. Sometimes that's chat. Sometimes it's proactive suggestions. Sometimes it's the AI silently doing something in the background you didn't even know you needed.",

      "## AI Makes Variants Cheap — And That Changes Everything",

      "Here's a concrete product insight I haven't seen discussed elsewhere. With AI, generating multiple variants of anything is nearly free. Need three approaches to a design? Three drafts of copy? Three code implementations? The marginal cost is close to zero.",

      "This changes how we measure success. If you generate three variants and one gets accepted, your acceptance rate is 33%. That sounds bad by traditional metrics. But the fact that you could explore three roads and pick the best one — that's actually the goal. That's AI-native thinking.",

      "Traditional product metrics were built for a world where creating each variant was expensive. We need new measurement frameworks for a world of abundance.",

      "## The Innovation Lab Playbook",

      "GitHub Next operates in a way that most corporate innovation labs talk about but few actually execute. Idan described it as \"the department of high-leverage bets\" — or more colorfully, \"the department of f*** around and find out.\"",

      "Their process: Every Thursday is demo day. People show off what they've been building. The first signal they look for: does this excite the other people in the room? If three people see a demo and say \"yeah, let's do that\" — that's the green light to continue.",

      "Then they extend the project for a few more weeks. Build the next stage. Try it on other people at GitHub. Expand to design partners outside GitHub. Iterate. Gather evidence. Only then do they go to leadership and say: \"Here's the bet. Here's why. Here's a working prototype.\"",

      "Nothing speaks like a prototype. \"As much as my official title is research,\" Idan said, \"it's not research — it's prototyping. Our job is to make.\"",

      "## Hybrids Win",

      "Idan's most personal advice was about career identity. Throughout his career, people asked: are you the best developer? No. The best designer? No either. So what's your value?",

      "\"I can glue those functions together because I live with one foot in either side. The ability to say I am self-capable of going from zero to one — today with AI, it's like wearing rocket boots. Hybridity was undervalued in the past. Now it's actually a superpower.\"",

      "This resonated deeply. In an era where AI can help anyone execute in any domain, the people who can see across boundaries — who understand product AND engineering AND design — become exponentially more valuable. The specialist advantage is shrinking. The hybrid advantage is growing.",

      "## The Takeaway",

      "We're in the radio drama phase of AI product design. The companies and builders who break out of the chat box — who discover the native language of this medium — will define the next era of software. The question isn't \"how do we make a better chatbot?\" It's \"what does AI interaction look like when we stop assuming it has to be a conversation?\"",
    ],
  },
  {
    slug: "automate-augment-stay-human",
    title: "Automate, Augment, Stay Human",
    subtitle:
      "Snowflake's three-pillar framework for deciding when and how to apply AI in any organization.",
    date: "2024-12-16",
    tags: ["AI Strategy", "Frameworks", "Enterprise"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "At the Berkeley Haas AI Conference, I heard dozens of takes on AI adoption. Most were either breathlessly optimistic or cautiously vague. The most useful framework came from a VP at Snowflake, who shared the three-pillar model they use internally to decide when and how to apply AI across a 9,000+ person organization.",

      "## The Framework",

      "It's deceptively simple. For any task or process, ask which category it falls into:",

      "**1. Repetitive? Automate it.**\nIf you're doing something repetitive and rote, find a way to automate it entirely. AI handles the work. You move on.",

      "**2. Creative? Augment it.**\nIf the work is creative — writing, design, strategy, analysis — AI does some of the work and you do some of the work. But you're ultimately creating the end product. Human + AI > either alone.",

      "**3. Judgment and social intelligence? Stay human.**\nIf it involves emotional intelligence, social connection, or nuanced judgment, don't use AI. Period. \"That's the way we're going to stay human, all the way through this process.\"",

      "The example for \"stay human\" was telling: when you want to give someone a promotion, talk about their performance, or engage with them personally — don't use AI to craft that communication. It comes from you as a human connecting with another human.",

      "## Why This Framework Works",

      "Most AI adoption frameworks I've seen are either too abstract (\"use AI strategically\") or too specific (\"use Claude for X, GPT for Y\"). This one operates at exactly the right level of abstraction — it gives you a decision rule for any situation without prescribing specific tools.",

      "It also avoids the two most common mistakes companies make with AI:\n\n- **Trying to automate everything**, including things that require human judgment (leading to bad outcomes and employee distrust)\n- **Not automating enough**, applying AI only to \"safe\" creative tasks while ignoring the massive efficiency gains in repetitive work",

      "## Real-World Examples",

      "### Automate: Job Descriptions",
      "Snowflake built an internal tool for generating job descriptions. The old process: 1-1.5 hours per posting — writing, reviewing previous JDs, manager review, multiple rounds. The new process: enter the job title and a few inputs, the tool searches internal and external data, and produces a polished JD in under 5 minutes. The speaker claimed they've already saved two years of cumulative people-time since launch.",

      "### Augment: Mentorship Matching",
      "They built an internal peer-to-peer mentorship program where AI handles the matching — analyzing profiles, preferences, and goals to pair mentors with mentees. The AI does the heavy lifting of finding good matches at scale, but humans still own the actual mentoring relationships.",

      "### Stay Human: Leadership and Communication",
      "The hard line: promotions, performance conversations, personal engagement. Even interview feedback, to some extent — while AI can help structure the process, human judgment in evaluating candidates remains irreplaceable. \"Leadership is absolutely a durable skill. An AI is still pretty far from motivating, inspiring, influencing, persuading.\"",

      "## Making AI Adoption Non-Scary",

      "One of the biggest barriers to AI adoption isn't technical — it's psychological. People are afraid AI will replace their jobs. The Snowflake team tackled this head-on with three steps:",

      "**Step 1: Education.** A 15-minute prompt engineering class for all employees. Not technical. Just \"how to talk to whatever natural language tool you have.\" Everyone takes it, practices, and then they work through exercises in groups.",

      "**Step 2: A comprehensive curriculum.** They created \"AI for Everyone\" — 10 internal courses covering AI concepts, Snowflake's specific products, and the history of AI. Live classes plus recorded sessions.",

      "**Step 3: Start with one thing.** After the training, every employee is asked to find one thing in their workday they can automate. Just one. They report back at the end of the week. This creates a virtuous cycle: once people see a small win, they look for the next one.",

      "\"Once they learn academically, once they have the framework, and once they actually play with the tools, it becomes much easier for adoption.\"",

      "## The Durable Skills That Survive AI",

      "Both speakers on this panel agreed on what will endure as AI handles more technical work:",

      "- **Leadership** — AI can't motivate teams or navigate organizational politics\n- **Judgment** — Navigating complex, gray-area decisions that require weighing competing interests\n- **Curiosity** — Not just using AI tools, but compulsively exploring new ones. \"Did you on a weekend say, 'I'm gonna download this and play with it'? That natural inclination to be curious, to pull threads, to experiment — that's gonna be super important.\"\n- **Performance mindset** — Openness to change, willingness to embrace new tools, resilience when things shift",

      "## My Takeaway",

      "The companies that will win AI adoption aren't the ones with the most sophisticated technology. They're the ones that give their people a simple framework for deciding what to automate, what to augment, and what to keep human — and then make it psychologically safe to experiment.",

      "Automate the repetitive. Augment the creative. Stay human where it matters. It's the simplest useful framework I've encountered for navigating the AI era.",
    ],
  },
  {
    slug: "speed-is-the-strategy",
    title: "Speed Is the Strategy: Inside Perplexity's Growth Playbook",
    subtitle:
      "How a flat org, relentless experimentation, and hiring for dopamine are beating Google at search.",
    date: "2024-12-23",
    tags: ["Growth", "AI Products", "Startups"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "Perplexity is doing something most people thought was impossible: competing with Google in search. At the Berkeley Haas AI Conference, their VP of Growth and Product, Rohan, laid out how they're doing it. The answer isn't a better algorithm or more data. It's speed.",

      "## The Mode Is Speed",

      "Perplexity's CEO has said publicly that the company's mode is speed. Rohan confirmed this isn't just a talking point — it's the operating system of the entire company. \"We live and die by just how fast we can move.\"",

      "Their competitive logic is straightforward: if you're building something genuinely new — a new category of how people search and access information — your product IS your marketing. As long as you can keep shipping products that are fundamentally different and fundamentally better, you'll keep acquiring users. The moment you slow down, competitors catch up.",

      "The question they ask themselves every single day: are we staying ahead of everyone by at least a couple of months?",

      "## Three Pillars of Speed",

      "Rohan broke their approach down into three components:",

      "**1. Hire for dopamine.**\nThey specifically hire people who \"get their dopamine hits off of speed and being able to ship and see impact as quickly as possible.\" This isn't about work ethic — it's about wiring. Some people light up when they ship something on Monday and see the data on Tuesday. Those are Perplexity people.",

      "**2. Develop killer intuition about focus.**\nSpeed without focus is just thrashing. The hardest part is knowing when to go all-in versus when to wait and see. \"To a certain extent, it's a little bit of guessing and you hope your intuition gets you there.\" This is an underappreciated skill — the ability to make fast, high-conviction bets about where to invest effort.",

      "**3. Empower every layer.**\nPerplexity runs an incredibly flat organization. There is no hierarchy of \"should I do this?\" The expectation for every person: you are in charge of this. You are going to move these metrics. You are going to drive this as aggressively as you can. No permission-seeking. No committee approvals.",

      "## The Experimentation Machine",

      "The section on experimentation was the most tactically rich part of the conversation. Perplexity runs what Rohan called \"an endless amount of experimentation\" on how they answer questions.",

      "The fundamental insight: the right answer format varies wildly by query type. If you search for a cooking recipe, you actually want a very long answer — almost a blog post. Other queries want concise, direct responses. The only way to discover these patterns is relentless A/B testing.",

      "Another surprising finding: onboarding length. Should you walk new users through the product, or just drop them in? After extensive testing, the winning approach has been to mostly just let people figure it out. Minimal hand-holding. Trust the product to be intuitive enough.",

      "\"That's something we're still tinkering with,\" Rohan admitted. But the willingness to keep tinkering, to never consider any part of the experience settled, is the point.",

      "## Hiring Underdogs",

      "When asked what qualities Perplexity looks for when hiring, Rohan's answer was surprising: underdogs.",

      "\"Who's the underdog? Who's going to take big risks? We hire a lot of founders. Have they tried to spin something up of their own and failed gloriously? That's the kind of stuff where we're like — dang, check mark, get him in here.\"",

      "They also rarely hire for defined roles. Instead, they hire for \"where the puck is going\" — deliberately ambiguous positions that expand rapidly as the company grows. They hire overqualified people for seemingly small roles, expecting those roles to balloon.",

      "## Why This Matters Beyond Perplexity",

      "You don't have to be competing with Google for the Perplexity playbook to be relevant. The underlying principles apply to any AI product:",

      "- **Your product velocity is your moat.** In a market where models improve monthly and competitors can clone features in weeks, the only sustainable advantage is shipping faster than everyone else.\n- **Flat orgs win in AI.** Permission hierarchies are a speed tax. Every layer of approval is time your competitors are using to ship.\n- **Hire for energy, not just experience.** People who viscerally enjoy shipping fast will outperform people who are merely competent but need deliberation cycles.\n- **Experiment on everything.** The intuitive answer is wrong more often than you think. Test aggressively, even on things that seem settled.",

      "Perplexity is proof that speed, combined with taste and relentless experimentation, can take on incumbents with 1000x more resources. In the AI era, being small and fast beats being big and slow every time.",
    ],
  },
  {
    slug: "the-death-of-the-5-year-roadmap",
    title: "The Death of the 5-Year Roadmap",
    subtitle:
      "How AI product teams actually plan when your January roadmap is obsolete by March.",
    date: "2024-12-30",
    tags: ["Product Management", "AI Strategy", "Planning"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "One of the clearest signals from the Berkeley Haas AI Conference was that traditional product planning is dead. Not dying — dead. Across three separate panels, product leaders from Adobe, YouTube, Intercom, Perplexity, and GitHub Next all said some version of the same thing: if you're building a 3-5 year roadmap in AI, you're wasting your time.",

      "## What Changed",

      "Chloe McConnell, Senior Director of PM at Adobe Express, put it most directly: \"The roadmap we thought we had in January feels almost irrelevant because things have moved so fast by November.\"",

      "This isn't the usual startup platitude about being agile. These are leaders at Adobe, YouTube, and Apple — companies that traditionally plan in multi-year cycles. The pace of change in AI has broken their planning frameworks.",

      "Consider: in the last 12 months, Box's CTO noted that 15 major frontier models were released — and each one was arguably the most impressive piece of engineering ever created. Every one of those releases potentially invalidates product assumptions, opens new capabilities, and reshuffles competitive dynamics.",

      "How do you roadmap against that?",

      "## What Replaces the Roadmap",

      "The answer across every panel was the same: frameworks and principles, not feature plans.",

      "**YouTube's Framework: Fame, Fortune, or Fun.**\nHeather Christmann shared that YouTube evaluates every creator product through three lenses: does it help creators achieve fame (reach, discovery), fortune (revenue, monetization), or fun (creative satisfaction)? If a product delivers at least one of those AND has daily utility (the Google \"toothbrush test\"), it's worth building. The specific features change constantly, but the framework is durable.",

      "**Adobe's Leapfrog Principle.**\nChloe described a planning exercise they use: \"Think about what might solve a problem today, but will this be relevant in six months? You're likely gonna leapfrog yourself four times in the next year. Can you skip the interim steps and go straight to the next one?\" Instead of building incrementally, they try to anticipate where the technology will be and build for that state directly.",

      "**Perplexity's Daily Question.**\n\"Are we staying ahead of everyone by at least a couple of months?\" That's it. Not a roadmap — a compass heading. Ship fast, measure constantly, adjust daily.",

      "## The Skills That Matter Now",

      "If you're a PM whose career was built on crafting beautiful 3-5 year roadmaps — the kind that used to earn you a senior or principal title — the game has changed. The new planning skills are:",

      "**Rapid intuition.** Can you quickly evaluate which opportunities are durable and which are hype? Michael Pratt from Apple framed it as being \"super tight and aligned on your actual core metrics\" — revenue or cost savings, regardless of whether AI is involved.",

      "**Iteration speed.** Chloe from Adobe talked about the mindset shift: \"We have to be really iterative and flexible. It's faster than some of us even expected.\" The ability to plan in 2-week cycles rather than 2-year cycles is now a core PM competency.",

      "**Framework thinking.** Instead of predicting specific futures, develop durable decision-making principles. YouTube's fame/fortune/fun, Adobe's leapfrog principle, Snowflake's automate/augment/stay-human — these are the artifacts that replace the roadmap.",

      "**Kill speed.** As important as shipping fast: knowing when to kill something fast. Multiple speakers mentioned the discipline of evaluating whether a feature will still be relevant when it ships, and cutting it if the answer is no — even if it's 80% built.",

      "## What This Means in Practice",

      "I think the practical implication is that AI product teams need to operate more like newsrooms than factories. A newsroom has a permanent editorial perspective (the framework), a rapid daily cycle (ship/learn/iterate), and the ability to pivot completely when the story changes.",

      "The factory model — plan the work, work the plan, measure against the plan — was built for a world where the inputs were predictable. That world is gone.",

      "Annual strategy still has a place. Quarterly goals still make sense. But the 3-5 year roadmap with specific features mapped to specific timelines? That's a fiction now. The best AI product teams have replaced it with something more honest: durable principles, aggressive experimentation, and the humility to admit they don't know what they'll be building six months from now.",
    ],
  },
  {
    slug: "managing-agents-is-the-new-core-skill",
    title: "Managing Agents Is the Most Important Skill Nobody's Teaching",
    subtitle:
      "Box's CTO on the shift from doing work to managing AI that does work — and why it changes everything.",
    date: "2025-01-06",
    tags: ["AI Agents", "Career", "Future of Work"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "The most jarring moment at the Berkeley Haas AI Conference came from Ben Kus, CTO of Box. He described how cutting-edge programmers work today, and it sounds nothing like what most people imagine.",

      "## The New Morning Routine",

      "A programmer on the bleeding edge of AI-assisted development gets to work and kicks off 10 to 20 agents to do things for them. Then they spend the rest of the day in a completely different mode: evaluating outputs.",

      "\"This agent did it wrong — that took thirty minutes. Nope, cancel that, throw that away, revert the branch. Oh, this one's good — continue down this path.\"",

      "It's not writing code anymore. It's managing a small army of AI workers, each of which can produce code 10-100x faster than a human, but with varying quality and direction. The skill isn't coding. The skill is orchestrating.",

      "## Why This Isn't Just About Programming",

      "Ben's argument is that this pattern will expand to every role. If AI agents can already write code, draft contracts, analyze data, create presentations, and respond to customer inquiries — then every knowledge worker will eventually need to manage agents that do their job.",

      "\"I almost think of it like management skills. At some point, probably every single person will be managing AI agents. They will have to get them to do work. They'll have to figure out if they did the right thing. They'll have to be responsible for it.\"",

      "This reframes the entire conversation about AI and jobs. The question isn't \"will AI replace my job?\" It's \"can I effectively manage AI that does my job faster than someone else can manage their AI?\"",

      "## The Surprising Parallels to People Management",

      "Here's what I found most counterintuitive: managing agents is weirdly similar to managing people.",

      "Give an agent vague, lazy instructions? You get vague, lazy output. Give it detailed context, clear objectives, and sophisticated framing? You get sophisticated results. Ben noted that even using \"please\" actually changed model behavior — the models pattern-match on the sophistication of the input.",

      "\"If you give it really stupid instructions, it'll give you a stupid result, because it's like — it must be the kind of thing I know how to talk to people like you. And so if you give it really sophisticated instructions, it'll give you sophisticated outputs.\"",

      "The one big difference from people management: micromanagement works. Agents don't get frustrated. They don't quit. They don't gossip about you. You can be incredibly specific, check their work constantly, and demand revisions — and they just keep going. For people who've been told their entire career that micromanagement is toxic, this is a mental shift.",

      "## The Skill Gap Is Real",

      "Ben compared the current moment to the early days of Google: \"There was a world before Google was well known, and some people who knew Google really well — you'd get them to search stuff for you. Those people were very valuable.\"",

      "Using AI agents effectively is currently that kind of rare, weird skill. Some people are 10x more productive with agents than others, not because of intelligence, but because of practice and technique.",

      "His advice was blunt: \"If you can't get a frontier model to do something you want, you're probably not managing it properly.\" GPT, Claude, Gemini — the frontier models are genuinely capable at the graduate or PhD level across many topics. If you're getting bad results, the problem is likely your instructions, not the model.",

      "## What to Do About It",

      "The uncomfortable truth: there's no class for this yet. No MBA curriculum teaches \"agent management.\" No certification exists. The only way to get good at it is to use agents constantly — for real work, not toy examples.",

      "Some practical starting points:",

      "- **Give agents real tasks.** Not \"write me a poem\" but \"analyze this competitive landscape and identify three positioning opportunities.\"\n- **Treat bad output as a prompt problem.** Before blaming the model, ask: did I give it enough context? Did I specify the format? Did I define what \"good\" looks like?\n- **Manage multiple agents simultaneously.** The power move isn't one agent doing one thing — it's orchestrating many agents in parallel, like Ben described with programmers.\n- **Develop evaluation skills.** The bottleneck isn't generation — it's judgment. Can you quickly assess whether an agent's output is good, fixable, or needs to be scrapped?",

      "The people who figure this out in the next 1-2 years will have the kind of career advantage that early internet adopters had in the late 90s. The people who don't will find themselves managed by people who did.",
    ],
  },
  {
    slug: "answer-engine-optimization",
    title: "Answer Engine Optimization: The New SEO Nobody's Talking About",
    subtitle:
      "How AI answer engines are disrupting traditional discovery and what it means for every product builder.",
    date: "2025-01-13",
    tags: ["Distribution", "AI Products", "Growth"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "The most forward-looking insight from the Berkeley Haas AI Conference didn't come from an AI company. It came from Rachel Wolin, CPO of Webflow, talking about how websites get discovered.",

      "## The Discovery Problem Is Being Rewritten",

      "For twenty years, the playbook for getting your product in front of people has been: SEO, paid ads, social distribution. Build a website, optimize for Google, buy some ads, post on social media. Everyone knows this playbook. It works. It's also being disrupted right now.",

      "The disruption: answer engines. When someone asks ChatGPT, Perplexity, or Claude a question, those tools don't just generate an answer from their training data — they read websites, synthesize information, and present a response. Your website might be the source of the answer without the user ever visiting your site.",

      "Rachel put it plainly: \"Traditionally, websites got discovered through search. They got discovered through ads. And now answer engines are really disrupting where their customers and potential prospects are coming from.\"",

      "## What Answer Engine Optimization Looks Like",

      "Answer Engine Optimization (AEO) is exactly what it sounds like: optimizing your content so that AI answer engines cite, reference, and recommend your product when users ask relevant questions.",

      "This is different from SEO in fundamental ways:",

      "- **SEO optimizes for ranking.** AEO optimizes for being the answer.\n- **SEO is about keywords.** AEO is about being the most authoritative, well-structured source on a topic.\n- **SEO drives clicks.** AEO drives citations and recommendations — which may or may not result in a click, but build brand authority in a new distribution channel.",

      "Rachel mentioned that 10+ companies have been funded in the answer engine optimization space in just the last six months. This is moving from theory to real investment.",

      "## Why This Matters for Product Builders",

      "If you're building a product right now — whether it's a SaaS tool, a consumer app, or a portfolio site — your distribution strategy needs to account for how AI tools will surface your content.",

      "Think about it: when a recruiter asks an AI \"who are the best product managers building AI-native products?\" or a customer asks \"what's the best tool for X?\" — the answer comes from somewhere. That somewhere is content on the internet that the model has been trained on or can access in real-time.",

      "The builders who understand this early will have an enormous advantage. They'll create content that's structured for AI consumption, not just human consumption. They'll think about their digital presence as training data, not just a marketing funnel.",

      "## Webflow's Strategic Bet",

      "Webflow is positioning themselves as thought leaders in this space, which makes strategic sense — they're a website platform, and the fundamental value of websites is shifting. If websites exist primarily as sources for answer engines rather than destinations for human visitors, that changes what you build and how you build it.",

      "Rachel described it as a \"leapfrog moment\" — while competitors focus on AI-generated prototyping, Webflow is investing in the enterprise features (brand design systems, security, compliance) that make websites production-ready for this new era of AI-mediated discovery.",

      "## The Practical Takeaway",

      "If you're building anything that needs to be found — a product, a personal brand, a business — start thinking about answer engine optimization now:",

      "- **Be the definitive source.** Answer engines prefer comprehensive, authoritative content. Depth beats breadth.\n- **Structure your content clearly.** Headers, bullet points, clear definitions — the same things that make content scannable for humans make it parseable for AI.\n- **Build in public.** Blog posts, case studies, project documentation — every piece of publicly accessible content is potential training data for answer engines.\n- **Think about citations, not just clicks.** When an AI tool recommends your product by name, that's a new form of distribution that doesn't show up in your analytics dashboard.",

      "The SEO era rewarded websites that played the Google algorithm. The AEO era will reward products and people who are genuinely the best answer to a question. That's a subtle but massive shift — and it's happening now.",
    ],
  },
  {
    slug: "build-first-title-second",
    title: "Build First, Title Second",
    subtitle:
      "Why every leader at the conference said the same thing: the best career move is to ship something.",
    date: "2025-01-20",
    tags: ["Career", "Building", "Product Management"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "I went to the Berkeley Haas AI Conference expecting to hear about AI strategy and go-to-market motions. I got that. But the through-line across every single session — from Adobe to Perplexity, from Box to Webflow — was something simpler: build things.",

      "## The Message Was Unanimous",

      "Rachel Wolin, CPO of Webflow, said it most directly: \"If you want to get a job, you are going to have to demonstrate that you are AI native. Have a portfolio of different kinds of projects.\" She wasn't speaking only to product managers. \"I say this not as just a product manager — if you're in finance, marketing, corp dev, it doesn't matter.\"",

      "Michael Pratt, Head of Product at Apple's Platoon: \"Hack on projects, even if you're not technical. Download Cursor, toss your resume in, and build a resume website. That's an awesome first step of showing product sense and execution.\"",

      "Idan Gazit, GitHub Next: \"Nothing speaks like a prototype. As much as my official title is research, it's not research — it's prototyping. Our job is to make.\"",

      "Rohan, VP Growth at Perplexity, on what they look for in hires: \"Have they tried to spin something up of their own and failed gloriously? That's the kind of stuff where we're like — check mark, get them in here.\"",

      "Six different companies. Six different speakers. One message: ship things.",

      "## Why Building Beats Everything Else",

      "Rachel Wolin articulated why this moment is different. She calls herself \"a builder first and an executive second\" and has instituted \"builder days\" at Webflow — no meetings, just building. At a recent virtual offsite, 86 people published repos and prototypes.",

      "Her argument: we're at a point where building is so accessible that NOT building is a signal. AI tools like Cursor, Claude Code, and Lovable have made it possible for non-engineers to ship real software. Rachel mentioned building apps for her wife (personal shopping), her son (a bedtime audio memory app using OpenAI's voice API), and her brother-in-law (a case study interview prep app for his OpenAI interview).",

      "\"There's never been a better time to build personal software,\" she said. \"It was janky. You're never going to see this project. But using these tools, there's never been a better time.\"",

      "The implication for career-builders: if Webflow's CPO is spending her nights and weekends building side projects to keep her product intuition sharp, what signal does it send when you're not building anything?",

      "## The Builder Advantage Compounds",

      "What makes building so powerful as a career strategy is the compound effect:",

      "**Layer 1: You learn by doing.** Rachel on developing product intuition: \"Pick a problem. Go talk to people who have that problem. Realize the way they think about it is wrong. Show them something. Get feedback.\" With AI tools compressing the build cycle, you can get more reps faster than ever before.",

      "**Layer 2: You have proof.** A live product is infinitely more credible than a case study or a PowerPoint. Multiple speakers mentioned that they look for tangible evidence of building in hiring processes.",

      "**Layer 3: You develop taste.** Rachel: \"You will run through walls. And sometimes you shouldn't have run through that wall. But that's how you develop taste.\" Taste — the ability to know what's worth building — only comes from building enough things to learn what works and what doesn't.",

      "**Layer 4: You understand distribution.** Rachel emphasized this: \"Critical thinking skills and creativity become so much more important than ever before. And then also understanding how to get distribution — find people to discover your product.\" Building teaches you not just product, but go-to-market.",

      "## The Hybrid Superpower",

      "Idan from GitHub Next connected this to a broader career insight. He described being asked throughout his career: are you the best developer? No. The best designer? No. So what's your value?",

      "\"I can glue those functions together because I live with one foot in either side. Today with AI, it's like wearing rocket boots. Hybridity was undervalued in the past. Now it's actually a superpower.\"",

      "Building things is how you become a hybrid. You can't credibly bridge product, design, and engineering if you've never shipped software. You can't understand the trade-offs engineers make if you've never deployed something. And in the AI era, you can't claim to be AI-native if you haven't used AI tools to build.",

      "## What This Means for Me",

      "This is why I build. Not because I think I'm a great engineer — I'm not. But because the act of conceiving, designing, building, and shipping a product teaches you things that no amount of reading, discussing, or strategizing can teach. Every product in my portfolio exists because I believe that PMs who build have a fundamentally different understanding of what's possible than PMs who only manage.",

      "The tools have never been better. The barrier has never been lower. And the signal has never been louder: the people getting hired, promoted, and trusted with big bets are the ones who build.",
    ],
  },
  {
    slug: "fame-fortune-or-fun",
    title: "Fame, Fortune, or Fun: YouTube's Framework for Creator Products",
    subtitle:
      "A deceptively simple mental model for understanding what users actually want.",
    date: "2025-01-27",
    tags: ["Frameworks", "Product Thinking", "Creator Economy"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "Most product frameworks sound smart in a meeting and useless in practice. The one that stuck with me from the Berkeley Haas AI Conference is from YouTube — and it's so simple it almost seems too obvious. Until you start applying it and realize how many product decisions it clarifies.",

      "## The Framework",

      "Heather Christmann, who leads creator-facing products at YouTube, shared that they evaluate every product decision through three lenses. Creators ultimately want one (or more) of three things:",

      "- **Fame** — reach, discovery, audience growth\n- **Fortune** — revenue, monetization, financial sustainability\n- **Fun** — creative satisfaction, enjoyment of the process",

      "If a product delivers at least one of those things AND has daily utility (what Google internally calls \"the toothbrush test\" — will you use this every day?), it's worth building.",

      "## Why It Works",

      "The power of this framework is that it cuts through feature-level debates and gets to what the user actually cares about. When you're in a design review arguing about whether to add a particular button or workflow, the question becomes: does this move the needle on fame, fortune, or fun? If you can't answer that, maybe you shouldn't build it.",

      "Heather described using this in practice: \"We're in design reviews and I'm like, I don't know about this. But I'm not the user. I'm not designing for fame, fortune, and fun in some of these.\" The framework gives you permission to step outside your own perspective and evaluate from the user's actual motivations.",

      "It also explains why features that seem great on paper sometimes fail: they might be technically impressive or aesthetically beautiful, but if they don't advance fame, fortune, or fun, creators won't care. Their time is their currency — they'll go to another platform, go back to a day job, or create somewhere else.",

      "## Broader Application",

      "Here's what makes this framework more than a YouTube-specific tool: the categories generalize. Replace \"creators\" with any user base and the structure holds:",

      "**For B2B SaaS users:**\n- Fame = status, visibility within their org, career advancement\n- Fortune = revenue impact, cost savings, measurable ROI\n- Fun = ease of use, reduced friction, satisfaction",

      "**For consumer app users:**\n- Fame = social proof, followers, recognition\n- Fortune = saving money, earning money, getting deals\n- Fun = entertainment, delight, habit satisfaction",

      "**For developer tools:**\n- Fame = community recognition, open source contributions\n- Fortune = shipping faster, billing less infrastructure\n- Fun = developer experience, elegant APIs, \"it just works\"",

      "The specific words might change, but the structure — understand the 2-3 fundamental motivations driving your users and evaluate every decision against them — is universally useful.",

      "## The Intersection Is Gold",

      "Heather's key insight: the magic happens at the intersection. A product that delivers fame AND daily utility? That's a keeper. Fortune AND fun? Even better. All three plus habitual use? You've built something durable.",

      "This is a useful filter for roadmap prioritization. Instead of ranking features by effort vs. impact (the standard 2x2), try mapping them to which motivations they serve. Features that hit multiple motivations are more durable than features that hit only one — even if the single-motivation feature has higher estimated impact.",

      "## The Anti-Feature Test",

      "The framework is also useful in reverse. When you're overwhelmed with feature requests or trend-chasing (\"we should add AI because everyone else is\"), ask: will this AI feature increase fame, fortune, or fun for our users? If the answer is \"it'll be cool and we'll get press\" — that's fame for you, not for your users.",

      "Heather made this point directly: \"One of the things we fall into as a trap is to ship more features. But actually there's a learning curve. What people might want is an improved product that solves the need they were working towards, as opposed to just churning out so much.\"",

      "Sometimes the best product decision is to make what you already have better at delivering fame, fortune, or fun — not to add something new.",

      "## Takeaway",

      "I keep coming back to this framework because it passes my test for useful product thinking: it's simple enough to remember, specific enough to apply, and general enough to use across contexts. Three words that force you to stay anchored to what users actually care about, even when the market is screaming at you to chase the next shiny thing.",
    ],
  },
  {
    slug: "why-hybrids-win",
    title: "Why Hybrids Win in the Age of AI",
    subtitle:
      "The case for being a jack of all trades — and why 'master of none' is no longer the ending.",
    date: "2025-02-03",
    tags: ["Career", "AI Products", "Product Management"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "\"Everybody remembers the first half of the jack-of-all-trades video. Everybody know the second half? And master? No, that's right.\" Idan Gazit from GitHub Next dropped this line at the Berkeley Haas AI Conference, and it crystallized something I've been thinking about for a while.",

      "For years, the career advice was: specialize. Pick a lane. Go deep. Become the world's foremost expert in one narrow thing. That advice made sense in a world where execution was expensive and expertise was the bottleneck.",

      "That world is ending.",

      "## The Specialist Advantage Is Shrinking",

      "Here's the uncomfortable math: AI tools are getting better at deep, specialized work every month. Code generation, data analysis, design iteration, legal research, financial modeling — these were all specialist domains that required years of deep practice. Now an AI agent can do passable-to-good work in any of them.",

      "This doesn't mean specialists are irrelevant. The best specialist will always outperform the best generalist in their specific domain. But the gap is shrinking, and the cost of accessing specialist-level work is collapsing.",

      "What's NOT getting automated: the ability to see across domains. The judgment to know which specialist tool to apply to which problem. The taste to recognize when an AI's output is 90% there and what the missing 10% is. The communication skills to translate between engineering, design, business, and customers.",

      "## Rocket Boots for Generalists",

      "Idan put it perfectly: \"The ability to say I am self-capable of going from zero to one — today with AI, it's like wearing rocket boots. Hybridity was undervalued in the past. Now it's actually a superpower.\"",

      "Before AI tools, being a hybrid was a disadvantage in hiring. You'd interview against specialists who could go deeper in their one area. Now, the hybrid who can use AI to execute at a competent level across multiple domains — and who has the judgment to orchestrate those domains into a coherent product — is more valuable than the specialist who only knows one thing really well.",

      "GitHub Next explicitly hires for this: \"I'm hiring makers of a lot of different skill sets. Every one of those people tends to be a hybrid. Somebody who, when I ask them 'what are you good at?' they're like, 'well, I'm kind of good at this, but also that.'\"",

      "## The Webflow CPO Agrees",

      "Rachel Wolin at Webflow echoed this from a completely different angle. She started her career as a software engineer, transitioned to product management at Haas, and now runs product at a company with hundreds of employees. She still writes code. She still builds side projects. She calls herself \"a builder first and an executive second.\"",

      "Her framework: \"Can I scale myself up? Can I scale myself down?\" The market rewards people who can do both — who can think strategically at the executive level AND get hands-on with the actual work. That's the hybrid advantage.",

      "At their recent offsite, 86 people at Webflow published repos and prototypes. The message wasn't \"engineers should build\" — it was \"everyone should build.\" Product managers, designers, marketers — all shipping code.",

      "## What Makes a Valuable Hybrid",

      "Based on what I heard across the conference, the most valuable hybrids share a few characteristics:",

      "**1. They can go from zero to one alone.**\nNot zero to scale — just zero to one. A working prototype. A functional MVP. Something people can touch and react to. AI tools make this dramatically easier, but you still need the instinct to know what to build.",

      "**2. They speak multiple languages.**\nNot programming languages — organizational languages. They can talk to engineers about trade-offs, to designers about user experience, to executives about business impact, and to customers about their problems. Each of those conversations requires a different vocabulary and different empathy.",

      "**3. They have taste across domains.**\nThey know when a design is almost right. They know when code architecture will cause problems later. They know when a business model has a hole in it. This cross-domain taste only comes from spending time in each domain — even if you never become the best at any one of them.",

      "**4. They learn fast.**\nThe Snowflake and Handshake panel emphasized curiosity as a durable skill. The hybrid advantage multiplied by AI tools only works if you're constantly learning new tools, new domains, new ways of working. The people who downloaded Cursor the weekend it launched have a different skill set than people who are still thinking about trying it.",

      "## The Personal Angle",

      "This resonates because it describes my own path. I'm not the best engineer, the best designer, or the best strategist. But I can build a full product — from concept to code to deployment — because I've spent time in each of those domains. Every project in my portfolio exists because I could see across the boundaries between disciplines and build something coherent.",

      "In the pre-AI era, that made me a generalist in a world that rewarded specialists. In the AI era, it makes me the kind of person these companies say they're hiring: someone who can go from zero to one, who can orchestrate across domains, and who treats building as a daily practice rather than someone else's job.",

      "The age of \"pick a lane\" is over. Pick all the lanes. AI will handle the depth. Your job is the breadth.",
    ],
  },
  {
    slug: "how-openai-learned-healthcare-in-4-months",
    title: "How OpenAI's GTM Leader Learned Healthcare in 4 Months",
    subtitle:
      "Using AI to speed-run domain expertise — and landing a major UCSF partnership in the process.",
    date: "2025-02-10",
    tags: ["AI Tools", "Career", "Go-to-Market"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "One of the most practical stories from the Berkeley Haas AI Conference came from Maggie, who leads go-to-market at OpenAI. She shared how she used ChatGPT's study mode to learn an entire industry from scratch in four months — and the result was one of OpenAI's biggest enterprise partnerships.",

      "## The Challenge",

      "Four months before the conference, Maggie's CRO asked her to figure out OpenAI's strategy for their healthcare and pharma vertical. The problem: she had zero experience and zero background in healthcare, \"other than I'm a patient.\"",

      "This is one of the most important things that Sam Altman and the OpenAI leadership want to tackle — healthcare is at the core of their pursuit of AGI. No pressure.",

      "## The Speed-Run",

      "Rather than spending months in traditional learning mode — reading textbooks, attending conferences, interviewing experts — Maggie turned to ChatGPT study mode. Every single night, every weekend, every free minute.",

      "She used it to learn the industry jargon, understand what healthcare professionals care about, map out the processes of clinical trials, and build a strategic understanding of the vertical. Study mode was her on-demand tutor for an entire industry.",

      "## The Result",

      "The outcome speaks for itself: OpenAI announced a massive partnership with UCSF. Every student, doctor, clinician, admin — even bus drivers — at UCSF is getting ChatGPT access. That deal was Maggie and her team's work.",

      "\"Four months ago we had pretty much no real healthcare expertise. And we have just sprinted so hard at it.\"",

      "## Why This Matters Beyond the Story",

      "This isn't just an anecdote about one person at one company. It's a proof point for a new way of building domain expertise. The traditional model for breaking into a new industry — spend years building relationships, read everything, attend conferences, get mentored by experts — still has value. But AI tools have compressed the knowledge-acquisition phase from years to months.",

      "The implications for career navigation are huge:",

      "**Domain expertise is more accessible.** The moat around specialized knowledge is lower than ever. If Maggie can learn enough about healthcare in four months to close a deal with UCSF, the traditional requirement of \"5+ years in healthcare\" starts to feel like gatekeeping rather than a genuine qualification.",

      "**Learning speed is a competitive advantage.** The ability to rapidly build functional expertise in a new domain — using AI tools as tutors, research assistants, and sparring partners — is now one of the most valuable career skills. It's not about what you know; it's about how fast you can learn what you need to know.",

      "**AI tools are force multipliers for ambition.** Maggie didn't have the background. She had the assignment, the urgency, and the right tools. That combination produced results that would have previously required hiring a team of healthcare industry veterans.",

      "## The Broader Panel Context",

      "This story came during a panel where all three speakers — from Intercom, Perplexity, and OpenAI — were sharing their personal AI tricks. The Intercom speaker described using their own AI product (Finn) to run an 800-person conference with just three people, handling sponsorship intake, speaker qualification, and support. Perplexity's VP of Growth admitted to asking Perplexity embarrassingly basic parenting questions at 3am as a new father.",

      "The through-line: the people building AI products are also the most aggressive users of AI products in their own lives. They're not just building tools — they're constantly discovering new use cases by using AI for everything, from enterprise strategy to midnight parenting emergencies.",

      "## The Takeaway",

      "If you're thinking about breaking into a new domain — whether it's healthcare, fintech, enterprise, or anything else — the playbook has changed. You no longer need years of immersion to build credible expertise. You need intensity, the right AI tools, and the willingness to sprint.",

      "The people who will thrive in the AI era aren't the ones with the deepest existing expertise. They're the ones who can build new expertise fastest — and then have the judgment to apply it in ways that create real value.",
    ],
  },
  {
    slug: "the-hand-off-problem",
    title: "The Hand-Off Problem: Why Corporate Innovation Dies",
    subtitle:
      "GitHub Next's hard-won lessons on why prototypes die when they leave the lab — and how to prevent it.",
    date: "2025-02-17",
    tags: ["Innovation", "Product Management", "Enterprise"],
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "\"No word makes me sweat at night more than that word.\" Idan Gazit, who leads GitHub Next — GitHub's innovation lab inside Microsoft — was talking about the hand-off. The moment when a successful prototype leaves the lab and enters the main engineering organization for production development.",

      "In his words: \"This is where the bodies are married.\"",

      "## The Pattern That Kills Innovation",

      "Here's how it typically goes. An innovation team builds something promising. Leadership sees the demo and gets excited. \"We love it. Go, run fast, run far, go to market. Here's three engineering teams to help you.\"",

      "\"That's usually when the project dies,\" Idan said.",

      "Why? Because the engineering teams coming in to take over the project come from a different world. They come from an engineering and product environment with established processes, established ways of doing things. They're going to impose a process and a mindset that maybe doesn't make sense for a new product category that hasn't been tried before.",

      "\"And then with the best of intentions, in the process of adoption — oops, the baby died.\"",

      "## Why This Happens",

      "Idan was careful to note: nobody has bad intentions. The road to dead innovation is paved with good intentions. The problem is structural:",

      "**1. Context loss.** In the early phases of a product, only you and your small team truly understand it. You know why certain decisions were made, which assumptions are fragile, which parts are held together with duct tape that shouldn't be ripped off yet. The people inheriting the project don't have that context.",

      "**2. Process mismatch.** A prototype that's finding product-market fit needs different processes than a product that's scaling. Standard engineering practices — sprint planning, code review standards, security audits, accessibility requirements — are essential for production software. But applying them too early can kill the speed and experimentation that made the prototype successful.",

      "**3. Ownership diffusion.** When one small team owns a prototype, accountability is clear. When three engineering teams take over, nobody feels the same level of ownership. The passionate weirdness that made the thing work gets smoothed out by committee.",

      "## How GitHub Next Navigates It",

      "GitHub Next's approach is to maintain control through the critical early stages. They don't hand off a slide deck — they hand off a working thing with the team that built it.",

      "Their innovation process works in expanding circles:",

      "**1. Thursday demo day.** People show what they've built. The first signal: does this excite others in the room? If three people say \"yeah, let's do that\" — continue.",

      "**2. Extend, don't hand off.** Give the project a few more weeks. Build the next stage. Try it on other people at GitHub.",

      "**3. Expand the circle.** Try it on design partners outside GitHub. Get real-world data and feedback.",

      "**4. Build the evidence.** Only go to leadership when you can say: \"Here's a bet we should make, here's why we should make it, and here's a working prototype that proves it.\"",

      "The key principle: the people who built the prototype should shepherd it as far into production as possible. The hand-off should be gradual, not a clean break.",

      "## The Hiring Philosophy That Prevents It",

      "Idan's hiring approach is directly tied to this problem. He doesn't hire researchers who write papers — he hires makers who build things.",

      "\"At the end of the day, there's a lot of people with philosophers bearing Google Docs. And that doesn't not have value, but nothing speaks like a prototype.\"",

      "Everyone on the team is what he calls a hybrid — someone who can do product thinking, engineering, and design. \"Every soldier, a general.\" Each person is an independent operator who can credibly advance the state of the art on their own.",

      "The key quality he looks for: \"If I leave you alone for five minutes, do you make something?\" If the answer is yes, that person can shepherd a project through the hand-off because they deeply understand every layer of what they built.",

      "## The Insurance Policy Approach",

      "One more framing that stuck with me. Idan described GitHub Next's role as betting 1% of the business on insuring the other 99%. They're not trying to build the next big product — they're trying to figure out what might disrupt the existing business in 1-5 years and get ahead of it.",

      "\"Because our customers are not asking for this. They're asking for fixes to the stuff that's broken in our product today.\"",

      "This reframes corporate innovation from \"shiny new thing\" to \"existential risk mitigation.\" And the hand-off problem becomes not just a project management challenge, but a survival question: can the organization actually adopt its own innovations before a competitor does?",

      "## The Takeaway",

      "If you're building something new inside an existing organization — or if you're the person receiving a hand-off from an innovation team — the lessons are clear:",

      "- **Prototype with the people who will build it.** Or at minimum, keep the prototype team involved deeply through the production transition.\n- **Resist the urge to normalize too early.** Standard processes exist for good reasons, but applying them at the wrong stage kills more innovations than bad ideas do.\n- **Transfer context, not just code.** The most important thing to hand off isn't the repository — it's the reasoning behind every decision in it.\n- **Bet small, learn fast.** GitHub Next doesn't staff projects for six months. They give things a few weeks, evaluate, and extend or kill based on evidence.",

      "Innovation isn't hard because of a lack of ideas. It's hard because organizations struggle to adopt their own best ideas. The hand-off is where that struggle lives.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
