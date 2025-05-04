"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spacer,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import CreateProjectModal from "@/components/modals/projects/create";
import DeleteProjectModal from "@/components/modals/projects/delete";
import EditProjectModal from "@/components/modals/projects/edit";
import AcceptProjectInvite from "@/lib/fetch/project/PUT/AcceptProjectInvite";
import DeclineProjectInvite from "@/lib/fetch/project/PUT/DeclineProjectInvite";
import SparklesText from "@/components/magicui/sparkles-text";
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
                    className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(45deg, ${project.color} 0%, ${project.color} 100%)`,
                    }}
                  >
                    <Icon className="text-2xl" icon={project.icon} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
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
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      className="text-default-500"
                      size="sm"
                      variant="light"
                    >
                      <Icon
                        className="text-lg"
                        icon="hugeicons:more-vertical-circle-01"
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Project actions">
                    <DropdownItem
                      key="copy"
                      startContent={
                        <Icon icon="solar:copy-outline" width={18} />
                      }
                      onPress={() => copyProjectIDtoClipboard(project.id)}
                    >
                      Copy Project ID
                    </DropdownItem>
                    {canEditProject(user.id, project.members) && (
                      <>
                        <DropdownItem
                          key="edit"
                          color="warning"
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
                      </>
                    )}
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
