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
  Select,
  SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
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

  const [id, setId] = React.useState(folder.id);
  const [name, setName] = React.useState(folder.name);
  const [description, setDescription] = React.useState(folder.description);
  const [projectID, setProjectID] = React.useState(folder.project_id);
  const [parentFolderID, setParentFolderID] = React.useState(folder.parent_id);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    setId(folder.id);
    setName(folder.name);
    setDescription(folder.description);
    setProjectID(folder.project_id);
    setParentFolderID(folder.parent_id);
  }, [folder]);

  const handleSelectParentFolder = (e: any) => {
    setParentFolderID(e.currentKey);
  };

  const handleSelectProject = (e: any) => {
    setProjectID(e.currentKey);
  };

  async function updateFolder() {
    setIsLoading(true);

    const response = (await UpdateFolder(
      id,
      name,
      description,
      parentFolderID,
      projectID,
    )) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to update folder");
      setErrorMessage("An error occurred while updateing the folder");
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
      setError(false);
      setErrorText("");
      setErrorMessage("");

      router.refresh();
      addToast({
        title: "Folder",
        description: "Folder updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Folder",
        description: `Failed to update folder: ${response.error}`,
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoading(false);
  }

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
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  isRequired
                  label="Name"
                  value={name}
                  variant="flat"
                  onValueChange={setName}
                />
                <Input
                  label="Description"
                  value={description}
                  variant="flat"
                  onValueChange={setDescription}
                />
                <Select
                  label="Parent Folder"
                  selectedKeys={[parentFolderID]}
                  variant="flat"
                  onSelectionChange={handleSelectParentFolder}
                >
                  <SelectItem key="">None</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id}>{f.name}</SelectItem>
                  ))}
                </Select>
                <Select
                  isRequired
                  label="Project"
                  selectedKeys={[projectID]}
                  variant="flat"
                  onSelectionChange={handleSelectProject}
                >
                  {projects.map((project) => (
                    <SelectItem key={project.id}>{project.name}</SelectItem>
                  ))}
                </Select>
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
                  color="warning"
                  isLoading={isLoading}
                  startContent={
                    <Icon icon="hugeicons:floppy-disk" width={18} />
                  }
                  onPress={updateFolder}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
