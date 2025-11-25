"use server";

import { cookies } from "next/headers";
import { serverFetch } from "../../serverFetch";

type Result = {
  result: string;
  key: string;
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type SuccessResponse = {
  success: true;
  data: Result;
};

export default async function CreateProjectToken(
  projectId,
  expiresIn,
  description,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    if (!token) {
      return {
        success: false,
        error: "Authentication token not found",
        message: "User is not authenticated",
      };
    }

    const res = await serverFetch(`/api/v1/projects/${projectId}/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
      body: JSON.stringify({
        description,
      }),
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

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to create project api key",
    };
  }
}
