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
  addToast,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
  useDisclosure,
  ScrollShadow,
} from "@heroui/react";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import EditActionModal from "@/components/modals/actions/edit";
import DeleteActionModal from "@/components/modals/actions/delete";
import CreateFailurePipelineModal from "@/components/modals/failurePipelines/create";
import DeleteFailurePipelineModal from "@/components/modals/failurePipelines/delete";
import EditFailurePipelineModal from "@/components/modals/failurePipelines/edit";
import UpdateFlowFailurePipelineActions from "@/lib/fetch/flow/PUT/UpdateFailurePipelineActions";
import CopyActionModal from "@/components/modals/actions/copy";
import UpgradeActionModal from "@/components/modals/actions/upgrade";
import CopyActionToDifferentFlowModal from "@/components/modals/actions/transferCopy";
import FlowActionDetails from "@/components/modals/actions/details";
import AddFlowActionModal from "@/components/modals/actions/addFlow";

export default function FlowFailurePipelines({
  projects,
  flows,
  flow,
  runners,
  user,
  canEdit,
  settings,
}: {
  projects: any;
  flows: any;
  flow: any;
  runners: any;
  user: any;
  canEdit: boolean;
  settings: any;
}) {
  const router = useRouter();

  const [targetAction, setTargetAction] = React.useState({} as any);
  const [updatedAction, setUpdatedAction] = React.useState({} as any);

  const [failurePipelines, setFailurePipelines] = React.useState([] as any);
  const [targetFailurePipeline, setTargetFailurePipeline] = React.useState(
    {} as any,
  );

  const [selectedPipelineId, setSelectedPipelineId] = React.useState<
    string | null
  >(null);

  const viewFlowActionDetails = useDisclosure();
  const createFlowFailurePipelineModal = useDisclosure();
  const editFlowFailurePipelineModal = useDisclosure();
  const deleteFailurePipelineModal = useDisclosure();
  const addFlowFailurePipelineActionModal = useDisclosure();
  const editFlowFailurePipelineActionModal = useDisclosure();
  const deleteFlowFailurePipelineActionModal = useDisclosure();
  const copyFlowFailurePipelineActionModal = useDisclosure();
  const upgradeFlowFailurePipelineActionModal = useDisclosure();
  const copyActionToDifferentFlowModal = useDisclosure();
  const copyFailurePipelineActionToDifferentFlowModal = useDisclosure();

  useEffect(() => {
    if (flow.failure_pipelines !== null) {
      setFailurePipelines(flow.failure_pipelines);

      if (!selectedPipelineId && flow.failure_pipelines.length > 0) {
        setSelectedPipelineId(flow.failure_pipelines[0].id);
      }
    }
  }, [flow]);

  // function to get action from clipboard
  const getClipboardAction = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const parsedAction = JSON.parse(clipboardText);

      if (parsedAction && parsedAction.id && parsedAction.plugin) {
        return parsedAction;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  };

  const SortableItem = ({
    action,
    index,
    total,
  }: {
    action: any;
    index: number;
    total: number;
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: action.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        className="relative pl-10 pb-6 last:pb-0"
        style={style}
        {...attributes}
      >
        {/* Timeline Line */}
        {index !== total - 1 && (
          <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-default-200/50" />
        )}

        {/* Timeline Dot */}
        <div className="absolute left-[9px] top-8 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-2 border-primary z-10 flex items-center justify-center shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>

        {/* Step Number */}
        <div className="absolute left-0 top-0 -translate-x-full pr-4 pt-6 text-xs font-bold text-default-400 hidden md:block">
          Step {index + 1}
        </div>

        <Card
          key={action.id}
          fullWidth
          isPressable
          className="bg-content1/40 border border-default-200/50 hover:bg-content1/60 transition-all"
          isDisabled={!action.active}
          onPress={() => {
            setTargetAction(action);
            viewFlowActionDetails.onOpen();
          }}
        >
          <CardBody className="p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Icon icon={action.icon} width={24} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {action.custom_name || action.name}
                    </p>
                    <Chip
                      className="h-5 text-[10px] px-1"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      v{action.version}
                    </Chip>
                  </div>
                  <p className="text-xs text-default-500 line-clamp-1">
                    {action.custom_description || action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <Chip
                    className="border-none"
                    color={action.active ? "success" : "danger"}
                    size="sm"
                    variant="dot"
                  >
                    {action.active ? "Active" : "Disabled"}
                  </Chip>
                  {action.update_available && (
                    <Chip color="primary" size="sm" variant="flat">
                      Update
                    </Chip>
                  )}
                </div>

                <ButtonGroup size="sm" variant="light">
                  {action.update_available && (
                    <Tooltip content="Upgrade Plugin Version">
                      <Button
                        isIconOnly
                        color="primary"
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        onPress={() => {
                          setTargetAction(action);
                          setUpdatedAction(action.updated_action);
                          setTargetFailurePipeline(
                            flow.failure_pipelines.find(
                              (p: any) => p.id === selectedPipelineId,
                            ),
                          );
                          upgradeFlowFailurePipelineActionModal.onOpen();
                        }}
                      >
                        <Icon icon="hugeicons:system-update-02" width={16} />
                      </Button>
                    </Tooltip>
                  )}

                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                      >
                        <Icon icon="hugeicons:more-vertical" width={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Action Options">
                      <DropdownItem
                        key="details"
                        startContent={<Icon icon="hugeicons:view" width={18} />}
                        onPress={() => {
                          setTargetAction(action);
                          viewFlowActionDetails.onOpen();
                        }}
                      >
                        View Details
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={
                          <Icon icon="hugeicons:pencil-edit-02" width={18} />
                        }
                        onPress={() => {
                          setTargetAction(action);
                          setTargetFailurePipeline(
                            flow.failure_pipelines.find(
                              (p: any) => p.id === selectedPipelineId,
                            ),
                          );
                          editFlowFailurePipelineActionModal.onOpen();
                        }}
                      >
                        Edit Action
                      </DropdownItem>
                      <DropdownItem
                        key="copy"
                        startContent={
                          <Icon icon="hugeicons:copy-02" width={18} />
                        }
                        onPress={() => {
                          setTargetAction(action);
                          setTargetFailurePipeline(
                            flow.failure_pipelines.find(
                              (p: any) => p.id === selectedPipelineId,
                            ),
                          );
                          copyFlowFailurePipelineActionModal.onOpen();
                        }}
                      >
                        Copy Local
                      </DropdownItem>
                      <DropdownItem
                        key="transfer"
                        startContent={
                          <Icon icon="hugeicons:delivery-sent-02" width={18} />
                        }
                        onPress={() => {
                          setTargetAction(action);
                          copyActionToDifferentFlowModal.onOpen();
                        }}
                      >
                        Transfer
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={
                          <Icon icon="hugeicons:delete-02" width={18} />
                        }
                        onPress={() => {
                          setTargetAction(action.id);
                          setTargetFailurePipeline(
                            flow.failure_pipelines.find(
                              (p: any) => p.id === selectedPipelineId,
                            ),
                          );
                          deleteFlowFailurePipelineActionModal.onOpen();
                        }}
                      >
                        Delete Action
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Tooltip content="Drag to reorder">
                    <Button
                      isIconOnly
                      className="cursor-grab active:cursor-grabbing"
                      isDisabled={
                        (!canEdit || flow.disabled) && user.role !== "admin"
                      }
                      {...listeners}
                    >
                      <Icon icon="hugeicons:drag-02" width={16} />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

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

  const selectedPipeline = failurePipelines.find(
    (p: any) => p.id === selectedPipelineId,
  );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-200px)]">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold">Failure Pipelines</h3>
        <p className="text-sm text-default-500">
          Configure failure pipelines to handle errors gracefully. These
          pipelines can be triggered when specific actions or the entire flow
          fails.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Left Sidebar - Pipeline List */}
        <Card className="w-full lg:w-1/3 h-full bg-content1/60 backdrop-blur-md border border-white/10">
          <CardBody className="p-0 flex flex-col h-full">
            <div className="p-4 border-b border-divider flex items-center justify-between sticky top-0 bg-content1/60 backdrop-blur-md z-10">
              <span className="font-semibold text-default-700">Pipelines</span>
              <Button
                color="primary"
                isDisabled={
                  (!canEdit || flow.disabled) && user.role !== "admin"
                }
                size="sm"
                startContent={<Icon icon="hugeicons:plus-sign" width={16} />}
                onPress={createFlowFailurePipelineModal.onOpen}
              >
                New Pipeline
              </Button>
            </div>

            <ScrollShadow className="flex-1 p-2">
              <div className="flex flex-col gap-2">
                {failurePipelines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-default-400 gap-2">
                    <Icon
                      className="opacity-50"
                      icon="hugeicons:folder-02"
                      width={32}
                    />
                    <p className="text-sm">No pipelines created</p>
                  </div>
                ) : (
                  failurePipelines.map((pipeline: any) => {
                    const isAssignedToFlow =
                      flow.failure_pipeline_id === pipeline.id;
                    const assignedStepsCount = flow.actions.filter(
                      (a: any) => a.failure_pipeline_id === pipeline.id,
                    ).length;

                    return (
                      <Card
                        key={pipeline.id}
                        isPressable
                        className={`border transition-all ${
                          selectedPipelineId === pipeline.id
                            ? "bg-primary/10 border-primary/50"
                            : "bg-transparent border-transparent hover:bg-content2/50"
                        }`}
                        onPress={() => setSelectedPipelineId(pipeline.id)}
                      >
                        <CardBody className="p-3">
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`font-medium ${selectedPipelineId === pipeline.id ? "text-primary" : "text-foreground"}`}
                              >
                                {pipeline.name}
                              </span>
                              {pipeline.exec_parallel && (
                                <Icon
                                  className="text-default-400"
                                  icon="hugeicons:parallel"
                                  width={16}
                                />
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {isAssignedToFlow && (
                                <Chip
                                  className="h-5 text-[10px] px-1"
                                  color="success"
                                  size="sm"
                                  variant="flat"
                                >
                                  Flow Default
                                </Chip>
                              )}
                              {assignedStepsCount > 0 && (
                                <Chip
                                  className="h-5 text-[10px] px-1"
                                  color="secondary"
                                  size="sm"
                                  variant="flat"
                                >
                                  {assignedStepsCount} Steps
                                </Chip>
                              )}
                              {!isAssignedToFlow &&
                                assignedStepsCount === 0 && (
                                  <Chip
                                    className="h-5 text-[10px] px-1 bg-default-100 text-default-500"
                                    size="sm"
                                    variant="flat"
                                  >
                                    Unused
                                  </Chip>
                                )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>

        {/* Right Content - Pipeline Details */}
        <Card className="w-full lg:w-2/3 h-full bg-content1/60 backdrop-blur-md border border-white/10">
          <CardBody className="p-0 flex flex-col h-full">
            {selectedPipeline ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-divider flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold">
                        {selectedPipeline.name}
                      </h2>
                      <div className="flex items-center gap-2 text-tiny text-default-400 font-mono">
                        <Icon icon="hugeicons:finger-print" width={14} />
                        {selectedPipeline.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Edit Pipeline Settings">
                        <Button
                          isIconOnly
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          size="sm"
                          variant="light"
                          onPress={() => {
                            setTargetFailurePipeline(selectedPipeline);
                            editFlowFailurePipelineModal.onOpen();
                          }}
                        >
                          <Icon icon="hugeicons:settings-01" width={20} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete Pipeline">
                        <Button
                          isIconOnly
                          color="danger"
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          size="sm"
                          variant="light"
                          onPress={() => {
                            setTargetFailurePipeline(selectedPipeline.id);
                            deleteFailurePipelineModal.onOpen();
                          }}
                        >
                          <Icon icon="hugeicons:delete-02" width={20} />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-medium bg-content2/50 border border-default-200/50">
                      <Icon
                        className="text-default-500"
                        icon={
                          selectedPipeline.exec_parallel
                            ? "hugeicons:parallel"
                            : "hugeicons:arrow-right-01"
                        }
                        width={16}
                      />
                      <span className="text-small text-default-600">
                        {selectedPipeline.exec_parallel
                          ? "Parallel Execution"
                          : "Sequential Execution"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions List */}
                <div className="flex-1 flex flex-col overflow-hidden bg-content1/20">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-default-600 uppercase tracking-wider">
                      Pipeline Actions
                    </span>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Paste Action">
                        <Button
                          isDisabled={
                            (!canEdit ||
                              !settings.add_flow_actions ||
                              flow.disabled) &&
                            user.role !== "admin"
                          }
                          size="sm"
                          startContent={
                            <Icon icon="hugeicons:clipboard" width={16} />
                          }
                          variant="flat"
                          onPress={async () => {
                            const parsedAction = await getClipboardAction();

                            if (parsedAction) {
                              setTargetAction(parsedAction);
                              setTargetFailurePipeline(selectedPipeline);
                              copyFlowFailurePipelineActionModal.onOpen();
                            } else {
                              addToast({
                                title: "Flow",
                                description: "No action found in clipboard.",
                                color: "danger",
                                variant: "flat",
                              });
                            }
                          }}
                        >
                          Paste
                        </Button>
                      </Tooltip>
                      <Button
                        color="primary"
                        isDisabled={
                          (!canEdit ||
                            !settings.add_flow_actions ||
                            flow.disabled) &&
                          user.role !== "admin"
                        }
                        size="sm"
                        startContent={
                          <Icon icon="hugeicons:plus-sign" width={16} />
                        }
                        onPress={() => {
                          setTargetFailurePipeline(selectedPipeline);
                          addFlowFailurePipelineActionModal.onOpen();
                        }}
                      >
                        Add Action
                      </Button>
                    </div>
                  </div>

                  <ScrollShadow className="flex-1 p-4 pt-0">
                    <DndContext
                      collisionDetection={closestCenter}
                      onDragEnd={(event) =>
                        handleDragEndPipeline(selectedPipeline, event)
                      }
                    >
                      <SortableContext
                        items={selectedPipeline.actions || []}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-3">
                          {!selectedPipeline.actions ||
                          selectedPipeline.actions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-default-200 rounded-large">
                              <div className="size-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
                                <Icon
                                  className="text-default-400"
                                  icon="hugeicons:puzzle"
                                  width={32}
                                />
                              </div>
                              <p className="text-default-500 font-medium">
                                No actions in this pipeline
                              </p>
                              <p className="text-tiny text-default-400">
                                Add actions to define the failure handling logic
                              </p>
                              <Button
                                className="mt-4"
                                color="primary"
                                size="sm"
                                variant="flat"
                                onPress={() => {
                                  setTargetFailurePipeline(selectedPipeline);
                                  addFlowFailurePipelineActionModal.onOpen();
                                }}
                              >
                                Add First Action
                              </Button>
                            </div>
                          ) : (
                            selectedPipeline.actions.map(
                              (action: any, index: number) => (
                                <SortableItem
                                  key={action.id}
                                  action={action}
                                  index={index}
                                  total={selectedPipeline.actions.length}
                                />
                              ),
                            )
                          )}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </ScrollShadow>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-default-400 gap-4">
                <div className="size-20 rounded-full bg-content2/50 flex items-center justify-center">
                  <Icon
                    className="opacity-50"
                    icon="hugeicons:cursor-magic-selection-04"
                    width={40}
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-default-600">
                    No Pipeline Selected
                  </p>
                  <p className="text-sm">
                    Select a pipeline from the list or create a new one
                  </p>
                </div>
                <Button
                  color="primary"
                  startContent={<Icon icon="hugeicons:plus-sign" width={18} />}
                  variant="flat"
                  onPress={createFlowFailurePipelineModal.onOpen}
                >
                  Create Pipeline
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modals */}
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

      <AddFlowActionModal
        isFailurePipeline
        disclosure={addFlowFailurePipelineActionModal}
        failurePipeline={targetFailurePipeline}
        flow={flow}
        project={projects.find(
          (project: any) => project.id === flow.project_id,
        )}
        runners={runners}
        user={user}
      />
      <FlowActionDetails
        action={targetAction}
        disclosure={viewFlowActionDetails}
        flow={flow}
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
      <CopyActionToDifferentFlowModal
        isFailurePipeline
        copyAction={targetAction}
        disclosure={copyFailurePipelineActionToDifferentFlowModal}
        flow={flow}
        flows={flows}
        projects={projects}
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
