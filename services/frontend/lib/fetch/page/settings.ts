"use server";

type Settings = {
  settings: any;
};

type ErrorResponse = {
  success: false;
  error: string;
  message: string;
};

type SuccessResponse = {
  success: true;
  data: Settings;
};

export async function PageGetSettings(): Promise<
  SuccessResponse | ErrorResponse
> {
  try {
    // Page settings are public server-side; still use serverFetch to get timeout/retries
    const { serverFetch } = await import("../serverFetch");
    const res = await serverFetch(`/api/v1/page/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
      message: "Failed to fetch settings",
    };
  }
}

export default PageGetSettings;
