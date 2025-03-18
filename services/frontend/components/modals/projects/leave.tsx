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
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import LeaveProject from "@/lib/fetch/project/DELETE/leave";
import ErrorCard from "@/components/error/ErrorCard";

export default function LeaveProjectModal({
  disclosure,
  projectID,
}: {
  disclosure: UseDisclosureReturn;
  projectID: string;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;
  const [isLeaveLoading, setIsLeaveLoading] = useState(false);

  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function handleLeaveProject() {
    setIsLeaveLoading(true);

    const res = (await LeaveProject(projectID)) as any;

    if (!res) {
      setIsLeaveLoading(false);
      setError(true);
      setErrorText("An error occurred");
      setErrorMessage("An error occurred while leaving the project");
      addToast({
        title: "Project",
        description: "An error occurred while leaving the project",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setIsLeaveLoading(false);
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Project",
        description: "You have left the project successfully",
        color: "success",
        variant: "flat",
      });
      router.push("/projects");
    } else {
      setIsLeaveLoading(false);
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

    setIsLeaveLoading(false);
  }

  return (
    <>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You will lose all access to this project. You can always
                    rejoin if you are invited back.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isLeaveLoading}
                  onPress={handleLeaveProject}
                >
                  Leave Project
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
