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
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import ChangeRunnerStatus from "@/lib/fetch/admin/PUT/ChangeRunnerStatus";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ChangeRunnerStatusModal({
  disclosure,
  runner,
  status,
}: {
  disclosure: UseOverlayStateReturn;
  runner: any;
  status: any;
}) {
  const { refreshRunners, refreshProjectRunners } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [disableReason, setDisableReason] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function changeRunnerStatus() {
    setLoading(true);
    const res = (await ChangeRunnerStatus(
      runner.id,
      status,
      disableReason || "no info provided",
    )) as any;
    if (!res) {
      setLoading(false);
      setError(true);
      setErrorText("Failed to update runner status");
      setErrorMessage("An error occurred while updating the runner status");
      toast.danger("Runner", { description: "Failed to update runner status" });
      return;
    }
    if (res.success) {
      setLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      refreshRunners();
      if (runner.project_id) {
        refreshProjectRunners(runner.project_id);
      }
      toast.success("Runner", {
        description: "Runner status updated successfully",
      });
    } else {
      setLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      refreshRunners();
      toast.danger("Runner", { description: "Failed to update runner status" });
    }
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
                        <div className="flex flex-col">
                          <p className="text-lg font-bold">Disable Runner</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to disable this runner?
                          </p>
                        </div>
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      {error && (
                        <ErrorCard error={errorText} message={errorMessage} />
                      )}
                      <CopySnippet copyable={false} showPrompt={false}>
                        <span>ID: {runner.id}</span>
                      </CopySnippet>
                      <TextField
                        value={disableReason}
                        onChange={setDisableReason}
                      >
                        <Label>{"Disable Reason"}</Label>
                        <InputGroup>
                          <Input placeholder="Enter the reason for disabling this runner" />
                        </InputGroup>
                      </TextField>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="ghost" onPress={onClose}>
                        {<Icon icon="hugeicons:cancel-01" width={18} />}
                        Cancel
                      </Button>
                      <Button
                        isPending={isLoading}
                        onPress={changeRunnerStatus}
                        variant="danger"
                      >
                        {<Icon icon="hugeicons:pause" width={18} />}
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
                        <div className="flex flex-col">
                          <p className="text-lg font-bold">Enable Runner</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to enable this runner?
                          </p>
                        </div>
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <CopySnippet copyable={false} showPrompt={false}>
                        <span>
                          ID:
                          {runner.id}
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
                        onPress={changeRunnerStatus}
                      >
                        {<Icon icon="hugeicons:play" width={18} />}
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
