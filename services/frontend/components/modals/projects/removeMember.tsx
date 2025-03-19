"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import RemoveProjectMember from "@/lib/fetch/project/DELETE/removeProjectMember";
import ErrorCard from "@/components/error/ErrorCard";

export default function DeleteProjectMemberModal({
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
      addToast({
        title: "Project",
        description: "An error occurred while removing the member",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setIsDeleteLoading(false);
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Project",
        description: "Member removed successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      setIsDeleteLoading(false);
      addToast({
        title: "Project",
        description: res.error,
        color: "danger",
        variant: "flat",
      });
    }

    setIsDeleteLoading(false);
  }

  return (
    <>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Remove Member</p>
                  <p className="text-sm text-default-500">
                    By removing this member, they will no longer have access to
                    the project.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <User
                  avatarProps={{ radius: "lg", name: user.username }}
                  className="justify-start"
                  description={user.email}
                  name={
                    <div className="flex items-center gap-2">
                      <p>{user.username}</p>
                      <Chip
                        className="capitalize"
                        color={statusColorMap[user.role]}
                        size="sm"
                        variant="flat"
                      >
                        {user.role}
                      </Chip>
                    </div>
                  }
                />
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isDeleteLoading}
                  onPress={handleDeleteMember}
                >
                  Remove
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
