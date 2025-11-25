"use server";

import { serverFetch } from "../fetch/serverFetch";

export default async function CheckUserTaken(
  id: string,
  email: string,
  username: string,
) {
  try {
    const res = await serverFetch(`/api/v1/auth/user/taken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        email,
        username,
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
