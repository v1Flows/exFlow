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

export default async function UpdateFlow(
  id: string,
  name: string,
  description: string,
  projectID: string,
  runnerID: string,
  encryptAlerts: boolean,
  encryptExecutions: boolean,
  encryptActionParams: boolean,
  groupAlerts: boolean,
  groupAlertsIdentifier: string,
  alertThreshold: number,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flows/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.value,
        },
        body: JSON.stringify({
          name,
          description,
          project_id: projectID,
          runner_id: runnerID,
          group_alerts: groupAlerts,
          group_alerts_identifier: groupAlertsIdentifier,
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
      message: "Failed to update flow",
    };
  }
}
