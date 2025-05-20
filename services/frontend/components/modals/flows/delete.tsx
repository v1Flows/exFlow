"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import DeleteFlow from "@/lib/fetch/flow/DELETE/DeleteFlow";

export default function DeleteFlowModal({
  disclosure,
  flow,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function deleteFlow() {
    setIsLoading(true);
    const res = (await DeleteFlow(flow.id)) as any;

    if (!res) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete flow");
      setErrorMessage("Failed to delete flow");
      addToast({
        title: "Flow",
        description: "Failed to delete flow",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      router.refresh();
      onOpenChange();
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Flow deleted successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "Failed to delete flow",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        size="lg"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You are about to delete the following flow which{" "}
                    <span className="font-bold">cannot be undone</span>
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Snippet hideCopyButton hideSymbol>
                  <span>Name: {flow.name}</span>
                  <span>ID: {flow.id}</span>
                </Snippet>
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
                  color="danger"
                  isLoading={isLoading}
                  startContent={<Icon icon="hugeicons:delete-02" width={18} />}
                  variant="solid"
                  onPress={deleteFlow}
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
