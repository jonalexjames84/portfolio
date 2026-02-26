"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStyleTheme } from "./StyleThemeProvider";
import { styleThemes } from "@/lib/styleThemes";

export function StyleSwitcher() {
  const { styleTheme, setStyleTheme } = useStyleTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!mounted) return <div className="h-9 w-9" />;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Change style theme"
      >
        <Palette size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="mb-1.5 px-3 pt-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Style Theme
            </p>
            {styleThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setStyleTheme(theme.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  styleTheme === theme.id
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex -space-x-1">
                  {theme.swatches.map((color, i) => (
                    <div
                      key={i}
                      className="h-5 w-5 rounded-full border-2 border-white dark:border-zinc-900"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {theme.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {theme.description}
                  </p>
                </div>
                {styleTheme === theme.id && (
                  <Check
                    size={16}
                    className="shrink-0 text-zinc-600 dark:text-zinc-300"
                  />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
