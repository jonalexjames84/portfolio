/**
 * Sign-in for the job-search surfaces.
 *
 * Lives at `/login`, deliberately outside the middleware matcher — a login page
 * behind the auth gate redirects to itself forever.
 *
 * The form is a plain GET to the existing `/api/auth/login` route, so this
 * needs no client JS: the browser builds the same URL the token link uses, and
 * the route sets the cookie and bounces to `redirect`.
 */

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const ALLOWED_EMAIL = "jonalexjames@gmail.com";

/** Only allow same-site paths back, so `?redirect=` can't bounce off-site. */
function safeRedirect(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard/job-search";
  }
  return raw;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirect(params.redirect);
  const failed = params.error === "1";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          The job-search dashboard is private.
        </p>

        {failed && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-700 dark:text-red-400"
          >
            That token didn&apos;t match. Try again.
          </p>
        )}

        <form action="/api/auth/login" method="GET" className="mt-6 space-y-3">
          <input type="hidden" name="email" value={ALLOWED_EMAIL} />
          <input type="hidden" name="redirect" value={redirectTo} />

          <label
            htmlFor="token"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Access token
          </label>
          <input
            id="token"
            name="token"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-500 dark:focus:border-zinc-500"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:opacity-90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-[11px] text-zinc-400">
          Sets a 30-day cookie. Signing in on a shared machine leaves it there —
          use <code className="text-[10px]">/api/auth/logout</code> to clear it.
        </p>
      </div>
    </div>
  );
}
