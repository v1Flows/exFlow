"use client";
import {
  Button,
  Modal,
  ProgressBar,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import ErrorCard from "@/components/error/ErrorCard";
import Welcomed from "@/lib/fetch/user/PUT/welcomed";
import VerticalCollapsibleSteps from "@/components/steps/vertical-collapsible-steps";
export default function WelcomeModal({
  disclosure,
}: {
  disclosure: UseOverlayStateReturn;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
        "Flows are the core functionality of JustFlow. They allow you to automate tasks and processes.",
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
        "Create custom actions using the JustFlow API to extend functionality.",
      ],
    },
    {
      title: "Enjoy",
      description:
        "Now that you have set up your project and flow, you can start using JustFlow and we can't wait to see what you build.",
      details: [
        "Open Source and self-hosted.",
        "Extensible with plugins to fit your needs.",
        "Built with love by the JustFlow team.",
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
      toast.danger("Welcome", { description: "Failed to set welcomed status" });
      return;
    }
    if (response.success) {
      setLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
    } else {
      setLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("Welcome", { description: "Failed to set welcomed status" });
    }
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop
          isDismissable
          variant="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog>
              {() => (
                <>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <h1 className="mb-2 text-xl text-center font-medium">
                      Welcome to{" "}
                      <span className="font-bold text-accent">JustFlow</span>!
                    </h1>
                    <p className="text-center text-lg">
                      This is your first time here, so we&apos;ve prepared a
                      short guide to help you get started.
                    </p>
                    <ProgressBar
                      aria-label="Welcome steps"
                      className="mb-5 px-0.5"
                      maxValue={steps.length - 1}
                      minValue={0}
                      size="md"
                      value={currentStep}
                    >
                      <span>Steps</span>
                      <ProgressBar.Track>
                        <ProgressBar.Fill />
                      </ProgressBar.Track>
                    </ProgressBar>
                    <VerticalCollapsibleSteps
                      currentStep={currentStep}
                      steps={steps}
                      onStepChange={setCurrentStep}
                    />
                  </Modal.Body>
                  <Modal.Footer>
                    {currentStep > 0 ? (
                      <Button
                        onPress={() => {
                          setCurrentStep(currentStep - 1);
                        }}
                      >
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back
                      </Button>
                    ) : (
                      <Button isDisabled>
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back
                      </Button>
                    )}
                    {currentStep + 1 === steps.length ? (
                      <Button
                        isPending={isLoading}
                        onPress={() => {
                          handleSetWelcomed();
                        }}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:telescope-01" width={18} />}
                        Start Exploring
                      </Button>
                    ) : (
                      <Button
                        isPending={isLoading}
                        onPress={() => setCurrentStep(currentStep + 1)}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:forward-02" width={18} />}
                        Next Step
                      </Button>
                    )}
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
