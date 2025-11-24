import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// eslint-disable-next-line import/order
import PageGetSettings from "./lib/fetch/page/settings";

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

    // Check if setup is complete
    let setupComplete = false;
    try {
      setupComplete = await isSetupComplete();
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

    // Validate token for protected routes (only after setup is complete)
    const res = await ValidateToken();

    if (!res.success) {
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

    // Fetch settings for all non-public routes
    const settings = await PageGetSettings();

    if (!settings.success) {
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
