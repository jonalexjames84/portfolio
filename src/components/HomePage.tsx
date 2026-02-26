"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Quote, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";
import { metrics, companies } from "@/lib/experience";
import { posts } from "@/lib/posts";
import { getTagColor } from "@/lib/tagColors";
import { useThemeAnimations } from "@/lib/animations";

const testimonials = [
  {
    quote:
      "I had the pleasure of working with Jon at Treasure, where they excelled as a Product Manager in the blockchain industry. Their deep understanding of the field enabled them to deliver outstanding results consistently, completing projects on time and within budget. Jon is also a natural team builder, fostering an inclusive environment that empowers everyone to contribute.",
    name: "Matt Farrokhzad",
    context: "Multi-Cloud DevSecOps Leader, worked with Jon at Treasure",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    quote:
      "Jon has great vision and understands what is required when building digital platforms and products. While working with him as a Technical Lead, I received a crash course in the crucial role analytics play in product design and watched him make data-driven decisions to expand the reach and market-share of our application. I highly recommend him as a product manager.",
    name: "Tim Jones",
    context: "Sr. Solutions Architect at Amazon Web Services (AWS)",
    accent: "from-violet-500 to-purple-500",
  },
  {
    quote:
      "I worked very closely with Jon on a major strategic project and he continuously proved himself as a disciplined, strategic, and creative thinker. He knows how to get things done quickly, effectively and rally a team to feel great about their accomplishments. Would highly recommend Jon in any capacity.",
    name: "Meg Vrabel",
    context: "Operations Executive & COO, Jon's mentor",
    accent: "from-purple-500 to-pink-500",
  },
];

const metricColors = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-cyan-500",
];

export function HomePage() {
  const featured = getFeaturedProjects();
  const { fadeIn, slideUp, staggerContainer, staggerItem } = useThemeAnimations();

  return (
    <>
      {/* Hero */}
      <section className="hero-grain relative py-24 sm:py-32">
        {/* Mesh gradient background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center dark:hidden"
          style={{ backgroundImage: "url('/hero-mesh-light.svg')" }}
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 hidden bg-cover bg-center dark:block"
          style={{ backgroundImage: "url('/hero-mesh-dark.svg')" }}
        />

        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12">
            {/* Text */}
            <div className="flex-1">
              {/* Photo, mobile only */}
              <motion.div variants={staggerItem} className="mb-6 sm:hidden">
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-200 shadow-lg dark:border-zinc-700">
                  <Image
                    src="/jonny-headshot.jpg"
                    alt="Jonny Martin"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
              <motion.p
                variants={staggerItem}
                className="mb-4 inline-block rounded-full bg-accent-50 px-4 py-1.5 text-sm font-medium tracking-wide text-accent-700 dark:bg-accent-950/40 dark:text-accent-400"
              >
                Senior Product Manager
              </motion.p>
              <motion.h1
                variants={staggerItem}
                className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
              >
                $50M in revenue. 6M users.
                <br />
                <span className="gradient-text">
                  Products I actually shipped.
                </span>
              </motion.h1>
              <motion.p
                variants={staggerItem}
                className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400"
              >
                15 years shipping at Zynga, Jam City, Bandai Namco, AAA, and
                Genies. $50M in revenue, $150M in funding, 6M users. I also
                ship code, and four solo-built products and a co-founded game
                studio prove it.
              </motion.p>
              <motion.div
                variants={staggerItem}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/work"
                  className="inline-flex items-center justify-center gap-2 rounded-lg gradient-btn px-5 py-2.5 text-sm font-medium"
                >
                  See my work
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                >
                  Get in touch
                </Link>
              </motion.div>
            </div>

            {/* Photo */}
            <motion.div
              variants={staggerItem}
              className="hidden shrink-0 sm:block"
            >
              <div className="relative h-56 w-56 overflow-hidden rounded-2xl border-2 border-zinc-200 shadow-lg dark:border-zinc-700">
                <Image
                  src="/jonny-headshot.jpg"
                  alt="Jonny Martin"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    <div className="mx-auto max-w-5xl px-6">
      {/* Section divider */}
      <div className="mx-auto mb-8 h-px w-2/3 gradient-divider" />

      {/* Company Logos */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
        className="pb-16"
      >
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Where I&apos;ve shipped
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {companies.map((company) => (
            <div
              key={company.name}
              className="theme-card flex items-center gap-2 px-3 py-2 sm:gap-2.5 sm:px-4 sm:py-2.5"
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={24}
                height={24}
                className={`h-6 w-6 object-contain ${
                  company.invertInLight ? "invert dark:invert-0" : ""
                } ${company.invertInDark ? "dark:invert" : ""}`}
              />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Key Metrics */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="pb-20"
      >
        <div className="theme-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={staggerItem}
              className="theme-card group relative overflow-hidden p-4 text-center"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metricColors[i % metricColors.length]} opacity-0 transition-opacity group-hover:opacity-5 dark:group-hover:opacity-10`} />
              <p className={`relative text-2xl font-bold bg-gradient-to-br ${metricColors[i % metricColors.length]} bg-clip-text text-transparent`}>
                {metric.value}
              </p>
              <p className="relative mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Work */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="pb-20"
      >
        <motion.div variants={staggerItem} className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Featured Work
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Products I designed, built, and shipped
            </p>
          </div>
          <Link
            href="/work"
            className="hidden text-sm font-medium text-accent-600 transition-colors hover:text-accent-500 sm:block dark:text-accent-400 dark:hover:text-accent-300"
          >
            View all &rarr;
          </Link>
        </motion.div>
        <div className="theme-grid grid sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <motion.div key={project.slug} variants={staggerItem}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Vibe Stack Callout */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="pb-20"
      >
        <Link href="/vibe-stack" className="group block">
          <div className="relative overflow-hidden rounded-xl gradient-section p-8 transition-shadow">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: text */}
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <Zap size={20} className="text-white/70" />
                  <span className="text-sm font-medium uppercase tracking-widest text-white/70">
                    Workflow
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
                  How I Build with AI
                </h2>
                <p className="mb-4 max-w-md text-sm leading-relaxed text-white/70">
                  A look at my AI-augmented workflow — from solo prototyping to
                  client consulting — and the tools that make it possible.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-white transition-transform group-hover:translate-x-1">
                  Explore the stack
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>

              {/* Right: workflow pills */}
              <div className="flex flex-col gap-2 sm:min-w-[220px]">
                {[
                  { label: "Client Consulting", border: "border-l-white/40" },
                  { label: "Solo Prototyping", border: "border-l-amber-400" },
                  { label: "Internal Buy-in", border: "border-l-emerald-400" },
                ].map((pill) => (
                  <div
                    key={pill.label}
                    className={`rounded-lg border-l-4 ${pill.border} bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm`}
                  >
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </motion.section>

      {/* Latest Writing */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="pb-20"
      >
        <motion.div variants={staggerItem} className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Latest Writing
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Thoughts on product, building, and career
            </p>
          </div>
          <Link
            href="/blog"
            className="hidden text-sm font-medium text-accent-600 transition-colors hover:text-accent-500 sm:block dark:text-accent-400 dark:hover:text-accent-300"
          >
            View all &rarr;
          </Link>
        </motion.div>
        <div className="theme-grid grid sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <motion.div key={post.slug} variants={staggerItem}>
              <Link
                href={`/blog/${post.slug}`}
                className="theme-card group relative flex flex-col overflow-hidden transition-all"
              >
                {/* Image or gradient bar */}
                {post.image ? (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full gradient-bar" />
                )}

                <div className="flex flex-1 flex-col p-5">
                  {/* Tags */}
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title + subtitle */}
                  <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {post.title}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {post.subtitle}
                  </p>

                  {/* Date + arrow */}
                  <div className="mt-auto flex items-center justify-between">
                    <time className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <ArrowUpRight
                      size={14}
                      className="text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-500 dark:text-zinc-500"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="pb-20"
      >
        <motion.h2
          variants={staggerItem}
          className="mb-8 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          What People Say
        </motion.h2>
        <div className="theme-grid grid sm:grid-cols-3">
          {testimonials.map((t) => (
            <motion.blockquote
              key={t.name}
              variants={staggerItem}
              className="theme-card group relative flex flex-col justify-between overflow-hidden p-6 transition-all"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.accent}`} />
              <div>
                <Quote size={20} className="mb-3 text-accent-400/60 dark:text-accent-500/40" />
                <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t.quote}
                </p>
              </div>
              <footer>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t.context}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="pb-20"
      >
        <div className="relative overflow-hidden rounded-xl p-8 text-center">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-bg-subtle rounded-xl" />
          <div className="absolute inset-0 rounded-xl border border-accent-200/50 dark:border-accent-800/30" />

          <div className="relative">
            <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Seeking Senior PM at a high-growth startup
            </span>
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Looking for a PM who ships?
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              I&apos;m targeting Senior PM roles at seed-to-Series B startups
              in SaaS, dev tools, AI/ML, or consumer platforms. Teams that
              ship weekly and value technical depth. Let&apos;s talk about what
              I can do for yours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg gradient-btn px-5 py-2.5 text-sm font-medium"
            >
              Let&apos;s connect
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
    </>
  );
}
