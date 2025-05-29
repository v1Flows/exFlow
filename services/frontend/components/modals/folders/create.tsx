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
  Select,
  SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import CreateFolder from "@/lib/fetch/folder/POST/create";

export default function CreateFolderModal({
  disclosure,
  projects,
  folders,
}: {
  disclosure: UseDisclosureReturn;
  projects: any;
  folders: any;
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

    const res = (await CreateFolder({
      name: data.name.toString(),
      description: data.description.toString(),
      parentFolderID: data.parentFolderID.toString(),
      projectID: data.projectID.toString(),
    })) as any;

    if (!res) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to create folder");
      setApiErrorMessage("An error occurred while creating the folder");
      addToast({
        title: "Folder",
        description: "Failed to create folder",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      onOpenChange();
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");

      router.refresh();
      addToast({
        title: "Folder",
        description: "Folder created successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      addToast({
        title: "Folder",
        description: `Failed to create folder: ${res.error}`,
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
                  <p className="text-lg font-bold">Create Folder</p>
                  <p className="text-sm text-default-500">
                    Folders provide a way to organize your flows
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
                    <Input isRequired label="Name" name="name" variant="flat" />
                    <Input
                      label="Description"
                      name="description"
                      variant="flat"
                    />
                    <Select
                      isRequired
                      label="Project"
                      name="projectID"
                      variant="flat"
                    >
                      {projects.map((project) => (
                        <SelectItem key={project.id}>{project.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Parent Folder"
                      name="parentFolderID"
                      variant="flat"
                    >
                      {folders.map((folder) => (
                        <SelectItem key={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </Select>
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
