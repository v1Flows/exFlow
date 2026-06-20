"use client";
import {
  Button,
  Modal,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import LeaveProject from "@/lib/fetch/project/DELETE/leave";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function LeaveProjectModal({
  disclosure,
  projectID,
}: {
  disclosure: UseOverlayStateReturn;
  projectID: string;
}) {
  const { refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [isLeaveLoading, setIsLeaveLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function handleLeaveProject() {
    setIsLeaveLoading(true);
    const res = (await LeaveProject(projectID)) as any;
    if (!res) {
      setIsLeaveLoading(false);
      setError(true);
      setErrorText("An error occurred");
      setErrorMessage("An error occurred while leaving the project");
      toast.danger("Project", {
        description: "An error occurred while leaving the project",
      });
      return;
    }
    if (res.success) {
      setIsLeaveLoading(false);
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Project", {
        description: "You have left the project successfully",
      });
      refreshProject(projectID);
    } else {
      setIsLeaveLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Project", { description: res.error });
    }
    setIsLeaveLoading(false);
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog>
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Are you sure?</p>
                        <p className="text-sm text-muted">
                          You will lose all access to this project. You can
                          always rejoin if you are invited back.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLeaveLoading}
                      onPress={handleLeaveProject}
                      variant="danger"
                    >
                      {<Icon icon="hugeicons:self-transfer" width={18} />}
                      Leave Project
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
