"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div";
}) {
  const Component = as === "div" ? motion.div : motion.section;
  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Component>
  );
}
