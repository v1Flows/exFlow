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
import ChangeProjectStatus from "@/lib/fetch/admin/PUT/ChangeProjectStatus";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ChangeProjectStatusModal({
  disclosure,
  project,
  status,
}: {
  disclosure: UseOverlayStateReturn;
  project: any;
  status: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const { refreshProjects } = useRefreshCache();
  const [disableReason, setDisableReason] = React.useState("");
  const [isLoading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function changeProjectStatus() {
    setLoading(true);
    const res = (await ChangeProjectStatus(
      project.id,
      status,
      disableReason || "no info provided",
    )) as any;
    if (!res) {
      setLoading(false);
      setError(true);
      setErrorText("Failed to update project status");
      setErrorMessage("An error occurred while updating the project status");
      toast.danger("Project", {
        description: "Failed to update project status",
      });
      return;
    }
    if (res.success) {
      setLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      refreshProjects(); // Refresh SWR cache instead of router
      toast.success("Project", {
        description: "Project status updated successfully",
      });
    } else {
      setLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      refreshProjects(); // Refresh SWR cache instead of router
      toast.danger("Project", {
        description: "Failed to update project status",
      });
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
                        <div className="flex flex-col gap-2">
                          <p className="text-lg font-bold">Disable Project</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to disable this project?
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
                          {project.id}
                        </span>
                      </CopySnippet>
                      <TextField
                        value={disableReason}
                        onChange={setDisableReason}
                      >
                        <Label>{"Disable Reason"}</Label>
                        <InputGroup>
                          <InputGroup.Input placeholder="Enter the reason for disabling this project" />
                        </InputGroup>
                      </TextField>
                    </Modal.Body>
                    <Modal.Footer className="grid grid-cols-2">
                      <Button variant="ghost" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        isPending={isLoading}
                        onPress={changeProjectStatus}
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
                          <p className="text-lg font-bold">Enable Project</p>
                          <p className="text-sm text-muted">
                            Are you sure you want to enable this project?
                          </p>
                        </div>
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <CopySnippet copyable={false} showPrompt={false}>
                        <span>
                          ID:
                          {project.id}
                        </span>
                      </CopySnippet>
                    </Modal.Body>
                    <Modal.Footer className="grid grid-cols-2">
                      <Button variant="ghost" onPress={onClose}>
                        Cancel
                      </Button>
                      <Button
                        isPending={isLoading}
                        onPress={changeProjectStatus}
                      >
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
