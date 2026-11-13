import process from "node:process";
import { getCspHeader, getCspNonce } from "@lib/csp";
import { isAppHost, routeCustomDomainPath } from "@lib/customDomainRouting";
import { get } from "@vercel/edge-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const safeGet = async <T = any>(key: string): Promise<T | undefined> => {
  try {
    return get<T>(key);
  } catch (error) {
    // Don't crash if EDGE_CONFIG env var is missing
  }
};

// Vercel/Edge rejects non‑ASCII header values (see: https://github.com/vercel/next.js/issues/85631)
const isAscii = (s: string) => {
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) > 0x7f) return false;
  return true;
};
const stripNonAscii = (s: string) => {
  let out = "";
  for (let i = 0; i < s.length; i++) if (s.charCodeAt(i) <= 0x7f) out += s[i];
  return out;
};
const sanitizeRequestHeaders = (headers: Iterable<[string, string]>): Headers => {
  const out = new Headers();
  for (const [name, raw] of Array.from(headers)) {
    if (!isAscii(name)) continue;
    let value = raw;
    if (!isAscii(value)) {
      // Heuristic: if the string contains common mojibake markers (Ã: 0xC3, Â: 0xC2),
      // prefer a simple strip (avoids introducing spurious ASCII letters like 'A').
      let hasMojibakeMarker = false;
      for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        if (code === 0xc3 || code === 0xc2) {
          hasMojibakeMarker = true;
          break;
        }
      }

      if (hasMojibakeMarker) {
        value = stripNonAscii(value);
      } else {
        try {
          value = stripNonAscii(value.normalize("NFKD"));
        } catch {
          value = stripNonAscii(value);
        }
      }
    }
    if (value) out.set(name, value);
  }
  return out;
};

const isPagePathRequest = (url: URL) => {
  const isNonPagePathPrefix = /^\/(?:_next|api)\//;
  const isFile = /\..*$/;
  const { pathname } = url;
  return !isNonPagePathPrefix.test(pathname) && !isFile.test(pathname);
};

const shouldEnforceCsp = (url: URL) => {
  return url.pathname.startsWith("/auth/login") || url.pathname.startsWith("/login");
};

// The paths this proxy handled before custom domains existed; on the app's own host nothing else changes.
const APP_HOST_PATHS = [
  /^\/auth\/login/,
  /^\/login/,
  /^\/apps\/installed/,
  /^\/auth\/logout/,
  /\/embed$/,
  /^\/availability$/,
  /^\/api\/auth\/signup/,
];

type Resolution = { kind: "active" | "inactive"; username: string } | { kind: "unknown" };
const resolutionCache = new Map<string, { value: Resolution; expires: number }>();
const RESOLUTION_TTL_MS = 60_000;

async function resolveCustomDomain(host: string): Promise<Resolution> {
  const cached = resolutionCache.get(host);
  if (cached && cached.expires > Date.now()) return cached.value;
  let value: Resolution = { kind: "unknown" };
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/custom-domains/resolve?host=${encodeURIComponent(host)}`
    );
    if (res.ok) value = (await res.json()) as Resolution;
  } catch {
    // Treat lookup failures as unknown but don't cache them, so a blip doesn't take a domain down for a minute.
    return value;
  }
  resolutionCache.set(host, { value, expires: Date.now() + RESOLUTION_TTL_MS });
  return value;
}

async function handleCustomDomain(req: NextRequest, host: string): Promise<NextResponse | null> {
  const url = req.nextUrl;
  const resolution = await resolveCustomDomain(host);
  const appUrl = process.env.NEXT_PUBLIC_WEBAPP_URL;
  if (resolution.kind === "unknown") {
    return new NextResponse("This domain isn't connected to a booking page.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  const route = routeCustomDomainPath(url.pathname, resolution.username);
  if (resolution.kind === "inactive") {
    // The owner's plan lapsed: keep their bookers working on the main app URL.
    const target = route.kind === "rewrite" ? route.pathname : url.pathname;
    return NextResponse.redirect(new URL(`${target}${url.search}`, appUrl), 307);
  }
  if (route.kind === "redirect-to-app") {
    return NextResponse.redirect(new URL(`${route.pathname}${url.search}`, appUrl), 307);
  }
  if (route.kind === "rewrite") {
    const rewritten = url.clone();
    rewritten.pathname = route.pathname;
    return NextResponse.rewrite(rewritten);
  }
  return null;
}

const proxy = async (req: NextRequest): Promise<NextResponse<unknown>> => {
  const url = req.nextUrl;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const extraAppHosts = (process.env.APP_EXTRA_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  const onAppHost =
    !host ||
    isAppHost(host, [process.env.NEXT_PUBLIC_WEBAPP_URL, process.env.NEXT_PUBLIC_WEBSITE_URL], extraAppHosts);
  if (!onAppHost) {
    const customResponse = await handleCustomDomain(req, host.toLowerCase().replace(/:\d+$/, ""));
    if (customResponse) return customResponse;
  }
  if (onAppHost && !APP_HOST_PATHS.some((pattern) => pattern.test(url.pathname))) {
    return NextResponse.next();
  }
  const reqWithEnrichedHeaders = enrichRequestWithHeaders({ req });
  const requestHeaders = new Headers(reqWithEnrichedHeaders.headers);

  if (url.pathname.startsWith("/api/auth/signup")) {
    const isSignupDisabled = await safeGet<boolean>("isSignupDisabled");
    // If is in maintenance mode, point the url pathname to the maintenance page
    if (isSignupDisabled) {
      // TODO: Consider using responseWithHeaders here
      return NextResponse.json({ error: "Signup is disabled" }, { status: 503 });
    }
  }

  if (url.pathname.startsWith("/apps/installed")) {
    const returnTo = reqWithEnrichedHeaders.cookies.get("return-to");

    if (returnTo?.value) {
      const response = NextResponse.redirect(new URL(returnTo.value, reqWithEnrichedHeaders.url), {
        headers: requestHeaders,
      });
      response.cookies.delete("return-to");
      return response;
    }
  }

  const res = NextResponse.next({
    request: {
      headers: sanitizeRequestHeaders(requestHeaders),
    },
  });

  if (url.pathname.startsWith("/auth/logout")) {
    res.cookies.delete("next-auth.session-token");
  }

  return responseWithHeaders({ url, res, req: reqWithEnrichedHeaders });
};

const embeds = {
  addResponseHeaders: ({ url, res }: { url: URL; res: NextResponse }) => {
    if (!url.pathname.endsWith("/embed")) {
      return res;
    }
    const isCOEPEnabled = url.searchParams.get("flag.coep") === "true";
    if (isCOEPEnabled) {
      res.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    }

    const embedColorScheme = url.searchParams.get("ui.color-scheme");
    if (embedColorScheme) {
      res.headers.set("x-embedColorScheme", embedColorScheme);
    }

    res.headers.set("x-isEmbed", "true");
    return res;
  },
};

const contentSecurityPolicy = {
  addResponseHeaders: ({ res, req }: { res: NextResponse; req: NextRequest }) => {
    const nonce = req.headers.get("x-csp-nonce");
    if (!nonce) {
      res.headers.set("x-csp-status", "not-opted-in");
      return res;
    }
    const cspHeader = getCspHeader({ shouldEnforceCsp: shouldEnforceCsp(req.nextUrl), nonce });
    if (cspHeader) {
      res.headers.set(cspHeader.name, cspHeader.value);
    }
    return res;
  },
  addRequestHeaders: ({ req }: { req: NextRequest }) => {
    if (!process.env.CSP_POLICY) {
      return req;
    }
    const isCspApplicable = isPagePathRequest(req.nextUrl);
    if (!isCspApplicable) {
      return req;
    }
    const nonce = getCspNonce();
    req.headers.set("x-csp-nonce", nonce);
    return req;
  },
};

function responseWithHeaders({ url, res, req }: { url: URL; res: NextResponse; req: NextRequest }) {
  const resWithCSP = contentSecurityPolicy.addResponseHeaders({ res, req });
  const resWithEmbeds = embeds.addResponseHeaders({ url, res: resWithCSP });
  return resWithEmbeds;
}

function enrichRequestWithHeaders({ req }: { req: NextRequest }) {
  const reqWithCSP = contentSecurityPolicy.addRequestHeaders({ req });
  return reqWithCSP;
}

export const config = {
  // Page paths are matched broadly so custom domains can be routed; app-host requests outside the
  // original list (APP_HOST_PATHS) return immediately.
  matcher: [
    "/auth/login",
    "/login",
    "/apps/installed",
    "/auth/logout",
    "/:path*/embed",
    "/availability",
    "/api/auth/signup",
    "/((?!_next/|api/|.*\\..*).*)",
  ],
};

export default proxy;
