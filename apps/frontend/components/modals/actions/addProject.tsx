import { PagePagination } from "@/components/ui/page-pagination";
import {
  Alert,
  Button,
  Card,
  Chip,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Radio,
  ScrollShadow,
  Select,
  Separator,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { isMobile } from "react-device-detect";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import MinimalRowSteps from "@/components/steps/minimal-row-steps";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import AddProjectActions from "@/lib/fetch/project/POST/AddProjectActions";
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
export default function AddProjectActionModal({
  disclosure,
  runners,
  project,
}: {
  disclosure: UseOverlayStateReturn;
  runners: any;
  project?: any;
  user: any;
}) {
  const { refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [steps] = useState(3);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [disableNext, setDisableNext] = useState(false);
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
  function countTotalAvailableActions() {
    let actions = 0;
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
    if (actions === 0) {
      setDisableNext(true);
    } else {
      setDisableNext(false);
    }
    return actions;
  }
  function getUniqueActions() {
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
  function getUniqueActionCategorys() {
    for (let i = 0; i < runners.length; i++) {
      for (let j = 0; j < runners[i].actions.length; j++) {
        const action = runners[i].actions[j];
        setAvailableCategories((prev: any) => {
          const categorySet = new Set(prev);
          if (!categorySet.has(action.category)) {
            return [...prev, action.category];
          }
          return prev;
        });
      }
    }
  }
  function handleActionSelect(action: any) {
    // add value field to action params
    if (action.params && action.params.length > 0) {
      action.params.map((param: any) => {
        param.value = param.default;
        param.default = param.default.toString();
      });
    } else {
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
    onOpenChange(false);
  }
  async function createProjectAction() {
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
      failure_pipeline_id: "",
      condition: action.condition,
    };
    const updatedActions = [...project.predefined_flow_actions, sendAction];
    const res = (await AddProjectActions(project.id, updatedActions)) as any;
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
      refreshProject(project.id); // Refresh SWR cache with specific project ID
      setSearch("");
      toast.success("Project", {
        description: "Predefined action added successfully",
      });
    } else {
      refreshProject(project.id); // Refresh SWR cache with specific project ID
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Project", {
        description: "Failed to add predefined action",
      });
    }
    setLoading(false);
  }
  useEffect(() => {
    if (runners.length > 0) {
      getUniqueActions();
      getUniqueActionCategorys();
    }
  }),
    [runners];
  return (
    <main>
      <Modal>
        <Modal.Backdrop
          isDismissable={false}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog>
              {() => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">
                          Add Predefined Action to Project
                        </p>
                        <p className="text-sm text-muted">
                          With predefined Flow Actions you can created templated
                          actions within your project and use them later
                          directly in your Flows.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div className="flex items-center justify-center">
                      <MinimalRowSteps
                        ref={null}
                        className="w-fit overflow-hidden"
                        currentStep={currentStep}
                        label={`Step ${currentStep + 1} of ${steps}`}
                        stepsCount={steps}
                        onStepChange={setCurrentStep}
                      />
                    </div>
                    <div className="flex-cols flex w-full gap-4">
                      {currentStep === 0 &&
                        (countTotalAvailableActions() === 0 ? (
                          <Alert status={"danger"}>
                            <Alert.Indicator>
                              {<Icon icon="hugeicons:alert-02" width={25} />}
                            </Alert.Indicator>
                            <Alert.Content>
                              <Alert.Title>
                                {"No Actions Available"}
                              </Alert.Title>
                              <Alert.Description>
                                {
                                  "Please check if there are healthy and registered runners available for this flow."
                                }
                              </Alert.Description>
                            </Alert.Content>
                          </Alert>
                        ) : (
                          <div className="w-full">
                            <p className="text-md text-muted">Categories</p>
                            <div aria-hidden className="h-1" />
                            <div className="flex gap-2 overflow-x-auto">
                              {availableCategories.map((category: any) => (
                                <Chip
                                  key={category}
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
                            <div aria-hidden className="h-4" />
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
                                <InputGroup.Input placeholder="Search..." type="text" />
                              </InputGroup>
                            </TextField>
                            <div aria-hidden className="h-2" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-4">
                              {actionItems.map((act: any) => (
                                <Button
                                  key={act.type}
                                  className="h-auto w-full justify-start p-0 text-left"
                                  variant="tertiary"
                                  onPress={() => {
                                    handleActionSelect(act);
                                    setProjectActionSelected(false);
                                  }}
                                >
                                  <Card
                                    key={act.type}
                                    className={`border-2 border-default ${act.plugin === action.plugin && act.version === action.version && !projectActionSelected ? "border-accent" : ""}`}
                                  >
                                    <Card.Content>
                                      <div className="flex items-center gap-2">
                                        <div className="flex size-10 items-center justify-center rounded-sm bg-accent/10 text-accent">
                                          <Icon icon={act.icon} width={26} />
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="flex flex-cols gap-2 items-center">
                                            <p className="text-lg font-bold">
                                              {act.name}
                                            </p>
                                            <Chip color="accent">
                                              <Chip.Label>
                                                Ver. {act.version}
                                              </Chip.Label>
                                            </Chip>
                                          </div>
                                          <p className="text-sm text-muted max-w-sm">
                                            {act.description}
                                          </p>
                                        </div>
                                      </div>
                                    </Card.Content>
                                  </Card>
                                </Button>
                              ))}
                            </div>
                            <div aria-hidden className="h-4" />
                            <div className="flex items-center justify-center">
                              <PagePagination
                                page={actionPage}
                                pageCount={actionPages()}
                                onPageChange={(actionPage) =>
                                  setActionPage(actionPage)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      {currentStep === 1 && (
                        <div className="flex flex-col w-full">
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
                                      <Chip.Label>
                                        Ver. {action.version}
                                      </Chip.Label>
                                    </Chip>
                                  </div>
                                  <p className="text-sm text-muted">
                                    {action.custom_description ||
                                      action.description}
                                  </p>
                                </div>
                              </div>
                            </Card.Content>
                          </Card>
                          <div aria-hidden className="h-2" />
                          <p className="text-lg font-bold">Details</p>
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
                                <InputGroup.Input type="text" />
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
                                <InputGroup.Input type="text" />
                              </InputGroup>
                              <Description>
                                {
                                  "Custom description for this action (optional)"
                                }
                              </Description>
                            </TextField>
                          </div>
                        </div>
                      )}
                      {currentStep === 2 && (
                        <div className="flex flex-col w-full">
                          <p className="text-lg font-bold">Parameters</p>
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
                                          (param.category ||
                                            "Uncategorized") !== category
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
                                              dependsOnParam.value.trim() ===
                                                "";
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
                                                        return {
                                                          ...x,
                                                          value: e,
                                                        };
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
                                              <InputGroup.Input
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
                                                        return {
                                                          ...x,
                                                          value: e,
                                                        };
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
                                            <InputGroup.TextArea />
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
                                                        return {
                                                          ...x,
                                                          value: e,
                                                        };
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
                                              <InputGroup.Input
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
                      )}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="ghost"
                      onPress={() => {
                        cancel();
                      }}
                    >
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    {currentStep > 0 ? (
                      <Button
                        onPress={() => {
                          setCurrentStep(currentStep - 1);
                          setDisableNext(false);
                        }}
                      >
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back
                      </Button>
                    ) : (
                      <Button isDisabled>
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back
                      </Button>
                    )}
                    {currentStep + 1 === steps ? (
                      <Button
                        isPending={isLoading}
                        onPress={() => {
                          createProjectAction();
                        }}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:plus-sign" width={18} />}
                        Create Action
                      </Button>
                    ) : (
                      <Button
                        isDisabled={disableNext || action.plugin == ""}
                        isPending={isLoading}
                        onPress={() => setCurrentStep(currentStep + 1)}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:forward-02" width={18} />}
                        Next Step
                      </Button>
                    )}
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
