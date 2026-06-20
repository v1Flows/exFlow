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
import { Icon } from "@iconify/react";
import AdminDeleteUser from "@/lib/fetch/admin/DELETE/delete_user";
import ErrorCard from "@/components/error/ErrorCard";
export default function AdminDeleteUserModal({
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
    const response = (await AdminDeleteUser(user.id)) as any;
    if (response.success) {
      router.refresh();
      onOpenChange(false);
      setError(false);
      setErrorMessage("");
      setErrorText("");
      toast.success("User", { description: "User deleted successfully" });
    } else {
      setError(true);
      setErrorMessage(response.message);
      setErrorText(response.error);
      toast.danger("User", { description: "Failed to delete user" });
    }
    setIsLoading(false);
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
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You are about to delete your account which{" "}
                          <span className="font-bold">cannot be undone</span>.
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
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      variant="danger"
                      onPress={deleteUser}
                    >
                      {<Icon icon="hugeicons:delete-02" width={18} />}
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
