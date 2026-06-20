import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import DeleteAlert from "@/lib/fetch/alert/DELETE/alert";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteAlertModal({
  disclosure,
  alert,
}: {
  disclosure: UseOverlayStateReturn;
  alert: any;
}) {
  const { refreshAllAlertCaches } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function deleteAlert() {
    setIsDeleteLoading(true);
    const res = (await DeleteAlert(alert.id)) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to delete alert");
      setErrorMessage("Failed to delete alert");
      setIsDeleteLoading(false);
      return;
    }
    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Alert", { description: "Alert deleted successfully" });
      refreshAllAlertCaches(alert.flow_id);
      onOpenChange(false);
    } else {
      setError(true);
      setErrorText(res.message);
      setErrorMessage(res.error);
      toast.danger("Alert", { description: "Failed to delete alert" });
    }
    setIsDeleteLoading(false);
  }
  return (
    <main>
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
                          You are about to delete the following alert which{" "}
                          <span className="font-bold">cannot be undone</span>
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
                        {alert.id}
                      </span>
                    </CopySnippet>
                  </Modal.Body>
                  <Modal.Footer className="grid grid-cols-2">
                    <Button variant="ghost" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button
                      isPending={isDeleteLoading}
                      variant="danger"
                      onPress={deleteAlert}
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
    </main>
  );
}
