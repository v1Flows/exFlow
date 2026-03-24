"use server";

import { serverFetch } from "../fetch/serverFetch";

export default async function LoginAPI(
  email: string,
  password: string,
  remember_me: boolean,
) {
  try {
    const res = await serverFetch(`/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        remember_me,
      }),
      timeout: 8000,
      retries: 1,
    });
    const data = await res.json();

    return data;
  } catch {
    return { error: "Failed to login" };
  }
}
