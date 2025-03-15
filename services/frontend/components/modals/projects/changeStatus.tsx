import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import ChangeProjectStatus from "@/lib/fetch/admin/PUT/ChangeProjectStatus";
import ErrorCard from "@/components/error/ErrorCard";

export default function ChangeProjectStatusModal({
  disclosure,
  project,
  status,
}: {
  disclosure: UseDisclosureReturn;
  project: any;
  status: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

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
      addToast({
        title: "Project",
        description: "Failed to update project status",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      setLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange();
      router.refresh();
      addToast({
        title: "Project",
        description: "Project status updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      router.refresh();
      addToast({
        title: "Project",
        description: "Failed to update project status",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <main>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        {status && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">Disable Project</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to disable this project?
                    </p>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}
                  <Snippet hideCopyButton hideSymbol>
                    <span>
                      ID:
                      {project.id}
                    </span>
                  </Snippet>
                  <Input
                    label="Disable Reason"
                    labelPlacement="outside"
                    placeholder="Enter the reason for disabling this project"
                    value={disableReason}
                    variant="flat"
                    onValueChange={setDisableReason}
                  />
                </ModalBody>
                <ModalFooter className="grid grid-cols-2">
                  <Button color="default" variant="ghost" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isLoading}
                    onPress={changeProjectStatus}
                  >
                    Disable
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
        {!status && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">Enable Project</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to enable this project?
                    </p>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <Snippet hideCopyButton hideSymbol>
                    <span>
                      ID:
                      {project.id}
                    </span>
                  </Snippet>
                </ModalBody>
                <ModalFooter className="grid grid-cols-2">
                  <Button color="default" variant="ghost" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    isLoading={isLoading}
                    onPress={changeProjectStatus}
                  >
                    Enable
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
      </Modal>
    </main>
  );
}
