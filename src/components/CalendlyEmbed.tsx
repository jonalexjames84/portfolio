"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Script from "next/script";

export function CalendlyEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  const isValidUrl = url.startsWith("https://calendly.com/");

  useEffect(() => {
    if (!scriptReady || !isValidUrl) return;

    const container = containerRef.current;
    if (!container) return;

    const bg = resolvedTheme === "dark" ? "09090b" : "ffffff";
    const text = resolvedTheme === "dark" ? "fafafa" : "18181b";
    const primary = "6366f1";

    const embedUrl = `${url}?hide_gdpr_banner=1&background_color=${bg}&text_color=${text}&primary_color=${primary}`;

    container.innerHTML = "";

    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.dataset.url = embedUrl;
    widget.style.minWidth = "320px";
    widget.style.height = "100%";
    container.appendChild(widget);

    try {
      const cal = (
        window as unknown as {
          Calendly?: { initInlineWidgets: () => void };
        }
      ).Calendly;
      cal?.initInlineWidgets();
    } catch {
      // Calendly widget re-init failed, not critical
    }
  }, [url, resolvedTheme, scriptReady, isValidUrl]);

  if (!isValidUrl) {
    return (
      <div className="flex h-[630px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Invalid Calendly URL
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[630px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-600 underline hover:text-accent-500 dark:text-accent-400"
        >
          Book a time on Calendly
        </a>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
        onError={() => setError(true)}
      />
      <div ref={containerRef} className="h-[630px]" />
    </>
  );
}
