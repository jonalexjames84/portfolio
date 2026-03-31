import { NextRequest, NextResponse } from "next/server";

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  "/api/dashboard/posthog": { maxRequests: 30, windowMs: 60_000 },
  "/api/resume": { maxRequests: 10, windowMs: 60_000 },
};

const requestLog = new Map<string, number[]>();

const COOKIE_NAME = "job_search_auth";
const AUTH_SECRET = process.env.JOB_SEARCH_AUTH_SECRET || "jon-job-search-2026";

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

  // Job search auth gate — dashboard page and API GET endpoints
  // API POST/writes use Bearer token auth separately (for the scheduled agent)
  if (
    pathname.startsWith("/dashboard/job-search") ||
    pathname.startsWith("/job-search") ||
    (pathname.startsWith("/api/job-search") && !request.headers.get("authorization"))
  ) {
    const cookie = request.cookies.get(COOKIE_NAME);
    if (cookie?.value !== AUTH_SECRET) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Rate limiting
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
  matcher: ["/api/dashboard/posthog", "/api/resume", "/dashboard/job-search/:path*", "/api/job-search/:path*", "/job-search/:path*"],
};
