"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export function CalendlyEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const container = containerRef.current;
      if (!container) return;

      const bg = resolvedTheme === "dark" ? "09090b" : "ffffff";
      const text = resolvedTheme === "dark" ? "fafafa" : "18181b";
      const primary = "6366f1";

      const embedUrl = `${url}?hide_gdpr_banner=1&background_color=${bg}&text_color=${text}&primary_color=${primary}`;

      // Clear previous embed on theme change
      container.innerHTML = "";

      const widget = document.createElement("div");
      widget.className = "calendly-inline-widget";
      widget.dataset.url = embedUrl;
      widget.style.minWidth = "320px";
      widget.style.height = "100%";
      container.appendChild(widget);

      // Load or re-init Calendly widget script
      const existing = document.querySelector(
        'script[src="https://assets.calendly.com/assets/external/widget.js"]'
      );
      if (existing) {
        try {
          const cal = (window as unknown as { Calendly?: { initInlineWidgets: () => void } }).Calendly;
          cal?.initInlineWidgets();
        } catch {
          // Calendly widget re-init failed — not critical
        }
      } else {
        const script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        script.onerror = () => setError(true);
        document.head.appendChild(script);
      }
    } catch {
      setError(true);
    }
  }, [url, resolvedTheme]);

  if (error) {
    return (
      <div className="flex h-[630px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
        >
          Book a time on Calendly
        </a>
      </div>
    );
  }

  return <div ref={containerRef} className="h-[630px]" />;
}
