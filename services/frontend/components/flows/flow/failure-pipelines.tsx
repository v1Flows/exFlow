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
  CardFooter,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spacer,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
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

  const [failurePipelineTab, setFailurePipelineTab] =
    React.useState("add-pipeline");

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

      if (failurePipelineTab === "add-pipeline") {
        setFailurePipelineTab(flow.failure_pipelines[0]?.id || "add-pipeline");
      }
    }
  }, [flow]);

  const handleFailurePipelineTabChange = (key: any) => {
    setFailurePipelineTab(key);
  };

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

  const SortableItem = ({ action }: { action: any }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: action.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card
          key={action.id}
          fullWidth
          isPressable
          isDisabled={!action.active}
          onPress={() => {
            setTargetAction(action);
            viewFlowActionDetails.onOpen();
          }}
        >
          <CardBody>
            <div className="flex flex-cols items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon={action.icon} width={26} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    {action.custom_name ? action.custom_name : action.name}
                  </p>
                  <p className="text-sm text-default-500">
                    {action.custom_description
                      ? action.custom_description
                      : action.description}
                  </p>
                </div>
              </div>
              <div className="flex-cols flex items-center gap-2">
                <Tooltip content="Reorder action by dragging">
                  <Button
                    isIconOnly
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    size="sm"
                    variant="flat"
                    {...listeners}
                    style={{ cursor: "grab", touchAction: "none" }}
                  >
                    <Icon icon="hugeicons:drag-02" width={18} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex flex-cols items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <Chip color="primary" radius="sm" size="sm" variant="flat">
                Vers. {action.version}
              </Chip>
              <Chip
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
                    <Chip color="warning" radius="sm" size="sm" variant="flat">
                      No Failure Pipeline Assigned
                    </Chip>
                  ))}
              {action.update_available && (
                <Chip color="primary" radius="sm" size="sm" variant="solid">
                  Upgrade Available
                </Chip>
              )}
            </div>
            <div>
              <ButtonGroup size="sm">
                {action.update_available && (
                  <Tooltip content="Upgrade Plugin Version">
                    <Button
                      isIconOnly
                      color="primary"
                      isDisabled={
                        (!canEdit || flow.disabled) && user.role !== "admin"
                      }
                      variant="flat"
                      onPress={() => {
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
                      }}
                    >
                      <Icon icon="hugeicons:system-update-02" width={18} />
                    </Button>
                  </Tooltip>
                )}
                <Tooltip content="View Action Details">
                  <Button
                    isIconOnly
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    variant="flat"
                    onPress={() => {
                      setTargetAction(action);
                      viewFlowActionDetails.onOpen();
                    }}
                  >
                    <Icon icon="hugeicons:view" width={18} />
                  </Button>
                </Tooltip>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      isDisabled={
                        (!canEdit || flow.disabled) && user.role !== "admin"
                      }
                      variant="flat"
                    >
                      <Icon icon="hugeicons:copy-02" width={18} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Copy Actions" variant="flat">
                    <DropdownItem
                      key="clipboard"
                      description="Copy action to clipboard"
                      startContent={
                        <Icon icon="hugeicons:clipboard" width={20} />
                      }
                      onPress={() => {
                        navigator.clipboard.writeText(JSON.stringify(action));
                        addToast({
                          title: "Action",
                          description: "Action copied to clipboard!",
                          color: "success",
                          variant: "flat",
                        });
                      }}
                    >
                      Clipboard
                    </DropdownItem>
                    <DropdownItem
                      key="local"
                      description="Copy action to the current flow"
                      startContent={
                        <Icon icon="hugeicons:pin-location-02" width={20} />
                      }
                      onPress={() => {
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
                      }}
                    >
                      Local
                    </DropdownItem>
                    <DropdownItem
                      key="different"
                      description="Copy action to another flow"
                      startContent={
                        <Icon icon="hugeicons:delivery-sent-02" width={20} />
                      }
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
                          copyFailurePipelineActionToDifferentFlowModal.onOpen();
                        } else {
                          setTargetAction(action);
                          copyActionToDifferentFlowModal.onOpen();
                        }
                      }}
                    >
                      Transfer
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <Tooltip content="Edit Action">
                  <Button
                    isIconOnly
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    variant="flat"
                    onPress={() => {
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
                    }}
                  >
                    <Icon icon="hugeicons:pencil-edit-02" width={18} />
                  </Button>
                </Tooltip>
                <Tooltip content="Delete Action">
                  <Button
                    isIconOnly
                    color="danger"
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    variant="flat"
                    onPress={() => {
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
                    }}
                  >
                    <Icon icon="hugeicons:delete-02" width={18} />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </div>
          </CardFooter>
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

  return (
    <div>
      <p className="text-sm text-default-500">
        With failure pipelines you have the ability to send notifications or
        trigger any other action if a specific action or the whole execution
        failed.
      </p>
      <Spacer y={2} />
      <Tabs
        aria-label="failure-pipelines"
        selectedKey={failurePipelineTab}
        variant="solid"
        onSelectionChange={handleFailurePipelineTabChange}
      >
        {failurePipelines.map((pipeline: any) => (
          <Tab key={pipeline.id} title={pipeline.name}>
            <div className="flex flex-col gap-4">
              <Card>
                <CardBody>
                  <div className="flex-wrap flex items-center justify-between gap-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex flex-cols items-center gap-2">
                        <p className="text-md font-bold">{pipeline.name}</p>
                        <div className="flex flex-cols gap-2">
                          <Chip radius="sm" size="sm" variant="flat">
                            {pipeline.exec_parallel ? "Parallel" : "Sequential"}
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
                      <Tooltip content="Add Action">
                        <Button
                          isIconOnly
                          color="primary"
                          isDisabled={
                            (!canEdit ||
                              !settings.add_flow_actions ||
                              flow.disabled) &&
                            user.role !== "admin"
                          }
                          size="sm"
                          startContent={
                            <Icon icon="hugeicons:subnode-add" width={18} />
                          }
                          variant="solid"
                          onPress={() => {
                            setTargetFailurePipeline(pipeline);
                            addFlowFailurePipelineActionModal.onOpen();
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Paste Copied Action">
                        <Button
                          isIconOnly
                          isDisabled={
                            (!canEdit ||
                              !settings.add_flow_actions ||
                              flow.disabled) &&
                            user.role !== "admin"
                          }
                          size="sm"
                          startContent={
                            <Icon icon="hugeicons:file-paste" width={18} />
                          }
                          variant="light"
                          onPress={async () => {
                            const parsedAction = await getClipboardAction();

                            if (parsedAction) {
                              setTargetAction(parsedAction);
                              setTargetFailurePipeline(pipeline);
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
                        />
                      </Tooltip>
                      <Tooltip content="Edit Pipeline">
                        <Button
                          isIconOnly
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          size="sm"
                          startContent={
                            <Icon icon="hugeicons:pencil-edit-02" width={18} />
                          }
                          variant="light"
                          onPress={() => {
                            setTargetFailurePipeline(pipeline);
                            editFlowFailurePipelineModal.onOpen();
                          }}
                        />
                      </Tooltip>
                      <Tooltip content="Delete Pipeline">
                        <Button
                          isIconOnly
                          color="danger"
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          size="sm"
                          startContent={
                            <Icon icon="hugeicons:delete-02" width={18} />
                          }
                          variant="light"
                          onPress={() => {
                            setTargetFailurePipeline(pipeline.id);
                            deleteFailurePipelineModal.onOpen();
                          }}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEndPipeline(pipeline, event)}
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
              isDisabled={(!canEdit || flow.disabled) && user.role !== "admin"}
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
