"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Form,
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
import React, { useState } from "react";
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
  const [inApikey, setInApikey] = useState("");
  const [inRunnerId, setInRunnerId] = useState("");

  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await AddRunner(
      project.id ? project.id : "none",
      data.name.toString(),
      shared_runner,
    )) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to create runner");
      setApiErrorMessage("An error occurred while creating the runner");
      addToast({
        title: "Runner",
        description: "Failed to create runner",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      onOpenChange();
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");

      // set variables
      setInApikey(res.data.token);
      setInRunnerId(res.data.runner.id);
      onOpenChangeInstructions();
      router.refresh();
      addToast({
        title: "Runner",
        description: "Runner created successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setApiError(true);
      setApiErrorText(res.error.error);
      setApiErrorMessage(res.error.message);
      addToast({
        title: "Runner",
        description: `Failed to create runner: ${res.error.error}`,
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  };

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
                {apiError && (
                  <ErrorCard error={apiErrorText} message={apiErrorMessage} />
                )}
                <Form
                  className="w-full items-stretch"
                  validationErrors={errors}
                  onSubmit={onSubmit}
                >
                  <div className="flex flex-col gap-4">
                    <Input
                      isRequired
                      label="Name"
                      name="name"
                      placeholder="Enter the runner name"
                      variant="flat"
                    />
                  </div>

                  <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                    <Button
                      color="default"
                      startContent={
                        <Icon icon="hugeicons:cancel-01" width={18} />
                      }
                      type="reset"
                      variant="ghost"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:plus-sign" width={18} />
                      }
                      type="submit"
                    >
                      Create
                    </Button>
                  </div>
                </Form>
              </ModalBody>
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
