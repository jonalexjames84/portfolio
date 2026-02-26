"use client";

import { motion } from "framer-motion";
import type { WorkflowColor } from "./workflowData";

export function WorkflowBackground({
  color,
  className = "",
}: {
  color: WorkflowColor;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          color: "rgba(120,120,120,0.15)",
        }}
      />

      {/* Color tint overlay — smooth transition on workflow switch */}
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: color.tint }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Dark mode tint */}
      <motion.div
        className="absolute inset-0 hidden dark:block"
        animate={{ backgroundColor: color.darkTint }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Grain texture overlay */}
      <div className="hero-grain absolute inset-0" />
    </div>
  );
}
