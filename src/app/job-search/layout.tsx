import { HubNav } from "@/components/job-search/HubNav";

export const metadata = {
  title: "Job Search Hub",
};

export default function JobSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Job Search Hub
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Your operating system for landing the next role
        </p>
      </div>
      <div className="mb-6">
        <HubNav />
      </div>
      {children}
    </div>
  );
}
