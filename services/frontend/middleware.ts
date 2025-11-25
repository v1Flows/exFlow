import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// eslint-disable-next-line import/order
import PageGetSettings from "./lib/fetch/page/settings";

// NOTE: `updateSessionInterval` sets a periodic server-side task when imported.
// Importing it here causes that side-effect to run in the middleware bundle.
// If you rely on periodic session refresh, consider moving it to a dedicated
// server worker or a scheduled job. Keeping the import for now to preserve
// existing behaviour.
import "./updateSessionInterval";
import ValidateToken from "./lib/fetch/tokens/validate";
import { isSetupComplete } from "./lib/fetch/setup/detectBackend";

function isPublicRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".gif") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".js")
  );
}

function isAuthRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")
  );
}

function isSetupRoute(pathname: string): boolean {
  return pathname.startsWith("/setup");
}

function createResponseWithPathname(pathname: string) {
  const response = NextResponse.next();

  response.headers.set("x-pathname", pathname);

  return response;
}

// Small in-memory cache to avoid repeatedly probing the backend on every request
let _setupCache: { value: boolean; ts: number } | null = null;
const SETUP_CACHE_TTL = 30 * 1000; // 30 seconds

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const cookies = request.cookies;
    const hasSessionCookie = cookies.has("session");
    const userCookie = cookies.get("user");
    const userData = userCookie ? JSON.parse(userCookie.value) : null;

    // Skip public/static routes
    if (isPublicRoute(pathname)) {
      return createResponseWithPathname(pathname);
    }

    // Auth routes: allow access without checking setup or token
    if (isAuthRoute(pathname)) {
      return createResponseWithPathname(pathname);
    }

    // Check if setup is complete — use cached value when fresh to avoid
    // probing multiple backend hostnames on every request (which can add
    // several seconds to middleware execution).
    let setupComplete = false;
    try {
      const now = Date.now();
      if (_setupCache && now - _setupCache.ts < SETUP_CACHE_TTL) {
        setupComplete = _setupCache.value;
      } else {
        setupComplete = await isSetupComplete();
        _setupCache = { value: setupComplete, ts: now };
      }
    } catch {
      // If we can't reach the backend, assume setup not complete
      setupComplete = false;
    }

    // Setup routes: redirect to home if setup is complete
    if (isSetupRoute(pathname)) {
      if (setupComplete) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return createResponseWithPathname(pathname);
    }

    // If setup not complete, redirect to setup (for all non-auth, non-setup routes)
    if (!setupComplete) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }

    // Validate token and fetch page settings in parallel to avoid sequential
    // waits. Both are required below, but running them at the same time
    // reduces middleware latency.
    const [validateResult, settingsResult] = await Promise.all([
      ValidateToken().catch((err) => ({ success: false, error: String(err) })),
      PageGetSettings().catch((err) => ({ success: false, error: String(err) })),
    ]);

    // Validate token result handling
    if (!validateResult || (validateResult as any).success === false) {
      cookies.delete("session");
      cookies.delete("user");

      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Admin route protection
    if (
      pathname.startsWith("/admin") &&
      (!userData || userData.role !== "admin")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Auth routes: redirect if already logged in
    if (isAuthRoute(pathname) && hasSessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Auth routes: allow access if not logged in
    if (isAuthRoute(pathname) && !hasSessionCookie) {
      return createResponseWithPathname(pathname);
    }

    // Require login for protected routes
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Page settings result (already fetched in parallel above)
    const settings = settingsResult as any;

    if (!settings || settings.success === false) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }

    // Maintenance mode check
    if (
      settings.data.settings.maintenance &&
      (!userData || userData.role !== "admin") &&
      !pathname.startsWith("/maintenance")
    ) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }

    // If on /maintenance but not in maintenance mode, redirect home
    if (
      pathname.startsWith("/maintenance") &&
      !settings.data.settings.maintenance
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Add pathname header for layout to use
    return createResponseWithPathname(pathname);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Middleware error:", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
