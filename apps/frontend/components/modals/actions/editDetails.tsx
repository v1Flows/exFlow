import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Alert,
  Button,
  ButtonGroup,
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
  Tooltip,
  Tabs,
  Tab,
  Switch,
} from "@heroui/react";
import React, { useEffect, useState } from "react";

import UpdateFlowActionsDetails from "@/lib/fetch/flow/PUT/UpdateActionsDetails";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
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

export default function EditFlowActionsDetails({
  disclosure,
  flow,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
}) {
  const { isOpen, onOpenChange } = disclosure;
  const { refreshFlowData } = useRefreshCache();

  const [isLoading, setLoading] = useState(false);
  const [encryptedActionParams, setEncryptedActionParams] = useState(true);
  const [execParallel, setExecParallel] = useState(true);
  const [patterns, setPatterns] = useState([] as any);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    setEncryptedActionParams(flow.encrypt_action_params);
    setExecParallel(flow.exec_parallel);
    setPatterns(flow.patterns);
  }, [isOpen]);

  function cancel() {
    onOpenChange();
  }

  async function updateDetails() {
    setLoading(true);
    const res = (await UpdateFlowActionsDetails(
      flow.id,
      encryptedActionParams,
      execParallel,
      patterns,
    )) as any;

    if (res.error) {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      setLoading(false);

      return;
    }

    if (res.success) {
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
      addToast({
        title: "Flow",
        description: "Flow Actions Details updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "Failed to update Flow Actions Details",
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
              <p className="text-lg font-bold">Edit Actions Details</p>
              <p className="text-sm text-default-500 font-normal">
                Actions Details determine how the action will be executed and
                for which patterns it should check the alert payload for.
              </p>
            </DrawerHeader>
            <DrawerBody className="overflow-hidden flex flex-col">
              {error && <ErrorCard error={errorText} message={errorMessage} />}

              <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
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
                    <div className="flex flex-col gap-6 pb-4">
                      {/* Encryption Settings */}
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-sm uppercase tracking-wider">
                          Action Parameters
                        </p>
                        <Alert
                          hideIconWrapper
                          color="primary"
                          description="All existing action parameters will be automatically encrypted/unencrypted when this setting is changed."
                          title="Info"
                          variant="flat"
                        />
                        <div className="flex items-center justify-between p-4 rounded-lg bg-content1/40 border border-default-200">
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">Encryption Status</p>
                            <p className="text-tiny text-default-500">
                              {encryptedActionParams
                                ? "Parameters are encrypted"
                                : "Parameters are unencrypted"}
                            </p>
                          </div>
                          <Switch
                            color="success"
                            isSelected={encryptedActionParams}
                            thumbIcon={({ isSelected, className }) =>
                              isSelected ? (
                                <Icon
                                  className={className}
                                  icon="solar:lock-linear"
                                />
                              ) : (
                                <Icon
                                  className={className}
                                  icon="solar:lock-unlocked-linear"
                                />
                              )
                            }
                            onValueChange={setEncryptedActionParams}
                          >
                            {encryptedActionParams
                              ? "Encrypted"
                              : "Unencrypted"}
                          </Switch>
                        </div>
                      </div>

                      {/* Execution Order */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm uppercase tracking-wider">
                            Execution Order
                          </p>
                          <Tooltip content="Defined Actions will either be executed one after the other or all in parallel. If in Sequential type one action fails, the others won't be processed anymore.">
                            <Icon
                              className="text-default-500"
                              icon="solar:info-circle-linear"
                              width={18}
                            />
                          </Tooltip>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-content1/40 border border-default-200">
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">Execution Mode</p>
                            <p className="text-tiny text-default-500">
                              {execParallel
                                ? "Actions run in parallel"
                                : "Actions run sequentially"}
                            </p>
                          </div>
                          <ButtonGroup radius="sm" variant="flat">
                            <Button
                              className={`${execParallel ? "bg-primary text-primary-foreground" : ""}`}
                              startContent={
                                <Icon
                                  icon="solar:align-horizontal-center-outline"
                                  width={20}
                                />
                              }
                              onPress={() => setExecParallel(true)}
                            >
                              Parallel
                            </Button>
                            <Button
                              className={`${!execParallel ? "bg-primary text-primary-foreground" : ""}`}
                              startContent={
                                <Icon
                                  icon="solar:align-vertical-center-linear"
                                  width={20}
                                />
                              }
                              onPress={() => setExecParallel(false)}
                            >
                              Sequential
                            </Button>
                          </ButtonGroup>
                        </div>
                      </div>
                    </div>
                  </Tab>
                  <Tab key="patterns" title="Patterns">
                    <div className="flex flex-col gap-4 pb-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-default-500">
                          You can access object values by using dot (.)
                          notation. Example: commonLabels.alertname or
                          alerts.0.status
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {patterns.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {patterns.map((pattern: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 w-full animate-appearance-in"
                              >
                                <Input
                                  className="flex-1"
                                  label="Key"
                                  placeholder="e.g. commonLabels.alertname"
                                  size="sm"
                                  value={pattern.key}
                                  variant="bordered"
                                  onValueChange={(value) => {
                                    setPatterns([
                                      ...patterns.slice(0, index),
                                      { ...pattern, key: value },
                                      ...patterns.slice(index + 1),
                                    ]);
                                  }}
                                />
                                <Select
                                  disallowEmptySelection
                                  className="w-32"
                                  defaultSelectedKeys={[pattern.type]}
                                  label="Type"
                                  size="sm"
                                  variant="bordered"
                                  onSelectionChange={(key: any) => {
                                    setPatterns([
                                      ...patterns.slice(0, index),
                                      {
                                        ...pattern,
                                        type: key.currentKey,
                                      },
                                      ...patterns.slice(index + 1),
                                    ]);
                                  }}
                                >
                                  <SelectItem key="equals">equals</SelectItem>
                                  <SelectItem key="not_equals">
                                    not equals
                                  </SelectItem>
                                </Select>
                                <Input
                                  className="flex-1"
                                  label="Value"
                                  placeholder="Value to match"
                                  size="sm"
                                  value={pattern.value}
                                  variant="bordered"
                                  onValueChange={(value) => {
                                    setPatterns([
                                      ...patterns.slice(0, index),
                                      { ...pattern, value },
                                      ...patterns.slice(index + 1),
                                    ]);
                                  }}
                                />
                                <Button
                                  isIconOnly
                                  color="danger"
                                  variant="light"
                                  onPress={() => {
                                    setPatterns([
                                      ...patterns.slice(0, index),
                                      ...patterns.slice(index + 1),
                                    ]);
                                  }}
                                >
                                  <Icon
                                    icon="hugeicons:delete-02"
                                    width={20}
                                  />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-default-500 border-2 border-dashed border-default-200 rounded-lg">
                            <Icon
                              className="mb-4 opacity-50"
                              icon="hugeicons:search-02"
                              width={48}
                            />
                            <p>No patterns defined yet.</p>
                            <p className="text-tiny">
                              Add a pattern to filter alerts.
                            </p>
                          </div>
                        )}

                        <Button
                          color="primary"
                          startContent={<Icon icon="hugeicons:plus-sign" />}
                          variant="flat"
                          onPress={() => {
                            setPatterns([
                              ...patterns,
                              { key: "", type: "equals", value: "" },
                            ]);
                          }}
                        >
                          Add Pattern
                        </Button>
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
                startContent={<Icon icon="hugeicons:floppy-disk" width={18} />}
                onPress={updateDetails}
              >
                Update Details
              </Button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
