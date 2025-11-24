import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const detected: string[] = [];

  try {
    // Step 1: Check environment variable first (highest priority)
    if (process.env.NEXT_PUBLIC_API_URL) {
      const isValid = await checkBackendHealth(process.env.NEXT_PUBLIC_API_URL);

      if (isValid) {
        return NextResponse.json({
          detected: [process.env.NEXT_PUBLIC_API_URL],
          message: "Found backend via environment variable",
        });
      }
    }

    // Step 2: Try Docker service names (for Docker/Kubernetes environments)
    // These are accessible from the server-side
    const internalServices = [
      "http://justflow-backend:8080",
      "http://justflow:8080",
      "http://backend:8080",
      "http://api:8080",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
    ];

    for (const service of internalServices) {
      try {
        const isValid = await checkBackendHealth(service);

        if (isValid) {
          detected.push(service);
          // Return immediately on first successful detection
          break;
        }
      } catch {
        // Continue to next service
        continue;
      }
    }

    // Step 3: If we found internal services, we need to determine the external URL
    // that the browser can access. This should come from environment or request headers.
    let browserAccessibleUrl = "";

    if (detected.length > 0) {
      // Prefer explicit environment configuration
      if (process.env.BACKEND_URL) {
        browserAccessibleUrl = process.env.BACKEND_URL;
      } else {
        // Extract hostname from request and construct URL
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = request.headers.get("x-forwarded-proto") || "http";

        // Determine backend host - if running in Docker, use the same host as frontend
        const detectedService = detected[0];

        if (
          detectedService.includes("justflow-backend") ||
          detectedService.includes("localhost") ||
          detectedService.includes("127.0.0.1")
        ) {
          // For Docker/local: use relative URL or same hostname
          browserAccessibleUrl = `${protocol}://${host.split(":")[0]}:8080`;
        } else {
          // For Kubernetes: backend might be at a different host
          browserAccessibleUrl = detectedService;
        }
      }
    }

    return NextResponse.json({
      detected,
      browserAccessibleUrl,
      message:
        detected.length > 0
          ? "Backend service(s) detected from server"
          : "No backend services found. Please configure BACKEND_URL environment variable.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        detected: [],
        error:
          error instanceof Error ? error.message : "Failed to detect backend",
      },
      { status: 500 },
    );
  }
}

async function checkBackendHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${url}/api/v1/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      
      try {
        const data = JSON.parse(text);
        return data.service === "backend";
      } catch {
        console.error(`Failed to parse health response from ${url}:`, text);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error(`Health check failed for ${url}:`, error);
    return false;
  }
}
