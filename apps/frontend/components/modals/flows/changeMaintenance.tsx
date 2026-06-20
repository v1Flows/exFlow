import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  Modal,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import ChangeFlowMaintenance from "@/lib/fetch/flow/PUT/ChangeFlowMaintenance";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ChangeFlowMaintenanceModal({
  disclosure,
  flow,
  maintenance,
}: {
  disclosure: UseOverlayStateReturn;
  flow: any;
  maintenance: any;
}) {
  const { refreshFlowData } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [maintenanceReason, setMaintenanceReason] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function changeFlowMaintenance() {
    setLoading(true);
    const res = (await ChangeFlowMaintenance(
      flow.id,
      maintenance,
      maintenanceReason || "no info provided",
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to update flow maintenance");
      setErrorMessage("An error occurred while updating flow maintenance");
      setLoading(false);
      return;
    }
    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      refreshFlowData(); // Refresh SWR cache instead of router
      toast.success("Flow", {
        description: "Flow maintenance updated successfully",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      refreshFlowData(); // Refresh SWR cache instead of router
      toast.danger("Flow", {
        description: "Failed to update flow maintenance",
      });
    }
    setLoading(false);
  }
  return (
    <main>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="top">
            {maintenance && (
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center">
                      <Modal.Heading>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">Set Maintenance</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to set maintenance for this
                            flow?
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
                        value={maintenanceReason}
                        onChange={setMaintenanceReason}
                      >
                        <Label>{"Maintenance Message"}</Label>
                        <InputGroup>
                          <Input placeholder="Enter the reason for the maintenance" />
                        </InputGroup>
                      </TextField>
                    </Modal.Body>
                    <Modal.Footer className="grid grid-cols-2">
                      <Button variant="ghost" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        isPending={isLoading}
                        onPress={changeFlowMaintenance}
                      >
                        Set Maintenance
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            )}
            {!maintenance && (
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center">
                      <Modal.Heading>
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">
                            Remove Maintenance
                          </p>
                          <p className="text-sm text-muted">
                            Are you sure you want to remove the maintenance for
                            this flow?
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
                      <Button
                        isPending={isLoading}
                        onPress={changeFlowMaintenance}
                      >
                        Disable Maintenance
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
