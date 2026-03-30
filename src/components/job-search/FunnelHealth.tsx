"use client";

type FunnelData = {
  funnel: { applied: number; screen: number; interview: number; offer: number; rejected: number };
  conversionRates: { app_to_screen: number; screen_to_interview: number; interview_to_offer: number };
};

function rateColor(rate: number, healthy: number, warning: number): string {
  if (rate >= healthy) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= warning) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function FunnelHealth({ data }: { data: FunnelData }) {
  const { funnel, conversionRates } = data;

  const stages = [
    { label: "Applied", count: funnel.applied, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    { label: "Screens", count: funnel.screen, bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
    { label: "Interviews", count: funnel.interview, bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
    { label: "Offers", count: funnel.offer, bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-400" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        Pipeline
      </h2>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {stages.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-bold ${s.text}`}>{s.count}</div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">App &rarr; Screen</span>
          <span className={`font-semibold ${rateColor(conversionRates.app_to_screen, 15, 10)}`}>
            {conversionRates.app_to_screen}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Screen &rarr; Interview</span>
          <span className={`font-semibold ${rateColor(conversionRates.screen_to_interview, 40, 25)}`}>
            {conversionRates.screen_to_interview}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Interview &rarr; Offer</span>
          <span className={`font-semibold ${rateColor(conversionRates.interview_to_offer, 25, 15)}`}>
            {conversionRates.interview_to_offer}%
          </span>
        </div>
      </div>
    </div>
  );
}
