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
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import RotateAutoJoinToken from "@/lib/fetch/project/PUT/RotateAutoJoinToken";

export default function RotateAutoJoinTokenModal({
  disclosure,
  projectID,
}: {
  disclosure: UseDisclosureReturn;
  projectID: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function handleRotateToken() {
    setIsLoading(true);

    const response = (await RotateAutoJoinToken(projectID)) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to rotate token");
      setErrorMessage("Failed to rotate token");
      addToast({
        title: "Token",
        description: "Failed to rotate token",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      router.refresh();
      onOpenChange();
      addToast({
        title: "Token",
        description: "Token rotated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      addToast({
        title: "Token",
        description: "Failed to rotate token",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    After rotating the auto-join token, all existing runners
                    using this token will be unable to join the project. You
                    will need to update the runners with the new token to allow
                    them to join again.
                  </p>
                </div>
              </ModalHeader>
              {error && (
                <ModalBody>
                  <ErrorCard error={errorText} message={errorMessage} />
                </ModalBody>
              )}
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
                  color="warning"
                  isLoading={isLoading}
                  startContent={
                    <Icon icon="hugeicons:rotate-clockwise" width={18} />
                  }
                  onPress={handleRotateToken}
                >
                  Rotate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
