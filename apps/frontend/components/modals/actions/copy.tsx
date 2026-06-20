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
  RadioGroup,
  ScrollShadow,
  Select,
  Separator,
  Switch,
  Tabs,
  TextArea,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import AddFlowActions from "@/lib/fetch/flow/POST/AddFlowActions";
import AddFlowFailurePipelineActions from "@/lib/fetch/flow/POST/AddFlowFailurePipelineActions";
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
export default function CopyActionModal({
  disclosure,
  flow,
  copyAction,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseOverlayStateReturn;
  runners: any;
  flow: any;
  copyAction: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const { refreshFlowData } = useRefreshCache();
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
    if (disclosure.isOpen) {
      if (
        copyAction.condition === undefined ||
        copyAction.condition.condition_items === null
      ) {
        copyAction.condition = {
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
        };
      }
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
      active: true,
      params: action.params,
      custom_name: action.custom_name,
      custom_description: action.custom_description,
      failure_pipeline_id:
        action.failure_pipeline_id === "none" ? "" : action.failure_pipeline_id,
      condition: action.condition,
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
      toast.success("Flow", { description: "Action copied successfully" });
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while copying the action.",
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
    if (
      failurePipeline.actions === undefined ||
      failurePipeline.actions === null
    ) {
      failurePipeline.actions = [];
    }
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
      toast.success("Flow", { description: "Action copied successfully" });
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
    } else {
      refreshFlowData(flow.id); // Refresh SWR cache instead of router
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "An error occurred while copying the action.",
      });
    }
    setLoading(false);
  }
  return (
    <Drawer>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            {({ close: onClose }) => (
              <>
                <Drawer.Header className="flex flex-col gap-1">
                  <Drawer.Heading>Copy Action</Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}
                  <Card className="border-2 border-default border-accent">
                    <Card.Content>
                      <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                          <Icon icon={action.icon} width={26} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex flex-cols gap-2 items-center">
                            <p className="text-lg font-bold">
                              {action.custom_name || action.name}
                            </p>
                            <Chip color="accent">
                              <Chip.Label>Ver. {action.version}</Chip.Label>
                            </Chip>
                          </div>
                          <p className="text-sm text-muted">
                            {action.custom_description || action.description}
                          </p>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                  <Tabs>
                    <Tabs.ListContainer>
                      <Tabs.List aria-label={"Options"}>
                        <Tabs.Tab id={"general"}>
                          {"General"}
                          <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id={"parameters"}>
                          {"Parameters"}
                          <Tabs.Indicator />
                        </Tabs.Tab>
                        <Tabs.Tab id={"conditions"}>
                          {"Conditions"}
                          <Tabs.Indicator />
                        </Tabs.Tab>
                      </Tabs.List>
                    </Tabs.ListContainer>
                    <Tabs.Panel id={"general"}>
                      <div className="flex w-full flex-col gap-2">
                        <p className="text-lg font-bold text-muted">Details</p>
                        <div aria-hidden className="h-2" />
                        <div className="grid grid-cols-2 gap-2">
                          <TextField
                            value={action.custom_name}
                            onChange={(e) =>
                              setAction({ ...action, custom_name: e })
                            }
                          >
                            <Label>{"Custom Name"}</Label>
                            <InputGroup>
                              <Input type="text" />
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
                              <Input type="text" />
                            </InputGroup>
                            <Description>
                              {"Custom description for this action (optional)"}
                            </Description>
                          </TextField>
                          <Select
                            isRequired
                            className={isFailurePipeline ? "col-span-2" : ""}
                            placeholder="Select the flow to copy the action to"
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
                              placeholder="Select an failure pipeline"
                              selectedKey={action.failure_pipeline_id || "none"}
                              onSelectionChange={(e) => {
                                setAction({
                                  ...action,
                                  failure_pipeline_id: e,
                                });
                              }}
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
                            </Select>
                          )}
                        </div>
                      </div>
                    </Tabs.Panel>
                    <Tabs.Panel id={"parameters"}>
                      <div className="flex w-full flex-col gap-2">
                        <p className="text-lg font-bold text-muted">
                          Parameters
                        </p>
                        <div aria-hidden className="h-2" />
                        <ScrollShadow className="max-h-[60vh]">
                          {actionParamsCategorys.length > 0 ? (
                            <div className="flex flex-col w-full gap-2">
                              {actionParamsCategorys.map((category: any) => (
                                <div key={category}>
                                  <p className="font-semibold text-muted mb-2">
                                    {category}
                                  </p>
                                  <div className="grid lg:grid-cols-2 gap-2">
                                    {action.params.map((param: any) => {
                                      // Check if param belongs to this category first
                                      if (
                                        (param.category || "Uncategorized") !==
                                        category
                                      ) {
                                        return null;
                                      }
                                      // Check if param has depends_on set and evaluate the condition
                                      let isDisabled = false;
                                      if (param.depends_on.key !== "") {
                                        const dependsOnParam =
                                          action.params.find(
                                            (p: any) =>
                                              p.key === param.depends_on.key,
                                          );
                                        if (!dependsOnParam) {
                                          isDisabled = true;
                                        } else if (
                                          param.depends_on.value === "*"
                                        ) {
                                          // Wildcard: any non-empty value is acceptable
                                          isDisabled =
                                            !dependsOnParam.value ||
                                            dependsOnParam.value.trim() === "";
                                        } else {
                                          // Exact match required
                                          isDisabled =
                                            dependsOnParam.value !==
                                            param.depends_on.value;
                                        }
                                      }
                                      return param.type === "text" ||
                                        param.type === "number" ? (
                                        <TextField
                                          isDisabled={isDisabled}
                                          isRequired={param.required}
                                          value={param.value}
                                          onChange={(e) => {
                                            if (!isDisabled) {
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
                                            }
                                          }}
                                        >
                                          <Label>
                                            {param.title || param.key}
                                          </Label>
                                          <InputGroup>
                                            <Input
                                              key={param.key}
                                              type={param.type}
                                            />
                                          </InputGroup>
                                          <Description>
                                            {param?.description}
                                          </Description>
                                        </TextField>
                                      ) : param.type === "boolean" ? (
                                        <Select
                                          key={param.key}
                                          isDisabled={isDisabled}
                                          isRequired={param.required}
                                          selectedKey={param.value}
                                          onSelectionChange={(e) => {
                                            if (!isDisabled) {
                                              const value = String(e ?? "");
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
                                            }
                                          }}
                                        >
                                          <Label>
                                            {param.title || param.key}
                                          </Label>
                                          <Select.Trigger>
                                            <Select.Value />
                                            <Select.Indicator />
                                          </Select.Trigger>
                                          <Select.Popover>
                                            <ListBox>
                                              <ListBox.Item
                                                key="true"
                                                id="true"
                                                textValue="true"
                                              >
                                                true
                                                <ListBox.ItemIndicator />
                                              </ListBox.Item>
                                              <ListBox.Item
                                                key="false"
                                                id="false"
                                                textValue="false"
                                              >
                                                false
                                                <ListBox.ItemIndicator />
                                              </ListBox.Item>
                                            </ListBox>
                                          </Select.Popover>
                                          <Description>
                                            {param?.description}
                                          </Description>
                                        </Select>
                                      ) : param.type === "textarea" ? (
                                        <TextField
                                          key={param.key}
                                          className={"col-span-2"}
                                          isRequired={param.required}
                                          isDisabled={isDisabled}
                                          value={param.value}
                                          onChange={(e) => {
                                            if (!isDisabled) {
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
                                            }
                                          }}
                                        >
                                          <Label>
                                            {param.title || param.key}
                                          </Label>
                                          <TextArea />
                                          <Description>
                                            {param?.description}
                                          </Description>
                                        </TextField>
                                      ) : param.type === "password" ? (
                                        <TextField
                                          isDisabled={isDisabled}
                                          isRequired={param.required}
                                          value={param.value}
                                          onChange={(e) => {
                                            if (!isDisabled) {
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
                                            }
                                          }}
                                        >
                                          <Label>
                                            {param.title || param.key}
                                          </Label>
                                          <InputGroup>
                                            <Input
                                              key={param.key}
                                              type={param.type}
                                            />
                                          </InputGroup>
                                          <Description>
                                            {param?.description}
                                          </Description>
                                        </TextField>
                                      ) : param.type === "select" ? (
                                        <Select
                                          defaultSelectedKey={
                                            Array.from([param.default])[0] ??
                                            null
                                          }
                                          key={param.key}
                                          isDisabled={isDisabled}
                                          isRequired={param.required}
                                          selectedKey={param.value}
                                          onSelectionChange={(e) => {
                                            if (!isDisabled) {
                                              const value = String(e ?? "");
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
                                            }
                                          }}
                                        >
                                          <Label>
                                            {param.title || param.key}
                                          </Label>
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
                                          <Description>
                                            {param?.description}
                                          </Description>
                                        </Select>
                                      ) : null;
                                    })}
                                  </div>
                                  <Separator className="mb-2 mt-2" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No parameters for this action found.</p>
                          )}
                        </ScrollShadow>
                      </div>
                    </Tabs.Panel>
                    <Tabs.Panel id={"conditions"}>
                      <div className="flex w-full flex-col gap-2">
                        <p className="text-lg font-bold text-muted">
                          Conditional Execution
                        </p>
                        <div aria-hidden className="h-2" />
                        <div className="flex flex-col gap-1 w-full">
                          <RadioGroup
                            className="mb-2 w-full"
                            value={action.condition.selected_action_id}
                            onChange={(e) => {
                              setAction({
                                ...action,
                                condition: {
                                  ...action.condition,
                                  selected_action_id: e,
                                },
                              });
                            }}
                          >
                            <Label>
                              Select an action to apply a condition to. The
                              action must execute first.
                            </Label>

                            <ScrollShadow className="max-h-[30vh]">
                              {flow.actions
                                .filter(
                                  (flowActs: any) => flowActs.id !== action.id,
                                )
                                .map((flowActs: any) => (
                                  <Radio
                                    key={flowActs.id}
                                    aria-label={
                                      flowActs.custom_name || flowActs.name
                                    }
                                    className={cn(
                                      "inline-flex max-w-full w-full bg-surface m-0",
                                      "hover:bg-surface-secondary items-center justify-start",
                                      "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                      "data-[selected=true]:border-accent",
                                    )}
                                    value={flowActs.id}
                                  >
                                    <Radio.Control>
                                      <Radio.Indicator />
                                    </Radio.Control>
                                    <Radio.Content className="w-full">
                                      <div className="flex items-center gap-2">
                                        <div className="flex size-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                                          <Icon
                                            icon={flowActs.icon}
                                            width={26}
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="flex flex-cols gap-2 items-center">
                                            <p className="text-lg font-bold">
                                              {flowActs.custom_name ||
                                                flowActs.name}
                                            </p>
                                            <Chip color="accent">
                                              <Chip.Label>
                                                Ver. {flowActs.version}
                                              </Chip.Label>
                                            </Chip>
                                          </div>
                                          <p className="text-sm text-muted">
                                            {flowActs.custom_description ||
                                              flowActs.description}
                                          </p>
                                        </div>
                                      </div>
                                    </Radio.Content>
                                  </Radio>
                                ))}
                            </ScrollShadow>
                          </RadioGroup>

                          <div className="flex flex-col items-center gap-2">
                            {action.condition.condition_items != null &&
                              action.condition.condition_items.map(
                                (condition: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 w-full"
                                  >
                                    <Button
                                      onPress={() => {
                                        // add new condition item
                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items: [
                                              ...action.condition
                                                .condition_items,
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
                                      className="aspect-square p-0"
                                    >
                                      <Icon
                                        className="text-accent"
                                        icon="hugeicons:plus-sign"
                                        width={20}
                                      />
                                    </Button>
                                    <Button
                                      isDisabled={
                                        action.condition.condition_items
                                          .length <= 1
                                      }
                                      onPress={() => {
                                        // remove condition item
                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items:
                                              action.condition.condition_items.filter(
                                                (item: any, i: number) =>
                                                  i !== index,
                                              ),
                                          },
                                        });
                                      }}
                                      variant="danger"
                                      className="aspect-square p-0"
                                    >
                                      <Icon
                                        className="text-danger"
                                        icon="hugeicons:minus-sign"
                                        width={20}
                                      />
                                    </Button>
                                    <Select
                                      placeholder="Select an key"
                                      selectedKey={condition.condition_key}
                                      onSelectionChange={(e) => {
                                        const key = e;
                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items:
                                              action.condition.condition_items.map(
                                                (item: any, i: number) => {
                                                  if (i === index) {
                                                    return {
                                                      ...item,
                                                      condition_key: key,
                                                      condition_type: "",
                                                      condition_value: "",
                                                    };
                                                  }
                                                  return item;
                                                },
                                              ),
                                          },
                                        });
                                      }}
                                    >
                                      <Label>{"Key"}</Label>
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
                                    <Select
                                      placeholder="Select an type"
                                      selectedKey={condition.condition_type}
                                      onSelectionChange={(e) => {
                                        const type = e;
                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items:
                                              action.condition.condition_items.map(
                                                (item: any, i: number) => {
                                                  if (i === index) {
                                                    return {
                                                      ...item,
                                                      condition_type: type,
                                                      condition_value: "",
                                                    };
                                                  }
                                                  return item;
                                                },
                                              ),
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
                                            key="equals"
                                            id="equals"
                                            textValue="="
                                          >
                                            =<ListBox.ItemIndicator />
                                          </ListBox.Item>
                                          <ListBox.Item
                                            key="not_equals"
                                            id="not_equals"
                                            textValue="!="
                                          >
                                            !=
                                            <ListBox.ItemIndicator />
                                          </ListBox.Item>
                                          {condition.condition_key ===
                                            "message" && (
                                            <>
                                              <ListBox.Item
                                                key="contains"
                                                id="contains"
                                                textValue="contains"
                                              >
                                                contains
                                                <ListBox.ItemIndicator />
                                              </ListBox.Item>
                                              <ListBox.Item
                                                key="not_contains"
                                                id="not_contains"
                                                textValue="does not contain"
                                              >
                                                does not contain
                                                <ListBox.ItemIndicator />
                                              </ListBox.Item>
                                              <ListBox.Item
                                                key="regex"
                                                id="regex"
                                                textValue="regex"
                                              >
                                                regex
                                                <ListBox.ItemIndicator />
                                              </ListBox.Item>
                                            </>
                                          )}
                                        </ListBox>
                                      </Select.Popover>
                                    </Select>
                                    {condition.condition_key === "status" ? (
                                      <Select
                                        placeholder="Select an value"
                                        selectedKey={condition.condition_value}
                                        onSelectionChange={(e) => {
                                          const value = e;
                                          setAction({
                                            ...action,
                                            condition: {
                                              ...action.condition,
                                              condition_items:
                                                action.condition.condition_items.map(
                                                  (item: any, i: number) => {
                                                    if (i === index) {
                                                      return {
                                                        ...item,
                                                        condition_value: value,
                                                      };
                                                    }
                                                    return item;
                                                  },
                                                ),
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
                                              key="canceled"
                                              id="canceled"
                                              textValue="Canceled"
                                            >
                                              Canceled
                                              <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                            <ListBox.Item
                                              key="no_pattern_match"
                                              id="no_pattern_match"
                                              textValue="No Pattern Match"
                                            >
                                              No Pattern Match
                                              <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                            <ListBox.Item
                                              key="warning"
                                              id="warning"
                                              textValue="Warning"
                                            >
                                              Warning
                                              <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                            <ListBox.Item
                                              key="error"
                                              id="error"
                                              textValue="Error"
                                            >
                                              Error
                                              <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                            <ListBox.Item
                                              key="success"
                                              id="success"
                                              textValue="Success"
                                            >
                                              Success
                                              <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                          </ListBox>
                                        </Select.Popover>
                                      </Select>
                                    ) : (
                                      <TextField
                                        value={condition.condition_value}
                                        onChange={(e) => {
                                          setAction({
                                            ...action,
                                            condition: {
                                              ...action.condition,
                                              condition_items:
                                                action.condition.condition_items.map(
                                                  (item: any, i: number) => {
                                                    if (i === index) {
                                                      return {
                                                        ...item,
                                                        condition_value: e,
                                                      };
                                                    }
                                                    return item;
                                                  },
                                                ),
                                            },
                                          });
                                        }}
                                      >
                                        <Label>{"Value"}</Label>
                                        <InputGroup>
                                          <Input
                                            placeholder="Enter a value"
                                            type="text"
                                          />
                                        </InputGroup>
                                      </TextField>
                                    )}
                                    <Button
                                      isDisabled={
                                        action.condition.condition_items
                                          .length ===
                                        index + 1
                                      }
                                      size="md"
                                      onPress={() => {
                                        // toggle logic between and/or
                                        const newLogic =
                                          condition.condition_logic === "and"
                                            ? "or"
                                            : "and";
                                        setAction({
                                          ...action,
                                          condition: {
                                            ...action.condition,
                                            condition_items:
                                              action.condition.condition_items.map(
                                                (item: any, i: number) => {
                                                  if (i === index) {
                                                    return {
                                                      ...item,
                                                      condition_logic: newLogic,
                                                    };
                                                  }
                                                  return item;
                                                },
                                              ),
                                          },
                                        });
                                      }}
                                      variant="primary"
                                      className="aspect-square p-0"
                                    >
                                      {condition.condition_logic === "and" ? (
                                        <p>&</p>
                                      ) : (
                                        <p>or</p>
                                      )}
                                    </Button>
                                  </div>
                                ),
                              )}
                          </div>
                          <p className="mt-2 font-semibold">Options</p>
                          <Switch
                            isSelected={action.condition.cancel_execution}
                            onChange={(e) => {
                              setAction({
                                ...action,
                                condition: {
                                  ...action.condition,
                                  cancel_execution: e,
                                },
                              });
                            }}
                          >
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                            <Switch.Content>
                              <span className="text-danger font-bold">
                                Cancel
                              </span>{" "}
                              Execution if conditions doesn&apos;t match and
                              dont start any following action.
                            </Switch.Content>
                          </Switch>
                        </div>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </Drawer.Body>
                <Drawer.Footer>
                  <Button variant="danger" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    isPending={isLoading}
                    variant="primary"
                    onPress={
                      isFailurePipeline
                        ? copyFlowFailurePipelineAction
                        : copyFlowAction
                    }
                  >
                    {<Icon icon="hugeicons:copy-02" width={18} />}
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
