"use client";
import {
  Button,
  Description,
  Label,
  ListBox,
  Modal,
  Select,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import EditProjectMember from "@/lib/fetch/project/PUT/editProjectMember";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function EditProjectMemberModal({
  disclosure,
  projectID,
  user,
}: {
  disclosure: UseOverlayStateReturn;
  projectID: string;
  user: any;
}) {
  const { refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [role, setRole] = React.useState(user.role);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const handleSelectRole = (e: any) => {
    setRole(e);
  };
  useEffect(() => {
    setRole(user.role);
  }, [user]);
  async function handleUpdateUser() {
    setIsLoginLoading(true);
    const response = (await EditProjectMember(
      projectID,
      role,
      user.user_id,
    )) as any;
    if (!response) {
      setIsLoginLoading(false);
      setError(true);
      setErrorText("Failed to edit member");
      setErrorMessage("Failed to edit member");
      onOpenChange(false);
      toast.danger("Project", { description: "Failed to edit member" });
      return;
    }
    if (response.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      toast.success("Project", { description: "Member edited successfully" });
      refreshProject(projectID);
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("Project", { description: "Failed to edit member" });
    }
    setIsLoginLoading(false);
  }
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
                        <p className="text-lg font-bold">Edit Member</p>
                        <p className="text-sm text-muted">
                          Change the role of the member by selecting it below
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <Select
                      className="w-full"
                      placeholder="Select the role of the member"
                      selectedKey={role}
                      onSelectionChange={handleSelectRole}
                    >
                      <Label>{"Member Role"}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item
                            key="Owner"
                            className="text-danger"
                            id="Owner"
                            textValue="Owner"
                          >
                            Owner
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="Editor"
                            className="text-accent"
                            id="Editor"
                            textValue="Editor"
                          >
                            Editor
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="Viewer"
                            id="Viewer"
                            textValue="Viewer"
                          >
                            Viewer
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoginLoading}
                      variant="primary"
                      onPress={handleUpdateUser}
                    >
                      {<Icon icon="hugeicons:floppy-disk" width={18} />}
                      Save Changes
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
