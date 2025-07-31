import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  ScrollShadow,
  Select,
  SelectItem,
  Spacer,
  Textarea,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import UpdateFlowFailurePipelineActions from "@/lib/fetch/flow/PUT/UpdateFailurePipelineActions";
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

export default function EditActionModal({
  disclosure,
  flow,
  targetAction,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow: any;
  targetAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [steps] = useState(3);
  const [currentStep, setCurrentStep] = useState(0);
  const [disableNext, setDisableNext] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [action, setAction] = useState({} as any);
  const [actionParamsCategorys, setActionParamsCategorys] = useState([] as any);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    if (!targetAction) {
      return;
    }

    if (disclosure.isOpen) {
      if (
        targetAction.condition === undefined ||
        targetAction.condition.condition_items === null
      ) {
        targetAction.condition = {
          selected_action_id: "",
          condition_items: [
            {
              condition_key: "",
              condition_type: "",
              condition_value: "",
              condition_logic: "and",
            },
          ],
          cancel_execution: false,
        };
      }
    }

    setAction(targetAction);
    getParamsCategorys(targetAction.params);
  }, [targetAction]);

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

  function cancel() {
    onOpenChange();
  }

  function checkRequiredParams() {
    let requiredParams = 0;
    let requiredParamsFilled = 0;

    action.params.map((param: any) => {
      if (param.required) {
        requiredParams++;
      }
      if (param.required && param.value !== "") {
        requiredParamsFilled++;
      }
    });
    if (requiredParams === requiredParamsFilled) {
      return true;
    } else {
      return false;
    }
  }

  async function updateFlowAction() {
    setLoading(true);

    const requiredParamsFilled = checkRequiredParams();

    if (!requiredParamsFilled) {
      setError(true);
      setErrorText("Required parameters not filled");
      setErrorMessage(
        "Please fill all required parameters before creating the action",
      );
      setLoading(false);

      return;
    }

    flow.actions.map((flowAction: any) => {
      if (flowAction.id === action.id) {
        flowAction.active = action.active;
        flowAction.params = action.params;
        flowAction.custom_name = action.custom_name;
        flowAction.custom_description = action.custom_description;
        flowAction.failure_pipeline_id =
          action.failure_pipeline_id === "none"
            ? ""
            : action.failure_pipeline_id;
        flowAction.condition = action.condition;
      }
    });

    const res = (await UpdateFlowActions(flow.id, flow.actions)) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage("An error occurred while updating the action.");
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Action updated successfully",
        color: "success",
        variant: "flat",
      });
      setCurrentStep(0);
      onOpenChange();
      router.refresh();
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "An error occurred while updating the action.",
        color: "danger",
        variant: "flat",
      });
    }

    setLoading(false);
  }

  async function updateFlowFailurePipelineAction() {
    setLoading(true);

    const requiredParamsFilled = checkRequiredParams();

    if (!requiredParamsFilled) {
      setError(true);
      setErrorText("Required parameters not filled");
      setErrorMessage(
        "Please fill all required parameters before creating the action",
      );
      setLoading(false);

      return;
    }

    failurePipeline.actions.map((pipelineAction: any) => {
      if (pipelineAction.id === action.id) {
        pipelineAction.active = action.active;
        pipelineAction.params = action.params;
        pipelineAction.custom_name = action.custom_name;
        pipelineAction.custom_description = action.custom_description;
      }
    });

    const res = (await UpdateFlowFailurePipelineActions(
      flow.id,
      failurePipeline.id,
      failurePipeline.actions,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage("An error occurred while updating the action.");
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Action updated successfully",
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
        description: "An error occurred while updating the action.",
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
                <p className="text-lg font-bold">Edit Action</p>
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
                          <Chip
                            color="default"
                            radius="sm"
                            size="sm"
                            variant="flat"
                          >
                            ID. {action.id}
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
                <div className="flex w-full flex-col gap-2">
                  {currentStep === 0 && (
                    <div>
                      <p className="text-lg font-bold text-default-600">
                        Details
                      </p>
                      <Spacer y={2} />
                      <div className="grid grid-cols-2 gap-2">
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
                        <Select
                          isRequired
                          className={isFailurePipeline ? "col-span-2" : ""}
                          label="Status"
                          placeholder="Select the flow to copy the action to"
                          selectedKeys={[action?.active?.toString()]}
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
                      </div>
                    </div>
                  )}
                  {currentStep === 1 && (
                    <div>
                      <p className="text-lg font-bold text-default-600">
                        Conditional Execution
                      </p>
                      <Spacer y={2} />
                      <div className="flex flex-col gap-1 w-full">
                        <RadioGroup
                          classNames={{
                            base: "w-full mb-2",
                          }}
                          label="Select an Action to apply an condition on"
                          value={action.condition.selected_action_id}
                          onValueChange={(e) => {
                            setAction({
                              ...action,
                              condition: {
                                ...action.condition,
                                selected_action_id: e,
                              },
                            });
                          }}
                        >
                          {flow.actions
                            .filter(
                              (flowActs: any) => flowActs.id !== action.id,
                            )
                            .map((flowActs: any) => (
                              <Radio
                                key={flowActs.id}
                                aria-label={
                                  flowActs.custom_name || flowActs.name
                                }
                                classNames={{
                                  base: cn(
                                    "inline-flex max-w-full w-full bg-content1 m-0",
                                    "hover:bg-content2 items-center justify-start",
                                    "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                    "data-[selected=true]:border-primary",
                                  ),
                                  label: "w-full",
                                }}
                                value={flowActs.id}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                                    <Icon icon={flowActs.icon} width={26} />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex flex-cols gap-2 items-center">
                                      <p className="text-lg font-bold">
                                        {flowActs.custom_name || flowActs.name}
                                      </p>
                                      <Chip
                                        color="primary"
                                        radius="sm"
                                        size="sm"
                                        variant="flat"
                                      >
                                        Ver. {flowActs.version}
                                      </Chip>
                                    </div>
                                    <p className="text-sm text-default-500">
                                      {flowActs.custom_description ||
                                        flowActs.description}
                                    </p>
                                  </div>
                                </div>
                              </Radio>
                            ))}
                        </RadioGroup>

                        <div className="flex flex-col items-center gap-2">
                          {action.condition.condition_items != null &&
                            action.condition.condition_items.map(
                              (condition: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <Button
                                    isIconOnly
                                    color="primary"
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                      // add new condition item
                                      setAction({
                                        ...action,
                                        condition: {
                                          ...action.condition,
                                          condition_items: [
                                            ...action.condition.condition_items,
                                            {
                                              condition_key: "",
                                              condition_type: "",
                                              condition_value: "",
                                              condition_logic: "and",
                                            },
                                          ],
                                        },
                                      });
                                    }}
                                  >
                                    <Icon
                                      className="text-primary"
                                      icon="hugeicons:plus-sign"
                                      width={20}
                                    />
                                  </Button>
                                  <Button
                                    isIconOnly
                                    color="danger"
                                    isDisabled={
                                      action.condition.condition_items.length <=
                                      1
                                    }
                                    size="sm"
                                    variant="flat"
                                    onPress={() => {
                                      // remove condition item
                                      setAction({
                                        ...action,
                                        condition: {
                                          ...action.condition,
                                          condition_items:
                                            action.condition.condition_items.filter(
                                              (item: any, i: number) =>
                                                i !== index,
                                            ),
                                        },
                                      });
                                    }}
                                  >
                                    <Icon
                                      className="text-danger"
                                      icon="hugeicons:minus-sign"
                                      width={20}
                                    />
                                  </Button>
                                  <Select
                                    label="Key"
                                    placeholder="Select an key"
                                    selectedKeys={[condition.condition_key]}
                                    onSelectionChange={(e) => {
                                      const key = e.currentKey;

                                      setAction({
                                        ...action,
                                        condition: {
                                          ...action.condition,
                                          condition_items:
                                            action.condition.condition_items.map(
                                              (item: any, i: number) => {
                                                if (i === index) {
                                                  return {
                                                    ...item,
                                                    condition_key: key,
                                                    condition_type: "",
                                                    condition_value: "",
                                                  };
                                                }

                                                return item;
                                              },
                                            ),
                                        },
                                      });
                                    }}
                                  >
                                    <SelectItem key="status">Status</SelectItem>
                                    <SelectItem key="message">
                                      Message
                                    </SelectItem>
                                  </Select>
                                  <Select
                                    label="Type"
                                    placeholder="Select an type"
                                    selectedKeys={[condition.condition_type]}
                                    onSelectionChange={(e) => {
                                      const type = e.currentKey;

                                      setAction({
                                        ...action,
                                        condition: {
                                          ...action.condition,
                                          condition_items:
                                            action.condition.condition_items.map(
                                              (item: any, i: number) => {
                                                if (i === index) {
                                                  return {
                                                    ...item,
                                                    condition_type: type,
                                                    condition_value: "",
                                                  };
                                                }

                                                return item;
                                              },
                                            ),
                                        },
                                      });
                                    }}
                                  >
                                    <SelectItem key="equals">=</SelectItem>
                                    <SelectItem key="not_equals">!=</SelectItem>
                                    {condition.condition_key === "message" && (
                                      <>
                                        <SelectItem key="contains">
                                          contains
                                        </SelectItem>
                                        <SelectItem key="not_contains">
                                          does not contain
                                        </SelectItem>
                                        <SelectItem key="regex">
                                          regex
                                        </SelectItem>
                                      </>
                                    )}
                                  </Select>
                                  {condition.condition_key === "status" ? (
                                    <Select
                                      label="Value"
                                      placeholder="Select an value"
                                      selectedKeys={[condition.condition_value]}
                                      onSelectionChange={(e) => {
                                        const value = e.currentKey;

                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items:
                                              action.condition.condition_items.map(
                                                (item: any, i: number) => {
                                                  if (i === index) {
                                                    return {
                                                      ...item,
                                                      condition_value: value,
                                                    };
                                                  }

                                                  return item;
                                                },
                                              ),
                                          },
                                        });
                                      }}
                                    >
                                      <SelectItem key="canceled">
                                        Canceled
                                      </SelectItem>
                                      <SelectItem key="no_pattern_match">
                                        No Pattern Match
                                      </SelectItem>
                                      <SelectItem key="warning">
                                        Warning
                                      </SelectItem>
                                      <SelectItem key="error">Error</SelectItem>
                                      <SelectItem key="success">
                                        Success
                                      </SelectItem>
                                    </Select>
                                  ) : (
                                    <Input
                                      label="Value"
                                      placeholder="Enter a value"
                                      type="text"
                                      value={condition.condition_value}
                                      onValueChange={(e) => {
                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items:
                                              action.condition.condition_items.map(
                                                (item: any, i: number) => {
                                                  if (i === index) {
                                                    return {
                                                      ...item,
                                                      condition_value: e,
                                                    };
                                                  }

                                                  return item;
                                                },
                                              ),
                                          },
                                        });
                                      }}
                                    />
                                  )}
                                  <Button
                                    isIconOnly
                                    color="primary"
                                    isDisabled={
                                      action.condition.condition_items
                                        .length ===
                                      index + 1
                                    }
                                    size="md"
                                    variant="flat"
                                    onPress={() => {
                                      // toggle logic between and/or
                                      const newLogic =
                                        condition.condition_logic === "and"
                                          ? "or"
                                          : "and";

                                      setAction({
                                        ...action,
                                        condition: {
                                          ...action.condition,
                                          condition_items:
                                            action.condition.condition_items.map(
                                              (item: any, i: number) => {
                                                if (i === index) {
                                                  return {
                                                    ...item,
                                                    condition_logic: newLogic,
                                                  };
                                                }

                                                return item;
                                              },
                                            ),
                                        },
                                      });
                                    }}
                                  >
                                    {condition.condition_logic === "and" ? (
                                      <p>&</p>
                                    ) : (
                                      <p>or</p>
                                    )}
                                  </Button>
                                </div>
                              ),
                            )}
                        </div>
                        <p className="mt-2 font-semibold">Options</p>
                        <Checkbox
                          color="danger"
                          isSelected={action.condition.cancel_execution}
                          onValueChange={(e) => {
                            setAction({
                              ...action,
                              condition: {
                                ...action.condition,
                                cancel_execution: e,
                              },
                            });
                          }}
                        >
                          <span className="text-danger font-bold">Cancel</span>{" "}
                          Execution if conditions match and dont start any
                          following action.
                        </Checkbox>
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div>
                      <p className="text-lg font-bold text-default-600">
                        Parameters
                      </p>
                      <Spacer y={2} />
                      <ScrollShadow className="max-h-[60vh]">
                        {actionParamsCategorys.length > 0 ? (
                          <div className="flex flex-col w-full gap-2">
                            {actionParamsCategorys.map((category: any) => (
                              <div key={category}>
                                <p className="font-semibold text-default-500 mb-2">
                                  {category}
                                </p>
                                <div className="grid lg:grid-cols-2 gap-2">
                                  {action.params.map((param: any) => {
                                    // Check if param belongs to this category first
                                    if (
                                      (param.category || "Uncategorized") !==
                                      category
                                    ) {
                                      return null;
                                    }

                                    // Check if param has depends_on set and evaluate the condition
                                    let isDisabled = false;

                                    if (param.depends_on.key !== "") {
                                      const dependsOnParam = action.params.find(
                                        (p: any) =>
                                          p.key === param.depends_on.key,
                                      );

                                      if (!dependsOnParam) {
                                        isDisabled = true;
                                      } else if (
                                        param.depends_on.value === "*"
                                      ) {
                                        // Wildcard: any non-empty value is acceptable
                                        isDisabled =
                                          !dependsOnParam.value ||
                                          dependsOnParam.value.trim() === "";
                                      } else {
                                        // Exact match required
                                        isDisabled =
                                          dependsOnParam.value !==
                                          param.depends_on.value;
                                      }
                                    }

                                    return param.type === "text" ||
                                      param.type === "number" ? (
                                      <Input
                                        key={param.key}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        type={param.type}
                                        value={param.value}
                                        onValueChange={(e) => {
                                          if (!isDisabled) {
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
                                          }
                                        }}
                                      />
                                    ) : param.type === "boolean" ? (
                                      <Select
                                        key={param.key}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        selectedKeys={[param.value]}
                                        onSelectionChange={(e) => {
                                          if (!isDisabled) {
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
                                          }
                                        }}
                                      >
                                        <SelectItem key="true">true</SelectItem>
                                        <SelectItem key="false">
                                          false
                                        </SelectItem>
                                      </Select>
                                    ) : param.type === "textarea" ? (
                                      <Textarea
                                        key={param.key}
                                        className="col-span-2"
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        type={param.type}
                                        value={param.value}
                                        onValueChange={(e) => {
                                          if (!isDisabled) {
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
                                          }
                                        }}
                                      />
                                    ) : param.type === "password" ? (
                                      <Input
                                        key={param.key}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        type={param.type}
                                        value={param.value}
                                        onValueChange={(e) => {
                                          if (!isDisabled) {
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
                                          }
                                        }}
                                      />
                                    ) : param.type === "select" ? (
                                      <Select
                                        key={param.key}
                                        defaultSelectedKeys={[param.default]}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        selectedKeys={[param.value]}
                                        onSelectionChange={(e) => {
                                          if (!isDisabled) {
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
                                          }
                                        }}
                                      >
                                        {param.options.map((option: any) => (
                                          <SelectItem key={option.key}>
                                            {option.value}
                                          </SelectItem>
                                        ))}
                                      </Select>
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
                {currentStep === 1 && (
                  <Button
                    color="warning"
                    startContent={
                      <Icon icon="hugeicons:file-sync" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setAction({
                        ...action,
                        condition: {
                          selected_action_id: "",
                          condition_items: [
                            {
                              condition_key: "",
                              condition_type: "",
                              condition_value: "",
                              condition_logic: "and",
                            },
                          ],
                          cancel_execution: false,
                        },
                      });
                    }}
                  >
                    Reset Current Input
                  </Button>
                )}
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                      setDisableNext(false);
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
                    color="warning"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:floppy-disk" width={18} />
                    }
                    variant="solid"
                    onPress={
                      isFailurePipeline
                        ? updateFlowFailurePipelineAction
                        : updateFlowAction
                    }
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={disableNext || action.plugin == ""}
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
