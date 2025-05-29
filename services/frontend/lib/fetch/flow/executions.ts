"use server";

import { cookies } from "next/headers";

type Executions = {
  executions: [];
  limit: number;
  offset: number;
  total: number;
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type SuccessResponse = {
  success: true;
  data: Executions;
};

export async function GetFlowExecutions(
  flowID: any,
  limit: number = 10,
  offset: number = 0,
  status: string | null = null,
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

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/${flowID}/executions?limit=${limit}&offset=${offset}&status=${status || ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.value,
        },
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

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to fetch flow executions",
    };
  }
}

export default GetFlowExecutions;
