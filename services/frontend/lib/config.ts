/**
 * Dynamic configuration handler for ExFlow
 * Handles cases where .env might not exist during initial setup
 */

interface Config {
  apiUrl: string;
}

class ConfigManager {
  private config: Config | null = null;
  private initialized = false;

  /**
   * Get the API URL, with fallback logic for setup mode
   */
  async getApiUrl(): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.config?.apiUrl || this.getDefaultApiUrl();
  }

  /**
   * Initialize configuration from environment or detect dynamically
   */
  private async initialize(): Promise<void> {
    // First, try to use the environment variable (if .env exists)
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (envApiUrl) {
      this.config = { apiUrl: envApiUrl };
      this.initialized = true;

      return;
    }

    // If no env var, try to detect the backend automatically
    const detectedUrl = await this.detectBackendUrl();

    this.config = { apiUrl: detectedUrl };
    this.initialized = true;
  }

  /**
   * Detect backend URL by trying common ports and checking setup status
   */
  private async detectBackendUrl(): Promise<string> {
    const commonPorts = [8081, 8080, 3001, 3000];

    const protocol =
      // eslint-disable-next-line no-undef
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "https"
        : "http";

    const hostname =
      // eslint-disable-next-line no-undef
      typeof window !== "undefined" ? window.location.hostname : "localhost";

    for (const port of commonPorts) {
      const testUrl = `${protocol}://${hostname}:${port}`;

      try {
        const response = await fetch(`${testUrl}/api/v1/setup/status`, {
          method: "GET",
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });

        if (response.ok) {
          return testUrl;
        }
      } catch {
        // Continue to next port
      }
    }

    // Default fallback
    return this.getDefaultApiUrl();
  }

  /**
   * Get default API URL based on environment
   */
  private getDefaultApiUrl(): string {
    if (typeof window !== "undefined") {
      // Client-side
      // eslint-disable-next-line no-undef
      const protocol = window.location.protocol;
      // eslint-disable-next-line no-undef
      const hostname = window.location.hostname;

      return `${protocol}//${hostname}:8081`;
    }

    // Server-side fallback
    return "http://localhost:8081";
  }

  /**
   * Update configuration (useful after setup completion)
   */
  updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig } as Config;
  }

  /**
   * Reset configuration (force re-detection)
   */
  reset(): void {
    this.config = null;
    this.initialized = false;
  }
}

// Singleton instance
export const configManager = new ConfigManager();

/**
 * Hook for components to get the API URL
 */
export async function getApiUrl(): Promise<string> {
  return configManager.getApiUrl();
}

/**
 * Update the API URL after setup completion
 */
export function updateApiUrl(newUrl: string): void {
  configManager.updateConfig({ apiUrl: newUrl });
}
