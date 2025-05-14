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

import ChangeFlowStatus from "@/lib/fetch/admin/PUT/ChangeFlowStatus";
import ErrorCard from "@/components/error/ErrorCard";

export default function ChangeFlowStatusModal({
  disclosure,
  flow,
  status,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
  status: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

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
      onOpenChange();
      router.refresh();
      addToast({
        title: "Flow",
        description: "Flow status updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      router.refresh();
      addToast({
        title: "Flow",
        description: "Failed to update flow status",
        color: "danger",
        variant: "flat",
      });
    }

    setLoading(false);
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
                    <p className="text-lg font-bold">Disable Flow</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to disable this flow?
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
                      {flow.id}
                    </span>
                  </Snippet>
                  <Input
                    label="Disable Reason"
                    labelPlacement="outside"
                    placeholder="Enter the reason for disabling this flow"
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
                    onPress={changeFlowStatus}
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
                    <p className="text-lg font-bold">Enable Flow</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to enable this flow?
                    </p>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <Snippet hideCopyButton hideSymbol>
                    <span>
                      ID:
                      {flow.id}
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
                    onPress={changeFlowStatus}
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
