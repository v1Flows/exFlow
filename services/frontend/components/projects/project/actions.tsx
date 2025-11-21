import { Icon } from "@iconify/react";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect } from "react";

import { Integrations } from "@/components/ui/integrations";
import FlowActionDetails from "@/components/modals/actions/details";
import DeleteActionModal from "@/components/modals/actions/delete";
import AddProjectActionModal from "@/components/modals/actions/addProject";
import EditActionModal from "@/components/modals/actions/edit";

export default function ProjectActions({
  project,
  runners,
  user,
  canEdit,
  settings,
}: {
  project: any;
  runners: any;
  user: any;
  canEdit: boolean;
  settings: any;
}) {
  const [actions, setActions] = React.useState([] as any);
  const [targetAction, setTargetAction] = React.useState({} as any);
  const [, setUpdatedAction] = React.useState({} as any);

  const viewFlowActionDetails = useDisclosure();
  const addFlowActionModal = useDisclosure();
  const editActionModal = useDisclosure();
  const upgradeFlowActionModal = useDisclosure();
  const deleteActionModal = useDisclosure();

  useEffect(() => {
    setActions(project.predefined_flow_actions);
  }, [project.predefined_flow_actions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold">Actions</h2>
          <p className="text-small text-default-500">
            Manage predefined flow actions for this project.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip content="Add Action">
            <Button
              color="primary"
              isDisabled={
                (!canEdit ||
                  !settings.add_flow_actions ||
                  project.disabled) &&
                user.role !== "admin"
              }
              size="sm"
              startContent={
                <Icon icon="hugeicons:subnode-add" width={18} />
              }
              variant="solid"
              onPress={addFlowActionModal.onOpen}
            >
              Add Action
            </Button>
          </Tooltip>
        </div>
      </div>

      {actions.length === 0 && (
        <div className="relative z-10 h-[500px] w-full overflow-hidden rounded-large border border-default-200">
          <Integrations />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action: any) => (
          <Card
            key={action.id}
            fullWidth
            isPressable
            className="border-none shadow-sm bg-content1/60 backdrop-blur-md border border-default-100"
            isDisabled={!action.active}
            onPress={() => {
              setTargetAction(action);
              viewFlowActionDetails.onOpen();
            }}
          >
            <CardBody className="p-3">
              <div className="flex flex-cols items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon icon={action.icon} width={20} />
                  </div>
                  <div>
                    <p className="text-small font-bold line-clamp-1">
                      {action.custom_name ? action.custom_name : action.name}
                    </p>
                    <p className="text-tiny text-default-500 line-clamp-2">
                      {action.custom_description
                        ? action.custom_description
                        : action.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex flex-cols items-center justify-between pt-0 px-3 pb-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Chip color="primary" radius="sm" size="sm" variant="flat">
                  Vers. {action.version}
                </Chip>
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
                          (!canEdit || project.disabled) &&
                          user.role !== "admin"
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
                        (!canEdit || project.disabled) && user.role !== "admin"
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
                  <Tooltip content="Edit Action">
                    <Button
                      isIconOnly
                      isDisabled={
                        (!canEdit || project.disabled) && user.role !== "admin"
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
                        (!canEdit || project.disabled) && user.role !== "admin"
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
        ))}
      </div>
      <AddProjectActionModal
        disclosure={addFlowActionModal}
        project={project}
        runners={runners}
        user={user}
      />

      <FlowActionDetails
        action={targetAction}
        disclosure={viewFlowActionDetails}
      />
      <EditActionModal
        isProject
        disclosure={editActionModal}
        project={project}
        runners={runners}
        targetAction={targetAction}
      />
      <DeleteActionModal
        isProjectAction
        actionID={targetAction}
        disclosure={deleteActionModal}
        projectID={project.id}
      />
    </div>
  );
}
