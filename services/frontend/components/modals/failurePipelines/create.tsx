"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ErrorCard from "@/components/error/ErrorCard";
import CreateFlowFailurePipeline from "@/lib/fetch/flow/POST/AddFlowFailurePipeline";

export default function CreateFailurePipelineModal({
  flow,
  disclosure,
}: {
  flow: any;
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();

  // create modal
  const { isOpen, onOpenChange } = disclosure;

  const [name, setName] = useState("");
  const [execParallel, setExecParallel] = useState(false);

  // loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const execStrategySelected = (e: any) => {
    if (e.currentKey === "parallel") {
      setExecParallel(true);
    } else {
      setExecParallel(false);
    }
  };

  async function createFailurePipeline() {
    setIsLoading(true);

    const response = (await CreateFlowFailurePipeline(
      flow.id,
      name,
      execParallel,
    )) as any;

    if (!response) {
      setError(true);
      setErrorText("Failed to create failure pipeline");
      setErrorMessage("Failed to create failure pipeline");
      setIsLoading(false);

      return;
    }

    if (response.success) {
      router.refresh();
      onOpenChange();
      setName("");
      setError(false);
      setErrorText("");
      setErrorMessage("");
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Flow",
        description: "Failed to create failure pipeline",
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  }

  function cancel() {
    setName("");
    setIsLoading(false);
    onOpenChange();
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        size="3xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {() => (
            <>
              <ModalHeader className="flex flex-col items-start">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">
                    Create new Failure Pipelines
                  </p>
                  <p className="text-sm text-default-500">
                    Failure Pipelines can be assigned to actions and will
                    trigger a set of actions when the assigned action fails.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Name"
                    type="name"
                    value={name}
                    variant="bordered"
                    onValueChange={setName}
                  />
                  <Select
                    label="Execution Strategy"
                    placeholder="Select the execution strategy"
                    selectedKeys={[execParallel ? "parallel" : "sequential"]}
                    variant="bordered"
                    onSelectionChange={execStrategySelected}
                  >
                    <SelectItem key="sequential">Sequential</SelectItem>
                    <SelectItem key="parallel">Parallel</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onPress={cancel}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  onPress={createFailurePipeline}
                >
                  Create Failure Pipeline
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
