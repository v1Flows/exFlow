"use server";

import { cookies } from "next/headers";

import { serverFetch } from "../../serverFetch";

type ErrorResponse = { success: false; error: string; message: string };
type SuccessResponse = { success: true };

export default async function DeleteSelfServicePage(
  pageID: string,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    const res = await serverFetch(`/api/v1/self-service/${pageID}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
      timeout: 8000,
      retries: 1,
    });

    if (!res.ok) {
      const errorData = await res.json();

      return {
        success: false,
        error: `API error: ${res.status} ${res.statusText}`,
        message: errorData.message || "An error occurred",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to delete self-service page",
    };
  }
}
