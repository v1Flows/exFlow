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
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import DeleteFlowFailurePipeline from "@/lib/fetch/flow/DELETE/DeleteFailurePipeline";

export default function DeleteFailurePipelineModal({
  disclosure,
  flowID,
  failurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  flowID: any;
  failurePipeline: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function deleteFailurePipeline() {
    setIsDeleteLoading(true);
    const res = (await DeleteFlowFailurePipeline(
      flowID,
      failurePipeline,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Failed to delete failure pipeline");
      setErrorMessage("Failed to delete failure pipeline");
      setIsDeleteLoading(false);

      return;
    }

    if (res.success) {
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Failure Pipeline deleted successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setIsDeleteLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "Failed to delete failure pipeline",
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
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Are you sure?</p>
                  <p className="text-sm text-default-500">
                    You are about to delete the following failure pipeline which{" "}
                    <span className="font-bold">cannot be undone</span>
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Snippet hideCopyButton hideSymbol>
                  <span>ID: {failurePipeline}</span>
                </Snippet>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isDeleteLoading}
                  startContent={<Icon icon="hugeicons:delete-02" width={18} />}
                  variant="solid"
                  onPress={deleteFailurePipeline}
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
