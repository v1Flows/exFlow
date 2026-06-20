"use client";
import {
  Button,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
  type UseOverlayStateReturn,
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
  disclosure: UseOverlayStateReturn;
}) {
  const { isOpen, setOpen: onOpenChange, close: onClose } = disclosure;
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
      toast.danger("Password", {
        description: "Failed to update user password",
      });
      return;
    }
    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      toast.success("Password", {
        description: "User password updated successfully",
      });
      deleteSession();
    } else if (response.error === "Current password is incorrect") {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsCurrentPasswordValid(false);
      toast.danger("Password", {
        description: "Current password is incorrect",
      });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("Password", { description: response.error });
    }
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold">Change Password</p>
                        <p className="text-sm text-muted">
                          After changing your password you will be logged out.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <TextField
                      isRequired
                      value={currentPassword}
                      onChange={setCurrentPassword}
                    >
                      <Label>{"Current Password"}</Label>
                      <InputGroup>
                        <Input
                          placeholder="Enter the current password"
                          type="password"
                        />
                      </InputGroup>
                    </TextField>
                    <TextField
                      isRequired
                      value={newPassword}
                      onChange={setNewPassword}
                    >
                      <Label>{"New Password"}</Label>
                      <InputGroup>
                        <Input
                          placeholder="Enter the new password"
                          type="password"
                        />
                      </InputGroup>
                    </TextField>
                    <TextField
                      isRequired
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                    >
                      <Label>{"Confirm Password"}</Label>
                      <InputGroup>
                        <Input
                          placeholder="Enter the new password again"
                          type="password"
                        />
                      </InputGroup>
                    </TextField>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      variant="primary"
                      onPress={changeUserPassword}
                    >
                      Set new password
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
