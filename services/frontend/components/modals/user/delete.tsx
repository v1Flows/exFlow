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
import { useRouter } from "next/navigation";
import React from "react";

import ErrorCard from "@/components/error/ErrorCard";
import DeleteUser from "@/lib/fetch/user/DELETE/delete";

export default function DeleteUserModal({
  disclosure,
  user,
}: {
  disclosure: UseDisclosureReturn;
  user: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function deleteUser() {
    setIsLoading(true);
    const response = (await DeleteUser()) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete user");
      setErrorMessage("Failed to delete user");
      addToast({
        title: "User",
        description: "Failed to delete user",
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
        title: "User",
        description: "User deleted successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      addToast({
        title: "User",
        description: "Failed to delete user",
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
                    You are about to delete your account which{" "}
                    <span className="font-bold">cannot be undone</span>
                    .
                    <Spacer y={1} />
                    Any known data related to your account will be removed.
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
                  onPress={deleteUser}
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
