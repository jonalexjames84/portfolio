import { NextRequest, NextResponse } from "next/server";

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/dashboard/posthog": { maxRequests: 30, windowMs: 60_000 },
  "/api/resume": { maxRequests: 10, windowMs: 60_000 },
};

const requestLog = new Map<string, number[]>();

// Prune expired entries every 5 minutes
let lastPrune = Date.now();
const PRUNE_INTERVAL = 5 * 60_000;

function prune(now: number) {
  if (now - lastPrune < PRUNE_INTERVAL) return;
  lastPrune = now;
  for (const [key, timestamps] of requestLog) {
    const fresh = timestamps.filter((t) => now - t < 120_000);
    if (fresh.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, fresh);
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const limit = RATE_LIMITS[pathname];
  if (!limit) return NextResponse.next();

  const now = Date.now();
  prune(now);

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const key = `${ip}:${pathname}`;

  const timestamps = requestLog.get(key) || [];
  const windowStart = now - limit.windowMs;
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= limit.maxRequests) {
    const oldestInWindow = recent[0];
    const retryAfter = Math.ceil((oldestInWindow + limit.windowMs - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  recent.push(now);
  requestLog.set(key, recent);

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/dashboard/posthog", "/api/resume"],
};
