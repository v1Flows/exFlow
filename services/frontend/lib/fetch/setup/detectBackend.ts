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
