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
import { Icon } from "@iconify/react";

import AdminDeleteUser from "@/lib/fetch/admin/DELETE/delete_user";
import ErrorCard from "@/components/error/ErrorCard";

export default function AdminDeleteUserModal({
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
    const response = (await AdminDeleteUser(user.id)) as any;

    if (response.success) {
      router.refresh();
      onOpenChange();
      setError(false);
      setErrorMessage("");
      setErrorText("");
      addToast({
        title: "User",
        description: "User deleted successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorMessage(response.message);
      setErrorText(response.error);
      addToast({
        title: "User",
        description: "Failed to delete user",
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
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You are about to delete your account which{" "}
                    <span className="font-bold">cannot be undone</span>.
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
                  <span>Name: {user.username}</span>
                  <span>Email: {user.email}</span>
                  <span>ID: {user.id}</span>
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
