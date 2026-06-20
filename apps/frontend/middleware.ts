import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import PageGetSettings from "./lib/fetch/page/settings";
import ValidateToken from "./lib/fetch/tokens/validate";
import { isSetupComplete } from "./lib/fetch/setup/detectBackend";

// NOTE: `updateSessionInterval` was removed from here.
// Middleware runs in a limited execution context (often Edge) and is request-scoped.
// Long-running intervals should be handled in client-side components (e.g., a SessionProvider)
// or dedicated backend services, not in the request middleware.

// Define paths that should not be handled by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc) - difficult to match dynamically without prefix,
     *   but we can exclude common extensions.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Small in-memory cache to avoid repeatedly probing the backend on every request
// Note: In serverless/edge environments, this cache is local to the instance and may be reset frequently.
let _setupCache: { value: boolean; ts: number } | null = null;
const SETUP_CACHE_TTL = 30 * 1000; // 30 seconds

async function getSetupStatus(): Promise<boolean> {
  try {
    const now = Date.now();

    if (_setupCache && now - _setupCache.ts < SETUP_CACHE_TTL) {
      return _setupCache.value;
    }
    const complete = await isSetupComplete();

    _setupCache = { value: complete, ts: now };

    return complete;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to check setup status:", error);

    return false; // Default to false if backend is unreachable
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Setup Check
  // We check this first because if the app isn't set up, nothing else matters.
  const isSetupPage = pathname.startsWith("/setup");
  const setupComplete = await getSetupStatus();

  if (isSetupPage) {
    if (setupComplete) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!setupComplete) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  // 2. Auth & Session Check
  const sessionCookie = request.cookies.get("session");
  const userCookie = request.cookies.get("user");
  const isAuthPage = pathname.startsWith("/auth");

  // If user is on an auth page (login/signup)
  if (isAuthPage) {
    if (sessionCookie) {
      // If already logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If not logged in, allow access to auth page
    return NextResponse.next();
  }

  // For all other routes (protected), require a session
  if (!sessionCookie) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));

    // Ensure we clean up any stale user cookie if session is missing
    if (userCookie) {
      response.cookies.delete("user");
    }

    return response;
  }

  // 3. Validate Session & Fetch Settings (Parallel)
  // We only do this for protected routes to save resources
  try {
    const [validateResult, settingsResult] = await Promise.all([
      ValidateToken().catch((err) => ({ success: false, error: String(err) })),
      PageGetSettings().catch((err) => ({
        success: false,
        error: String(err),
      })),
    ]);

    // If token is invalid
    if (!validateResult || !(validateResult as any).success) {
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url),
      );

      response.cookies.delete("session");
      response.cookies.delete("user");

      return response;
    }

    // 4. Role & Maintenance Checks
    let userData: { role?: string } | null = null;

    if (userCookie) {
      try {
        userData = JSON.parse(userCookie.value);
      } catch {
        // Malformed cookie — treat as unauthenticated and redirect to login
        const response = NextResponse.redirect(new URL("/auth/login", request.url));

        response.cookies.delete("session");
        response.cookies.delete("user");

        return response;
      }
    }
    const settings = settingsResult as any;
    const isMaintenanceMode =
      settings?.success && settings.data?.settings?.maintenance;
    const isAdmin = userData?.role === "admin";
    const isEditor = userData?.role === "editor";
    const isEditorOrAdmin = isAdmin || isEditor;

    // Admin Route Protection
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Services management requires editor or admin
    if (pathname.startsWith("/services/create") && !isEditorOrAdmin) {
      return NextResponse.redirect(new URL("/services", request.url));
    }
    if (pathname.endsWith("/edit") && pathname.startsWith("/services/") && !isEditorOrAdmin) {
      return NextResponse.redirect(new URL("/services", request.url));
    }

    // Maintenance Mode
    const isMaintenancePage = pathname.startsWith("/maintenance");

    if (isMaintenanceMode && !isAdmin && !isMaintenancePage) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }

    if (!isMaintenanceMode && isMaintenancePage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 5. Final Response
    const response = NextResponse.next();

    response.headers.set("x-pathname", pathname);

    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Middleware processing error:", error);

    return NextResponse.next(); // Fallback to allowing request or handle error page
  }
}
