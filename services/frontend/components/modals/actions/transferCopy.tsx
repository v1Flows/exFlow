import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  ScrollShadow,
  Select,
  SelectItem,
  Spacer,
  Textarea,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import AddFlowActions from "@/lib/fetch/flow/POST/AddFlowActions";
import AddFlowFailurePipelineActions from "@/lib/fetch/flow/POST/AddFlowFailurePipelineActions";
import MinimalRowSteps from "@/components/steps/minimal-row-steps";

export const CustomRadio = (props: any) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
          "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-default-200",
          "data-[selected=true]:border-primary",
        ),
      }}
    >
      {children}
    </Radio>
  );
};

export default function CopyActionToDifferentFlowModal({
  disclosure,
  flows,
  flow,
  copyAction,
  isFailurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flows: any;
  flow: any;
  copyAction: any;
  isFailurePipeline?: boolean;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [steps] = useState(3);
  const [currentStep, setCurrentStep] = useState(0);

  const [isLoading, setLoading] = useState(false);
  const [targetFlow, setTargetFlow] = useState({} as any);
  const [targetFailurePipeline, setTargetFailurePipeline] = useState({} as any);
  const [action, setAction] = useState({} as any);
  const [actionParamsCategorys, setActionParamsCategorys] = useState([] as any);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    if (!copyAction) {
      return;
    }

    setAction(copyAction);
    getParamsCategorys(copyAction.params);
  }, [copyAction]);

  function getParamsCategorys(params: any) {
    const categories = new Set();

    if (!params) {
      return;
    }

    params.map((param: any) => {
      if (param.category !== "") {
        categories.add(param.category);
      } else {
        categories.add("Uncategorized");
      }
    });

    setActionParamsCategorys(Array.from(categories));
  }

  function checkNextDisabled() {
    if (currentStep === 0) {
      if (isFailurePipeline) {
        if (!targetFailurePipeline?.id) {
          return true;
        }
      } else {
        if (!targetFlow?.id) {
          return true;
        }
      }
    }

    return false;
  }

  function cancel() {
    onOpenChange();
  }

  async function copyFlowAction() {
    setLoading(true);

    const sendAction = {
      id: uuidv4(),
      name: action.name,
      description: action.description,
      plugin: action.plugin,
      version: action.version,
      icon: action.icon,
      active: true,
      params: action.params,
      custom_name: action.custom_name,
      custom_description: action.custom_description,
      failure_pipeline_id:
        action.failure_pipeline_id === "none" ? "" : action.failure_pipeline_id,
    };

    const newActions = [...targetFlow.actions, sendAction];

    const res = (await AddFlowActions(
      targetFlow.id,
      targetFlow.project_id,
      newActions,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage(
        "An error occurred while copying the action to the target flow",
      );
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Action Copy",
        description: "Action successfully copied to the target flow",
        color: "success",
        variant: "flat",
      });
      onOpenChange();
      router.refresh();
    } else {
      setLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Action Copy",
        description:
          "An error occurred while copying the action to the target flow",
        color: "danger",
        variant: "flat",
      });
    }

    setLoading(false);
  }

  async function copyFlowFailurePipelineAction() {
    setLoading(true);

    const sendAction = {
      id: uuidv4(),
      name: action.name,
      description: action.description,
      plugin: action.plugin,
      version: action.version,
      icon: action.icon,
      active: true,
      params: action.params,
      custom_name: action.custom_name,
      custom_description: action.custom_description,
    };

    let newActions = [];

    if (
      targetFailurePipeline.actions &&
      targetFailurePipeline.actions.length > 0
    ) {
      newActions = [...targetFailurePipeline.actions, sendAction];
    } else {
      newActions = [sendAction];
    }

    const newFailurePipeline = {
      ...targetFailurePipeline,
      actions: newActions,
    };

    const res = (await AddFlowFailurePipelineActions(
      targetFlow.id,
      targetFailurePipeline.id,
      newFailurePipeline,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage(
        "An error occurred while copying the action to the target flow failure pipeline",
      );
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Action Copy",
        description:
          "Action successfully copied to the target flow failure pipeline",
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
        title: "Action Copy",
        description:
          "An error occurred while copying the action to the target flow failure pipeline",
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
                <div className="flex flex-col">
                  <p className="text-lg font-bold">
                    Copy Action to another Flow
                  </p>
                  <p className="text-sm text-default-500">
                    Copy this action to another flow with all the details it
                    currently has.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Card
                  className="border-2 border-default-200 border-primary"
                  radius="sm"
                >
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                        <Icon icon={action.icon} width={26} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex flex-cols gap-2 items-center">
                          <p className="text-lg font-bold">
                            {action.custom_name || action.name}
                          </p>
                          <Chip
                            color="primary"
                            radius="sm"
                            size="sm"
                            variant="flat"
                          >
                            Ver. {action.version}
                          </Chip>
                        </div>
                        <p className="text-sm text-default-500">
                          {action.custom_description || action.description}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <div className="flex items-center justify-center">
                  <MinimalRowSteps
                    ref={null}
                    className="w-fit overflow-hidden"
                    currentStep={currentStep}
                    label={`Step ${currentStep + 1} of ${steps}`}
                    stepsCount={steps}
                    onStepChange={setCurrentStep}
                  />
                </div>
                <div className="flex w-full flex-col gap-4">
                  {currentStep === 0 && (
                    <div>
                      <p className="text-lg font-bold">Target</p>
                      <Spacer y={2} />
                      <div className="flex items-center gap-2">
                        <Select
                          isRequired
                          label="Target Flow"
                          placeholder="Select the flow to copy the action to"
                          selectedKeys={[targetFlow?.id]}
                          onSelectionChange={(e) => {
                            setTargetFlow(
                              flows.find((fw: any) => fw.id === e.currentKey),
                            );
                          }}
                        >
                          {flows.map((fw: any) => (
                            <SelectItem key={fw.id} textValue={fw.name}>
                              <div className="flex gap-2 items-center">
                                {fw.name}
                                {fw.id === flow.id && (
                                  <Chip
                                    color="primary"
                                    radius="sm"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Current
                                  </Chip>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </Select>
                        {isFailurePipeline && (
                          <Select
                            isRequired
                            isDisabled={
                              !targetFlow?.failure_pipelines ||
                              targetFlow?.failure_pipelines.length === 0
                            }
                            label="Target Failure Pipeline"
                            placeholder="Select the failure pipeline to copy the action to"
                            selectedKeys={[targetFailurePipeline?.id]}
                            onSelectionChange={(e) => {
                              setTargetFailurePipeline(
                                targetFlow?.failure_pipelines.find(
                                  (ffp: any) => ffp.id === e.currentKey,
                                ),
                              );
                            }}
                          >
                            {targetFlow?.failure_pipelines?.map((ffp: any) => (
                              <SelectItem key={ffp.id} textValue={ffp.name}>
                                {ffp.name}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      </div>
                    </div>
                  )}
                  {currentStep === 1 && (
                    <div>
                      <p className="text-lg font-bold">Details</p>
                      <Spacer y={2} />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          isRequired
                          className={isFailurePipeline ? "col-span-2" : ""}
                          label="Status"
                          placeholder="Select the flow to copy the action to"
                          selectedKeys={[action.active.toString()]}
                          variant="flat"
                          onSelectionChange={(e) => {
                            if (e.currentKey === "true") {
                              setAction({ ...action, active: true });
                            }
                            if (e.currentKey === "false") {
                              setAction({ ...action, active: false });
                            }
                          }}
                        >
                          <SelectItem key="true" color="success" variant="flat">
                            Enabled
                          </SelectItem>
                          <SelectItem key="false" color="danger" variant="flat">
                            Disabled
                          </SelectItem>
                        </Select>
                        {!isFailurePipeline && (
                          <Select
                            label="Failure Pipeline"
                            placeholder="Select an failure pipeline"
                            selectedKeys={[
                              action.failure_pipeline_id || "none",
                            ]}
                            onSelectionChange={(e) => {
                              setAction({
                                ...action,
                                failure_pipeline_id: e.currentKey,
                              });
                            }}
                          >
                            <SelectItem key="none">None</SelectItem>
                            {flow.failure_pipelines.map((pipeline: any) => (
                              <SelectItem key={pipeline.id}>
                                {pipeline.name}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                        <Input
                          description="Custom name for this action (optional)"
                          label="Custom Name"
                          type="text"
                          value={action.custom_name}
                          onValueChange={(e) =>
                            setAction({ ...action, custom_name: e })
                          }
                        />
                        <Input
                          description="Custom description for this action (optional)"
                          label="Custom Description"
                          type="text"
                          value={action.custom_description}
                          onValueChange={(e) =>
                            setAction({ ...action, custom_description: e })
                          }
                        />
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div>
                      <Spacer y={2} />
                      <p className="text-lg font-bold text-default-600">
                        Parameters
                      </p>
                      <Spacer y={2} />
                      <ScrollShadow className="max-h-[40vh]">
                        {actionParamsCategorys.length > 0 ? (
                          <div className="flex flex-col w-full gap-2">
                            {actionParamsCategorys.map((category: any) => (
                              <div key={category}>
                                <p className="font-semibold text-default-500 mb-2">
                                  {category}
                                </p>
                                <div className="grid lg:grid-cols-2 gap-2">
                                  {action.params.map((param: any) => {
                                    return (param.category ||
                                      "Uncategorized") === category ? (
                                      param.type === "text" ||
                                      param.type === "number" ? (
                                        <Input
                                          key={param.key}
                                          description={param?.description}
                                          isRequired={param.required}
                                          label={param.title || param.key}
                                          type={param.type}
                                          value={param.value}
                                          onValueChange={(e) => {
                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) => {
                                                  if (x.key === param.key) {
                                                    return { ...x, value: e };
                                                  }

                                                  return x;
                                                },
                                              ),
                                            });
                                          }}
                                        />
                                      ) : param.type === "boolean" ? (
                                        <Select
                                          key={param.key}
                                          description={param?.description}
                                          isRequired={param.required}
                                          label={param.title || param.key}
                                          selectedKeys={[param.value]}
                                          onSelectionChange={(e) => {
                                            const value =
                                              Array.from(e).join("");

                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) => {
                                                  if (x.key === param.key) {
                                                    return { ...x, value };
                                                  }

                                                  return x;
                                                },
                                              ),
                                            });
                                          }}
                                        >
                                          <SelectItem key="true">
                                            true
                                          </SelectItem>
                                          <SelectItem key="false">
                                            false
                                          </SelectItem>
                                        </Select>
                                      ) : param.type === "textarea" ? (
                                        <Textarea
                                          key={param.key}
                                          className="col-span-2"
                                          description={param?.description}
                                          isRequired={param.required}
                                          label={param.title || param.key}
                                          type={param.type}
                                          value={param.value}
                                          onValueChange={(e) => {
                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) => {
                                                  if (x.key === param.key) {
                                                    return { ...x, value: e };
                                                  }

                                                  return x;
                                                },
                                              ),
                                            });
                                          }}
                                        />
                                      ) : param.type === "password" ? (
                                        <Input
                                          key={param.key}
                                          description={param?.description}
                                          isRequired={param.required}
                                          label={param.title || param.key}
                                          type={param.type}
                                          value={param.value}
                                          onValueChange={(e) => {
                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) => {
                                                  if (x.key === param.key) {
                                                    return { ...x, value: e };
                                                  }

                                                  return x;
                                                },
                                              ),
                                            });
                                          }}
                                        />
                                      ) : param.type === "select" ? (
                                        <Select
                                          key={param.key}
                                          description={param?.description}
                                          isRequired={param.required}
                                          label={param.title || param.key}
                                          selectedKeys={[param.value]}
                                          onSelectionChange={(e) => {
                                            const value =
                                              Array.from(e).join("");

                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) => {
                                                  if (x.key === param.key) {
                                                    return { ...x, value };
                                                  }

                                                  return x;
                                                },
                                              ),
                                            });
                                          }}
                                        >
                                          {param.options.map((option: any) => (
                                            <SelectItem key={option.key}>
                                              {option.value}
                                            </SelectItem>
                                          ))}
                                        </Select>
                                      ) : null
                                    ) : null;
                                  })}
                                </div>
                                <Divider className="mb-2 mt-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p>No parameters for this action found.</p>
                        )}
                      </ScrollShadow>
                    </div>
                  )}
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
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    isDisabled
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                  >
                    Back
                  </Button>
                )}
                {currentStep + 1 === steps ? (
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:delivery-sent-02" width={18} />
                    }
                    variant="solid"
                    onPress={
                      isFailurePipeline
                        ? copyFlowFailurePipelineAction
                        : copyFlowAction
                    }
                  >
                    Copy Action
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={checkNextDisabled()}
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:forward-02" width={18} />
                    }
                    onPress={() => setCurrentStep(currentStep + 1)}
                  >
                    Next Step
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
