"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";

export function TrackPageView({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, string>;
}) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!hasFired.current) {
      posthog.capture(event, properties);
      hasFired.current = true;
    }
  }, [event, properties]);

  return null;
}
