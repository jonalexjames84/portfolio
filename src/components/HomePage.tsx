"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/ProjectCard";
import { getFeaturedProjects } from "@/lib/projects";
import { metrics, companies } from "@/lib/experience";
import {
  fadeIn,
  slideUp,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

const testimonials = [
  {
    quote:
      "Jonny didn't just build us an app — he sat down with our members and understood what our studio actually needed before writing a line of code.",
    name: "Operations Manager",
    context: "Red Ox Ceramics — Pottery Friends pilot studio",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    quote:
      "He's the rare PM who can walk into a room with engineers and designers and speak both languages fluently. That made everything move faster.",
    name: "Engineering Lead",
    context: "Genies",
    accent: "from-violet-500 to-purple-500",
  },
  {
    quote:
      "I've never seen someone take a problem from 'I don't even know where to start' to a working product this quickly. He mapped my entire referral workflow and turned it into something I use every day.",
    name: "Founder",
    context: "1406 Adventures",
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

  return (
    <div className="mx-auto max-w-5xl px-6">
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

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 flex flex-col items-start gap-10 sm:flex-row sm:items-center sm:gap-12">
          {/* Text */}
          <div className="flex-1">
            <motion.p
              variants={staggerItem}
              className="mb-4 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium tracking-wide text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
            >
              Senior Product Manager
            </motion.p>
            <motion.h1
              variants={staggerItem}
              className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
            >
              15 years shipping products.
              <br />
              <span className="gradient-text">
                Now I build them too.
              </span>
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400"
            >
              I spent 15 years shipping products at Zynga, Jam City, Bandai Namco,
              AAA, and Genies — scaling games to millions of users and helping
              secure $150M in funding. Then I went indie — built four products
              from scratch and co-founded Frame Story, a collaborative game
              studio. Turns out, the best product instincts come from knowing
              what it takes to build the thing.
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/work"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
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
      </section>

      {/* Section divider */}
      <div className="mx-auto mb-8 h-px w-2/3 bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent dark:via-indigo-700/20" />

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
        <div className="flex flex-wrap items-center justify-center gap-4">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800/50"
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 text-center transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
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
              Products I conceived, designed, and shipped — each one a case study in product thinking
            </p>
          </div>
          <Link
            href="/work"
            className="hidden text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 sm:block dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all &rarr;
          </Link>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map((project) => (
            <motion.div key={project.slug} variants={staggerItem}>
              <ProjectCard project={project} />
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
        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((t) => (
            <motion.blockquote
              key={t.name}
              variants={staggerItem}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.accent}`} />
              <div>
                <Quote size={20} className="mb-3 text-indigo-400/60 dark:text-indigo-500/40" />
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30" />
          <div className="absolute inset-0 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30" />

          <div className="relative">
            <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Open to opportunities
            </span>
            <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Looking for a PM who ships?
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              You just saw the work. I bring product strategy, technical fluency,
              and the ability to go from zero to shipped. Let&apos;s talk about what
              I can do for your team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Let&apos;s connect
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
