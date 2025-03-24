"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Alert,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spacer,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import CreateProjectModal from "@/components/modals/projects/create";
import DeleteProjectModal from "@/components/modals/projects/delete";
import EditProjectModal from "@/components/modals/projects/edit";
import AcceptProjectInvite from "@/lib/fetch/project/PUT/AcceptProjectInvite";
import DeclineProjectInvite from "@/lib/fetch/project/PUT/DeclineProjectInvite";
import SparklesText from "@/components/magicui/sparkles-text";

export function ProjectsList({ projects, pending_projects, user }: any) {
  const router = useRouter();

  const [targetProject, setTargetProject] = React.useState({});
  const newProjectModal = useDisclosure();
  const editProjectModal = useDisclosure();
  const deleteProjectModal = useDisclosure();

  const copyProjectIDtoClipboard = (key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      addToast({
        title: "Project",
        description: "ProjectID copied to clipboard!",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Project",
        description: "Failed to copy ProjectID to clipboard",
        color: "danger",
        variant: "flat",
      });
    }
  };

  function checkUserEditPermissions(project: any) {
    if (
      project.members.find((member: any) => member.user_id === user.id).role ===
      "Viewer"
    ) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <main>
      {projects.length === 0 && (
        <>
          <div className="flex items-center justify-center">
            <p className="text-md text-default-500 font-bold">
              No projects found
            </p>
          </div>
          <Spacer y={4} />
        </>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project: any) => (
          <div key={project.id} className="col-span-1">
            <Card
              fullWidth
              className="bg-default-200 bg-opacity-20"
              isDisabled={project.disabled}
              isPressable={!project.disabled}
              style={{
                border: `2px solid ${project.color}`,
              }}
              onPress={() => {
                router.push(`/projects/${project.id}`);
              }}
            >
              <CardHeader className="flex items-start justify-between">
                <div className="flex flex-cols items-center gap-2">
                  <Icon
                    icon={
                      project.icon
                        ? project.icon
                        : "solar:question-square-outline"
                    }
                    width={28}
                  />
                  <div className="flex flex-col items-start">
                    <p className="text-lg font-bold">{project.name}</p>
                    <p className="text-sm text-default-500">
                      {project.description.length > 50 ? (
                        <Tooltip
                          content={project.description}
                          style={{ maxWidth: "450px" }}
                        >
                          <span>
                            {project.description.slice(0, 50)}
                            ...
                          </span>
                        </Tooltip>
                      ) : (
                        project.description
                      )}
                    </p>
                  </div>
                </div>
                <Dropdown backdrop="opaque">
                  <DropdownTrigger>
                    <Icon
                      className="m-1 hover:text-primary"
                      icon="solar:menu-dots-bold"
                      width={24}
                    />
                  </DropdownTrigger>
                  <DropdownMenu variant="flat">
                    <DropdownSection title="Actions">
                      <DropdownItem
                        key="copy"
                        startContent={
                          <Icon icon="solar:copy-outline" width={18} />
                        }
                        onPress={() => copyProjectIDtoClipboard(project.id)}
                      >
                        Copy ID
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        showDivider
                        color="warning"
                        isDisabled={
                          checkUserEditPermissions(project) || project.disabled
                        }
                        startContent={
                          <Icon icon="hugeicons:pencil-edit-02" width={18} />
                        }
                        onPress={() => {
                          setTargetProject(project);
                          editProjectModal.onOpen();
                        }}
                      >
                        Edit
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Danger Zone">
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        isDisabled={
                          checkUserEditPermissions(project) || project.disabled
                        }
                        startContent={
                          <Icon icon="hugeicons:delete-02" width={18} />
                        }
                        onPress={() => {
                          setTargetProject(project);
                          deleteProjectModal.onOpen();
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </CardHeader>
              <CardBody>
                <div className="flex flex-cols items-center justify-between gap-2">
                  <AvatarGroup isBordered className="pl-5" size="sm">
                    {project.members
                      .map((member: any) => (
                        <div key={member.user_id}>
                          <Tooltip content={member.username}>
                            <Avatar
                              key={member.user_id}
                              showFallback
                              className="w-6 h-6 text-tiny"
                              color={
                                member.role === "Owner"
                                  ? "danger"
                                  : member.role === "Editor"
                                    ? "primary"
                                    : "default"
                              }
                              name={member.username}
                              radius="sm"
                            />
                          </Tooltip>
                        </div>
                      ))
                      .slice(0, 5)}
                  </AvatarGroup>
                  {project.disabled && (
                    <Alert
                      color="danger"
                      description={project.disabled_reason}
                      title="Disabled"
                      variant="flat"
                    />
                  )}
                  <Chip
                    color={project.disabled ? "danger" : "success"}
                    radius="sm"
                    size="md"
                    variant="light"
                  >
                    <p className="font-bold">
                      {project.disabled ? "Disabled" : "Active"}
                    </p>
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
      {pending_projects.length > 0 && (
        <>
          <Spacer y={4} />
          <SparklesText
            className="text-lg"
            text="Pending Project Invitations"
          />
          <Spacer y={4} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pending_projects.map((project: any) => (
              <div key={project.id} className="col-span-1">
                <Card fullWidth>
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={
                          project.icon
                            ? project.icon
                            : "solar:question-square-outline"
                        }
                        style={{ color: project.color }}
                        width={32}
                      />
                      <p className="text-lg font-bold">{project.name}</p>
                    </div>
                    <Spacer y={2} />
                    <p className="text-sm text-default-500">
                      {project.description.length > 50 ? (
                        <Tooltip
                          content={project.description}
                          style={{ maxWidth: "450px" }}
                        >
                          <span>
                            {project.description.slice(0, 50)}
                            ...
                          </span>
                        </Tooltip>
                      ) : (
                        project.description
                      )}
                    </p>
                    <Spacer y={3} />
                    <Divider />
                  </CardBody>
                  <CardFooter className="flex items-center gap-2">
                    <Button
                      fullWidth
                      color="danger"
                      variant="flat"
                      onPress={() => {
                        DeclineProjectInvite(project.id);
                        router.refresh();
                      }}
                    >
                      <Icon icon="solar:danger-triangle-outline" width={24} />
                      Decline
                    </Button>
                    <Button
                      fullWidth
                      color="success"
                      variant="flat"
                      onPress={() => {
                        AcceptProjectInvite(project.id);
                        router.refresh();
                      }}
                    >
                      <Icon icon="solar:check-read-outline" width={24} />
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}
      <CreateProjectModal disclosure={newProjectModal} />
      <EditProjectModal disclosure={editProjectModal} project={targetProject} />
      <DeleteProjectModal
        disclosure={deleteProjectModal}
        project={targetProject}
      />
    </main>
  );
}
