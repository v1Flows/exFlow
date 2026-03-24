import APIStartExecution from "@/lib/fetch/executions/start";

// Client-side API helpers for mutations
export async function startExecution(
  flowId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await APIStartExecution(flowId);

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error:
          "message" in result ? result.message : "Failed to start execution",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
