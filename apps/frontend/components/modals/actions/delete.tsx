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
import DeleteFailurePipelineAction from "@/lib/fetch/flow/DELETE/DeleteFailurePipelineAction";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import DeleteFlowAction from "@/lib/fetch/flow/DELETE/DeleteAction";
import DeleteProjectAction from "@/lib/fetch/project/DELETE/DeleteAction";
export default function DeleteActionModal({
  disclosure,
  flowID,
  actionID,
  isFailurePipeline,
  failurePipeline,
  isProjectAction,
  projectID,
}: {
  disclosure: UseOverlayStateReturn;
  flowID?: any;
  actionID: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
  isProjectAction?: boolean;
  projectID?: string;
}) {
  const { refreshFlowData, refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function deleteAction() {
    setIsDeleteLoading(true);
    let res;
    if (isProjectAction) {
      res = await DeleteProjectAction(projectID, actionID);
    } else {
      res = (await DeleteFlowAction(flowID, actionID)) as any;
    }
    if (!res) {
      setError(true);
      setErrorText("Failed to delete action");
      setErrorMessage("Failed to delete action");
      setIsDeleteLoading(false);
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Flow", { description: "Action deleted successfully" });
      if (isProjectAction) {
        refreshProject(projectID);
      } else {
        refreshFlowData(flowID); // Refresh SWR cache with specific flow ID
      }
    } else {
      setIsDeleteLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", { description: "Failed to delete action" });
    }
    setIsDeleteLoading(false);
  }
  async function deleteFailurePipelineAction() {
    setIsDeleteLoading(true);
    const res = (await DeleteFailurePipelineAction(
      flowID,
      failurePipeline.id,
      actionID,
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to delete action");
      setErrorMessage("Failed to delete action");
      setIsDeleteLoading(false);
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Flow", { description: "Action deleted successfully" });
      if (isProjectAction) {
        refreshProject(projectID);
      } else {
        refreshFlowData(flowID); // Refresh SWR cache with specific flow ID
      }
    } else {
      setIsDeleteLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", { description: "Failed to delete action" });
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
                          You are about to delete the following action which{" "}
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
                        {actionID}
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
                      onPress={
                        isFailurePipeline
                          ? deleteFailurePipelineAction
                          : deleteAction
                      }
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
