import Image from "next/image";

export function BrowserFrame({
  src,
  alt,
  width = 1280,
  height = 800,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-2 flex-1 rounded-md bg-zinc-200/60 px-3 py-1 text-center dark:bg-zinc-800">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {alt.toLowerCase().replace(/\s+/g, "-")}.app
          </span>
        </div>
      </div>
      {/* Screenshot */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full"
      />
    </div>
  );
}
