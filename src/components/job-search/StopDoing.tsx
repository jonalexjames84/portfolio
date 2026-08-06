import type { StopItem } from "@/lib/job-search/strategy";

/**
 * What to stop doing.
 *
 * The half a volume dashboard cannot express: every metric on it goes up and
 * to the right, so it has no way to say "the answer is not more." Most of the
 * wasted effort in this search hides in things that feel productive — saving
 * another role, opening another application, running the ingest again.
 *
 * Renders nothing when there is nothing to stop. An empty state here would be
 * a nag with no content.
 */
export function StopDoing({ items }: { items: StopItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        Stop doing
      </div>

      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              aria-hidden
              className="mt-2 h-px w-3 shrink-0 bg-zinc-300 dark:bg-zinc-600"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.text}
              </div>
              <div className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                {item.because}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
