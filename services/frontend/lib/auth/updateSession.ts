"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/token/refresh`,
      {
        method: "POST",
        headers,
      },
    );
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
