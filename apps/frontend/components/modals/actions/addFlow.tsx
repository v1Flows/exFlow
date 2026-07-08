import { PagePagination } from "@/components/ui/page-pagination";
import {
  Alert,
  Button,
  Card,
  Chip,
  Description,
  Drawer,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Select,
  Switch,
  Tabs,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { isMobile } from "react-device-detect";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import AddFlowActions from "@/lib/fetch/flow/POST/AddFlowActions";
import ErrorCard from "@/components/error/ErrorCard";
import AddFlowFailurePipelineActions from "@/lib/fetch/flow/POST/AddFlowFailurePipelineActions";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function AddFlowActionModal({
  disclosure,
  runners,
  flow,
  project,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseOverlayStateReturn;
  runners: any;
  flow?: any;
  project?: any;
  user: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const { refreshFlowData } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [actionBaseSelected, setActionBaseSelected] = useState("runner");
  const [availableActions, setAvailableActions] = useState([] as any);
  const [availableCategories, setAvailableCategories] = useState([
    "All",
  ] as any);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  // pagination
  const [actionPage, setActionPage] = useState(1);
  const rowsPerPage = isMobile ? 2 : 6;
  const actionItems = React.useMemo(() => {
    const start = (actionPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    if (search) {
      return availableActions
        .filter((action: any) =>
          action.name.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(start, end);
    }
    if (selectedCategory === "Uncategorized") {
      return availableActions
        .filter((action: any) => action.category === "")
        .slice(start, end);
    }
    if (selectedCategory !== "All") {
      return availableActions
        .filter((action: any) => action.category === selectedCategory)
        .slice(start, end);
    }
    return availableActions.slice(start, end);
  }, [actionPage, availableActions, selectedCategory, search, runners]);
  // inputs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState(true);
  const [action, setAction] = useState({
    id: uuidv4(),
    name: "",
    description: "",
    plugin: "",
    version: "",
    icon: "",
    category: "",
    active: true,
    params: [],
    custom_name: "",
    custom_description: "",
    failure_pipeline_id: "",
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
  });
  const [actionParamsCategorys, setActionParamsCategorys] = useState([] as any);
  function actionPages() {
    let length = 0;
    if (selectedCategory !== "All") {
      length =
        availableActions.filter(
          (action: any) => action.category === selectedCategory,
        ).length / rowsPerPage;
    } else {
      length = availableActions.length / rowsPerPage;
    }
    return Math.ceil(length);
  }
  const totalAvailableActions = React.useMemo(() => {
    let actions = 0;
    if (actionBaseSelected === "project") {
      actions = project?.predefined_flow_actions?.length || 0;
    } else if (actionBaseSelected === "runner") {
      for (let i = 0; i < runners.length; i++) {
        const timeAgo =
          (new Date(runners[i].last_heartbeat).getTime() - Date.now()) / 1000;
        if (runners[i].disabled || !runners[i].registered || timeAgo <= -30) {
          continue;
        }
        if (runners[i].actions.length > 0) {
          actions++;
        }
      }
    }
    return actions;
  }, [actionBaseSelected, project, runners]);
  function getUniqueActions(type: string) {
    setAvailableActions([]);
    if (type === "project") {
      setAvailableActions(project.predefined_flow_actions);
    } else if (type === "runner") {
      for (let i = 0; i < runners.length; i++) {
        for (let j = 0; j < runners[i].actions.length; j++) {
          const action = runners[i].actions[j];
          setAvailableActions((prev: any) => {
            if (!action.version) {
              return prev;
            }
            const actionSet = new Set(
              prev.map((a: any) => `${a.plugin}-${a.version}`),
            );
            if (!actionSet.has(`${action.plugin}-${action.version}`)) {
              return [...prev, action];
            }
            return prev;
          });
        }
      }
    }
  }
  function getUniqueActionCategorys(type: string) {
    setAvailableCategories(["All"]);
    if (type === "project") {
      for (let i = 0; i < project.predefined_flow_actions.length; i++) {
        const action = project.predefined_flow_actions[i];
        setAvailableCategories((prev: any) => {
          const categorySet = new Set(prev);
          if (action.category === "" && !categorySet.has("Uncategorized")) {
            return [...prev, "Uncategorized"];
          }
          if (!categorySet.has(action.category)) {
            return [...prev, action.category];
          }
          return prev;
        });
      }
      return;
    }
    if (type === "runner") {
      for (let i = 0; i < runners.length; i++) {
        for (let j = 0; j < runners[i].actions.length; j++) {
          const action = runners[i].actions[j];
          setAvailableCategories((prev: any) => {
            const categorySet = new Set(prev);
            if (action.category === "" && !categorySet.has("Uncategorized")) {
              return [...prev, "Uncategorized"];
            }
            if (!categorySet.has(action.category)) {
              return [...prev, action.category];
            }
            return prev;
          });
        }
      }
    }
  }
  function handleActionSelect(action: any) {
    let type = "";
    if (actionBaseSelected === "project") {
      type = "project";
    } else if (actionBaseSelected === "runner") {
      type = "runner";
    }
    // add value field to action params
    if (type === "runner" && action.params && action.params.length > 0) {
      action.params.map((param: any) => {
        param.value = param.default;
        param.default = param.default.toString();
      });
    }
    action.condition = {
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
    setAction(action);
    getParamsCategorys(action.params);
  }
  function getParamsCategorys(params: any) {
    const categories = new Set();
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
  function cancel() {
    setStatus(true);
    setAction({
      id: uuidv4(),
      name: "",
      description: "",
      plugin: "",
      version: "",
      icon: "",
      category: "",
      active: true,
      params: [],
      custom_name: "",
      custom_description: "",
      failure_pipeline_id: "",
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
    });
    setCurrentStep(0);
    onOpenChange(false);
  }
  async function createFlowAction() {
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
    const updatedActions = [...flow.actions, sendAction];
    const res = (await AddFlowActions(
      flow.id,
      flow.project_id,
      updatedActions,
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to add action");
      setErrorMessage("An error occurred while adding action");
      setLoading(false);
      return;
    }
    if (res.success) {
      setStatus(true);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      setAction({
        id: uuidv4(),
        name: "",
        description: "",
        plugin: "",
        version: "",
        icon: "",
        category: "",
        active: true,
        params: [],
        custom_name: "",
        custom_description: "",
        failure_pipeline_id: "",
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
      });
      setCurrentStep(0);
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      toast.success("Flow", { description: "Action added successfully" });
    } else {
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", { description: "Failed to add action" });
    }
    setLoading(false);
  }
  async function createFlowFailurePipelineAction() {
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
      condition: action.condition,
    };
    if (failurePipeline.actions === null) {
      failurePipeline.actions = [];
    }
    const updatedActions = [...failurePipeline.actions, sendAction];
    const updatedFailurePipeline = {
      ...failurePipeline,
      actions: updatedActions,
    };
    const res = (await AddFlowFailurePipelineActions(
      flow.id,
      failurePipeline.id,
      updatedFailurePipeline,
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to add action to failure pipeline");
      setErrorMessage(
        "An error occurred while adding action to failure pipeline",
      );
      setLoading(false);
      return;
    }
    if (res.success) {
      setStatus(true);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      setAction({
        id: uuidv4(),
        name: "",
        description: "",
        plugin: "",
        version: "",
        icon: "",
        category: "",
        active: true,
        params: [],
        custom_name: "",
        custom_description: "",
        failure_pipeline_id: "",
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
      });
      setCurrentStep(0);
      onOpenChange(false);
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      setSearch("");
      toast.success("Flow", {
        description: "Action added successfully to failure pipeline",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Flow", {
        description: "Failed to add action to failure pipeline",
      });
    }
    setLoading(false);
  }
  useEffect(() => {
    getUniqueActions(actionBaseSelected);
    getUniqueActionCategorys(actionBaseSelected);
  }, [actionBaseSelected]);
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
                      Add Action to Flow
                      {isFailurePipeline && "Failure Pipeline"}
                    </p>
                    <p className="text-sm text-muted font-normal">
                      Actions are the building blocks of your flows. Those are
                      the steps that get executed when a flow is triggered.
                    </p>
                  </Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body className="overflow-hidden flex flex-col">
                  {error && (
                    <ErrorCard error={errorText} message={errorMessage} />
                  )}

                  {currentStep === 0 && (
                    <div className="flex flex-col w-full h-full gap-4 overflow-y-auto p-1">
                      <Tabs
                        selectedKey={actionBaseSelected}
                        onSelectionChange={(key) =>
                          setActionBaseSelected(key as string)
                        }
                      >
                        <Tabs.ListContainer>
                          <Tabs.List aria-label={"Options"}>
                            <Tabs.Tab id={"runner"}>
                              {"Runner Actions"}
                              <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id={"project"}>
                              {"Project Actions"}
                              <Tabs.Indicator />
                            </Tabs.Tab>
                          </Tabs.List>
                        </Tabs.ListContainer>
                      </Tabs>

                      {totalAvailableActions === 0 ? (
                        <Alert className={"max-h-[150px]"} status={"danger"}>
                          <Alert.Indicator>
                            {<Icon icon="hugeicons:alert-02" width={25} />}
                          </Alert.Indicator>
                          <Alert.Content>
                            <Alert.Title>{"No Actions Available"}</Alert.Title>
                            <Alert.Description>
                              {
                                "Please check if there are any healthy and registered runners available for this flow."
                              }
                            </Alert.Description>
                          </Alert.Content>
                        </Alert>
                      ) : (
                        <div className="w-full flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <p className="text-md text-muted">Categories</p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {availableCategories.map((category: any) => (
                                <Chip
                                  key={category}
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                  color={
                                    selectedCategory === category
                                      ? "accent"
                                      : "default"
                                  }
                                  size="lg"
                                  variant={
                                    selectedCategory === category
                                      ? "primary"
                                      : "soft"
                                  }
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setActionPage(1);
                                  }}
                                >
                                  <Chip.Label>{category}</Chip.Label>
                                </Chip>
                              ))}
                            </div>
                          </div>

                          <TextField
                            value={search}
                            onChange={(e) => {
                              setSearch(e);
                              setActionPage(1);
                            }}
                          >
                            <InputGroup>
                              <InputGroup.Prefix>
                                {<Icon icon="hugeicons:search-01" />}
                              </InputGroup.Prefix>
                              <InputGroup.Input
                                placeholder="Search actions..."
                                type="text"
                              />
                            </InputGroup>
                          </TextField>

                          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-4">
                            {actionItems.map((act: any) => (
                              <Button
                                key={act.type}
                                className="h-auto w-full justify-start p-0 text-left"
                                variant="tertiary"
                                onPress={() => {
                                  handleActionSelect(act);
                                  setCurrentStep(1);
                                }}
                              >
                                <Card
                                  key={act.type}
                                  className={`bg-surface/60 backdrop-blur-md border border-white/10 shadow-sm hover:bg-surface-secondary/60 transition-all`}
                                >
                                  <Card.Content>
                                    <div className="flex items-center gap-4">
                                      <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent shrink-0">
                                        <Icon icon={act.icon} width={28} />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap gap-2 items-center">
                                          <p className="text-lg font-bold">
                                            {act.custom_name || act.name}
                                          </p>
                                          <Chip color="accent">
                                            <Chip.Label>
                                              v{act.version}
                                            </Chip.Label>
                                          </Chip>
                                        </div>
                                        <p className="text-sm text-muted line-clamp-2">
                                          {act.custom_description ||
                                            act.description}
                                        </p>
                                      </div>
                                    </div>
                                  </Card.Content>
                                </Card>
                              </Button>
                            ))}
                          </div>

                          <div className="flex items-center justify-center mt-4">
                            <PagePagination
                              page={actionPage}
                              pageCount={actionPages()}
                              onPageChange={(actionPage) =>
                                setActionPage(actionPage)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 1 && (
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
                                {action.custom_description ||
                                  action.description}
                              </p>
                            </div>
                            <Button
                              className="ml-auto"
                              variant="ghost"
                              onPress={() => setCurrentStep(0)}
                            >
                              <Icon icon="hugeicons:cancel-01" width={24} />
                            </Button>
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
                            <Tabs.Tab id={"conditions"}>
                              {"Conditions"}
                              <Tabs.Indicator />
                            </Tabs.Tab>
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
                                  <InputGroup.Input placeholder="Enter a custom name" />
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
                                  setAction({
                                    ...action,
                                    custom_description: e,
                                  })
                                }
                              >
                                <Label>{"Custom Description"}</Label>
                                <InputGroup>
                                  <InputGroup.Input placeholder="Enter a description" />
                                </InputGroup>
                                <Description>
                                  {
                                    "Describe what this action does in this context"
                                  }
                                </Description>
                              </TextField>
                            </div>

                            {!isFailurePipeline && (
                              <Select
                                placeholder="Select a failure pipeline"
                                selectedKey={
                                  action.failure_pipeline_id || "none"
                                }
                                onSelectionChange={(e) =>
                                  setAction({
                                    ...action,
                                    failure_pipeline_id: String(e ?? ""),
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
                                          (param.category ||
                                            "Uncategorized") !== category
                                        )
                                          return null;
                                        let isDisabled = false;
                                        if (param.depends_on.key !== "") {
                                          const dependsOnParam =
                                            action.params.find(
                                              (p: any) =>
                                                p.key === param.depends_on.key,
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
                                                    if (!isDisabled) {
                                                      setAction({
                                                        ...action,
                                                        params:
                                                          action.params.map(
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
                                              <InputGroup.TextArea />
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
                                              <InputGroup.Input
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
                                      selected_action_id: String(e ?? ""),
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
                                    {flow.actions.map((flowActs: any) => (
                                      <ListBox.Item
                                        key={flowActs.id}
                                        textValue={
                                          flowActs.custom_name || flowActs.name
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
                                                  String(e ?? "");
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
                                                  ].condition_value = String(
                                                    e ?? "",
                                                  );
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
                                                  ].condition_value = String(
                                                    e ?? "",
                                                  );
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
                                                  <InputGroup.Input className="w-2/3" />
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
                      </Tabs>
                    </div>
                  )}
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

                  {currentStep === 1 && (
                    <>
                      <Button onPress={() => setCurrentStep(0)}>
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back to Selection
                      </Button>
                      <Button
                        isPending={isLoading}
                        onPress={() => {
                          if (!isFailurePipeline) {
                            createFlowAction();
                          } else {
                            createFlowFailurePipelineAction();
                          }
                        }}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:plus-sign" width={18} />}
                        Add Action
                      </Button>
                    </>
                  )}
                </Drawer.Footer>
              </>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
