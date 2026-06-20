"use client";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import RotateAutoJoinToken from "@/lib/fetch/project/PUT/RotateAutoJoinToken";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function RotateAutoJoinTokenModal({
  disclosure,
  projectID,
}: {
  disclosure: UseOverlayStateReturn;
  projectID: any;
}) {
  const { refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function handleRotateToken() {
    setIsLoading(true);
    const response = (await RotateAutoJoinToken(projectID)) as any;
    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to rotate token");
      setErrorMessage("Failed to rotate token");
      toast.danger("Token", { description: "Failed to rotate token" });
      return;
    }
    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      refreshProject(projectID);
      onOpenChange(false);
      toast.success("Token", { description: "Token rotated successfully" });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      toast.danger("Token", { description: "Failed to rotate token" });
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
                          After rotating the auto-join token, all existing
                          runners using this token will be unable to join the
                          project. You will need to update the runners with the
                          new token to allow them to join again.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  {error && (
                    <Modal.Body>
                      <ErrorCard error={errorText} message={errorMessage} />
                    </Modal.Body>
                  )}
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button isPending={isLoading} onPress={handleRotateToken}>
                      {<Icon icon="hugeicons:rotate-clockwise" width={18} />}
                      Rotate
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
