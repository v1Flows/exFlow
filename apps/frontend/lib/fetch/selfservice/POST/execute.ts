"use server";

import { cookies } from "next/headers";

import { InputValues } from "@/types";

import { serverFetch } from "../../serverFetch";

type ErrorResponse = { success: false; error: string; message: string };
type SuccessResponse = { success: true; data: { execution_id: string } };

export default async function ExecuteSelfServiceFlow(
  slugOrID: string,
  flowID: string,
  inputs: InputValues,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    const res = await serverFetch(
      `/api/v1/self-service/${slugOrID}/execute/${flowID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.value,
        },
        body: JSON.stringify({ inputs }),
        timeout: 8000,
        retries: 1,
      },
    );

    if (!res.ok) {
      const errorData = await res.json();

      return {
        success: false,
        error: `API error: ${res.status} ${res.statusText}`,
        message: errorData.message || "An error occurred",
      };
    }

    const data = await res.json();

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to execute flow",
    };
  }
}
