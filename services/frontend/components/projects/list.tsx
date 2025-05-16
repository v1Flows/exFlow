"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spacer,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import CreateProjectModal from "@/components/modals/projects/create";
import DeleteProjectModal from "@/components/modals/projects/delete";
import EditProjectModal from "@/components/modals/projects/edit";
import AcceptProjectInvite from "@/lib/fetch/project/PUT/AcceptProjectInvite";
import DeclineProjectInvite from "@/lib/fetch/project/PUT/DeclineProjectInvite";
import canEditProject from "@/lib/functions/canEditProject";

export function ProjectsList({ projects, pending_projects, user }: any) {
  const router = useRouter();

  const [targetProject, setTargetProject] = useState({});
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

  async function declineProjectInvite(projectId: string) {
    const res = (await DeclineProjectInvite(projectId)) as any;

    if (!res) {
      addToast({
        title: "Project Invite",
        description: "Failed to decline project invite",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      addToast({
        title: "Project Invite",
        description: "Project invite declined",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Project Invite",
        description: res.message,
        color: "danger",
        variant: "flat",
      });
    }

    router.refresh();
  }

  async function acceptProjectInvite(projectId: string) {
    const res = (await AcceptProjectInvite(projectId)) as any;

    if (!res) {
      addToast({
        title: "Project Invite",
        description: "Failed to accept project invite",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (res.success) {
      addToast({
        title: "Project Invite",
        description: "Project invite accepted",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Project Invite",
        description: res.message,
        color: "danger",
        variant: "flat",
      });
    }

    router.refresh();
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projects.map((project: any) => (
          <Card
            key={project.id}
            isHoverable
            className="w-full"
            isDisabled={project.disabled}
            isPressable={!project.disabled}
            onPress={() => {
              router.push(`/projects/${project.id}`);
            }}
          >
            <CardBody className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(45deg, ${project.color} 0%, ${project.color} 100%)`,
                    }}
                  >
                    <Icon className="text-2xl" icon={project.icon} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <Chip
                        color={project.disabled ? "danger" : "success"}
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        {project.disabled ? "Disabled" : "Enabled"}
                      </Chip>
                    </div>
                    <p className="text-default-500 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
                <Dropdown isDisabled={project.disabled} placement="bottom-end">
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                      <Icon
                        className="text-lg"
                        icon="hugeicons:more-vertical-circle-01"
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Project actions" variant="flat">
                    <DropdownItem
                      key="copy"
                      startContent={
                        <Icon icon="hugeicons:copy-01" width={18} />
                      }
                      onPress={() => copyProjectIDtoClipboard(project.id)}
                    >
                      Copy Project ID
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      color="warning"
                      isDisabled={
                        (canEditProject(user.id, project.members) ||
                          project.disabled) &&
                        user.role !== "admin"
                      }
                      startContent={
                        <Icon icon="hugeicons:pencil-edit-02" width={18} />
                      }
                      onPress={() => {
                        setTargetProject(project);
                        editProjectModal.onOpen();
                      }}
                    >
                      Edit Project
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      isDisabled={
                        (canEditProject(user.id, project.members) ||
                          project.disabled) &&
                        user.role !== "admin"
                      }
                      startContent={
                        <Icon icon="hugeicons:delete-02" width={18} />
                      }
                      onPress={() => {
                        setTargetProject(project);
                        deleteProjectModal.onOpen();
                      }}
                    >
                      Delete Project
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {pending_projects.length > 0 && (
        <>
          <Spacer y={4} />
          <p className="text-xl font-semibold">
            Project <span className="text-primary">Invitations</span>
          </p>
          <Spacer y={2} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {pending_projects.map((project: any) => (
              <Card key={project.id}>
                <CardBody className="p-5">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                        style={{
                          backgroundImage: `linear-gradient(45deg, ${project.color} 0%, ${project.color} 100%)`,
                        }}
                      >
                        <Icon className="text-2xl" icon={project.icon} />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">
                          {project.name}
                        </h3>
                        <p className="text-default-500 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>
                    <ButtonGroup variant="bordered">
                      <Button
                        color="danger"
                        onPress={() => {
                          declineProjectInvite(project.id);
                        }}
                      >
                        <Icon icon="hugeicons:cancel-01" width={20} />
                        Decline Invite
                      </Button>
                      <Button
                        color="success"
                        onPress={() => {
                          acceptProjectInvite(project.id);
                        }}
                      >
                        <Icon icon="hugeicons:tick-double-01" width={20} />
                        Accept Invite
                      </Button>
                    </ButtonGroup>
                  </div>
                </CardBody>
              </Card>
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
