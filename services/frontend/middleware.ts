import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import PageGetSettings from "./lib/fetch/page/settings";

import "./updateSessionInterval";

export async function middleware(request: NextRequest) {
  // Ensure we're in a request context
  if (!request) {
    throw new Error("Middleware must be called within a request context");
  }

  try {
    // Safely access cookies from the request
    const cookies = request.cookies;

    // Handle the cookies
    const hasSessionCookie = cookies.has("session");

    const userCookie = cookies.get("user");
    const userData = userCookie ? JSON.parse(userCookie.value) : null;

    // ignore all those _next and favicon requests
    if (
      !request.url.includes("_next") &&
      !request.url.includes("/favicon.ico") &&
      !request.url.includes("/admin") &&
      !request.url.includes("/maintenance") &&
      !request.url.includes(".png") &&
      !request.url.includes(".jpg") &&
      !request.url.includes(".jpeg") &&
      !request.url.includes(".svg") &&
      !request.url.includes(".gif") &&
      !request.url.includes(".json") &&
      !request.url.includes(".js")
    ) {
      const settings = await PageGetSettings();

      // data fetching error
      if (!settings.success) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }

      // check for maintenance mode
      if (settings.data.settings.maintenance && userData.role !== "admin") {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }

      if (
        !hasSessionCookie &&
        !request.url.includes("/auth/login") &&
        !request.url.includes("/auth/signup")
      ) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      if (
        request.url.includes("/maintenance") &&
        !settings.data.settings.maintenance
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (request.url.includes("/auth/login") && hasSessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (request.url.includes("/auth/signup") && hasSessionCookie) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    }
  } catch (error) {
    console.error("Cookie handling error:", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
