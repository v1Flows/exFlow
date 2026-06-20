"use client";
import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import CreateFolder from "@/lib/fetch/folder/POST/create";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function CreateFolderModal({
  disclosure,
  projects,
  folders,
}: {
  disclosure: UseOverlayStateReturn;
  projects: any;
  folders: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const { refreshFolders } = useRefreshCache();
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
      toast.danger("Folder", { description: "Failed to create folder" });
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      refreshFolders(); // Refresh SWR cache instead of router
      toast.success("Folder", { description: "Folder created successfully" });
    } else {
      setApiError(true);
      setApiErrorText(res.error);
      setApiErrorMessage(res.message);
      toast.danger("Folder", {
        description: `Failed to create folder: ${res.error}`,
      });
    }
    setIsLoading(false);
  };
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Create Folder</p>
                        <p className="text-sm text-muted">
                          Folders provide a way to organize your flows
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {apiError && (
                      <ErrorCard
                        error={apiErrorText}
                        message={apiErrorMessage}
                      />
                    )}
                    <Form
                      className="w-full items-stretch"
                      validationErrors={errors}
                      onSubmit={onSubmit}
                    >
                      <div className="flex flex-col gap-4">
                        <TextField isRequired name="name">
                          <Label>{"Name"}</Label>
                          <InputGroup>
                            <Input />
                          </InputGroup>
                        </TextField>
                        <TextField name="description">
                          <Label>{"Description"}</Label>
                          <InputGroup>
                            <Input />
                          </InputGroup>
                        </TextField>
                        <Select isRequired name="projectID">
                          <Label>{"Project"}</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {projects.map((project) => (
                                <ListBox.Item key={project.id} id={project.id}>
                                  {project.name}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                        <Select name="parentFolderID">
                          <Label>{"Parent Folder"}</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {folders.map((folder) => (
                                <ListBox.Item key={folder.id} id={folder.id}>
                                  {folder.name}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>

                      <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                        <Button type="reset" variant="ghost" onPress={onClose}>
                          {<Icon icon="hugeicons:cancel-01" width={18} />}
                          Cancel
                        </Button>
                        <Button
                          isPending={isLoading}
                          type="submit"
                          variant="primary"
                        >
                          {<Icon icon="hugeicons:plus-sign" width={18} />}
                          Create
                        </Button>
                      </div>
                    </Form>
                  </Modal.Body>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
