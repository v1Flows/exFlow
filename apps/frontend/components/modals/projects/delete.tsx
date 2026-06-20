"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React from "react";
import { Icon } from "@iconify/react";
import DeleteProject from "@/lib/fetch/project/DELETE/DeleteProject";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function DeleteProjectModal({
  disclosure,
  project,
}: {
  disclosure: UseOverlayStateReturn;
  project: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const { refreshProjects } = useRefreshCache();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function deleteProject() {
    setIsLoading(true);
    const res = (await DeleteProject(project.id)) as any;
    if (!res) {
      setIsLoading(false);
      setError(true);
      setErrorText("Failed to delete project");
      setErrorMessage("Failed to delete project");
      toast.danger("Project", { description: "Failed to delete project" });
      return;
    }
    if (res.success) {
      refreshProjects(); // Refresh SWR cache instead of router
      onOpenChange(false);
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Project", { description: "Project deleted successfully" });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Project", { description: "Failed to delete project" });
    }
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop
          variant="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You are about to delete the following project which{" "}
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
                      <span>Name: {project.name}</span>
                      <span>ID: {project.id}</span>
                    </CopySnippet>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      variant="danger"
                      onPress={deleteProject}
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
