"use client";

import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Input,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

import { setupApi } from "@/lib/api";

import { Ripple } from "../magicui/ripple";

type SetupPhase =
  | "backend-detection"
  | "deployment-scenario"
  | "configuration"
  | "complete";
type DeploymentScenario = "combined" | "independent" | null;

interface SetupData {
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
}

export default function SetupPageClient() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  // Main setup phase - drives what UI is shown
  const [setupPhase, setSetupPhase] = useState<SetupPhase>("backend-detection");

  // Deployment scenario (combined container or independent backend)
  const [deploymentScenario, setDeploymentScenario] =
    useState<DeploymentScenario>(null);

  // Backend discovery
  const [detectedBackendUrl, setDetectedBackendUrl] = useState<string>("");
  const [backendsDetected, setBackendsDetected] = useState<string[]>([]);
  const [isDetectingBackends, setIsDetectingBackends] = useState(false);
  const [customBackendUrl, setCustomBackendUrl] = useState("");
  const [isCheckingBackendStatus, setIsCheckingBackendStatus] = useState(false);

  // Configuration steps
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [runtimeEnvironment, setRuntimeEnvironment] = useState<string>("");

  // Validation
  const [error, setError] = useState<string>("");
  const [validationLoading, setValidationLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false);

  // Setup completion
  const [setupComplete, setSetupComplete] = useState(false);

  // Setup data
  const [setupData, setSetupData] = useState<SetupData>({
    backend_url: "http://localhost:8080",
    backend_port: 8080,
    database: {
      server: "localhost",
      port: 5432,
      name: "justflow",
      user: "postgres",
      password: "",
    },
    frontend_url: "http://localhost:3000",
  });

  // ============================================================
  // LIFECYCLE
  // ============================================================

  useEffect(() => {
    detectRuntimeEnvironment();
  }, []);

  // ============================================================
  // PHASE 1: Backend Detection Functions
  // ============================================================

  const checkBackendHealth = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${url}/api/v1/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();

        return data.service === "backend";
      }

      return false;
    } catch {
      return false;
    }
  };

  const detectBackends = async () => {
    const detected: string[] = [];

    // Step 1: Check environment variable first (highest priority)
    if (process.env.NEXT_PUBLIC_API_URL) {
      const isValid = await checkBackendHealth(process.env.NEXT_PUBLIC_API_URL);

      if (isValid) {
        detected.push(process.env.NEXT_PUBLIC_API_URL);
        setBackendsDetected(detected);

        return;
      }
    }

    // Step 2: Try Docker service names (for Docker Compose environments)
    const dockerServices = [
      "http://justflow-backend:8080",
      "http://justflow:8080",
      "http://backend:8080",
      "http://api:8080",
    ];

    for (const service of dockerServices) {
      const isValid = await checkBackendHealth(service);

      if (isValid) {
        detected.push(service);
      }
    }

    // Step 3: Scan localhost on common ports
    const commonPorts = [8080, 8000, 3000, 5000, 8888, 9000];

    for (const port of commonPorts) {
      const url = `http://localhost:${port}`;
      const isValid = await checkBackendHealth(url);

      if (isValid) {
        detected.push(url);
      }
    }

    // Step 4: Try 127.0.0.1 with common ports (alternative localhost)
    for (const port of commonPorts) {
      const url = `http://127.0.0.1:${port}`;
      const isValid = await checkBackendHealth(url);

      if (isValid) {
        detected.push(url);
      }
    }

    // Remove duplicates
    const uniqueDetected = Array.from(new Set(detected));

    setBackendsDetected(uniqueDetected);
  };

  const selectBackendAndCheckStatus = async (backendUrl: string) => {
    setDetectedBackendUrl(backendUrl);
    setIsCheckingBackendStatus(true);
    setError("");

    try {
      // Call the backend's setup status endpoint
      const response = await fetch(`${backendUrl}/api/v1/setup/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setError("Could not connect to backend to check setup status");
        setIsCheckingBackendStatus(false);

        return;
      }

      const status = await response.json();

      if (status.is_setup) {
        // ✅ Everything is already configured!
        setSetupPhase("complete");
        setSetupComplete(true);
      } else {
        // Auto-detect deployment scenario from backend status
        // If backend config exists but frontend env doesn't: independent backend
        // If neither exists: combined container
        if (status.backend_config_exists && !status.frontend_env_exists) {
          setDeploymentScenario("independent");
        } else {
          setDeploymentScenario("combined");
        }

        // Skip scenario selection, go straight to configuration
        setSetupPhase("configuration");
        setCurrentStep(0);
      }
    } catch (err) {
      setError(
        `Error checking backend status: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    } finally {
      setIsCheckingBackendStatus(false);
    }
  };

  // ============================================================
  // PHASE 2+: Configuration Helpers
  // ============================================================

  const detectRuntimeEnvironment = async () => {
    if (process.env.JUSTFLOW_RUNTIME_ENVIRONMENT) {
      setRuntimeEnvironment(process.env.JUSTFLOW_RUNTIME_ENVIRONMENT);

      return;
    }

    setRuntimeEnvironment("unknown");
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");

      setSetupData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof SetupData] as object),
          [child]: value,
        },
      }));
    } else {
      setSetupData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateSetupData = async () => {
    setValidationLoading(true);
    setValidationErrors([]);
    setValidationSuccess(false);

    try {
      const result = await setupApi.validate(setupData);

      if (result.all_valid) {
        setValidationSuccess(true);
        setValidationErrors([]);
      } else {
        setValidationErrors(result.validation_errors);
        setValidationSuccess(false);
      }
    } catch (error: any) {
      setValidationErrors([
        `Validation request failed: ${error.message || "Unknown error"}`,
      ]);
      setValidationSuccess(false);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await setupApi.configure(setupData);

      if (result.restart_required) {
        setSetupComplete(true);
      }
    } catch (error: any) {
      setError(`Setup failed: ${error.message || "Unknown error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // Show success screen if setup already complete
  if (setupComplete && setupPhase === "complete") {
    return (
      <main className="h-screen flex flex-col items-center justify-center gap-8 px-4">
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
          <div className="z-10 w-full max-w-md text-center space-y-4">
            <Icon
              className="text-green-500 text-6xl"
              icon="hugeicons:checkmark-badge-01"
            />
            <div>
              <p className="text-xl font-semibold text-white mb-2">
                Backend Already Configured!
              </p>
              <p className="text-sm text-gray-300">
                Your JustFlow backend at{" "}
                <Code size="sm">{detectedBackendUrl}</Code> is already set up
                and ready to use.
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              You can now access your JustFlow application.
            </p>
          </div>
          <Ripple mainCircleOpacity={0.34} numCircles={13} />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center gap-8 px-4">
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
        <div className="z-10 w-full max-w-md">
          <p className="text-center text-4xl font-semibold tracking-tighter text-white mb-2">
            Setup Just<span className="text-primary font-bold">Flow</span>
          </p>
          <p className="text-center text-gray-300 mb-8">
            Configure your application settings
          </p>

          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-semibold">
                  {setupPhase === "backend-detection" && "Find Your Backend"}
                  {setupPhase === "configuration" && "Configure JustFlow"}
                  {setupPhase === "complete" && "Setup Complete!"}
                </h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* ============================================================ */}
              {/* PHASE 1: Backend Detection */}
              {/* ============================================================ */}
              {setupPhase === "backend-detection" && (
                <>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        JustFlow requires a backend to function. Let&apos;s find
                        it and check if it&apos;s already configured.
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      color="primary"
                      isLoading={isDetectingBackends}
                      startContent={
                        !isDetectingBackends ? (
                          <Icon
                            icon={
                              backendsDetected.length > 0
                                ? "hugeicons:checkmark-badge-01"
                                : "hugeicons:scan-search"
                            }
                            width={16}
                          />
                        ) : null
                      }
                      onPress={async () => {
                        setIsDetectingBackends(true);
                        await detectBackends();
                        setIsDetectingBackends(false);
                      }}
                    >
                      {isDetectingBackends
                        ? "Scanning..."
                        : backendsDetected.length > 0
                          ? `Found ${backendsDetected.length} Backend(s)`
                          : "Auto-Detect Backends"}
                    </Button>

                    {backendsDetected.length > 0 && (
                      <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                        <p className="text-xs font-semibold text-success-700 mb-2">
                          Detected Backends:
                        </p>
                        <div className="space-y-2">
                          {backendsDetected.map((backend) => (
                            <Button
                              key={backend}
                              className="w-full justify-start text-left"
                              color={
                                detectedBackendUrl === backend
                                  ? "success"
                                  : "default"
                              }
                              isLoading={
                                isCheckingBackendStatus &&
                                detectedBackendUrl === backend
                              }
                              size="sm"
                              startContent={
                                detectedBackendUrl === backend &&
                                !isCheckingBackendStatus ? (
                                  <Icon
                                    icon="hugeicons:checkmark-badge-01"
                                    width={14}
                                  />
                                ) : null
                              }
                              variant={
                                detectedBackendUrl === backend
                                  ? "flat"
                                  : "bordered"
                              }
                              onPress={() => {
                                selectBackendAndCheckStatus(backend);
                              }}
                            >
                              <Code color="success" size="sm">
                                {backend}
                              </Code>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Divider />

                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        Or enter manually:
                      </p>
                      <Input
                        endContent={
                          <Button
                            isIconOnly
                            className="bg-primary text-white"
                            isLoading={isCheckingBackendStatus}
                            size="sm"
                            onPress={() => {
                              if (customBackendUrl) {
                                selectBackendAndCheckStatus(customBackendUrl);
                              }
                            }}
                          >
                            <Icon icon="hugeicons:arrow-right-01" width={16} />
                          </Button>
                        }
                        placeholder="http://backend.example.com:8080"
                        size="sm"
                        value={customBackendUrl}
                        onChange={(e) => setCustomBackendUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ============================================================ */}
              {/* PHASE 3: Configuration Steps */}
              {/* ============================================================ */}
              {setupPhase === "configuration" && deploymentScenario && (
                <>
                  {/* Step 0: Welcome & Runtime Detection */}
                  {currentStep === 0 && (
                    <div className="flex flex-col gap-4">
                      <p>
                        Let us first check on which environment you are running
                        JustFlow<span className="text-primary">.</span>
                      </p>
                      {runtimeEnvironment === "" && (
                        <Spinner label="Detecting Runtime Environment..." />
                      )}
                      {runtimeEnvironment && (
                        <>
                          <div className="flex flex-cols items-center gap-1">
                            <Code
                              color={
                                runtimeEnvironment === "unknown"
                                  ? "danger"
                                  : "success"
                              }
                            >
                              {runtimeEnvironment}
                            </Code>{" "}
                            got detected as the runtime environment.
                          </div>
                          {runtimeEnvironment === "docker" && (
                            <Alert
                              color="warning"
                              description="Please make sure that you are using volumes for your Docker containers. Otherwise the configuration may not persist across container restarts."
                              title="Docker Information"
                            />
                          )}
                          <p>
                            Please make sure to follow the instructions in the
                            next steps to ensure proper configuration.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Step 1: Backend Port (Combined) OR Frontend URL (Independent) */}
                  {currentStep === 1 && deploymentScenario === "combined" && (
                    <div>
                      <p className="font-semibold">Backend Configuration</p>
                      <p className="text-sm mb-4">
                        The Backend started by default an endpoint on port{" "}
                        <span className="text-primary font-bold">8080</span>.
                        This is the default backend port used during setup and{" "}
                        <span className="text-primary font-bold">
                          has to be accessible from the frontend
                        </span>
                        . During the setup you can change the backend port.
                      </p>
                      <Divider className="my-4" />
                      <Input
                        description="Port on which the backend server will start. Keep the default value if JustFlow is running inside Docker."
                        label="Backend Port"
                        placeholder="8080"
                        type="number"
                        value={setupData.backend_port.toString()}
                        onChange={(e) =>
                          handleInputChange(
                            "backend_port",
                            Number.parseInt(e.target.value) || 8080,
                          )
                        }
                      />
                    </div>
                  )}

                  {currentStep === 1 &&
                    deploymentScenario === "independent" && (
                      <div>
                        <p className="font-semibold">Frontend Configuration</p>
                        <p className="text-sm mb-4">
                          Configure how to access your JustFlow frontend.
                        </p>
                        <Input
                          label="Frontend URL"
                          placeholder="http://localhost:3000"
                          value={setupData.frontend_url}
                          onChange={(e) =>
                            handleInputChange("frontend_url", e.target.value)
                          }
                        />
                      </div>
                    )}

                  {/* Step 2: Database Configuration (Combined only) */}
                  {currentStep === 2 && deploymentScenario === "combined" && (
                    <>
                      <div>
                        <p className="font-semibold">Database Configuration</p>
                        <p className="text-sm mb-4">
                          Configure your PostgreSQL database for JustFlow.
                        </p>
                      </div>
                      <Input
                        label="Database Server"
                        placeholder="localhost"
                        value={setupData.database.server}
                        onChange={(e) =>
                          handleInputChange("database.server", e.target.value)
                        }
                      />
                      <Input
                        label="Database Port"
                        placeholder="5432"
                        type="number"
                        value={setupData.database.port.toString()}
                        onChange={(e) =>
                          handleInputChange(
                            "database.port",
                            Number.parseInt(e.target.value) || 5432,
                          )
                        }
                      />
                      <Input
                        label="Database Name"
                        placeholder="justflow"
                        value={setupData.database.name}
                        onChange={(e) =>
                          handleInputChange("database.name", e.target.value)
                        }
                      />
                      <Input
                        label="Database User"
                        placeholder="postgres"
                        value={setupData.database.user}
                        onChange={(e) =>
                          handleInputChange("database.user", e.target.value)
                        }
                      />
                      <Input
                        label="Database Password"
                        placeholder="Enter database password"
                        type="password"
                        value={setupData.database.password}
                        onChange={(e) =>
                          handleInputChange("database.password", e.target.value)
                        }
                      />
                    </>
                  )}

                  {/* Step 2/3: Backend URL & Validation */}
                  {((deploymentScenario === "combined" && currentStep === 3) ||
                    (deploymentScenario === "independent" &&
                      currentStep === 2)) && (
                    <>
                      <Input
                        description="URL used by the frontend to reach the backend. Keep the default value if JustFlow is running inside Docker."
                        label="Backend URL"
                        placeholder="http://localhost:8080"
                        value={setupData.backend_url}
                        onChange={(e) =>
                          handleInputChange("backend_url", e.target.value)
                        }
                      />
                      <div className="pt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Review your configuration:
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {deploymentScenario === "combined" && (
                            <>
                              <li>Backend Port: {setupData.backend_port}</li>
                              <li>
                                Database: {setupData.database.user}@
                                {setupData.database.server}
                                {`:${setupData.database.port}/`}
                                {setupData.database.name}
                              </li>
                            </>
                          )}
                          <li>Backend URL: {setupData.backend_url}</li>
                        </ul>

                        <div className="mt-4">
                          <Button
                            className="w-full mb-3"
                            color={validationSuccess ? "success" : "primary"}
                            isLoading={validationLoading}
                            startContent={
                              !validationLoading ? (
                                <Icon
                                  icon={
                                    validationSuccess
                                      ? "hugeicons:checkmark-badge-01"
                                      : "hugeicons:knight-shield"
                                  }
                                  width={16}
                                />
                              ) : null
                            }
                            onPress={validateSetupData}
                          >
                            {validationLoading
                              ? "Testing..."
                              : validationSuccess
                                ? "Configuration Valid"
                                : "Test Configuration"}
                          </Button>

                          {validationErrors.length > 0 && (
                            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                              <h4 className="text-sm font-medium text-danger-800 mb-2">
                                Configuration Issues:
                              </h4>
                              <ul className="text-xs text-danger-700 space-y-1">
                                {validationErrors.map((error, index) => (
                                  <li key={index}>• {error}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {validationSuccess &&
                            validationErrors.length === 0 && (
                              <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                                <div className="flex items-center">
                                  <Icon
                                    className="text-success-600 mr-2"
                                    icon="hugeicons:checkmark-badge-01"
                                    width={16}
                                  />
                                  <p className="text-sm text-success-800">
                                    All configuration settings are valid!
                                  </p>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Navigation for configuration phase */}
                  <div className="flex justify-between pt-4">
                    <Button
                      isDisabled={currentStep === 0}
                      startContent={
                        <Icon icon="hugeicons:arrow-left-01" width={16} />
                      }
                      variant="ghost"
                      onPress={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>

                    {deploymentScenario === "combined" && currentStep < 3 ? (
                      <Button
                        color="primary"
                        endContent={
                          <Icon icon="hugeicons:arrow-right-01" width={16} />
                        }
                        isDisabled={runtimeEnvironment === ""}
                        onPress={() => setCurrentStep(currentStep + 1)}
                      >
                        Next
                      </Button>
                    ) : null}

                    {deploymentScenario === "independent" && currentStep < 2 ? (
                      <Button
                        color="primary"
                        endContent={
                          <Icon icon="hugeicons:arrow-right-01" width={16} />
                        }
                        isDisabled={runtimeEnvironment === ""}
                        onPress={() => setCurrentStep(currentStep + 1)}
                      >
                        Next
                      </Button>
                    ) : null}

                    {(deploymentScenario === "combined" && currentStep === 3) ||
                    (deploymentScenario === "independent" &&
                      currentStep === 2) ? (
                      <Button
                        color="success"
                        endContent={
                          !isLoading ? (
                            <Icon icon="hugeicons:tick-01" width={16} />
                          ) : null
                        }
                        isDisabled={
                          !validationSuccess || validationErrors.length > 0
                        }
                        isLoading={isLoading}
                        onPress={handleSubmit}
                      >
                        {isLoading ? "Setting up..." : "Complete Setup"}
                      </Button>
                    ) : null}
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
        <Ripple mainCircleOpacity={0.34} numCircles={13} />
      </div>
    </main>
  );
}
