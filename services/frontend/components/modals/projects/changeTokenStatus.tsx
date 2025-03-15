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

import ErrorCard from "@/components/error/ErrorCard";
import ChangeProjectTokenStatus from "@/lib/fetch/project/PUT/ChangeProjectTokenStatus";

export default function ChangeProjectTokenStatusModal({
  disclosure,
  projectID,
  token,
  disabled,
}: {
  disclosure: UseDisclosureReturn;
  projectID: string;
  token: any;
  disabled: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

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
      addToast({
        title: "Project",
        description: "Failed to update token status",
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
        description: "Token status updated successfully",
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
        description: "Failed to update token status",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <main>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        {disabled && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">Disable Token</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to disable this token?
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
                      {token.id}
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
                    onPress={changeTokenStatus}
                  >
                    Disable
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        )}
        {!disabled && (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold">Enable Token</p>
                    <p className="text-sm text-default-500">
                      Are you sure you want to enable this token?
                    </p>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <Snippet hideCopyButton hideSymbol>
                    <span>
                      ID:
                      {token.id}
                    </span>
                  </Snippet>
                </ModalBody>
                <ModalFooter className="grid grid-cols-2">
                  <Button color="default" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="success"
                    isLoading={isLoading}
                    onPress={changeTokenStatus}
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
