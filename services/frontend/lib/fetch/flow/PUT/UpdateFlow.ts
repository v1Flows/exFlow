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
  encryptExecutions: boolean,
  encryptActionParams: boolean,
  execParallel: boolean,
  failurePipelineID: string,
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
          encrypt_executions: encryptExecutions,
          encrypt_action_params: encryptActionParams,
          exec_parallel: execParallel,
          failure_pipeline_id: failurePipelineID,
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
