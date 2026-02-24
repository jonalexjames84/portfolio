"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

// TODO: Replace with real testimonials from studio owners, restaurant managers, the travel advisor, and former colleagues
const testimonials = [
  {
    quote:
      "Jonny didn't just build us an app — he sat down with our members and understood what our studio actually needed before writing a line of code.",
    name: "Studio Owner",
    context: "Pottery Friends user research participant",
  },
  {
    quote:
      "He's the rare PM who can walk into a room with engineers and designers and speak both languages fluently. That made everything move faster.",
    name: "Former Colleague",
    context: "Genies",
  },
  {
    quote:
      "I've never seen someone take a problem from 'I don't even know where to start' to a working product this quickly. He mapped my entire referral workflow and turned it into something I use every day.",
    name: "Client",
    context: "1406 Adventures",
  },
];

export function HomePage() {
  const featured = getFeaturedProjects();

  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="py-20 sm:py-28">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.p
            variants={staggerItem}
            className="mb-4 text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400"
          >
            Senior Product Manager
          </motion.p>
          <motion.h1
            variants={staggerItem}
            className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-100"
          >
            15 years shipping products.
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">
              Now I build them too.
            </span>
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400"
          >
            From FarmVille at Zynga to founding my own product ecosystems — I&apos;ve
            managed products with 1M+ DAU, launched apps reaching 6M members, and
            built 4 multi-product platforms from scratch.
          </motion.p>
          <motion.div
            variants={staggerItem}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/work"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
        </motion.div>
      </section>

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
        <div className="flex flex-wrap items-center justify-center gap-3">
          {companies.map((company) => (
            <span
              key={company}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {company}
            </span>
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
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              variants={staggerItem}
              className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
            className="hidden text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 sm:block dark:text-zinc-400 dark:hover:text-zinc-100"
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
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                &ldquo;{t.quote}&rdquo;
              </p>
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
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Open to opportunities
          </span>
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Looking for a PM who ships?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            15+ years in games, blockchain, and tech. I bring product strategy, live ops expertise,
            and the ability to actually build what I spec.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Let&apos;s connect
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
