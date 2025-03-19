import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  ButtonGroup,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  Spacer,
  Textarea,
  Tooltip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";

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
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow: any;
  targetAction: any;
}) {
  const router = useRouter();
  const { isOpen, onOpenChange } = disclosure;

  const [isLoading, setLoading] = useState(false);
  const [action, setAction] = useState({} as any);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    setAction(targetAction);
  }, [targetAction]);

  function cancel() {
    onOpenChange();
  }

  async function updateAction() {
    setLoading(true);
    flow.actions.map((flowAction: any) => {
      if (flowAction.id === action.id) {
        flowAction.active = action.active;
        flowAction.params = action.params;
        flowAction.custom_name = action.custom_name;
        flowAction.custom_description = action.custom_description;
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
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Edit Action</p>
                  <p className="text-sm text-default-500">{action.id}</p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex w-full flex-col gap-4">
                  {/* Status */}
                  <div className="flex flex-col">
                    <div className="flex-cols flex items-center gap-2">
                      <p className="text-lg font-bold text-default-500">
                        Status
                      </p>
                      <Tooltip content="Defined Actions will either be executed one after the other or all in parallel. If in Sequential type one action fails, the others won't be processed anymore.">
                        <Icon
                          className="text-default-500"
                          icon="solar:info-circle-linear"
                          width={18}
                        />
                      </Tooltip>
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
                    <p className="text-lg font-bold text-default-500">
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
                    </div>
                    <p className="text-lg font-bold text-default-500">
                      Parameters
                    </p>
                    <Spacer y={2} />
                    {action.params && action.params.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {action.params.map((param: any) => {
                          return param.type === "text" ||
                            param.type === "number" ||
                            param.type === "boolean" ? (
                            <Input
                              key={param.key}
                              description={param.description}
                              isRequired={param.required}
                              label={param.key}
                              type={param.type}
                              value={
                                action.params.find(
                                  (x: any) => x.key === param.key,
                                )?.value || ""
                              }
                              onValueChange={(e) => {
                                setAction({
                                  ...action,
                                  params: action.params.map((x: any) => {
                                    if (x.key === param.key) {
                                      return { ...x, value: e };
                                    }

                                    return x;
                                  }),
                                });
                              }}
                            />
                          ) : param.type === "textarea" ? (
                            <Textarea
                              key={param.key}
                              description={param.description}
                              isRequired={param.required}
                              label={param.key}
                              type={param.type}
                              value={
                                action.params.find(
                                  (x: any) => x.key === param.key,
                                )?.value || ""
                              }
                              onValueChange={(e) => {
                                setAction({
                                  ...action,
                                  params: action.params.map((x: any) => {
                                    if (x.key === param.key) {
                                      return { ...x, value: e };
                                    }

                                    return x;
                                  }),
                                });
                              }}
                            />
                          ) : param.type === "password" ? (
                            <Input
                              key={param.key}
                              description={param?.description}
                              isRequired={param.required}
                              label={param.key}
                              type={param.type}
                              value={
                                action.params.find(
                                  (x: any) => x.key === param.key,
                                )?.value || ""
                              }
                              onValueChange={(e) => {
                                setAction({
                                  ...action,
                                  params: action.params.map((x: any) => {
                                    if (x.key === param.key) {
                                      return { ...x, value: e };
                                    }

                                    return x;
                                  }),
                                });
                              }}
                            />
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p>No parameters for this action found.</p>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="ghost" onPress={cancel}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  variant="flat"
                  onPress={updateAction}
                >
                  Update Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
