"use client";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Chip,
  cn,
  Modal,
  type Selection,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ProjectTransferOwnershipAPI from "@/lib/fetch/project/PUT/transferOwnership";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ProjectTransferOwnership({
  disclosure,
  project,
  user,
}: {
  disclosure: UseOverlayStateReturn;
  project: any;
  user: any;
}) {
  const { refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>("");
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const statusColorMap: any = {
    Owner: "danger",
    Editor: "primary",
    Viewer: "default",
  };
  const handleSelectionChange = (selection: Selection) => {
    selectedUser === selection
      ? setSelectedUser("")
      : setSelectedUser(selection);
  };
  async function transferOwnership() {
    setIsLoading(true);
    const res = (await ProjectTransferOwnershipAPI(
      selectedUser,
      project.id,
    )) as any;
    if (!res) {
      setIsLoading(false);
      setError(true);
      setErrorText("An error occurred while transferring the ownership");
      setErrorMessage("An error occurred while transferring the ownership");
      toast.danger("Project", {
        description: "An error occurred while transferring the ownership",
      });
      return;
    }
    if (res.success) {
      setIsLoading(false);
      setSelectedUser("");
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      refreshProject(project.id);
      toast.success("Project", {
        description: "Owner transferred successfully",
      });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Project", {
        description: "An error occurred while transferring the ownership",
      });
    }
  }
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog>
            {() => (
              <Modal.Body>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Card className="w-full bg-transparent shadow-none">
                  <Card.Header className="justify-center px-6 pb-0 pt-6">
                    <div className="flex flex-col items-center">
                      <div className="flex -space-x-2">
                        {project.members.map((member: any) => (
                          <Avatar key={member.id}>
                            <Avatar.Fallback>
                              {String("").slice(0, 2).toUpperCase()}
                            </Avatar.Fallback>
                          </Avatar>
                        ))}
                      </div>
                      <div aria-hidden className="h-2" />
                      <h4 className="text-lg">Transfer your Ownership</h4>
                      <p className="text-center text-sm text-muted">
                        With the transfer of your Owner role to the below
                        selected user{" "}
                        <span className="font-bold">
                          you will be degraded as Viewer
                        </span>
                        .
                      </p>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div aria-hidden className="h-2" />
                    {project.members.filter(
                      (member: any) =>
                        member.user_id !== user.id &&
                        member.invite_pending === false,
                    ).length === 0 && (
                      <p className="text-center font-bold text-danger">
                        No members available to transfer the ownership to
                      </p>
                    )}

                    <div className="flex flex-col gap-6">
                      {project.members
                        .filter(
                          (member: any) =>
                            member.user_id !== user.id &&
                            member.invite_pending === false,
                        )
                        .map((member: any) => (
                          <Checkbox
                            key={member.user_id}
                            aria-label={member.username}
                            isSelected={selectedUser === member.user_id}
                            onChange={() =>
                              handleSelectionChange(member.user_id)
                            }
                          >
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Content>
                              <div className="flex w-full justify-between gap-2">
                                <div
                                  className={`flex items-center gap-3 ${""}`}
                                >
                                  <Avatar>
                                    <Avatar.Fallback>
                                      {String("").slice(0, 2).toUpperCase()}
                                    </Avatar.Fallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <div className="truncate">
                                      {member.username}
                                    </div>
                                    <div className="truncate text-sm text-muted">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs text-muted">
                                    Current Role
                                  </span>
                                  <Chip color={statusColorMap[member.role]}>
                                    <Chip.Label>{member.role}</Chip.Label>
                                  </Chip>
                                </div>
                              </div>
                            </Checkbox.Content>
                          </Checkbox>
                        ))}
                    </div>
                  </Card.Content>
                  <Card.Footer className="justify-end gap-2">
                    <Button variant="ghost" onPress={() => onOpenChange}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isDisabled={selectedUser === ""}
                      isPending={isLoading}
                      variant="danger"
                      onPress={transferOwnership}
                    >
                      {<Icon icon="hugeicons:self-transfer" width={18} />}
                      Transfer Ownership
                    </Button>
                  </Card.Footer>
                </Card>
              </Modal.Body>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
