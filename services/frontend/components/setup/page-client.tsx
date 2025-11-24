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
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

import {
  detectBackend,
  checkBackendStatus,
  submitSetupConfiguration,
  validateSetupData,
} from "@/lib/fetch/setup/detectBackend";

import { Ripple } from "../magicui/ripple";

type SetupPhase = "backend-detection" | "configuration" | "complete";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const [error, setError] = useState<string>("");
  const [validationLoading, setValidationLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationInfo, setValidationInfo] = useState<string[]>([]);
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
    // Check backend detection on mount
  }, []);

  // Auto-compute backend URL when backend port changes (combined container only)
  useEffect(() => {
    if (deploymentScenario === "combined" && setupPhase === "configuration") {
      const computedUrl = computeBackendUrlFromPort(setupData.backend_port);

      handleInputChange("backend_url", computedUrl);
    }
  }, [setupData.backend_port, deploymentScenario, setupPhase]);

  // ============================================================
  // PHASE 1: Backend Detection Functions
  // ============================================================

  const detectBackends = async () => {
    setIsDetectingBackends(true);
    try {
      const result = await detectBackend();

      if (result.detected && result.url) {
        setBackendsDetected([result.url]);
        setDetectedBackendUrl(result.url);
      } else {
        setError(
          result.message ||
            "Backend detection failed. Ensure backend is running.",
        );
      }
    } catch (error) {
      setError(
        `Backend detection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsDetectingBackends(false);
    }
  };

  const selectBackendAndCheckStatus = async (backendUrl: string) => {
    setDetectedBackendUrl(backendUrl);
    setIsCheckingBackendStatus(true);
    setError("");

    try {
      const status = await checkBackendStatus(backendUrl);

      if (!status.success) {
        setError(
          status.message ||
            "Could not connect to backend to check setup status",
        );
        setIsCheckingBackendStatus(false);

        return;
      }

      if (status.is_setup) {
        // ✅ Everything is already configured!
        setSetupPhase("complete");
        setSetupComplete(true);
      } else {
        // Auto-detect deployment scenario from backend status
        // If backend config exists but frontend env doesn't: independent backend
        // If neither exists: combined container
        if (status.is_setup && !status.is_setup) {
          setDeploymentScenario("independent");
        } else {
          setDeploymentScenario("combined");
        }

        // Skip scenario selection, go straight to configuration
        setSetupPhase("configuration");
        setCurrentStep(1);
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

  // Auto-compute backend URL from detected hostname and port (combined container only)
  const computeBackendUrlFromPort = (port: number): string => {
    try {
      // Extract hostname from detected backend URL
      // e.g., "http://justflow-backend:8080" -> "justflow-backend"
      const url = new URL(detectedBackendUrl);
      const hostname = url.hostname;

      return `http://${hostname}:${port}`;
    } catch {
      // Fallback if URL parsing fails
      return `http://localhost:${port}`;
    }
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

  const validateSetupDataLocal = async () => {
    setValidationLoading(true);
    setValidationErrors([]);
    setValidationInfo([]);
    setValidationSuccess(false);

    try {
      // Use the detected backend URL for validation, not the global API URL
      const result = await validateSetupData(detectedBackendUrl, setupData);

      if (result.success) {
        setValidationSuccess(result.all_valid);
        setValidationErrors(result.validation_errors);
        setValidationInfo(result.info_messages);
      } else {
        setValidationErrors(result.validation_errors);
        setValidationInfo([]);
        setValidationSuccess(false);
      }
    } finally {
      setValidationLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      const result = await submitSetupConfiguration(
        detectedBackendUrl,
        setupData,
      );

      if (!result.success) {
        throw new Error(result.message || "Setup configuration failed");
      }

      setSetupComplete(true);

      // Auto-refresh page after a short delay to ensure backend is ready
      if (result.backendRestarted) {
        setTimeout(() => {
          // eslint-disable-next-line no-undef
          window.location.reload();
        }, 2000);
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

  // Calculate progress for configuration phase
  const getTotalSteps = () => {
    if (deploymentScenario === "combined") return 3;
    if (deploymentScenario === "independent") return 2;

    return 0;
  };

  const getProgress = () => {
    if (setupPhase === "complete") return 100;
    if (setupPhase === "backend-detection") return 0;
    const total = getTotalSteps();

    return total > 0 ? ((currentStep - 1) / total) * 100 : 0;
  };

  // Show success screen if setup already complete
  if (setupComplete && setupPhase === "complete") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
        <div className="z-10 w-full max-w-lg text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-success-500/20 p-6 ring-1 ring-success-500/50">
              <Icon
                className="text-success-500 text-6xl drop-shadow-lg animate-pulse"
                icon="hugeicons:checkmark-badge-01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Setup Complete!
            </h1>
            <p className="text-gray-400 text-lg">
              Your JustFlow instance is being initialized. Reloading
              dashboard...
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-success-500/10 border border-success-500/20">
              <div className="flex items-center justify-center gap-2">
                <Icon
                  className="text-success-500 text-xl animate-spin"
                  icon="hugeicons:loading-03"
                />
                <span className="text-sm text-gray-300">
                  Backend restarting and verifying configuration...
                </span>
              </div>
            </div>
          </div>

          <Card className="bg-content1/50 backdrop-blur-sm border-success-500/20">
            <CardBody className="py-4 px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success-500/10">
                    <Icon
                      className="text-success-500 text-xl"
                      icon="hugeicons:server-01"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">
                      Connected to Backend
                    </p>
                    <Code
                      className="bg-transparent p-0 text-success-400 font-semibold"
                      size="sm"
                    >
                      {detectedBackendUrl}
                    </Code>
                  </div>
                </div>
                <Button
                  isDisabled
                  color="success"
                  endContent={<Icon icon="hugeicons:arrow-right-01" />}
                  size="sm"
                  variant="flat"
                  // eslint-disable-next-line no-undef
                  onPress={() => window.location.reload()}
                >
                  Reloading...
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
        <Ripple mainCircleOpacity={0.2} numCircles={8} />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative">
      <div className="z-10 w-full max-w-2xl space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Icon
              className="text-3xl text-primary"
              icon="hugeicons:settings-01"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Setup Just<span className="text-primary">Flow</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            {setupPhase === "backend-detection"
              ? "Let's connect your backend service"
              : "Configure your environment settings"}
          </p>
        </div>

        <Card className="w-full border-none shadow-2xl bg-content1/60 backdrop-blur-md">
          {setupPhase === "configuration" && (
            <div className="px-6 pt-6 pb-2">
              <div className="flex justify-between text-sm mb-2 text-gray-400">
                <span>
                  Configuration Step {currentStep} of {getTotalSteps()}
                </span>
                <span>{Math.round(getProgress())}%</span>
              </div>
              <Progress
                aria-label="Setup progress"
                className="max-w-full"
                color="primary"
                size="sm"
                value={getProgress()}
              />
            </div>
          )}

          <CardHeader className="px-8 pt-8 pb-0">
            <div className="w-full">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {setupPhase === "backend-detection" && (
                  <>
                    <Icon className="text-primary" icon="hugeicons:search-01" />
                    Find Backend
                  </>
                )}
                {setupPhase === "configuration" && (
                  <>
                    <Icon
                      className="text-primary"
                      icon="hugeicons:sliders-horizontal"
                    />
                    {deploymentScenario === "combined"
                      ? currentStep === 1
                        ? "Backend Settings"
                        : currentStep === 2
                          ? "Database Connection"
                          : "Review & Validate"
                      : currentStep === 1
                        ? "Frontend Settings"
                        : "Review & Validate"}
                  </>
                )}
              </h2>
              <Divider className="my-4" />
            </div>
          </CardHeader>

          <CardBody className="px-8 pb-8 pt-2 space-y-6">
            {error && (
              <Alert
                color="danger"
                description={error}
                title="Error"
                variant="flat"
              />
            )}

            {/* ============================================================ */}
            {/* PHASE 1: Backend Detection */}
            {/* ============================================================ */}
            {setupPhase === "backend-detection" && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <Button
                    className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-2 border-dashed border-default-300 hover:border-primary hover:bg-primary/5 transition-all"
                    isDisabled={isDetectingBackends}
                    variant="light"
                    onPress={async () => {
                      setIsDetectingBackends(true);
                      await detectBackends();
                      setIsDetectingBackends(false);
                    }}
                  >
                    <div
                      className={`p-3 rounded-full ${isDetectingBackends ? "bg-primary/20 animate-pulse" : "bg-primary/10"}`}
                    >
                      <Icon
                        className={`text-2xl text-primary ${isDetectingBackends ? "animate-spin" : ""}`}
                        icon={
                          isDetectingBackends
                            ? "hugeicons:loading-03"
                            : "hugeicons:ai-scan"
                        }
                      />
                    </div>
                    <div className="text-center">
                      <span className="block font-semibold text-lg">
                        Auto-Detect Backend
                      </span>
                      <span className="text-xs text-gray-500">
                        Scan local environment and Docker containers
                      </span>
                    </div>
                  </Button>

                  {backendsDetected.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider ml-1">
                        Detected Services
                      </p>
                      {backendsDetected.map((backend) => (
                        <Button
                          key={backend}
                          className="w-full justify-between h-14 px-4 bg-content2 hover:bg-content3 border border-default-200"
                          isLoading={
                            isCheckingBackendStatus &&
                            detectedBackendUrl === backend
                          }
                          variant="flat"
                          onPress={() => selectBackendAndCheckStatus(backend)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className="text-success-500 text-xl"
                              icon="hugeicons:server-01"
                            />
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{backend}</span>
                              <span className="text-xs text-success-500">
                                Online & Ready
                              </span>
                            </div>
                          </div>
                          <Icon
                            className="text-default-400"
                            icon="hugeicons:arrow-right-01"
                          />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-default-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-gray-500">
                      Or connect manually
                    </span>
                  </div>
                </div>

                <Input
                  endContent={
                    <Button
                      isIconOnly
                      color="primary"
                      isLoading={isCheckingBackendStatus}
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        customBackendUrl &&
                        selectBackendAndCheckStatus(customBackendUrl)
                      }
                    >
                      <Icon icon="hugeicons:arrow-right-01" />
                    </Button>
                  }
                  label="Backend URL"
                  placeholder="http://localhost:8080"
                  startContent={
                    <Icon
                      className="text-default-400"
                      icon="hugeicons:link-01"
                    />
                  }
                  value={customBackendUrl}
                  onChange={(e) => setCustomBackendUrl(e.target.value)}
                />
              </div>
            )}

            {/* ============================================================ */}
            {/* PHASE 2: Configuration Steps */}
            {/* ============================================================ */}
            {setupPhase === "configuration" && deploymentScenario && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                {/* Step 1: Backend Port (Combined) OR Frontend URL (Independent) */}
                {currentStep === 1 && deploymentScenario === "combined" && (
                  <div className="space-y-6">
                    <Alert
                      color="primary"
                      description="We've automatically detected your backend configuration."
                      title="Backend Detected"
                      variant="flat"
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 h-full">
                        <p className="text-sm font-medium text-gray-400">
                          Detected Port
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-content2 border border-default-200 h-[80px]">
                          <Icon
                            className="text-warning-500 text-xl"
                            icon="hugeicons:usb"
                          />
                          <div>
                            <p className="text-lg font-bold">
                              {setupData.backend_port}
                            </p>
                            <p className="text-xs text-gray-500">Read-only</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-400">
                          Computed URL
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-content2 border border-default-200 h-[80px]">
                          <Icon
                            className="text-primary-500 text-xl"
                            icon="hugeicons:link-01"
                          />
                          <div className="overflow-hidden">
                            <p className="text-sm font-mono truncate">
                              {computeBackendUrlFromPort(
                                setupData.backend_port,
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Auto-generated
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && deploymentScenario === "independent" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Since you&apos;re running the frontend independently, we
                      need to know where it&apos;s hosted to configure CORS
                      properly.
                    </p>
                    <Input
                      description="The URL where you access this application"
                      label="Frontend URL"
                      labelPlacement="outside"
                      placeholder="http://localhost:3000"
                      startContent={
                        <Icon
                          className="text-default-400"
                          icon="hugeicons:globe-02"
                        />
                      }
                      value={setupData.frontend_url}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("frontend_url", e.target.value)
                      }
                    />
                  </div>
                )}

                {/* Step 2: Database Configuration (Combined only) */}
                {currentStep === 2 && deploymentScenario === "combined" && (
                  <div className="space-y-4 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Server Host"
                        labelPlacement="outside"
                        placeholder="localhost"
                        value={setupData.database.server}
                        variant="bordered"
                        onChange={(e) =>
                          handleInputChange("database.server", e.target.value)
                        }
                      />
                      <Input
                        label="Port"
                        labelPlacement="outside"
                        placeholder="5432"
                        type="number"
                        value={setupData.database.port.toString()}
                        variant="bordered"
                        onChange={(e) =>
                          handleInputChange(
                            "database.port",
                            Number.parseInt(e.target.value) || 5432,
                          )
                        }
                      />
                    </div>
                    <Input
                      label="Database Name"
                      labelPlacement="outside"
                      placeholder="justflow"
                      startContent={
                        <Icon
                          className="text-default-400"
                          icon="hugeicons:database-01"
                        />
                      }
                      value={setupData.database.name}
                      variant="bordered"
                      onChange={(e) =>
                        handleInputChange("database.name", e.target.value)
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Username"
                        labelPlacement="outside"
                        placeholder="postgres"
                        startContent={
                          <Icon
                            className="text-default-400"
                            icon="hugeicons:user"
                          />
                        }
                        value={setupData.database.user}
                        variant="bordered"
                        onChange={(e) =>
                          handleInputChange("database.user", e.target.value)
                        }
                      />
                      <Input
                        label="Password"
                        labelPlacement="outside"
                        placeholder="••••••••"
                        startContent={
                          <Icon
                            className="text-default-400"
                            icon="hugeicons:lock-key"
                          />
                        }
                        type="password"
                        value={setupData.database.password}
                        variant="bordered"
                        onChange={(e) =>
                          handleInputChange("database.password", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Final Step: Validation */}
                {((deploymentScenario === "combined" && currentStep === 3) ||
                  (deploymentScenario === "independent" &&
                    currentStep === 2)) && (
                  <div className="space-y-6">
                    <div className="bg-content2 rounded-xl p-4 space-y-3 border border-default-200">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Icon
                          className="text-primary"
                          icon="hugeicons:file-validation"
                        />
                        Configuration Summary
                      </h3>
                      <Divider />
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500">Backend URL</dt>
                        <dd className="font-mono text-right truncate">
                          {setupData.backend_url}
                        </dd>

                        {deploymentScenario === "combined" && (
                          <>
                            <dt className="text-gray-500">Database Host</dt>
                            <dd className="font-mono text-right">
                              {setupData.database.server}:
                              {setupData.database.port}
                            </dd>
                            <dt className="text-gray-500">Database Name</dt>
                            <dd className="font-mono text-right">
                              {setupData.database.name}
                            </dd>
                          </>
                        )}

                        {deploymentScenario === "independent" && (
                          <>
                            <dt className="text-gray-500">Frontend URL</dt>
                            <dd className="font-mono text-right">
                              {setupData.frontend_url}
                            </dd>
                          </>
                        )}
                      </dl>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full font-medium"
                        color={validationSuccess ? "success" : "primary"}
                        isLoading={validationLoading}
                        startContent={
                          !validationLoading && (
                            <Icon
                              icon={
                                validationSuccess
                                  ? "hugeicons:checkmark-badge-01"
                                  : "hugeicons:play"
                              }
                            />
                          )
                        }
                        variant={validationSuccess ? "flat" : "solid"}
                        onPress={validateSetupDataLocal}
                      >
                        {validationSuccess
                          ? "Configuration Validated"
                          : "Test Configuration"}
                      </Button>

                      {validationErrors.length > 0 && (
                        <Alert
                          color="danger"
                          title="Validation Failed"
                          variant="flat"
                        >
                          <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                            {validationErrors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </Alert>
                      )}

                      {validationInfo.length > 0 && (
                        <Alert
                          color="primary"
                          description={validationInfo.join(" ")}
                          startContent={
                            <Icon
                              className="text-primary text-xl"
                              icon="hugeicons:info-circle"
                            />
                          }
                          title="Setup Information"
                          variant="flat"
                        />
                      )}

                      {validationSuccess && (
                        <Alert
                          color="success"
                          description="All checks passed. You can now complete the setup."
                          title="Ready to Deploy"
                          variant="flat"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-default-100">
                  {currentStep === 1 ? (
                    <Button
                      color="danger"
                      startContent={<Icon icon="hugeicons:arrow-left-01" />}
                      variant="light"
                      onPress={() => {
                        setSetupPhase("backend-detection");
                        setDeploymentScenario(null);
                        setError("");
                      }}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      startContent={<Icon icon="hugeicons:arrow-left-01" />}
                      variant="light"
                      onPress={() => setCurrentStep(currentStep - 1)}
                    >
                      Back
                    </Button>
                  )}

                  {/* Next / Complete Buttons */}
                  {(deploymentScenario === "combined" && currentStep < 3) ||
                  (deploymentScenario === "independent" && currentStep < 2) ? (
                    <Button
                      color="primary"
                      endContent={<Icon icon="hugeicons:arrow-right-01" />}
                      onPress={() => setCurrentStep(currentStep + 1)}
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      className="font-bold shadow-lg shadow-success/20"
                      color="success"
                      endContent={<Icon icon="hugeicons:rocket" />}
                      isDisabled={
                        !validationSuccess || validationErrors.length > 0
                      }
                      isLoading={isLoading}
                      onPress={handleSubmit}
                    >
                      Complete Setup
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>JustFlow Setup Wizard v3.0</p>
        </div>
      </div>
      <Ripple mainCircleOpacity={0.15} numCircles={8} />
    </main>
  );
}
