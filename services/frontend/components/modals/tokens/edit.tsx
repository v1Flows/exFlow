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
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import UpdateToken from "@/lib/fetch/tokens/update";
import ErrorCard from "@/components/error/ErrorCard";

export default function EditTokenModal({
  token,
  disclosure,
}: {
  token: any;
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();

  // create modal
  const { isOpen, onOpenChange, onClose } = disclosure;

  const [description, setDescription] = React.useState(token.description);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    setDescription(token.description);
  }, [token]);

  async function updateToken() {
    setIsLoading(true);

    const response = (await UpdateToken(token.id, description)) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to update token");
      setErrorMessage("Failed to update token");
      addToast({
        title: "Token",
        description: "Failed to update token",
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
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Token",
        description: "Failed to update token",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Edit Token</p>
                  <p className="text-sm text-default-500">
                    Edit the token details below and click apply changes to
                    save.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  isRequired
                  label="Description"
                  labelPlacement="outside"
                  placeholder="Enter the flow description"
                  type="description"
                  value={description}
                  variant="flat"
                  onValueChange={setDescription}
                />
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  variant="flat"
                  onPress={updateToken}
                >
                  Apply Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
