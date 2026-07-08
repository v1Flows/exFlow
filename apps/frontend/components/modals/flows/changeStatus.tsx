import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Description,
  FieldError,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import ChangeFlowStatus from "@/lib/fetch/admin/PUT/ChangeFlowStatus";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ChangeFlowStatusModal({
  disclosure,
  flow,
  status,
}: {
  disclosure: UseOverlayStateReturn;
  flow: any;
  status: any;
}) {
  const { refreshFlowData } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [disableReason, setDisableReason] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function changeFlowStatus() {
    setLoading(true);
    const res = (await ChangeFlowStatus(
      flow.id,
      status,
      disableReason || "no info provided",
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to update flow status");
      setErrorMessage("An error occurred while updating flow status");
      setLoading(false);
      return;
    }
    if (res.success) {
      setError(false);
      setErrorMessage("");
      setErrorText("");
      onOpenChange(false);
      refreshFlowData(); // Refresh SWR cache instead of router
      toast.success("Flow", {
        description: "Flow status updated successfully",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      refreshFlowData(); // Refresh SWR cache instead of router
      toast.danger("Flow", { description: "Failed to update flow status" });
    }
    setLoading(false);
  }
  return (
    <main>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="top">
            {status && (
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center">
                      <Modal.Heading>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">Disable Flow</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to disable this flow?
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
                          {flow.id}
                        </span>
                      </CopySnippet>
                      <TextField
                        value={disableReason}
                        onChange={setDisableReason}
                      >
                        <Label>{"Disable Reason"}</Label>
                        <InputGroup>
                          <InputGroup.Input placeholder="Enter the reason for disabling this flow" />
                        </InputGroup>
                      </TextField>
                    </Modal.Body>
                    <Modal.Footer className="grid grid-cols-2">
                      <Button variant="ghost" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        isPending={isLoading}
                        onPress={changeFlowStatus}
                        variant="danger"
                      >
                        Disable
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            )}
            {!status && (
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center">
                      <Modal.Heading>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">Enable Flow</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to enable this flow?
                          </p>
                        </div>
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <CopySnippet copyable={false} showPrompt={false}>
                        <span>
                          ID:
                          {flow.id}
                        </span>
                      </CopySnippet>
                    </Modal.Body>
                    <Modal.Footer className="grid grid-cols-2">
                      <Button variant="ghost" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button isPending={isLoading} onPress={changeFlowStatus}>
                        Enable
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            )}
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
