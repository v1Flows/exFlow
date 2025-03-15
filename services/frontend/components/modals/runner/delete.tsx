"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import GetRunnerFlowLinks from "@/lib/fetch/runner/GetRunnerFlowLinks";
import DeleteProjectRunner from "@/lib/fetch/project/DELETE/DeleteRunner";
import ErrorCard from "@/components/error/ErrorCard";

export default function DeleteRunnerModal({
  disclosure,
  runner,
}: {
  disclosure: UseDisclosureReturn;
  runner: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [flowLinks, setFlowLinks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    runner.id && getFlowLinks();
  }, [runner]);

  async function getFlowLinks() {
    const flows = (await GetRunnerFlowLinks({ runnerId: runner.id })) as any;

    if (!flows) {
      setError(true);
      setErrorText("Failed to fetch runner flow links");
      setErrorMessage("An error occurred while fetching the runner flow links");
      router.refresh();
      addToast({
        title: "Runner",
        description: "Failed to fetch runner flow links",
        color: "danger",
        variant: "flat",
      });
    }

    if (flows.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      setFlowLinks(flows.data.flows);
    } else {
      setError(true);
      setErrorText(flows.error);
      setErrorMessage(flows.message);
    }
  }

  async function deleteRunner() {
    setIsLoading(true);

    const response = (await DeleteProjectRunner(runner.id)) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete runner");
      setErrorMessage("An error occurred while deleting the runner");
      addToast({
        title: "Runner",
        description: "Failed to delete runner",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Runner",
        description: "Runner deleted successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Runner",
        description: "Failed to create runner",
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  }

  return (
    <>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You are about to delete the following runner which{" "}
                    <span className="font-bold">cannot be undone</span>
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Snippet hideCopyButton hideSymbol>
                  <span>
                    Name:
                    {runner.name}
                  </span>
                  <span>
                    ID:
                    {runner.id}
                  </span>
                </Snippet>
                {flowLinks.length > 0 && (
                  <>
                    <Divider />
                    <p>
                      The runner is assigned to the following flows which will
                      need{" "}
                      <span className="font-bold text-warning">
                        Maintenance
                      </span>{" "}
                      after the runner got deleted:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {flowLinks.map((flow: any) => (
                        <Chip
                          key={flow.id}
                          color="warning"
                          radius="sm"
                          variant="flat"
                        >
                          {flow.name}
                        </Chip>
                      ))}
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isLoading}
                  variant="solid"
                  onPress={deleteRunner}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
