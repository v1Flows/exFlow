"use server";

export default async function CheckUserTaken(email: string, username: string) {
  "use client";
  try {
    const headers = new Headers();

    headers.append("Content-Type", "application/json");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/user/taken`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          username,
        }),
      },
    );
    const data = await res.json();

    return data;
  } catch {
    return { error: "Failed to fetch data" };
  }
}
