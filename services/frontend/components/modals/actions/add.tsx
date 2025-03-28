import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
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
  Pagination,
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

import AddFlowActions from "@/lib/fetch/flow/POST/AddFlowActions";
import { cn } from "@/components/cn/cn";
import ErrorCard from "@/components/error/ErrorCard";
import MinimalRowSteps from "@/components/steps/minimal-row-steps";

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
}: {
  disclosure: UseDisclosureReturn;
  runners: any;
  flow: any;
  user: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

  const [steps] = useState(2);
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
  const rowsPerPage = 6;
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
    });
    setCurrentStep(0);
    onOpenChange();
  }

  async function createAction() {
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
                  <p className="text-lg font-bold">Add Action to Flow</p>
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
                      <div>
                        <Card className="border border-danger">
                          <CardBody>
                            <p className="font-bold text-danger">
                              😕 Seems like there are no Actions available.
                            </p>
                            <p className="text-default-500">
                              Please check if you have a dedicated runner assign
                              to your flow and if that runner exposes any
                              actions
                            </p>
                          </CardBody>
                        </Card>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="text-lg font-bold text-default-500">
                          Available Actions
                        </p>
                        <Spacer y={2} />
                        <p className="text-sm text-default-500">Categories</p>
                        <Spacer y={1} />
                        <div className="flex gap-2">
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
                          description="Search for an action"
                          label="Search"
                          size="sm"
                          startContent={<Icon icon="hugeicons:search-01" />}
                          type="text"
                          value={search}
                          variant="flat"
                          onValueChange={setSearch}
                        />
                        <Spacer y={2} />
                        <div className="grid grid-cols-2 items-stretch gap-4">
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
                                  {action.name}
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
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                      <Spacer y={2} />
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
                      </div>
                      <p className="text-lg font-bold text-default-600">
                        Parameters
                      </p>
                      <Spacer y={2} />
                      <ScrollShadow className="max-h-[600px]">
                        {actionParamsCategorys.length > 0 ? (
                          <div className="flex flex-col w-full gap-2">
                            {actionParamsCategorys.map((category: any) => (
                              <div key={category}>
                                <p className="font-semibold text-default-500 mb-2">
                                  {category}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {action.params.map((param: any) => {
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
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="ghost"
                  onPress={() => {
                    cancel();
                  }}
                >
                  Cancel
                </Button>
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                      setDisableNext(false);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Button isDisabled color="default" variant="flat">
                    Back
                  </Button>
                )}
                {currentStep + 1 === steps ? (
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    onPress={() => createAction()}
                  >
                    Create Action
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={disableNext || action.plugin == ""}
                    isLoading={isLoading}
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
