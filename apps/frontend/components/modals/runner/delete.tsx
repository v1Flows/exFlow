"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Chip,
  Modal,
  Separator,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import GetRunnerFlowLinks from "@/lib/fetch/runner/GetRunnerFlowLinks";
import DeleteProjectRunner from "@/lib/fetch/project/DELETE/DeleteRunner";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteRunnerModal({
  disclosure,
  runner,
}: {
  disclosure: UseOverlayStateReturn;
  runner: any;
}) {
  const { refreshRunners, refreshProjectRunners } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [flowLinks, setFlowLinks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  useEffect(() => {
    runner.id && getFlowLinks();
  }, [runner]);
  async function getFlowLinks() {
    const flows = (await GetRunnerFlowLinks({ runnerId: runner.id })) as any;
    if (!flows) {
      setError(true);
      setErrorText("Failed to fetch runner flow links");
      setErrorMessage("An error occurred while fetching the runner flow links");
      refreshRunners();
      toast.danger("Runner", {
        description: "Failed to fetch runner flow links",
      });
    }
    if (flows.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      setFlowLinks(flows.data.flows);
    } else {
      setError(true);
      setErrorText(flows.error);
      setErrorMessage(flows.message);
    }
  }
  async function deleteRunner() {
    setIsLoading(true);
    const response = (await DeleteProjectRunner(runner.id)) as any;
    if (!response) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete runner");
      setErrorMessage("An error occurred while deleting the runner");
      toast.danger("Runner", { description: "Failed to delete runner" });
      return;
    }
    if (response.success) {
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Runner", { description: "Runner deleted successfully" });
      refreshRunners();
      if (runner.project_id) {
        refreshProjectRunners(runner.project_id);
      }
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("Runner", { description: "Failed to create runner" });
    }
    setIsLoading(false);
  }
  return (
    <>
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
                          You are about to delete the following runner which{" "}
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
                      <span>Name: {runner.name}</span>
                      <span>ID: {runner.id}</span>
                    </CopySnippet>
                    {flowLinks.length > 0 && (
                      <>
                        <Separator />
                        <p>
                          The runner is assigned to the following flows which
                          will need{" "}
                          <span className="font-bold text-warning">
                            Maintenance
                          </span>{" "}
                          after the runner got deleted:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {flowLinks.map((flow: any) => (
                            <Chip key={flow.id} color="warning">
                              <Chip.Label>{flow.name}</Chip.Label>
                            </Chip>
                          ))}
                        </div>
                      </>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      variant="danger"
                      onPress={deleteRunner}
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
    </>
  );
}
