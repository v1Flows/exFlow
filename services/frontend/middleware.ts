import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// eslint-disable-next-line import/order
import PageGetSettings from "./lib/fetch/page/settings";

import "./updateSessionInterval";
import ValidateToken from "./lib/fetch/tokens/validate";

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

    // Setup routes: Check backend status to determine if setup is needed
    if (isSetupRoute(pathname)) {
      // Try to check if setup is complete
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const statusResponse = await fetch(`${apiUrl}/api/v1/setup/status`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (statusResponse.ok) {
          const status = await statusResponse.json();

          // If setup is complete, redirect to home (don't allow setup page access)
          if (status.is_setup) {
            return NextResponse.redirect(new URL("/", request.url));
          }
        }
      } catch {
        // If we can't reach the backend, allow setup route (setup might be needed)
      }

      return createResponseWithPathname(pathname);
    }

    // Validate token for protected routes
    const res = await ValidateToken();

    if (!res.success) {
      cookies.delete("session");
      cookies.delete("user");
      // Only redirect if not already on auth route
      if (!isAuthRoute(pathname)) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      return createResponseWithPathname(pathname);
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
