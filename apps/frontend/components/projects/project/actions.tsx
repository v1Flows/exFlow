import { Icon } from "@iconify/react";
import {
  Button,
  ButtonGroup,
  Card,
  Chip,
  Tooltip,
  useOverlayState,
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
  const viewFlowActionDetails = useOverlayState();
  const addFlowActionModal = useOverlayState();
  const editActionModal = useOverlayState();
  const upgradeFlowActionModal = useOverlayState();
  const deleteActionModal = useOverlayState();
  useEffect(() => {
    setActions(project.predefined_flow_actions);
  }, [project.predefined_flow_actions]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold">Actions</h2>
          <p className="text-sm text-muted">
            Manage predefined flow actions for this project.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                isDisabled={
                  (!canEdit ||
                    !settings.add_flow_actions ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                size="sm"
                variant="primary"
                onPress={addFlowActionModal.open}
              >
                {<Icon icon="hugeicons:subnode-add" width={18} />}
                Add Action
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{"Add Action"}</Tooltip.Content>
          </Tooltip>
        </div>
      </div>

      {actions.length === 0 && (
        <div className="relative z-10 h-[500px] w-full overflow-hidden rounded-lg border border-default">
          <Integrations />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action: any) => (
          <Button
            key={action.id}
            className="h-auto w-full justify-start p-0 text-left"
            variant="tertiary"
            onPress={() => {
              setTargetAction(action);
              viewFlowActionDetails.open();
            }}
          >
            <Card
              key={action.id}
              className="w-full shadow-sm bg-surface/60 backdrop-blur-md border border-default"
            >
              <Card.Content className="p-3">
                <div className="flex flex-cols items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon icon={action.icon} width={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold line-clamp-1">
                        {action.custom_name ? action.custom_name : action.name}
                      </p>
                      <p className="text-xs text-muted line-clamp-2">
                        {action.custom_description
                          ? action.custom_description
                          : action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Content>
              <Card.Footer className="flex flex-cols items-center justify-between pt-0 px-3 pb-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <Chip color="accent" size="sm" variant="soft">
                    <Chip.Label>Vers. {action.version}</Chip.Label>
                  </Chip>
                  {action.update_available && (
                    <Chip color="accent" size="sm" variant="primary">
                      <Chip.Label>Upgrade Available</Chip.Label>
                    </Chip>
                  )}
                </div>
                <div>
                  <ButtonGroup size="sm">
                    {action.update_available && (
                      <Tooltip>
                        <Tooltip.Trigger>
                          <Button
                            isDisabled={
                              (!canEdit || project.disabled) &&
                              user.role !== "admin"
                            }
                            variant="secondary"
                            onPress={() => {
                              setTargetAction(action);
                              setUpdatedAction(action.updated_action);
                              upgradeFlowActionModal.open();
                            }}
                            className="aspect-square p-0"
                          >
                            <Icon
                              icon="hugeicons:system-update-02"
                              width={18}
                            />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          {"Upgrade Plugin Version"}
                        </Tooltip.Content>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isDisabled={
                            (!canEdit || project.disabled) &&
                            user.role !== "admin"
                          }
                          variant="tertiary"
                          onPress={() => {
                            setTargetAction(action);
                            viewFlowActionDetails.open();
                          }}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:view" width={18} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{"View Action Details"}</Tooltip.Content>
                    </Tooltip>
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isDisabled={
                            (!canEdit || project.disabled) &&
                            user.role !== "admin"
                          }
                          variant="tertiary"
                          onPress={() => {
                            setTargetAction(action);
                            editActionModal.open();
                          }}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:pencil-edit-02" width={18} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{"Edit Action"}</Tooltip.Content>
                    </Tooltip>
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isDisabled={
                            (!canEdit || project.disabled) &&
                            user.role !== "admin"
                          }
                          variant="danger-soft"
                          onPress={() => {
                            setTargetAction(action.id);
                            deleteActionModal.open();
                          }}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:delete-02" width={18} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{"Delete Action"}</Tooltip.Content>
                    </Tooltip>
                  </ButtonGroup>
                </div>
              </Card.Footer>
            </Card>
          </Button>
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
