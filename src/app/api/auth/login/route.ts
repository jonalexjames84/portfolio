import { NextRequest, NextResponse } from "next/server";

const ALLOWED_EMAIL = "jonalexjames@gmail.com";
const AUTH_SECRET = process.env.JOB_SEARCH_AUTH_SECRET || "jon-job-search-2026";
const COOKIE_NAME = "job_search_auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const email = request.nextUrl.searchParams.get("email");
  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/dashboard/job-search";

  if (email !== ALLOWED_EMAIL || token !== AUTH_SECRET) {
    // A wrong token from the sign-in form should land back on the form, not on
    // raw JSON. Direct API callers still get a 401 body via the same path.
    const back = new URL("/login", request.url);
    back.searchParams.set("error", "1");
    if (redirectTo) back.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(back, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(COOKIE_NAME, AUTH_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
