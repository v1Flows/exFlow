"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { serverFetch } from "../fetch/serverFetch";

export async function updateSession() {
  "use client";
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  try {
    const headers = new Headers();

    headers.append("Content-Type", "application/json");
    if (session) {
      headers.append("Authorization", session);
    }

    const response = await serverFetch(`/api/v1/token/refresh`, {
      method: "POST",
      headers: Object.fromEntries(headers.entries()),
      timeout: 8000,
      retries: 1,
    });
    const data = await response.json();

    const res = NextResponse.next();

    res.cookies.set({
      name: "session",
      value: data.token,
      expires: new Date(data.expires_at * 1000),
      httpOnly: true,
    });
    res.cookies.set({
      name: "user",
      value: JSON.stringify(data.user),
      expires: new Date(data.expires_at * 1000),
      httpOnly: true,
    });

    return true;
  } catch {
    return false;
  }
}
