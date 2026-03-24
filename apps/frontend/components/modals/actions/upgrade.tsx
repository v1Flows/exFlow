import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  ButtonGroup,
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
  Select,
  SelectItem,
  Spacer,
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

export default function UpgradeActionModal({
  disclosure,
  flow,
  targetAction,
  updatedAction,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow: any;
  targetAction: any;
  updatedAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const { isOpen, onOpenChange } = disclosure;
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
    onOpenChange();
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
      addToast({
        title: "Flow",
        description: "Action upgraded successfully",
        color: "success",
        variant: "flat",
      });
      onOpenChange();
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "An error occurred while upgrading the action.",
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
      addToast({
        title: "Flow",
        description: "Action successfully upgraded to newer version",
        color: "success",
        variant: "flat",
      });
      onOpenChange();
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "An error occurred while upgrading the action.",
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
              <p className="text-lg font-bold">
                Upgrade Action to newer Version
              </p>
              <p className="text-sm text-default-500 font-normal">
                Upgrade this action to the latest version. Review changes and
                configure new parameters.
              </p>
            </DrawerHeader>
            <DrawerBody className="overflow-hidden flex flex-col">
              {error && <ErrorCard error={errorText} message={errorMessage} />}

              <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                {/* Header Card showing upgrade info */}
                <Card className="bg-content1/60 backdrop-blur-md border border-primary/20 shadow-sm">
                  <CardBody>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-xl bg-default-100 text-default-500 shrink-0">
                          <Icon icon={actionOldVersion.icon} width={32} />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-lg font-bold text-default-500">
                            {actionOldVersion.custom_name ||
                              actionOldVersion.name}
                          </p>
                          <Chip size="sm" variant="flat">
                            v{actionOldVersion.version}
                          </Chip>
                        </div>
                      </div>

                      <Icon
                        className="text-default-300"
                        icon="hugeicons:arrow-right-01"
                        width={24}
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <p className="text-lg font-bold text-primary">
                            {actionNewVersion.custom_name ||
                              actionNewVersion.name}
                          </p>
                          <Chip color="primary" size="sm" variant="flat">
                            v{actionNewVersion.version}
                          </Chip>
                        </div>
                        <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon icon={actionNewVersion.icon} width={32} />
                        </div>
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
                  <Tab key="configuration" title="Configuration">
                    <div className="flex flex-col gap-4 pb-4">
                      {/* Status */}
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-sm uppercase tracking-wider">
                          Status
                        </p>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-content1/40 border border-default-200">
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">Action Status</p>
                            <p className="text-tiny text-default-500">
                              {actionNewVersion.active
                                ? "Action is enabled"
                                : "Action is disabled"}
                            </p>
                          </div>
                          <Switch
                            color="success"
                            isSelected={actionNewVersion.active}
                            onValueChange={(e) =>
                              setActionNewVersion({
                                ...actionNewVersion,
                                active: e,
                              })
                            }
                          >
                            {actionNewVersion.active ? "Enabled" : "Disabled"}
                          </Switch>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-sm uppercase tracking-wider">
                          Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            isDisabled
                            description="Inherited from old version"
                            label="Custom Name"
                            value={actionOldVersion.custom_name}
                            variant="bordered"
                          />
                          <Input
                            isDisabled
                            description="Inherited from old version"
                            label="Custom Description"
                            value={actionOldVersion.custom_description}
                            variant="bordered"
                          />
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
                                    <span className="text-default-500 font-medium text-sm uppercase tracking-wider">
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
                                                p.key === param.depends_on.key,
                                            );

                                          if (!dependsOnParam) isDisabled = true;
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
                                                    setActionNewVersion({
                                                      ...actionNewVersion,
                                                      params:
                                                        actionNewVersion.params.map(
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
                                                setActionNewVersion({
                                                  ...actionNewVersion,
                                                  params:
                                                    actionNewVersion.params.map(
                                                      (x: any) =>
                                                        x.key === param.key
                                                          ? {
                                                              ...x,
                                                              value:
                                                                Array.from(
                                                                  e,
                                                                ).join(""),
                                                            }
                                                          : x,
                                                    ),
                                                });
                                              }}
                                            >
                                              {param.options.map(
                                                (option: any) => (
                                                  <SelectItem key={option.key}>
                                                    {option.value}
                                                  </SelectItem>
                                                ),
                                              )}
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
                                          />
                                        );
                                      },
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
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
                isLoading={isLoading}
                startContent={
                  <Icon icon="hugeicons:system-update-01" width={18} />
                }
                onPress={
                  isFailurePipeline
                    ? updateFlowFailurePipelineAction
                    : updateFlowAction
                }
              >
                Upgrade Action
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}