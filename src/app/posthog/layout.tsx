import type { ReactNode } from "react";

export default function PostHogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-1 w-full bg-[#2563eb]" />
      <main className="min-h-screen bg-white dark:bg-[#0a0f12]">
        {children}
      </main>
    </>
  );
}
