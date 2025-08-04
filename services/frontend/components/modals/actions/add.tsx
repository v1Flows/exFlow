/* eslint-disable jsx-a11y/no-autofocus */
import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { isMobile } from "react-device-detect";
import { Icon } from "@iconify/react";
import {
  Accordion,
  AccordionItem,
  addToast,
  Alert,
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Radio,
  RadioGroup,
  ScrollShadow,
  Select,
  SelectItem,
  Spacer,
  Textarea,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import AddFlowActions from "@/lib/fetch/flow/POST/AddFlowActions";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import MinimalRowSteps from "@/components/steps/minimal-row-steps";
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

export default function AddActionModal({
  disclosure,
  runners,
  flow,
  isFailurePipeline,
  failurePipeline,
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow: any;
  user: any;
  isFailurePipeline?: boolean;
  failurePipeline?: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

  const [steps] = useState(4);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const [disableNext, setDisableNext] = useState(false);

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
      router.refresh();
      addToast({
        title: "Flow",
        description: "Action added successfully",
        color: "success",
        variant: "flat",
      });
    } else {
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
      router.refresh();
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
    if (runners.length > 0) {
      getUniqueActions();
      getUniqueActionCategorys();
    }
  }),
    [runners];

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
                  <p className="text-lg font-bold">
                    Add Action to Flow {isFailurePipeline && "Failure Pipeline"}
                  </p>
                  <p className="text-sm text-default-500">
                    Actions are the building blocks of your flows. Those are the
                    steps that get executed when a flow is triggered.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
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
                      <Alert
                        color="danger"
                        description="Please check if there are healthy and registered runners available for this flow."
                        icon={<Icon icon="hugeicons:alert-02" width={25} />}
                        title="No Actions Available"
                        variant="solid"
                      />
                    ) : (
                      <div className="w-full">
                        <p className="text-md text-default-500">Categories</p>
                        <Spacer y={1} />
                        <div className="flex gap-2 overflow-x-auto">
                          {availableCategories.map((category: any) => (
                            <Chip
                              key={category}
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
                        <Spacer y={4} />
                        <Input
                          autoFocus
                          placeholder="Search..."
                          size="md"
                          startContent={<Icon icon="hugeicons:search-01" />}
                          type="text"
                          value={search}
                          variant="flat"
                          onValueChange={setSearch}
                        />
                        <Spacer y={2} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-4">
                          {actionItems.map((act: any) => (
                            <Card
                              key={act.type}
                              isHoverable
                              isPressable
                              className={`border-2 border-default-200 ${act.plugin === action.plugin && act.version === action.version ? "border-primary" : ""}`}
                              radius="sm"
                              onPress={() => handleActionSelect(act)}
                            >
                              <CardBody>
                                <div className="flex items-center gap-2">
                                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                                    <Icon icon={act.icon} width={26} />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex flex-cols gap-2 items-center">
                                      <p className="text-lg font-bold">
                                        {act.name}
                                      </p>
                                      <Chip
                                        color="primary"
                                        radius="sm"
                                        size="sm"
                                        variant="flat"
                                      >
                                        Ver. {act.version}
                                      </Chip>
                                    </div>
                                    <p className="text-sm text-default-500">
                                      {act.description}
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                        <Spacer y={4} />
                        <div className="flex items-center justify-center">
                          <Pagination
                            showControls
                            initialPage={1}
                            page={actionPage}
                            total={actionPages()}
                            onChange={(actionPage) => setActionPage(actionPage)}
                          />
                        </div>
                      </div>
                    ))}
                  {currentStep === 1 && (
                    <div className="flex flex-col w-full">
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
                                {action.custom_description ||
                                  action.description}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                      <Spacer y={2} />
                      <p className="text-lg font-bold">Details</p>
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
                            className="col-span-2"
                            label="Failure Pipeline"
                            placeholder="Select an failure pipeline"
                            selectedKeys={[
                              action.failure_pipeline_id || "none",
                            ]}
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
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="flex flex-col w-full">
                      <p className="text-lg font-bold">Conditional Execution</p>
                      <p className="text-default-500">
                        If nothing is selected conditional execution will be
                        disabled.
                      </p>
                      <Divider className="mb-4 mt-2" />
                      <Accordion>
                        <AccordionItem
                          key="examples"
                          aria-label="Conditional Examples"
                          subtitle="Press to expand/collapse"
                          title="Examples"
                        >
                          <div className="flex items-center justify-center text-center gap-5 mb-4">
                            <div className="flex flex-col items-center gap-2">
                              <Icon
                                icon="hugeicons:structure-fail"
                                width={32}
                              />
                              <div className="flex flex-col items-center">
                                <p className="font-bold">
                                  Previous Action Status
                                </p>
                                <p className="text-sm text-default-600">
                                  Don&apos;t execute this new action if an
                                  previous action ended in an specific status.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <Icon icon="hugeicons:archive-02" width={32} />
                              <div className="flex flex-col items-center">
                                <p className="font-bold">
                                  Action contains message
                                </p>
                                <p className="text-sm text-default-600">
                                  Don&apos;t execute this new action if an
                                  previous action contains an specific message.
                                </p>
                              </div>
                            </div>
                          </div>
                        </AccordionItem>
                      </Accordion>

                      <Divider className="mb-4 mt-2" />
                      <div className="flex flex-col gap-1 w-full">
                        <RadioGroup
                          classNames={{
                            base: "w-full mb-2",
                          }}
                          label="Select an Action to apply an condition on. !CAUTION the action must be executed prior to this action!"
                          value={action.condition.selected_action_id}
                          onValueChange={(e) => {
                            setAction({
                              ...action,
                              condition: {
                                ...action.condition,
                                selected_action_id: e,
                              },
                            });
                          }}
                        >
                          {flow.actions.map((flowActs: any) => (
                            <Radio
                              key={flowActs.id}
                              aria-label={flowActs.custom_name || flowActs.name}
                              classNames={{
                                base: cn(
                                  "inline-flex max-w-full w-full bg-content1 m-0",
                                  "hover:bg-content2 items-center justify-start",
                                  "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                  "data-[selected=true]:border-primary",
                                ),
                                label: "w-full",
                              }}
                              value={flowActs.id}
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                                  <Icon icon={flowActs.icon} width={26} />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex flex-cols gap-2 items-center">
                                    <p className="text-lg font-bold">
                                      {flowActs.custom_name || flowActs.name}
                                    </p>
                                    <Chip
                                      color="primary"
                                      radius="sm"
                                      size="sm"
                                      variant="flat"
                                    >
                                      Ver. {flowActs.version}
                                    </Chip>
                                  </div>
                                  <p className="text-sm text-default-500">
                                    {flowActs.custom_description ||
                                      flowActs.description}
                                  </p>
                                </div>
                              </div>
                            </Radio>
                          ))}
                        </RadioGroup>

                        <div className="flex flex-col items-center gap-2">
                          {action?.condition?.condition_items.map(
                            (condition: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 w-full"
                              >
                                <Button
                                  isIconOnly
                                  color="primary"
                                  size="sm"
                                  variant="flat"
                                  onPress={() => {
                                    // add new condition item
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
                                  <Icon
                                    className="text-primary"
                                    icon="hugeicons:plus-sign"
                                    width={20}
                                  />
                                </Button>
                                <Button
                                  isIconOnly
                                  color="danger"
                                  isDisabled={
                                    action.condition.condition_items.length <= 1
                                  }
                                  size="sm"
                                  variant="flat"
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
                                >
                                  <Icon
                                    className="text-danger"
                                    icon="hugeicons:minus-sign"
                                    width={20}
                                  />
                                </Button>
                                <Select
                                  label="Key"
                                  placeholder="Select an key"
                                  selectedKeys={[condition.condition_key]}
                                  onSelectionChange={(e) => {
                                    const key = e.currentKey;

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
                                  <SelectItem key="status">Status</SelectItem>
                                  <SelectItem key="message">Message</SelectItem>
                                </Select>
                                <Select
                                  label="Type"
                                  placeholder="Select an type"
                                  selectedKeys={[condition.condition_type]}
                                  onSelectionChange={(e) => {
                                    const type = e.currentKey;

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
                                  <SelectItem key="equals">=</SelectItem>
                                  <SelectItem key="not_equals">!=</SelectItem>
                                  {condition.condition_key === "message" && (
                                    <>
                                      <SelectItem key="contains">
                                        contains
                                      </SelectItem>
                                      <SelectItem key="not_contains">
                                        does not contain
                                      </SelectItem>
                                      <SelectItem key="regex">regex</SelectItem>
                                    </>
                                  )}
                                </Select>
                                {condition.condition_key === "status" ? (
                                  <Select
                                    label="Value"
                                    placeholder="Select an value"
                                    selectedKeys={[condition.condition_value]}
                                    onSelectionChange={(e) => {
                                      const value = e.currentKey;

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
                                    <SelectItem key="canceled">
                                      Canceled
                                    </SelectItem>
                                    <SelectItem key="no_pattern_match">
                                      No Pattern Match
                                    </SelectItem>
                                    <SelectItem key="warning">
                                      Warning
                                    </SelectItem>
                                    <SelectItem key="error">Error</SelectItem>
                                    <SelectItem key="success">
                                      Success
                                    </SelectItem>
                                  </Select>
                                ) : (
                                  <Input
                                    label="Value"
                                    placeholder="Enter a value"
                                    type="text"
                                    value={condition.condition_value}
                                    onValueChange={(e) => {
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
                                  />
                                )}
                                <Button
                                  isIconOnly
                                  color="primary"
                                  isDisabled={
                                    action.condition.condition_items.length ===
                                    index + 1
                                  }
                                  size="md"
                                  variant="flat"
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
                        <Checkbox
                          color="danger"
                          isSelected={action.condition.cancel_execution}
                          onValueChange={(e) => {
                            setAction({
                              ...action,
                              condition: {
                                ...action.condition,
                                cancel_execution: e,
                              },
                            });
                          }}
                        >
                          <span className="text-danger font-bold">Cancel</span>{" "}
                          Execution if conditions doesn&apos;t match and dont
                          start any following action.
                        </Checkbox>
                      </div>
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="flex flex-col w-full">
                      <p className="text-lg font-bold">Parameters</p>
                      <Spacer y={2} />
                      <ScrollShadow className="max-h-[60vh]">
                        {actionParamsCategorys.length > 0 ? (
                          <div className="flex flex-col w-full gap-2">
                            {actionParamsCategorys.map((category: any) => (
                              <div key={category}>
                                <p className="font-semibold text-default-500 mb-2">
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
                                      const dependsOnParam = action.params.find(
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
                                      <Input
                                        key={param.key}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        type={param.type}
                                        value={param.value}
                                        onValueChange={(e) => {
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
                                      />
                                    ) : param.type === "boolean" ? (
                                      <Select
                                        key={param.key}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        selectedKeys={[param.value]}
                                        onSelectionChange={(e) => {
                                          if (!isDisabled) {
                                            const value =
                                              Array.from(e).join("");

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
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        type={param.type}
                                        value={param.value}
                                        onValueChange={(e) => {
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
                                      />
                                    ) : param.type === "password" ? (
                                      <Input
                                        key={param.key}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        type={param.type}
                                        value={param.value}
                                        onValueChange={(e) => {
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
                                      />
                                    ) : param.type === "select" ? (
                                      <Select
                                        key={param.key}
                                        defaultSelectedKeys={[param.default]}
                                        description={param?.description}
                                        isDisabled={isDisabled}
                                        isRequired={param.required}
                                        label={param.title || param.key}
                                        selectedKeys={[param.value]}
                                        onSelectionChange={(e) => {
                                          if (!isDisabled) {
                                            const value =
                                              Array.from(e).join("");

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
                                        {param.options.map((option: any) => (
                                          <SelectItem key={option.key}>
                                            {option.value}
                                          </SelectItem>
                                        ))}
                                      </Select>
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
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={() => {
                    cancel();
                  }}
                >
                  Cancel
                </Button>
                {currentStep === 2 && (
                  <Button
                    color="warning"
                    startContent={
                      <Icon icon="hugeicons:file-sync" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setAction({
                        ...action,
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
                    }}
                  >
                    Reset Current Input
                  </Button>
                )}
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                      setDisableNext(false);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    isDisabled
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                  >
                    Back
                  </Button>
                )}
                {currentStep + 1 === steps ? (
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
                    Create Action
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={disableNext || action.plugin == ""}
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:forward-02" width={18} />
                    }
                    onPress={() => setCurrentStep(currentStep + 1)}
                  >
                    Next Step
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
