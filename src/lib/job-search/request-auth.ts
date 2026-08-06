import type { NextRequest } from "next/server";

const COOKIE_NAME = "job_search_auth";

/**
 * Two callers reach the job-search API: the scheduled agent, which sends a
 * Bearer token, and Jon's browser, which sends the session cookie.
 *
 * The middleware gate only checks the cookie when no `authorization` header is
 * present — the header is its signal to defer to the route. That means a route
 * which doesn't verify the token itself is reachable by anyone who sends any
 * authorization header at all. Routes that read personal material must call
 * this rather than trusting the middleware alone.
 */
export function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get("authorization");

  if (header) {
    const apiKey = process.env.JOB_SEARCH_API_KEY;
    return !!apiKey && header === `Bearer ${apiKey}`;
  }

  const secret = process.env.JOB_SEARCH_AUTH_SECRET;
  return !!secret && request.cookies.get(COOKIE_NAME)?.value === secret;
}
