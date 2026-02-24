import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on product management, building, and shipping.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Blog
      </h1>
      <p className="mb-10 text-zinc-600 dark:text-zinc-400">
        Thoughts on product management, building, and shipping.
      </p>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          First post coming soon.
        </p>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Topics: product thinking, technical decisions, lessons from building
        </p>
      </div>
    </div>
  );
}
