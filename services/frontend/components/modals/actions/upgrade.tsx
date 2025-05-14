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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
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
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

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

  async function updateFlowAction() {
    setLoading(true);
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
      router.refresh();
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
      router.refresh();
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
    <main>
      <Modal
        isDismissable={false}
        isOpen={isOpen}
        placement="center"
        size="full"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <p className="text-lg font-bold">
                  Upgrade Action to newer Version
                </p>
              </ModalHeader>
              <ModalBody className="overflow-y-auto max-w-fit">
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="grid lg:grid-cols-9 gap-4">
                  <div className="col-span-4">
                    <Card
                      className="border-2 border-default-200 border-primary-200"
                      radius="sm"
                    >
                      <CardBody>
                        <div className="flex items-center gap-2">
                          <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                            <Icon icon={actionOldVersion.icon} width={26} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex flex-cols gap-2 items-center">
                              <p className="text-lg font-bold">
                                {actionOldVersion.custom_name ||
                                  actionOldVersion.name}
                              </p>
                              <Chip
                                color="primary"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                Ver. {actionOldVersion.version}
                              </Chip>
                              <Chip
                                color="default"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                ID. {actionOldVersion.id}
                              </Chip>
                            </div>
                            <p className="text-sm text-default-500">
                              {actionOldVersion.custom_description ||
                                actionOldVersion.description}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    <div className="flex w-full flex-col gap-4 mt-2">
                      {/* Status */}
                      <div className="flex flex-col">
                        <div className="flex-cols flex items-center gap-2">
                          <p className="text-lg font-bold text-default-600">
                            Status
                          </p>
                        </div>
                        <Spacer y={2} />
                        <div>
                          <ButtonGroup radius="sm" variant="flat">
                            <Button
                              className={`${actionOldVersion.active ? "bg-success" : ""}`}
                            >
                              <Icon
                                className={`${actionOldVersion.active ? "" : "text-success"}`}
                                icon="solar:check-circle-linear"
                                width={18}
                              />
                              Enabled
                            </Button>
                            <Button
                              className={`${!actionOldVersion.active ? "bg-danger" : ""}`}
                            >
                              <Icon
                                className={`${!actionOldVersion.active ? "" : "text-danger"}`}
                                icon="solar:close-circle-linear"
                                width={18}
                              />
                              Disabled
                            </Button>
                          </ButtonGroup>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-default-600">
                          Details
                        </p>
                        <Spacer y={2} />
                        <div className="grid lg:grid-cols-2 gap-2">
                          <Input
                            description="Custom name for this action (optional)"
                            label="Custom Name"
                            type="text"
                            value={actionOldVersion.custom_name}
                          />
                          <Input
                            description="Custom description for this action (optional)"
                            label="Custom Description"
                            type="text"
                            value={actionOldVersion.custom_description}
                          />
                          {!isFailurePipeline && (
                            <Select
                              label="Failure Pipeline"
                              placeholder="Select an failure pipeline"
                              selectedKeys={[
                                actionOldVersion.failure_pipeline_id || "none",
                              ]}
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
                        <Spacer y={2} />
                        <p className="text-lg font-bold text-default-600">
                          Parameters
                        </p>
                        <Spacer y={2} />
                        {actionOldVersionParamsCategorys.length > 0 ? (
                          <div className="flex flex-col w-full gap-2">
                            {actionOldVersionParamsCategorys.map(
                              (category: any) => (
                                <div key={category}>
                                  <p className="font-semibold text-default-500 mb-2">
                                    {category}
                                  </p>
                                  <div className="grid lg:grid-cols-2 gap-2">
                                    {actionOldVersion.params.map(
                                      (param: any) => {
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
                                            />
                                          ) : param.type === "boolean" ? (
                                            <Select
                                              key={param.key}
                                              description={param?.description}
                                              isRequired={param.required}
                                              label={param.title || param.key}
                                              selectedKeys={[param.value]}
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
                                            />
                                          ) : param.type === "password" ? (
                                            <Input
                                              key={param.key}
                                              description={param?.description}
                                              isRequired={param.required}
                                              label={param.title || param.key}
                                              type={param.type}
                                              value={param.value}
                                            />
                                          ) : param.type === "select" ? (
                                            <Select
                                              key={param.key}
                                              description={param?.description}
                                              isRequired={param.required}
                                              label={param.title || param.key}
                                              selectedKeys={[param.value]}
                                            >
                                              {param.options.map(
                                                (option: any) => (
                                                  <SelectItem key={option.key}>
                                                    {option.value}
                                                  </SelectItem>
                                                ),
                                              )}
                                            </Select>
                                          ) : null
                                        ) : null;
                                      },
                                    )}
                                  </div>
                                  <Divider className="mb-2 mt-2" />
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p>No parameters for this action found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex flex-cols items-center justify-center gap-4">
                    <p className="font-bold">Old</p>
                    <Divider
                      className="w-1 bg-primary rounded-full"
                      orientation="vertical"
                    />
                    <p className="font-bold">New</p>
                  </div>
                  <div className="col-span-4">
                    <Card
                      className="border-2 border-default-200 border-primary"
                      radius="sm"
                    >
                      <CardBody>
                        <div className="flex items-center gap-2">
                          <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                            <Icon icon={actionNewVersion.icon} width={26} />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex flex-cols gap-2 items-center">
                              <p className="text-lg font-bold">
                                {actionOldVersion.custom_name ||
                                  actionNewVersion.name}
                              </p>
                              <Chip
                                color="primary"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                Ver. {actionNewVersion.version}
                              </Chip>
                              <Chip
                                color="default"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                ID. {actionOldVersion.id}
                              </Chip>
                            </div>
                            <p className="text-sm text-default-500">
                              {actionOldVersion.custom_description ||
                                actionNewVersion.description}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                    <div className="flex w-full flex-col gap-4 mt-2">
                      {/* Status */}
                      <div className="flex flex-col">
                        <div className="flex-cols flex items-center gap-2">
                          <p className="text-lg font-bold text-default-600">
                            Status
                          </p>
                        </div>
                        <Spacer y={2} />
                        <div>
                          <ButtonGroup radius="sm" variant="flat">
                            <Button
                              className={`${actionOldVersion.active ? "bg-success" : ""}`}
                              onPress={() => {
                                setActionNewVersion({
                                  ...actionNewVersion,
                                  active: true,
                                });
                              }}
                            >
                              <Icon
                                className={`${actionOldVersion.active ? "" : "text-success"}`}
                                icon="solar:check-circle-linear"
                                width={18}
                              />
                              Enabled
                            </Button>
                            <Button
                              className={`${!actionOldVersion.active ? "bg-danger" : ""}`}
                              onPress={() => {
                                setActionNewVersion({
                                  ...actionNewVersion,
                                  active: false,
                                });
                              }}
                            >
                              <Icon
                                className={`${!actionOldVersion.active ? "" : "text-danger"}`}
                                icon="solar:close-circle-linear"
                                width={18}
                              />
                              Disabled
                            </Button>
                          </ButtonGroup>
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-default-600">
                          Details
                        </p>
                        <p className="text-sm text-default-500">
                          You are currently not able to edit Action Details
                          during upgrades.
                        </p>
                        <Spacer y={2} />
                        <div className="grid lg:grid-cols-2 gap-2">
                          <Input
                            isDisabled
                            description="Custom name for this action (optional)"
                            label="Custom Name"
                            type="text"
                            value={actionOldVersion.custom_name}
                            onValueChange={(e) =>
                              setActionNewVersion({
                                ...actionNewVersion,
                                custom_name: e,
                              })
                            }
                          />
                          <Input
                            isDisabled
                            description="Custom description for this action (optional)"
                            label="Custom Description"
                            type="text"
                            value={actionOldVersion.custom_description}
                            onValueChange={(e) =>
                              setActionNewVersion({
                                ...actionNewVersion,
                                custom_description: e,
                              })
                            }
                          />
                          {!isFailurePipeline && (
                            <Select
                              isDisabled
                              label="Failure Pipeline"
                              placeholder="Select an failure pipeline"
                              selectedKeys={[
                                actionOldVersion.failure_pipeline_id || "none",
                              ]}
                              onSelectionChange={(e) => {
                                setActionNewVersion({
                                  ...actionNewVersion,
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
                        <Spacer y={2} />
                        <p className="text-lg font-bold text-default-600">
                          Parameters
                        </p>
                        <Spacer y={2} />
                        {actionNewVersionParamsCategorys.length > 0 ? (
                          <div className="flex flex-col w-full gap-2">
                            {actionNewVersionParamsCategorys.map(
                              (category: any) => (
                                <div key={category}>
                                  <p className="font-semibold text-default-500 mb-2">
                                    {category}
                                  </p>
                                  <div className="grid lg:grid-cols-2 gap-2">
                                    {actionNewVersion.params.map(
                                      (param: any) => {
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
                                                setActionNewVersion({
                                                  ...actionNewVersion,
                                                  params:
                                                    actionNewVersion.params.map(
                                                      (x: any) => {
                                                        if (
                                                          x.key === param.key
                                                        ) {
                                                          return {
                                                            ...x,
                                                            value: e,
                                                          };
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

                                                setActionNewVersion({
                                                  ...actionNewVersion,
                                                  params:
                                                    actionNewVersion.params.map(
                                                      (x: any) => {
                                                        if (
                                                          x.key === param.key
                                                        ) {
                                                          return {
                                                            ...x,
                                                            value,
                                                          };
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
                                                setActionNewVersion({
                                                  ...actionNewVersion,
                                                  params:
                                                    actionNewVersion.params.map(
                                                      (x: any) => {
                                                        if (
                                                          x.key === param.key
                                                        ) {
                                                          return {
                                                            ...x,
                                                            value: e,
                                                          };
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
                                                setActionNewVersion({
                                                  ...actionNewVersion,
                                                  params:
                                                    actionNewVersion.params.map(
                                                      (x: any) => {
                                                        if (
                                                          x.key === param.key
                                                        ) {
                                                          return {
                                                            ...x,
                                                            value: e,
                                                          };
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

                                                setActionNewVersion({
                                                  ...actionNewVersion,
                                                  params:
                                                    actionNewVersion.params.map(
                                                      (x: any) => {
                                                        if (
                                                          x.key === param.key
                                                        ) {
                                                          return {
                                                            ...x,
                                                            value,
                                                          };
                                                        }

                                                        return x;
                                                      },
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
                                          ) : null
                                        ) : null;
                                      },
                                    )}
                                  </div>
                                  <Divider className="mb-2 mt-2" />
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p>No parameters for this action found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="ghost" onPress={cancel}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isLoading}
                  variant="flat"
                  onPress={
                    isFailurePipeline
                      ? updateFlowFailurePipelineAction
                      : updateFlowAction
                  }
                >
                  Upgrade Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
