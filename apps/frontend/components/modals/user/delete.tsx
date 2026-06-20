"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import ErrorCard from "@/components/error/ErrorCard";
import DeleteUser from "@/lib/fetch/user/DELETE/delete";
export default function DeleteUserModal({
  disclosure,
  user,
}: {
  disclosure: UseOverlayStateReturn;
  user: any;
}) {
  const router = useRouter();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function deleteUser() {
    setIsLoading(true);
    const response = (await DeleteUser()) as any;
    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete user");
      setErrorMessage("Failed to delete user");
      toast.danger("User", { description: "Failed to delete user" });
      return;
    }
    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      router.refresh();
      onOpenChange(false);
      toast.success("User", { description: "User deleted successfully" });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      toast.danger("User", { description: "Failed to delete user" });
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
                          You are about to delete your account which{" "}
                          <span className="font-bold">cannot be undone</span>
                          .
                          <div aria-hidden className="h-1" />
                          Any known data related to your account will be
                          removed.
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
                      onPress={deleteUser}
                    >
                      Delete
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
