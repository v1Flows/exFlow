import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react";
import {
  Accordion,
  AccordionItem,
  addToast,
  Alert,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Chip,
  Divider,
  Spacer,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import EditFlowActionsDetails from "@/components/modals/actions/editDetails";
import EditActionModal from "@/components/modals/actions/edit";
import DeleteActionModal from "@/components/modals/actions/delete";
import AddActionModal from "@/components/modals/actions/add";
import CreateFailurePipelineModal from "@/components/modals/failurePipelines/create";
import DeleteFailurePipelineModal from "@/components/modals/failurePipelines/delete";
import EditFailurePipelineModal from "@/components/modals/failurePipelines/edit";
import UpdateFlowFailurePipelineActions from "@/lib/fetch/flow/PUT/UpdateFailurePipelineActions";
import CopyActionModal from "@/components/modals/actions/copy";
import UpgradeActionModal from "@/components/modals/actions/upgrade";

export default function Actions({
  flow,
  runners,
  user,
  canEdit,
  settings,
}: {
  flow: any;
  runners: any;
  user: any;
  canEdit: boolean;
  settings: any;
}) {
  const router = useRouter();

  const [actions, setActions] = React.useState([] as any);
  const [targetAction, setTargetAction] = React.useState({} as any);
  const [updatedAction, setUpdatedAction] = React.useState({} as any);

  const [failurePipelines, setFailurePipelines] = React.useState([] as any);
  const [targetFailurePipeline, setTargetFailurePipeline] = React.useState(
    {} as any,
  );

  const [failurePipelineTab, setFailurePipelineTab] =
    React.useState("add-pipeline");

  const editFlowActionsDetails = useDisclosure();
  const addFlowActionModal = useDisclosure();
  const editActionModal = useDisclosure();
  const copyFlowActionModal = useDisclosure();
  const upgradeFlowActionModal = useDisclosure();
  const deleteActionModal = useDisclosure();
  const createFlowFailurePipelineModal = useDisclosure();
  const editFlowFailurePipelineModal = useDisclosure();
  const deleteFailurePipelineModal = useDisclosure();
  const addFlowFailurePipelineActionModal = useDisclosure();
  const editFlowFailurePipelineActionModal = useDisclosure();
  const deleteFlowFailurePipelineActionModal = useDisclosure();
  const copyFlowFailurePipelineActionModal = useDisclosure();
  const upgradeFlowFailurePipelineActionModal = useDisclosure();

  const [expandedParams, setExpandedParams] = React.useState([] as any);

  useEffect(() => {
    setActions(flow.actions);

    if (flow.failure_pipelines !== null) {
      setFailurePipelines(flow.failure_pipelines);

      if (failurePipelineTab === "add-pipeline") {
        setFailurePipelineTab(flow.failure_pipelines[0]?.id || "add-pipeline");
      }
    }
  }, [flow]);

  const handleFailurePipelineTabChange = (key: any) => {
    setFailurePipelineTab(key);
  };

  const SortableItem = ({ action }: { action: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: action.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card key={action.id} fullWidth>
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <div className="w-full">
                <div className="flex-cols flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                      <Icon icon={action.icon} width={26} />
                    </div>
                    <div>
                      <div className="flex-cols flex gap-2">
                        <p className="text-md font-bold">
                          {action.custom_name
                            ? action.custom_name
                            : action.name}
                        </p>
                        <Chip
                          className="max-lg:hidden"
                          color="default"
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          ID: {action.id}
                        </Chip>
                        <Chip
                          className="max-lg:hidden"
                          color="primary"
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          Vers. {action.version}
                        </Chip>
                        <Chip
                          className="max-lg:hidden"
                          color={action.active ? "success" : "danger"}
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          {action.active ? "Active" : "Disabled"}
                        </Chip>
                        {flow.failure_pipeline_id !== "" ||
                          (flow.failure_pipeline_id !== null &&
                            !flow.failure_pipelines.some(
                              (pipeline: any) =>
                                pipeline.id === action.failure_pipeline_id ||
                                (pipeline.actions !== null &&
                                  pipeline.actions.some(
                                    (pipelineAction: any) =>
                                      pipelineAction.id === action.id,
                                  )),
                            ) && (
                              <Chip
                                className="max-lg:hidden"
                                color="warning"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                No Failure Pipeline Assigned
                              </Chip>
                            ))}
                      </div>
                      <p className="text-sm text-default-500">
                        {action.custom_description
                          ? action.custom_description
                          : action.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex-cols flex items-center gap-2">
                    <ButtonGroup>
                      <Button
                        isIconOnly
                        color="warning"
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        variant="light"
                        onPress={() => {
                          // if action is in an failure pipeline, open the edit modal
                          if (
                            flow.failure_pipelines.some(
                              (pipeline: any) =>
                                pipeline.actions !== null &&
                                pipeline.actions.some(
                                  (pipelineAction: any) =>
                                    pipelineAction.id === action.id,
                                ),
                            )
                          ) {
                            setTargetAction(action);
                            setTargetFailurePipeline(
                              flow.failure_pipelines.filter(
                                (pipeline: any) =>
                                  pipeline.actions !== null &&
                                  pipeline.actions.some(
                                    (pipelineAction: any) =>
                                      pipelineAction.id === action.id,
                                  ),
                              )[0],
                            );
                            editFlowFailurePipelineActionModal.onOpen();
                          } else {
                            setTargetAction(action);
                            editActionModal.onOpen();
                          }
                        }}
                      >
                        <Icon icon="hugeicons:pencil-edit-02" width={20} />
                      </Button>
                      <Button
                        isIconOnly
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        variant="light"
                        onPress={() => {
                          // if action is in an failure pipeline, open the edit modal
                          if (
                            flow.failure_pipelines.some(
                              (pipeline: any) =>
                                pipeline.actions !== null &&
                                pipeline.actions.some(
                                  (pipelineAction: any) =>
                                    pipelineAction.id === action.id,
                                ),
                            )
                          ) {
                            setTargetAction(action);
                            setTargetFailurePipeline(
                              flow.failure_pipelines.filter(
                                (pipeline: any) =>
                                  pipeline.actions !== null &&
                                  pipeline.actions.some(
                                    (pipelineAction: any) =>
                                      pipelineAction.id === action.id,
                                  ),
                              )[0],
                            );
                            copyFlowFailurePipelineActionModal.onOpen();
                          } else {
                            setTargetAction(action);
                            copyFlowActionModal.onOpen();
                          }
                        }}
                      >
                        <Icon icon="hugeicons:copy-02" width={20} />
                      </Button>
                      <Button
                        isIconOnly
                        color="danger"
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        variant="light"
                        onPress={() => {
                          // if action is in an failure pipeline, open the edit modal
                          if (
                            flow.failure_pipelines.some(
                              (pipeline: any) =>
                                pipeline.actions !== null &&
                                pipeline.actions.some(
                                  (pipelineAction: any) =>
                                    pipelineAction.id === action.id,
                                ),
                            )
                          ) {
                            setTargetAction(action.id);
                            setTargetFailurePipeline(
                              flow.failure_pipelines.filter(
                                (pipeline: any) =>
                                  pipeline.actions !== null &&
                                  pipeline.actions.some(
                                    (pipelineAction: any) =>
                                      pipelineAction.id === action.id,
                                  ),
                              )[0],
                            );
                            deleteFlowFailurePipelineActionModal.onOpen();
                          } else {
                            setTargetAction(action.id);
                            deleteActionModal.onOpen();
                          }
                        }}
                      >
                        <Icon icon="hugeicons:delete-02" width={20} />
                      </Button>
                    </ButtonGroup>
                    <Tooltip content="Reorder action by dragging">
                      <Button
                        isIconOnly
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        variant="flat"
                        {...listeners}
                        style={{ cursor: "grab", touchAction: "none" }}
                      >
                        <Icon icon="hugeicons:drag-02" width={20} />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
                <Spacer y={2} />
                <div className="flex-wrap flex gap-2">
                  <Chip
                    className="lg:hidden"
                    color={action.active ? "success" : "danger"}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {action.active ? "Active" : "Disabled"}
                  </Chip>
                  <Chip
                    className="lg:hidden"
                    color="default"
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    ID: {action.id}
                  </Chip>
                  <Chip
                    className="lg:hidden"
                    color="primary"
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    Vers. {action.version}
                  </Chip>
                  {flow.failure_pipeline_id !== "" ||
                    (flow.failure_pipeline_id !== null &&
                      !flow.failure_pipelines.some(
                        (pipeline: any) =>
                          pipeline.id === action.failure_pipeline_id ||
                          (pipeline.actions !== null &&
                            pipeline.actions.some(
                              (pipelineAction: any) =>
                                pipelineAction.id === action.id,
                            )),
                      ) && (
                        <Chip
                          className="lg:hidden"
                          color="warning"
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          No Failure Pipeline Assigned
                        </Chip>
                      ))}
                </div>
                {action.update_available && (
                  <Alert
                    hideIconWrapper
                    className="mt-2 flex flex-wrap gap-2"
                    color="primary"
                    description="Newer plugin version was found on one of the runners. Do you want to update the action?"
                    endContent={
                      <Button
                        color="primary"
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        startContent={
                          <Icon icon="hugeicons:system-update-02" width={20} />
                        }
                        variant="flat"
                        onPress={() => {
                          // if action is in an failure pipeline, open the edit modal
                          if (
                            flow.failure_pipelines.some(
                              (pipeline: any) =>
                                pipeline.actions !== null &&
                                pipeline.actions.some(
                                  (pipelineAction: any) =>
                                    pipelineAction.id === action.id,
                                ),
                            )
                          ) {
                            setTargetAction(action);
                            setUpdatedAction(action.updated_action);
                            setTargetFailurePipeline(
                              flow.failure_pipelines.filter(
                                (pipeline: any) =>
                                  pipeline.actions !== null &&
                                  pipeline.actions.some(
                                    (pipelineAction: any) =>
                                      pipelineAction.id === action.id,
                                  ),
                              )[0],
                            );
                            upgradeFlowFailurePipelineActionModal.onOpen();
                          } else {
                            setTargetAction(action);
                            setUpdatedAction(action.updated_action);
                            upgradeFlowActionModal.onOpen();
                          }
                        }}
                      >
                        Upgrade
                      </Button>
                    }
                    title={`Update to version ${action.update_version} available`}
                    variant="faded"
                  />
                )}
                <Accordion
                  isCompact
                  selectedKeys={expandedParams}
                  selectionMode="multiple"
                  variant="light"
                  onSelectionChange={setExpandedParams}
                >
                  <AccordionItem
                    key={action.id + "-details"}
                    aria-label="Details"
                    subtitle="View action details (click to expand)"
                    title="Details"
                  >
                    <Table
                      removeWrapper
                      aria-label="Details"
                      className="w-full"
                    >
                      <TableHeader>
                        <TableColumn align="center">Name</TableColumn>
                        <TableColumn align="center">Value</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="No patterns defined.">
                        <TableRow>
                          <TableCell>Plugin</TableCell>
                          <TableCell>{action.plugin}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Plugin Name</TableCell>
                          <TableCell>{action.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Plugin Description</TableCell>
                          <TableCell>{action.description}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Failure Pipeline</TableCell>
                          <TableCell>
                            {flow.failure_pipeline_id === "" ||
                            flow.failure_pipeline_id === null ? (
                              flow.failure_pipelines.filter(
                                (pipeline: any) =>
                                  pipeline.id === action.failure_pipeline_id,
                              )[0]?.name ||
                              action.failure_pipeline_id ||
                              "None"
                            ) : (
                              <span className="text-warning">
                                Overwritten by Flow Setting
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </AccordionItem>
                  {action.params.length > 0 && (
                    <AccordionItem
                      key={action.id + "-params"}
                      aria-label="Parameters"
                      subtitle="View action parameters (click to expand)"
                      title="Parameters"
                    >
                      <Table
                        removeWrapper
                        aria-label="Parameters"
                        className="w-full"
                      >
                        <TableHeader>
                          <TableColumn align="center">Key</TableColumn>
                          <TableColumn align="center">Value</TableColumn>
                          <TableColumn align="center">Note</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No patterns defined.">
                          {action.params.map((param: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{param.key}</TableCell>
                              <TableCell>{param.value}</TableCell>
                              <TableCell>
                                {param.type === "password" &&
                                param.value != "" ? (
                                  <span className="text-success">
                                    Encrypted
                                  </span>
                                ) : (
                                  ""
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionItem>
                  )}
                </Accordion>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const items = [...actions];
      const oldIndex = items.findIndex((item: any) => item.id === active.id);
      const newIndex = items.findIndex((item: any) => item.id === over.id);

      const newArray = arrayMove(items, oldIndex, newIndex);

      updateFlowActions(newArray);
      setActions(newArray);
    }
  };

  function updateFlowActions(items: any) {
    UpdateFlowActions(flow.id, items)
      .then(() => {
        addToast({
          title: "Flow",
          description: "Flow actions order updated successfully.",
          color: "success",
          variant: "flat",
        });
      })
      .catch(() => {
        addToast({
          title: "Flow",
          description: "Failed to update flow actions order.",
          color: "danger",
          variant: "flat",
        });
      });
  }

  const handleDragEndPipeline = (pipeline: any, event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const items = [...pipeline.actions];
      const oldIndex = items.findIndex((item: any) => item.id === active.id);
      const newIndex = items.findIndex((item: any) => item.id === over.id);

      const newArray = arrayMove(items, oldIndex, newIndex);

      updateFlowFailurePipelineActions(pipeline, newArray);
    }
  };

  function updateFlowFailurePipelineActions(pipeline: any, actions: any) {
    UpdateFlowFailurePipelineActions(flow.id, pipeline.id, actions)
      .then(() => {
        router.refresh();
        addToast({
          title: "Flow",
          description:
            "Flow failure pipeline actions order updated successfully.",
          color: "success",
          variant: "flat",
        });
      })
      .catch(() => {
        router.refresh();
        addToast({
          title: "Flow",
          description: "Failed to update flow failure pipeline actions order.",
          color: "danger",
          variant: "flat",
        });
      });
  }

  return (
    <div>
      <p className="text-sm text-default-500">
        Info: Common action settings can be found on the settings tab
      </p>
      <Spacer y={2} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={actions}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {actions.map((action: any) => (
                  <SortableItem key={action.id} action={action} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Card
            fullWidth
            className="border border-dashed border-default-200 bg-opacity-60 hover:border-primary"
            isDisabled={
              (!canEdit || !settings.add_flow_actions || flow.disabled) &&
              user.role !== "admin"
            }
            isPressable={
              (canEdit && settings.add_flow_actions && !flow.disabled) ||
              user.role === "admin"
            }
            onPress={addFlowActionModal.onOpen}
          >
            <CardBody>
              <div className="flex-cols flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                    <Icon icon="solar:add-square-outline" width={26} />
                  </div>
                  <div>
                    <p className="text-md font-bold">Add Action</p>
                    <p className="text-sm text-default-500">
                      Add a new action to the flow
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <Divider className="sm:hidden mt-4 mb-4" />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Icon
              className="text-danger"
              icon="hugeicons:structure-fail"
              width={32}
            />
            <div className="flex flex-col">
              <p className="text-lg font-bold text-danger">Failure Pipelines</p>
              <p className="text-sm text-default-500">
                With failure pipelines you have the ability to send
                notifications or trigger any other action if a specific action
                or the whole execution failed.
              </p>
            </div>
          </div>
          <Tabs
            aria-label="failure-pipelines"
            selectedKey={failurePipelineTab}
            variant="underlined"
            onSelectionChange={handleFailurePipelineTabChange}
          >
            {failurePipelines.map((pipeline: any) => (
              <Tab key={pipeline.id} title={pipeline.name}>
                <div className="flex flex-col gap-4">
                  <Card
                    fullWidth
                    className="bg-opacity-80 hover:border-primary"
                  >
                    <CardBody>
                      <div className="flex-cols flex items-center justify-between gap-2">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex flex-cols items-center gap-2">
                            <p className="text-md font-bold">{pipeline.name}</p>
                            <div className="flex flex-wrap gap-2">
                              <Chip radius="sm" size="sm" variant="flat">
                                {pipeline.exec_parallel
                                  ? "Parallel"
                                  : "Sequential"}
                              </Chip>
                              <Chip
                                color={
                                  flow.failure_pipeline_id === pipeline.id
                                    ? "success"
                                    : flow.actions.filter(
                                          (action: any) =>
                                            action.failure_pipeline_id ===
                                            pipeline.id,
                                        ).length > 0
                                      ? "success"
                                      : "danger"
                                }
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                {flow.failure_pipeline_id === pipeline.id
                                  ? "Assigned to Flow"
                                  : flow.actions.filter(
                                        (action: any) =>
                                          action.failure_pipeline_id ===
                                          pipeline.id,
                                      ).length > 0
                                    ? "Assigned on Step"
                                    : "Not Assigned"}
                              </Chip>
                            </div>
                          </div>
                          <p className="text-tiny text-default-500">
                            {pipeline.id}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            color="warning"
                            isDisabled={
                              (!canEdit || flow.disabled) &&
                              user.role !== "admin"
                            }
                            startContent={
                              <Icon
                                icon="hugeicons:pencil-edit-02"
                                width={20}
                              />
                            }
                            variant="light"
                            onPress={() => {
                              setTargetFailurePipeline(pipeline);
                              editFlowFailurePipelineModal.onOpen();
                            }}
                          >
                            Edit Pipeline
                          </Button>
                          <Button
                            color="danger"
                            isDisabled={
                              (!canEdit || flow.disabled) &&
                              user.role !== "admin"
                            }
                            startContent={
                              <Icon icon="hugeicons:delete-02" width={20} />
                            }
                            variant="light"
                            onPress={() => {
                              setTargetFailurePipeline(pipeline.id);
                              deleteFailurePipelineModal.onOpen();
                            }}
                          >
                            Delete Pipeline
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={(event) =>
                      handleDragEndPipeline(pipeline, event)
                    }
                  >
                    <SortableContext
                      items={pipeline.actions !== null ? pipeline.actions : []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {pipeline.actions !== null &&
                          pipeline.actions.length > 0 &&
                          pipeline.actions.map((action: any) => (
                            <SortableItem key={action.id} action={action} />
                          ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <Card
                    fullWidth
                    className="border border-dashed border-default-200 bg-opacity-60 hover:border-primary"
                    isDisabled={
                      (!canEdit ||
                        !settings.add_flow_actions ||
                        flow.disabled) &&
                      user.role !== "admin"
                    }
                    isPressable={
                      (canEdit &&
                        settings.add_flow_actions &&
                        !flow.disabled) ||
                      user.role === "admin"
                    }
                    onPress={() => {
                      setTargetFailurePipeline(pipeline);
                      addFlowFailurePipelineActionModal.onOpen();
                    }}
                  >
                    <CardBody>
                      <div className="flex-cols flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                            <Icon icon="solar:add-square-outline" width={26} />
                          </div>
                          <div>
                            <p className="text-md font-bold">Add Action</p>
                            <p className="text-sm text-default-500">
                              Add a new action to the failure pipeline
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>
            ))}
            <Tab
              key="add-pipeline"
              title={
                <Button
                  disableRipple
                  isIconOnly
                  color="primary"
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  variant="light"
                  onPress={() => {
                    createFlowFailurePipelineModal.onOpen();
                  }}
                >
                  <Icon icon="hugeicons:plus-sign" width={20} />
                </Button>
              }
            />
          </Tabs>
          {flow.failure_pipelines !== null &&
            flow.failure_pipelines.length === 0 && (
              <div className="flex items-center justify-center">
                <p className="text-sm text-default-500">
                  No failure pipelines defined.
                </p>
              </div>
            )}
        </div>
      </div>
      <EditFlowActionsDetails disclosure={editFlowActionsDetails} flow={flow} />
      <AddActionModal
        disclosure={addFlowActionModal}
        flow={flow}
        runners={runners}
        user={user}
      />
      <EditActionModal
        disclosure={editActionModal}
        flow={flow}
        runners={runners}
        targetAction={targetAction}
      />
      <CopyActionModal
        copyAction={targetAction}
        disclosure={copyFlowActionModal}
        flow={flow}
        runners={runners}
      />
      <UpgradeActionModal
        disclosure={upgradeFlowActionModal}
        flow={flow}
        runners={runners}
        targetAction={targetAction}
        updatedAction={updatedAction}
      />
      <DeleteActionModal
        actionID={targetAction}
        disclosure={deleteActionModal}
        flowID={flow.id}
      />

      <CreateFailurePipelineModal
        disclosure={createFlowFailurePipelineModal}
        flow={flow}
      />
      <EditFailurePipelineModal
        disclosure={editFlowFailurePipelineModal}
        flow={flow}
        targetFailurePipeline={targetFailurePipeline}
      />
      <DeleteFailurePipelineModal
        disclosure={deleteFailurePipelineModal}
        failurePipeline={targetFailurePipeline}
        flowID={flow.id}
      />

      <AddActionModal
        isFailurePipeline
        disclosure={addFlowFailurePipelineActionModal}
        failurePipeline={targetFailurePipeline}
        flow={flow}
        runners={runners}
        user={user}
      />
      <EditActionModal
        isFailurePipeline
        disclosure={editFlowFailurePipelineActionModal}
        failurePipeline={targetFailurePipeline}
        flow={flow}
        runners={runners}
        targetAction={targetAction}
      />
      <CopyActionModal
        isFailurePipeline
        copyAction={targetAction}
        disclosure={copyFlowFailurePipelineActionModal}
        failurePipeline={targetFailurePipeline}
        flow={flow}
        runners={runners}
      />
      <UpgradeActionModal
        isFailurePipeline
        disclosure={upgradeFlowFailurePipelineActionModal}
        failurePipeline={targetFailurePipeline}
        flow={flow}
        runners={runners}
        targetAction={targetAction}
        updatedAction={updatedAction}
      />
      <DeleteActionModal
        isFailurePipeline
        actionID={targetAction}
        disclosure={deleteFlowFailurePipelineActionModal}
        failurePipeline={targetFailurePipeline}
        flowID={flow.id}
      />
    </div>
  );
}
