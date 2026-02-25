const palette = [
  { bg: "bg-indigo-50", text: "text-indigo-700", darkBg: "dark:bg-indigo-950/40", darkText: "dark:text-indigo-400" },
  { bg: "bg-violet-50", text: "text-violet-700", darkBg: "dark:bg-violet-950/40", darkText: "dark:text-violet-400" },
  { bg: "bg-amber-50", text: "text-amber-700", darkBg: "dark:bg-amber-950/40", darkText: "dark:text-amber-400" },
  { bg: "bg-emerald-50", text: "text-emerald-700", darkBg: "dark:bg-emerald-950/40", darkText: "dark:text-emerald-400" },
  { bg: "bg-rose-50", text: "text-rose-700", darkBg: "dark:bg-rose-950/40", darkText: "dark:text-rose-400" },
  { bg: "bg-sky-50", text: "text-sky-700", darkBg: "dark:bg-sky-950/40", darkText: "dark:text-sky-400" },
  { bg: "bg-orange-50", text: "text-orange-700", darkBg: "dark:bg-orange-950/40", darkText: "dark:text-orange-400" },
  { bg: "bg-teal-50", text: "text-teal-700", darkBg: "dark:bg-teal-950/40", darkText: "dark:text-teal-400" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", darkBg: "dark:bg-fuchsia-950/40", darkText: "dark:text-fuchsia-400" },
  { bg: "bg-cyan-50", text: "text-cyan-700", darkBg: "dark:bg-cyan-950/40", darkText: "dark:text-cyan-400" },
];

export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % palette.length;
  const c = palette[idx];
  return `${c.bg} ${c.text} ${c.darkBg} ${c.darkText}`;
}
