import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Spacer,
  Tooltip,
  useDisclosure,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";

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
    <div>
      <Card>
        <CardBody>
          <div className="flex-wrap flex items-center justify-between gap-2">
            <div className="flex flex-col items-start">
              <p className="text-md font-bold">Members</p>
              <p className="text-tiny text-default-500">
                {project.members.length} Members
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tooltip content="Add Member">
                <Button
                  isIconOnly
                  color="primary"
                  isDisabled={
                    (!canEditProject(user.id, project.members) ||
                      !settings.add_project_members ||
                      project.disabled) &&
                    user.role !== "admin"
                  }
                  size="sm"
                  startContent={
                    <Icon icon="hugeicons:add-team-02" width={18} />
                  }
                  variant="solid"
                  onPress={() => addProjectMemberModal.onOpen()}
                />
              </Tooltip>

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
          </div>
        </CardBody>
      </Card>
      <Spacer y={2} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {project.members.map((member: any) => (
          <Card
            key={member.id}
            className={`border-2 ${member.invite_pending ? `bg-opacity-70 border-${statusColorMap[member.role]}-200` : `border-${statusColorMap[member.role]}`}`}
          >
            <CardBody className="flex items-start">
              <Tooltip content={member.role}>
                <User
                  avatarProps={{
                    isBordered: true,
                    radius: "full",
                    name: member.username,
                    color: statusColorMap[member.role],
                  }}
                  description={member.email}
                  name={
                    <div className="flex items-center gap-2">
                      <p>{member.username}</p>
                      {member.user_id === user.id && (
                        <Chip
                          color="primary"
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          You
                        </Chip>
                      )}
                    </div>
                  }
                >
                  {member.user_id}
                </User>
              </Tooltip>
            </CardBody>
            <CardFooter className="flex flex-cols items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Chip
                  className="capitalize"
                  color={member.invite_pending ? "warning" : "success"}
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  Invite: {member.invite_pending ? "Pending" : "Accepted"}
                </Chip>
                <Chip
                  className="capitalize"
                  radius="sm"
                  size="sm"
                  variant="flat"
                >
                  Invited At: {new Date(member.invited_at).toLocaleString()}
                </Chip>
              </div>
              <ButtonGroup size="sm">
                <Tooltip content="Edit Member">
                  <Button
                    isIconOnly
                    isDisabled={
                      (!canEditProject(user.id, project.members) ||
                        project.disabled) &&
                      user.role !== "admin"
                    }
                    variant="flat"
                    onPress={() => {
                      setTargetUser(member);
                      editProjectMemberModal.onOpen();
                    }}
                  >
                    <Icon icon="hugeicons:pencil-edit-02" width={18} />
                  </Button>
                </Tooltip>
                <Tooltip content="Remove Member from Project">
                  <Button
                    isIconOnly
                    color="danger"
                    isDisabled={
                      (!canEditProject(user.id, project.members) ||
                        member.user_id === user.id ||
                        project.disabled) &&
                      user.role !== "admin"
                    }
                    variant="flat"
                    onPress={() => {
                      setTargetUser(member);
                      deleteProjectMemberModal.onOpen();
                    }}
                  >
                    <Icon icon="hugeicons:delete-02" width={18} />
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </CardFooter>
          </Card>
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
    </div>
  );
}
