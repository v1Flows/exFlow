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

export default function CopyActionModal({
  disclosure,
  flow,
  copyAction,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow: any;
  copyAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setLoading] = useState(false);
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

    const newActions = [...flow.actions, sendAction];

    const res = (await AddFlowActions(
      flow.id,
      flow.project_id,
      newActions,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage("An error occurred while adding the action.");
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Action copied successfully",
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
        description: "An error occurred while copying the action.",
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

    const newActions = [...failurePipeline.actions, sendAction];

    const newFailurePipeline = {
      ...failurePipeline,
      actions: newActions,
    };

    const res = (await AddFlowFailurePipelineActions(
      flow.id,
      failurePipeline.id,
      newFailurePipeline,
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Error");
      setErrorMessage("An error occurred while copying the action.");
      setLoading(false);

      return;
    }

    if (res.success) {
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Flow",
        description: "Action copied successfully",
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
        description: "An error occurred while copying the action.",
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
                <p className="text-lg font-bold">Copy Action</p>
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
                <div className="flex w-full flex-col gap-4">
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
                          className={`${action.active ? "bg-success" : ""}`}
                          onPress={() => {
                            setAction({ ...action, active: true });
                          }}
                        >
                          <Icon
                            className={`${action.active ? "" : "text-success"}`}
                            icon="solar:check-circle-linear"
                            width={18}
                          />
                          Enabled
                        </Button>
                        <Button
                          className={`${!action.active ? "bg-danger" : ""}`}
                          onPress={() => {
                            setAction({ ...action, active: false });
                          }}
                        >
                          <Icon
                            className={`${!action.active ? "" : "text-danger"}`}
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
                      {!isFailurePipeline && (
                        <Select
                          label="Failure Pipeline"
                          placeholder="Select an failure pipeline"
                          selectedKeys={[action.failure_pipeline_id || "none"]}
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
                                  return (param.category || "Uncategorized") ===
                                    category ? (
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
                                          const value = Array.from(e).join("");

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
                                          const value = Array.from(e).join("");

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
                      ? copyFlowFailurePipelineAction
                      : copyFlowAction
                  }
                >
                  Copy Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
