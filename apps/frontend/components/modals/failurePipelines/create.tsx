"use client";
import {
  Button,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import CreateFlowFailurePipeline from "@/lib/fetch/flow/POST/AddFlowFailurePipeline";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function CreateFailurePipelineModal({
  flow,
  disclosure,
}: {
  flow: any;
  disclosure: UseOverlayStateReturn;
}) {
  const { refreshFlowData } = useRefreshCache();
  // create modal
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [name, setName] = useState("");
  const [execParallel, setExecParallel] = useState(false);
  // loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const execStrategySelected = (e: any) => {
    if (e === "parallel") {
      setExecParallel(true);
    } else {
      setExecParallel(false);
    }
  };
  async function createFailurePipeline() {
    setIsLoading(true);
    const response = (await CreateFlowFailurePipeline(
      flow.id,
      name,
      execParallel,
    )) as any;
    if (!response) {
      setError(true);
      setErrorText("Failed to create failure pipeline");
      setErrorMessage("Failed to create failure pipeline");
      setIsLoading(false);
      return;
    }
    if (response.success) {
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      onOpenChange(false);
      setName("");
      setError(false);
      setErrorText("");
      setErrorMessage("");
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("Flow", {
        description: "Failed to create failure pipeline",
      });
    }
    setIsLoading(false);
  }
  function cancel() {
    setName("");
    setIsLoading(false);
    onOpenChange(false);
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="w-full">
              {() => (
                <>
                  <Modal.Header className="flex flex-col items-start">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">
                          Create new Failure Pipelines
                        </p>
                        <p className="text-sm text-muted">
                          Failure Pipelines can be assigned to actions and will
                          trigger a set of actions when the assigned action
                          fails.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div className="flex flex-col gap-4">
                      <TextField isRequired value={name} onChange={setName}>
                        <Label>{"Name"}</Label>
                        <InputGroup>
                          <InputGroup.Input type="name" />
                        </InputGroup>
                      </TextField>
                      <Select
                        placeholder="Select the execution strategy"
                        selectedKey={execParallel ? "parallel" : "sequential"}
                        onSelectionChange={execStrategySelected}
                      >
                        <Label>{"Execution Strategy"}</Label>
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item
                              key="sequential"
                              id="sequential"
                              textValue="Sequential"
                            >
                              Sequential
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                            <ListBox.Item
                              key="parallel"
                              id="parallel"
                              textValue="Parallel"
                            >
                              Parallel
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={cancel}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      onPress={createFailurePipeline}
                      variant="primary"
                    >
                      {<Icon icon="hugeicons:plus-sign" width={18} />}
                      Create Failure Pipeline
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
