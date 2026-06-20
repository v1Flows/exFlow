import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import { Icon } from "@iconify/react";
import DeleteExecution from "@/lib/fetch/executions/DELETE/delete";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteExecutionModal({
  disclosure,
  execution,
}: {
  disclosure: UseOverlayStateReturn;
  execution: any;
}) {
  const { refreshAllExecutionCaches } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function deleteExecution() {
    setIsDeleteLoading(true);
    const res = (await DeleteExecution(execution.id)) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to delete execution");
      setErrorMessage("Failed to delete execution");
      setIsDeleteLoading(false);
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Flow", { description: "Execution deleted successfully" });
      // Refresh all execution-related SWR caches
      refreshAllExecutionCaches(execution.flow_id);
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      setIsDeleteLoading(false);
      toast.danger("Flow", { description: "Failed to delete execution" });
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
                          You are about to delete the following execution which{" "}
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
                        {execution.id}
                      </span>
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
                      onPress={deleteExecution}
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
