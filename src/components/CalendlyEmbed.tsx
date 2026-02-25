"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function CalendlyEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
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
      // Script already loaded — re-init
      (window as unknown as Record<string, unknown>).Calendly &&
        ((window as unknown as { Calendly: { initInlineWidgets: () => void } }).Calendly.initInlineWidgets());
    } else {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, [url, resolvedTheme]);

  return <div ref={containerRef} className="h-[630px]" />;
}
