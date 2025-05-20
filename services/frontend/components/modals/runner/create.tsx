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
  Snippet,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Icon } from "@iconify/react";

import AddRunner from "@/lib/fetch/runner/POST/AddRunner";
import ErrorCard from "@/components/error/ErrorCard";

export default function CreateRunnerModal({
  disclosure,
  project,
  shared_runner,
}: {
  disclosure: UseDisclosureReturn;
  project: any;
  shared_runner: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  // instructions modal
  const { isOpen: isOpenInstructions, onOpenChange: onOpenChangeInstructions } =
    useDisclosure();
  const [inApikey, setInApikey] = React.useState("");
  const [inRunnerId, setInRunnerId] = React.useState("");

  const [name, setName] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function createRunner() {
    setIsLoading(true);

    const response = (await AddRunner({
      projectId: project.id ? project.id : "none",
      name,
      shared_runner,
    })) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to create runner");
      setErrorMessage("An error occurred while creating the runner");
      addToast({
        title: "Runner",
        description: "Failed to create runner",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setName("");
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");

      // set variables
      setInApikey(response.data.token);
      setInRunnerId(response.data.runner.id);
      onOpenChangeInstructions();
      router.refresh();
      addToast({
        title: "Runner",
        description: "Runner created successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error.error);
      setErrorMessage(response.error.message);
      addToast({
        title: "Runner",
        description: `Failed to create runner: ${response.error.error}`,
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  }

  return (
    <>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Add Runner</p>
                  <p className="text-sm text-default-500">
                    Add a new persistent runner to the project.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  label="Name"
                  labelPlacement="outside"
                  placeholder="Enter the runner name"
                  value={name}
                  variant="flat"
                  onValueChange={setName}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  startContent={<Icon icon="hugeicons:plus-sign" width={18} />}
                  onPress={createRunner}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenInstructions}
        placement="center"
        onOpenChange={onOpenChangeInstructions}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <p className="text-lg font-bold text-success">Runner Created</p>
                <p className="text-sm text-default-500">
                  Enter the informations below in your runner config
                </p>
              </ModalHeader>
              <ModalBody>
                <div>
                  <p className="text-sm font-bold text-default-400">
                    runner_id
                  </p>
                  <Snippet hideSymbol className="w-full">
                    {inRunnerId}
                  </Snippet>
                </div>
                <div>
                  <p className="text-sm font-bold text-default-400">api_key</p>
                  <Snippet hideSymbol className="w-full" codeString={inApikey}>
                    <span>{`${inApikey.slice(0, 30)}...`}</span>
                  </Snippet>
                  <p className="text-sm text-default-400">
                    The Token can always be found on the &quot;Tokens&quot; tab.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="success"
                  startContent={<Icon icon="hugeicons:tick-01" width={18} />}
                  onPress={onClose}
                >
                  <span>Understood</span>
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
