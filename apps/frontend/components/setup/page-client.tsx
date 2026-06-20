"use client";
import {
  Alert,
  Button,
  Card,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  ProgressBar,
  Select,
  Separator,
  TextField,
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
  logging: {
    level: string;
    format: string;
  };
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
  const [setupResult, setSetupResult] = useState<any>(null);
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
    logging: {
      level: "info",
      format: "text",
    },
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
        `Backend detection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
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
        `Error checking backend status: ${err instanceof Error ? err.message : "Unknown error"}`,
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
      setSetupResult(result);
      setSetupComplete(true);
      setSetupPhase("complete");
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
    if (deploymentScenario === "combined") return 4;
    if (deploymentScenario === "independent") return 3;
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
        <div className="z-10 w-full max-w-2xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-success/20 p-6 ring-1 ring-success/50">
              <Icon
                className="text-success text-6xl drop-shadow-lg animate-pulse"
                icon="hugeicons:checkmark-badge-01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Setup Complete!
            </h1>
            <p className="text-gray-400 text-lg">
              Your JustFlow instance has been successfully configured.
            </p>
          </div>

          {setupResult ? (
            <Card className="bg-surface/50 backdrop-blur-sm border-success/20 text-left w-full">
              <Card.Header>
                <h3 className="text-lg font-semibold">Important Credentials</h3>
              </Card.Header>
              <Card.Content className="space-y-4">
                <Alert status={"warning"}>
                  <Alert.Indicator></Alert.Indicator>
                  <Alert.Content>
                    <Alert.Title>{"Save these credentials!"}</Alert.Title>
                    <Alert.Description>
                      {
                        "These secrets are only shown once. Please save them in a secure location."
                      }
                    </Alert.Description>
                  </Alert.Content>
                </Alert>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Shared Runner Secret</p>
                  <code className="w-full block p-3 bg-black/50">
                    {setupResult.shared_runner_secret}
                  </code>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center justify-center gap-2">
                  <Icon
                    className="text-success text-xl animate-spin"
                    icon="hugeicons:loading-03"
                  />
                  <span className="text-sm text-gray-300">
                    Backend restarting and verifying configuration...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              className="font-bold shadow-lg shadow-success/20"
              size="lg"
              // eslint-disable-next-line no-undef
              onPress={() => window.location.reload()}
            >
              Go to Dashboard
              {<Icon icon="hugeicons:arrow-right-01" />}
            </Button>
          </div>
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
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-accent/10 ring-1 ring-accent/20">
            <Icon
              className="text-3xl text-accent"
              icon="hugeicons:settings-01"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Setup Just<span className="text-accent">Flow</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            {setupPhase === "backend-detection"
              ? "Let's connect your backend service"
              : "Configure your environment settings"}
          </p>
        </div>

        <Card className="w-full border-none shadow-2xl bg-surface/60 backdrop-blur-md">
          {setupPhase === "configuration" && (
            <div className="px-6 pt-6 pb-2">
              <div className="flex justify-between text-sm mb-2 text-gray-400">
                <span>
                  Configuration Step {currentStep} of {getTotalSteps()}
                </span>
                <span>{Math.round(getProgress())}%</span>
              </div>
              <ProgressBar
                aria-label="Setup progress"
                className="max-w-full"
                color="accent"
                size="sm"
                value={getProgress()}
              />
            </div>
          )}

          <Card.Header className="px-8 pt-8 pb-0">
            <div className="w-full">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {setupPhase === "backend-detection" && (
                  <>
                    <Icon className="text-accent" icon="hugeicons:search-01" />
                    Find Backend
                  </>
                )}
                {setupPhase === "configuration" && (
                  <>
                    <Icon
                      className="text-accent"
                      icon="hugeicons:sliders-horizontal"
                    />
                    {deploymentScenario === "combined"
                      ? currentStep === 1
                        ? "Backend Settings"
                        : currentStep === 2
                          ? "Database Connection"
                          : currentStep === 3
                            ? "Logging Configuration"
                            : "Review & Validate"
                      : currentStep === 1
                        ? "Frontend Settings"
                        : currentStep === 2
                          ? "Logging Configuration"
                          : "Review & Validate"}
                  </>
                )}
              </h2>
              <Separator className="my-4" />
            </div>
          </Card.Header>

          <Card.Content className="px-8 pb-8 pt-2 space-y-6">
            {error && (
              <Alert status={"danger"}>
                <Alert.Indicator></Alert.Indicator>
                <Alert.Content>
                  <Alert.Title>{"Error"}</Alert.Title>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}

            {/* ============================================================ */}
            {/* PHASE 1: Backend Detection */}
            {/* ============================================================ */}
            {setupPhase === "backend-detection" && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <Button
                    className="h-auto py-6 px-4 flex flex-col items-center gap-3 border-2 border-dashed border-default hover:border-accent hover:bg-accent/5 transition-all"
                    isDisabled={isDetectingBackends}
                    variant="ghost"
                    onPress={async () => {
                      setIsDetectingBackends(true);
                      await detectBackends();
                      setIsDetectingBackends(false);
                    }}
                  >
                    <div
                      className={`p-3 rounded-full ${isDetectingBackends ? "bg-accent/20 animate-pulse" : "bg-accent/10"}`}
                    >
                      <Icon
                        className={`text-2xl text-accent ${isDetectingBackends ? "animate-spin" : ""}`}
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
                          className="w-full justify-between h-14 px-4 bg-surface-secondary hover:bg-surface-tertiary border border-default"
                          isPending={
                            isCheckingBackendStatus &&
                            detectedBackendUrl === backend
                          }
                          variant="tertiary"
                          onPress={() => selectBackendAndCheckStatus(backend)}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className="text-success text-xl"
                              icon="hugeicons:server-01"
                            />
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{backend}</span>
                              <span className="text-xs text-success">
                                Online & Ready
                              </span>
                            </div>
                          </div>
                          <Icon
                            className="text-muted"
                            icon="hugeicons:arrow-right-01"
                          />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-default" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-gray-500">
                      Or connect manually
                    </span>
                  </div>
                </div>

                <TextField value={customBackendUrl}>
                  <Label>{"Backend URL"}</Label>
                  <InputGroup>
                    <InputGroup.Prefix>
                      {<Icon className="text-muted" icon="hugeicons:link-01" />}
                    </InputGroup.Prefix>
                    <Input
                      placeholder="http://localhost:8080"
                      onChange={(e) => setCustomBackendUrl(e.target.value)}
                    />
                    <InputGroup.Suffix>
                      {
                        <Button
                          isPending={isCheckingBackendStatus}
                          size="sm"
                          variant="secondary"
                          onPress={() =>
                            customBackendUrl &&
                            selectBackendAndCheckStatus(customBackendUrl)
                          }
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:arrow-right-01" />
                        </Button>
                      }
                    </InputGroup.Suffix>
                  </InputGroup>
                </TextField>
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
                    <Alert status={"accent"}>
                      <Alert.Indicator></Alert.Indicator>
                      <Alert.Content>
                        <Alert.Title>{"Backend Detected"}</Alert.Title>
                        <Alert.Description>
                          {
                            "We've automatically detected your backend configuration."
                          }
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 h-full">
                        <p className="text-sm font-medium text-gray-400">
                          Detected Port
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-secondary border border-default h-[80px]">
                          <Icon
                            className="text-warning text-xl"
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
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-secondary border border-default h-[80px]">
                          <Icon
                            className="text-accent-500 text-xl"
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
                    <TextField value={setupData.frontend_url}>
                      <Label>{"Frontend URL"}</Label>
                      <InputGroup>
                        <InputGroup.Prefix>
                          {
                            <Icon
                              className="text-muted"
                              icon="hugeicons:globe-02"
                            />
                          }
                        </InputGroup.Prefix>
                        <Input
                          placeholder="http://localhost:3000"
                          onChange={(e) =>
                            handleInputChange("frontend_url", e.target.value)
                          }
                        />
                      </InputGroup>
                      <Description>
                        {"The URL where you access this application"}
                      </Description>
                    </TextField>
                  </div>
                )}

                {/* Step 2: Database Configuration (Combined only) */}
                {currentStep === 2 && deploymentScenario === "combined" && (
                  <div className="space-y-4 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <TextField value={setupData.database.server}>
                        <Label>{"Server Host"}</Label>
                        <InputGroup>
                          <Input
                            placeholder="localhost"
                            onChange={(e) =>
                              handleInputChange(
                                "database.server",
                                e.target.value,
                              )
                            }
                          />
                        </InputGroup>
                      </TextField>
                      <TextField value={setupData.database.port.toString()}>
                        <Label>{"Port"}</Label>
                        <InputGroup>
                          <Input
                            placeholder="5432"
                            type="number"
                            onChange={(e) =>
                              handleInputChange(
                                "database.port",
                                Number.parseInt(e.target.value) || 5432,
                              )
                            }
                          />
                        </InputGroup>
                      </TextField>
                    </div>
                    <TextField value={setupData.database.name}>
                      <Label>{"Database Name"}</Label>
                      <InputGroup>
                        <InputGroup.Prefix>
                          {
                            <Icon
                              className="text-muted"
                              icon="hugeicons:database-01"
                            />
                          }
                        </InputGroup.Prefix>
                        <Input
                          placeholder="justflow"
                          onChange={(e) =>
                            handleInputChange("database.name", e.target.value)
                          }
                        />
                      </InputGroup>
                    </TextField>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField value={setupData.database.user}>
                        <Label>{"Username"}</Label>
                        <InputGroup>
                          <InputGroup.Prefix>
                            {
                              <Icon
                                className="text-muted"
                                icon="hugeicons:user"
                              />
                            }
                          </InputGroup.Prefix>
                          <Input
                            placeholder="postgres"
                            onChange={(e) =>
                              handleInputChange("database.user", e.target.value)
                            }
                          />
                        </InputGroup>
                      </TextField>
                      <TextField value={setupData.database.password}>
                        <Label>{"Password"}</Label>
                        <InputGroup>
                          <InputGroup.Prefix>
                            {
                              <Icon
                                className="text-muted"
                                icon="hugeicons:lock-key"
                              />
                            }
                          </InputGroup.Prefix>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            onChange={(e) =>
                              handleInputChange(
                                "database.password",
                                e.target.value,
                              )
                            }
                          />
                        </InputGroup>
                      </TextField>
                    </div>
                  </div>
                )}

                {/* Step 3 (Combined) or Step 2 (Independent): Logging Configuration */}
                {((deploymentScenario === "combined" && currentStep === 3) ||
                  (deploymentScenario === "independent" &&
                    currentStep === 2)) && (
                  <div className="gap-4 flex flex-col">
                    <Select
                      placeholder="Select log level"
                      selectedKey={setupData.logging.level}
                      onSelectionChange={(key) =>
                        handleInputChange("logging.level", String(key ?? ""))
                      }
                    >
                      <Label>{"Log Level"}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item
                            key="debug"
                            id="debug"
                            textValue="Debug"
                          >
                            Debug
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item key="info" id="info" textValue="Info">
                            Info
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="warn"
                            id="warn"
                            textValue="Warning"
                          >
                            Warning
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="error"
                            id="error"
                            textValue="Error"
                          >
                            Error
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>

                    <Select
                      placeholder="Select log format"
                      selectedKey={setupData.logging.format}
                      onSelectionChange={(key) =>
                        handleInputChange("logging.format", String(key ?? ""))
                      }
                    >
                      <Label>{"Log Format"}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item
                            key="text"
                            id="text"
                            textValue="Text (Console friendly)"
                          >
                            Text (Console friendly)
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="json"
                            id="json"
                            textValue="JSON (Machine friendly)"
                          >
                            JSON (Machine friendly)
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                )}

                {/* Final Step: Validation */}
                {((deploymentScenario === "combined" && currentStep === 4) ||
                  (deploymentScenario === "independent" &&
                    currentStep === 3)) && (
                  <div className="space-y-6">
                    <div className="bg-surface-secondary rounded-xl p-4 space-y-3 border border-default">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Icon
                          className="text-accent"
                          icon="hugeicons:file-validation"
                        />
                        Configuration Summary
                      </h3>
                      <Separator />
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

                        <dt className="text-gray-500">Log Level</dt>
                        <dd className="font-mono text-right capitalize">
                          {setupData.logging.level}
                        </dd>
                        <dt className="text-gray-500">Log Format</dt>
                        <dd className="font-mono text-right capitalize">
                          {setupData.logging.format}
                        </dd>
                      </dl>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full font-medium"
                        isPending={validationLoading}
                        variant={validationSuccess ? "tertiary" : "primary"}
                        onPress={validateSetupDataLocal}
                      >
                        {!validationLoading && (
                          <Icon
                            icon={
                              validationSuccess
                                ? "hugeicons:checkmark-badge-01"
                                : "hugeicons:play"
                            }
                          />
                        )}
                        {validationSuccess
                          ? "Configuration Validated"
                          : "Test Configuration"}
                      </Button>

                      {validationErrors.length > 0 && (
                        <Alert status={"danger"}>
                          <Alert.Indicator></Alert.Indicator>
                          <Alert.Content>
                            <Alert.Title>{"Validation Failed"}</Alert.Title>
                            <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                              {validationErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </Alert.Content>
                        </Alert>
                      )}

                      {validationInfo.length > 0 && (
                        <Alert status={"accent"}>
                          <Alert.Indicator>
                            {
                              <Icon
                                className="text-accent text-xl"
                                icon="hugeicons:info-circle"
                              />
                            }
                          </Alert.Indicator>
                          <Alert.Content>
                            <Alert.Title>{"Setup Information"}</Alert.Title>
                            <Alert.Description>
                              {validationInfo.join(" ")}
                            </Alert.Description>
                          </Alert.Content>
                        </Alert>
                      )}

                      {validationSuccess && (
                        <Alert status={"success"}>
                          <Alert.Indicator></Alert.Indicator>
                          <Alert.Content>
                            <Alert.Title>{"Ready to Deploy"}</Alert.Title>
                            <Alert.Description>
                              {
                                "All checks passed. You can now complete the setup."
                              }
                            </Alert.Description>
                          </Alert.Content>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-default">
                  {currentStep === 1 ? (
                    <Button
                      variant="danger"
                      onPress={() => {
                        setSetupPhase("backend-detection");
                        setDeploymentScenario(null);
                        setError("");
                      }}
                    >
                      {<Icon icon="hugeicons:arrow-left-01" />}
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      onPress={() => setCurrentStep(currentStep - 1)}
                    >
                      {<Icon icon="hugeicons:arrow-left-01" />}
                      Back
                    </Button>
                  )}

                  {/* Next / Complete Buttons */}
                  {(deploymentScenario === "combined" && currentStep < 4) ||
                  (deploymentScenario === "independent" && currentStep < 3) ? (
                    <Button
                      onPress={() => setCurrentStep(currentStep + 1)}
                      variant="primary"
                    >
                      Next Step
                      {<Icon icon="hugeicons:arrow-right-01" />}
                    </Button>
                  ) : (
                    <Button
                      className="font-bold shadow-lg shadow-success/20"
                      isDisabled={
                        !validationSuccess || validationErrors.length > 0
                      }
                      isPending={isLoading}
                      onPress={handleSubmit}
                    >
                      Complete Setup
                      {<Icon icon="hugeicons:rocket" />}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card.Content>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>JustFlow Setup Wizard v3.0</p>
        </div>
      </div>
      <Ripple mainCircleOpacity={0.15} numCircles={8} />
    </main>
  );
}
