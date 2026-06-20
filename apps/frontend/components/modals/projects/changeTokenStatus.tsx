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
import ChangeProjectTokenStatus from "@/lib/fetch/project/PUT/ChangeProjectTokenStatus";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ChangeProjectTokenStatusModal({
  disclosure,
  projectID,
  token,
  disabled,
}: {
  disclosure: UseOverlayStateReturn;
  projectID: string;
  token: any;
  disabled: any;
}) {
  const { refreshProjectTokens } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [disableReason, setDisableReason] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function changeTokenStatus() {
    setLoading(true);
    const res = (await ChangeProjectTokenStatus(
      projectID,
      token.id,
      disabled,
      disableReason || "no info provided",
    )) as any;
    if (!res) {
      setLoading(false);
      setError(true);
      setErrorText("Failed to update token status");
      setErrorMessage("Failed to update token status");
      toast.danger("Project", { description: "Failed to update token status" });
      return;
    }
    if (res.success) {
      setLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      refreshProjectTokens(projectID);
      toast.success("Project", {
        description: "Token status updated successfully",
      });
    } else {
      setLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      refreshProjectTokens(projectID);
      toast.danger("Project", { description: "Failed to update token status" });
    }
  }
  return (
    <main>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="top">
            {disabled && (
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center">
                      <Modal.Heading>
                        <div className="flex flex-col">
                          <p className="text-lg font-bold">Disable Token</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to disable this token?
                          </p>
                        </div>
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      {error && (
                        <ErrorCard error={errorText} message={errorMessage} />
                      )}
                      <CopySnippet copyable={false} showPrompt={false}>
                        <span>ID: {token.id}</span>
                      </CopySnippet>
                      <TextField
                        value={disableReason}
                        onChange={setDisableReason}
                      >
                        <Label>{"Disable Reason"}</Label>
                        <InputGroup>
                          <Input placeholder="Enter the reason for disabling this flow" />
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
                        onPress={changeTokenStatus}
                        variant="danger"
                      >
                        {<Icon icon="hugeicons:square-lock-01" width={18} />}
                        Disable
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            )}
            {!disabled && (
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center">
                      <Modal.Heading>
                        <div className="flex flex-col">
                          <p className="text-lg font-bold">Enable Token</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to enable this token?
                          </p>
                        </div>
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <CopySnippet copyable={false} showPrompt={false}>
                        <span>ID: {token.id}</span>
                      </CopySnippet>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onPress={onClose}>
                        {<Icon icon="hugeicons:cancel-01" width={18} />}
                        Cancel
                      </Button>
                      <Button isPending={isLoading} onPress={changeTokenStatus}>
                        {<Icon icon="hugeicons:square-unlock-01" width={18} />}
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
