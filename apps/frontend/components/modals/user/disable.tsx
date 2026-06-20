"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import ErrorCard from "@/components/error/ErrorCard";
import { deleteSession } from "@/lib/auth/deleteSession";
import DisableUser from "@/lib/fetch/user/PUT/disable";
export default function DisableUserModal({
  disclosure,
  user,
}: {
  disclosure: UseOverlayStateReturn;
  user: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function disableUser() {
    setIsLoading(true);
    const response = (await DisableUser()) as any;
    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to disable user");
      setErrorMessage("Failed to disable user");
      toast.danger("User", { description: "Failed to disable user" });
      return;
    }
    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      toast.success("User", { description: "User disabled successfully" });
      deleteSession();
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("User", { description: "Failed to disable user" });
    }
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop
          variant="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You are about to disable your account which can only
                          be reverted by an support request.
                          <div aria-hidden className="h-1" />
                          You will be logged out and will not be able to log in
                          again.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <CopySnippet copyable={false} showPrompt={false}>
                      <span>Name: {user.username}</span>
                      <span>Email: {user.email}</span>
                      <span>ID: {user.id}</span>
                    </CopySnippet>
                  </Modal.Body>
                  <Modal.Footer className="grid grid-cols-2">
                    <Button variant="ghost" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      variant="danger"
                      onPress={disableUser}
                    >
                      Disable Account
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
