import {
  Alert,
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
  ScrollShadow,
  Select,
  Switch,
  Tabs,
  TextArea,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
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
export default function CopyActionToDifferentFlowModal({
  disclosure,
  flows,
  projects,
  flow,
  copyAction,
  isFailurePipeline,
}: {
  disclosure: UseOverlayStateReturn;
  runners: any;
  flows: any;
  projects: any;
  flow: any;
  copyAction: any;
  isFailurePipeline?: boolean;
}) {
  const router = useRouter();
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
      toast.success("Action Copy", {
        description: "Action successfully copied to the target flow",
      });
      onOpenChange(false);
      router.refresh();
    } else {
      setLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Action Copy", {
        description:
          "An error occurred while copying the action to the target flow",
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
      toast.success("Action Copy", {
        description:
          "Action successfully copied to the target flow failure pipeline",
      });
      onOpenChange(false);
      router.refresh();
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Action Copy", {
        description:
          "An error occurred while copying the action to the target flow failure pipeline",
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
                    <p className="text-lg font-bold">
                      Copy Action to another Flow
                    </p>
                    <p className="text-sm text-muted font-normal">
                      Copy this action to another flow with all the details it
                      currently has.
                    </p>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="overflow-hidden flex flex-col">
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}

                  <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                    {/* Action Info Card */}
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
                          <Tabs.Tab id={"target"}>
                            {"Target Flow"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                          <Tabs.Tab id={"general"}>
                            {"General Settings"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                          <Tabs.Tab id={"parameters"}>
                            {"Parameters"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                        </Tabs.List>
                      </Tabs.ListContainer>
                      <Tabs.Panel id={"target"}>
                        <div className="flex flex-col gap-4 pb-4">
                          <Select
                            selectedKey={
                              Array.from(
                                targetFlow?.id ? [targetFlow.id] : [],
                              )[0] ?? null
                            }
                            isRequired
                            placeholder="Select the flow to copy the action to"
                            onSelectionChange={(e) => {
                              setTargetFlow(
                                flows.find((fw: any) => fw.id === e),
                              );
                            }}
                          >
                            <Label>{"Target Flow"}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {flows.map((fw: any) => (
                                  <ListBox.Item
                                    key={fw.id}
                                    isDisabled={fw.id === flow.id}
                                    textValue={fw.name}
                                    id={fw.id}
                                  >
                                    <div className="flex gap-2 items-center">
                                      {fw.name}
                                      {fw.id === flow.id && (
                                        <Chip color="accent">
                                          <Chip.Label>Current</Chip.Label>
                                        </Chip>
                                      )}
                                      <Chip color="accent">
                                        <Chip.Label>
                                          Project:{" "}
                                          {projects.find(
                                            (p: any) => p.id === fw.project_id,
                                          )?.name || "N/A"}
                                        </Chip.Label>
                                      </Chip>
                                    </div>
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                          {isFailurePipeline && (
                            <Select
                              selectedKey={
                                Array.from(
                                  targetFailurePipeline?.id
                                    ? [targetFailurePipeline.id]
                                    : [],
                                )[0] ?? null
                              }
                              isRequired
                              isDisabled={
                                !targetFlow?.failure_pipelines ||
                                targetFlow?.failure_pipelines.length === 0
                              }
                              placeholder="Select the failure pipeline to copy the action to"
                              onSelectionChange={(e) => {
                                setTargetFailurePipeline(
                                  targetFlow?.failure_pipelines.find(
                                    (ffp: any) => ffp.id === e,
                                  ),
                                );
                              }}
                            >
                              <Label>{"Target Failure Pipeline"}</Label>
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  {targetFlow?.failure_pipelines?.map(
                                    (ffp: any) => (
                                      <ListBox.Item
                                        key={ffp.id}
                                        textValue={ffp.name}
                                        id={ffp.id}
                                      >
                                        {ffp.name}
                                        <ListBox.ItemIndicator />
                                      </ListBox.Item>
                                    ),
                                  )}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          )}

                          {targetFlow?.id && (
                            <Card className="bg-surface/40 border border-default">
                              <Card.Content>
                                <div className="flex items-center gap-4">
                                  <div className="flex size-10 items-center justify-center rounded-lg bg-default text-muted">
                                    <Icon
                                      icon="hugeicons:workflow-square-10"
                                      width={20}
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <p className="font-bold">
                                      {targetFlow.name}
                                    </p>
                                    <p className="text-xs text-muted">
                                      Project:{" "}
                                      {projects.find(
                                        (p: any) =>
                                          p.id === targetFlow.project_id,
                                      )?.name || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </Card.Content>
                            </Card>
                          )}
                        </div>
                      </Tabs.Panel>
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
                                {"Custom name for this action (optional)"}
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
                                  "Custom description for this action (optional)"
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

                          {!isFailurePipeline && (
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

                          <Alert status={"warning"}>
                            <Alert.Indicator></Alert.Indicator>
                            <Alert.Content>
                              <Alert.Title>{"Note"}</Alert.Title>You cannot copy
                              the current action conditions to a different flow.
                            </Alert.Content>
                          </Alert>
                        </div>
                      </Tabs.Panel>
                      <Tabs.Panel id={"parameters"}>
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
                    </Tabs>
                  </div>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button variant="danger" onPress={cancel}>
                    {<Icon icon="hugeicons:cancel-01" width={18} />}
                    Cancel
                  </Button>
                  <Button
                    isDisabled={
                      isFailurePipeline
                        ? !targetFailurePipeline?.id
                        : !targetFlow?.id
                    }
                    isPending={isLoading}
                    onPress={
                      isFailurePipeline
                        ? copyFlowFailurePipelineAction
                        : copyFlowAction
                    }
                    variant="primary"
                  >
                    {<Icon icon="hugeicons:delivery-sent-02" width={18} />}
                    Copy Action
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
