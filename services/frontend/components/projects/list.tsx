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

import { ShineBorder } from "../magicui/shine-border";

import CreateProjectModal from "@/components/modals/projects/create";
import DeleteProjectModal from "@/components/modals/projects/delete";
import EditProjectModal from "@/components/modals/projects/edit";
import AcceptProjectInvite from "@/lib/fetch/project/PUT/AcceptProjectInvite";
import DeclineProjectInvite from "@/lib/fetch/project/PUT/DeclineProjectInvite";
import canEditProject from "@/lib/functions/canEditProject";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

export function ProjectsList({ projects, pending_projects, user }: any) {
  const router = useRouter();
  const { refreshProjects } = useRefreshCache();

  const [targetProject, setTargetProject] = useState({});

  // project invitation button
  const [selectedOption, setSelectedOption] = useState("accept");
  const descriptionsMap = {
    accept: "Accept the project invitation.",
    decline: "Decline the project invitation.",
  };
  const labelsMap = {
    accept: "Accept Invite",
    decline: "Decline Invite",
  };

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

  function inviteSelectionChange(e: any) {
    setSelectedOption(e.currentKey);
  }

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project: any) => (
          <Card
            key={project.id}
            isHoverable
            className="w-full bg-content1/60 backdrop-blur-md shadow-lg border border-default-100"
            isDisabled={project.disabled}
            isPressable={!project.disabled}
            onPress={() => {
              router.push(`/projects/${project.id}`);
            }}
          >
            <CardBody className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div
                    className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(45deg, ${project.color} 0%, ${project.color} 100%)`,
                    }}
                  >
                    <Icon className="text-2xl" icon={project.icon} />
                  </div>
                  <div className="grow">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <p className="text-default-500 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    color={project.disabled ? "danger" : "success"}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {project.disabled ? "Disabled" : "Enabled"}
                  </Chip>
                  <Dropdown
                    isDisabled={project.disabled}
                    placement="bottom-end"
                  >
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <Icon
                          className="text-lg"
                          icon="hugeicons:more-vertical-circle-01"
                          width={16}
                        />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Project actions" variant="flat">
                      <DropdownItem
                        key="copy"
                        showDivider
                        startContent={
                          <Icon icon="hugeicons:copy-01" width={18} />
                        }
                        onPress={() => copyProjectIDtoClipboard(project.id)}
                      >
                        Copy ID
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        color="warning"
                        isDisabled={
                          (!canEditProject(user.id, project.members) ||
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
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        isDisabled={
                          (!canEditProject(user.id, project.members) ||
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
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {pending_projects.length > 0 && (
        <>
          <Spacer y={4} />
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-default-200" />
            <p className="text-xl font-bold">
              Pending <span className="text-primary">Invitations</span>
            </p>
            <div className="h-px flex-1 bg-default-200" />
          </div>
          <Spacer y={2} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pending_projects.map((project: any) => (
              <Card
                key={project.id}
                className="border-none shadow-lg bg-content1/60 backdrop-blur-md border border-default-100"
              >
                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                <CardBody className="p-5">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                      <div
                        className="shrink-0 w-12 h-12 rounded-md flex items-center justify-center"
                        style={{
                          backgroundImage: `linear-gradient(45deg, ${project.color} 0%, ${project.color} 100%)`,
                        }}
                      >
                        <Icon className="text-2xl" icon={project.icon} />
                      </div>
                      <div className="grow">
                        <h3 className="font-semibold text-lg">
                          {project.name}
                        </h3>
                        <p className="text-default-500 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>
                    <ButtonGroup variant="flat">
                      <Button
                        onPress={() => {
                          if (selectedOption === "accept") {
                            acceptProjectInvite(project.id);
                          } else if (selectedOption === "decline") {
                            declineProjectInvite(project.id);
                          }

                          refreshProjects(); // Refresh SWR cache instead of router
                        }}
                      >
                        {labelsMap[selectedOption]}
                      </Button>
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <Button isIconOnly>
                            <Icon icon="hugeicons:arrow-down-01" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          disallowEmptySelection
                          aria-label="Merge options"
                          className="max-w-[300px]"
                          selectedKeys={[selectedOption]}
                          selectionMode="single"
                          variant="flat"
                          onSelectionChange={inviteSelectionChange}
                        >
                          <DropdownItem
                            key="accept"
                            color="success"
                            description={descriptionsMap["accept"]}
                            startContent={
                              <Icon
                                icon="hugeicons:tick-double-01"
                                width={24}
                              />
                            }
                          >
                            {labelsMap["accept"]}
                          </DropdownItem>
                          <DropdownItem
                            key="decline"
                            color="danger"
                            description={descriptionsMap["decline"]}
                            startContent={
                              <Icon icon="hugeicons:cancel-01" width={24} />
                            }
                          >
                            {labelsMap["decline"]}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
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
