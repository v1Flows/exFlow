"use server";

type DetectBackendResponse = {
  detected: boolean;
  url?: string;
  message: string;
};

export async function detectBackend(): Promise<DetectBackendResponse> {
  const dockerServices = [
    "justflow-backend:8080",
    "backend:8080",
    "justflow:8080",
  ];

  const kubernetesServices = [
    "justflow.justflow.svc.cluster.local:8080",
    "justflow-backend.justflow.svc.cluster.local:8080",
    "justflow-backend.default.svc.cluster.local:8080",
    "justflow-backend.svc.cluster.local:8080",
  ];

  const localhostUrl = "http://localhost:8080";
  const backendUrlEnv = process.env.BACKEND_URL;

  // Try Docker services first
  for (const service of dockerServices) {
    try {
      const response = await fetch(`http://${service}/api/v1/setup/status`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        return {
          detected: true,
          url: `http://${service}`,
          message: `Backend detected at ${service}`,
        };
      }
    } catch {
      // Continue to next service
    }
  }

  // Try Kubernetes services
  for (const service of kubernetesServices) {
    try {
      const response = await fetch(`http://${service}/api/v1/setup/status`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        return {
          detected: true,
          url: `http://${service}`,
          message: `Backend detected at ${service}`,
        };
      }
    } catch {
      // Continue to next service
    }
  }

  // Try localhost
  try {
    const response = await fetch(`${localhostUrl}/api/v1/setup/status`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      return {
        detected: true,
        url: localhostUrl,
        message: "Backend detected at localhost:8080",
      };
    }
  } catch {
    // Continue to fallback
  }

  // Try BACKEND_URL environment variable
  if (backendUrlEnv) {
    try {
      const response = await fetch(`${backendUrlEnv}/api/v1/setup/status`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        return {
          detected: true,
          url: backendUrlEnv,
          message: `Backend detected at ${backendUrlEnv}`,
        };
      }
    } catch {
      // Continue to error
    }
  }

  return {
    detected: false,
    message: "Unable to detect backend. Please configure manually.",
  };
}

type BackendStatusResponse = {
  success: boolean;
  is_setup: boolean;
  message?: string;
};

export async function checkBackendStatus(
  backendUrl: string,
): Promise<BackendStatusResponse> {
  try {
    const response = await fetch(`${backendUrl}/api/v1/setup/status`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        success: false,
        is_setup: false,
        message: "Could not connect to backend",
      };
    }

    const data = await response.json();

    return {
      success: true,
      is_setup: data.is_setup || false,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      is_setup: false,
      message: `Error checking backend status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

type SetupConfigPayload = {
  backend_url: string;
  backend_port: number;
  database: {
    server: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  frontend_url: string;
};

type SetupConfigResponse = {
  success: boolean;
  message?: string;
  backendRestarted?: boolean;
};

export async function submitSetupConfiguration(
  backendUrl: string,
  config: SetupConfigPayload,
): Promise<SetupConfigResponse> {
  try {
    const response = await fetch(`${backendUrl}/api/v1/setup/configure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      return {
        success: false,
        message:
          errorData.message ||
          `Backend responded with status ${response.status}`,
      };
    }

    // Backend is restarting, wait for it to come back online
    const restartResult = await waitForBackendRestart(backendUrl);

    return {
      success: true,
      message: restartResult.success
        ? "Setup complete! Backend restarted successfully."
        : `Setup submitted but backend restart verification failed: ${restartResult.message}`,
      backendRestarted: restartResult.success,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error submitting configuration: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

type ValidationErrorResponse = {
  all_valid: boolean;
  validation_errors?: string[];
  database_details?: {
    connected: boolean;
    is_empty: boolean;
    warning?: string;
  };
};

export async function validateSetupData(
  backendUrl: string,
  setupData: SetupConfigPayload,
): Promise<{
  success: boolean;
  all_valid: boolean;
  validation_errors: string[];
  info_messages: string[];
}> {
  try {
    const response = await fetch(`${backendUrl}/api/v1/setup/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(setupData),
      signal: AbortSignal.timeout(10000),
    });

    // For validation, both 200 (valid) and 400 (invalid) are expected responses
    if (response.status === 200 || response.status === 400) {
      const result: ValidationErrorResponse = await response.json();

      // Separate info messages from actual errors
      const errors = (result.validation_errors || []).filter(
        (err) => !err.includes("Database Info:"),
      );
      const infos = (result.validation_errors || []).filter((err) =>
        err.includes("Database Info:"),
      );

      return {
        success: true,
        all_valid: result.all_valid || false,
        validation_errors: errors,
        info_messages: infos,
      };
    }

    return {
      success: false,
      all_valid: false,
      validation_errors: [
        `API request failed: ${response.status} ${response.statusText}`,
      ],
      info_messages: [],
    };
  } catch (error) {
    return {
      success: false,
      all_valid: false,
      validation_errors: [
        `Validation request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
      info_messages: [],
    };
  }
}

export async function isSetupComplete(): Promise<boolean> {
  const dockerServices = [
    "justflow-backend:8080",
    "backend:8080",
    "justflow:8080",
  ];

  const kubernetesServices = [
    "justflow.justflow.svc.cluster.local:8080",
    "justflow-backend.justflow.svc.cluster.local:8080",
    "justflow-backend.default.svc.cluster.local:8080",
    "justflow-backend.svc.cluster.local:8080",
  ];

  const localhostUrl = "http://localhost:8080";
  const backendUrlEnv = process.env.BACKEND_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Try all possible backend URLs
  const urlsToTry = [
    ...dockerServices.map((s) => `http://${s}`),
    ...kubernetesServices.map((s) => `http://${s}`),
    localhostUrl,
    ...(backendUrlEnv ? [backendUrlEnv] : []),
    apiUrl,
  ];

  for (const url of urlsToTry) {
    try {
      const response = await fetch(`${url}/api/v1/setup/status`, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        const data = await response.json();

        return data.is_setup || false;
      }
    } catch {
      // Continue to next URL
    }
  }

  // If we can't reach any backend, assume setup is not complete
  return false;
}

export async function waitForBackendRestart(
  backendUrl: string,
  maxRetries: number = 30,
  retryDelayMs: number = 1000,
): Promise<{
  success: boolean;
  message: string;
}> {
  let lastError = "";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${backendUrl}/api/v1/setup/status`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Backend is back online after ${attempt * retryDelayMs}ms`,
        };
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Unknown connection error";
    }

    // Wait before retrying (except on last attempt)
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return {
    success: false,
    message: `Backend did not come back online after ${maxRetries} retries. Last error: ${lastError}`,
  };
}
