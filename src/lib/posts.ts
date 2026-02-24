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
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
