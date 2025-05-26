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
  ModalHeader,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

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

  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await UpdateToken(
      token.id,
      data.description.toString(),
    )) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to update token");
      setApiErrorMessage("Failed to update token");
      addToast({
        title: "Token",
        description: "Failed to update token",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      router.refresh();
      onOpenChange();
    } else {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Token",
        description: "Failed to update token",
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  };

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
                      defaultValue={token.description}
                      label="Description"
                      name="description"
                      placeholder="Enter the flow description"
                      type="description"
                      variant="flat"
                    />
                  </div>

                  <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                    <Button
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
                      color="warning"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:floppy-disk" width={18} />
                      }
                      type="submit"
                      variant="flat"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
