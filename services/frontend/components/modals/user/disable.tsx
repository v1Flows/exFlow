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
  Spacer,
} from "@heroui/react";
import React from "react";

import ErrorCard from "@/components/error/ErrorCard";
import { deleteSession } from "@/lib/auth/deleteSession";
import DisableUser from "@/lib/fetch/user/PUT/disable";

export default function DisableUserModal({
  disclosure,
  user,
}: {
  disclosure: UseDisclosureReturn;
  user: any;
}) {
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function disableUser() {
    setIsLoading(true);
    const response = (await DisableUser()) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to disable user");
      setErrorMessage("Failed to disable user");
      addToast({
        title: "User",
        description: "Failed to disable user",
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
      onOpenChange();
      addToast({
        title: "User",
        description: "User disabled successfully",
        color: "success",
        variant: "flat",
      });
      deleteSession();
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "User",
        description: "Failed to disable user",
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
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You are about to disable your account which can only be
                    reverted by an support request.
                    <Spacer y={1} />
                    You will be logged out and will not be able to log in again.
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
                    {user.username}
                  </span>
                  <span>
                    Email:
                    {user.email}
                  </span>
                  <span>
                    ID:
                    {user.id}
                  </span>
                </Snippet>
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isLoading}
                  variant="solid"
                  onPress={disableUser}
                >
                  Disable Account
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
