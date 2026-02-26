"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useThemeAnimations } from "@/lib/animations";

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
  const { section } = useThemeAnimations();
  const Component = as === "div" ? motion.div : motion.section;

  return (
    <Component
      initial={section.initial}
      whileInView={section.animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...section.transition, delay }}
      className={className}
    >
      {children}
    </Component>
  );
}
