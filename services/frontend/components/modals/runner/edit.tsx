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

import EditRunner from "@/lib/fetch/runner/PUT/Edit";
import ErrorCard from "@/components/error/ErrorCard";

export default function EditRunnerModal({
  disclosure,
  runner,
}: {
  disclosure: UseDisclosureReturn;
  runner: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setIsLoading] = useState(false);

  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await EditRunner(runner.id, data.name.toString())) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to update runner");
      setApiErrorMessage("An error occurred while updating the runner");
      addToast({
        title: "Runner",
        description: "Failed to update runner",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      onOpenChange();
      addToast({
        title: "Runner",
        description: "Runner updated successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Runner",
        description: "Failed to update runner",
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
                  <p className="text-lg font-bold">Edit Runner</p>
                  <p className="text-sm text-default-500">
                    Edit the runner details below and click apply changes to
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
                      defaultValue={runner.name}
                      label="Name"
                      name="name"
                      placeholder="Enter the new runner name"
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
                      color="warning"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:floppy-disk" width={18} />
                      }
                      type="submit"
                      variant="solid"
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
