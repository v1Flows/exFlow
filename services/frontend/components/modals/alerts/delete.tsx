import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import DeleteAlert from "@/lib/fetch/alert/DELETE/alert";
import ErrorCard from "@/components/error/ErrorCard";

export default function DeleteAlertModal({
  disclosure,
  alert,
}: {
  disclosure: UseDisclosureReturn;
  alert: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function deleteAlert() {
    setIsDeleteLoading(true);
    const res = (await DeleteAlert(alert.id)) as any;

    if (!res) {
      setError(true);
      setErrorText("Failed to delete alert");
      setErrorMessage("Failed to delete alert");
      setIsDeleteLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Alert",
        description: "Alert deleted successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
      onOpenChange();
    } else {
      setError(true);
      setErrorText(res.message);
      setErrorMessage(res.error);
      addToast({
        title: "Alert",
        description: "Failed to delete alert",
        color: "danger",
        variant: "flat",
      });
    }

    setIsDeleteLoading(false);
  }

  return (
    <main>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You are about to delete the following alert which{" "}
                    <span className="font-bold">cannot be undone</span>
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
                    {alert.id}
                  </span>
                </Snippet>
              </ModalBody>
              <ModalFooter className="grid grid-cols-2">
                <Button color="default" variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isDeleteLoading}
                  variant="solid"
                  onPress={deleteAlert}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
