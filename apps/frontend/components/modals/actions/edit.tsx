import {
  Button,
  Card,
  Chip,
  Description,
  Drawer,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  Radio,
  Select,
  Switch,
  Tabs,
  TextArea,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
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
      className={cn(
        "inline-flex m-0 bg-surface hover:bg-surface-secondary items-center justify-between",
        "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-default",
        "data-[selected=true]:border-accent",
      )}
    >
      <Radio.Control>
        <Radio.Indicator />
      </Radio.Control>
      <Radio.Content>{children}</Radio.Content>
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
  disclosure: UseOverlayStateReturn;
  runners: any;
  flow?: any;
  targetAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
  isProject?: boolean;
  project?: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
              condition_items: targetAction.condition.condition_items ?? [],
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
    onOpenChange(false);
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
      toast.success("Flow", { description: "Action updated successfully" });
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while updating the action.",
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
      toast.success("Project", { description: "Action updated successfully" });
      onOpenChange(false);
      refreshProject(project.id); // Refresh SWR cache with specific project ID
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Project", {
        description: "An error occurred while updating the action.",
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
      toast.success("Flow", { description: "Action updated successfully" });
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while updating the action.",
      });
    }
    setLoading(false);
  }
  return (
    <Drawer>
      <Drawer.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <Drawer.Content>
          <Drawer.Dialog>
            {() => (
              <>
                <Drawer.Header className="flex flex-col gap-1">
                  <Drawer.Heading>
                    <p className="text-lg font-bold">Edit Action</p>
                    <p className="text-sm text-muted font-normal">
                      Edit the configuration and parameters of this action.
                    </p>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="overflow-hidden flex flex-col">
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}

                  <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                    <Card className="bg-surface/60 backdrop-blur-md border border-accent/20 shadow-sm">
                      <Card.Content>
                        <div className="flex items-center gap-4">
                          <div className="flex size-14 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                            <Icon icon={action.icon} width={32} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold">
                                {action.custom_name || action.name}
                              </p>
                              <Chip color="accent">
                                <Chip.Label>v{action.version}</Chip.Label>
                              </Chip>
                            </div>
                            <p className="text-muted">
                              {action.custom_description || action.description}
                            </p>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>

                    <Tabs
                      className={"flex flex-col overflow-hidden"}
                      variant={"secondary"}
                    >
                      <Tabs.ListContainer>
                        <Tabs.List aria-label={"Configuration Options"}>
                          <Tabs.Tab id={"general"}>
                            {"General Settings"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                          <Tabs.Tab id={"parameters"}>
                            {"Parameters"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                          {!isProject && (
                            <Tabs.Tab id={"conditions"}>
                              {"Conditions"}
                              <Tabs.Indicator />
                            </Tabs.Tab>
                          )}
                        </Tabs.List>
                      </Tabs.ListContainer>
                      <Tabs.Panel id={"general"}>
                        <div className="flex flex-col gap-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                              value={action.custom_name}
                              onChange={(e) =>
                                setAction({ ...action, custom_name: e })
                              }
                            >
                              <Label>{"Custom Name"}</Label>
                              <InputGroup>
                                <Input placeholder="Enter a custom name" />
                              </InputGroup>
                              <Description>
                                {
                                  "A friendly name to identify this action in the flow"
                                }
                              </Description>
                            </TextField>
                            <TextField
                              value={action.custom_description}
                              onChange={(e) =>
                                setAction({ ...action, custom_description: e })
                              }
                            >
                              <Label>{"Custom Description"}</Label>
                              <InputGroup>
                                <Input placeholder="Enter a description" />
                              </InputGroup>
                              <Description>
                                {
                                  "Describe what this action does in this context"
                                }
                              </Description>
                            </TextField>
                          </div>

                          <Select
                            isRequired
                            placeholder="Select status"
                            selectedKey={action?.active?.toString()}
                            onSelectionChange={(e) => {
                              if (e === "true") {
                                setAction({ ...action, active: true });
                              }
                              if (e === "false") {
                                setAction({ ...action, active: false });
                              }
                            }}
                          >
                            <Label>{"Status"}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBox.Item
                                  key="true"
                                  id="true"
                                  textValue="Enabled"
                                >
                                  Enabled
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item
                                  key="false"
                                  id="false"
                                  textValue="Disabled"
                                >
                                  Disabled
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>

                          {!isProject && !isFailurePipeline && (
                            <Select
                              placeholder="Select a failure pipeline"
                              selectedKey={action.failure_pipeline_id || "none"}
                              onSelectionChange={(e) =>
                                setAction({
                                  ...action,
                                  failure_pipeline_id: e,
                                })
                              }
                            >
                              <Label>{"Failure Pipeline"}</Label>
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  <ListBox.Item
                                    key="none"
                                    id="none"
                                    textValue="None"
                                  >
                                    None
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                  {flow.failure_pipelines.map(
                                    (pipeline: any) => (
                                      <ListBox.Item
                                        key={pipeline.id}
                                        id={pipeline.id}
                                        textValue=" "
                                      >
                                        {pipeline.name}
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ),
                                  )}
                                </ListBox>
                              </Select.Popover>
                              <Description>
                                {"Pipeline to execute if this action fails"}
                              </Description>
                            </Select>
                          )}
                        </div>
                      </Tabs.Panel>
                      <Tabs.Panel id={"parameters"}>
                        <div className="flex flex-col gap-4 pb-4">
                          {!isProject && flow?.input_params?.length > 0 && (
                            <div className="flex flex-col gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                              <p className="text-xs font-medium text-accent uppercase tracking-wider">
                                Available Input Variables
                              </p>
                              <p className="text-xs text-muted">
                                Use these placeholders in parameter values to
                                pass user-provided inputs at runtime.
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {flow.input_params.map((ip: any) => (
                                  <Chip
                                    key={ip.id}
                                    className="cursor-pointer font-mono text-xs"
                                    color="accent"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `{{inputs.${ip.name}}}`,
                                      );
                                      toast.success("Copied", {
                                        description: `{{inputs.${ip.name}}} copied to clipboard`,
                                      });
                                    }}
                                  >
                                    <Chip.Label>
                                      {`{{inputs.${ip.name}}}`}
                                    </Chip.Label>
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
                                    <span className="text-muted font-medium text-sm uppercase tracking-wider">
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
                                        const dependsOnParam =
                                          action.params.find(
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
                                        "aria-label": param.title || param.key,
                                        isDisabled,
                                        isRequired: param.required,
                                      };
                                      if (param.type === "boolean") {
                                        return (
                                          <div
                                            key={param.key}
                                            className="flex flex-col gap-1.5"
                                          >
                                            <span className="text-sm font-medium text-foreground">
                                              {param.title || param.key}
                                              {param.required && (
                                                <span className="text-danger ml-0.5">
                                                  *
                                                </span>
                                              )}
                                            </span>
                                            <div
                                              className={`flex items-center px-3 min-h-10 rounded-md bg-surface/40 hover:bg-surface/60 transition-colors border-2 border-default hover:border-default ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                                            >
                                              <Switch
                                                isDisabled={isDisabled}
                                                isSelected={
                                                  param.value === "true"
                                                }
                                                onChange={(e) => {
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
                                                <Switch.Control>
                                                  <Switch.Thumb />
                                                </Switch.Control>
                                                <Switch.Content>
                                                  <span className="text-sm text-muted">
                                                    {param.value === "true"
                                                      ? "True"
                                                      : "False"}
                                                  </span>
                                                </Switch.Content>
                                              </Switch>
                                            </div>
                                            {param.description && (
                                              <span className="text-xs text-muted">
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
                                            selectedKey={param.value}
                                            onSelectionChange={(e) => {
                                              if (!isDisabled) {
                                                setAction({
                                                  ...action,
                                                  params: action.params.map(
                                                    (x: any) =>
                                                      x.key === param.key
                                                        ? {
                                                            ...x,
                                                            value: String(
                                                              e ?? "",
                                                            ),
                                                          }
                                                        : x,
                                                  ),
                                                });
                                              }
                                            }}
                                          >
                                            <Select.Trigger>
                                              <Select.Value />
                                              <Select.Indicator />
                                            </Select.Trigger>
                                            <Select.Popover>
                                              <ListBox>
                                                {param.options.map(
                                                  (option: any) => (
                                                    <ListBox.Item
                                                      key={option.key}
                                                      id={option.key}
                                                      textValue=" "
                                                    >
                                                      {option.value}
                                                      <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                  ),
                                                )}
                                              </ListBox>
                                            </Select.Popover>
                                          </Select>
                                        );
                                      }
                                      if (param.type === "textarea") {
                                        return (
                                          <TextField
                                            {...commonProps}
                                            key={param.key}
                                            className={"col-span-2"}
                                            value={param.value}
                                            onChange={(e) => {
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
                                          >
                                            <TextArea />
                                          </TextField>
                                        );
                                      }
                                      return (
                                        <TextField
                                          key={param.key}
                                          {...commonProps}
                                          value={param.value}
                                          onChange={(e) => {
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
                                        >
                                          <InputGroup>
                                            <Input
                                              type={
                                                param.type === "password"
                                                  ? "password"
                                                  : "text"
                                              }
                                            />
                                          </InputGroup>
                                        </TextField>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted">
                              <Icon
                                className="mb-4 opacity-50"
                                icon="hugeicons:settings-01"
                                width={48}
                              />
                              <p>No parameters available for this action.</p>
                            </div>
                          )}
                        </div>
                      </Tabs.Panel>
                      {!isProject && (
                        <Tabs.Panel id={"conditions"}>
                          <div className="flex flex-col gap-6 pb-4">
                            <div className="flex flex-col gap-2">
                              <p className="text-sm text-muted">
                                Configure when this action should execute based
                                on the status of previous actions.
                              </p>

                              <Select
                                selectedKey={
                                  Array.from(
                                    action.condition.selected_action_id
                                      ? [action.condition.selected_action_id]
                                      : [],
                                  )[0] ?? null
                                }
                                placeholder="Select an action..."
                                onSelectionChange={(e) => {
                                  setAction({
                                    ...action,
                                    condition: {
                                      ...action.condition,
                                      selected_action_id: e,
                                    },
                                  });
                                }}
                              >
                                <Label>{"Depends on Action"}</Label>
                                <Select.Trigger>
                                  <Select.Value />
                                  <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                  <ListBox>
                                    {flow.actions
                                      .filter(
                                        (flowActs: any, index: number) => {
                                          const currentActionIndex =
                                            flow.actions.findIndex(
                                              (act: any) =>
                                                act.id === action.id,
                                            );
                                          if (isFailurePipeline) {
                                            return true;
                                          }
                                          return index < currentActionIndex;
                                        },
                                      )
                                      .map((flowActs: any) => (
                                        <ListBox.Item
                                          key={flowActs.id}
                                          textValue={
                                            flowActs.custom_name ||
                                            flowActs.name
                                          }
                                          id={flowActs.id}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Icon
                                              icon={flowActs.icon}
                                              width={20}
                                            />
                                            <div className="flex flex-col">
                                              <span className="text-sm">
                                                {flowActs.custom_name ||
                                                  flowActs.name}
                                              </span>
                                              <span className="text-xs text-muted">
                                                v{flowActs.version}
                                              </span>
                                            </div>
                                          </div>
                                          <ListBox.ItemIndicator />
                                        </ListBox.Item>
                                      ))}
                                  </ListBox>
                                </Select.Popover>
                              </Select>
                            </div>

                            {action.condition.selected_action_id && (
                              <div className="flex flex-col gap-4 p-4 rounded-lg bg-surface/40 border border-default">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-sm uppercase tracking-wider">
                                    Condition Rules
                                  </p>
                                  <Button
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
                                    variant="primary"
                                  >
                                    {<Icon icon="hugeicons:plus-sign" />}
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
                                              selectedKey={
                                                condition.condition_type
                                              }
                                              onSelectionChange={(e) => {
                                                const newItems = [
                                                  ...action.condition
                                                    .condition_items,
                                                ];
                                                newItems[index].condition_type =
                                                  e;
                                                setAction({
                                                  ...action,
                                                  condition: {
                                                    ...action.condition,
                                                    condition_items: newItems,
                                                  },
                                                });
                                              }}
                                            >
                                              <Label>{"Type"}</Label>
                                              <Select.Trigger>
                                                <Select.Value />
                                                <Select.Indicator />
                                              </Select.Trigger>
                                              <Select.Popover>
                                                <ListBox>
                                                  <ListBox.Item
                                                    key="status"
                                                    id="status"
                                                    textValue="Status"
                                                  >
                                                    Status
                                                    <ListBox.ItemIndicator />
                                                  </ListBox.Item>
                                                  <ListBox.Item
                                                    key="message"
                                                    id="message"
                                                    textValue="Message"
                                                  >
                                                    Message
                                                    <ListBox.ItemIndicator />
                                                  </ListBox.Item>
                                                </ListBox>
                                              </Select.Popover>
                                            </Select>

                                            {condition.condition_type ===
                                            "status" ? (
                                              <Select
                                                className="w-2/3"
                                                selectedKey={
                                                  condition.condition_value
                                                }
                                                onSelectionChange={(e) => {
                                                  const newItems = [
                                                    ...action.condition
                                                      .condition_items,
                                                  ];
                                                  newItems[
                                                    index
                                                  ].condition_value = e;
                                                  setAction({
                                                    ...action,
                                                    condition: {
                                                      ...action.condition,
                                                      condition_items: newItems,
                                                    },
                                                  });
                                                }}
                                              >
                                                <Label>{"Value"}</Label>
                                                <Select.Trigger>
                                                  <Select.Value />
                                                  <Select.Indicator />
                                                </Select.Trigger>
                                                <Select.Popover>
                                                  <ListBox>
                                                    <ListBox.Item
                                                      key="success"
                                                      id="success"
                                                      textValue="Success"
                                                    >
                                                      Success
                                                      <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                    <ListBox.Item
                                                      key="failed"
                                                      id="failed"
                                                      textValue="Failed"
                                                    >
                                                      Failed
                                                      <ListBox.ItemIndicator />
                                                    </ListBox.Item>
                                                  </ListBox>
                                                </Select.Popover>
                                              </Select>
                                            ) : (
                                              <TextField
                                                value={
                                                  condition.condition_value
                                                }
                                                onChange={(e) => {
                                                  const newItems = [
                                                    ...action.condition
                                                      .condition_items,
                                                  ];
                                                  newItems[
                                                    index
                                                  ].condition_value = e;
                                                  setAction({
                                                    ...action,
                                                    condition: {
                                                      ...action.condition,
                                                      condition_items: newItems,
                                                    },
                                                  });
                                                }}
                                              >
                                                <Label>{"Value"}</Label>
                                                <InputGroup>
                                                  <Input className="w-2/3" />
                                                </InputGroup>
                                              </TextField>
                                            )}
                                          </div>
                                        </div>

                                        <Button
                                          isDisabled={
                                            action.condition.condition_items
                                              .length <= 1
                                          }
                                          variant="danger"
                                          onPress={() => {
                                            const newItems =
                                              action.condition.condition_items.filter(
                                                (_: any, i: number) =>
                                                  i !== index,
                                              );
                                            setAction({
                                              ...action,
                                              condition: {
                                                ...action.condition,
                                                condition_items: newItems,
                                              },
                                            });
                                          }}
                                          className="aspect-square p-0"
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
                        </Tabs.Panel>
                      )}
                    </Tabs>
                  </div>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button
                    variant="danger"
                    onPress={() => {
                      cancel();
                    }}
                  >
                    {<Icon icon="hugeicons:cancel-01" width={18} />}
                    Cancel
                  </Button>
                  <Button
                    isPending={isLoading}
                    onPress={
                      !isProject
                        ? isFailurePipeline
                          ? updateFlowFailurePipelineAction
                          : updateFlowAction
                        : updateProjectAction
                    }
                    variant="primary"
                  >
                    {<Icon icon="hugeicons:floppy-disk" width={18} />}
                    Save Changes
                  </Button>
                </Drawer.Footer>
              </>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
