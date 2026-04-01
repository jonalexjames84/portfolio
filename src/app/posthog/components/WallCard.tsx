"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

export function WallCard({
  number,
  title,
  description,
  quote,
  quoteSource,
}: {
  number: number;
  title: string;
  description: string;
  quote: string;
  quoteSource: string;
}) {
  return (
    <AnimatedSection as="div" delay={number * 0.1}>
      <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {number}
          </span>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <blockquote className="border-l-2 border-zinc-300 pl-3 dark:border-zinc-700">
          <p className="text-sm italic text-zinc-500 dark:text-zinc-500">
            &ldquo;{quote}&rdquo;
          </p>
          <cite className="mt-1 block text-xs text-zinc-400">
            — {quoteSource}
          </cite>
        </blockquote>
      </div>
    </AnimatedSection>
  );
}
