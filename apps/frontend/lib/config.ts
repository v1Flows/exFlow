/**
 * Dynamic configuration handler for JustFlow
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

    // If no env var, just use the default
    // Note: Auto-detection is now handled server-side during setup
    // This avoids browser CORS issues
    this.config = { apiUrl: this.getDefaultApiUrl() };
    this.initialized = true;
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

      return `${protocol}//${hostname}:8080`;
    }

    // Server-side fallback
    return "http://localhost:8080";
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
