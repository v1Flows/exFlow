"use server";

import { cookies } from "next/headers";

import { serverFetch } from "../../serverFetch";

export default async function SetFlowUseDag(
  flowID: string,
  useDag: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await serverFetch(`/api/v1/flows/${flowID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
      body: JSON.stringify({ use_dag: useDag }),
      timeout: 8000,
      retries: 1,
    });

    if (!res.ok) {
      return { success: false, error: `API error: ${res.status}` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
