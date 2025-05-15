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

import ChangeFlowMaintenance from "@/lib/fetch/flow/PUT/ChangeFlowMaintenance";
import ErrorCard from "@/components/error/ErrorCard";

export default function ChangeFlowMaintenanceModal({
  disclosure,
  flow,
  maintenance,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
  maintenance: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

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
      onOpenChange();
      router.refresh();
      addToast({
        title: "Flow",
        description: "Flow maintenance updated successfully",
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
        description: "Failed to update flow maintenance",
        color: "danger",
        variant: "flat",
      });
    }

    setLoading(false);
  }

  return (
    <main>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        {maintenance && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">Set Maintenance</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to set maintenance for this flow?
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
                    label="Maintenance Message"
                    labelPlacement="outside"
                    placeholder="Enter the reason for the maintenance"
                    value={maintenanceReason}
                    variant="flat"
                    onValueChange={setMaintenanceReason}
                  />
                </ModalBody>
                <ModalFooter className="grid grid-cols-2">
                  <Button color="default" variant="ghost" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="warning"
                    isLoading={isLoading}
                    variant="flat"
                    onPress={changeFlowMaintenance}
                  >
                    Set Maintenance
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
        {!maintenance && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">Remove Maintenance</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to remove the maintenance for this
                      flow?
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
                    onPress={changeFlowMaintenance}
                  >
                    Disable Maintenance
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
