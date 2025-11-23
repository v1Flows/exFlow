/* eslint-disable jsx-a11y/no-autofocus */
import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { isMobile } from "react-device-detect";
import { Icon } from "@iconify/react";
import {
  addToast,
  Alert,
  Button,
  Card,
  CardBody,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Input,
  Pagination,
  Select,
  SelectItem,
  Textarea,
  Tabs,
  Tab,
  Switch,
} from "@heroui/react";
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
  disclosure: UseDisclosureReturn;
  runners: any;
  flow?: any;
  project?: any;
  user: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const { refreshFlowData } = useRefreshCache();

  const { isOpen, onOpenChange } = disclosure;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const [actionBaseSelected, setActionBaseSelected] = useState("project");
  const [projectActionSelected, setProjectActionSelected] = useState(false);

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

  function handleActionSelect(action: any, type: string = "runner") {
    // add value field to action params
    if (type === "runner" && action.params && action.params.length > 0) {
      action.params.map((param: any) => {
        param.value = param.default;
        param.default = param.default.toString();
      });
    } else if (type !== "project") {
      action.params = [];
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
    onOpenChange();
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
      onOpenChange();
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      addToast({
        title: "Flow",
        description: "Action added successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "Failed to add action",
        color: "danger",
        variant: "flat",
      });
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
      onOpenChange();
      refreshFlowData(flow.id); // Refresh SWR cache with specific flow ID
      setSearch("");
      addToast({
        title: "Flow",
        description: "Action added successfully to failure pipeline",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      addToast({
        title: "Flow",
        description: "Failed to add action to failure pipeline",
        color: "danger",
        variant: "flat",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    getUniqueActions(actionBaseSelected);
    getUniqueActionCategorys(actionBaseSelected);
  }, [actionBaseSelected]);

  return (
    <Drawer
      backdrop="blur"
      classNames={{
        base: "data-[placement=right]:sm:m-2 data-[placement=left]:sm:m-2  rounded-medium",
      }}
      isOpen={isOpen}
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex flex-col gap-1">
              <p className="text-lg font-bold">
                Add Action to Flow
                {isFailurePipeline && "Failure Pipeline"}
              </p>
              <p className="text-sm text-default-500 font-normal">
                Actions are the building blocks of your flows. Those are the
                steps that get executed when a flow is triggered.
              </p>
            </DrawerHeader>
            <DrawerBody className="overflow-hidden flex flex-col">
              {error && <ErrorCard error={errorText} message={errorMessage} />}

              {currentStep === 0 && (
                <div className="flex flex-col w-full h-full gap-4 overflow-y-auto p-1">
                  <Tabs
                    fullWidth
                    classNames={{
                      tabList:
                        "bg-content1/60 backdrop-blur-md border border-white/10",
                      cursor: "bg-primary/20 border border-primary/50",
                      tabContent:
                        "group-data-[selected=true]:text-primary font-bold",
                    }}
                    selectedKey={actionBaseSelected}
                    size="lg"
                    onSelectionChange={(key) =>
                      setActionBaseSelected(key as string)
                    }
                  >
                    <Tab key="project" title="Project Actions" />
                    <Tab key="runner" title="Runner Actions" />
                  </Tabs>

                  {totalAvailableActions === 0 ? (
                    <Alert
                      color="danger"
                      description="Please check if there are any predefined actions in the project or healthy and registered runners available for this flow."
                      icon={<Icon icon="hugeicons:alert-02" width={25} />}
                      title="No Actions Available"
                      variant="solid"
                    />
                  ) : (
                    <div className="w-full flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-md text-default-500">Categories</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableCategories.map((category: any) => (
                            <Chip
                              key={category}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              color={
                                selectedCategory === category
                                  ? "primary"
                                  : "default"
                              }
                              radius="sm"
                              size="lg"
                              variant={
                                selectedCategory === category ? "solid" : "flat"
                              }
                              onClick={() => {
                                setSelectedCategory(category);
                                setActionPage(1);
                              }}
                            >
                              {category}
                            </Chip>
                          ))}
                        </div>
                      </div>

                      <Input
                        autoFocus
                        classNames={{
                          inputWrapper:
                            "bg-content1/60 backdrop-blur-md border-white/10",
                        }}
                        placeholder="Search actions..."
                        size="lg"
                        startContent={<Icon icon="hugeicons:search-01" />}
                        type="text"
                        value={search}
                        variant="bordered"
                        onValueChange={(e) => {
                          setSearch(e);
                          setActionPage(1);
                        }}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-4">
                        {actionItems.map((act: any) => (
                          <Card
                            key={act.type}
                            isHoverable
                            isPressable
                            className={`bg-content1/60 backdrop-blur-md border border-white/10 shadow-sm hover:bg-content2/60 transition-all ${act.plugin === action.plugin && act.version === action.version && !projectActionSelected ? "!border-primary" : ""}`}
                            radius="md"
                            onPress={() => {
                              handleActionSelect(act);
                              setProjectActionSelected(false);
                              setCurrentStep(1);
                            }}
                          >
                            <CardBody>
                              <div className="flex items-center gap-4">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                                  <Icon icon={act.icon} width={28} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <p className="text-lg font-bold">
                                      {act.custom_name || act.name}
                                    </p>
                                    <Chip
                                      color="primary"
                                      radius="sm"
                                      size="sm"
                                      variant="flat"
                                    >
                                      v{act.version}
                                    </Chip>
                                  </div>
                                  <p className="text-sm text-default-500 line-clamp-2">
                                    {act.custom_description || act.description}
                                  </p>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>

                      <div className="flex items-center justify-center mt-4">
                        <Pagination
                          showControls
                          classNames={{
                            wrapper:
                              "bg-content1/60 backdrop-blur-md border border-white/10",
                            item: "bg-transparent",
                            cursor: "bg-primary text-white",
                          }}
                          initialPage={1}
                          page={actionPage}
                          total={actionPages()}
                          onChange={(actionPage) => setActionPage(actionPage)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="flex flex-col w-full h-full gap-6 overflow-hidden">
                  <Card className="bg-content1/60 backdrop-blur-md border border-primary/20 shadow-sm">
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon icon={action.icon} width={32} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold">
                              {action.custom_name || action.name}
                            </p>
                            <Chip color="primary" size="sm" variant="flat">
                              v{action.version}
                            </Chip>
                          </div>
                          <p className="text-default-500">
                            {action.custom_description || action.description}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          className="ml-auto"
                          variant="light"
                          onPress={() => setCurrentStep(0)}
                        >
                          <Icon icon="hugeicons:cancel-01" width={24} />
                        </Button>
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
                    <Tab key="general" title="General Settings">
                      <div className="flex flex-col gap-4 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            description="A friendly name to identify this action in the flow"
                            label="Custom Name"
                            placeholder="Enter a custom name"
                            value={action.custom_name}
                            variant="bordered"
                            onValueChange={(e) =>
                              setAction({ ...action, custom_name: e })
                            }
                          />
                          <Input
                            description="Describe what this action does in this context"
                            label="Custom Description"
                            placeholder="Enter a description"
                            value={action.custom_description}
                            variant="bordered"
                            onValueChange={(e) =>
                              setAction({ ...action, custom_description: e })
                            }
                          />
                        </div>

                        {!isFailurePipeline && (
                          <Select
                            description="Pipeline to execute if this action fails"
                            label="Failure Pipeline"
                            placeholder="Select a failure pipeline"
                            selectedKeys={[
                              action.failure_pipeline_id || "none",
                            ]}
                            variant="bordered"
                            onSelectionChange={(e) =>
                              setAction({
                                ...action,
                                failure_pipeline_id: e.currentKey,
                              })
                            }
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
                    </Tab>

                    <Tab key="parameters" title="Parameters">
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
                                  <span className="text-default-500 font-medium text-sm uppercase tracking-wider">
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
                                      const dependsOnParam = action.params.find(
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
                                            if (!isDisabled) {
                                              setAction({
                                                ...action,
                                                params: action.params.map(
                                                  (x: any) =>
                                                    x.key === param.key
                                                      ? {
                                                          ...x,
                                                          value:
                                                            Array.from(e).join(
                                                              "",
                                                            ),
                                                        }
                                                      : x,
                                                ),
                                              });
                                            }
                                          }}
                                        >
                                          {param.options.map((option: any) => (
                                            <SelectItem key={option.key}>
                                              {option.value}
                                            </SelectItem>
                                          ))}
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
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
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
                    </Tab>

                    <Tab key="conditions" title="Conditions">
                      <div className="flex flex-col gap-6 pb-4">
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-default-500">
                            Configure when this action should execute based on
                            the status of previous actions.
                          </p>

                          <Select
                            label="Depends on Action"
                            placeholder="Select an action..."
                            selectedKeys={
                              action.condition.selected_action_id
                                ? [action.condition.selected_action_id]
                                : []
                            }
                            startContent={<Icon icon="hugeicons:link-01" />}
                            variant="bordered"
                            onSelectionChange={(e) => {
                              setAction({
                                ...action,
                                condition: {
                                  ...action.condition,
                                  selected_action_id: e.currentKey,
                                },
                              });
                            }}
                          >
                            {flow.actions.map((flowActs: any) => (
                              <SelectItem
                                key={flowActs.id}
                                textValue={
                                  flowActs.custom_name || flowActs.name
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <Icon icon={flowActs.icon} width={20} />
                                  <div className="flex flex-col">
                                    <span className="text-small">
                                      {flowActs.custom_name || flowActs.name}
                                    </span>
                                    <span className="text-tiny text-default-400">
                                      v{flowActs.version}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </Select>
                        </div>

                        {action.condition.selected_action_id && (
                          <div className="flex flex-col gap-4 p-4 rounded-lg bg-content1/40 border border-default-200">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm uppercase tracking-wider">
                                Condition Rules
                              </p>
                              <Button
                                color="primary"
                                size="sm"
                                startContent={
                                  <Icon icon="hugeicons:plus-sign" />
                                }
                                variant="flat"
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
                              >
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
                                          label="Type"
                                          selectedKeys={[
                                            condition.condition_type,
                                          ]}
                                          size="sm"
                                          variant="bordered"
                                          onSelectionChange={(e) => {
                                            const newItems = [
                                              ...action.condition
                                                .condition_items,
                                            ];

                                            newItems[index].condition_type =
                                              e.currentKey;
                                            setAction({
                                              ...action,
                                              condition: {
                                                ...action.condition,
                                                condition_items: newItems,
                                              },
                                            });
                                          }}
                                        >
                                          <SelectItem key="status">
                                            Status
                                          </SelectItem>
                                          <SelectItem key="message">
                                            Message
                                          </SelectItem>
                                        </Select>

                                        {condition.condition_type ===
                                        "status" ? (
                                          <Select
                                            className="w-2/3"
                                            label="Value"
                                            selectedKeys={[
                                              condition.condition_value,
                                            ]}
                                            size="sm"
                                            variant="bordered"
                                            onSelectionChange={(e) => {
                                              const newItems = [
                                                ...action.condition
                                                  .condition_items,
                                              ];

                                              newItems[index].condition_value =
                                                e.currentKey;
                                              setAction({
                                                ...action,
                                                condition: {
                                                  ...action.condition,
                                                  condition_items: newItems,
                                                },
                                              });
                                            }}
                                          >
                                            <SelectItem
                                              key="success"
                                              color="success"
                                            >
                                              Success
                                            </SelectItem>
                                            <SelectItem
                                              key="failed"
                                              color="danger"
                                            >
                                              Failed
                                            </SelectItem>
                                          </Select>
                                        ) : (
                                          <Input
                                            className="w-2/3"
                                            label="Value"
                                            size="sm"
                                            value={condition.condition_value}
                                            variant="bordered"
                                            onValueChange={(e) => {
                                              const newItems = [
                                                ...action.condition
                                                  .condition_items,
                                              ];

                                              newItems[index].condition_value =
                                                e;
                                              setAction({
                                                ...action,
                                                condition: {
                                                  ...action.condition,
                                                  condition_items: newItems,
                                                },
                                              });
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <Button
                                      isIconOnly
                                      color="danger"
                                      isDisabled={
                                        action.condition.condition_items
                                          .length <= 1
                                      }
                                      variant="light"
                                      onPress={() => {
                                        const newItems =
                                          action.condition.condition_items.filter(
                                            (_: any, i: number) => i !== index,
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
                    </Tab>
                  </Tabs>
                </div>
              )}
            </DrawerBody>
            <DrawerFooter>
              <Button
                color="danger"
                startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                variant="light"
                onPress={() => {
                  cancel();
                }}
              >
                Cancel
              </Button>

              {currentStep === 1 && (
                <>
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                    onPress={() => setCurrentStep(0)}
                  >
                    Back to Selection
                  </Button>
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:plus-sign" width={18} />
                    }
                    onPress={() => {
                      if (!isFailurePipeline) {
                        createFlowAction();
                      } else {
                        createFlowFailurePipelineAction();
                      }
                    }}
                  >
                    Add Action
                  </Button>
                </>
              )}
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
