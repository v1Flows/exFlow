"use server";

import { cookies } from "next/headers";

import { PageFlow } from "@/types";

import { serverFetch } from "../../serverFetch";

type ErrorResponse = { success: false; error: string; message: string };
type SuccessResponse = { success: true; data: { id: string } };

export interface CreateSelfServicePageInput {
  name: string;
  description: string;
  slug: string;
  project_id: string;
  icon: string;
  color: string;
  enabled: boolean;
  page_flows: PageFlow[];
}

export default async function CreateSelfServicePage(
  input: CreateSelfServicePageInput,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    const res = await serverFetch("/api/v1/self-service/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
      body: JSON.stringify(input),
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

    const data = await res.json();

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to create self-service page",
    };
  }
}
