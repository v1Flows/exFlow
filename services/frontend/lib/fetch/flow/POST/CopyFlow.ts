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

export default async function CopyFlow(
  name: string,
  description: string,
  folderId: string,
  projectId: string,
  runnerId: string,
  encryptExecutions: boolean,
  encryptActionParams: boolean,
  actions: any,
  failurePipelines: any,
  failurePipelineID: string,
  execParallel: boolean,
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
          folder_id: folderId,
          project_id: projectId,
          runner_id: runnerId,
          encrypt_executions: encryptExecutions,
          encrypt_action_params: encryptActionParams,
          exec_parallel: execParallel,
          actions: actions,
          failure_pipelines: failurePipelines,
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
      message: "Failed to copy flow",
    };
  }
}
