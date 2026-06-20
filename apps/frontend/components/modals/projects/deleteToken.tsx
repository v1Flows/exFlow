"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import DeleteProjectToken from "@/lib/fetch/project/DELETE/DeleteProjectToken";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteProjectTokenModal({
  disclosure,
  projectID,
  token,
}: {
  disclosure: UseOverlayStateReturn;
  projectID: any;
  token: any;
}) {
  const { refreshProjectTokens } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function handleDeleteToken() {
    setIsLoading(true);
    const response = (await DeleteProjectToken(projectID, token.id)) as any;
    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete token");
      setErrorMessage("Failed to delete token");
      toast.danger("Token", { description: "Failed to delete token" });
      return;
    }
    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      refreshProjectTokens(projectID);
      onOpenChange(false);
      toast.success("Token", { description: "Token deleted successfully" });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      toast.danger("Token", { description: "Failed to delete token" });
    }
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You are about to delete the following token which{" "}
                          <span className="font-bold">cannot be undone</span>.
                          <br /> this token will become unusable.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <CopySnippet copyable={false} showPrompt={false}>
                      <span>
                        ID:
                        {token.id}
                      </span>
                    </CopySnippet>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      onPress={handleDeleteToken}
                      variant="danger"
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
