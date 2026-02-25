import Image from "next/image";

export function PhoneFrame({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="mx-auto w-[260px]">
      <div className="overflow-hidden rounded-[2.5rem] border-[6px] border-zinc-800 bg-zinc-900 shadow-xl dark:border-zinc-700">
        {/* Dynamic Island */}
        <div className="relative bg-zinc-900 px-4 pt-2 pb-0">
          <div className="mx-auto h-[22px] w-[90px] rounded-full bg-zinc-800" />
        </div>
        {/* Screen */}
        <Image
          src={src}
          alt={alt}
          width={390}
          height={844}
          className="w-full"
        />
        {/* Home indicator */}
        <div className="bg-zinc-900 px-4 pt-1 pb-2">
          <div className="mx-auto h-[4px] w-[100px] rounded-full bg-zinc-600" />
        </div>
      </div>
    </div>
  );
}
