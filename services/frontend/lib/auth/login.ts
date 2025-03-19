"use server";

export default async function LoginAPI(
  email: string,
  password: string,
  remember_me: boolean,
) {
  "use client";
  try {
    const headers = new Headers();

    headers.append("Content-Type", "application/json");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          password,
          remember_me,
        }),
      },
    );
    const data = await res.json();

    return data;
  } catch {
    return { error: "Failed to login" };
  }
}
