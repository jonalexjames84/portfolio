import Link from "next/link";

export function PostHogHeader() {
  return (
    <header className="mb-12 flex items-center justify-between">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Jon Martin — Product Analysis
      </span>
      <Link
        href="https://portfolio.jonnymartin.blog"
        className="text-sm text-zinc-400 transition-colors hover:text-[#2563eb] dark:text-zinc-500 dark:hover:text-[#2563eb]"
      >
        portfolio.jonnymartin.blog
      </Link>
    </header>
  );
}
