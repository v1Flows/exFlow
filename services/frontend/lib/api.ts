import { getApiUrl } from "./config";

/**
 * Enhanced fetch wrapper that handles dynamic API URL detection
 */
export async function apiFetch(
  endpoint: string,
  // eslint-disable-next-line no-undef
  options?: RequestInit,
): Promise<Response> {
  const apiUrl = await getApiUrl();
  const url = `${apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // eslint-disable-next-line no-undef
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
}

/**
 * Typed API fetch with JSON response
 */
export async function apiRequest<T>(
  endpoint: string,
  // eslint-disable-next-line no-undef
  options?: RequestInit,
): Promise<T> {
  const response = await apiFetch(endpoint, options);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Setup-specific API calls
 */
export const setupApi = {
  checkStatus: () =>
    apiRequest<{
      is_setup: boolean;
      backend_config_exists: boolean;
      frontend_env_exists: boolean;
    }>("/api/v1/setup/status"),

  validate: async (data: any) => {
    const response = await apiFetch("/api/v1/setup/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // For validation, both 200 (valid) and 400 (invalid) are expected responses
    if (response.status === 200 || response.status === 400) {
      return response.json();
    }

    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  },

  configure: (data: any) =>
    apiRequest<{
      message: string;
      backend_config_path: string;
      frontend_env_path: string;
      restart_required?: boolean;
    }>("/api/v1/setup/configure", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  restart: () =>
    apiRequest<{ message: string }>("/api/v1/setup/restart", {
      method: "POST",
    }),
};
