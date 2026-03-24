"use server";

type DetectBackendResponse = {
  detected: boolean;
  url?: string;
  message: string;
};

async function probeUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(`${url}/api/v1/setup/status`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    return response.ok ? url : null;
  } catch {
    return null;
  }
}

export async function detectBackend(): Promise<DetectBackendResponse> {
  // Check explicit env vars first — fastest path, no network probing needed
  const backendUrlEnv = process.env.BACKEND_URL;
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

  for (const envUrl of [backendUrlEnv, publicApiUrl]) {
    if (envUrl) {
      const result = await probeUrl(envUrl);
      if (result) {
        return { detected: true, url: result, message: `Backend detected at ${result}` };
      }
    }
  }

  // Probe all candidate URLs concurrently
  const candidates = [
    "http://justflow-backend:8080",
    "http://backend:8080",
    "http://justflow:8080",
    "http://justflow.justflow.svc.cluster.local:8080",
    "http://justflow-backend.justflow.svc.cluster.local:8080",
    "http://justflow-backend.default.svc.cluster.local:8080",
    "http://justflow-backend.svc.cluster.local:8080",
    "http://localhost:8080",
  ];

  const results = await Promise.allSettled(candidates.map(probeUrl));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled" && r.value) {
      return { detected: true, url: r.value, message: `Backend detected at ${r.value}` };
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
  logging: {
    level: string;
    format: string;
  };
};

type SetupConfigResponse = {
  success: boolean;
  message?: string;
  backendRestarted?: boolean;
  shared_runner_secret?: string;
  jwt_secret?: string;
  encryption_key?: string;
  master_secret?: string;
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

    const responseData = await response.json();

    // Backend is restarting, wait for it to come back online
    const restartResult = await waitForBackendRestart(backendUrl);

    return {
      success: true,
      message: restartResult.success
        ? "Setup complete! Backend restarted successfully."
        : `Setup submitted but backend restart verification failed: ${restartResult.message}`,
      backendRestarted: restartResult.success,
      shared_runner_secret: responseData.shared_runner_secret,
      jwt_secret: responseData.jwt_secret,
      encryption_key: responseData.encryption_key,
      master_secret: responseData.master_secret,
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

async function probeSetupStatus(url: string): Promise<boolean | null> {
  try {
    const response = await fetch(`${url}/api/v1/setup/status`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.is_setup || false;
  } catch {
    return null;
  }
}

export async function isSetupComplete(): Promise<boolean> {
  // Check explicit env vars first — fastest path
  const backendUrlEnv = process.env.BACKEND_URL;
  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;

  for (const envUrl of [backendUrlEnv, publicApiUrl]) {
    if (envUrl) {
      const result = await probeSetupStatus(envUrl);
      if (result !== null) return result;
    }
  }

  // Probe all candidate URLs concurrently
  const candidates = [
    "http://justflow-backend:8080",
    "http://backend:8080",
    "http://justflow:8080",
    "http://justflow.justflow.svc.cluster.local:8080",
    "http://justflow-backend.justflow.svc.cluster.local:8080",
    "http://justflow-backend.default.svc.cluster.local:8080",
    "http://justflow-backend.svc.cluster.local:8080",
    "http://localhost:8080",
  ];

  const results = await Promise.allSettled(candidates.map(probeSetupStatus));

  for (const r of results) {
    if (r.status === "fulfilled" && r.value !== null) {
      return r.value;
    }
  }

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
