"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, fadeIn } from "@/lib/animations";

export default function WorkPage() {
  const featured = projects.filter((p) => p.featured);
  const other = projects.filter((p) => !p.featured);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Work
        </h1>
        <p className="mb-10 text-zinc-600 dark:text-zinc-400">
          Products I conceived, designed, built, and shipped — each one a case
          study in product thinking.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={staggerItem}
          className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
        >
          Featured
        </motion.h2>
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {featured.map((project) => (
            <motion.div key={project.slug} variants={staggerItem}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {other.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={staggerItem}
            className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
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
