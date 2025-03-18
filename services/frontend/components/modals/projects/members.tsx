"use client";

import type { Selection } from "@heroui/react";
import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  Spacer,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import AddProjectMember from "@/lib/fetch/project/POST/AddProjectMember";
import ErrorCard from "@/components/error/ErrorCard";

import UserCell from "./user-cell";

export default function AddProjectMemberModal({
  disclosure,
  project,
  members,
}: {
  disclosure: UseDisclosureReturn;
  project: any;
  members: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [email, setEmail] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set(["Viewer"]),
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const statusColorMap: any = {
    Owner: "danger",
    Editor: "primary",
    Viewer: "default",
  };

  const permissionLabels: Record<string, string> = {
    Owner: "Owner",
    Viewer: "Can View",
    Editor: "Can Edit",
  };

  // Memoize the user list to avoid re-rendering when changing the selected keys
  const userList = React.useMemo(
    () => (
      <div className="mt-2 flex flex-col gap-2">
        {members.map((member: any) => (
          <div key={member.user_id}>
            <UserCell
              key={member.user_id}
              ref={null}
              avatar={member.username}
              color={statusColorMap[member.role]}
              name={member.username}
              permission={permissionLabels[member.role]}
            />
            <Divider className="m-1" />
          </div>
        ))}
      </div>
    ),
    [],
  );

  async function inviteMember() {
    const role = Array.from(selectedKeys)[0];

    setIsLoading(true);

    const res = (await AddProjectMember(
      project.id,
      email,
      role.toString(),
    )) as any;

    if (!res) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
      addToast({
        title: "Project",
        description: "Member invited successfully",
        color: "success",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setIsLoading(false);
      setEmail("");
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
      router.refresh();
      addToast({
        title: "Project",
        description: "Member invited successfully",
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
        description: res.error,
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
            <Card className="w-full bg-transparent shadow-none">
              <CardHeader className="justify-center px-6 pb-0 pt-6">
                <div className="flex flex-col items-center">
                  <AvatarGroup isBordered size="sm">
                    {members.map((member: any) => (
                      <Avatar
                        key={member.id}
                        color={statusColorMap[member.role]}
                        name={member.username}
                      />
                    ))}
                  </AvatarGroup>
                  <Spacer y={2} />
                  <h4 className="text-large">Invite Member</h4>
                  <p className="text-center text-small text-default-500">
                    Invite a new member to your project.
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex items-center gap-2">
                  <Input
                    description="User must have an account"
                    endContent={
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            className="text-default-500"
                            endContent={
                              <span className="hidden sm:flex">
                                <Icon icon="solar:alt-arrow-down-linear" />
                              </span>
                            }
                            size="sm"
                            variant="light"
                          >
                            {Array.from(selectedKeys)
                              .map((key) => permissionLabels[key])
                              .join(", ")}
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          selectedKeys={selectedKeys}
                          selectionMode="single"
                          onSelectionChange={setSelectedKeys}
                        >
                          <DropdownItem
                            key="Viewer"
                            startContent={<Icon icon="solar:eye-linear" />}
                          >
                            Can View
                          </DropdownItem>
                          <DropdownItem
                            key="Editor"
                            startContent={
                              <Icon icon="hugeicons:pencil-edit-02" />
                            }
                          >
                            Can Edit
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    }
                    label="Email Address"
                    labelPlacement="outside"
                    placeholder="Enter email address"
                    value={email}
                    onValueChange={setEmail}
                  />
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    size="md"
                    onPress={inviteMember}
                  >
                    Invite
                  </Button>
                </div>
                <Spacer y={4} />
                {userList}
              </CardBody>
              <CardFooter className="justify-end gap-2">
                <Button isDisabled size="sm" variant="flat">
                  Copy Link
                </Button>
              </CardFooter>
            </Card>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}
