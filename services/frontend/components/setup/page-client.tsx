"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Spacer,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

import { setupApi } from "@/lib/api";

import { Ripple } from "../magicui/ripple";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string>("");
  const [validationLoading, setValidationLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false);
  const [setupData, setSetupData] = useState<SetupData>({
    backend_url: "http://localhost:8080",
    backend_port: 8080,
    database: {
      server: "localhost",
      port: 5432,
      name: "exflow",
      user: "postgres",
      password: "",
    },
    frontend_url: "http://localhost:4000",
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const status = await setupApi.checkStatus();

      if (status.is_setup) {
        setSetupComplete(true);
      }
    } catch {
      // Backend might not be running yet, that's okay
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
        // Wait for backend to restart and then redirect
        setTimeout(() => {
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-undef
            window.location.href = "/";
          }
        }, 5000); // Increased timeout to allow for restart
      } else {
        setSetupComplete(true);
        // Reload page to pick up new configuration
        setTimeout(() => {
          if (typeof window !== "undefined") {
            // eslint-disable-next-line no-undef
            window.location.reload();
          }
        }, 2000);
      }
    } catch (error: any) {
      setError("Setup failed: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (setupComplete) {
    return (
      <main className="h-screen flex flex-col items-center justify-center gap-8 px-4">
        <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
          <Icon
            className="text-green-500 text-6xl mb-4"
            icon="hugeicons:checkmark-badge-01"
          />
          <p className="z-10 whitespace-pre-wrap text-center text-3xl font-semibold tracking-tighter text-white mb-2">
            Setup Complete!
          </p>
          <p className="z-10 text-center text-lg text-gray-300 mb-4">
            Your exFlow application is now configured.
          </p>
          <div className="z-10 text-center text-sm text-gray-400 mb-6 max-w-md">
            <p className="mb-2">
              The backend is restarting with your new configuration.
            </p>
            <p className="mb-2">
              <strong className="text-yellow-400">Important:</strong> Please
              restart your frontend development server to load the new .env
              file:
            </p>
            <div className="bg-gray-800 p-3 rounded text-left font-mono text-xs">
              <p>1. Stop the current frontend server (Ctrl+C)</p>
              <p>
                2. Run: <code className="text-blue-300">pnpm run dev</code>
              </p>
              <p>
                3. Visit:{" "}
                <code className="text-blue-300">http://localhost:4000</code>
              </p>
            </div>
          </div>
          <Spacer y={4} />
          <Button
            color="primary"
            endContent={<Icon icon="hugeicons:arrow-right-01" width={20} />}
            onClick={() => {
              if (typeof window !== "undefined") {
                // eslint-disable-next-line no-undef
                window.location.href = "/";
              }
            }}
          >
            Continue to Dashboard
          </Button>
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
            Setup <span className="text-primary font-bold">exFlow</span>
          </p>
          <p className="text-center text-gray-300 mb-8">
            Configure your application settings
          </p>

          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-semibold">
                  {currentStep === 0 && "Important Information"}
                  {currentStep === 1 && "Backend Configuration"}
                  {currentStep === 2 && "Database Configuration"}
                  {currentStep === 3 && "Frontend Configuration"}
                </h3>
                <span className="text-sm text-gray-500">
                  Step {currentStep + 1} of 4
                </span>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {currentStep === 0 && (
                <>
                  <div>
                    <p className="text-sm">
                      The Backend started an endpoint on port{" "}
                      <span className="text-primary font-bold">8080</span>. This
                      is the default backend port used during setup and{" "}
                      <span className="text-primary font-bold">
                        has to be accessible from the frontend
                      </span>
                      . During the setup you can change the backend port.
                    </p>
                    <Divider className="my-4" />
                    <p className="mb-2">Docker Environments:</p>
                    <p className="text-sm">
                      Please make sure that you are using{" "}
                      <span className="text-primary font-bold">volumes</span>{" "}
                      for your Docker containers.{" "}
                      <span className="text-primary font-bold">
                        Otherwise the configuration may not persist across
                        container restarts
                      </span>
                      .
                    </p>
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <Input
                    description="Port on which the backend server will start. Keep the default value if exFlow is running inside Docker."
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
                </>
              )}

              {currentStep === 2 && (
                <>
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
                    placeholder="exflow"
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

              {currentStep === 3 && (
                <>
                  <Input
                    description="URL used by the frontend to reach the backend. Keep the default value if exFlow is running inside Docker."
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
                      <li>Backend Port: {setupData.backend_port}</li>
                      <li>
                        Database: {setupData.database.user}@
                        {setupData.database.server}:{setupData.database.port}/
                        {setupData.database.name}
                      </li>
                      <li>Frontend URL: {setupData.frontend_url}</li>
                      <li>Frontend URL to Backend: {setupData.backend_url}</li>
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

                      {validationSuccess && validationErrors.length === 0 && (
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

              <div className="flex justify-between pt-4">
                <Button
                  isDisabled={currentStep === 0}
                  startContent={
                    <Icon icon="hugeicons:arrow-left-01" width={16} />
                  }
                  variant="ghost"
                  onPress={prevStep}
                >
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    color="primary"
                    endContent={
                      <Icon icon="hugeicons:arrow-right-01" width={16} />
                    }
                    onPress={nextStep}
                  >
                    Next
                  </Button>
                ) : (
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
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        <Ripple mainCircleOpacity={0.34} numCircles={13} />
      </div>
    </main>
  );
}
