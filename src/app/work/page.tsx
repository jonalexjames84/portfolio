"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeIn } from "@/lib/animations";
import { Layers, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function WorkPage() {
  const [designExpanded, setDesignExpanded] = useState(false);
  const featured = projects.filter(
    (p) => p.featured && p.category === "software"
  );
  const design = projects.filter((p) => p.category === "design");
  const other = projects.filter(
    (p) => !p.featured && p.category === "software"
  );
  const designVisible = designExpanded ? design : design.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        {/* Header */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-8 sm:p-10 dark:from-indigo-950/30 dark:via-violet-950/20 dark:to-purple-950/30">
          <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/10" />
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Work
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Products I conceived, designed, built, and shipped, from full-stack
            platforms to brand identities.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={staggerItem}
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
        >
          Featured
        </motion.h2>
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <motion.div key={project.slug} variants={staggerItem}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {design.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={staggerItem}
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
          >
            Design &amp; Branding
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="mb-6 text-sm text-zinc-500 dark:text-zinc-400"
          >
            Brand identities, websites, photography, and creative direction for
            artists and small businesses.
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designVisible.map((project, i) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i >= 3 ? (i - 3) * 0.1 : 0, ease: "easeOut" }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
          {design.length > 3 && (
            <div className="mt-4 mb-12 flex justify-center">
              <button
                onClick={() => setDesignExpanded(!designExpanded)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
              >
                {designExpanded ? "Show less" : `More (${design.length - 3})`}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${designExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          )}
        </motion.div>
      )}

      {other.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={staggerItem}
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
          >
            Other Work
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {other.map((project) => (
              <motion.div key={project.slug} variants={staggerItem}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
