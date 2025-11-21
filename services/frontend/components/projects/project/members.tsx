import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Tooltip,
  useDisclosure,
  User,
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
  const addProjectMemberModal = useDisclosure();
  const editProjectMemberModal = useDisclosure();
  const leaveProjectModal = useDisclosure();
  const deleteProjectMemberModal = useDisclosure();
  const transferOwnershipModal = useDisclosure();

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
          <p className="text-small text-default-500">
            {project.members.length} Members
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            color="primary"
            isDisabled={
              (!canEditProject(user.id, project.members) ||
                !settings.add_project_members ||
                project.disabled) &&
              user.role !== "admin"
            }
            size="sm"
            startContent={<Icon icon="hugeicons:add-team-02" width={18} />}
            variant="solid"
            onPress={() => addProjectMemberModal.onOpen()}
          >
            Add Member
          </Button>

          {checkLeaveProjectDisabled() ? (
            <Tooltip content="Transfer Ownership">
              <Button
                isIconOnly
                color="danger"
                isDisabled={project.disabled}
                size="sm"
                startContent={
                  <Icon icon="hugeicons:self-transfer" width={18} />
                }
                variant="flat"
                onPress={() => transferOwnershipModal.onOpen()}
              />
            </Tooltip>
          ) : (
            <Tooltip content="Leave Project">
              <Button
                isIconOnly
                color="secondary"
                isDisabled={checkLeaveProjectDisabled()}
                size="sm"
                startContent={
                  <Icon icon="solar:undo-left-round-outline" width={18} />
                }
                variant="ghost"
                onPress={() => leaveProjectModal.onOpen()}
              />
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
              className={`border-none shadow-sm bg-content1/60 backdrop-blur-md border border-default-100 transition-all duration-300 hover:bg-content1/80 hover:scale-[1.01] group ${member.invite_pending ? "border-warning-200/50" : ""}`}
            >
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <User
                    avatarProps={{
                      radius: "lg",
                      name: member.username,
                      size: "md",
                      className: "transition-transform group-hover:scale-105",
                    }}
                    description={
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-tiny text-default-500">
                          {member.email}
                        </p>
                        <div className="flex items-center gap-2">
                          {member.user_id === user.id && (
                            <Chip
                              className="h-5 text-[10px] px-1"
                              color="primary"
                              radius="sm"
                              size="sm"
                              variant="flat"
                            >
                              You
                            </Chip>
                          )}
                          <Chip
                            className="h-5 text-[10px] px-1"
                            color={statusColorMap[member.role]}
                            radius="sm"
                            size="sm"
                            variant="flat"
                          >
                            {member.role}
                          </Chip>
                        </div>
                      </div>
                    }
                    name={
                      <p className="text-small font-semibold text-default-700">
                        {member.username}
                      </p>
                    }
                  />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip content="Edit Member">
                      <Button
                        isIconOnly
                        isDisabled={
                          (!canEditProject(user.id, project.members) ||
                            project.disabled) &&
                          user.role !== "admin"
                        }
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setTargetUser(member);
                          editProjectMemberModal.onOpen();
                        }}
                      >
                        <Icon icon="hugeicons:pencil-edit-02" width={16} />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Remove Member">
                      <Button
                        isIconOnly
                        color="danger"
                        isDisabled={
                          (!canEditProject(user.id, project.members) ||
                            member.user_id === user.id ||
                            project.disabled) &&
                          user.role !== "admin"
                        }
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setTargetUser(member);
                          deleteProjectMemberModal.onOpen();
                        }}
                      >
                        <Icon icon="hugeicons:delete-02" width={16} />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2 w-full">
                  {member.invite_pending ? (
                    <Chip
                      className="border-none"
                      color="warning"
                      size="sm"
                      variant="dot"
                    >
                      Invite Pending
                    </Chip>
                  ) : (
                    <div className="flex items-center justify-between w-full text-tiny text-default-400">
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
              </CardFooter>
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
