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
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import ChangeRunnerStatus from "@/lib/fetch/admin/PUT/ChangeRunnerStatus";

export default function ChangeRunnerStatusModal({
  disclosure,
  runner,
  status,
}: {
  disclosure: UseDisclosureReturn;
  runner: any;
  status: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

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
      addToast({
        title: "Runner",
        description: "Failed to update runner status",
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
        title: "Runner",
        description: "Runner status updated successfully",
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
        title: "Runner",
        description: "Failed to update runner status",
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
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">Disable Runner</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to disable this runner?
                    </p>
                  </div>
                </ModalHeader>
                <ModalBody>
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}
                  <Snippet hideCopyButton hideSymbol>
                    <span>ID: {runner.id}</span>
                  </Snippet>
                  <Input
                    label="Disable Reason"
                    placeholder="Enter the reason for disabling this runner"
                    value={disableReason}
                    variant="flat"
                    onValueChange={setDisableReason}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:cancel-01" width={18} />
                    }
                    variant="ghost"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isLoading}
                    startContent={<Icon icon="hugeicons:pause" width={18} />}
                    onPress={changeRunnerStatus}
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
                  <div className="flex flex-col">
                    <p className="text-lg font-bold">Enable Runner</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to enable this runner?
                    </p>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <Snippet hideCopyButton hideSymbol>
                    <span>
                      ID:
                      {runner.id}
                    </span>
                  </Snippet>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:cancel-01" width={18} />
                    }
                    variant="ghost"
                    onPress={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    isLoading={isLoading}
                    startContent={<Icon icon="hugeicons:play" width={18} />}
                    onPress={changeRunnerStatus}
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
