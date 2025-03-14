"use server";

export default async function SignUpAPI(
  email: string,
  username: string,
  password: string,
) {
  "use client";
  try {
    const headers = new Headers();

    headers.append("Content-Type", "application/json");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      },
    );
    const data = await res.json();

    return data;
  } catch {
    return { error: "Failed to fetch data" };
  }
}
