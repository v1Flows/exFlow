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

import DeleteAction from "@/lib/fetch/flow/DELETE/DeleteAction";
import ErrorCard from "@/components/error/ErrorCard";
import DeleteFailurePipelineAction from "@/lib/fetch/flow/DELETE/DeleteFailurePipelineAction";

export default function DeleteActionModal({
  disclosure,
  flowID,
  actionID,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  flowID: any;
  actionID: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

  const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function deleteFlowAction() {
    setIsDeleteLoading(true);
    const res = (await DeleteAction(flowID, actionID)) as any;

    if (!res) {
      setError(true);
      setErrorText("Failed to delete action");
      setErrorMessage("Failed to delete action");
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
        description: "Action deleted successfully",
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
        description: "Failed to delete action",
        color: "danger",
        variant: "flat",
      });
    }

    setIsDeleteLoading(false);
  }

  async function deleteFailurePipelineAction() {
    setIsDeleteLoading(true);

    const res = (await DeleteFailurePipelineAction(
      flowID,
      failurePipeline.id,
      actionID,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Failed to delete action");
      setErrorMessage("Failed to delete action");
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
        description: "Action deleted successfully",
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
        description: "Failed to delete action",
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
                    You are about to delete the following action which{" "}
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
                    {actionID}
                  </span>
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
                  onPress={
                    isFailurePipeline
                      ? deleteFailurePipelineAction
                      : deleteFlowAction
                  }
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
