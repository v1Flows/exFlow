import {
  Avatar,
  Button,
  Card,
  Chip,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { motion } from "framer-motion";
import canEditProject from "@/lib/functions/canEditProject";
import AddProjectMemberModal from "@/components/modals/projects/members";
import EditProjectMemberModal from "@/components/modals/projects/editMember";
import LeaveProjectModal from "@/components/modals/projects/leave";
import DeleteProjectMemberModal from "@/components/modals/projects/removeMember";
import ProjectTransferOwnership from "@/components/modals/projects/transferOwnership";
const statusColorMap: any = {
  Owner: "danger",
  Editor: "primary",
  Viewer: "default",
};
export default function ProjectMembers({ project, settings, user }: any) {
  const addProjectMemberModal = useOverlayState();
  const editProjectMemberModal = useOverlayState();
  const leaveProjectModal = useOverlayState();
  const deleteProjectMemberModal = useOverlayState();
  const transferOwnershipModal = useOverlayState();
  const [targetUser, setTargetUser] = useState({});
  function checkLeaveProjectDisabled() {
    if (
      project.members.find((m: any) => m.user_id === user.id) &&
      project.members.filter((m: any) => m.user_id === user.id)[0].role ===
        "Owner"
    ) {
      return true;
    }
    if (project.disabled) {
      return true;
    }
    return false;
  }
  return (
    <motion.div
      animate="visible"
      className="space-y-6"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4"
        variants={{
          hidden: { y: -10, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold">Members</h2>
          <p className="text-sm text-muted">{project.members.length} Members</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            isDisabled={
              (!canEditProject(user.id, project.members) ||
                !settings.add_project_members ||
                project.disabled) &&
              user.role !== "admin"
            }
            size="sm"
            variant="primary"
            onPress={() => addProjectMemberModal.open()}
          >
            {<Icon icon="hugeicons:add-team-02" width={18} />}
            Add Member
          </Button>

          {checkLeaveProjectDisabled() ? (
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isDisabled={project.disabled}
                  size="sm"
                  variant="danger-soft"
                  onPress={() => transferOwnershipModal.open()}
                  className="aspect-square p-0"
                >
                  {<Icon icon="hugeicons:self-transfer" width={18} />}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{"Transfer Ownership"}</Tooltip.Content>
            </Tooltip>
          ) : (
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isDisabled={checkLeaveProjectDisabled()}
                  size="sm"
                  variant="ghost"
                  onPress={() => leaveProjectModal.open()}
                  className="aspect-square p-0"
                >
                  {<Icon icon="solar:undo-left-round-outline" width={18} />}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{"Leave Project"}</Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.members.map((member: any) => (
          <motion.div
            key={member.id}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
          >
            <Card
              className={`border-none shadow-sm bg-surface/60 backdrop-blur-md border border-default transition-all duration-300 hover:bg-surface/80 hover:scale-[1.01] group ${member.invite_pending ? "border-warning/50" : ""}`}
            >
              <Card.Content className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`flex items-center gap-3 ${""}`}>
                    <Avatar>
                      <Avatar.Fallback>
                        {String("").slice(0, 2).toUpperCase()}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate">
                        {
                          <p className="text-sm font-semibold text-foreground">
                            {member.username}
                          </p>
                        }
                      </div>
                      <div className="truncate text-sm text-muted">
                        {
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-xs text-muted">{member.email}</p>
                            <div className="flex items-center gap-2">
                              {member.user_id === user.id && (
                                <Chip
                                  className="h-5 text-[10px] px-1"
                                  color="accent"
                                  size="sm"
                                  variant="soft"
                                >
                                  <Chip.Label>You</Chip.Label>
                                </Chip>
                              )}
                              <Chip
                                className="h-5 text-[10px] px-1"
                                color={statusColorMap[member.role]}
                                size="sm"
                                variant="soft"
                              >
                                <Chip.Label>{member.role}</Chip.Label>
                              </Chip>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isDisabled={
                            (!canEditProject(user.id, project.members) ||
                              project.disabled) &&
                            user.role !== "admin"
                          }
                          size="sm"
                          variant="ghost"
                          onPress={() => {
                            setTargetUser(member);
                            editProjectMemberModal.open();
                          }}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:pencil-edit-02" width={16} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{"Edit Member"}</Tooltip.Content>
                    </Tooltip>
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          isDisabled={
                            (!canEditProject(user.id, project.members) ||
                              member.user_id === user.id ||
                              project.disabled) &&
                            user.role !== "admin"
                          }
                          size="sm"
                          variant="danger"
                          onPress={() => {
                            setTargetUser(member);
                            deleteProjectMemberModal.open();
                          }}
                          className="aspect-square p-0"
                        >
                          <Icon icon="hugeicons:delete-02" width={16} />
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{"Remove Member"}</Tooltip.Content>
                    </Tooltip>
                  </div>
                </div>
              </Card.Content>
              <Card.Footer className="px-4 pb-4 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2 w-full">
                  {member.invite_pending ? (
                    <Chip
                      className="border-none"
                      color="warning"
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>Invite Pending</Chip.Label>
                    </Chip>
                  ) : (
                    <div className="flex items-center justify-between w-full text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Icon icon="hugeicons:calendar-03" width={14} />
                        <span>
                          Joined{" "}
                          {new Date(
                            member.joined_at || member.invited_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Footer>
            </Card>
          </motion.div>
        ))}
      </div>
      <AddProjectMemberModal
        disclosure={addProjectMemberModal}
        project={project}
      />
      <EditProjectMemberModal
        disclosure={editProjectMemberModal}
        projectID={project.id}
        user={targetUser}
      />
      <LeaveProjectModal
        disclosure={leaveProjectModal}
        projectID={project.id}
      />
      <DeleteProjectMemberModal
        disclosure={deleteProjectMemberModal}
        projectID={project.id}
        user={targetUser}
      />
      <ProjectTransferOwnership
        disclosure={transferOwnershipModal}
        project={project}
        user={user}
      />
    </motion.div>
  );
}
