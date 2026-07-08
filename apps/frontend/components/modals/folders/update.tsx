"use client";
import {
  Button,
  Description,
  FieldError,
  Form,
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
import UpdateFolder from "@/lib/fetch/folder/update";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function UpdateFolderModal({
  disclosure,
  projects,
  folders,
  folder,
}: {
  disclosure: UseOverlayStateReturn;
  projects: any;
  folders: any;
  folder: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const { refreshFolder } = useRefreshCache();
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
      toast.danger("Folder", { description: "Failed to update folder" });
      return;
    }
    if (response.success) {
      onOpenChange(false);
      setApiError(false);
      setApiErrorText("");
      setApiErrorMessage("");
      refreshFolder(folder.id); // Refresh SWR cache with specific folder ID
      toast.success("Folder", { description: "Folder updated successfully" });
    } else {
      setApiError(true);
      setApiErrorText(response.error);
      setApiErrorMessage(response.message);
      toast.danger("Folder", {
        description: `Failed to update folder: ${response.error}`,
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
                        <p className="text-lg font-bold">Update Folder</p>
                        <p className="text-sm text-muted">
                          Update the folder details
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
                        <TextField
                          isRequired
                          defaultValue={folder.name}
                          name="name"
                        >
                          <Label>{"Name"}</Label>
                          <InputGroup>
                            <InputGroup.Input />
                          </InputGroup>
                        </TextField>
                        <TextField
                          defaultValue={folder.description}
                          name="description"
                        >
                          <Label>{"Description"}</Label>
                          <InputGroup>
                            <InputGroup.Input />
                          </InputGroup>
                        </TextField>
                        <Select
                          defaultSelectedKey={
                            Array.from([folder.parent_id])[0] ?? null
                          }
                          name="parentFolderID"
                        >
                          <Label>{"Parent Folder"}</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              <ListBox.Item key="" id="" textValue="None">
                                None
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                              {folders.map((f) => (
                                <ListBox.Item key={f.id} id={f.id}>
                                  {f.name}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                        <Select
                          defaultSelectedKey={
                            Array.from([folder.project_id])[0] ?? null
                          }
                          isRequired
                          name="projectID"
                        >
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
                      </div>

                      <div className="flex flex-cols gap-2 mt-4 mb-2 items-center justify-end">
                        <Button type="reset" variant="ghost" onPress={onClose}>
                          {<Icon icon="hugeicons:cancel-01" width={18} />}
                          Cancel
                        </Button>
                        <Button isPending={isLoading} type="submit">
                          {<Icon icon="hugeicons:floppy-disk" width={18} />}
                          Save Changes
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
