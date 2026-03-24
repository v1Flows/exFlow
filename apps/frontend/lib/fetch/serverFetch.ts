"use server";

// eslint-disable-next-line no-undef
type FetchOptions = RequestInit & {
  timeout?: number; // ms
  retries?: number;
  retryDelay?: number; // ms
};

/**
 * Server-side fetch wrapper with timeout and optional retries.
 * Keeps the same Response API so callers can keep existing handling.
 */
export async function serverFetch(
  endpoint: string,
  options: FetchOptions = {},
): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
  const url = `${base}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const timeout = options.timeout ?? 8000;
  const retries = options.retries ?? 0;
  const retryDelay = options.retryDelay ?? 500;

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, { signal: controller.signal, ...options });

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
      // If aborted or network error and we can retry, do so
      if (attempt < retries) {
        attempt++;
        await new Promise((r) => setTimeout(r, retryDelay * attempt));
        continue;
      }

      // No more retries
      throw err;
    }
  }

  // If we exit loop without returning, throw the last error
  throw lastError;
}

/**
 * Helper that fetches and returns parsed JSON. Throws on non-ok responses.
 */
export async function serverRequest<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const res = await serverFetch(endpoint, options);

  if (!res.ok) {
    // try to parse error body
    const errorText = await res.text().catch(() => "");
    const msg = errorText || `${res.status} ${res.statusText}`;

    throw new Error(`API request failed: ${msg}`);
  }

  return res.json();
}

export default serverFetch;
