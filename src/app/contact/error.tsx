"use client";

import Link from "next/link";

export default function ContactError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h1>
      <p className="mb-6 text-zinc-600 dark:text-zinc-400">
        The contact page ran into an issue. You can try again or reach out
        directly.
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-violet-500"
        >
          Try again
        </button>
        <Link
          href="mailto:hello@jonnymartin.blog"
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
        >
          Email me directly
        </Link>
      </div>
    </div>
  );
}
