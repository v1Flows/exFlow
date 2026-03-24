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
import { motion } from "framer-motion";

import CreateProjectModal from "@/components/modals/projects/create";
import DeleteProjectModal from "@/components/modals/projects/delete";
import EditProjectModal from "@/components/modals/projects/edit";
import AcceptProjectInvite from "@/lib/fetch/project/PUT/AcceptProjectInvite";
import DeclineProjectInvite from "@/lib/fetch/project/PUT/DeclineProjectInvite";
import canEditProject from "@/lib/functions/canEditProject";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

import { ShineBorder } from "../magicui/shine-border";

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
    <motion.main
      animate="visible"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
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
          <motion.div
            key={project.id}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
          >
            <Card
              isPressable
              className="w-full h-full bg-content1/60 backdrop-blur-md shadow-sm border border-default-100 hover:scale-[1.02] hover:bg-content1/80 transition-all duration-300 group"
              isDisabled={project.disabled}
              onPress={() => {
                router.push(`/projects/${project.id}`);
              }}
            >
              <CardBody className="p-5">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${project.color}20 0%, ${project.color}40 100%)`,
                        color: project.color,
                        border: `1px solid ${project.color}40`,
                      }}
                    >
                      <Icon className="text-2xl" icon={project.icon} />
                    </div>
                    <Dropdown
                      isDisabled={project.disabled}
                      placement="bottom-end"
                    >
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                          variant="light"
                        >
                          <Icon
                            className="text-lg"
                            icon="hugeicons:more-vertical-circle-01"
                            width={20}
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

                  <div>
                    <h3 className="font-bold text-lg text-default-900 mb-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-default-500 text-sm line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-default-100 flex items-center justify-between">
                    <Chip
                      className="border-none pl-0"
                      color={project.disabled ? "danger" : "success"}
                      size="sm"
                      variant="dot"
                    >
                      {project.disabled ? "Disabled" : "Active"}
                    </Chip>
                    <div className="flex items-center gap-3 text-tiny text-default-400">
                      <div className="flex items-center gap-1">
                        <Icon icon="hugeicons:user-group" width={14} />
                        <span>{project.members.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon icon="hugeicons:calendar-03" width={14} />
                        <span>
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
      {pending_projects.length > 0 && (
        <motion.div
          variants={{
            hidden: { y: 20, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
        >
          <Spacer y={8} />
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-200 to-transparent" />
            <div className="flex items-center gap-2 text-default-500">
              <Icon icon="hugeicons:mail-02" width={20} />
              <p className="text-sm font-medium uppercase tracking-wider">
                Pending Invitations
              </p>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-200 to-transparent" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pending_projects.map((project: any) => (
              <Card
                key={project.id}
                className="border-none shadow-lg bg-content1/60 backdrop-blur-md border border-default-100"
              >
                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                <CardBody className="p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${project.color}20 0%, ${project.color}40 100%)`,
                          color: project.color,
                          border: `1px solid ${project.color}40`,
                        }}
                      >
                        <Icon className="text-2xl" icon={project.icon} />
                      </div>
                      <div className="grow">
                        <h3 className="font-bold text-lg">{project.name}</h3>
                        <p className="text-default-500 text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <ButtonGroup className="w-full" variant="flat">
                        <Button
                          className="w-full font-medium"
                          color={
                            selectedOption === "accept" ? "success" : "danger"
                          }
                          onPress={() => {
                            if (selectedOption === "accept") {
                              acceptProjectInvite(project.id);
                            } else if (selectedOption === "decline") {
                              declineProjectInvite(project.id);
                            }

                            refreshProjects();
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
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
      <CreateProjectModal disclosure={newProjectModal} />
      <EditProjectModal disclosure={editProjectModal} project={targetProject} />
      <DeleteProjectModal
        disclosure={deleteProjectModal}
        project={targetProject}
      />
    </motion.main>
  );
}
