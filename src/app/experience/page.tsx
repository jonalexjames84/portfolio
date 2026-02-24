"use client";

import Link from "next/link";
import { Download, Briefcase, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  career,
  metrics,
  companies,
  skillCategories,
} from "@/lib/experience";
import {
  fadeIn,
  staggerContainer,
  staggerItem,
  slideUp,
} from "@/lib/animations";

function TimelineRole({
  role,
  index,
}: {
  role: (typeof career)[0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      variants={staggerItem}
      className="relative pl-8 pb-10 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute top-3 left-[7px] bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 last:hidden" />

      {/* Timeline dot */}
      <div className="absolute top-[10px] left-0 h-[15px] w-[15px] rounded-full border-2 border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950" />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {role.company}
              </h3>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {role.title}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {role.period}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-3 shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {role.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expandable highlights */}
        {expanded && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800"
          >
            {role.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                {h}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.div>
  );
}

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Experience
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            15+ years shipping games, platforms, and products at scale
          </p>
        </div>
        <Link
          href="/resume.pdf"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
        >
          <Download size={14} />
          PDF
        </Link>
      </motion.div>

      {/* Company strip */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideUp}
        className="mb-12 flex flex-wrap gap-3"
      >
        {companies.map((company) => (
          <span
            key={company}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {company}
          </span>
        ))}
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
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
      </motion.div>

      {/* Career Timeline */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="mb-16"
      >
        <div className="mb-6 flex items-center gap-2">
          <Briefcase size={18} className="text-zinc-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Career Timeline
          </h2>
        </div>
        <div>
          {career.map((role, i) => (
            <TimelineRole key={role.company + role.period} role={role} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Skills Matrix */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="mb-16"
      >
        <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Skills & Expertise
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {skillCategories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={staggerItem}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {cat.name}
              </h3>
              <ul className="space-y-1.5">
                {cat.skills.map((skill) => (
                  <li
                    key={skill}
                    className="text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* What I'm building now */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="mb-16 rounded-xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <h2 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          What I&apos;m Building Now
        </h2>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Between roles, I&apos;ve been shipping indie products across web and
          mobile — proving that my product skills extend from strategy to
          execution. 4 products shipped, 15+ repos, full-stack TypeScript.
        </p>
        <Link
          href="/work"
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          See my work
        </Link>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900"
      >
        <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Open to opportunities
        </span>
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Interested in working together?
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          I&apos;m looking for my next Senior PM role. Let&apos;s talk about how
          my experience can help your team ship.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Let&apos;s connect
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
