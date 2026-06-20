"use client";
import {
  Avatar,
  Button,
  Chip,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import RemoveProjectMember from "@/lib/fetch/project/DELETE/removeProjectMember";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteProjectMemberModal({
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
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const statusColorMap: any = {
    Owner: "danger",
    Editor: "primary",
    Viewer: "default",
  };
  async function handleDeleteMember() {
    setIsDeleteLoading(true);
    const res = (await RemoveProjectMember(projectID, user.user_id)) as any;
    if (!res) {
      setIsDeleteLoading(false);
      setError(true);
      setErrorText("An error occurred");
      setErrorMessage("An error occurred while removing the member");
      toast.danger("Project", {
        description: "An error occurred while removing the member",
      });
      return;
    }
    if (res.success) {
      setIsDeleteLoading(false);
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Project", { description: "Member removed successfully" });
      refreshProject(projectID);
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      setIsDeleteLoading(false);
      toast.danger("Project", { description: res.error });
    }
    setIsDeleteLoading(false);
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
                        <p className="text-lg font-bold">Remove Member</p>
                        <p className="text-sm text-muted">
                          By removing this member, they will no longer have
                          access to the project.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div
                      className={`flex items-center gap-3 ${"justify-start"}`}
                    >
                      <Avatar>
                        <Avatar.Fallback>
                          {String("").slice(0, 2).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate">
                          {
                            <div className="flex items-center gap-2">
                              <p>{user.username}</p>
                              <Chip
                                className="capitalize"
                                color={statusColorMap[user.role]}
                              >
                                <Chip.Label>{user.role}</Chip.Label>
                              </Chip>
                            </div>
                          }
                        </div>
                        <div className="truncate text-sm text-muted">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isDeleteLoading}
                      onPress={handleDeleteMember}
                      variant="danger"
                    >
                      {<Icon icon="hugeicons:delete-02" width={18} />}
                      Remove
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
