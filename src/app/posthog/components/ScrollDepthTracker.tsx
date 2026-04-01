"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

export function ScrollDepthTracker() {
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const thresholds = [25, 50, 75, 100];

    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const percent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const threshold of thresholds) {
        if (percent >= threshold && !firedRef.current.has(threshold)) {
          firedRef.current.add(threshold);
          posthog.capture("posthog_page_scroll_depth", {
            depth: `${threshold}%`,
            source: "posthog_page",
          });
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
