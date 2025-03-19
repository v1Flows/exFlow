"use client";

import type { Selection } from "@heroui/react";
import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Chip,
  cn,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
  User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ProjectTransferOwnershipAPI from "@/lib/fetch/project/PUT/transferOwnership";
import ErrorCard from "@/components/error/ErrorCard";

export default function ProjectTransferOwnership({
  disclosure,
  project,
  members,
  user,
}: {
  disclosure: UseDisclosureReturn;
  project: any;
  members: any;
  user: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

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
      addToast({
        title: "Project",
        description: "An error occurred while transferring the ownership",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setIsLoading(false);
      setSelectedUser("");
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      router.refresh();
      addToast({
        title: "Project",
        description: "Owner transferred successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Project",
        description: "An error occurred while transferring the ownership",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <ModalBody>
            {error && <ErrorCard error={errorText} message={errorMessage} />}
            <Card className="w-full bg-transparent shadow-none">
              <CardHeader className="justify-center px-6 pb-0 pt-6">
                <div className="flex flex-col items-center">
                  <AvatarGroup isBordered size="sm">
                    {members.map((member: any) => (
                      <Avatar
                        key={member.id}
                        color={statusColorMap[member.role]}
                        name={member.username}
                        radius="sm"
                      />
                    ))}
                  </AvatarGroup>
                  <Spacer y={2} />
                  <h4 className="text-large">Transfer your Ownership</h4>
                  <p className="text-center text-small text-default-500">
                    With the transfer of your Owner role to the below selected
                    user{" "}
                    <span className="font-bold">
                      you will be degraded as Viewer
                    </span>
                    .
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <Spacer y={2} />
                {members.filter(
                  (member: any) =>
                    member.user_id !== user.id &&
                    member.invite_pending === false,
                ).length === 0 && (
                  <p className="text-center font-bold text-danger">
                    No members available to transfer the ownership to
                  </p>
                )}

                <div className="flex flex-col gap-6">
                  {members
                    .filter(
                      (member: any) =>
                        member.user_id !== user.id &&
                        member.invite_pending === false,
                    )
                    .map((member: any) => (
                      <Checkbox
                        key={member.user_id}
                        aria-label={member.username}
                        classNames={{
                          base: cn(
                            "inline-flex w-full max-w-md bg-content1",
                            "hover:bg-content2 items-center justify-start",
                            "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                            "data-[selected=true]:border-primary",
                          ),
                          label: "w-full",
                        }}
                        isSelected={selectedUser === member.user_id}
                        onValueChange={() =>
                          handleSelectionChange(member.user_id)
                        }
                      >
                        <div className="flex w-full justify-between gap-2">
                          <User
                            avatarProps={{
                              size: "md",
                              name: member.username,
                              color: statusColorMap[member.role],
                            }}
                            description={member.email}
                            name={member.username}
                          />
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-tiny text-default-500">
                              Current Role
                            </span>
                            <Chip
                              color={statusColorMap[member.role]}
                              size="sm"
                              variant="flat"
                            >
                              {member.role}
                            </Chip>
                          </div>
                        </div>
                      </Checkbox>
                    ))}
                </div>
              </CardBody>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" onPress={() => onOpenChange}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isDisabled={selectedUser === ""}
                  isLoading={isLoading}
                  variant="flat"
                  onPress={transferOwnership}
                >
                  Transfer Ownership
                </Button>
              </CardFooter>
            </Card>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}
