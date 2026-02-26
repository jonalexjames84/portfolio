export type Post = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  content: string[];
  source?: string;
  image?: string;
};

export const posts: Post[] = [
  {
    slug: "how-i-think-about-product-decisions",
    image: "/blog/pottery-friends-app.jpg",
    title: "How I Think About Product Decisions",
    subtitle:
      "The framework I use when data says one thing and intuition says another, illustrated by a real pivot.",
    date: "2026-02-25",
    tags: ["Product Management", "Decision Making", "Case Study"],
    content: [
      "Most product advice boils down to \"follow the data.\" And most of the time, that's right. But the interesting decisions, the ones that actually move a product, happen when the data is ambiguous and you have to make a call with incomplete information. This post is about how I make those calls.",
      "## The Pottery Friends Pivot",
      "When I built Pottery Friends, a community platform for pottery studios, I designed the home screen around a social feed. Instagram-style photo sharing. It made sense. Potters love showing their work, and feed-first home screens are the default pattern for community apps.",
      "The data told a different story. PostHog showed that members were landing on the feed and immediately navigating away, to Events. Session recordings confirmed it: tap home, skip feed, tap Events, browse upcoming workshops, done. The feed wasn't broken. Members just didn't care about it as much as I thought they would.",
      "## The Framework: Cost of Being Wrong",
      "When I hit a decision like this, I don't ask \"what does the data say?\" first. I ask: **What's the cost of being wrong in each direction?**",
      "- **If I keep the feed-first design and I'm wrong:** Members keep skipping the feed. Engagement stays flat. The app feels like it's not built for them. Churn risk goes up. The cost is slow: death by a thousand sessions where people don't find what they came for.\n- **If I switch to events-first and I'm wrong:** Feed engagement drops. But feed engagement was already low. And if events-first doesn't work, I can always revert. The cost is a sprint of work and a week of monitoring.",
      "The asymmetry was obvious. One direction had a low cost of failure and a high cost of inaction. The other had a high cost of inaction and an easy reversal. This isn't a data question. It's a risk question.",
      "## The Decision",
      "I redesigned the home screen around events and workshops. The feed moved to its own tab. I shipped it in a week and watched the numbers.",
      "Engagement doubled. Not because the feed was bad, but because members came to Pottery Friends for a specific job: \"What's happening at my studio this week?\" The feed served a secondary job, social connection, that mattered, but not as the first thing they saw.",
      "## The Broader Framework",
      "Every product decision I make runs through a version of this filter:",
      "**1. What's the fastest path to learning something we don't know?** If we're debating two approaches and one gives us signal in a week while the other takes a quarter, I'll almost always pick the faster one, even if it's less elegant. Speed of learning beats quality of guessing.",
      "**2. What's the cost of being wrong?** Reversible decisions get made fast. Irreversible ones (pricing changes, platform migrations, data model changes) get more scrutiny. Most decisions are more reversible than people think.",
      "**3. What job is the user actually hiring this product to do?** Not the job I designed it for. Not the job the roadmap says. The job they're actually doing when they open the app. I watch session recordings religiously for this reason: the gap between intended use and actual use is where the best product insights live.",
      "**4. Discovery and delivery run in parallel, not in sequence.** I don't believe in \"research phase then build phase.\" You learn the most by shipping something real to real users. The Pottery Friends feed-to-events pivot only happened because the product was live and generating real behavioral data. A prototype or mockup would have validated the feed-first design because people would have said \"yeah, that looks good\" in an interview.",
      "## Why This Matters",
      "I've seen PMs freeze when the data doesn't give a clean answer. They run another A/B test, schedule another round of interviews, add another week to the research timeline. Sometimes that's right. But often, the cost of not deciding is higher than the cost of deciding wrong.",
      "The best product decisions I've made weren't the ones where I had the most data. They were the ones where I correctly assessed the cost of being wrong, moved fast, and stayed close enough to the outcome to course-correct quickly.",
      "After 15 years and building 4 products from scratch, that's the muscle I trust most: not pattern matching from past experience, but knowing how to make a good decision when the answer isn't obvious.",
    ],
  },
  {
    slug: "speed-bumps-paint-brushes-and-resilience",
    image: "/blog/speed-bumps.jpg",
    title: "Speed Bumps, Paint Brushes, and Resilience",
    subtitle:
      "On navigating career setbacks, supporting your partner\u2019s art, and finding strength in the chaos.",
    date: "2025-05-05",
    tags: ["Personal", "Resilience", "Creativity"],
    content: [
      "Over the last six months, our household, and honestly the entire nation, has felt like it\u2019s been driving over hundreds of speed bumps in a car with 1980s suspension. We\u2019ve been bounced up and down, rattled around, and had every nut and bolt shaken loose on this little trusty vehicle we\u2019ve built, one that\u2019s carried us through years of refining our life, work, and art.",
      "We\u2019ve started businesses, raised pets and plants, cycled through jobs, and gained and lost people. So where am I going with all this? I guess I\u2019m just pausing to share a few of the major speed bumps we\u2019ve hit recently, personally and professionally, and to offer a glimpse under the hood at what life looks like at the Martin house.",
      "When my wife first started painting while she worked she painted at every possible opportunity, at lunch, after work, in the morning, for a full day on the weekend, whatever it took she did it! When she officially left the gaming industry, she was painting 2-3 pieces a day, nearly every day, for years. Her consistency on Instagram paid off: first 10K followers, then 100K. That took serious dedication, and it also meant that about a third of our house became a permanent art studio.",
      "## Speed Bump 1: The Algorithm Shift",
      "TikTok\u2019s rise in 2019-2020. Most of her traffic and sales came from Instagram, which is owned by Meta. As TikTok grew, Meta pushed back hard by launching Reels, changing their algorithm to prioritize their new format. It tanked her visibility. Worse, we noticed what many creators call \"soft blocking,\" where engagement drops off a cliff for seemingly no reason.",
      "The lesson? Artists don\u2019t have many alternatives. Platforms hold enormous power. You can\u2019t just pick up your audience and move. Sure, you can try ads or adopt whatever new feature they want you to use, but we were left feeling pretty disillusioned.",
      "## Speed Bump 2: Leaving Instagram",
      "My wife is a force of nature. She didn\u2019t stop. She kept getting invited to prestigious events. She kept winning awards, selling paintings, and becoming someone other artists looked up to. Even though sales dropped by half, she doubled down on what we could control: local galleries, her website, her shop, real-world relationships.",
      "Then came the election cycle. I\u2019m not going to go off on a rant. There\u2019s plenty of that online, but we felt the effects. The direction we saw companies and the government heading really didn\u2019t sit right with us. So we acted. My wife and I left Instagram. We haven\u2019t deleted our accounts completely, but we rarely check them. The problem is, not many people made the same move. Staying connected became harder. A lot of those people we cared about, or who cared about our work, were just... gone.",
      "## Speed Bump 3: I Lost My Job",
      "I lost my job right before the election. Okay, I knew it was coming, but it was still a tough pill to swallow. Unfortunately, I\u2019ve been through this cycle many times. It\u2019s just a common thing in games and tech. So I didn\u2019t panic. I went to visit my dad, continued working on managing my anxiety, and tried to spend more time with my family. I also started planning how I\u2019d use the next six months: a financial plan, a personal reset, and time to figure out what\u2019s next. Here we are, six months in and still not working, but I like to think I\u2019ve found some interesting opportunities by supporting my wife and seeing where her incredible work might take us.",
      "## Morgan Hill Plein Air 2025",
      "So, after all that she is still at it and just wrapped up a competition in Morgan Hill which is an invite only event so everyone is hand picked to compete. She and 14 other artists participated in a plein air painting event. That means they go outside, yes, with all their gear, and paint what they see: landscapes, buildings, animals, whatever captures their interest. They do this for about three days straight. The only rules: paint in open air, stay within 20 miles of the gallery, and submit no more than six paintings. These works are then judged in a gallery show, with awards handed out and the pieces displayed for sale for the next month.",
      "Sounds simple, right? It\u2019s not. To get good at plein air painting, you have to paint. A lot.",
      "I haven\u2019t really participated in a plein air event like this in years, mostly because of my debilitating anxiety. I\u2019ve never liked being away from home. Being out in the middle of the woods or being alone for hours with nothing to do. That used to be a nightmare scenario for me. But this time, I had a chance to figure it out and support my wife unconditionally. She\u2019s the one putting her art business on pause to take a contract job and bring in steady income while I figure my shit out, so the least I could do was show up.",
      "So I sucked it up. I packed my bug-out bag (a very textbook anxious-person move), filled it with snacks, books, a notebook, hiking gear, and I just did whatever she needed for four days. We went to some of the most beautiful spots in the area. And, hold the phone, I ran alone. Believe me, I was gripped on that first trail run. It was steep, hot, isolated, and I was completely triggered. But I did it. And I kept going. I ended up doing two long trail runs and a hike while she painted. I gave myself space to just exist, to forest bathe (as the Japanese say), and it felt amazing.",
      "## Final Reflection",
      "If you\u2019re feeling stuck, if you can\u2019t find your next job or make progress on your own path, try helping someone else. If you can\u2019t help yourself, be useful to someone close to you. There\u2019s always something you can do for someone else, and in the process, it might just crack you out of whatever funk you\u2019re in. That\u2019s why I\u2019m sharing all this. If this post helps even one person get unstuck, then the time I spent writing it was worth it.",
      "This isn\u2019t just a love letter to my wife (though she deserves every word). It\u2019s about the strength that shows up when your back\u2019s against the wall. It\u2019s about staying in the boat, grabbing an oar, and rowing, even when you\u2019re not sure where you\u2019re headed. We\u2019ve run marathons and ultramarathons together, 10+ hours of pain and mental warfare that make you feel indestructible when it\u2019s done. That resilience is real. And when life throws chaos your way, sometimes all you can do is lean on your people, keep moving, and trust that it\u2019s making you stronger.",
      "So yeah, this is a celebration. Of grit. Of art. Of change. Of partnership. And if you\u2019ve got someone in your life who\u2019s your steady hand, give them a thank you today.",
    ],
  },
  {
    slug: "product-team-fit",
    image: "/blog/product-team-fit.jpg",
    title: "Building a Team That Fits Your Product",
    subtitle:
      "What people don\u2019t talk about enough: having a team that fits your product, not the other way around.",
    date: "2025-04-29",
    tags: ["Product Management", "Startups", "Leadership"],
    content: [
      "Over the last 3 months I\u2019ve been tirelessly attempting to build a company, a game, and everything that goes with it. This is no small feat. If you ever get a chance to talk to a business owner, ask them about the first year of incorporating, and I bet they\u2019ll have some stories for you.",
      "So, what\u2019s this article about? It\u2019s about the importance of finding not just product-market fit, that\u2019s easy! (Just kidding.) But seriously, there\u2019s already so much coverage on that topic. What people don\u2019t talk about enough is **having a team that fits your product.**",
      "What does that mean? Well, I\u2019ll tell you. It means you can\u2019t just get a group of people together, even if they\u2019ve each built a game, an app, a house, whatever, and expect they can magically build something together again. This is a very difficult thing to do, especially as a new company. These are people who have maybe worked together once, years ago, under completely different circumstances. They may have similar backgrounds and experience, but they don\u2019t know this new environment. This is a new product. What is it? How do we do business together? It\u2019s crazy hard. And this part is **crucial** for maintaining team health, project health, and getting some early wins under your belt.",
      "The common approach is to set up structures that worked before, start making things, regroup occasionally, get feedback, course correct, adjust a little at a time, etc. You know, the usual Agile playbook. But unfortunately, that doesn\u2019t work with a brand-new team. The steering wheel basically doesn\u2019t even exist yet. Think of that car the Flintstones drove. That\u2019s a giant boulder rolling downhill, and you\u2019re trying to steer it with your feet.",
      "So what does this mean? It means you have to make **pretty dramatic shifts** when things start going sideways. Don\u2019t be afraid. Making big mistakes early is part of the game. It\u2019s easy in the beginning to mess up because the stakes are fairly low. Messing up later, when you\u2019re shoveling millions into the bank, is much worse. So make those big shifts early and often, especially if the team setup isn\u2019t working.",
      "## Phase 1: Building Culture",
      "This is critical. Many founders swear by this. What are the unbreakable rules? What\u2019s the behavioral model we all adhere to? Who are we and why are we even here?",
      "Building culture does a few things: it removes \"what are we building?\" from the equation. **We are building a community first.** That\u2019s it. Do we jive well? Are we ethically aligned? Do we all give a care about the same stuff? If yes, cool, we can be friends. And let\u2019s be honest, making games or starting a business is an absolute nightmare no matter what shiny stuff you see on social media. It\u2019s probably one of the hardest things you could possibly do and has an extremely high failure rate. So you might as well **enjoy the people around you** while you\u2019re failing, right? Yes!",
      "I kept asking myself and the team, **\"Is this still fun?\"** It\u2019s such a simple but important question, especially because we\u2019re making entertainment. If we aren\u2019t enjoying building it, it will come out in the product. Customers can smell it. It will poison the integrity of the game.",
      "So here\u2019s a few things that helped us establish culture:\n- **Rule #1:** We are a collective\n- **Rule #2:** We prioritize good vibes\n- **Rule #3:** Experiment and iterate",
      "I know these aren\u2019t the most traditional \"core values\" but I think it\u2019s enough. Three is perfect. Simple. We make things together like a co-op (which helps remove ego and ownership drama), we focus on good vibes (so if there\u2019s negative energy we talk it out like adults), and we experiment and iterate (because science is good, and it takes ego out of the equation).",
      "## Phase 2: Map Out the Hard Skills",
      "Alright, the vibe is good. We\u2019re hanging out, connecting, feeling like a little community. **Now do we start making things?** Nope! The next step is to figure out **what everyone\u2019s good at** and **what they actually want to do.** I did this by talking to everyone one-on-one.",
      "When I talked to people, I asked three things:\n- What do you know how to do?\n- What would you like to do?\n- What do you want to get out of this project?",
      "These are super important questions because they tell you what skills are already in the room, what people actually want to spend their time doing (which is crucial when they\u2019re unpaid), and what their bigger goals are. You\u2019re trying to line up their motivations with your startup\u2019s needs, and yes, **that\u2019s basically Team-Product Fit.**",
      "A lot of companies mess this up. They hire people, shift direction, never check in, and morale tanks. So I just kept asking people along the way: **\"Is this still working for you?\"**",
      "## Phase 3: Check the Vibe",
      "Ok, you\u2019ve got culture. You\u2019ve mapped out skills. You\u2019re making something. The vibes are good. Now you have to **keep checking the vibe**. Constantly. Sometimes you can do it verbally, sometimes you just feel it, sometimes you post a poll and see if people care enough to respond. Whatever works, **but do it often.**",
      "Signs the vibe might be off:\n- People not showing up to meetings (could mean meetings suck, be honest)\n- Concerns being voiced but not addressed\n- Less hype, less energy, less chatter as days go by",
      "You need to be the person people can talk to. And you need to **actually listen.** Even when it\u2019s annoying. Even when people are just venting. Write it all down. Sort through it later. Don\u2019t get defensive. Just take it seriously.",
      "## So... What Happened?",
      "We made it! Well, kinda. This isn\u2019t a foolproof strategy, but it led me and the group I\u2019m managing to pivot so hard we literally merged with another company. Did I just merge a company?! Apparently! Wild, right?",
      "## Final Thought",
      "**Culture first. Skills second. Vibe checks always.** That\u2019s how you survive the early days, and maybe, just maybe, build something people actually care about.",
    ],
  },
  {
    slug: "how-i-prepare-for-pm-interviews",
    image: "/blog/pm-interviews.jpg",
    title: "How I Prepare for PM Interviews",
    subtitle:
      "The books, frameworks, and four-phase system I use to prepare for product manager interviews.",
    date: "2025-04-24",
    tags: ["Product Management", "Career", "Interviews"],
    content: [
      "Here\u2019s a rough idea of how I prepare for a standard PM interview. First, the foundation: I\u2019ve read Cracking the PM Interview, Decode and Conquer, and Interview Math probably 10 times each. Not exaggerating. I initially bought them to prep for what I thought were the most challenging interviews of my life: Google, Meta, Amazon. Haven\u2019t made it to final rounds yet (ouch), but the prep made me a better PM regardless.",
      "Out of all of them, Cracking the PM Interview is still my go-to. It\u2019s the most comprehensive breakdown of almost every question you might get asked, and it doesn\u2019t just stop at examples. It gives you frameworks, insights into big tech expectations, and a good sense of how great PMs think.",
      "Over time, I\u2019ve come to realize that success in PM interviews boils down to a few critical things:\n- Having a solid framework for almost every question.\n- Doing enough company research that you could fake being a PM there for 20 minutes.\n- Prepping real examples from your own work that support whatever recommendation you\u2019re pitching.",
      "And here\u2019s the kicker: it\u2019s not just about knowing your stuff. Interviewing is a weird format. It\u2019s like verbally giving a slide deck presentation... while building the deck from scratch... in real time... under pressure. So yeah, overprepare. You can\u2019t wing this.",
      "## The Book That Changed How I Prep",
      "Cracking the PM Interview is over a decade old, but it still delivers. Jackie Bavaro, one of the authors, was an early PM at Google and later the Head of Product at Asana back when it was still small. She gets both the large org structure and the messy ambiguity of startups.",
      "If you\u2019re trying to break in, move up, or just sharpen how you think about product and business, this book will help. I mark mine up and keep it nearby like a PM survival guide.",
      "## Phase 1: Research",
      "Let\u2019s start with the hardest one. Research is brutal, especially when you\u2019re interviewing at a startup with zero public info.",
      "If the company\u2019s public? Congrats. Read the S-1. Listen to the earnings calls. Yeah, it\u2019s boring, but it gives you the narrative: what\u2019s going well, what\u2019s risky, where they\u2019re doubling down.",
      "If the company\u2019s private, then you need to go full scrappy mode:\n- Website\n- App store reviews\n- Glassdoor\n- LinkedIn (team makeup and structure)\n- Articles, interviews, Reddit, forums",
      "From that, try to piece together:\n- What products they\u2019ve launched\n- Who their users and customers are\n- How they make money\n- What market they play in\n- Who their competitors are\n- What their mission is and how it reflects in their work",
      "## Phase 2: Behavioral Interviews",
      "This one\u2019s sneaky hard. You\u2019re essentially trying to prove you can lead without authority, build trust, and not implode when everything\u2019s on fire. PMs live in whitespace. That means you need strong communication, empathy, and decision-making across every function.",
      "Why is it so important? Because interviews are one of the most high-leverage events in your career. Think about it:\n- Whether or not you get the job\n- How much you\u2019ll get paid\n- The network you might gain from people who interviewed you",
      "Each hour you prep for an interview might be the highest ROI thing you do in your entire year. Not kidding.",
      "I prep behavioral answers using the STAR format and group them by:\n- Leadership & Influence\n- Teamwork\n- Wins\n- Challenges\n- Mistakes & Failures",
      "Track your stories. I use Notion. You can use a doc or spreadsheet. But have your examples on hand, and rehearse them until they\u2019re crisp.",
      "## Phase 3: Estimation Questions",
      "Ugh. These still wreck me. Market sizing, TAM calculations, how many people in LA own dogs, that kind of stuff. All verbal. All on the fly.",
      "The good news is you don\u2019t have to be right. You just need a clean process:\n- Start with top-down if you know big numbers\n- Try bottom-up if you understand the user workflow\n- State your assumptions clearly and justify them",
      "Highly recommend Interview Math for this. It\u2019s got formulas, logic, and examples to practice with.",
      "## Phase 4: Product Thinking",
      "My favorite section, and probably the most revealing. Most PM interviews serve one of these three question types:\n- Design a product (Google loves this one).\n- Improve a product (Meta does this a lot).\n- What\u2019s your favorite product and why? (Common in gaming and creative spaces.",
      "Here\u2019s the formula I use across all three:\n- What\u2019s the goal of the product?\n- Who are the users and their personas?\n- What problems are they trying to solve?\n- What solutions might work for them?\n- How would we measure success?",
      "If you\u2019re designing or improving something, don\u2019t just fix what annoys you. That\u2019s the easy way out. Instead, pick an underserved user group and think about their pain. That\u2019s what shows product empathy.",
      "## Final Thoughts",
      "Now you\u2019re in the practice phase. If you don\u2019t have PM friends? Try a mock interview platform or record yourself. Play it back. Cringe. Fix it. Do it again.",
      "If you\u2019ve read this far, thank you. I wrote this because I\u2019ve had friends, mentors, and strangers help me in ways I\u2019ll never be able to repay. This is my version of paying it forward.",
      "And finally, be kind to yourself. I still beat myself up after interviews. I know what great looks like. I know when I fall short. But I try to remember: \"You just weren\u2019t the right person for that role. Someone else is out there looking for exactly what you bring.\"",
      "Take a break. Go for a walk. Say thanks to your nervous system. Then try again. You\u2019ve got this.",
    ],
  },
  {
    slug: "finances-and-mental-health",
    image: "/blog/mental-health.jpg",
    title: "Your Mental Health Is More Important Than Your Financial Health",
    subtitle:
      "How I stay grounded during economic uncertainty: small, practical tools anyone can use.",
    date: "2025-04-16",
    tags: ["Mental Health", "Personal Finance", "Resilience"],
    content: [
      "If you\u2019re in the U.S. (or anywhere, really) and feeling anxious about the economy, you\u2019re not alone.",
      "Lately, something I say to myself almost every day is:",
      "\u201CYour mental health is more important than your financial health.\u201D",
      "Because when your mind isn\u2019t steady, your decision-making, especially around money, starts to fall apart. The truth is, poor mental health leads to poor financial choices. I\u2019ve lived that truth more than once.",
      "This post isn\u2019t about solving everything. It\u2019s about the small, low-cost things I do to stay grounded when things feel out of control. A lot of this I learned from my dad, who was surprisingly good at keeping his head clear while also watching his wallet.",
      "## Be Selective with Your News",
      "The way you consume news matters. A lot.\n- Stick to fact-based sources like Marketplace on NPR\n- Avoid rage-bait or endless hot takes\n- Limit yourself to 1 hour of economic news per day\n- Never consume it right after waking up or before bed",
      "I used to listen to economic updates during my morning runs, thinking I was being productive. But I realized it was actually triggering me, and I\u2019d carry that stress into the rest of my day. Now I just listen to the birds and catch up later.",
      "## Build a Simple Spending Plan",
      "Stress makes it hard to think clearly, so make your plan before you hit crisis mode.",
      "Here\u2019s what our current plan looks like:\n- We write our daily spending on the fridge\n- We summarize each week\n- We audit how we can reduce spending\n- Then we rinse and repeat",
      "That\u2019s it. Super simple, super visual. And it helps.",
      "## Reintroduce Free (or Almost Free) Fun",
      "Cutting costs can be demoralizing, especially when most of the \"fun\" things in your life require money. That\u2019s why it\u2019s so important to keep joy in the mix.",
      "What\u2019s worked for us:\n- Drive or walk somewhere we\u2019ve never been\n- Pack lunch and bring our own drinks to a park\n- Hike with the dogs\n- Go out with friends, but eat beforehand and just order an appetizer\n- Shop secondhand or go to garage sales instead of the mall",
      "Honestly, I pretend I\u2019m back in college sometimes. I think, what did I do for fun then? The answer is almost always: cheap stuff with good people.",
      "## Celebrate Small Wins",
      "This part is so easy to skip, but don\u2019t. Progress counts, even when it\u2019s quiet and unsexy.\n- A week of mindful spending? Celebrate that.\n- A single day where you stopped yourself from stress-spending? That\u2019s a win.\n- A month of tracking spending on the fridge? Treat yourself.",
      "## Bonus Tools",
      "A few more tools I\u2019ve used at different times:\n- Cash envelopes by category (food out, groceries, entertainment)\n- Pocket notebook to track every dollar\n- Sell unused stuff around the house\n- Side hustles if you have time\n- Meditation at least 3x a week",
      "## Final Thought",
      "This isn\u2019t a guide to building wealth. It\u2019s a guide to building **resilience.**",
      "None of this is easy. But there\u2019s peace in knowing you\u2019re doing what you can, with what you have, where you are.",
      "\u201CTake care of your mind, and your money decisions will follow.\u201D",
    ],
  },
  {
    slug: "how-i-pitch-a-game",
    image: "/blog/pitch-a-game.jpg",
    title: "How I Pitch a Game",
    subtitle:
      "The step-by-step process I use to pitch game projects, from competitive analysis to the ask.",
    date: "2025-04-15",
    tags: ["Gaming", "Product Management", "Startups"],
    content: [
      "Ok, so I\u2019m pretty sure most of you here really want to know how to pitch something. I\u2019m currently starting the pitch process for a game we\u2019re developing, so I figured I\u2019d write down how I go about this and how I\u2019ve been taught to do it by mentors over the years.",
      "## Step 1: Pick Your Inspiration Wisely",
      "First, identify what games you\u2019re drawing inspiration from. If you come up with something completely new, you\u2019ll probably spend your entire pitch just explaining it, rather than showing how you\u2019re strategically going to build it. That\u2019s a huge distraction.",
      "So instead, pick a game, or a few games, that are most similar to what you\u2019re trying to make. A solid rule of thumb: **1/3 proven, 1/3 better, 1/3 new.** That refers to the mechanics. Same applies to products in general.",
      "## Step 2: Do a Competitive Analysis",
      "Once you\u2019ve picked your inspiration, dig deep into why those games are successful. A competitive analysis is basically a breakdown of the game and all its components, including:\n- Gameplay mechanics\n- Art direction\n- Monetization and growth models\n- Retention systems\n- Overall user experience",
      "You can do this purely from a design or art perspective, but without the business side, you may miss what actually makes the game work.",
      "## Step 3: Frame the Opportunity",
      "Now that you\u2019ve pulled together the details on the games that inspired you, start framing why your concept makes sense. What genre are you in? Mobile? Cozy? Casual? Is there a clear demand for this type of experience? Bonus points if you can do some quick market sizing to validate that the audience is there.",
      "This sets the stage for your pitch. Once that\u2019s clear, focus on why the mechanics you\u2019re proposing are better or new. Maybe there\u2019s a retention problem in the reference game. Maybe a great PC game has no mobile counterpart and you\u2019re bringing it to that audience.",
      "You can pull insights from:\n- Discord communities\n- Steam or mobile reviews\n- Reddit threads\n- Data platforms like App Annie (if you have access)",
      "## Step 4: Define the Problem & Your Solution",
      "So let\u2019s recap:\n- You\u2019ve got your reference games\n- You understand the competitive landscape\n- You\u2019ve identified a market gap or problem\n- You\u2019ve explained how your concept solves it",
      "Now you\u2019re cooking. If you really want to make it strong, show some early user data, anything from a demo build, even small engagement signals. Just enough to suggest there\u2019s stickiness.",
      "## Step 5: The Ask",
      "Here\u2019s where most people get a little sweaty. You\u2019ve got to talk about money or the partnership you\u2019re after. What\u2019s the ask? What are you looking for, and how can the person on the other end help you, and benefit themselves?",
      "This part of the pitch has to be clear, but not uncomfortable. You want to leave the door open to conversation, not pressure people into commitment. I highly recommend reading **Never Split the Difference** and **Pitch Anything**.",
      "The key: be prepared for every question. Seriously, every single one. Think through all the risks and questions they might ask. Write down your answers. Rehearse with a brutally honest friend. Get feedback now, not in the meeting.",
      "## Step 6: Objections, Questions & Strategy",
      "Now you\u2019re in the final phase. You\u2019ve got your deck, your ask, and now the conversation turns toward:\n- ROI expectations\n- Go-to-market strategy\n- Ad spend\n- Team structure\n- Roadmap",
      "This is where you need to be sharp, and ideally have a few glossy slides or a demo to bring energy back into the room.",
      "## Final Thoughts",
      "There\u2019s no one right way to pitch a game. This is just a general structure I\u2019ve seen used for pitching to publishers or greenlighting internal projects.",
      "If there\u2019s one piece of advice I can give: **be honest. People are good at spotting BS, especially folks who\u2019ve sat through hundreds of pitches.** Your story and your energy matter more than a perfect deck. Be real, be clear, and show you\u2019re someone worth backing.",
    ],
  },
  {
    slug: "from-anxious-to-excited",
    image: "/blog/anxious-to-excited.jpg",
    title: "From Anxious to Excited",
    subtitle:
      "After a year of facing my fears head-on, here\u2019s what happened, from my first flight in a decade to Hawaii.",
    date: "2025-03-30",
    tags: ["Mental Health", "Personal", "Anxiety"],
    content: [
      "After about a year of trying to manage my anxiety in a healthier way, I\u2019ve got some stories to share.",
      "So, rewind to this time last year: I hadn\u2019t been on a plane in like 7 years (maybe more), hadn\u2019t stayed in a hotel much, especially not for long, and definitely not by myself. I wasn\u2019t doing anything particularly physically demanding. I was petrified when I went to SF for GDC last year (so many people!), and generally just didn\u2019t love being around large crowds. I was afraid of a lot of stuff. So yeah, basically, a bit of a wreck.",
      "And I hit a breaking point. I don\u2019t like being like that. I\u2019m actually super outgoing, I love to travel, I love doing fun things. I am not built for the anxious lifestyle.",
      "So here we are, a full year later. What happened?",
      "## Trip 1: Overnight to Tiburon",
      "Small potatoes for most, but HUGE for me. I really didn\u2019t like being away from home, so this felt like a good low-risk move: close to home, short stay. This is basically what\u2019s called a \"fear ladder.\" I ranked my fears and planned incremental steps. For example: scared of hotels? Stay close to home first.",
      "The result? Totally fine. A little freaked out on that long bridge to Marin, but otherwise good. My wife was with me and super supportive. Major win.",
      "## Trip 2: LA (Flight #1 in a Decade)",
      "The build-up to Hawaii continued. This time we flew JSX from Concord to Burbank, kinda semi-private, crazy expensive but super chill.",
      "It was my first flight in like 7-10 years. And I was OK! I used everything I\u2019d learned from The Anxious Truth book. I leaned into the fear and treated it as growth. Fear setting helped: What happens if I don\u2019t do this? The consequence of not facing it felt way worse than sitting with the fear.",
      "Flight back? Even easier.",
      "## Trip 3: LA Again, Solo This Time",
      "As my old boss said, \"We need repetitions.\" I knew from marathon training that repetition is everything.",
      "This time I flew from Oakland, alone, on Southwest. Way harder. Security and airports in general are super triggering for me. I had a bit of a freakout pre-flight, but I told myself, \"There\u2019s no way you\u2019re not getting on that plane.\" One second at a time, breathe, focus. Takeoff is the worst, but once I\u2019m in the air, I\u2019m fine.",
      "## Then Life Happened",
      "Plans got shuffled due to animal sickness. I spent the rest of 2024 doing pottery, taking care of my critters, and adjusting to a new administration.",
      "Now it\u2019s March 1st, 2025. I just turned 40. I\u2019m excited. I\u2019m still anxious. I\u2019m thinking about flying over an ocean and imagining all the worst-case scenarios, but I will endure.",
      "I\u2019ve got my cozy outfit, my stuffed animal, my Switch (yes, I\u2019m a child), and a ridiculous number of snacks. My friend used to call me a human pinata. I prefer to think of it as a 5-hour snack-fueled movie session in the sky.",
      "I had my usual freakout at the airport. Popped in my headphones. Wrote in my journal (seriously helps, highly recommend). And told myself: there\u2019s no way we\u2019re turning back now.",
      "Yeah, I\u2019m hard on myself. But I truly believe the only way out of anxiety is **through** the fear. You can take meds, but long term they can make it harder. So I breathe, remind myself that thoughts are just clouds passing by, and remember that the cure for my anxiety is **confidence and creativity.**",
      "## Hawaii, Finally",
      "And just like that, we\u2019re in Hawaii. Our favorite place.",
      "But wait, bonus challenges! GDC for 3 days straight (completely fried my brain and social battery), then an immediate trip to Santa Cruz to visit family (total boss fight).",
      "And I did it. All of it. I was exhausted, sure. Slept 10 hours a night for 3 days straight afterward, but I did it. No panic attacks. No bailouts. I breathed, I accepted the feelings, and let them pass. Like clouds.",
      "## So What Did I Learn?",
      "- Bring a journal everywhere. Write even when you don\u2019t feel like it.\n- Less phone, less media. Total game changer.\n- Shift mindset from fear to **creativity and confidence.**",
      "I hope this post helps someone move toward their own goals. Or at least feel a little more seen. Anxiety is still part of my life. It\u2019s constant. But each day is a new shot. Some are calm, some are tough. Accepting where I am in each moment helps me accept myself more too.",
    ],
  },
  {
    slug: "zero-to-zero-point-five",
    image: "/blog/zero-to-half.jpg",
    title: "Zero to 0.5: The Hardest Part of Building Anything",
    subtitle:
      "Most things die before they even become an MVP. Here\u2019s how to survive the messy middle between idea and prototype.",
    date: "2025-03-27",
    tags: ["Startups", "Entrepreneurship", "Product Management"],
    content: [
      "If you\u2019ve worked in tech or games over the past 10 years, you\u2019ve probably heard someone drop the phrase \"Zero to One\" (yeah, that one, from Peter Thiel\u2019s book. I\u2019ve always felt like there\u2019s a big missing piece in that framework.",
      "See, most of that book is about what it takes to launch a product or company, and don\u2019t get me wrong, that\u2019s cool and helpful and very Silicon Valley. But for people like me, who start lots of projects from literally nothing, the hardest part isn\u2019t launch. It\u2019s getting from idea soup to something real enough to work with. I call this phase **Zero to 0.5**. Halfway to somewhere.",
      "As a PM, I usually get pulled in right between 0.5 and 1. Some founder or CEO has focused on the 0-0.5 phase, doing the early product stuff themselves, and then realizes, \"Wait, we need someone to actually make this happen.\" That\u2019s usually when I show up.",
      "So this post is for anyone stuck in that weird, messy, early phase. Not idea stage. Not MVP. That weird space in between where everything is vague.",
      "## Ok, You\u2019ve Got an Idea. Now What?",
      "Let\u2019s say you\u2019ve got an idea. You\u2019re probably not technical (I\u2019m not). Or maybe you are technical, but you don\u2019t want to do all the work alone. So... what do you do?",
      "This is where most ideas go to die.",
      "I\u2019ve heard thousands of ideas. Literally. They\u2019re fun to talk about. People love them at parties or over drinks. But the second you try to actually make something? Game over. First wave of excuses:\n- \"It\u2019s not the right time.\"\n- \"I can\u2019t code.\"\n- \"The market\u2019s too small.\"\n- \"There are too many edge cases.\"",
      "All legit! But here\u2019s the real danger: stopping.",
      "I told myself this early on and I still repeat it all the time:",
      "\u201CIf you stop, it means you quit. If you keep going, it just means you\u2019re figuring stuff out.\u201D",
      "So write down the problems. Call out the flaws. But don\u2019t stop. That\u2019s it. That\u2019s the trick.",
      "## Let Me Back Up: What Is Side Quest Games?",
      "I\u2019ve been in games for 15 years. I\u2019ve shipped a bunch of stuff. But I\u2019ve never made a game of my own. And I had this moment with my mentor years ago where I said, \"I want to run my own studio someday.\" And then I just... never did. Life, work, all that.",
      "So I finally said screw it and posted on LinkedIn: \"Does anyone want to make a game with me?\"",
      "And to my surprise, a ton of people said yes. I ended up with ~20 people, all early-career folks or folks between jobs. I told them up front: there\u2019s no funding, we\u2019re doing this for fun and exposure, maybe a portfolio piece, and if we ever launch something, we\u2019ll just split revenue evenly.",
      "## The Volunteer Team Lifecycle",
      "Here\u2019s how these projects usually go:\n- **Excitement Phase:** Everyone\u2019s stoked. Ideas are flying.\n- **Reality Check Phase:** Oh wait. This is... a lot of work.\n- **Pain Cave Phase:** This is really hard. People start ghosting.\n- **Survivors Phase:** If you\u2019ve still got a team, congrats. You\u2019ve found your core crew.",
      "We started with 20. We\u2019re down to 7. All awesome, talented people. All still juggling interviews and freelance gigs. Because again, this is a side quest.",
      "## The Messy Middle: Team, Tools, and Tech",
      "So once you\u2019ve got the idea, the rough team, and some energy, the \"business stuff\" starts creeping in: Who owns the IP? Are we an LLC? A studio? What tools are we using? Who\u2019s doing what?",
      "I didn\u2019t want to deal with it. Legal docs feel like bad vibes when you\u2019re just trying to have fun. But eventually, we hit a wall. So here\u2019s what we did:\n- Made a game jam agreement + commercialization doc\n- Formed an LLC\n- Picked tools: Discord (chat), Linear (tasks), Miro (planning), Fellow (notes), Google Hangouts (calls)\n- Loosely defined roles and promoted some leads",
      "Not perfect, but enough to keep moving.",
      "## Building Without Devs (Yet)",
      "Our dev needed time. So we didn\u2019t wait. We started prototyping with no-code and low-code tools:\n- **Paper prototyping:** Like, actual Post-its and board game pieces.\n- **Tabletop Simulator:** Digital board game sandbox.\n- **Figma:** For UX and flow.\n- **Unreal blueprints:** Quick and dirty logic.",
      "The goal here was to find the fun before we wrote a line of real code. This saved us weeks, maybe months.",
      "Pro tip: don\u2019t waste your dev team\u2019s time. Test ideas as scrappily as possible. Give them clarity, not complexity.",
      "## Common Pitfalls From 0 to 0.5",
      "- Don\u2019t depend 100% on dev. Prototype in parallel.\n- Don\u2019t expect polished art. Use placeholders or rough sketches.\n- Don\u2019t spend weeks debating engines. Timebox the decision.\n- Don\u2019t skip playtesting. Get something testable ASAP.\n- Don\u2019t assume people have time. Plan around real life.",
      "## Wrapping It Up (For Now)",
      "Once you\u2019ve got something playable, tested, and getting actual feedback, you\u2019re past 0.5. From here, you\u2019re into the territory that Zero to One and Hooked talk about: product-market fit, growth loops, go-to-market, and monetization.",
      "So if you\u2019re in the trenches, wondering if your idea is worth it. Just keep going. Keep moving. Keep testing. Even if it\u2019s ugly, even if it\u2019s slow. That\u2019s Zero to 0.5. That\u2019s the hard part. And if you\u2019ve made it this far, you\u2019re already doing better than most.",
    ],
  },
  {
    slug: "forgotten-memories",
    image: "/blog/forgotten-memories.jpg",
    title: "Forgotten Memories",
    subtitle:
      "I found my pre-internet photo archives under the bed. Here are the life lessons hiding in those old film rolls.",
    date: "2025-03-13",
    tags: ["Personal", "Photography", "Creativity"],
    content: [
      "So here\u2019s what I did today, because why not? I went underneath our gross bed, which is literally full of dog and cat hair, and started cleaning. Because, obviously, with all my spare time, I needed some serotonin-boosting cleaning energy to dust off both my brain (and the bedroom).",
      "Then I discovered the archives of my pre-internet era. WOAAAAAH. Yes, back in ancient times, before digital cameras, we used to use chemicals to make images. We took these chemical tubes (also called film) to a place that developed them, 24-36 shots at a time. Then we waited for our pictures.",
      "Literally. I think this is why some generations have more patience than others. We never saw our pictures for days after we took them. Sometimes weeks, if we forgot to pick them up. Now it\u2019s instant, and almost instantly uploaded to the internet.",
      "Anyway, I found these amazing archives and, of course, because I love organizing, I started making little piles. I separated them by era:\n- One pile was high school/college\n- Another was early career (SF life)\n- And then the early dating (first met Heather) times",
      "Seriously, I got a little choked up reading some of the notes we wrote to each other.",
      "But... I also found CDs full of my photos! I haven\u2019t had a disc drive for years, but since we\u2019re now weirdo bunker people with a DVD player and disc burner, I can finally put them on my computer.",
      "## Lesson 1: Do Something Creative with Friends",
      "This is something I did a LOT in my 20s. The photos show me and my photographer friends going out and taking night photos (yes, we were total dorks). While I definitely partied, we mostly went on night shoots, drank beer in parking lots, ate chips, and took pictures of things.",
      "I realize now that this was a huge gap in my life. So, I\u2019ve started doing art with people again at the ceramics studio.",
      "## Lesson 2: Try Things Out, Be Silly, and Go on Adventures",
      "I used to go on little adventures all the time, to a cool rock at night, a beach with friends, or a random concert in the middle of the week. I always found creative ways to document these moments.",
      "The lesson? I was always down to get up and go out, whereas today, I just want to go to bed early. (Which is also okay. You need rest, too.) But sometimes, we need to drag ourselves out and have a good time. Be silly with friends. No matter how old you are.",
      "## Lesson 3: Have a Close Group of 3-5 Friends",
      "Back in the day (pre-cell phones!), people would just show up at your house unannounced, like, \"Yo, let\u2019s go out!\"",
      "This would mortify people today. The thought of someone just popping by is unthinkable now. But back then? We were so comfortable with each other that it was totally normal.",
      "I\u2019m still working on this one.",
      "## Lesson 4: Take More Photos",
      "I know, I know. People hate photos of themselves (same), or they want them to be perfect before posting online. But sometimes, you need to just take photos for yourself.",
      "The ones I found have never been online. Which is wild, because now everything worth sharing goes online instantly. Half my life is undocumented digitally. It all sits in an archive under my bed.",
      "## Lesson 5: Stop Taking Yourself So Seriously",
      "This has been the hardest lesson to learn, but probably the most important one.",
      "When we were younger, we just lived, flew by the seat of our pants, didn\u2019t take life so seriously. Now? I take everything seriously. It\u2019s exhausting.",
      "When did we stop being free-spirited and fun? Was it when the bills started piling up? The first promotion? Making more money? Supporting a family? Or just getting a little more tired and achy?",
      "I can\u2019t pinpoint exactly when, but it\u2019s time to loosen up.",
      "## Final Thought: All These Rules? We Made Them Up.",
      "You can kind of do whatever you want (as long as it doesn\u2019t harm anyone, including yourself). Most things we stress over are just guidelines, not hard-and-fast rules.",
      "So:\n- Go out for lunch.\n- Sit on a bench and draw something. (Even if you\u2019re bad at it. Actually, especially if you\u2019re bad at it.)\n- Close your laptop.\n- Take a mental health day.",
      "Time is the only non-renewable resource. So we might as well enjoy it, right?",
    ],
  },
  {
    slug: "after-careful-consideration",
    image: "/blog/after-careful-consideration.jpg",
    title: "After Careful Consideration...",
    subtitle:
      "What happens when rejection becomes your daily routine, and how starting Side Quest Games changed everything.",
    date: "2025-03-10",
    tags: ["Career", "Startups", "Resilience"],
    content: [
      "If you know, you know. Those 3 words can instantly deflate any excitement after a quick scan of an email. At times, a subject line can be misleading, sparking a glimmer of hope, only to be extinguished when you open the message. What does it mean when you spend day after day reading endless automated rejection letters from applications you poured your heart into? Some of these applications included detailed interview responses that took hours to perfect, meticulously crafted cover letters, and extensive research before even clicking \"submit.\" And yet, the outcome is the same: silence, or worse, another rejection without even a screening call.",
      "## Taking Matters Into My Own Hands",
      "It\u2019s been four months of this. Four months of rejection, self-doubt, and frustration. Eventually, I threw in the metaphorical towel and said, forget it. If no one was going to hire me, I\u2019d create my own job. And so, we started a game team, **Side Quest Games**. It\u2019s a team full of people who are also unemployed or looking to break into gaming. Some of them are employed but eager to transition into gaming, learning from those of us who have been in the industry for years.",
      "## From a LinkedIn Post to a Movement",
      "Yes, this all started with a simple LinkedIn post, ironically on one of the most depressing social media platforms. The tech and gaming industries have been through hell, and LinkedIn is flooded with posts from colleagues announcing yet another round of layoffs. But this isn\u2019t meant to be a depressing post. It\u2019s supposed to be exciting, upbeat!",
      "For the first time in a long while, I feel motivated. I haven\u2019t felt like myself in ages. Being rejected over and over again, especially after two consecutive layoffs, was a brutal hit to my ego. But I embraced stoicism, took a step back, and reflected deeply on my purpose and how to become a better version of myself.",
      "## The Power of Asking for Help",
      "So, what helped me pull myself out of this rut? I asked for help. I know, that sounds simple, but for someone like me, who thrives on helping others and rarely asks for anything in return, it was a big deal. I\u2019ve always wanted to make a game, but I never became one of those savant designers who could code, handle product management, design, and create art all by themselves.",
      "So, I put my ego aside and reached out. And guess what? People came from all corners of the internet. Some were old friends I hadn\u2019t spoken to in 10+ years. It\u2019s been heartwarming to hear their stories, why they want to build something with us, and what they\u2019ve been through over the years. For the first time in a long while, I didn\u2019t feel alone.",
      "## The Isolation of Remote Work",
      "Most people outside of gaming and tech don\u2019t realize how isolating this industry can be. Many of us sit at home, staring at glowing screens, hoping someone will reach out and say, we need you. When you\u2019re not in an office, you lose that sense of connection, the ability to commiserate when things get tough.",
      "But I finally got so fed up with being depressed Jon that I decided to put myself out there, unapologetically, authentically. Who was I even pretending for? There was no job lined up, no corporate ladder to climb, just me and this group of people building something together.",
      "## Introducing Side Quest Games",
      "And that\u2019s how **Side Quest Games** was born. It\u2019s not a company in the traditional sense. It\u2019s a collective. A side quest to all of our careers. I don\u2019t expect people to quit their jobs or put financial stability on hold.",
      "At Side Quest, we make our own rules:\n- **Rule #1: We are a collective.** We build beautiful things without replacing creativity with AI. We take a democratic approach: every major decision is made through Discord polls and open discussions until we reach a consensus.\n- **Rule #2: We prioritize good vibes.** If you\u2019re working for free, the experience has to be worth it. That means no toxic energy.\n- **Rule #3: Experiment and iterate.** Side Quest Games isn\u2019t about playing it safe. It\u2019s about pushing boundaries, trying weird ideas, and embracing the unknown.",
      "## Final Thoughts: Just Start Something",
      "And that\u2019s the story. What started as a rejection-filled, soul-crushing job hunt turned into something truly special. We may not know where this journey will lead, but at least we\u2019re making something real, something fun, and most importantly, something ours. So, if you\u2019re feeling stuck, if you\u2019re sick of waiting for someone else to give you an opportunity, create your own. Ask for help. Start something. And who knows? It might just change everything.",
    ],
  },
  {
    slug: "live-like-its-2005",
    image: "/blog/live-like-2005.jpg",
    title: "Live Like It\u2019s 2005",
    subtitle:
      "What if we ditched the algorithms, bought CDs again, and got lost without GPS? I\u2019m trying it.",
    date: "2025-02-17",
    tags: ["Personal", "Technology", "Creativity"],
    content: [
      "\"What is this guy talking about? Has he lost it completely?\" Maybe... lol. But hear me out.",
      "If you remember 2005, think back to how we lived. How did we meet up with friends? How did we listen to music, watch movies, or get anywhere?",
      "There were barely any smartphones. Blackberries were king. The iPhone didn\u2019t exist yet. If you wanted to buy something, you went to a store. If you needed directions, you got lost and figured it out. And somehow, we all survived. I look back at that time fondly.",
      "So, where am I going with this? I recently watched a video of someone unbundling their iPhone, stripping away the non-essential apps, and rethinking their relationship with tech. That got me thinking: What if I did the same?",
      "## Step 1: Bringing Back the Camera",
      "The first thing I did was stop using my phone for photos. Instead, I started carrying a real camera.",
      "This fully unlocked the joy of actually taking photos instead of just snapping and sharing. Our phones optimize for effortless, perfect shots, but they also strip away the fun of learning, experimenting, and being present.",
      "When the photo just exists on the camera, there\u2019s less social compulsion to post it or share it. You take the shot, look at it, maybe take another, then put the camera away.",
      "This all ties into my IRL theme this year, a continuation of last year\u2019s goal. IRL just means doing things in real life instead of through a screen:\n- No pulling out my phone for maps, photos, restaurant searches, or notifications.\n- No filtering my experiences through a lens.\n- Just being present.",
      "## Step 2: Music, Baby!",
      "Music has always been one of my favorite things. But today, algorithms do all the work. Every song in existence is available, but somehow, music discovery feels less personal.",
      "What happened to buying an album, popping it into a CD player, and listening to it from start to finish? What happened to trading mixtapes and discovering music through actual people?",
      "Streaming has flattened the creative space. AI doesn\u2019t explore the fringes. It sticks to the middle of the bell curve. The safe stuff. The easy stuff. The stuff it knows you\u2019ll like. But what are we missing?",
      "That\u2019s why I decided to opt out. Instead of streaming, I\u2019m going back to physical media. Buying CDs. Finding MP3s. Listening intentionally.",
      "## Step 3: Cutting Out Streaming",
      "Here\u2019s where things get crazy. No more Netflix. No more endless scrolling. Instead, I\u2019m buying DVDs and choosing movies intentionally.",
      "Yeah, I know. Sounds extreme. But remember how we used to ask friends for recommendations instead of relying on whatever garbage Netflix pushed to the front page?",
      "I used to work at Blockbuster, and back then, movie culture was real. People actually talked about films, shared their favorites, and dug deep into different genres.",
      "## Step 4: Ditching Google Maps & Getting Lost Again",
      "The next step in my offline experiment? No more GPS. I want to get lost. Be late. Read street signs. Find new places by accident.",
      "There was a time when we actually memorized things. Now? If Google Maps disappeared tomorrow, most people couldn\u2019t find their way home.",
      "## Final Thoughts",
      "Sometimes, slowing down is actually more fun. Just try it.\n- Leave your phone in your pocket.\n- Take pictures with a camera.\n- Buy a physical album or movie.\n- Experience things without an algorithm deciding for you.",
      "And who knows? Maybe we\u2019ll start mailing each other handwritten letters instead of texting.",
    ],
  },
  {
    slug: "martin-ceramics-is-live",
    image: "/blog/martin-ceramics.jpg",
    title: "Martin Ceramics is Live",
    subtitle:
      "A quick shameless plug for my new ceramics website: pottery, glazes, dogs, and all.",
    date: "2025-01-30",
    tags: ["Ceramics", "Creativity", "Personal"],
    content: [
      "Here we go. Jon is about to rant about how much he loves pottery again... buckle up! This is the part where some of you close the window or lose interest. Or maybe you didn\u2019t even click on this one to begin with. Nevertheless, don\u2019t worry, this isn\u2019t a long, detailed blog about glazes and dip times (but if that\u2019s what you\u2019re looking for, I\u2019ve got a place for you!).",
      "This is more of a shameless cross-promotion for my other site, **Martin Ceramics**. I felt like my ceramics didn\u2019t quite belong on my personal site, so I created a dedicated space for all things pottery. I don\u2019t expect everyone to rush over there, but if you\u2019re one of us, someone who can\u2019t get enough of clay, kilns, and glazes, then you might enjoy it!",
      "### The site features:",
      "- A blog just like this one, with in-depth breakdowns of each collection and project.\n- A shop where you can find all my latest work.\n- A section about who we are, including the dogs, cats, and chickens (coming soon!).\n- Some more shameless promotion of my wife\u2019s pottery.\n- Info on events, art shows, and exhibits we attend, or that fellow potters are involved in.",
      "I hope it becomes a helpful and inspiring space, or at the very least, a fun distraction from the day.",
      "That\u2019s it. Just a quick post to say how grateful I am for the time I get to spend on this passion and for all of you who support it. Thank you! Happy potting.",
    ],
  },
  {
    slug: "expression",
    image: "/blog/expression.jpg",
    title: "Expression",
    subtitle:
      "How I lost my creative identity during my tech career, and how pottery, writing, and Rick Rubin helped me find it again.",
    date: "2025-01-20",
    tags: ["Creativity", "Mental Health", "Personal"],
    content: [
      "\u201CArtists who are able to continually create great works throughout their lives often manage to preserve these childlike qualities.\u201D, Rick Rubin, The Creative Act",
      "I know what you are all thinking, here he goes about pottery again... no, actually the story doesn\u2019t start with pottery or end there really, it starts with painting. Yes, the first form of artistic expression was painting. No, not finger painting! I wasn\u2019t that young when I started art, no I was probably around 8 or 9 years old.",
      "My parents had recently gotten divorced and I was getting bullied by my sister. I remember being upset that day so I painted a picture of how that made me feel. I remember my mom showed my sister this painting and my mom said, \"look this is how you are making your brother feel!\" and then my sister laughed at it (kids are so cruel to each other). Anyways, I kept painting. I mostly used acrylics. My mom spent most of her time hanging out with artists so I think some of that rubbed off on me.",
      "I didn\u2019t like talking about my feelings so most of my early expressions came out in my paintings. So what\u2019s my point to all this, well I guess I\u2019m trying to start with the origin of our creativity and expression before we are indoctrinated with all the complexity of adult life.",
      "Children are often the purest form of what we truly are as humans but unfortunately we squeeze all that out of them through school, societal structures and norms, and inadvertently when life gets more and more demanding the first thing that often falls off is our expression and creativity.",
      "## Losing My Creative Expression",
      "\u201CFocusing solely on results can strip the work of its authenticity and rob the creator of joy.\u201D, Rick Rubin, The Creative Act",
      "The next part of this story is more around the middle of my journey. We are about 5-6 years into my career in gaming now. I\u2019ve ditched art completely as a profession because my mentor told me to pursue business and design since the road, that he himself experienced as a graduated oil painter from Pratt Institute, was extremely difficult.",
      "I\u2019m so thankful for this pivot because doing art professionally was extremely challenging for me. The speed wasn\u2019t within my skillset, I was up against the most talented artists in the industry, the work wasn\u2019t aligned with how I wanted to express myself as an artist since the output was mainly commercial, digital art, and the salary peaked fairly quickly into your career.",
      "Ok so, fast forward a bit, I\u2019m currently a game designer building mobile games, and I remember saying to myself when I started my career, \"I\u2019ll do this so I can pay for photography then I\u2019ll just quit.\" I felt like I deceived myself because I didn\u2019t pursue this at all.",
      "So what happened? Nothing, I actually left game design and started doing product management. This job is even less creative than any of the other ones because it involves really pushing as much business growth out of a product as you can get, most users, most engagement, and most revenue. This shift in career trajectory was great for my salary and net worth but it was also a big loss for my personal expression.",
      "## Rediscovering Creativity",
      "\u201CIf you know what you want to do and you do it, that\u2019s the work of a craftsman. If you begin with a question and use it to guide an adventure of discovery, that\u2019s the work of the artist.\u201D, Rick Rubin, The Creative Act",
      "Fast forward to year 7 of my career in Product. I joined a young scrappy group of first time founders based in LA that were obsessed with expression. They were trying to build a fashion platform for GenZs through developing avatar technology and partnering with celebrities and brands. This was the first creative first team I\u2019d been on in years. They really encouraged authenticity and expression.",
      "I started using a new app called TikTok and it was incredible. Most other social media had become so boring to me and I barely used it but this new app was incredible. It had content that was so unique and creative. The algorithm knew me better than I knew myself. I started learning things, finding new people I never knew existed before, doing my old hobbies that I missed like running, rock climbing and photography.",
      "## Where I Am Today",
      "\u201CAll art is a work in progress. Perfectionism gets in the way of fun. A more skillful goal might be to find comfort in the process.\u201D, Rick Rubin, The Creative Act",
      "I\u2019ve successfully unraveled whatever was tangled up inside my brain and started creating again. My wife was a huge inspiration for me to start sharing my content. Her community and growth was such an inspiration to see so I finally started sharing more.",
      "\u201COne of the greatest rewards of making art is our ability to share it. Even if there is no audience to receive it, we build the muscle of making something and putting it out into the world.\u201D, Rick Rubin, The Creative Act",
      "Expression is a part of your health. After sharing my art more and designing more I feel more myself than I have in the last 10 years. There\u2019s also some science backed studies that show the antidote to anxiety is creativity. Literally the opposite parts of your brain light up when you start thinking creatively vs anxiously. So, just from a biohacking perspective if you suffer from high stress or anxiety, embrace who you are and express yourself in the way that you feel comfortable.",
      "I also highly recommend reading **The Creative Act by Rick Rubin** because he makes a point for expression with no barriers. He gives you the power to create whatever you want with no judgement.",
      "\u201CAll that matters is that you are making something you love, to the best of your ability, here and now.\u201D, Rick Rubin, The Creative Act",
      "Artists and people who are expressive often suffer from being overly critical of their work. When you just let the work be what it is for that given moment you relieve yourself of judgment. Express yourself and do it as much as you feel you need to. It should come very naturally and without judgment, the mastery will be there for you at the end.",
      "## Where Do We Express Things These Days?",
      "I am not using any Meta products because they are currently threatening our democracy as a country by altering and censoring the content. This is not done to protect users but instead quite the opposite.",
      "Here\u2019s my take on this: use the tool that enables what you want to express and what you are comfortable with. For me it\u2019s a website with an email list and using apps like BlueSky that align better with my moral and ethical compass.",
      "## A Final Word on Expression",
      "Do your research on the apps and products you decide to use as you may be disgusted by what they accept and who they support. Follow the spark, you don\u2019t have to love everything you try to do, just follow the curiosity and spark that you get either from a cooking class where you burned the meal or from a pottery class you ended up doing for a year, it\u2019s all discovery and expression even if you suck at it.",
    ],
  },
  {
    slug: "2024-my-most-consistent-year",
    title: "2024: A Year of Focus and Health",
    subtitle:
      "How I went from barely leaving the house to logging 372 hours of activity, and finally got my mental health back on track.",
    date: "2025-01-15",
    tags: ["Mental Health", "Fitness", "Personal"],
    image: "/blog/2024-focus-health.jpg",
    content: [
      "2024, although turbulent professionally, was the year I became more focused and healthy than ever before. I want to share a story about my 2024 year in health, and hopefully, you can glean some insights on how to make 2025 your healthiest year yet.",
      "For me, I really love fitness, probably to a fault. I lean on it when times are tough to help me cope with stress. I also lean on it when times are good as an excuse to get outside when the sun is shining, making it a healthy outlet.",
      "2024 was the year I was fed up. I entered 2024 unemployed, tired from yet another failed startup attempt, facing a very difficult job market, feeling lonely, nearly broke, and just completely worn down from everything that had happened over the years. I was anxious, barely left the house, didn\u2019t hang out with friends in person, had no hobbies, and lacked the energy for the ones I used to enjoy. I was just a husk of a man.",
      "I told myself that if I did nothing else in 2024 but overcome my anxiety and get my mental and physical health back on track, I would be perfectly content, even if I tried and failed miserably.",
      "## Phase 1: Heather Signs Me Up for Activities",
      "Heather loves signing me up for things. This time, it was an 8-week pottery class.",
      "The class went tremendously well. Since I had an abundance of time, I went to the studio six days a week, spending 2-6 p.m. there. I was relentless. I made as much as I possibly could, learning while I looked for jobs. I wasn\u2019t getting many interviews, so being at the studio was much better for my mental health.",
      "## Phase 2: Consistency in Training",
      "A lot of psychologists say that anxiety and mental health issues can be improved through fitness and routine. So, I decided to get my ass out of the house every day. My goal was to walk or run every morning, meditate at least three days a week (usually through yoga), and try to eat a healthier diet.",
      "By the end of the year, I had exceeded my goals. I was more active in 2024 than ever before, logging a total of **372 hours of activity**, just over an hour a day on average! This helped boost my confidence, which is another key to reducing anxiety. The more confident you are, the less anxious you feel.",
      "## Phase 3: Socializing",
      "We started booking events to attend together. I bought some concert tickets, and we went to some great shows at The Greek Theatre. It was wonderful to finally get out and be in big crowds again. I hadn\u2019t been in a crowd in years, so this was very anxiety-inducing for me.",
      "I also wanted to travel. Coincidentally, we were invited to several events, including two weddings, one in Santa Monica. I managed to get on a plane for the first time in about eight years! I even took two flights last year.",
      "## Phase 4: What\u2019s Next?",
      "This year is all about refinement. I have a great system in place where I get up early, run in the morning, and now lift weights in the evening. I\u2019m also writing more and in the process of removing things that don\u2019t add value, like certain social media platforms, so I can spend more time writing in spaces like this.",
      "2024 was the year I took control of my health and mental well-being. If you\u2019re looking to make 2025 your healthiest year yet, I hope my story inspires you to take that first step, no matter how small, and keep going. It\u2019s worth it.",
    ],
  },
  {
    slug: "a-retrospective",
    title: "A Retrospective",
    subtitle:
      "From COVID pivots to crypto to stillness. Five years of career moves, lessons learned, and building with my hands.",
    date: "2025-01-15",
    tags: ["Career", "Gaming", "Personal"],
    image: "/blog/retrospective.jpg",
    content: [
      "The year was 2019. I was in a stable job at a big insurance company, building and managing an app with a small team in their marketing department. I was a product manager and had been there for 2.5 years. I wasn\u2019t making the most money I\u2019d ever earned, but the job was fairly low stress.",
      "Why am I explaining all this? Well, 2019 was the year COVID-19 hit, disrupting my life and the lives of countless others across the world. I\u2019m writing this because I found myself at a crossroads. I was pulled out of my normal, everyday decision-making routine and forced to make some really hard choices that would change my life forever.",
      "## Rewinding to 2019: The Start of Remote Work",
      "By April 2020, we were all working remotely. I began to ask myself: What if I don\u2019t go back to an office for a year, or even two years? If you strip away the in-person interactions of office life, all that remains is the work itself. So the work has to be that much more important and enjoyable.",
      "This was a huge shift for me. I realized I liked the people at my company more than I liked the work, and this realization made me start looking around for new opportunities.",
      "That\u2019s when I found an incredible mental health startup. I saw that mental health in this country was deteriorating rapidly, mine included, and that more energy was needed to help people. So, I left my steady job to join this tiny startup, which consisted of just seven people.",
      "## Jumping into Startup Life",
      "I took a job where I hadn\u2019t met anyone in person, was dropped into a very challenging situation, and had to figure it out on my own. Needless to say, it didn\u2019t work out.",
      "**Lesson one:** Don\u2019t take roles where you report directly to the CEO unless you thrive in a highly unstructured environment.",
      "**Lesson two:** Government and medical contracts are extremely hard. The amount of technology and compliance required to manage medical records is no joke.",
      "One big takeaway: if I join another small startup, I need to meet my manager and some of the team in person before accepting the job. Compatibility is non-negotiable.",
      "## The Metaverse Era",
      "My friend was working at an avatar company in LA, and I ended up joining them. These were first-time founders, incredibly ambitious, and focused on building an avatar ecosystem similar to Ready Player One. They had celebrity partnerships, an app, a website, and a big dream.",
      "This team grew at a blistering pace. They leaned into digital expression through relentless creativity, enabling authentic expression among younger audiences. Many of them were misfits, just like me. Most had dropped out of school, and I really vibed with that energy.",
      "But there was one thing I hadn\u2019t anticipated: the company pivoted into the crypto web3 space. This was 2020, during the NFT boom, and we did well, so well that Bob Iger, Disney\u2019s CEO, invested and joined our board.",
      "Despite the success, my career growth hit a ceiling. As the company scaled, leadership brought in big-name VPs with Fortune 500 and Ivy League credentials instead of promoting internally. I saw the writing on the wall.",
      "## Back in Gaming",
      "Here I was, back in gaming, publishing games for brands like the NFL. The team was talented, and the offer was generous, but the company grew too fast. The market shifted, and layoffs came.",
      "Lesson learned: even great companies can falter under rapid growth. When you see red flags like unchecked expansion, pay attention, even if the offer is tempting.",
      "## Into the Crypto Abyss",
      "Next up: the real crypto company experience. This was exactly what I imagined crypto would be: engineers who didn\u2019t reveal their names or faces on camera. I never got used to that.",
      "That said, the founders and CTO were fantastic. I met them in person at GDC, and their intentions seemed genuine. The problem was timing and fit. Their culture was no meetings, all asynchronous, with very lightweight agile practices. It just wasn\u2019t my style.",
      "Sometimes, even with good intentions, things just don\u2019t work out. The timing wasn\u2019t right, and the culture wasn\u2019t a fit for me.",
      "## The Present: Stillness and Simplicity",
      "Over the last three months, I\u2019ve embraced stillness. I recently read Stillness Is the Key, and it reshaped my perspective. I learned the value of doing nothing, not doom-scrolling, but truly sitting quietly, observing my thoughts.",
      "I started running without headphones, just listening to my footsteps for hours. It\u2019s been a meditative experience. This phase of my life is about curiosity, stillness, and peace.",
      "## Building with My Hands",
      "This is the era of IRL for me. I\u2019ve been focusing on real-life experiences: paying for moments, going on trips, and building things with my hands. Building with your hands is deeply fulfilling. Whether it\u2019s pottery, carpentry, or painting, anything you can look at and say, \"I made that,\" brings immense joy.",
      "I\u2019ve also prioritized in-person relationships. My therapist told me when I was 10, \"You don\u2019t let people in. You need to share your feelings.\" That advice still resonates, and writing these blogs is part of my mission to connect more deeply with others.",
      "## Final Reflections",
      "The last four years have been transformative. I hope my story inspires you to reflect on your own journey. Consider what you can add or remove from your life to grow into a better version of yourself. Let\u2019s embrace change, build meaningful relationships, and focus on what truly matters.",
    ],
  },
  {
    slug: "the-anti-resume",
    title: "The Anti Resume",
    subtitle:
      "Why we need to stop relying on two-page documents to identify talent, and what I\u2019m doing instead.",
    date: "2024-12-09",
    tags: ["Career", "Product Management", "Personal Branding"],
    image: "/blog/anti-resume.jpg",
    content: [
      "This is a love letter to hiring managers, recruiters, sourcers, headhunting firms, and, most importantly, all the job seekers out there relentlessly applying for opportunities. I want everyone reading this to rethink how we find great people and how we, as job seekers, present ourselves to those searching for the perfect fit for their teams.",
      "This post is about a concept I\u2019ve started putting into practice. My background isn\u2019t conventional: short stints at small startups, no high school diploma, no college degree, and minimal formal training outside of work. Yet, I\u2019ve managed to bootstrap my way to where I am today, thanks to the generosity of people who shared their time and knowledge to teach me new skills.",
      "## Apply, Apply, Apply",
      "Day in and day out, I submit an endless array of applications. Most of these rely on a two-page document summarizing my 15 years of professional experience. This single document, my resume, is the only thing standing between me and a human interaction. With all the technology we have, why are we still using resumes to identify talent at the earliest stage of the hiring process?",
      "Every time I restart my job search, the same thought pops into my head: Why are we still using this relic to get jobs? Sure, it probably works well for some, the ones with prestigious colleges, impressive companies, long tenures, and stellar extracurriculars. But for most of us, a resume doesn\u2019t really explain who we are as workers.",
      "## Who Are You Really?",
      "My goal with this site, and this rant, is to advocate for breaking this resume-first culture. People and brands are moving toward more authentic expression, stripping away filters and glossy perfection.",
      "Here\u2019s what I\u2019ve learned after five years at startups, interviewing people, and structuring interview processes:\n- A resume doesn\u2019t explain who someone is or what they can do. It only shows what they\u2019ve done.\n- Startups are tough environments, especially for PMs or founding PM teams. What works at a big company doesn\u2019t always translate.\n- If someone comes from large, traditional firms, I probe extra hard about their startup mindset.\n- Strong motivation and tenacity often get filtered out during the sourcing phase.\n- Interviews are about getting to know people. Culture fit often outweighs technical skills.",
      "## The Anti-Resume",
      "So why am I explaining all this? Because I want to propose something new: the **anti-resume**. What is it? It\u2019s whatever you want it to be. The point is to share what isn\u2019t on your resume. What makes you tick? What do you love? Hate? What do you do when you aren\u2019t working? Who are you, really?",
      "This is about showing your personality, passions, and unique knowledge. Share those. The goal is to express your non-work self so people can really get to know you.",
      "**For example:** Last week, I launched my professional pottery website. It was terrifying because it put my art out there for real. No one has bought anything yet, and yeah, it stings. But I\u2019m learning to deal with rejection because it\u2019s necessary for growth.",
      "Adam Grant captures this beautifully in his book Hidden Potential:",
      "\u201CPersonality is how you respond on a typical day, character is how you show up on a hard day.\u201D",
      "This one lives in my brain rent-free. I absolutely love it because I\u2019m always seeking out the hard days. They\u2019re what carve me into a better version of myself.",
      "\u201CBecoming a creature of discomfort can unlock hidden potential in many different types of learning. Summoning the nerve to face discomfort is a character skill, an especially important form of determination.\u201D",
      "When I see someone who has entered a new industry, switched careers, gone back to school, or built something they didn\u2019t initially know how to build, I get excited to talk to them. These people are lifelong learners.",
      "## Conclusion",
      "You might wonder, what does my pottery site have to do with who I am as a professional? Well, to an experienced eye, it might show that in just a year, I\u2019ve managed to not only create tangible products with my own hands but also develop a distinct style and design that reflects my interests. Beyond that, I\u2019ve connected with a community, building meaningful relationships along the way.",
      "As always, I\u2019m here to disrupt, share, express, support, and bring great vibes to everyone. I hope this inspires you to build your anti-resume and personal brand. Let\u2019s break the mold together.",
    ],
  },
  {
    slug: "empty-the-cup",
    title: "Empty the Cup",
    subtitle:
      "Bruce Lee\u2019s philosophy helped me navigate the hardest month of my life, here\u2019s what I learned about making space for growth.",
    date: "2024-12-06",
    tags: ["Mental Health", "Personal Growth", "Resilience"],
    image: "/blog/empty-the-cup.jpg",
    content: [
      "\u201CEmpty your cup so that it may be filled; become devoid to gain totality.\u201D, Bruce Lee",
      "This mantra has been my guide every time I meditate, and lately, it\u2019s taken on a deeper meaning. Life threw some serious curveballs at me this past month, and I\u2019ve been reflecting on how to navigate these challenges while staying on a path of self-improvement.",
      "It\u2019s been rough. I won\u2019t sugarcoat it. When things get difficult, I remind myself: You\u2019ve trained for this. It\u2019s in the darkest moments that your true character and abilities are revealed.",
      "## What Does \"Emptying the Cup\" Mean?",
      "After reading the book Be Like Water My Friend by Shannon Lee I realized I wasn\u2019t giving myself space to grow. I was trying to build new habits and rituals while clinging to old ways of thinking. Imagine pouring water into an already full cup. It overflows, leaving no room for anything new.",
      "To truly improve, you need to let go of what no longer serves you. This might mean giving up comforts like sleeping in or indulging in unnecessary purchases. Sacrifice is the price of meaningful growth.",
      "I\u2019ve seen this principle play out in different parts of my life. When I started learning pottery, I quickly discovered it\u2019s not something you can dabble in and expect to master. It took me thousands of hours of failure and frustration before I started to see progress. The same was true when I trained for marathons. Both taught me this: you can\u2019t cling to the old version of yourself while striving to become someone new. You have to empty your cup.",
      "## Lessons from a Challenging Month",
      "At the start of this journey, I thought I had everything figured out. My job was stable, my cats were healthy, and I had exciting holiday plans. Then life happened.\n- I was laid off from my job.\n- A sick cat turned my routine upside down.\n- My 40th birthday plans were postponed.\n- Depression crept in, as it often does this time of year.\n- An election outcome left me frustrated and disheartened.",
      "I wanted to scream, and I did. I cried, ate some cake, and wallowed in frustration. But after that, I had to regroup. Life doesn\u2019t stop for our setbacks.",
      "## Key Takeaways",
      "Here\u2019s what I learned from what I\u2019ll now call \"The November I\u2019ll Never Forget\":\n- **When the unexpected happens, let yourself feel it.** Scream, cry, eat cake, or vent with friends. Acknowledge your emotions instead of repressing them.\n- **Time box the tough phase.** Give yourself a day or a week to feel all the feelings, but don\u2019t let it drag on too long.\n- **Dust yourself off and make a new plan.** Adjust to the new reality and create a path forward.\n- **Adapt and adjust.** Think of it like running into a headwind during a race. Slow down if needed, but don\u2019t stop moving forward.\n- **Stay positive.** Remind yourself that you\u2019ve endured challenges before and can persevere again.",
      "I can\u2019t emphasize the friends part enough here. When you feel like crap it\u2019s so important to ask for help and be around people. This is something I personally struggle with.",
      "## Embracing the Journey",
      "This idea of \"emptying the cup\" has become central to my self-improvement journey. Whether it\u2019s letting go of old habits, facing new obstacles, or adjusting to life\u2019s curveballs, I\u2019ve learned that growth requires sacrifice and resilience. Sometimes you\u2019ll need to pause and take a breath; sometimes you\u2019ll need to grit your teeth and push forward. Both are valid, as long as you\u2019re moving toward your goals.",
      "I started this blog to share my experiences and support others who might be facing similar challenges. Life is weird, messy, and hard, but it\u2019s also full of opportunities to grow. If you\u2019ve ever felt stuck or overwhelmed, know that you\u2019re not alone.",
    ],
  },
  {
    slug: "lemon-soup",
    title: "When Life Gives You Lemons, Sometimes You Get Lemon Soup",
    subtitle:
      "On career storytelling, messy resumes, and why every team needs someone who\u2019s been drinking bitter soup for years.",
    date: "2024-10-23",
    tags: ["Career", "Product Management", "Storytelling"],
    image: "/blog/lemon-soup.jpg",
    content: [
      "When life gives you lemons, people say to make lemonade. But what if you end up with lemon soup? That\u2019s what my career has felt like at times: too many unexpected ingredients, detours, and unplanned challenges. This blog is about the lessons I\u2019ve learned along the way, the power of career storytelling, and how you can turn your lemon soup into a winning recipe.",
      "## The Power of Storytelling in Your Career",
      "A wise friend once gave me some career advice that completely shifted my perspective: \"What story do you want to tell?\"",
      "Until that moment, I\u2019d never thought of my career as a story. But every job move, every promotion, even every failure is a chapter. My friend explained, \"Each shift in your career should tie into the last. For example, \u2018I left this company because I saw an opportunity to build on my skills at the next.\u2019 Each job is a building block.\"",
      "At the core, **you are the product, and your career is your go-to-market strategy.** If you can\u2019t thoughtfully plan your career moves or communicate them as a coherent story, it reflects poorly, not just in interviews, but also in how you lead as a Product Manager.",
      "## Lessons from My Career Moves",
      "**Chapter 1: Positioning Myself to Be a PM:** Mobile was booming, and I wanted to pivot into product management. But the company I was with wasn\u2019t focused on mobile, and the PM teams were very selective. There wasn\u2019t a clear path forward, so I moved to a small startup where I saw more opportunity.",
      "**Chapter 2: Learning PM Fundamentals Through a Side Door:** At the startup, I was hired as a game designer, but there were no PMs on my team. So, I started taking on those responsibilities: building insights, generating reports, learning SQL and Tableau. I even started reporting directly to the executive team. \"How did you get so quant?\" the CEO asked me one night at dinner. With incredible mentors and a lot of hard work, I scaled the product to $50 million in revenue.",
      "**Chapter 3: Innovating and Creating a New Market:** One day, I ran into my former CEO on the street. I asked what he was working on, and he handed me his card: \"Call me if you want a job.\" This was my chance to build something from the ground up with a top-level executive.",
      "## Why Lemon Soup Isn\u2019t a Bad Thing",
      "Despite my best efforts, there were times when things didn\u2019t go as planned. Too many projects, unexpected changes, and side quests turned my career into a chaotic mix. But I\u2019ve learned that leaning into failure is where growth happens.",
      "Adam Grant discusses this in his book Hidden Potential, the people who thrive aren\u2019t the ones with perfect, uninterrupted success. They\u2019re the ones who\u2019ve endured challenges, learned from them, and kept going. Tech companies like Meta love to hear about failures in interviews because they know that grit, learning to fail and recover, is invaluable.",
      "Don\u2019t sell yourself short. If your career looks messy or unconventional, that\u2019s okay. It\u2019s a story worth telling.",
      "## How to Build Your Story",
      "If you feel like you\u2019re stuck in lemon soup, it\u2019s time to start writing your chapters:\n- **Be brutally honest:** Identify the key moments in your career. What worked? What didn\u2019t?\n- **Weave a coherent narrative:** Make connections between jobs, even if they weren\u2019t obvious at the time.\n- **Prepare stories for interviews:** Don\u2019t just list your resume. Tell people what the bullet points don\u2019t say.\n- **Embrace the failures:** Everyone loves a good comeback story. Highlight what you learned and how you grew.",
      "A mentor once told me, \"If you can\u2019t design a slide deck to engage a room, how can you design a product to engage millions?\"",
      "## Conclusion: Every Team Needs a Lemon Soup PM",
      "If you\u2019ve been through tough times and ended up with lemon soup instead of lemonade, wear it as a badge of honor. Every team needs someone who can handle the unexpected, stay calm, and push through when things fall apart. You want people next to you who\u2019ve been drinking bitter soup for years, because to them, whatever crisis comes next will feel like nothing.",
      "So, grab a pen and start writing your own career story. Be honest, be proud, and embrace the chaos. Your journey might not look like a straight line, but that\u2019s okay. Sometimes the best products come from the most unexpected ingredients.",
    ],
  },
  {
    slug: "stop-age-gating-curiosity",
    title: "Stop Age Gating Curiosity",
    subtitle:
      "Why our culture looks down on trying new things at 40, and the neuroscience that says we should do it anyway.",
    date: "2024-08-02",
    tags: ["Personal Growth", "Creativity", "Curiosity"],
    image: "/blog/stop-age-gating.jpg",
    content: [
      "Recently, I\u2019ve been double-clicking on the feeling of \"I\u2019m curious about...\" This has led to tremendous progress in self-discovery and purpose. I initially heard this concept in a podcast by Rich Roll, where he interviewed a man who\u2019s been living out of his backpack for 5 years. He talked about his advice for people trying to understand more about their deeper purpose and discussed this feeling of curiosity and how we\u2019ve forgotten how to sense it.",
      "This tends to happen after we hit adulthood and are on these \"career\" or \"life tracks\" prescribed by society or upbringing. He feels these tracks are misleading for most and don\u2019t lead to happy, fulfilling lives.",
      "My point in this post is to question age and some of the stigmas around trying new things at a certain age. It seems like our culture often looks down on people who try new things, especially around midlife. This makes me a bit insecure about trying new things and also just moving in a completely different direction with my life and career.",
      "Another thing I\u2019ve noticed is I\u2019ve become incredibly boring (this is obviously subjective), but I used to be very spontaneous and fun. This realization came up when I listened to a recent Mel Robbins podcast where they talked about the neuroscience behind habitual behavior and how it leads to stagnation and a lack of fulfillment.",
      "Our brains were designed to seek new, novel things like finding new sources of food and shelter. When we aren\u2019t seeking new things, our brains become discontent. She mentioned that this typically happens in middle age and this \"habituation\" occurs because we\u2019ve made a lot of our big life decisions by this point and are quite content. So, we have to make a much more conscious effort to break out of our routine than we did when we were younger.",
      "So here\u2019s the gist: we need to be curious because our brains really want to find new things. New things excite us and make us feel happy, regardless of age. Culture and society are often at odds with our biology.",
      "Here\u2019s a consolidated blend of what I think they both recommend:\n- **If you\u2019re curious about something, do it.** Try it, go there, dig into it. This requires practice because we\u2019ve forgotten how to be curious.\n- **We are most excited one day before a trip and peak four days into a trip.** To optimize this, go on lots of long weekends to new places.\n- **Break habitual thoughts and routines.** Take a different route, drive a different way home, shift your schedule slightly, eat somewhere new, rearrange your furniture.",
      "I\u2019ve been planning things like going to a concert during the week, finding new places to eat for dinner, cooking new meals at home, starting small projects, and being creative.",
      "I\u2019ll leave you with these quotes:",
      "\u201CThe cure to my sickness was to make something right now, with great creativity and vengeance.\u201D",
      "\u201CI thought being good at something was when other people thought so. It took me a few premature gray hairs to realize that being good at something is simply to enjoy doing it.\u201D",
    ],
  },
  {
    slug: "the-reality-of-being-a-founding-pm",
    title: "The Reality of Being a Founding Product Manager at a Startup",
    subtitle:
      "The survival guide I wish I\u2019d had: real talk on founder delusion, burnout, and why frameworks don\u2019t scale down.",
    date: "2024-07-26",
    tags: ["Product Management", "Startups", "Career"],
    image: "/blog/founding-pm.jpg",
    content: [
      "Being a Product Manager (PM) at a startup is no joke. There are countless books offering hypothetical scenarios and frameworks to navigate every situation, but these systems often fail to scale down to the startup size. They work well for larger organizations but rarely for startups.",
      "If you, too, see endless \"how to get product-market fit in 5 easy steps\" posts on LinkedIn that are unhelpful while you\u2019re busy putting out a hundred different fires, I am here to help.",
      "## Part 1: Oh No, What Have I Done",
      "This is usually the feeling you\u2019ll have when you first join. Often times there\u2019s no PM, there\u2019s no onboarding, there\u2019s no structure or very little on the product side, this means you\u2019ve now entered the sink or swim phase.",
      "### 1. Determine the State of Your Company",
      "Understanding the current state of your company is crucial for every action you choose to make going forward. The book The First 90 Days by Michael Watkins introduces the STARS framework:\n- **Startup**\n- **Turnaround**\n- **Realignment**\n- **Sustaining Success**",
      "Without knowing the state of the company you will inevitably make poor decisions. If you don\u2019t figure this out you could be using logic from other companies you worked at that were in different states.",
      "### 2. Understand Founder Delusion",
      "Founders often have an overly optimistic view because they are constantly selling the company to partners, VCs, or recruits. This can twist their perspective in two directions:\n- **Critical Path Focus:** Get things done quickly.\n- **Growth and Hype Focus:** Raise money, drive growth, and avoid running out of runway.",
      "These two personas can be at odds, causing confusion for the PM. As a PM, you need to balance moonshot ideas with near-term work to avoid distractions.",
      "### 3. Embrace the All-Inclusive Role",
      "Being a founding PM means being involved in everything. This can be overwhelming, but it\u2019s also a unique opportunity to learn a vast amount in a short period.",
      "### 4. Prepare for Burnout and Rapid Growth",
      "The solo PM role typically lasts 6-12 months if the company scales quickly. This is due to potential burnout or the inability to respond to rapid growth without support. Be prepared to hire more product managers as the company grows.",
      "### 5. Apply Frameworks Judiciously",
      "Business school frameworks and acronyms are great, but knowing when to apply them is crucial:\n- **Visionary Leaders:** Drive direction and want to be part of all conversations. PMs need to be tactical and execution-focused.\n- **Data-Driven Founders:** Prefer research, justification, and well-thought-out plans. PMs need to be methodical and articulate.",
      "Understand the founders\u2019 backgrounds and principles to find your groove and fill the product management space that needs filling.",
      "## Part 2: Let\u2019s Go!",
      "Now that we\u2019ve covered the challenging aspects, let\u2019s dive into the exciting and rewarding parts of the role.",
      "### 1. Immense Impact on the Company",
      "As the solo PM, you will have a significant influence on the company. Your role is critical in holding teams together, especially during challenging times.",
      "### 2. Close Relationships with Executives",
      "Being a founding PM means you\u2019ll often work closely with executives. This proximity can lead to building strong, lifelong relationships with them.",
      "### 3. Founder-Like Responsibilities",
      "In a startup, the founding PM is almost like a co-founder. You\u2019re in charge of delivering products to market and communicating how to get the work done.",
      "### 4. Direct Involvement in Building",
      "Startups often focus so intensely on building that formal presentations and business reviews are rare. Your role will be more about direct action and less about preparing slides.",
      "### 5. Becoming an Advocate for the Company",
      "You\u2019ll know the company inside and out, making you a strong advocate in various situations. You may be called into business deal calls or partnership meetings as a technical expert.",
      "### 6. Learning from Mistakes and Mentors",
      "You will make mistakes, but these experiences are valuable learning opportunities. Working closely with experienced mentors will help you grow into a well-rounded PM.",
      "### 7. A Generalist\u2019s Dream Role",
      "Being a PM at a startup requires you to be a chameleon, adapting to various roles and responsibilities. This environment is perfect for those looking to broaden their skills.",
      "## Conclusion",
      "Being a founding PM at a startup is challenging but incredibly rewarding. By understanding your company\u2019s state, balancing founder perspectives, embracing your all-inclusive role, preparing for growth, and applying frameworks wisely, you can navigate the complexities of startup life effectively.",
      "Remember, the journey is tough but offers unparalleled learning opportunities. Good luck!",
    ],
  },
  {
    slug: "how-intercom-restarted-their-company-in-a-weekend",
    title: "How Intercom Restarted Their Company in a Weekend",
    subtitle:
      "The playbook for pivoting an incumbent product to AI-first, from the people who actually did it.",
    date: "2024-12-02",
    tags: ["AI Strategy", "Product Management", "Case Study"],
    image: "/blog/intercom-restart.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "At the Berkeley Haas AI Conference, I sat in on a panel with go-to-market leaders from Intercom, Perplexity, and OpenAI. The Intercom story stood out as one of the most dramatic examples of a company pivoting to AI-first, not over months of deliberation, but in a single weekend.",

      "## The Weekend That Changed Everything",

      "When ChatGPT launched in late 2022, Intercom's leadership team gathered that same weekend. Their conclusion was immediate and unambiguous: this technology would be completely game-changing to their company. What happened next was remarkable. They didn't form a committee or commission a strategy review. They ripped everything up.",

      "The roadmap. The company strategy. The metrics. The organizational structure. Even the company values. As their go-to-market leader put it: \"We kind of restarted the company.\"",

      "## Why Most Incumbents Can't Do This",

      "The speaker was candid about why this is nearly impossible for most companies. Intercom had hundreds of millions of dollars in revenue from their existing product. That's a machine that's working, generating real money. The natural instinct is to protect that machine, to keep making more money from what you've already built.",

      "But their CEO, Owen, made the counterintuitive call: if you look 3-5 years ahead, the world will be fundamentally different. The short-term pain of disrupting yourself is nothing compared to the existential risk of being disrupted by someone else. They had to invest now.",

      "## The Startup-Within-a-Startup (But Actually Done Right)",

      "Everyone talks about building a startup within a startup. Intercom actually did it in a way I haven't seen before. They created a completely self-contained, self-functioning team. This team sat in a different part of the office. They weren't burdened by any existing red tape. While the rest of the company went through transformation, this team had one mandate: just build.",

      "The key difference from typical innovation theaters: this wasn't a side project or a 20% time experiment. This was the company's future. They gave the team real autonomy, real resources, and real urgency. Once the product reached escape velocity, they merged it back into the main company.",

      "## The Market Validation",

      "The results speak for themselves. One year ago, Intercom's biggest go-to-market challenge was convincing prospects they even needed an AI agent for customer service. Today, that question literally never comes up anymore. The new question is: \"How do I know your AI agent is the best one?\"",

      "In traditional SaaS, a shift like that would take three years of market education. In the AI era, it happened in six months.",

      "## The Pricing Revolution",

      "Perhaps the boldest move was shifting to outcome-based pricing. Instead of charging per seat (the standard SaaS model), Intercom charges per resolution. They make money when their AI actually solves a customer's problem. This aligns incentives perfectly but requires massive customer education, especially for support leaders who've only ever bought seat-based products.",

      "## What This Means for Product Leaders",

      "Three takeaways I keep coming back to:",

      "**1. Speed of decision > quality of decision.** Intercom didn't have a perfect plan that weekend. They had conviction that the world was changing and that standing still was the riskiest option.",

      "**2. Real autonomy means real separation.** The startup-within-a-startup only works if the team is genuinely free from the parent company's processes, politics, and pace. Different office. Different rules. Different urgency.",

      "**3. Your pricing model is a product decision.** Moving from seats to outcomes isn't just a finance change. It fundamentally shapes how the product is built, measured, and sold. It forces you to optimize for customer value, not headcount.",

      "The AI era rewards companies that can move with startup speed while leveraging enterprise scale. Intercom showed that incumbents can do this, but it requires the willingness to tear down what's working today to build what will work tomorrow.",
    ],
  },
  {
    slug: "chat-is-ais-radio-drama",
    title: "Chat Is AI's Radio Drama",
    subtitle:
      "GitHub Next's thesis on why chatbots are a transitional form, not the destination.",
    date: "2024-12-09",
    tags: ["AI Products", "UX Design", "Product Thinking"],
    image: "/blog/chat-radio-drama.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "One of the most thought-provoking talks at the Berkeley Haas AI Conference came from Idan Gazit, Senior Director of Research at GitHub Next, GitHub's internal R&D innovation lab within Microsoft. His central argument challenged an assumption most of us have internalized without questioning: that chat interfaces are the natural way to interact with AI.",

      "## The Television Analogy",

      "When television was invented, what was the most popular form of serialized content? Radio dramas. So what was the first television show? A camera pointed at people performing a radio drama, complete with props that made sound effects, like popping a balloon to simulate a gunshot.",

      "They didn't yet know the language of the new medium. Did they know that television would eventually produce MTV Cribs, or cinematic prestige TV? Of course not. Radio was what people knew, so radio was what they recreated.",

      "Idan's argument: we're at exactly this moment with AI. Chat is our radio drama. We default to chat because it's the obvious interface, the one that made ChatGPT a phenomenon. But that doesn't mean it's the best, or even a particularly good, way to interact with AI for most use cases.",

      "## The Ladder of AI Value",

      "Idan proposed a hierarchy of AI value that reframes how we should think about product design:",

      "**Highest value: Invisible.** You walk into the kitchen wanting a salad, and the cutting board and vegetables are already there. Like an invisible butler. You never think about it.",

      "**Next level: Predictive.** The AI guesses what you'll do next based on prior interactions. This is achievable today.",

      "**Current level: Conversational.** You tell the AI what you want. This works, but it's not the ceiling. It's closer to the floor.",

      "True \"AI native\" product design means finding the right moments and matching them with the right modalities. Sometimes that's chat. Sometimes it's proactive suggestions. Sometimes it's the AI silently doing something in the background you didn't even know you needed.",

      "## AI Makes Variants Cheap, And That Changes Everything",

      "Here's a concrete product insight I haven't seen discussed elsewhere. With AI, generating multiple variants of anything is nearly free. Need three approaches to a design? Three drafts of copy? Three code implementations? The marginal cost is close to zero.",

      "This changes how we measure success. If you generate three variants and one gets accepted, your acceptance rate is 33%. That sounds bad by traditional metrics. But the fact that you could explore three roads and pick the best one, that's actually the goal. That's AI-native thinking.",

      "Traditional product metrics were built for a world where creating each variant was expensive. We need new measurement frameworks for a world of abundance.",

      "## The Innovation Lab Playbook",

      "GitHub Next operates in a way that most corporate innovation labs talk about but few actually execute. Idan described it as \"the department of high-leverage bets\" or, more colorfully, \"the department of f*** around and find out.\"",

      "Their process: Every Thursday is demo day. People show off what they've been building. The first signal they look for: does this excite the other people in the room? If three people see a demo and say \"yeah, let's do that\", that's the green light to continue.",

      "Then they extend the project for a few more weeks. Build the next stage. Try it on other people at GitHub. Expand to design partners outside GitHub. Iterate. Gather evidence. Only then do they go to leadership and say: \"Here's the bet. Here's why. Here's a working prototype.\"",

      "Nothing speaks like a prototype. \"As much as my official title is research,\" Idan said, \"it's not research. It's prototyping. Our job is to make.\"",

      "## Hybrids Win",

      "Idan's most personal advice was about career identity. Throughout his career, people asked: are you the best developer? No. The best designer? No either. So what's your value?",

      "\"I can glue those functions together because I live with one foot in either side. The ability to say I am self-capable of going from zero to one. Today with AI, it's like wearing rocket boots. Hybridity was undervalued in the past. Now it's actually a superpower.\"",

      "This resonated deeply. In an era where AI can help anyone execute in any domain, the people who can see across boundaries, who understand product AND engineering AND design, become exponentially more valuable. The specialist advantage is shrinking. The hybrid advantage is growing.",

      "## The Takeaway",

      "We're in the radio drama phase of AI product design. The companies and builders who break out of the chat box, who discover the native language of this medium, will define the next era of software. The question isn't \"how do we make a better chatbot?\" It's \"what does AI interaction look like when we stop assuming it has to be a conversation?\"",
    ],
  },
  {
    slug: "automate-augment-stay-human",
    title: "Automate, Augment, Stay Human",
    subtitle:
      "Snowflake's three-pillar framework for deciding when and how to apply AI in any organization.",
    date: "2024-12-16",
    tags: ["AI Strategy", "Frameworks", "Enterprise"],
    image: "/blog/automate-augment.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "At the Berkeley Haas AI Conference, I heard dozens of takes on AI adoption. Most were either breathlessly optimistic or cautiously vague. The most useful framework came from a VP at Snowflake, who shared the three-pillar model they use internally to decide when and how to apply AI across a 9,000+ person organization.",

      "## The Framework",

      "It's deceptively simple. For any task or process, ask which category it falls into:",

      "**1. Repetitive? Automate it.**\nIf you're doing something repetitive and rote, find a way to automate it entirely. AI handles the work. You move on.",

      "**2. Creative? Augment it.**\nIf the work is creative, writing, design, strategy, analysis, AI does some of the work and you do some of the work. But you're ultimately creating the end product. Human + AI > either alone.",

      "**3. Judgment and social intelligence? Stay human.**\nIf it involves emotional intelligence, social connection, or nuanced judgment, don't use AI. Period. \"That's the way we're going to stay human, all the way through this process.\"",

      "The example for \"stay human\" was telling: when you want to give someone a promotion, talk about their performance, or engage with them personally, don't use AI to craft that communication. It comes from you as a human connecting with another human.",

      "## Why This Framework Works",

      "Most AI adoption frameworks I've seen are either too abstract (\"use AI strategically\") or too specific (\"use Claude for X, GPT for Y\"). This one operates at exactly the right level of abstraction. It gives you a decision rule for any situation without prescribing specific tools.",

      "It also avoids the two most common mistakes companies make with AI:\n\n- **Trying to automate everything**, including things that require human judgment (leading to bad outcomes and employee distrust)\n- **Not automating enough**, applying AI only to \"safe\" creative tasks while ignoring the massive efficiency gains in repetitive work",

      "## Real-World Examples",

      "### Automate: Job Descriptions",
      "Snowflake built an internal tool for generating job descriptions. The old process: 1-1.5 hours per posting: writing, reviewing previous JDs, manager review, multiple rounds. The new process: enter the job title and a few inputs, the tool searches internal and external data, and produces a polished JD in under 5 minutes. The speaker claimed they've already saved two years of cumulative people-time since launch.",

      "### Augment: Mentorship Matching",
      "They built an internal peer-to-peer mentorship program where AI handles the matching, analyzing profiles, preferences, and goals to pair mentors with mentees. The AI does the heavy lifting of finding good matches at scale, but humans still own the actual mentoring relationships.",

      "### Stay Human: Leadership and Communication",
      "The hard line: promotions, performance conversations, personal engagement. Even interview feedback, to some extent. While AI can help structure the process, human judgment in evaluating candidates remains irreplaceable. \"Leadership is absolutely a durable skill. An AI is still pretty far from motivating, inspiring, influencing, persuading.\"",

      "## Making AI Adoption Non-Scary",

      "One of the biggest barriers to AI adoption isn't technical. It's psychological. People are afraid AI will replace their jobs. The Snowflake team tackled this head-on with three steps:",

      "**Step 1: Education.** A 15-minute prompt engineering class for all employees. Not technical. Just \"how to talk to whatever natural language tool you have.\" Everyone takes it, practices, and then they work through exercises in groups.",

      "**Step 2: A comprehensive curriculum.** They created \"AI for Everyone,\" 10 internal courses covering AI concepts, Snowflake's specific products, and the history of AI. Live classes plus recorded sessions.",

      "**Step 3: Start with one thing.** After the training, every employee is asked to find one thing in their workday they can automate. Just one. They report back at the end of the week. This creates a virtuous cycle: once people see a small win, they look for the next one.",

      "\"Once they learn academically, once they have the framework, and once they actually play with the tools, it becomes much easier for adoption.\"",

      "## The Durable Skills That Survive AI",

      "Both speakers on this panel agreed on what will endure as AI handles more technical work:",

      "- **Leadership:** AI can't motivate teams or navigate organizational politics\n- **Judgment:** Navigating complex, gray-area decisions that require weighing competing interests\n- **Curiosity:** Not just using AI tools, but compulsively exploring new ones. \"Did you on a weekend say, 'I'm gonna download this and play with it'? That natural inclination to be curious, to pull threads, to experiment, that's gonna be super important.\"\n- **Performance mindset:** Openness to change, willingness to embrace new tools, resilience when things shift",

      "## My Takeaway",

      "The companies that will win AI adoption aren't the ones with the most sophisticated technology. They're the ones that give their people a simple framework for deciding what to automate, what to augment, and what to keep human, and then make it psychologically safe to experiment.",

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
    image: "/blog/speed-strategy.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "Perplexity is doing something most people thought was impossible: competing with Google in search. At the Berkeley Haas AI Conference, their VP of Growth and Product, Rohan, laid out how they're doing it. The answer isn't a better algorithm or more data. It's speed.",

      "## The Mode Is Speed",

      "Perplexity's CEO has said publicly that the company's mode is speed. Rohan confirmed this isn't just a talking point. It's the operating system of the entire company. \"We live and die by just how fast we can move.\"",

      "Their competitive logic is straightforward: if you're building something genuinely new, a new category of how people search and access information, your product IS your marketing. As long as you can keep shipping products that are fundamentally different and fundamentally better, you'll keep acquiring users. The moment you slow down, competitors catch up.",

      "The question they ask themselves every single day: are we staying ahead of everyone by at least a couple of months?",

      "## Three Pillars of Speed",

      "Rohan broke their approach down into three components:",

      "**1. Hire for dopamine.**\nThey specifically hire people who \"get their dopamine hits off of speed and being able to ship and see impact as quickly as possible.\" This isn't about work ethic. It's about wiring. Some people light up when they ship something on Monday and see the data on Tuesday. Those are Perplexity people.",

      "**2. Develop killer intuition about focus.**\nSpeed without focus is just thrashing. The hardest part is knowing when to go all-in versus when to wait and see. \"To a certain extent, it's a little bit of guessing and you hope your intuition gets you there.\" This is an underappreciated skill: the ability to make fast, high-conviction bets about where to invest effort.",

      "**3. Empower every layer.**\nPerplexity runs an incredibly flat organization. There is no hierarchy of \"should I do this?\" The expectation for every person: you are in charge of this. You are going to move these metrics. You are going to drive this as aggressively as you can. No permission-seeking. No committee approvals.",

      "## The Experimentation Machine",

      "The section on experimentation was the most tactically rich part of the conversation. Perplexity runs what Rohan called \"an endless amount of experimentation\" on how they answer questions.",

      "The fundamental insight: the right answer format varies wildly by query type. If you search for a cooking recipe, you actually want a very long answer, almost a blog post. Other queries want concise, direct responses. The only way to discover these patterns is relentless A/B testing.",

      "Another surprising finding: onboarding length. Should you walk new users through the product, or just drop them in? After extensive testing, the winning approach has been to mostly just let people figure it out. Minimal hand-holding. Trust the product to be intuitive enough.",

      "\"That's something we're still tinkering with,\" Rohan admitted. But the willingness to keep tinkering, to never consider any part of the experience settled, is the point.",

      "## Hiring Underdogs",

      "When asked what qualities Perplexity looks for when hiring, Rohan's answer was surprising: underdogs.",

      "\"Who's the underdog? Who's going to take big risks? We hire a lot of founders. Have they tried to spin something up of their own and failed gloriously? That's the kind of stuff where we're like, dang, check mark, get him in here.\"",

      "They also rarely hire for defined roles. Instead, they hire for \"where the puck is going,\" deliberately ambiguous positions that expand rapidly as the company grows. They hire overqualified people for seemingly small roles, expecting those roles to balloon.",

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
    image: "/blog/death-of-roadmap.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "One of the clearest signals from the Berkeley Haas AI Conference was that traditional product planning is dead. Not dying, dead. Across three separate panels, product leaders from Adobe, YouTube, Intercom, Perplexity, and GitHub Next all said some version of the same thing: if you're building a 3-5 year roadmap in AI, you're wasting your time.",

      "## What Changed",

      "Chloe McConnell, Senior Director of PM at Adobe Express, put it most directly: \"The roadmap we thought we had in January feels almost irrelevant because things have moved so fast by November.\"",

      "This isn't the usual startup platitude about being agile. These are leaders at Adobe, YouTube, and Apple, companies that traditionally plan in multi-year cycles. The pace of change in AI has broken their planning frameworks.",

      "Consider: in the last 12 months, Box's CTO noted that 15 major frontier models were released, and each one was arguably the most impressive piece of engineering ever created. Every one of those releases potentially invalidates product assumptions, opens new capabilities, and reshuffles competitive dynamics.",

      "How do you roadmap against that?",

      "## What Replaces the Roadmap",

      "The answer across every panel was the same: frameworks and principles, not feature plans.",

      "**YouTube's Framework: Fame, Fortune, or Fun.**\nHeather Christmann shared that YouTube evaluates every creator product through three lenses: does it help creators achieve fame (reach, discovery), fortune (revenue, monetization), or fun (creative satisfaction)? If a product delivers at least one of those AND has daily utility (the Google \"toothbrush test\"), it's worth building. The specific features change constantly, but the framework is durable.",

      "**Adobe's Leapfrog Principle.**\nChloe described a planning exercise they use: \"Think about what might solve a problem today, but will this be relevant in six months? You're likely gonna leapfrog yourself four times in the next year. Can you skip the interim steps and go straight to the next one?\" Instead of building incrementally, they try to anticipate where the technology will be and build for that state directly.",

      "**Perplexity's Daily Question.**\n\"Are we staying ahead of everyone by at least a couple of months?\" That's it. Not a roadmap, a compass heading. Ship fast, measure constantly, adjust daily.",

      "## The Skills That Matter Now",

      "If you're a PM whose career was built on crafting beautiful 3-5 year roadmaps, the kind that used to earn you a senior or principal title, the game has changed. The new planning skills are:",

      "**Rapid intuition.** Can you quickly evaluate which opportunities are durable and which are hype? Michael Pratt from Apple framed it as being \"super tight and aligned on your actual core metrics\": revenue or cost savings, regardless of whether AI is involved.",

      "**Iteration speed.** Chloe from Adobe talked about the mindset shift: \"We have to be really iterative and flexible. It's faster than some of us even expected.\" The ability to plan in 2-week cycles rather than 2-year cycles is now a core PM competency.",

      "**Framework thinking.** Instead of predicting specific futures, develop durable decision-making principles. YouTube's fame/fortune/fun, Adobe's leapfrog principle, Snowflake's automate/augment/stay-human. These are the artifacts that replace the roadmap.",

      "**Kill speed.** As important as shipping fast: knowing when to kill something fast. Multiple speakers mentioned the discipline of evaluating whether a feature will still be relevant when it ships, and cutting it if the answer is no, even if it's 80% built.",

      "## What This Means in Practice",

      "I think the practical implication is that AI product teams need to operate more like newsrooms than factories. A newsroom has a permanent editorial perspective (the framework), a rapid daily cycle (ship/learn/iterate), and the ability to pivot completely when the story changes.",

      "The factory model, plan the work, work the plan, measure against the plan, was built for a world where the inputs were predictable. That world is gone.",

      "Annual strategy still has a place. Quarterly goals still make sense. But the 3-5 year roadmap with specific features mapped to specific timelines? That's a fiction now. The best AI product teams have replaced it with something more honest: durable principles, aggressive experimentation, and the humility to admit they don't know what they'll be building six months from now.",
    ],
  },
  {
    slug: "managing-agents-is-the-new-core-skill",
    title: "Managing Agents Is the Most Important Skill Nobody's Teaching",
    subtitle:
      "Box's CTO on the shift from doing work to managing AI that does work, and why it changes everything.",
    date: "2025-01-06",
    tags: ["AI Agents", "Career", "Future of Work"],
    image: "/blog/managing-agents.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "The most jarring moment at the Berkeley Haas AI Conference came from Ben Kus, CTO of Box. He described how cutting-edge programmers work today, and it sounds nothing like what most people imagine.",

      "## The New Morning Routine",

      "A programmer on the bleeding edge of AI-assisted development gets to work and kicks off 10 to 20 agents to do things for them. Then they spend the rest of the day in a completely different mode: evaluating outputs.",

      "\"This agent did it wrong, that took thirty minutes. Nope, cancel that, throw that away, revert the branch. Oh, this one's good, continue down this path.\"",

      "It's not writing code anymore. It's managing a small army of AI workers, each of which can produce code 10-100x faster than a human, but with varying quality and direction. The skill isn't coding. The skill is orchestrating.",

      "## Why This Isn't Just About Programming",

      "Ben's argument is that this pattern will expand to every role. If AI agents can already write code, draft contracts, analyze data, create presentations, and respond to customer inquiries, then every knowledge worker will eventually need to manage agents that do their job.",

      "\"I almost think of it like management skills. At some point, probably every single person will be managing AI agents. They will have to get them to do work. They'll have to figure out if they did the right thing. They'll have to be responsible for it.\"",

      "This reframes the entire conversation about AI and jobs. The question isn't \"will AI replace my job?\" It's \"can I effectively manage AI that does my job faster than someone else can manage their AI?\"",

      "## The Surprising Parallels to People Management",

      "Here's what I found most counterintuitive: managing agents is weirdly similar to managing people.",

      "Give an agent vague, lazy instructions? You get vague, lazy output. Give it detailed context, clear objectives, and sophisticated framing? You get sophisticated results. Ben noted that even using \"please\" actually changed model behavior. The models pattern-match on the sophistication of the input.",

      "\"If you give it really stupid instructions, it'll give you a stupid result, because it's like, it must be the kind of thing I know how to talk to people like you. And so if you give it really sophisticated instructions, it'll give you sophisticated outputs.\"",

      "The one big difference from people management: micromanagement works. Agents don't get frustrated. They don't quit. They don't gossip about you. You can be incredibly specific, check their work constantly, and demand revisions, and they just keep going. For people who've been told their entire career that micromanagement is toxic, this is a mental shift.",

      "## The Skill Gap Is Real",

      "Ben compared the current moment to the early days of Google: \"There was a world before Google was well known, and some people who knew Google really well, you'd get them to search stuff for you. Those people were very valuable.\"",

      "Using AI agents effectively is currently that kind of rare, weird skill. Some people are 10x more productive with agents than others, not because of intelligence, but because of practice and technique.",

      "His advice was blunt: \"If you can't get a frontier model to do something you want, you're probably not managing it properly.\" GPT, Claude, Gemini: the frontier models are genuinely capable at the graduate or PhD level across many topics. If you're getting bad results, the problem is likely your instructions, not the model.",

      "## What to Do About It",

      "The uncomfortable truth: there's no class for this yet. No MBA curriculum teaches \"agent management.\" No certification exists. The only way to get good at it is to use agents constantly, for real work, not toy examples.",

      "Some practical starting points:",

      "- **Give agents real tasks.** Not \"write me a poem\" but \"analyze this competitive landscape and identify three positioning opportunities.\"\n- **Treat bad output as a prompt problem.** Before blaming the model, ask: did I give it enough context? Did I specify the format? Did I define what \"good\" looks like?\n- **Manage multiple agents simultaneously.** The power move isn't one agent doing one thing. It's orchestrating many agents in parallel, like Ben described with programmers.\n- **Develop evaluation skills.** The bottleneck isn't generation. It's judgment. Can you quickly assess whether an agent's output is good, fixable, or needs to be scrapped?",

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
    image: "/blog/answer-engine.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "The most forward-looking insight from the Berkeley Haas AI Conference didn't come from an AI company. It came from Rachel Wolin, CPO of Webflow, talking about how websites get discovered.",

      "## The Discovery Problem Is Being Rewritten",

      "For twenty years, the playbook for getting your product in front of people has been: SEO, paid ads, social distribution. Build a website, optimize for Google, buy some ads, post on social media. Everyone knows this playbook. It works. It's also being disrupted right now.",

      "The disruption: answer engines. When someone asks ChatGPT, Perplexity, or Claude a question, those tools don't just generate an answer from their training data. They read websites, synthesize information, and present a response. Your website might be the source of the answer without the user ever visiting your site.",

      "Rachel put it plainly: \"Traditionally, websites got discovered through search. They got discovered through ads. And now answer engines are really disrupting where their customers and potential prospects are coming from.\"",

      "## What Answer Engine Optimization Looks Like",

      "Answer Engine Optimization (AEO) is exactly what it sounds like: optimizing your content so that AI answer engines cite, reference, and recommend your product when users ask relevant questions.",

      "This is different from SEO in fundamental ways:",

      "- **SEO optimizes for ranking.** AEO optimizes for being the answer.\n- **SEO is about keywords.** AEO is about being the most authoritative, well-structured source on a topic.\n- **SEO drives clicks.** AEO drives citations and recommendations, which may or may not result in a click, but build brand authority in a new distribution channel.",

      "Rachel mentioned that 10+ companies have been funded in the answer engine optimization space in just the last six months. This is moving from theory to real investment.",

      "## Why This Matters for Product Builders",

      "If you're building a product right now, whether it's a SaaS tool, a consumer app, or a portfolio site, your distribution strategy needs to account for how AI tools will surface your content.",

      "Think about it: when a recruiter asks an AI \"who are the best product managers building AI-native products?\" or a customer asks \"what's the best tool for X?\": the answer comes from somewhere. That somewhere is content on the internet that the model has been trained on or can access in real-time.",

      "The builders who understand this early will have an enormous advantage. They'll create content that's structured for AI consumption, not just human consumption. They'll think about their digital presence as training data, not just a marketing funnel.",

      "## Webflow's Strategic Bet",

      "Webflow is positioning themselves as thought leaders in this space, which makes strategic sense. They're a website platform, and the fundamental value of websites is shifting. If websites exist primarily as sources for answer engines rather than destinations for human visitors, that changes what you build and how you build it.",

      "Rachel described it as a \"leapfrog moment.\" While competitors focus on AI-generated prototyping, Webflow is investing in the enterprise features (brand design systems, security, compliance) that make websites production-ready for this new era of AI-mediated discovery.",

      "## The Practical Takeaway",

      "If you're building anything that needs to be found, a product, a personal brand, a business, start thinking about answer engine optimization now:",

      "- **Be the definitive source.** Answer engines prefer comprehensive, authoritative content. Depth beats breadth.\n- **Structure your content clearly.** Headers, bullet points, clear definitions. The same things that make content scannable for humans make it parseable for AI.\n- **Build in public.** Blog posts, case studies, project documentation. Every piece of publicly accessible content is potential training data for answer engines.\n- **Think about citations, not just clicks.** When an AI tool recommends your product by name, that's a new form of distribution that doesn't show up in your analytics dashboard.",

      "The SEO era rewarded websites that played the Google algorithm. The AEO era will reward products and people who are genuinely the best answer to a question. That's a subtle but massive shift, and it's happening now.",
    ],
  },
  {
    slug: "build-first-title-second",
    title: "Build First, Title Second",
    subtitle:
      "Why every leader at the conference said the same thing: the best career move is to ship something.",
    date: "2025-01-20",
    tags: ["Career", "Building", "Product Management"],
    image: "/blog/build-first.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "I went to the Berkeley Haas AI Conference expecting to hear about AI strategy and go-to-market motions. I got that. But the through-line across every single session, from Adobe to Perplexity, from Box to Webflow, was something simpler: build things.",

      "## The Message Was Unanimous",

      "Rachel Wolin, CPO of Webflow, said it most directly: \"If you want to get a job, you are going to have to demonstrate that you are AI native. Have a portfolio of different kinds of projects.\" She wasn't speaking only to product managers. \"I say this not as just a product manager. If you're in finance, marketing, corp dev, it doesn't matter.\"",

      "Michael Pratt, Head of Product at Apple's Platoon: \"Hack on projects, even if you're not technical. Download Cursor, toss your resume in, and build a resume website. That's an awesome first step of showing product sense and execution.\"",

      "Idan Gazit, GitHub Next: \"Nothing speaks like a prototype. As much as my official title is research, it's not research. It's prototyping. Our job is to make.\"",

      "Rohan, VP Growth at Perplexity, on what they look for in hires: \"Have they tried to spin something up of their own and failed gloriously? That's the kind of stuff where we're like, check mark, get them in here.\"",

      "Six different companies. Six different speakers. One message: ship things.",

      "## Why Building Beats Everything Else",

      "Rachel Wolin articulated why this moment is different. She calls herself \"a builder first and an executive second\" and has instituted \"builder days\" at Webflow, no meetings, just building. At a recent virtual offsite, 86 people published repos and prototypes.",

      "Her argument: we're at a point where building is so accessible that NOT building is a signal. AI tools like Cursor, Claude Code, and Lovable have made it possible for non-engineers to ship real software. Rachel mentioned building apps for her wife (personal shopping), her son (a bedtime audio memory app using OpenAI's voice API), and her brother-in-law (a case study interview prep app for his OpenAI interview).",

      "\"There's never been a better time to build personal software,\" she said. \"It was janky. You're never going to see this project. But using these tools, there's never been a better time.\"",

      "The implication for career-builders: if Webflow's CPO is spending her nights and weekends building side projects to keep her product intuition sharp, what signal does it send when you're not building anything?",

      "## The Builder Advantage Compounds",

      "What makes building so powerful as a career strategy is the compound effect:",

      "**Layer 1: You learn by doing.** Rachel on developing product intuition: \"Pick a problem. Go talk to people who have that problem. Realize the way they think about it is wrong. Show them something. Get feedback.\" With AI tools compressing the build cycle, you can get more reps faster than ever before.",

      "**Layer 2: You have proof.** A live product is infinitely more credible than a case study or a PowerPoint. Multiple speakers mentioned that they look for tangible evidence of building in hiring processes.",

      "**Layer 3: You develop taste.** Rachel: \"You will run through walls. And sometimes you shouldn't have run through that wall. But that's how you develop taste.\" Taste, the ability to know what's worth building, only comes from building enough things to learn what works and what doesn't.",

      "**Layer 4: You understand distribution.** Rachel emphasized this: \"Critical thinking skills and creativity become so much more important than ever before. And then also understanding how to get distribution: find people to discover your product.\" Building teaches you not just product, but go-to-market.",

      "## The Hybrid Superpower",

      "Idan from GitHub Next connected this to a broader career insight. He described being asked throughout his career: are you the best developer? No. The best designer? No. So what's your value?",

      "\"I can glue those functions together because I live with one foot in either side. Today with AI, it's like wearing rocket boots. Hybridity was undervalued in the past. Now it's actually a superpower.\"",

      "Building things is how you become a hybrid. You can't credibly bridge product, design, and engineering if you've never shipped software. You can't understand the trade-offs engineers make if you've never deployed something. And in the AI era, you can't claim to be AI-native if you haven't used AI tools to build.",

      "## What This Means for Me",

      "This is why I build. Not because I think I'm a great engineer. I'm not. But because the act of conceiving, designing, building, and shipping a product teaches you things that no amount of reading, discussing, or strategizing can teach. Every product in my portfolio exists because I believe that PMs who build have a fundamentally different understanding of what's possible than PMs who only manage.",

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
    image: "/blog/fame-fortune-fun.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "Most product frameworks sound smart in a meeting and useless in practice. The one that stuck with me from the Berkeley Haas AI Conference is from YouTube, and it's so simple it almost seems too obvious. Until you start applying it and realize how many product decisions it clarifies.",

      "## The Framework",

      "Heather Christmann, who leads creator-facing products at YouTube, shared that they evaluate every product decision through three lenses. Creators ultimately want one (or more) of three things:",

      "- **Fame:** reach, discovery, audience growth\n- **Fortune:** revenue, monetization, financial sustainability\n- **Fun:** creative satisfaction, enjoyment of the process",

      "If a product delivers at least one of those things AND has daily utility (what Google internally calls \"the toothbrush test,\" will you use this every day?), it's worth building.",

      "## Why It Works",

      "The power of this framework is that it cuts through feature-level debates and gets to what the user actually cares about. When you're in a design review arguing about whether to add a particular button or workflow, the question becomes: does this move the needle on fame, fortune, or fun? If you can't answer that, maybe you shouldn't build it.",

      "Heather described using this in practice: \"We're in design reviews and I'm like, I don't know about this. But I'm not the user. I'm not designing for fame, fortune, and fun in some of these.\" The framework gives you permission to step outside your own perspective and evaluate from the user's actual motivations.",

      "It also explains why features that seem great on paper sometimes fail: they might be technically impressive or aesthetically beautiful, but if they don't advance fame, fortune, or fun, creators won't care. Their time is their currency. They'll go to another platform, go back to a day job, or create somewhere else.",

      "## Broader Application",

      "Here's what makes this framework more than a YouTube-specific tool: the categories generalize. Replace \"creators\" with any user base and the structure holds:",

      "**For B2B SaaS users:**\n- Fame = status, visibility within their org, career advancement\n- Fortune = revenue impact, cost savings, measurable ROI\n- Fun = ease of use, reduced friction, satisfaction",

      "**For consumer app users:**\n- Fame = social proof, followers, recognition\n- Fortune = saving money, earning money, getting deals\n- Fun = entertainment, delight, habit satisfaction",

      "**For developer tools:**\n- Fame = community recognition, open source contributions\n- Fortune = shipping faster, billing less infrastructure\n- Fun = developer experience, elegant APIs, \"it just works\"",

      "The specific words might change, but the structure, understand the 2-3 fundamental motivations driving your users and evaluate every decision against them, is universally useful.",

      "## The Intersection Is Gold",

      "Heather's key insight: the magic happens at the intersection. A product that delivers fame AND daily utility? That's a keeper. Fortune AND fun? Even better. All three plus habitual use? You've built something durable.",

      "This is a useful filter for roadmap prioritization. Instead of ranking features by effort vs. impact (the standard 2x2), try mapping them to which motivations they serve. Features that hit multiple motivations are more durable than features that hit only one, even if the single-motivation feature has higher estimated impact.",

      "## The Anti-Feature Test",

      "The framework is also useful in reverse. When you're overwhelmed with feature requests or trend-chasing (\"we should add AI because everyone else is\"), ask: will this AI feature increase fame, fortune, or fun for our users? If the answer is \"it'll be cool and we'll get press,\" that's fame for you, not for your users.",

      "Heather made this point directly: \"One of the things we fall into as a trap is to ship more features. But actually there's a learning curve. What people might want is an improved product that solves the need they were working towards, as opposed to just churning out so much.\"",

      "Sometimes the best product decision is to make what you already have better at delivering fame, fortune, or fun, not to add something new.",

      "## Takeaway",

      "I keep coming back to this framework because it passes my test for useful product thinking: it's simple enough to remember, specific enough to apply, and general enough to use across contexts. Three words that force you to stay anchored to what users actually care about, even when the market is screaming at you to chase the next shiny thing.",
    ],
  },
  {
    slug: "why-hybrids-win",
    title: "Why Hybrids Win in the Age of AI",
    subtitle:
      "The case for being a jack of all trades, and why 'master of none' is no longer the ending.",
    date: "2025-02-03",
    tags: ["Career", "AI Products", "Product Management"],
    image: "/blog/hybrids-win.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "\"Everybody remembers the first half of the jack-of-all-trades video. Everybody know the second half? And master? No, that's right.\" Idan Gazit from GitHub Next dropped this line at the Berkeley Haas AI Conference, and it crystallized something I've been thinking about for a while.",

      "For years, the career advice was: specialize. Pick a lane. Go deep. Become the world's foremost expert in one narrow thing. That advice made sense in a world where execution was expensive and expertise was the bottleneck.",

      "That world is ending.",

      "## The Specialist Advantage Is Shrinking",

      "Here's the uncomfortable math: AI tools are getting better at deep, specialized work every month. Code generation, data analysis, design iteration, legal research, financial modeling. These were all specialist domains that required years of deep practice. Now an AI agent can do passable-to-good work in any of them.",

      "This doesn't mean specialists are irrelevant. The best specialist will always outperform the best generalist in their specific domain. But the gap is shrinking, and the cost of accessing specialist-level work is collapsing.",

      "What's NOT getting automated: the ability to see across domains. The judgment to know which specialist tool to apply to which problem. The taste to recognize when an AI's output is 90% there and what the missing 10% is. The communication skills to translate between engineering, design, business, and customers.",

      "## Rocket Boots for Generalists",

      "Idan put it perfectly: \"The ability to say I am self-capable of going from zero to one. Today with AI, it's like wearing rocket boots. Hybridity was undervalued in the past. Now it's actually a superpower.\"",

      "Before AI tools, being a hybrid was a disadvantage in hiring. You'd interview against specialists who could go deeper in their one area. Now, the hybrid who can use AI to execute at a competent level across multiple domains, and who has the judgment to orchestrate those domains into a coherent product, is more valuable than the specialist who only knows one thing really well.",

      "GitHub Next explicitly hires for this: \"I'm hiring makers of a lot of different skill sets. Every one of those people tends to be a hybrid. Somebody who, when I ask them 'what are you good at?' they're like, 'well, I'm kind of good at this, but also that.'\"",

      "## The Webflow CPO Agrees",

      "Rachel Wolin at Webflow echoed this from a completely different angle. She started her career as a software engineer, transitioned to product management at Haas, and now runs product at a company with hundreds of employees. She still writes code. She still builds side projects. She calls herself \"a builder first and an executive second.\"",

      "Her framework: \"Can I scale myself up? Can I scale myself down?\" The market rewards people who can do both, who can think strategically at the executive level AND get hands-on with the actual work. That's the hybrid advantage.",

      "At their recent offsite, 86 people at Webflow published repos and prototypes. The message wasn't \"engineers should build.\" It was \"everyone should build.\" Product managers, designers, marketers, all shipping code.",

      "## What Makes a Valuable Hybrid",

      "Based on what I heard across the conference, the most valuable hybrids share a few characteristics:",

      "**1. They can go from zero to one alone.**\nNot zero to scale, just zero to one. A working prototype. A functional MVP. Something people can touch and react to. AI tools make this dramatically easier, but you still need the instinct to know what to build.",

      "**2. They speak multiple languages.**\nNot programming languages, organizational languages. They can talk to engineers about trade-offs, to designers about user experience, to executives about business impact, and to customers about their problems. Each of those conversations requires a different vocabulary and different empathy.",

      "**3. They have taste across domains.**\nThey know when a design is almost right. They know when code architecture will cause problems later. They know when a business model has a hole in it. This cross-domain taste only comes from spending time in each domain, even if you never become the best at any one of them.",

      "**4. They learn fast.**\nThe Snowflake and Handshake panel emphasized curiosity as a durable skill. The hybrid advantage multiplied by AI tools only works if you're constantly learning new tools, new domains, new ways of working. The people who downloaded Cursor the weekend it launched have a different skill set than people who are still thinking about trying it.",

      "## The Personal Angle",

      "This resonates because it describes my own path. I'm not the best engineer, the best designer, or the best strategist. But I can build a full product, from concept to code to deployment, because I've spent time in each of those domains. Every project in my portfolio exists because I could see across the boundaries between disciplines and build something coherent.",

      "In the pre-AI era, that made me a generalist in a world that rewarded specialists. In the AI era, it makes me the kind of person these companies say they're hiring: someone who can go from zero to one, who can orchestrate across domains, and who treats building as a daily practice rather than someone else's job.",

      "The age of \"pick a lane\" is over. Pick all the lanes. AI will handle the depth. Your job is the breadth.",
    ],
  },
  {
    slug: "how-openai-learned-healthcare-in-4-months",
    title: "How OpenAI's GTM Leader Learned Healthcare in 4 Months",
    subtitle:
      "Using AI to speed-run domain expertise, and landing a major UCSF partnership in the process.",
    date: "2025-02-10",
    tags: ["AI Tools", "Career", "Go-to-Market"],
    image: "/blog/openai-healthcare.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "One of the most practical stories from the Berkeley Haas AI Conference came from Maggie, who leads go-to-market at OpenAI. She shared how she used ChatGPT's study mode to learn an entire industry from scratch in four months, and the result was one of OpenAI's biggest enterprise partnerships.",

      "## The Challenge",

      "Four months before the conference, Maggie's CRO asked her to figure out OpenAI's strategy for their healthcare and pharma vertical. The problem: she had zero experience and zero background in healthcare, \"other than I'm a patient.\"",

      "This is one of the most important things that Sam Altman and the OpenAI leadership want to tackle. Healthcare is at the core of their pursuit of AGI. No pressure.",

      "## The Speed-Run",

      "Rather than spending months in traditional learning mode, reading textbooks, attending conferences, interviewing experts. Maggie turned to ChatGPT study mode. Every single night, every weekend, every free minute.",

      "She used it to learn the industry jargon, understand what healthcare professionals care about, map out the processes of clinical trials, and build a strategic understanding of the vertical. Study mode was her on-demand tutor for an entire industry.",

      "## The Result",

      "The outcome speaks for itself: OpenAI announced a massive partnership with UCSF. Every student, doctor, clinician, admin, even bus drivers, at UCSF is getting ChatGPT access. That deal was Maggie and her team's work.",

      "\"Four months ago we had pretty much no real healthcare expertise. And we have just sprinted so hard at it.\"",

      "## Why This Matters Beyond the Story",

      "This isn't just an anecdote about one person at one company. It's a proof point for a new way of building domain expertise. The traditional model for breaking into a new industry, spend years building relationships, read everything, attend conferences, get mentored by experts, still has value. But AI tools have compressed the knowledge-acquisition phase from years to months.",

      "The implications for career navigation are huge:",

      "**Domain expertise is more accessible.** The moat around specialized knowledge is lower than ever. If Maggie can learn enough about healthcare in four months to close a deal with UCSF, the traditional requirement of \"5+ years in healthcare\" starts to feel like gatekeeping rather than a genuine qualification.",

      "**Learning speed is a competitive advantage.** The ability to rapidly build functional expertise in a new domain, using AI tools as tutors, research assistants, and sparring partners, is now one of the most valuable career skills. It's not about what you know; it's about how fast you can learn what you need to know.",

      "**AI tools are force multipliers for ambition.** Maggie didn't have the background. She had the assignment, the urgency, and the right tools. That combination produced results that would have previously required hiring a team of healthcare industry veterans.",

      "## The Broader Panel Context",

      "This story came during a panel where all three speakers, from Intercom, Perplexity, and OpenAI, were sharing their personal AI tricks. The Intercom speaker described using their own AI product (Finn) to run an 800-person conference with just three people, handling sponsorship intake, speaker qualification, and support. Perplexity's VP of Growth admitted to asking Perplexity embarrassingly basic parenting questions at 3am as a new father.",

      "The through-line: the people building AI products are also the most aggressive users of AI products in their own lives. They're not just building tools. They're constantly discovering new use cases by using AI for everything, from enterprise strategy to midnight parenting emergencies.",

      "## The Takeaway",

      "If you're thinking about breaking into a new domain, whether it's healthcare, fintech, enterprise, or anything else, the playbook has changed. You no longer need years of immersion to build credible expertise. You need intensity, the right AI tools, and the willingness to sprint.",

      "The people who will thrive in the AI era aren't the ones with the deepest existing expertise. They're the ones who can build new expertise fastest, and then have the judgment to apply it in ways that create real value.",
    ],
  },
  {
    slug: "the-hand-off-problem",
    title: "The Hand-Off Problem: Why Corporate Innovation Dies",
    subtitle:
      "GitHub Next's hard-won lessons on why prototypes die when they leave the lab, and how to prevent it.",
    date: "2025-02-17",
    tags: ["Innovation", "Product Management", "Enterprise"],
    image: "/blog/hand-off-problem.jpg",
    source: "Berkeley Haas AI Conference, November 2024",
    content: [
      "\"No word makes me sweat at night more than that word.\" Idan Gazit, who leads GitHub Next, GitHub's innovation lab inside Microsoft, was talking about the hand-off. The moment when a successful prototype leaves the lab and enters the main engineering organization for production development.",

      "In his words: \"This is where the bodies are married.\"",

      "## The Pattern That Kills Innovation",

      "Here's how it typically goes. An innovation team builds something promising. Leadership sees the demo and gets excited. \"We love it. Go, run fast, run far, go to market. Here's three engineering teams to help you.\"",

      "\"That's usually when the project dies,\" Idan said.",

      "Why? Because the engineering teams coming in to take over the project come from a different world. They come from an engineering and product environment with established processes, established ways of doing things. They're going to impose a process and a mindset that maybe doesn't make sense for a new product category that hasn't been tried before.",

      "\"And then with the best of intentions, in the process of adoption, oops, the baby died.\"",

      "## Why This Happens",

      "Idan was careful to note: nobody has bad intentions. The road to dead innovation is paved with good intentions. The problem is structural:",

      "**1. Context loss.** In the early phases of a product, only you and your small team truly understand it. You know why certain decisions were made, which assumptions are fragile, which parts are held together with duct tape that shouldn't be ripped off yet. The people inheriting the project don't have that context.",

      "**2. Process mismatch.** A prototype that's finding product-market fit needs different processes than a product that's scaling. Standard engineering practices, sprint planning, code review standards, security audits, accessibility requirements, are essential for production software. But applying them too early can kill the speed and experimentation that made the prototype successful.",

      "**3. Ownership diffusion.** When one small team owns a prototype, accountability is clear. When three engineering teams take over, nobody feels the same level of ownership. The passionate weirdness that made the thing work gets smoothed out by committee.",

      "## How GitHub Next Navigates It",

      "GitHub Next's approach is to maintain control through the critical early stages. They don't hand off a slide deck. They hand off a working thing with the team that built it.",

      "Their innovation process works in expanding circles:",

      "**1. Thursday demo day.** People show what they've built. The first signal: does this excite others in the room? If three people say \"yeah, let's do that,\" continue.",

      "**2. Extend, don't hand off.** Give the project a few more weeks. Build the next stage. Try it on other people at GitHub.",

      "**3. Expand the circle.** Try it on design partners outside GitHub. Get real-world data and feedback.",

      "**4. Build the evidence.** Only go to leadership when you can say: \"Here's a bet we should make, here's why we should make it, and here's a working prototype that proves it.\"",

      "The key principle: the people who built the prototype should shepherd it as far into production as possible. The hand-off should be gradual, not a clean break.",

      "## The Hiring Philosophy That Prevents It",

      "Idan's hiring approach is directly tied to this problem. He doesn't hire researchers who write papers. He hires makers who build things.",

      "\"At the end of the day, there's a lot of people with philosophers bearing Google Docs. And that doesn't not have value, but nothing speaks like a prototype.\"",

      "Everyone on the team is what he calls a hybrid, someone who can do product thinking, engineering, and design. \"Every soldier, a general.\" Each person is an independent operator who can credibly advance the state of the art on their own.",

      "The key quality he looks for: \"If I leave you alone for five minutes, do you make something?\" If the answer is yes, that person can shepherd a project through the hand-off because they deeply understand every layer of what they built.",

      "## The Insurance Policy Approach",

      "One more framing that stuck with me. Idan described GitHub Next's role as betting 1% of the business on insuring the other 99%. They're not trying to build the next big product. They're trying to figure out what might disrupt the existing business in 1-5 years and get ahead of it.",

      "\"Because our customers are not asking for this. They're asking for fixes to the stuff that's broken in our product today.\"",

      "This reframes corporate innovation from \"shiny new thing\" to \"existential risk mitigation.\" And the hand-off problem becomes not just a project management challenge, but a survival question: can the organization actually adopt its own innovations before a competitor does?",

      "## The Takeaway",

      "If you're building something new inside an existing organization, or if you're the person receiving a hand-off from an innovation team, the lessons are clear:",

      "- **Prototype with the people who will build it.** Or at minimum, keep the prototype team involved deeply through the production transition.\n- **Resist the urge to normalize too early.** Standard processes exist for good reasons, but applying them at the wrong stage kills more innovations than bad ideas do.\n- **Transfer context, not just code.** The most important thing to hand off isn't the repository. It's the reasoning behind every decision in it.\n- **Bet small, learn fast.** GitHub Next doesn't staff projects for six months. They give things a few weeks, evaluate, and extend or kill based on evidence.",

      "Innovation isn't hard because of a lack of ideas. It's hard because organizations struggle to adopt their own best ideas. The hand-off is where that struggle lives.",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
