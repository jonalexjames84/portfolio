"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  { label: "SDK Installed", width: 100 },
  { label: "Events Designed", width: 70 },
  { label: "Dashboards Built", width: 40 },
  { label: "Full Platform Adopted", width: 20 },
];

const walls = [
  "Most solo builders stall here",
  "Without defaults, many give up",
  "Features stay undiscovered",
];

export function ActivationFunnel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="mb-8">
      <div className="overflow-x-auto pb-4">
        <div className="flex items-end gap-1 min-w-[500px]">
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex items-end gap-1">
              <div className="flex flex-col items-center">
                <motion.div
                  className="rounded-t-lg bg-[#2563eb]"
                  style={{ width: `${stage.width * 1.2}px` }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? { height: stage.width * 1.5, opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                />
                <p className="mt-2 max-w-[120px] text-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {stage.label}
                </p>
              </div>
              {i < stages.length - 1 && (
                <motion.div
                  className="mb-8 flex flex-col items-center px-2"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.4 }}
                >
                  <div className="h-px w-8 bg-red-400" />
                  <p className="mt-1 max-w-[100px] text-center text-[10px] font-medium text-red-500">
                    {walls[i]}
                  </p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
