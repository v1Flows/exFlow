import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Alert,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Radio,
  ScrollShadow,
  Select,
  SelectItem,
  Spacer,
  Textarea,
  Tabs,
  Tab,
  Switch,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { isMobile } from "react-device-detect";

import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import AddFlowActions from "@/lib/fetch/flow/POST/AddFlowActions";
import AddFlowFailurePipelineActions from "@/lib/fetch/flow/POST/AddFlowFailurePipelineActions";

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
  projects,
  flow,
  copyAction,
  isFailurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flows: any;
  projects: any;
  flow: any;
  copyAction: any;
  isFailurePipeline?: boolean;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

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

  async function copyFlowAction() {
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

    const sendAction = {
      id: uuidv4(),
      name: action.name,
      description: action.description,
      plugin: action.plugin,
      version: action.version,
      icon: action.icon,
      active: action.active,
      params: action.params,
      custom_name: action.custom_name,
      custom_description: action.custom_description,
      failure_pipeline_id:
        action.failure_pipeline_id === "none" ? "" : action.failure_pipeline_id,
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
              <p className="text-lg font-bold">Copy Action to another Flow</p>
              <p className="text-sm text-default-500 font-normal">
                Copy this action to another flow with all the details it
                currently has.
              </p>
            </DrawerHeader>
            <DrawerBody className="overflow-hidden flex flex-col">
              {error && <ErrorCard error={errorText} message={errorMessage} />}

              <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                {/* Action Info Card */}
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
                  <Tab key="target" title="Target Flow">
                    <div className="flex flex-col gap-4 pb-4">
                      <Select
                        isRequired
                        label="Target Flow"
                        placeholder="Select the flow to copy the action to"
                        selectedKeys={targetFlow?.id ? [targetFlow.id] : []}
                        variant="bordered"
                        onSelectionChange={(e) => {
                          setTargetFlow(
                            flows.find((fw: any) => fw.id === e.currentKey),
                          );
                        }}
                      >
                        {flows.map((fw: any) => (
                          <SelectItem
                            key={fw.id}
                            isDisabled={fw.id === flow.id}
                            textValue={fw.name}
                          >
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
                              <Chip
                                color="primary"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                Project:{" "}
                                {projects.find(
                                  (p: any) => p.id === fw.project_id,
                                )?.name || "N/A"}
                              </Chip>
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
                          selectedKeys={
                            targetFailurePipeline?.id
                              ? [targetFailurePipeline.id]
                              : []
                          }
                          variant="bordered"
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

                      {targetFlow?.id && (
                        <Card className="bg-content1/40 border border-default-200">
                          <CardBody>
                            <div className="flex items-center gap-4">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-default-100 text-default-500">
                                <Icon
                                  icon="hugeicons:workflow-square-10"
                                  width={20}
                                />
                              </div>
                              <div className="flex flex-col">
                                <p className="font-bold">{targetFlow.name}</p>
                                <p className="text-tiny text-default-500">
                                  Project:{" "}
                                  {projects.find(
                                    (p: any) => p.id === targetFlow.project_id,
                                  )?.name || "N/A"}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  </Tab>

                  <Tab key="general" title="General Settings">
                    <div className="flex flex-col gap-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          description="Custom name for this action (optional)"
                          label="Custom Name"
                          placeholder="Enter a custom name"
                          value={action.custom_name}
                          variant="bordered"
                          onValueChange={(e) =>
                            setAction({ ...action, custom_name: e })
                          }
                        />
                        <Input
                          description="Custom description for this action (optional)"
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

                      {!isFailurePipeline && (
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

                      <Alert color="warning" title="Note" variant="faded">
                        You cannot copy the current action conditions to a
                        different flow.
                      </Alert>
                    </div>
                  </Tab>

                  <Tab key="parameters" title="Parameters">
                    <div className="flex flex-col gap-4 pb-4">
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
                </Tabs>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button
                color="danger"
                startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                variant="light"
                onPress={cancel}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={
                  isFailurePipeline
                    ? !targetFailurePipeline?.id
                    : !targetFlow?.id
                }
                isLoading={isLoading}
                startContent={
                  <Icon icon="hugeicons:delivery-sent-02" width={18} />
                }
                onPress={
                  isFailurePipeline
                    ? copyFlowFailurePipelineAction
                    : copyFlowAction
                }
              >
                Copy Action
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}