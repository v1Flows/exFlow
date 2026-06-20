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
import DeleteFlowFailurePipeline from "@/lib/fetch/flow/DELETE/DeleteFailurePipeline";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteFailurePipelineModal({
  disclosure,
  flowID,
  failurePipeline,
}: {
  disclosure: UseOverlayStateReturn;
  flowID: any;
  failurePipeline: any;
}) {
  const { refreshFlowData } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function deleteFailurePipeline() {
    setIsDeleteLoading(true);
    const res = (await DeleteFlowFailurePipeline(
      flowID,
      failurePipeline,
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to delete failure pipeline");
      setErrorMessage("Failed to delete failure pipeline");
      setIsDeleteLoading(false);
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Flow", {
        description: "Failure Pipeline deleted successfully",
      });
      refreshFlowData(flowID);
    } else {
      setIsDeleteLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "Failed to delete failure pipeline",
      });
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
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You are about to delete the following failure pipeline
                          which{" "}
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
                      <span>ID: {failurePipeline}</span>
                    </CopySnippet>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isDeleteLoading}
                      variant="danger"
                      onPress={deleteFailurePipeline}
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
    </main>
  );
}
