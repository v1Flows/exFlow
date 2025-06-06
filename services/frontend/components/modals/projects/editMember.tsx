"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import EditProjectMember from "@/lib/fetch/project/PUT/editProjectMember";
import ErrorCard from "@/components/error/ErrorCard";

export default function EditProjectMemberModal({
  disclosure,
  projectID,
  user,
}: {
  disclosure: UseDisclosureReturn;
  projectID: string;
  user: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [role, setRole] = React.useState(user.role);

  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSelectRole = (e: any) => {
    setRole(e.currentKey);
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
      onOpenChange();
      addToast({
        title: "Project",
        description: "Failed to edit member",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
      addToast({
        title: "Project",
        description: "Member edited successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Project",
        description: "Failed to edit member",
        color: "danger",
        variant: "flat",
      });
    }

    setIsLoginLoading(false);
  }

  return (
    <>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Edit Member</p>
                  <p className="text-sm text-default-500">
                    Change the role of the member by selecting it below
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Select
                  className="w-full"
                  label="Member Role"
                  placeholder="Select the role of the member"
                  selectedKeys={[role]}
                  variant="flat"
                  onSelectionChange={handleSelectRole}
                >
                  <SelectItem
                    key="Owner"
                    className="text-danger"
                    color="danger"
                    variant="flat"
                  >
                    Owner
                  </SelectItem>
                  <SelectItem
                    key="Editor"
                    className="text-primary"
                    color="primary"
                    variant="flat"
                  >
                    Editor
                  </SelectItem>
                  <SelectItem key="Viewer" variant="flat">
                    Viewer
                  </SelectItem>
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
                  isLoading={isLoginLoading}
                  startContent={
                    <Icon icon="hugeicons:floppy-disk" width={18} />
                  }
                  variant="solid"
                  onPress={handleUpdateUser}
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
