import { getApiUrl } from "./config";

type ApiOptions = RequestInit & {
  timeout?: number; // ms
  retries?: number;
  retryDelay?: number; // ms
};

/**
 * Enhanced client-side fetch wrapper with timeout and optional retries.
 */
export async function apiFetch(
  endpoint: string,
  options: ApiOptions = {},
): Promise<Response> {
  const apiUrl = await getApiUrl();
  const url = `${apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const timeout = options.timeout ?? 8000;
  const retries = options.retries ?? 0;
  const retryDelay = options.retryDelay ?? 500;

  // default headers
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...defaultOptions,
        ...options,
        signal: controller.signal,
      } as RequestInit);
      clearTimeout(timer);

      // Retry on server errors (5xx)
      if (res.status >= 500 && attempt < retries) {
        lastError = new Error(`Server error: ${res.status}`);
        attempt++;
        await new Promise((r) => setTimeout(r, retryDelay * attempt));
        continue;
      }

      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (attempt < retries) {
        attempt++;
        await new Promise((r) => setTimeout(r, retryDelay * attempt));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

/**
 * Typed API fetch with JSON response and error handling.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const response = await apiFetch(endpoint, options);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}${
        body ? ` - ${body}` : ""
      }`,
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
