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
  Select,
  SelectItem,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import UpdateFlowFailurePipeline from "@/lib/fetch/flow/PUT/UpdateFailurePipeline";

export default function EditFailurePipelineModal({
  disclosure,
  flow,
  targetFailurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
  targetFailurePipeline: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [failurePipeline, setFailurePipeline] = useState(targetFailurePipeline);

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const execStrategySelected = (e: any) => {
    if (e.currentKey === "parallel") {
      setFailurePipeline({
        ...failurePipeline,
        exec_parallel: true,
      });
    } else {
      setFailurePipeline({
        ...failurePipeline,
        exec_parallel: false,
      });
    }
  };

  function cancel() {
    onOpenChange();
  }

  useEffect(() => {
    setFailurePipeline(targetFailurePipeline);
  }, [targetFailurePipeline]);

  async function updateFailurePipeline() {
    setLoading(true);
    flow.failure_pipelines.map((flowFailurePipeline: any) => {
      if (flowFailurePipeline.id === failurePipeline.id) {
        flowFailurePipeline.name = failurePipeline.name;
        flowFailurePipeline.exec_parallel = failurePipeline.exec_parallel;
      }
    });

    const res = (await UpdateFlowFailurePipeline(
      flow.id,
      flow.failure_pipelines,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage("An error occurred while updating the failure pipeline.");
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Failure Pipeline updated successfully",
        color: "success",
        variant: "flat",
      });
      onOpenChange();
      router.refresh();
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "An error occurred while updating the failure pipeline.",
        color: "danger",
        variant: "flat",
      });
    }

    setLoading(false);
  }

  return (
    <main>
      <Modal
        isDismissable={false}
        isOpen={isOpen}
        placement="center"
        size="5xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <p className="text-lg font-bold">Edit Failure Pipeline</p>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    label="Name"
                    type="name"
                    value={failurePipeline.name}
                    variant="flat"
                    onValueChange={(value) => {
                      setFailurePipeline({
                        ...failurePipeline,
                        name: value,
                      });
                    }}
                  />
                  <Select
                    label="Execution Strategy"
                    placeholder="Select the execution strategy"
                    selectedKeys={[
                      failurePipeline.exec_parallel ? "parallel" : "sequential",
                    ]}
                    variant="flat"
                    onSelectionChange={execStrategySelected}
                  >
                    <SelectItem key="sequential">Sequential</SelectItem>
                    <SelectItem key="parallel">Parallel</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={cancel}
                >
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  startContent={
                    <Icon icon="hugeicons:floppy-disk" width={18} />
                  }
                  variant="solid"
                  onPress={updateFailurePipeline}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
