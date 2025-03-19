"use server";

import { cookies } from "next/headers";

type Stats = {
  started_execution_stats: [];
  failed_execution_stats: [];
  incoming_alert_stats: [];
  user_registration_stats: [];
  project_creation_stats: [];
  flow_creation_stats: [];
  users_per_role_stats: [];
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type SuccessResponse = {
  success: true;
  data: Stats;
};

export async function AdminGetStats(
  interval: number,
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/stats?interval=${interval}`,
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
      message: "Failed to fetch stats",
    };
  }
}

export default AdminGetStats;
