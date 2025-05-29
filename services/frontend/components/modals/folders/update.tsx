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
import UpdateFolder from "@/lib/fetch/folder/update";

export default function UpdateFolderModal({
  disclosure,
  projects,
  folders,
  folder,
}: {
  disclosure: UseDisclosureReturn;
  projects: any;
  folders: any;
  folder: any;
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

    const response = (await UpdateFolder(
      folder.id,
      data.name.toString(),
      data.description.toString(),
      data.parentFolderID.toString(),
      data.projectID.toString(),
    )) as any;

    if (!response) {
      setIsLoading(false);
      setApiError(true);
      setApiErrorText("Failed to update folder");
      setApiErrorMessage("An error occurred while updateing the folder");
      addToast({
        title: "Folder",
        description: "Failed to update folder",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      onOpenChange();
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");

      router.refresh();
      addToast({
        title: "Folder",
        description: "Folder updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setApiError(true);
      setApiErrorText(response.error);
      setApiErrorMessage(response.message);
      addToast({
        title: "Folder",
        description: `Failed to update folder: ${response.error}`,
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
                  <p className="text-lg font-bold">Update Folder</p>
                  <p className="text-sm text-default-500">
                    Update the folder details
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
                      defaultValue={folder.name}
                      label="Name"
                      name="name"
                      variant="flat"
                    />
                    <Input
                      defaultValue={folder.description}
                      label="Description"
                      name="description"
                      variant="flat"
                    />
                    <Select
                      defaultSelectedKeys={[folder.parent_id]}
                      label="Parent Folder"
                      name="parentFolderID"
                      variant="flat"
                    >
                      <SelectItem key="">None</SelectItem>
                      {folders.map((f) => (
                        <SelectItem key={f.id}>{f.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      isRequired
                      defaultSelectedKeys={[folder.project_id]}
                      label="Project"
                      name="projectID"
                      variant="flat"
                    >
                      {projects.map((project) => (
                        <SelectItem key={project.id}>{project.name}</SelectItem>
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
                      color="warning"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:floppy-disk" width={18} />
                      }
                      type="submit"
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
