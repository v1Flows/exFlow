"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import DeleteRunnerToken from "@/lib/fetch/project/DELETE/DeleteRunnerToken";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteRunnerTokenModal({
  disclosure,
  token,
}: {
  disclosure: UseOverlayStateReturn;
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
    const response = (await DeleteRunnerToken(token.id)) as any;
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
      refreshProjectTokens(token.project_id);
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
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You are about to delete the following token which{" "}
                          <span className="font-bold">cannot be undone</span>
                          .
                          <br /> Any runners using this token will become
                          unusable.
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
                  <Modal.Footer className="grid grid-cols-2">
                    <Button variant="ghost" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      onPress={handleDeleteToken}
                      variant="danger"
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
