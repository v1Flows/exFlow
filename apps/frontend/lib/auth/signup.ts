"use server";

import { serverFetch } from "../fetch/serverFetch";

export default async function SignUpAPI(
  email: string,
  username: string,
  password: string,
) {
  try {
    const res = await serverFetch(`/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
      timeout: 8000,
      retries: 1,
    });
    const data = await res.json();

    return data;
  } catch {
    return { error: "Failed to fetch data" };
  }
}
