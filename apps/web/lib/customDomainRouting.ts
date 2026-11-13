// Pure routing rules for requests that arrive on a customer's own domain (book.example.com).
// Kept free of Node built-ins and app imports because the proxy loads it.

/** Public pages that work as-is on the custom domain (links in emails and booking flows land here). */
const SHARED_PREFIXES = new Set(["booking", "reschedule", "waitlist", "attendance", "payment", "embed"]);

/** Owner-only areas; on a custom domain they redirect to the main app. */
const APP_ONLY_PREFIXES = new Set([
  "auth",
  "login",
  "signup",
  "settings",
  "event-types",
  "bookings",
  "availability",
  "apps",
  "workflows",
  "insights",
  "routing",
  "teams",
  "getting-started",
  "billing",
  "upgrade",
]);

export type CustomDomainRoute =
  | { kind: "pass" }
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect-to-app"; pathname: string };

export function routeCustomDomainPath(pathname: string, username: string): CustomDomainRoute {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (!first) return { kind: "rewrite", pathname: `/${username}` };
  if (SHARED_PREFIXES.has(first)) return { kind: "pass" };
  if (APP_ONLY_PREFIXES.has(first)) return { kind: "redirect-to-app", pathname };
  // Someone pasted the full app path (book.example.com/username/30min): keep it working.
  if (first === username) return { kind: "pass" };
  return { kind: "rewrite", pathname: `/${username}/${segments.join("/")}` };
}

/** True for hosts the app itself is served on; everything else is treated as a possible custom domain. */
export function isAppHost(host: string, appUrls: (string | undefined)[], extraHosts: string[] = []): boolean {
  const hostname = host.toLowerCase().replace(/:\d+$/, "");
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  if (extraHosts.includes(hostname)) return true;
  return appUrls.some((url) => {
    if (!url) return false;
    try {
      return new URL(url).hostname === hostname;
    } catch {
      return false;
    }
  });
}
