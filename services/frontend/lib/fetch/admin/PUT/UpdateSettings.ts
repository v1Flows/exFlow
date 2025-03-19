"use server";

import { cookies } from "next/headers";

type Result = {
  result: string;
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

export default async function UpdateSettings(
  maintenance: boolean,
  signup: boolean,
  create_projects: boolean,
  create_flows: boolean,
  create_runners: boolean,
  create_api_keys: boolean,
  add_project_members: boolean,
  add_flow_actions: boolean,
  start_executions: boolean,
  receive_alerts: boolean,
  allow_shared_runner_auto_join: boolean,
  allow_shared_runner_join: boolean,
  shared_runner_auto_join_token: string,
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.value,
        },
        body: JSON.stringify({
          maintenance,
          signup,
          create_projects,
          create_flows,
          create_runners,
          create_api_keys,
          add_project_members,
          add_flow_actions,
          start_executions,
          receive_alerts,
          allow_shared_runner_auto_join,
          allow_shared_runner_join,
          shared_runner_auto_join_token,
        }),
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
      message: "Failed to update settings",
    };
  }
}
