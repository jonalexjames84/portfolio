"use client";

import Link from "next/link";
import Image from "next/image";
import { Download, Briefcase, ChevronDown, ChevronUp, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  career,
  metrics,
  companies,
  skillCategories,
} from "@/lib/experience";
import { getTagColor } from "@/lib/tagColors";
import {
  fadeIn,
  staggerContainer,
  staggerItem,
  slideUp,
} from "@/lib/animations";

const timelineColors = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-cyan-500",
  "from-fuchsia-500 to-purple-500",
  "from-teal-500 to-emerald-500",
  "from-orange-500 to-amber-500",
  "from-blue-500 to-indigo-500",
  "from-pink-500 to-rose-500",
];

const metricColors = [
  "from-indigo-500 to-violet-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-cyan-500",
];

const skillGradients = [
  "from-indigo-500 to-violet-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
];

// Key roles to expand by default — the 5 that carry the most weight
const keyRoleCompanies = new Set(["Frame Story", "Indie Builder", "Genies", "AAA", "Jam City", "Zynga"]);

function TimelineRole({
  role,
  index,
}: {
  role: (typeof career)[0];
  index: number;
}) {
  const isKeyRole = keyRoleCompanies.has(role.company);
  const [expanded, setExpanded] = useState(isKeyRole);
  const color = timelineColors[index % timelineColors.length];

  return (
    <motion.div
      variants={staggerItem}
      className="relative pl-8 pb-10 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute top-3 left-[7px] bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 last:hidden" />

      {/* Timeline dot - now gradient */}
      <div className={`absolute top-[10px] left-0 h-[15px] w-[15px] rounded-full bg-gradient-to-br ${color} shadow-md`} />

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

        {/* Tags - now colorful */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {role.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${getTagColor(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Expandable context + highlights */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800"
          >
            {role.context && (
              <p className="mb-3 text-sm italic text-zinc-500 dark:text-zinc-400">
                {role.context}
              </p>
            )}
            <ul className="space-y-2">
              {role.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                >
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br ${color}`} />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
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
        className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-8 sm:p-10 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Experience
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Every role taught me something the previous one couldn&apos;t — from
              contributor to owner, from games to enterprise, from employee to
              founder.
            </p>
          </div>
          <a
            href="/api/resume"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Download size={14} />
            PDF
          </a>
        </div>
      </motion.div>

      {/* Company strip with logos */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideUp}
        className="mb-12 flex flex-wrap gap-3"
      >
        {companies.map((company) => (
          <div
            key={company.name}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800/50"
          >
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={20}
              height={20}
              className={`h-5 w-5 object-contain ${
                company.invertInLight ? "invert dark:invert-0" : ""
              } ${company.invertInDark ? "dark:invert" : ""}`}
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {company.name}
            </span>
          </div>
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
          <Briefcase size={18} className="text-indigo-500" />
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

      {/* Career Milestones */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="mb-16"
      >
        <h2 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Key Milestones
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { year: "2009", event: "Joined Zynga during FarmVille era", gradient: "from-indigo-500 to-violet-500" },
            { year: "2013", event: "First PM role — scaled to $50M revenue", gradient: "from-violet-500 to-purple-500" },
            { year: "2016", event: "PAC-MAN franchise — 10M+ weekly installs", gradient: "from-amber-500 to-orange-500" },
            { year: "2018", event: "Beyond games — AAA app to 6M members", gradient: "from-sky-500 to-cyan-500" },
            { year: "2021", event: "First PM at Genies — helped close $150M", gradient: "from-rose-500 to-pink-500" },
            { year: "2025", event: "Built 4 products from scratch as founder", gradient: "from-emerald-500 to-teal-500" },
          ].map((milestone) => (
            <motion.div
              key={milestone.year}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${milestone.gradient}`} />
              <div className="pl-3">
                <p className={`text-lg font-bold bg-gradient-to-r ${milestone.gradient} bg-clip-text text-transparent`}>
                  {milestone.year}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {milestone.event}
                </p>
              </div>
            </motion.div>
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
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              variants={staggerItem}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${skillGradients[i % skillGradients.length]}`} />
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {cat.name}
              </h3>
              <ul className="space-y-1.5">
                {cat.skills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${skillGradients[i % skillGradients.length]}`} />
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
        className="relative mb-16 overflow-hidden rounded-xl p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/15 dark:to-cyan-950/20" />
        <div className="absolute inset-0 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              What I&apos;m Building Now
            </h2>
          </div>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">
            When my role ended in November 2024, I saw an opportunity to go
            all-in on building. Over three months I shipped four complete product
            ecosystems from scratch — turning fifteen years of product instincts
            into real, running software. 15+ repos, 59 database migrations,
            full-stack TypeScript.
          </p>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            See my work
          </Link>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="relative overflow-hidden rounded-xl p-8 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30" />
        <div className="absolute inset-0 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30" />
        <div className="relative">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Seeking Senior PM at a high-growth startup
          </span>
          <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Interested in working together?
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            I&apos;m targeting Senior PM roles at seed-to-Series B startups
            in SaaS, dev tools, AI/ML, or consumer platforms. Let&apos;s talk
            about how my experience can help your team ship.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Let&apos;s connect
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
