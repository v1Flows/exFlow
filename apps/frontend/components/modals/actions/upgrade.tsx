import {
  Button,
  ButtonGroup,
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
export default function UpgradeActionModal({
  disclosure,
  flow,
  targetAction,
  updatedAction,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseOverlayStateReturn;
  runners: any;
  flow: any;
  targetAction: any;
  updatedAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const { refreshFlowData } = useRefreshCache();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  // old version
  const [actionOldVersion, setActionOldVersion] = useState({} as any);
  const [actionOldVersionParamsCategorys, setActionOldVersionParamsCategorys] =
    useState([] as any);
  // new version
  const [actionNewVersion, setActionNewVersion] = useState({} as any);
  const [actionNewVersionParamsCategorys, setActionNewVersionParamsCategorys] =
    useState([] as any);
  useEffect(() => {
    if (!targetAction || !updatedAction) {
      return;
    }
    setActionOldVersion(targetAction);
    setActionNewVersion(updatedAction);
    getOldVersionParamsCategorys(targetAction.params);
    getNewVersionParamsCategorys(updatedAction.params);
  }, [targetAction, updatedAction]);
  function getOldVersionParamsCategorys(params: any) {
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
    setActionOldVersionParamsCategorys(Array.from(categories));
  }
  function getNewVersionParamsCategorys(params: any) {
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
    setActionNewVersionParamsCategorys(Array.from(categories));
  }
  function cancel() {
    onOpenChange(false);
  }
  function checkRequiredParams() {
    let requiredParams = 0;
    let requiredParamsFilled = 0;
    actionNewVersion.params.map((param: any) => {
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
      if (flowAction.id === actionOldVersion.id) {
        flowAction.active = actionOldVersion.active;
        flowAction.icon = actionNewVersion.icon;
        flowAction.params = actionNewVersion.params;
        flowAction.version = actionNewVersion.version;
        flowAction.custom_name = actionOldVersion.custom_name;
        flowAction.custom_description = actionOldVersion.custom_description;
        flowAction.failure_pipeline_id =
          actionOldVersion.failure_pipeline_id === "none"
            ? ""
            : actionOldVersion.failure_pipeline_id;
        flowAction.update_available = false;
        flowAction.update_version = "";
        flowAction.updated_action = null;
      }
    });
    const res = (await UpdateFlowActions(flow.id, flow.actions)) as any;
    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage("An error occurred while upgrading the action.");
      setLoading(false);
      return;
    }
    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Flow", { description: "Action upgraded successfully" });
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while upgrading the action.",
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
      if (pipelineAction.id === actionOldVersion.id) {
        pipelineAction.active = actionOldVersion.active;
        pipelineAction.icon = actionNewVersion.icon;
        pipelineAction.params = actionNewVersion.params;
        pipelineAction.version = actionNewVersion.version;
        pipelineAction.custom_name = actionOldVersion.custom_name;
        pipelineAction.custom_description = actionOldVersion.custom_description;
        pipelineAction.update_available = false;
        pipelineAction.update_version = "";
        pipelineAction.updated_action = null;
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
      setErrorMessage("An error occurred while upgrading the action.");
      setLoading(false);
      return;
    }
    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Flow", {
        description: "Action successfully upgraded to newer version",
      });
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while upgrading the action.",
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
                      Upgrade Action to newer Version
                    </p>
                    <p className="text-sm text-muted font-normal">
                      Upgrade this action to the latest version. Review changes
                      and configure new parameters.
                    </p>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="overflow-hidden flex flex-col">
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}

                  <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                    {/* Header Card showing upgrade info */}
                    <Card className="bg-surface/60 backdrop-blur-md border border-accent/20 shadow-sm">
                      <Card.Content>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex size-14 items-center justify-center rounded-xl bg-default text-muted shrink-0">
                              <Icon icon={actionOldVersion.icon} width={32} />
                            </div>
                            <div className="flex flex-col">
                              <p className="text-lg font-bold text-muted">
                                {actionOldVersion.custom_name ||
                                  actionOldVersion.name}
                              </p>
                              <Chip>
                                <Chip.Label>
                                  v{actionOldVersion.version}
                                </Chip.Label>
                              </Chip>
                            </div>
                          </div>

                          <Icon
                            className="text-muted"
                            icon="hugeicons:arrow-right-01"
                            width={24}
                          />

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                              <p className="text-lg font-bold text-accent">
                                {actionNewVersion.custom_name ||
                                  actionNewVersion.name}
                              </p>
                              <Chip color="accent">
                                <Chip.Label>
                                  v{actionNewVersion.version}
                                </Chip.Label>
                              </Chip>
                            </div>
                            <div className="flex size-14 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                              <Icon icon={actionNewVersion.icon} width={32} />
                            </div>
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
                          <Tabs.Tab id={"configuration"}>
                            {"Configuration"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                        </Tabs.List>
                      </Tabs.ListContainer>
                      <Tabs.Panel id={"configuration"}>
                        <div className="flex flex-col gap-4 pb-4">
                          {/* Status */}
                          <div className="flex flex-col gap-2">
                            <p className="font-bold text-sm uppercase tracking-wider">
                              Status
                            </p>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-surface/40 border border-default">
                              <div className="flex flex-col gap-1">
                                <p className="font-medium">Action Status</p>
                                <p className="text-xs text-muted">
                                  {actionNewVersion.active
                                    ? "Action is enabled"
                                    : "Action is disabled"}
                                </p>
                              </div>
                              <Switch
                                isSelected={actionNewVersion.active}
                                onChange={(e) =>
                                  setActionNewVersion({
                                    ...actionNewVersion,
                                    active: e,
                                  })
                                }
                              >
                                <Switch.Control>
                                  <Switch.Thumb />
                                </Switch.Control>
                                <Switch.Content>
                                  {actionNewVersion.active
                                    ? "Enabled"
                                    : "Disabled"}
                                </Switch.Content>
                              </Switch>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-col gap-2">
                            <p className="font-bold text-sm uppercase tracking-wider">
                              Details
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextField
                                isDisabled
                                value={actionOldVersion.custom_name}
                              >
                                <Label>{"Custom Name"}</Label>
                                <InputGroup>
                                  <Input />
                                </InputGroup>
                                <Description>
                                  {"Inherited from old version"}
                                </Description>
                              </TextField>
                              <TextField
                                isDisabled
                                value={actionOldVersion.custom_description}
                              >
                                <Label>{"Custom Description"}</Label>
                                <InputGroup>
                                  <Input />
                                </InputGroup>
                                <Description>
                                  {"Inherited from old version"}
                                </Description>
                              </TextField>
                            </div>
                          </div>

                          {/* Parameters */}
                          <div className="flex flex-col gap-2">
                            <p className="font-bold text-sm uppercase tracking-wider">
                              Parameters
                            </p>
                            {actionNewVersionParamsCategorys.length > 0 ? (
                              <div className="flex flex-col w-full gap-6">
                                {actionNewVersionParamsCategorys.map(
                                  (category: any) => (
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
                                        {actionNewVersion.params.map(
                                          (param: any) => {
                                            if (
                                              (param.category ||
                                                "Uncategorized") !== category
                                            )
                                              return null;
                                            let isDisabled = false;
                                            if (param.depends_on.key !== "") {
                                              const dependsOnParam =
                                                actionNewVersion.params.find(
                                                  (p: any) =>
                                                    p.key ===
                                                    param.depends_on.key,
                                                );
                                              if (!dependsOnParam)
                                                isDisabled = true;
                                              else if (
                                                param.depends_on.value === "*"
                                              )
                                                isDisabled =
                                                  !dependsOnParam.value ||
                                                  dependsOnParam.value.trim() ===
                                                    "";
                                              else
                                                isDisabled =
                                                  dependsOnParam.value !==
                                                  param.depends_on.value;
                                            }
                                            const commonProps = {
                                              key: param.key,
                                              "aria-label":
                                                param.title || param.key,
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
                                                        setActionNewVersion({
                                                          ...actionNewVersion,
                                                          params:
                                                            actionNewVersion.params.map(
                                                              (x: any) =>
                                                                x.key ===
                                                                param.key
                                                                  ? {
                                                                      ...x,
                                                                      value: e
                                                                        ? "true"
                                                                        : "false",
                                                                    }
                                                                  : x,
                                                            ),
                                                        });
                                                      }}
                                                    >
                                                      <Switch.Control>
                                                        <Switch.Thumb />
                                                      </Switch.Control>
                                                      <Switch.Content>
                                                        <span className="text-sm text-muted">
                                                          {param.value ===
                                                          "true"
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
                                                    setActionNewVersion({
                                                      ...actionNewVersion,
                                                      params:
                                                        actionNewVersion.params.map(
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
                                                    setActionNewVersion({
                                                      ...actionNewVersion,
                                                      params:
                                                        actionNewVersion.params.map(
                                                          (x: any) =>
                                                            x.key === param.key
                                                              ? {
                                                                  ...x,
                                                                  value: e,
                                                                }
                                                              : x,
                                                        ),
                                                    });
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
                                                  setActionNewVersion({
                                                    ...actionNewVersion,
                                                    params:
                                                      actionNewVersion.params.map(
                                                        (x: any) =>
                                                          x.key === param.key
                                                            ? { ...x, value: e }
                                                            : x,
                                                      ),
                                                  });
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
                                          },
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
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
                    isPending={isLoading}
                    onPress={
                      isFailurePipeline
                        ? updateFlowFailurePipelineAction
                        : updateFlowAction
                    }
                    variant="primary"
                  >
                    {<Icon icon="hugeicons:system-update-01" width={18} />}
                    Upgrade Action
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
