"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <motion.section
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="mb-3 font-[family-name:var(--heading-font)] text-4xl leading-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">
        PostHog Onboarding for Solo Builders
      </h1>
      <p className="mb-4 text-xl text-zinc-500 dark:text-zinc-400">
        The Missing Activation Path
      </p>
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        April 2026 — Jon Martin
      </p>
    </motion.section>
  );
}
