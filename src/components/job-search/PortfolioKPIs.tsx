"use client";

import { useEffect, useState } from "react";

type KPIs = {
  visitors: number;
  resumeDownloads: number;
  calendlyClicks: number;
};

export function PortfolioKPIs() {
  const [kpis, setKpis] = useState<KPIs>({ visitors: 0, resumeDownloads: 0, calendlyClicks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch7DayKPIs() {
      try {
        const res = await fetch("/api/dashboard/posthog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queryType: "websitePageViews", days: 7 }),
        });
        if (res.ok) {
          const data = await res.json();
          setKpis((prev) => ({ ...prev, visitors: data.summary?.uniqueVisitors || 0 }));
        }
      } catch {
        // PostHog may not be available
      } finally {
        setLoading(false);
      }
    }
    fetch7DayKPIs();
  }, []);

  if (loading) return null;

  const items = [
    { label: "Visitors (7d)", value: kpis.visitors, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Resume DLs", value: kpis.resumeDownloads, color: "text-teal-600 dark:text-teal-400" },
    { label: "Calendly Clicks", value: kpis.calendlyClicks, color: "text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        Portfolio
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
