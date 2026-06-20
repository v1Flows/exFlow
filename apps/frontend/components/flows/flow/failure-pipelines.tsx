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
  Button,
  ButtonGroup,
  Card,
  Chip,
  Dropdown,
  ScrollShadow,
  toast,
  Tooltip,
  useOverlayState,
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
  const viewFlowActionDetails = useOverlayState();
  const createFlowFailurePipelineModal = useOverlayState();
  const editFlowFailurePipelineModal = useOverlayState();
  const deleteFailurePipelineModal = useOverlayState();
  const addFlowFailurePipelineActionModal = useOverlayState();
  const editFlowFailurePipelineActionModal = useOverlayState();
  const deleteFlowFailurePipelineActionModal = useOverlayState();
  const copyFlowFailurePipelineActionModal = useOverlayState();
  const upgradeFlowFailurePipelineActionModal = useOverlayState();
  const copyActionToDifferentFlowModal = useOverlayState();
  const copyFailurePipelineActionToDifferentFlowModal = useOverlayState();
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
          <div className="absolute left-[19px] top-8 bottom-0 w-[2px] bg-default/50" />
        )}

        {/* Timeline Dot */}
        <div className="absolute left-[9px] top-8 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-2 border-accent z-10 flex items-center justify-center shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>

        {/* Step Number */}
        <div className="absolute left-0 top-0 -translate-x-full pr-4 pt-6 text-xs font-bold text-muted hidden md:block">
          Step {index + 1}
        </div>

        <Button
          className="h-auto w-full justify-start p-0 text-left"
          variant="tertiary"
          onPress={() => {
            setTargetAction(action);
            viewFlowActionDetails.open();
          }}
        >
          <Card
            key={action.id}
            className="w-full bg-surface/40 border border-default/50 hover:bg-surface/60 transition-all"
          >
            <Card.Content className="p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                    <Icon icon={action.icon} width={24} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {action.custom_name || action.name}
                      </p>
                      <Chip
                        className="h-5 text-[10px] px-1"
                        color="accent"
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>v{action.version}</Chip.Label>
                      </Chip>
                    </div>
                    <p className="text-xs text-muted line-clamp-1">
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
                      variant="soft"
                    >
                      <Chip.Label>
                        {action.active ? "Active" : "Disabled"}
                      </Chip.Label>
                    </Chip>
                    {action.update_available && (
                      <Chip color="accent" size="sm" variant="soft">
                        <Chip.Label>Update</Chip.Label>
                      </Chip>
                    )}
                  </div>

                  <ButtonGroup size="sm" variant="ghost">
                    {action.update_available && (
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            isDisabled={
                              (!canEdit || flow.disabled) &&
                              user.role !== "admin"
                            }
                            onPress={() => {
                              setTargetAction(action);
                              setUpdatedAction(action.updated_action);
                              setTargetFailurePipeline(
                                flow.failure_pipelines.find(
                                  (p: any) => p.id === selectedPipelineId,
                                ),
                              );
                              upgradeFlowFailurePipelineActionModal.open();
                            }}
                            variant="primary"
                            className="aspect-square p-0"
                          >
                            <Icon
                              icon="hugeicons:system-update-02"
                              width={16}
                            />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          {"Upgrade Plugin Version"}
                        </Tooltip.Content>
                      </Tooltip>
                    )}

                    <Dropdown>
                      <Dropdown.Trigger>
                        <Button
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:more-vertical" width={16} />
                        </Button>
                      </Dropdown.Trigger>
                      <Dropdown.Popover>
                        <Dropdown.Menu aria-label="Action Options">
                          <Dropdown.Item
                            key="details"
                            id="details"
                            onPress={() => {
                              setTargetAction(action);
                              viewFlowActionDetails.open();
                            }}
                            textValue="View Details"
                          >
                            {<Icon icon="hugeicons:view" width={18} />}
                            View Details
                          </Dropdown.Item>
                          <Dropdown.Item
                            key="edit"
                            id="edit"
                            onPress={() => {
                              setTargetAction(action);
                              setTargetFailurePipeline(
                                flow.failure_pipelines.find(
                                  (p: any) => p.id === selectedPipelineId,
                                ),
                              );
                              editFlowFailurePipelineActionModal.open();
                            }}
                            textValue="Edit Action"
                          >
                            {
                              <Icon
                                icon="hugeicons:pencil-edit-02"
                                width={18}
                              />
                            }
                            Edit Action
                          </Dropdown.Item>
                          <Dropdown.Item
                            key="copy"
                            id="copy"
                            onPress={() => {
                              setTargetAction(action);
                              setTargetFailurePipeline(
                                flow.failure_pipelines.find(
                                  (p: any) => p.id === selectedPipelineId,
                                ),
                              );
                              copyFlowFailurePipelineActionModal.open();
                            }}
                            textValue="Copy Local"
                          >
                            {<Icon icon="hugeicons:copy-02" width={18} />}
                            Copy Local
                          </Dropdown.Item>
                          <Dropdown.Item
                            key="transfer"
                            id="transfer"
                            onPress={() => {
                              setTargetAction(action);
                              copyActionToDifferentFlowModal.open();
                            }}
                            textValue="Transfer"
                          >
                            {
                              <Icon
                                icon="hugeicons:delivery-sent-02"
                                width={18}
                              />
                            }
                            Transfer
                          </Dropdown.Item>
                          <Dropdown.Item
                            key="delete"
                            id="delete"
                            className="text-danger"
                            onPress={() => {
                              setTargetAction(action.id);
                              setTargetFailurePipeline(
                                flow.failure_pipelines.find(
                                  (p: any) => p.id === selectedPipelineId,
                                ),
                              );
                              deleteFlowFailurePipelineActionModal.open();
                            }}
                            textValue="Delete Action"
                          >
                            {<Icon icon="hugeicons:delete-02" width={18} />}
                            Delete Action
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown.Popover>
                    </Dropdown>

                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          className="cursor-grab active:cursor-grabbing"
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          {...listeners}
                        >
                          <Icon icon="hugeicons:drag-02" width={16} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{"Drag to reorder"}</Tooltip.Content>
                    </Tooltip>
                  </ButtonGroup>
                </div>
              </div>
            </Card.Content>
          </Card>
        </Button>
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
        toast.success("Flow", {
          description:
            "Flow failure pipeline actions order updated successfully.",
        });
      })
      .catch(() => {
        router.refresh();
        toast.danger("Flow", {
          description: "Failed to update flow failure pipeline actions order.",
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
        <p className="text-sm text-muted">
          Configure failure pipelines to handle errors gracefully. These
          pipelines can be triggered when specific actions or the entire flow
          fails.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        {/* Left Sidebar - Pipeline List */}
        <Card className="w-full lg:w-1/3 h-full bg-surface/60 backdrop-blur-md border border-white/10">
          <Card.Content className="p-0 flex flex-col h-full">
            <div className="p-4 border-b border-separator flex items-center justify-between sticky top-0 bg-surface/60 backdrop-blur-md z-10">
              <span className="font-semibold text-foreground">Pipelines</span>
              <Button
                isDisabled={
                  (!canEdit || flow.disabled) && user.role !== "admin"
                }
                size="sm"
                onPress={createFlowFailurePipelineModal.open}
                variant="primary"
              >
                {<Icon icon="hugeicons:plus-sign" width={16} />}
                New Pipeline
              </Button>
            </div>

            <ScrollShadow className="flex-1 p-2">
              <div className="flex flex-col gap-2">
                {failurePipelines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
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
                      <Button
                        key={pipeline.id}
                        className="h-auto w-full justify-start p-0 text-left"
                        variant="tertiary"
                        onPress={() => setSelectedPipelineId(pipeline.id)}
                      >
                        <Card
                          key={pipeline.id}
                          className={`border transition-all ${
                            selectedPipelineId === pipeline.id
                              ? "bg-accent/10 border-accent/50"
                              : "bg-transparent border-transparent hover:bg-surface-secondary/50"
                          }`}
                        >
                          <Card.Content className="p-3">
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex items-center justify-between w-full">
                                <span
                                  className={`font-medium ${selectedPipelineId === pipeline.id ? "text-accent" : "text-foreground"}`}
                                >
                                  {pipeline.name}
                                </span>
                                {pipeline.exec_parallel && (
                                  <Icon
                                    className="text-muted"
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
                                    variant="soft"
                                  >
                                    <Chip.Label>Flow Default</Chip.Label>
                                  </Chip>
                                )}
                                {assignedStepsCount > 0 && (
                                  <Chip
                                    className="h-5 text-[10px] px-1"
                                    color="accent"
                                    size="sm"
                                    variant="soft"
                                  >
                                    <Chip.Label>
                                      {assignedStepsCount} Steps
                                    </Chip.Label>
                                  </Chip>
                                )}
                                {!isAssignedToFlow &&
                                  assignedStepsCount === 0 && (
                                    <Chip
                                      className="h-5 text-[10px] px-1 bg-default text-muted"
                                      size="sm"
                                      variant="soft"
                                    >
                                      <Chip.Label>Unused</Chip.Label>
                                    </Chip>
                                  )}
                              </div>
                            </div>
                          </Card.Content>
                        </Card>
                      </Button>
                    );
                  })
                )}
              </div>
            </ScrollShadow>
          </Card.Content>
        </Card>

        {/* Right Content - Pipeline Details */}
        <Card className="w-full lg:w-2/3 h-full bg-surface/60 backdrop-blur-md border border-white/10">
          <Card.Content className="p-0 flex flex-col h-full">
            {selectedPipeline ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-separator flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold">
                        {selectedPipeline.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-muted font-mono">
                        <Icon icon="hugeicons:finger-print" width={14} />
                        {selectedPipeline.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            isDisabled={
                              (!canEdit || flow.disabled) &&
                              user.role !== "admin"
                            }
                            size="sm"
                            variant="ghost"
                            onPress={() => {
                              setTargetFailurePipeline(selectedPipeline);
                              editFlowFailurePipelineModal.open();
                            }}
                            className="aspect-square p-0"
                          >
                            <Icon icon="hugeicons:settings-01" width={20} />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          {"Edit Pipeline Settings"}
                        </Tooltip.Content>
                      </Tooltip>
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            isDisabled={
                              (!canEdit || flow.disabled) &&
                              user.role !== "admin"
                            }
                            size="sm"
                            variant="danger"
                            onPress={() => {
                              setTargetFailurePipeline(selectedPipeline.id);
                              deleteFailurePipelineModal.open();
                            }}
                            className="aspect-square p-0"
                          >
                            <Icon icon="hugeicons:delete-02" width={20} />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{"Delete Pipeline"}</Tooltip.Content>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-secondary/50 border border-default/50">
                      <Icon
                        className="text-muted"
                        icon={
                          selectedPipeline.exec_parallel
                            ? "hugeicons:parallel"
                            : "hugeicons:arrow-right-01"
                        }
                        width={16}
                      />
                      <span className="text-sm text-muted">
                        {selectedPipeline.exec_parallel
                          ? "Parallel Execution"
                          : "Sequential Execution"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions List */}
                <div className="flex-1 flex flex-col overflow-hidden bg-surface/20">
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted uppercase tracking-wider">
                      Pipeline Actions
                    </span>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            isDisabled={
                              (!canEdit ||
                                !settings.add_flow_actions ||
                                flow.disabled) &&
                              user.role !== "admin"
                            }
                            size="sm"
                            variant="tertiary"
                            onPress={async () => {
                              const parsedAction = await getClipboardAction();
                              if (parsedAction) {
                                setTargetAction(parsedAction);
                                setTargetFailurePipeline(selectedPipeline);
                                copyFlowFailurePipelineActionModal.open();
                              } else {
                                toast.danger("Flow", {
                                  description: "No action found in clipboard.",
                                });
                              }
                            }}
                          >
                            {<Icon icon="hugeicons:clipboard" width={16} />}
                            Paste
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{"Paste Action"}</Tooltip.Content>
                      </Tooltip>
                      <Button
                        isDisabled={
                          (!canEdit ||
                            !settings.add_flow_actions ||
                            flow.disabled) &&
                          user.role !== "admin"
                        }
                        size="sm"
                        onPress={() => {
                          setTargetFailurePipeline(selectedPipeline);
                          addFlowFailurePipelineActionModal.open();
                        }}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:plus-sign" width={16} />}
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
                            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-default rounded-lg">
                              <div className="size-16 rounded-full bg-default flex items-center justify-center mb-4">
                                <Icon
                                  className="text-muted"
                                  icon="hugeicons:puzzle"
                                  width={32}
                                />
                              </div>
                              <p className="text-muted font-medium">
                                No actions in this pipeline
                              </p>
                              <p className="text-xs text-muted">
                                Add actions to define the failure handling logic
                              </p>
                              <Button
                                className="mt-4"
                                size="sm"
                                variant="secondary"
                                onPress={() => {
                                  setTargetFailurePipeline(selectedPipeline);
                                  addFlowFailurePipelineActionModal.open();
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
              <div className="flex flex-col items-center justify-center h-full text-muted gap-4">
                <div className="size-20 rounded-full bg-surface-secondary/50 flex items-center justify-center">
                  <Icon
                    className="opacity-50"
                    icon="hugeicons:cursor-magic-selection-04"
                    width={40}
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-muted">
                    No Pipeline Selected
                  </p>
                  <p className="text-sm">
                    Select a pipeline from the list or create a new one
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onPress={createFlowFailurePipelineModal.open}
                >
                  {<Icon icon="hugeicons:plus-sign" width={18} />}
                  Create Pipeline
                </Button>
              </div>
            )}
          </Card.Content>
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
