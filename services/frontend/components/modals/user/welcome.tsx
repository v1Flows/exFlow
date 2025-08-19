"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Progress,
} from "@heroui/react";
import React, { useState } from "react";

import ErrorCard from "@/components/error/ErrorCard";
import Welcomed from "@/lib/fetch/user/PUT/welcomed";
import VerticalCollapsibleSteps from "@/components/steps/vertical-collapsible-steps";

export default function WelcomeModal({
  disclosure,
}: {
  disclosure: UseDisclosureReturn;
}) {
  const { isOpen, onOpenChange } = disclosure;

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isLoading, setLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    {
      title: "Create a project",
      description:
        "Projects are the foundation of your workflows. They help you organize your flows, invite team members or create runners.",
      details: [
        "Invite team members to collaborate on your project and flows.",
        "Create or assign runners to execute your flows.",
        "Generate API keys for secure and remote access to your project.",
        "View audit logs to track changes and actions.",
      ],
    },
    {
      title: "Create a flow",
      description:
        "Flows are the core functionality of exFlow. They allow you to automate tasks and processes.",
      details: [
        "Specify the actions that will be taken when the flow is triggered.",
        "Set up any conditions or filters to control the flow's behavior.",
        "Define failover pipelines to handle errors or exceptions.",
      ],
    },
    {
      title: "Create actions within the flow",
      description:
        "Actions are the building blocks of your flows. They define what happens when the flow is triggered.",
      details: [
        "Actions are provided by the runner plugins.",
        "Use plugins like terraform, ansible, git and many more to manage your infrastructure.",
        "Create custom actions using the exFlow API to extend functionality.",
      ],
    },
    {
      title: "Enjoy",
      description:
        "Now that you have set up your project and flow, you can start using exFlow and we can't wait to see what you build.",
      details: [
        "Open Source and self-hosted.",
        "Extensible with plugins to fit your needs.",
        "Built with love by the exFlow team.",
      ],
    },
  ];

  async function handleSetWelcomed() {
    setLoading(true);
    setError(false);
    setErrorText("");
    setErrorMessage("");

    // Call the API to set the welcomed status
    const response = (await Welcomed()) as any;

    if (!response) {
      setLoading(false);
      setError(true);
      setErrorText("Failed to set welcomed status");
      setErrorMessage("Failed to set welcomed status");
      addToast({
        title: "Welcome",
        description: "Failed to set welcomed status",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
    } else {
      setLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Welcome",
        description: "Failed to set welcomed status",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal
        isDismissable
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        size="2xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <h1 className="mb-2 text-xl text-center font-medium">
                  Welcome to{" "}
                  <span className="font-bold text-primary">exFlow</span>!
                </h1>
                <p className="text-center text-lg">
                  This is your first time here, so we&apos;ve prepared a short
                  guide to help you get started.
                </p>
                <Progress
                  classNames={{
                    base: "px-0.5 mb-5",
                    label: "text-small",
                    value: "text-small text-default-400",
                  }}
                  label="Steps"
                  maxValue={steps.length - 1}
                  minValue={0}
                  showValueLabel={true}
                  size="md"
                  value={currentStep}
                  valueLabel={`${currentStep + 1} of ${steps.length}`}
                />
                <VerticalCollapsibleSteps
                  currentStep={currentStep}
                  steps={steps}
                  onStepChange={setCurrentStep}
                />
              </ModalBody>
              <ModalFooter>
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    isDisabled
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                  >
                    Back
                  </Button>
                )}
                {currentStep + 1 === steps.length ? (
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:telescope-01" width={18} />
                    }
                    onPress={() => {
                      handleSetWelcomed();
                    }}
                  >
                    Start Exploring
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:forward-02" width={18} />
                    }
                    onPress={() => setCurrentStep(currentStep + 1)}
                  >
                    Next Step
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
