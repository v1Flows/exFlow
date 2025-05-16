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
import React from "react";

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

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectID, setProjectID] = React.useState("");
  const [parentFolderID, setParentFolderID] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSelectParentFolder = (e: any) => {
    setParentFolderID(e.currentKey);
  };

  const handleSelectProject = (e: any) => {
    setProjectID(e.currentKey);
  };

  async function createFolder() {
    setIsLoading(true);

    const response = (await CreateFolder({
      name,
      description,
      parentFolderID,
      projectID,
    })) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to create folder");
      setErrorMessage("An error occurred while creating the folder");
      addToast({
        title: "Folder",
        description: "Failed to create folder",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setName("");
      setDescription("");
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");

      router.refresh();
      addToast({
        title: "Folder",
        description: "Folder created successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Folder",
        description: `Failed to create folder: ${response.error}`,
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
                  <p className="text-lg font-bold">Create Folder</p>
                  <p className="text-sm text-default-500">
                    Folders provide a way to organize your flows
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
                  value={[parentFolderID]}
                  variant="flat"
                  onSelectionChange={handleSelectParentFolder}
                >
                  {folders.map((folder) => (
                    <SelectItem key={folder.id}>{folder.name}</SelectItem>
                  ))}
                </Select>
                <Select
                  isRequired
                  label="Project"
                  value={[projectID]}
                  variant="flat"
                  onSelectionChange={handleSelectProject}
                >
                  {projects.map((project) => (
                    <SelectItem key={project.id}>{project.name}</SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  onPress={createFolder}
                >
                  Create
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
