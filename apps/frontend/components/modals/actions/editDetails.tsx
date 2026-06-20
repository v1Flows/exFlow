import {
  Alert,
  Button,
  ButtonGroup,
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
  TextField,
  toast,
  Tooltip,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
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
export default function EditFlowActionsDetails({
  disclosure,
  flow,
}: {
  disclosure: UseOverlayStateReturn;
  flow: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
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
    onOpenChange(false);
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
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
      toast.success("Flow", {
        description: "Flow Actions Details updated successfully",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "Failed to update Flow Actions Details",
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
                    <p className="text-lg font-bold">Edit Actions Details</p>
                    <p className="text-sm text-muted font-normal">
                      Actions Details determine how the action will be executed
                      and for which patterns it should check the alert payload
                      for.
                    </p>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="overflow-hidden flex flex-col">
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}

                  <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
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
                          <Tabs.Tab id={"patterns"}>
                            {"Patterns"}
                            <Tabs.Indicator />
                          </Tabs.Tab>
                        </Tabs.List>
                      </Tabs.ListContainer>
                      <Tabs.Panel id={"general"}>
                        <div className="flex flex-col gap-6 pb-4">
                          {/* Encryption Settings */}
                          <div className="flex flex-col gap-2">
                            <p className="font-bold text-sm uppercase tracking-wider">
                              Action Parameters
                            </p>
                            <Alert status={"accent"}>
                              <Alert.Indicator></Alert.Indicator>
                              <Alert.Content>
                                <Alert.Title>{"Info"}</Alert.Title>
                                <Alert.Description>
                                  {
                                    "All existing action parameters will be automatically encrypted/unencrypted when this setting is changed."
                                  }
                                </Alert.Description>
                              </Alert.Content>
                            </Alert>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-surface/40 border border-default">
                              <div className="flex flex-col gap-1">
                                <p className="font-medium">Encryption Status</p>
                                <p className="text-xs text-muted">
                                  {encryptedActionParams
                                    ? "Parameters are encrypted"
                                    : "Parameters are unencrypted"}
                                </p>
                              </div>
                              <Switch
                                isSelected={encryptedActionParams}
                                onChange={setEncryptedActionParams}
                              >
                                <Switch.Control>
                                  <Switch.Thumb>
                                    <Icon
                                      icon={
                                        encryptedActionParams
                                          ? "solar:lock-linear"
                                          : "solar:lock-unlocked-linear"
                                      }
                                    />
                                  </Switch.Thumb>
                                </Switch.Control>
                                <Switch.Content>
                                  {encryptedActionParams
                                    ? "Encrypted"
                                    : "Unencrypted"}
                                </Switch.Content>
                              </Switch>
                            </div>
                          </div>

                          {/* Execution Order */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm uppercase tracking-wider">
                                Execution Order
                              </p>
                              <Tooltip>
                                <Tooltip.Trigger>
                                  <Icon
                                    className="text-muted"
                                    icon="solar:info-circle-linear"
                                    width={18}
                                  />
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  {
                                    "Defined Actions will either be executed one after the other or all in parallel. If in Sequential type one action fails, the others won't be processed anymore."
                                  }
                                </Tooltip.Content>
                              </Tooltip>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-surface/40 border border-default">
                              <div className="flex flex-col gap-1">
                                <p className="font-medium">Execution Mode</p>
                                <p className="text-xs text-muted">
                                  {execParallel
                                    ? "Actions run in parallel"
                                    : "Actions run sequentially"}
                                </p>
                              </div>
                              <ButtonGroup>
                                <Button
                                  className={`${execParallel ? "bg-accent text-accent-foreground" : ""}`}
                                  onPress={() => setExecParallel(true)}
                                >
                                  {
                                    <Icon
                                      icon="solar:align-horizontal-center-outline"
                                      width={20}
                                    />
                                  }
                                  Parallel
                                </Button>
                                <Button
                                  className={`${!execParallel ? "bg-accent text-accent-foreground" : ""}`}
                                  onPress={() => setExecParallel(false)}
                                >
                                  {
                                    <Icon
                                      icon="solar:align-vertical-center-linear"
                                      width={20}
                                    />
                                  }
                                  Sequential
                                </Button>
                              </ButtonGroup>
                            </div>
                          </div>
                        </div>
                      </Tabs.Panel>
                      <Tabs.Panel id={"patterns"}>
                        <div className="flex flex-col gap-4 pb-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-muted">
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
                                    <TextField
                                      value={pattern.key}
                                      onChange={(value) => {
                                        setPatterns([
                                          ...patterns.slice(0, index),
                                          { ...pattern, key: value },
                                          ...patterns.slice(index + 1),
                                        ]);
                                      }}
                                    >
                                      <Label>{"Key"}</Label>
                                      <InputGroup>
                                        <Input
                                          className="flex-1"
                                          placeholder="e.g. commonLabels.alertname"
                                        />
                                      </InputGroup>
                                    </TextField>
                                    <Select
                                      defaultSelectedKey={
                                        Array.from([pattern.type])[0] ?? null
                                      }
                                      className="w-32"
                                      onSelectionChange={(key: any) => {
                                        setPatterns([
                                          ...patterns.slice(0, index),
                                          {
                                            ...pattern,
                                            type: key,
                                          },
                                          ...patterns.slice(index + 1),
                                        ]);
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
                                            key="equals"
                                            id="equals"
                                            textValue="equals"
                                          >
                                            equals
                                            <ListBox.ItemIndicator />
                                          </ListBox.Item>
                                          <ListBox.Item
                                            key="not_equals"
                                            id="not_equals"
                                            textValue="not equals"
                                          >
                                            not equals
                                            <ListBox.ItemIndicator />
                                          </ListBox.Item>
                                        </ListBox>
                                      </Select.Popover>
                                    </Select>
                                    <TextField
                                      value={pattern.value}
                                      onChange={(value) => {
                                        setPatterns([
                                          ...patterns.slice(0, index),
                                          { ...pattern, value },
                                          ...patterns.slice(index + 1),
                                        ]);
                                      }}
                                    >
                                      <Label>{"Value"}</Label>
                                      <InputGroup>
                                        <Input
                                          className="flex-1"
                                          placeholder="Value to match"
                                        />
                                      </InputGroup>
                                    </TextField>
                                    <Button
                                      variant="danger"
                                      onPress={() => {
                                        setPatterns([
                                          ...patterns.slice(0, index),
                                          ...patterns.slice(index + 1),
                                        ]);
                                      }}
                                      className="aspect-square p-0"
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
                              <div className="flex flex-col items-center justify-center py-12 text-muted border-2 border-dashed border-default rounded-lg">
                                <Icon
                                  className="mb-4 opacity-50"
                                  icon="hugeicons:search-02"
                                  width={48}
                                />
                                <p>No patterns defined yet.</p>
                                <p className="text-xs">
                                  Add a pattern to filter alerts.
                                </p>
                              </div>
                            )}

                            <Button
                              onPress={() => {
                                setPatterns([
                                  ...patterns,
                                  { key: "", type: "equals", value: "" },
                                ]);
                              }}
                              variant="primary"
                            >
                              {<Icon icon="hugeicons:plus-sign" />}
                              Add Pattern
                            </Button>
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
                    onPress={updateDetails}
                    variant="primary"
                  >
                    {<Icon icon="hugeicons:floppy-disk" width={18} />}
                    Update Details
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
