"use server";

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type SuccessResponse = {
  success: true;
};

export default async function SimulateAlert(
  target: any,
  payload: any,
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!res.ok) {
      const errorData = await res.json();

      return {
        success: false,
        error: `API error: ${res.status} ${res.statusText}`,
        message: errorData.message || "An error occurred",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to send alert",
    };
  }
}
