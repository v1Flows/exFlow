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

import ErrorCard from "@/components/error/ErrorCard";
import CreateProjectToken from "@/lib/fetch/project/POST/CreateProjectToken";

export default function CreateProjectTokenModal({
  disclosure,
  projectID,
}: {
  disclosure: UseDisclosureReturn;
  projectID: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [errors] = useState({});
  const [apiError, setApiError] = useState(false);
  const [apiErrorText, setApiErrorText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const res = (await CreateProjectToken(
      projectID,
      data.expiresIn,
      data.description.toString(),
    )) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to create token");
      setApiErrorMessage("Failed to create token");
      addToast({
        title: "Project",
        description: "Failed to create token",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      router.refresh();
      onOpenChange();
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Project",
        description: "Failed to create token",
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
                  <p className="text-lg font-bold">Create Project Token</p>
                  <p className="text-sm text-default-500">
                    Create a new token for your project.
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
                      label="Description"
                      name="description"
                      placeholder="Enter the key description"
                      variant="flat"
                    />
                    <Input
                      defaultValue="7"
                      endContent="days"
                      label="Expires In"
                      name="expiresIn"
                      placeholder="Enter the token expiration time"
                      type="number"
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
    </>
  );
}
