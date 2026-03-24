"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import React from "react";

import ErrorCard from "@/components/error/ErrorCard";
import { deleteSession } from "@/lib/auth/deleteSession";
import ChangeUserPassword from "@/lib/fetch/user/PUT/changePassword";

export default function ChangeUserPasswordModal({
  userId,
  disclosure,
}: {
  userId: string;
  disclosure: UseDisclosureReturn;
}) {
  const { isOpen, onOpenChange, onClose } = disclosure;

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // loading
  const [isLoading, setIsLoading] = React.useState(false);

  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const [isCurrentPasswordValid, setIsCurrentPasswordValid] =
    React.useState(true);
  const [isNewPasswordValid, setIsNewPasswordValid] = React.useState(true);

  function checkNewAndConfirmPassword() {
    if (!newPassword.length || !confirmPassword.length) {
      setIsNewPasswordValid(false);

      return false;
    }

    if (newPassword === confirmPassword) {
      setIsNewPasswordValid(true);

      return true;
    } else {
      setIsNewPasswordValid(false);

      return false;
    }
  }

  async function changeUserPassword() {
    if (!currentPassword.length) {
      setIsCurrentPasswordValid(false);
    }
    if (!checkNewAndConfirmPassword()) {
      return;
    }

    setIsLoading(true);

    const response = (await ChangeUserPassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword,
    )) as any;

    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to update user password");
      setErrorMessage("Failed to update user password");
      addToast({
        title: "Password",
        description: "Failed to update user password",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
      addToast({
        title: "Password",
        description: "User password updated successfully",
        color: "success",
        variant: "flat",
      });
      deleteSession();
    } else if (response.error === "Current password is incorrect") {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsCurrentPasswordValid(false);
      addToast({
        title: "Password",
        description: "Current password is incorrect",
        color: "danger",
        variant: "flat",
      });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Password",
        description: response.error,
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Change Password</p>
                  <p className="text-sm text-default-500">
                    After changing your password you will be logged out.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  isRequired
                  label="Current Password"
                  placeholder="Enter the current password"
                  type="password"
                  validationState={isCurrentPasswordValid ? "valid" : "invalid"}
                  value={currentPassword}
                  variant="flat"
                  onValueChange={setCurrentPassword}
                />
                <Input
                  isRequired
                  label="New Password"
                  placeholder="Enter the new password"
                  type="password"
                  validationState={isNewPasswordValid ? "valid" : "invalid"}
                  value={newPassword}
                  variant="flat"
                  onValueChange={setNewPassword}
                />
                <Input
                  isRequired
                  label="Confirm Password"
                  placeholder="Enter the new password again"
                  type="password"
                  validationState={isNewPasswordValid ? "valid" : "invalid"}
                  value={confirmPassword}
                  variant="flat"
                  onValueChange={setConfirmPassword}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  variant="solid"
                  onPress={changeUserPassword}
                >
                  Set new password
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
