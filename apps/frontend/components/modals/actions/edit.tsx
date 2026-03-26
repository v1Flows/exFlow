import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Radio,
  Select,
  SelectItem,
  Textarea,
  Tabs,
  Tab,
  Switch,
} from "@heroui/react";
import React, { useEffect, useState } from "react";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import UpdateFlowFailurePipelineActions from "@/lib/fetch/flow/PUT/UpdateFailurePipelineActions";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import UpdateProjectActions from "@/lib/fetch/project/PUT/UpdateActions";

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
  isProject,
  project,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow?: any;
  targetAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
  isProject?: boolean;
  project?: any;
}) {
  const { isOpen, onOpenChange } = disclosure;
  const { refreshFlowData, refreshProject } = useRefreshCache();

  const [isLoading, setLoading] = useState(false);
  const [action, setAction] = useState({
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
  } as any);
  const [actionParamsCategorys, setActionParamsCategorys] = useState([] as any);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    if (!targetAction || !disclosure.isOpen) {
      return;
    }

    // Ensure condition is always a well-formed object before setting state
    const normalized = {
      ...targetAction,
      condition:
        targetAction.condition == null ||
        targetAction.condition.selected_action_id === undefined
          ? {
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
            }
          : {
              ...targetAction.condition,
              condition_items:
                targetAction.condition.condition_items ?? [],
            },
    };

    setAction(normalized);
    getParamsCategorys(normalized.params);
  }, [targetAction, disclosure.isOpen]);

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
      onOpenChange();
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
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

  async function updateProjectAction() {
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

    project.predefined_flow_actions.map((projectAction: any) => {
      if (projectAction.id === action.id) {
        projectAction.active = action.active;
        projectAction.params = action.params;
        projectAction.custom_name = action.custom_name;
        projectAction.custom_description = action.custom_description;
        projectAction.failure_pipeline_id =
          action.failure_pipeline_id === "none"
            ? ""
            : action.failure_pipeline_id;
        projectAction.condition = action.condition;
      }
    });

    const res = (await UpdateProjectActions(
      project.id,
      project.predefined_flow_actions,
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
        title: "Project",
        description: "Action updated successfully",
        color: "success",
        variant: "flat",
      });
      onOpenChange();
      refreshProject(project.id); // Refresh SWR cache with specific project ID
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Project",
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
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
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
    <Drawer
      backdrop="blur"
      isOpen={isOpen}
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              <p className="text-lg font-bold">Edit Action</p>
              <p className="text-sm text-default-500 font-normal">
                Edit the configuration and parameters of this action.
              </p>
            </DrawerHeader>
            <DrawerBody className="overflow-hidden flex flex-col">
              {error && <ErrorCard error={errorText} message={errorMessage} />}

              <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                <Card className="bg-content1/60 backdrop-blur-md border border-primary/20 shadow-sm">
                  <CardBody>
                    <div className="flex items-center gap-4">
                      <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <Icon icon={action.icon} width={32} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">
                            {action.custom_name || action.name}
                          </p>
                          <Chip color="primary" size="sm" variant="flat">
                            v{action.version}
                          </Chip>
                        </div>
                        <p className="text-default-500">
                          {action.custom_description || action.description}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Tabs
                  aria-label="Configuration Options"
                  className="flex flex-col overflow-hidden"
                  classNames={{
                    tabList:
                      "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12",
                    tabContent:
                      "group-data-[selected=true]:text-primary font-medium text-lg",
                    panel: "flex-1 overflow-y-auto p-1 pt-0",
                  }}
                  color="primary"
                  variant="underlined"
                >
                  <Tab key="general" title="General Settings">
                    <div className="flex flex-col gap-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          description="A friendly name to identify this action in the flow"
                          label="Custom Name"
                          placeholder="Enter a custom name"
                          value={action.custom_name}
                          variant="bordered"
                          onValueChange={(e) =>
                            setAction({ ...action, custom_name: e })
                          }
                        />
                        <Input
                          description="Describe what this action does in this context"
                          label="Custom Description"
                          placeholder="Enter a description"
                          value={action.custom_description}
                          variant="bordered"
                          onValueChange={(e) =>
                            setAction({ ...action, custom_description: e })
                          }
                        />
                      </div>

                      <Select
                        isRequired
                        label="Status"
                        placeholder="Select status"
                        selectedKeys={[action?.active?.toString()]}
                        variant="bordered"
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

                      {!isProject && !isFailurePipeline && (
                        <Select
                          description="Pipeline to execute if this action fails"
                          label="Failure Pipeline"
                          placeholder="Select a failure pipeline"
                          selectedKeys={[
                            action.failure_pipeline_id || "none",
                          ]}
                          variant="bordered"
                          onSelectionChange={(e) =>
                            setAction({
                              ...action,
                              failure_pipeline_id: e.currentKey,
                            })
                          }
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
                  </Tab>

                  <Tab key="parameters" title="Parameters">
                    <div className="flex flex-col gap-4 pb-4">
                      {!isProject && flow?.input_params?.length > 0 && (
                        <div className="flex flex-col gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs font-medium text-primary uppercase tracking-wider">
                            Available Input Variables
                          </p>
                          <p className="text-tiny text-default-400">
                            Use these placeholders in parameter values to pass user-provided inputs at runtime.
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {flow.input_params.map((ip: any) => (
                              <Chip
                                key={ip.id}
                                className="cursor-pointer font-mono text-tiny"
                                color="primary"
                                size="sm"
                                variant="flat"
                                onClick={() => {
                                  navigator.clipboard.writeText(`{{inputs.${ip.name}}}`);
                                  addToast({ title: "Copied", description: `{{inputs.${ip.name}}} copied to clipboard`, color: "success", variant: "flat" });
                                }}
                              >
                                {`{{inputs.${ip.name}}}`}
                              </Chip>
                            ))}
                          </div>
                        </div>
                      )}
                      {actionParamsCategorys.length > 0 ? (
                        <div className="flex flex-col gap-6">
                          {actionParamsCategorys.map((category: any) => (
                            <div
                              key={category}
                              className="flex flex-col gap-3"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-divider" />
                                <span className="text-default-500 font-medium text-sm uppercase tracking-wider">
                                  {category}
                                </span>
                                <div className="h-px flex-1 bg-divider" />
                              </div>
                              <div className="grid lg:grid-cols-2 gap-4">
                                {action.params.map((param: any) => {
                                  if (
                                    (param.category || "Uncategorized") !==
                                    category
                                  )
                                    return null;

                                  let isDisabled = false;

                                  if (param.depends_on.key !== "") {
                                    const dependsOnParam = action.params.find(
                                      (p: any) =>
                                        p.key === param.depends_on.key,
                                    );

                                    if (!dependsOnParam) isDisabled = true;
                                    else if (param.depends_on.value === "*")
                                      isDisabled =
                                        !dependsOnParam.value ||
                                        dependsOnParam.value.trim() === "";
                                    else
                                      isDisabled =
                                        dependsOnParam.value !==
                                        param.depends_on.value;
                                  }

                                  const commonProps = {
                                    key: param.key,
                                    label: param.title || param.key,
                                    description: param.description,
                                    isDisabled,
                                    isRequired: param.required,
                                    variant: "bordered" as const,
                                    labelPlacement: "outside" as const,
                                  };

                                  if (param.type === "boolean") {
                                    return (
                                      <div
                                        key={param.key}
                                        className="flex flex-col gap-1.5"
                                      >
                                        <span className="text-small font-medium text-foreground">
                                          {param.title || param.key}
                                          {param.required && (
                                            <span className="text-danger ml-0.5">
                                              *
                                            </span>
                                          )}
                                        </span>
                                        <div
                                          className={`flex items-center px-3 min-h-10 rounded-medium bg-content1/40 hover:bg-content1/60 transition-colors border-2 border-default-200 hover:border-default-400 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                                        >
                                          <Switch
                                            isDisabled={isDisabled}
                                            isSelected={
                                              param.value === "true"
                                            }
                                            size="sm"
                                            onValueChange={(e) => {
                                              if (!isDisabled) {
                                                setAction({
                                                  ...action,
                                                  params: action.params.map(
                                                    (x: any) =>
                                                      x.key === param.key
                                                        ? {
                                                            ...x,
                                                            value: e
                                                              ? "true"
                                                              : "false",
                                                          }
                                                        : x,
                                                  ),
                                                });
                                              }
                                            }}
                                          >
                                            <span className="text-small text-default-500">
                                              {param.value === "true"
                                                ? "True"
                                                : "False"}
                                            </span>
                                          </Switch>
                                        </div>
                                        {param.description && (
                                          <span className="text-tiny text-default-400">
                                            {param.description}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  }

                                  if (param.type === "select") {
                                    return (
                                      <Select
                                        {...commonProps}
                                        key={param.key}
                                        classNames={{
                                          trigger:
                                            "bg-content1/40 hover:bg-content1/60 transition-colors",
                                        }}
                                        selectedKeys={[param.value]}
                                        onSelectionChange={(e) => {
                                          if (!isDisabled) {
                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) =>
                                                  x.key === param.key
                                                    ? {
                                                        ...x,
                                                        value:
                                                          Array.from(e).join(
                                                            "",
                                                          ),
                                                      }
                                                    : x,
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
                                    );
                                  }

                                  if (param.type === "textarea") {
                                    return (
                                      <Textarea
                                        {...commonProps}
                                        key={param.key}
                                        className="col-span-2"
                                        classNames={{
                                          inputWrapper:
                                            "bg-content1/40 hover:bg-content1/60 transition-colors",
                                        }}
                                        value={param.value}
                                        onValueChange={(e) => {
                                          if (!isDisabled) {
                                            setAction({
                                              ...action,
                                              params: action.params.map(
                                                (x: any) =>
                                                  x.key === param.key
                                                    ? { ...x, value: e }
                                                    : x,
                                              ),
                                            });
                                          }
                                        }}
                                      />
                                    );
                                  }

                                  return (
                                    <Input
                                      {...commonProps}
                                      key={param.key}
                                      classNames={{
                                        inputWrapper:
                                          "bg-content1/40 hover:bg-content1/60 transition-colors",
                                      }}
                                      type={
                                        param.type === "password"
                                          ? "password"
                                          : "text"
                                      }
                                      value={param.value}
                                      onValueChange={(e) => {
                                        if (!isDisabled) {
                                          setAction({
                                            ...action,
                                            params: action.params.map(
                                              (x: any) =>
                                                x.key === param.key
                                                  ? { ...x, value: e }
                                                  : x,
                                            ),
                                          });
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-default-500">
                          <Icon
                            className="mb-4 opacity-50"
                            icon="hugeicons:settings-01"
                            width={48}
                          />
                          <p>No parameters available for this action.</p>
                        </div>
                      )}
                    </div>
                  </Tab>

                  {!isProject && (
                    <Tab key="conditions" title="Conditions">
                      <div className="flex flex-col gap-6 pb-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-default-500">
                            Configure when this action should execute based on
                            the status of previous actions.
                          </p>

                          <Select
                            label="Depends on Action"
                            placeholder="Select an action..."
                            selectedKeys={
                              action.condition.selected_action_id
                                ? [action.condition.selected_action_id]
                                : []
                            }
                            startContent={<Icon icon="hugeicons:link-01" />}
                            variant="bordered"
                            onSelectionChange={(e) => {
                              setAction({
                                ...action,
                                condition: {
                                  ...action.condition,
                                  selected_action_id: e.currentKey,
                                },
                              });
                            }}
                          >
                            {flow.actions
                              .filter((flowActs: any, index: number) => {
                                const currentActionIndex =
                                  flow.actions.findIndex(
                                    (act: any) => act.id === action.id,
                                  );

                                if (isFailurePipeline) {
                                  return true;
                                }

                                return index < currentActionIndex;
                              })
                              .map((flowActs: any) => (
                                <SelectItem
                                  key={flowActs.id}
                                  textValue={
                                    flowActs.custom_name || flowActs.name
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon icon={flowActs.icon} width={20} />
                                    <div className="flex flex-col">
                                      <span className="text-small">
                                        {flowActs.custom_name || flowActs.name}
                                      </span>
                                      <span className="text-tiny text-default-400">
                                        v{flowActs.version}
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                          </Select>
                        </div>

                        {action.condition.selected_action_id && (
                          <div className="flex flex-col gap-4 p-4 rounded-lg bg-content1/40 border border-default-200">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm uppercase tracking-wider">
                                Condition Rules
                              </p>
                              <Button
                                color="primary"
                                size="sm"
                                startContent={
                                  <Icon icon="hugeicons:plus-sign" />
                                }
                                variant="flat"
                                onPress={() => {
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
                                Add Rule
                              </Button>
                            </div>

                            <div className="flex flex-col gap-3">
                              {action?.condition?.condition_items.map(
                                (condition: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 w-full animate-appearance-in"
                                  >
                                    <div className="flex flex-col gap-2 w-full">
                                      <div className="flex gap-2">
                                        <Select
                                          className="w-1/3"
                                          label="Type"
                                          selectedKeys={[
                                            condition.condition_type,
                                          ]}
                                          size="sm"
                                          variant="bordered"
                                          onSelectionChange={(e) => {
                                            const newItems = [
                                              ...action.condition
                                                .condition_items,
                                            ];

                                            newItems[index].condition_type =
                                              e.currentKey;
                                            setAction({
                                              ...action,
                                              condition: {
                                                ...action.condition,
                                                condition_items: newItems,
                                              },
                                            });
                                          }}
                                        >
                                          <SelectItem key="status">
                                            Status
                                          </SelectItem>
                                          <SelectItem key="message">
                                            Message
                                          </SelectItem>
                                        </Select>

                                        {condition.condition_type ===
                                        "status" ? (
                                          <Select
                                            className="w-2/3"
                                            label="Value"
                                            selectedKeys={[
                                              condition.condition_value,
                                            ]}
                                            size="sm"
                                            variant="bordered"
                                            onSelectionChange={(e) => {
                                              const newItems = [
                                                ...action.condition
                                                  .condition_items,
                                              ];

                                              newItems[index].condition_value =
                                                e.currentKey;
                                              setAction({
                                                ...action,
                                                condition: {
                                                  ...action.condition,
                                                  condition_items: newItems,
                                                },
                                              });
                                            }}
                                          >
                                            <SelectItem
                                              key="success"
                                              color="success"
                                            >
                                              Success
                                            </SelectItem>
                                            <SelectItem
                                              key="failed"
                                              color="danger"
                                            >
                                              Failed
                                            </SelectItem>
                                          </Select>
                                        ) : (
                                          <Input
                                            className="w-2/3"
                                            label="Value"
                                            size="sm"
                                            value={condition.condition_value}
                                            variant="bordered"
                                            onValueChange={(e) => {
                                              const newItems = [
                                                ...action.condition
                                                  .condition_items,
                                              ];

                                              newItems[index].condition_value =
                                                e;
                                              setAction({
                                                ...action,
                                                condition: {
                                                  ...action.condition,
                                                  condition_items: newItems,
                                                },
                                              });
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <Button
                                      isIconOnly
                                      color="danger"
                                      isDisabled={
                                        action.condition.condition_items
                                          .length <= 1
                                      }
                                      variant="light"
                                      onPress={() => {
                                        const newItems =
                                          action.condition.condition_items.filter(
                                            (_: any, i: number) => i !== index,
                                          );

                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items: newItems,
                                          },
                                        });
                                      }}
                                    >
                                      <Icon
                                        icon="hugeicons:delete-02"
                                        width={20}
                                      />
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Tab>
                  )}
                </Tabs>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button
                color="danger"
                startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                variant="light"
                onPress={() => {
                  cancel();
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                startContent={<Icon icon="hugeicons:floppy-disk" width={18} />}
                onPress={
                  !isProject
                    ? isFailurePipeline
                      ? updateFlowFailurePipelineAction
                      : updateFlowAction
                    : updateProjectAction
                }
              >
                Save Changes
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}