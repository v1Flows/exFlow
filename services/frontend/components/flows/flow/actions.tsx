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
  CardHeader,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect } from "react";
import { motion } from "framer-motion";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import EditFlowActionsDetails from "@/components/modals/actions/editDetails";
import EditActionModal from "@/components/modals/actions/edit";
import DeleteActionModal from "@/components/modals/actions/delete";
import CopyActionModal from "@/components/modals/actions/copy";
import UpgradeActionModal from "@/components/modals/actions/upgrade";
import CopyActionToDifferentFlowModal from "@/components/modals/actions/transferCopy";
import FlowActionDetails from "@/components/modals/actions/details";
import { Integrations } from "@/components/ui/integrations";
import AddFlowActionModal from "@/components/modals/actions/addFlow";

export default function Actions({
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
  const [actions, setActions] = React.useState([] as any);
  const [targetAction, setTargetAction] = React.useState({} as any);
  const [updatedAction, setUpdatedAction] = React.useState({} as any);

  const viewFlowActionDetails = useDisclosure();
  const editFlowActionsDetails = useDisclosure();
  const addFlowActionModal = useDisclosure();
  const editActionModal = useDisclosure();
  const copyFlowActionModal = useDisclosure();
  const upgradeFlowActionModal = useDisclosure();
  const deleteActionModal = useDisclosure();
  const copyActionToDifferentFlowModal = useDisclosure();

  useEffect(() => {
    setActions(flow.actions);
  }, [flow.actions]);

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
        className="relative pl-12 pb-8 last:pb-0"
        style={style}
        {...attributes}
      >
        {/* Timeline Line */}
        {index !== total - 1 && (
          <div className="absolute left-[23px] top-8 bottom-0 w-[2px] bg-default-200" />
        )}

        {/* Timeline Dot */}
        <div className="absolute left-[11px] top-8 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-2 border-primary z-10 flex items-center justify-center shadow-sm">
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Step Number */}
        <div className="absolute left-0 top-0 -translate-x-full pr-4 pt-6 text-xs font-bold text-default-400 hidden md:block">
          Step {index + 1}
        </div>

        <Card
          key={action.id}
          fullWidth
          isPressable
          className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm hover:shadow-md transition-shadow"
          isDisabled={!action.active}
          onPress={() => {
            setTargetAction(action);
            viewFlowActionDetails.onOpen();
          }}
        >
          <CardBody className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Icon icon={action.icon} width={28} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    {action.custom_name ? action.custom_name : action.name}
                  </p>
                  <p className="text-sm text-default-500 line-clamp-1">
                    {action.custom_description
                      ? action.custom_description
                      : action.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto md:ml-0">
                <Chip
                  className="border-none"
                  color={action.active ? "success" : "default"}
                  size="sm"
                  variant="dot"
                >
                  {action.active ? "Active" : "Disabled"}
                </Chip>
                <Tooltip content="Reorder action by dragging">
                  <Button
                    isIconOnly
                    className="cursor-grab active:cursor-grabbing"
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    size="sm"
                    variant="light"
                    {...listeners}
                  >
                    <Icon icon="hugeicons:drag-02" width={20} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardBody>
          <CardFooter className="px-4 py-3 border-t border-default-100 bg-content2/30 flex justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Chip size="sm" variant="flat">
                v{action.version}
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
                    <Chip color="warning" size="sm" variant="flat">
                      No Failure Pipeline
                    </Chip>
                  ))}
              {action.update_available && (
                <Chip color="primary" size="sm" variant="solid">
                  Upgrade Available
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
                      upgradeFlowActionModal.onOpen();
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
                      copyFlowActionModal.onOpen();
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
                      setTargetAction(action);
                      copyActionToDifferentFlowModal.onOpen();
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
                  onPress={() => {
                    setTargetAction(action);
                    editActionModal.onOpen();
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
                  onPress={() => {
                    setTargetAction(action.id);
                    deleteActionModal.onOpen();
                  }}
                >
                  <Icon icon="hugeicons:delete-02" width={18} />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </CardFooter>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      animate="visible"
      className="space-y-6"
      initial="hidden"
      variants={containerVariants}
    >
      <Card className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
        <CardHeader className="flex justify-between items-center px-6 py-4">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon icon="hugeicons:structure-04" width={24} />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-bold">Flow Actions</p>
              <p className="text-small text-default-500">
                Manage the execution steps of your flow.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Tooltip content="Paste Copied Action">
              <Button
                isIconOnly
                isDisabled={
                  (!canEdit || !settings.add_flow_actions || flow.disabled) &&
                  user.role !== "admin"
                }
                variant="flat"
                onPress={async () => {
                  const parsedAction = await getClipboardAction();

                  if (parsedAction) {
                    setTargetAction(parsedAction);
                    copyFlowActionModal.onOpen();
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
                <Icon icon="hugeicons:clipboard-check" width={20} />
              </Button>
            </Tooltip>
            <Button
              color="primary"
              isDisabled={
                (!canEdit || !settings.add_flow_actions || flow.disabled) &&
                user.role !== "admin"
              }
              startContent={<Icon icon="hugeicons:plus-sign" width={20} />}
              onPress={addFlowActionModal.onOpen}
            >
              Add Action
            </Button>
          </div>
        </CardHeader>
      </Card>

      {actions.length === 0 && (
        <div className="relative z-10 h-[500px] w-full overflow-hidden rounded-xl border border-default-200 bg-content1/30">
          <Integrations />
        </div>
      )}

      <div className="flex flex-col pl-4 md:pl-10">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={actions}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {actions.map((action: any, index: number) => (
                <SortableItem
                  key={action.id}
                  action={action}
                  index={index}
                  total={actions.length}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Action Placeholder at the end */}
        {actions.length > 0 && (
          <div className="relative pl-12 pt-2">
            <div className="absolute left-[23px] top-0 h-8 w-[2px] bg-default-200" />
            <div className="absolute left-[11px] top-8 -translate-y-1/2 w-6 h-6 rounded-full bg-default-100 border-2 border-default-300 z-10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-default-300" />
            </div>
            <Button
              className="w-full h-12 border-dashed border-2 border-default-300 bg-transparent text-default-500"
              isDisabled={
                (!canEdit || !settings.add_flow_actions || flow.disabled) &&
                user.role !== "admin"
              }
              startContent={<Icon icon="hugeicons:plus-sign" width={20} />}
              variant="light"
              onPress={addFlowActionModal.onOpen}
            >
              Add Next Action
            </Button>
          </div>
        )}
      </div>

      <EditFlowActionsDetails disclosure={editFlowActionsDetails} flow={flow} />
      <AddFlowActionModal
        disclosure={addFlowActionModal}
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
      <CopyActionToDifferentFlowModal
        copyAction={targetAction}
        disclosure={copyActionToDifferentFlowModal}
        flow={flow}
        flows={flows}
        projects={projects}
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
    </motion.div>
  );
}
