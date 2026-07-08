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
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import UpdateFlowFailurePipeline from "@/lib/fetch/flow/PUT/UpdateFailurePipeline";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function EditFailurePipelineModal({
  disclosure,
  flow,
  targetFailurePipeline,
}: {
  disclosure: UseOverlayStateReturn;
  flow: any;
  targetFailurePipeline: any;
}) {
  const { refreshFlowData } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [failurePipeline, setFailurePipeline] = useState(targetFailurePipeline);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const execStrategySelected = (e: any) => {
    if (e === "parallel") {
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
    onOpenChange(false);
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
      toast.success("Flow", {
        description: "Failure Pipeline updated successfully",
      });
      onOpenChange(false);
      refreshFlowData(flow.id);
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while updating the failure pipeline.",
      });
    }
    setLoading(false);
  }
  return (
    <main>
      <Modal>
        <Modal.Backdrop
          isDismissable={false}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog>
              {() => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <p className="text-lg font-bold">Edit Failure Pipeline</p>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div className="flex flex-col gap-4">
                      <TextField
                        isRequired
                        value={failurePipeline.name}
                        onChange={(value) => {
                          setFailurePipeline({
                            ...failurePipeline,
                            name: value,
                          });
                        }}
                      >
                        <Label>{"Name"}</Label>
                        <InputGroup>
                          <InputGroup.Input type="name" />
                        </InputGroup>
                      </TextField>
                      <Select
                        placeholder="Select the execution strategy"
                        selectedKey={
                          failurePipeline.exec_parallel
                            ? "parallel"
                            : "sequential"
                        }
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
                      variant="primary"
                      onPress={updateFailurePipeline}
                    >
                      {<Icon icon="hugeicons:floppy-disk" width={18} />}
                      Save Changes
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
