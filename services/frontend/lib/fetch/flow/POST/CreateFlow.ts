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

export default async function CreateFlow(
  name: string,
  description: string,
  projectId: string,
  runnerId: string,
  groupAlerts: boolean,
  groupAlertIdentifier: string,
  encryptAlerts: boolean,
  encryptExecutions: boolean,
  encryptActionParams: boolean,
  alertThreshold: number,
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
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.value,
        },
        body: JSON.stringify({
          name,
          description,
          project_id: projectId,
          runner_id: runnerId,
          group_alerts: groupAlerts,
          group_alerts_identifier: groupAlertIdentifier,
          encrypt_alerts: encryptAlerts,
          encrypt_executions: encryptExecutions,
          encrypt_action_params: encryptActionParams,
          alert_threshold: alertThreshold,
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
      message: "Failed to create flow",
    };
  }
}
