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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect } from "react";

import UpdateFlowActions from "@/lib/fetch/flow/PUT/UpdateActions";
import EditFlowActionsDetails from "@/components/modals/actions/editDetails";
import EditActionModal from "@/components/modals/actions/edit";
import DeleteActionModal from "@/components/modals/actions/delete";
import AddActionModal from "@/components/modals/actions/add";
import CopyActionModal from "@/components/modals/actions/copy";
import UpgradeActionModal from "@/components/modals/actions/upgrade";
import CopyActionToDifferentFlowModal from "@/components/modals/actions/transferCopy";
import FlowActionDetails from "@/components/modals/actions/details";
import { Integrations } from "@/components/ui/integrations";

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
                    variant="flat"
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
                    variant="flat"
                    onPress={() => {
                      setTargetAction(action.id);
                      deleteActionModal.onOpen();
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

  return (
    <div>
      <Card>
        <CardBody>
          <div className="flex-wrap flex items-center justify-between gap-2">
            <div className="flex flex-col items-start">
              <p className="text-md font-bold">Actions</p>
              <p className="text-tiny text-default-500">
                Common action settings can be found on the settings tab
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip content="Add Action">
                <Button
                  isIconOnly
                  color="primary"
                  isDisabled={
                    (!canEdit || !settings.add_flow_actions || flow.disabled) &&
                    user.role !== "admin"
                  }
                  size="sm"
                  startContent={
                    <Icon icon="hugeicons:subnode-add" width={18} />
                  }
                  variant="solid"
                  onPress={addFlowActionModal.onOpen}
                />
              </Tooltip>
              <Tooltip content="Paste Copied Action">
                <Button
                  isIconOnly
                  isDisabled={
                    (!canEdit || !settings.add_flow_actions || flow.disabled) &&
                    user.role !== "admin"
                  }
                  size="sm"
                  startContent={<Icon icon="hugeicons:file-paste" width={18} />}
                  variant="light"
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
                />
              </Tooltip>
            </div>
          </div>
        </CardBody>
      </Card>
      <Spacer y={2} />
      {actions.length === 0 && (
        <div className="relative z-10 h-[500px] w-full overflow-hidden">
          <Integrations />
        </div>
      )}
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
      </div>
      <EditFlowActionsDetails disclosure={editFlowActionsDetails} flow={flow} />
      <AddActionModal
        disclosure={addFlowActionModal}
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
    </div>
  );
}
