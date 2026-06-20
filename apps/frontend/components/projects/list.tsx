"use client";
import { Icon } from "@iconify/react";
import {
  Button,
  ButtonGroup,
  Card,
  Chip,
  Dropdown,
  toast,
  useOverlayState,
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
  const newProjectModal = useOverlayState();
  const editProjectModal = useOverlayState();
  const deleteProjectModal = useOverlayState();
  const copyProjectIDtoClipboard = (key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      toast.success("Project", {
        description: "ProjectID copied to clipboard!",
      });
    } else {
      toast.danger("Project", {
        description: "Failed to copy ProjectID to clipboard",
      });
    }
  };
  function inviteSelectionChange(e: any) {
    setSelectedOption(String(Array.from(e)[0] ?? "accept"));
  }
  async function declineProjectInvite(projectId: string) {
    const res = (await DeclineProjectInvite(projectId)) as any;
    if (!res) {
      toast.danger("Project Invite", {
        description: "Failed to decline project invite",
      });
      return;
    }
    if (res.success) {
      toast.success("Project Invite", {
        description: "Project invite declined",
      });
    } else {
      toast.danger("Project Invite", { description: res.message });
    }
    router.refresh();
  }
  async function acceptProjectInvite(projectId: string) {
    const res = (await AcceptProjectInvite(projectId)) as any;
    if (!res) {
      toast.danger("Project Invite", {
        description: "Failed to accept project invite",
      });
      return;
    }
    if (res.success) {
      toast.success("Project Invite", {
        description: "Project invite accepted",
      });
    } else {
      toast.danger("Project Invite", { description: res.message });
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
            <p className="text-md text-muted font-bold">No projects found</p>
          </div>
          <div aria-hidden className="h-4" />
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
            <Button
              className="h-auto w-full justify-start p-0 text-left"
              variant="tertiary"
              onPress={() => {
                router.push(`/projects/${project.id}`);
              }}
            >
              <Card className="w-full h-full bg-surface/60 backdrop-blur-md shadow-sm border border-default hover:scale-[1.02] hover:bg-surface/80 transition-all duration-300 group">
                <Card.Content className="p-5">
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
                      <Dropdown>
                        <Dropdown.Trigger>
                          <Button
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            size="sm"
                            variant="ghost"
                          >
                            <Icon
                              className="text-lg"
                              icon="hugeicons:more-vertical-circle-01"
                              width={20}
                            />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover>
                          <Dropdown.Menu aria-label="Project actions">
                            <Dropdown.Item
                              key="copy"
                              id="copy"
                              onPress={() =>
                                copyProjectIDtoClipboard(project.id)
                              }
                              textValue="Copy ID"
                            >
                              {<Icon icon="hugeicons:copy-01" width={18} />}
                              Copy ID
                            </Dropdown.Item>
                            <Dropdown.Item
                              key="edit"
                              id="edit"
                              isDisabled={
                                (!canEditProject(user.id, project.members) ||
                                  project.disabled) &&
                                user.role !== "admin"
                              }
                              onPress={() => {
                                setTargetProject(project);
                                editProjectModal.open();
                              }}
                              textValue="Edit"
                            >
                              {
                                <Icon
                                  icon="hugeicons:pencil-edit-02"
                                  width={18}
                                />
                              }
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              key="delete"
                              id="delete"
                              className="text-danger"
                              isDisabled={
                                (!canEditProject(user.id, project.members) ||
                                  project.disabled) &&
                                user.role !== "admin"
                              }
                              onPress={() => {
                                setTargetProject(project);
                                deleteProjectModal.open();
                              }}
                              textValue="Delete"
                            >
                              {<Icon icon="hugeicons:delete-02" width={18} />}
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-default flex items-center justify-between">
                      <Chip
                        className="border-none pl-0"
                        color={project.disabled ? "danger" : "success"}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {project.disabled ? "Disabled" : "Active"}
                        </Chip.Label>
                      </Chip>
                      <div className="flex items-center gap-3 text-xs text-muted">
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
                </Card.Content>
              </Card>
            </Button>
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
          <div aria-hidden className="h-8" />
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-default-200 to-transparent" />
            <div className="flex items-center gap-2 text-muted">
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
                className="border-none shadow-lg bg-surface/60 backdrop-blur-md border border-default"
              >
                <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                <Card.Content className="p-5">
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
                        <p className="text-muted text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <ButtonGroup className="w-full" variant="tertiary">
                        <Button
                          className="w-full font-medium"
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
                        <Dropdown>
                          <Dropdown.Trigger>
                            <Button className="aspect-square p-0">
                              <Icon icon="hugeicons:arrow-down-01" />
                            </Button>
                          </Dropdown.Trigger>
                          <Dropdown.Popover>
                            <Dropdown.Menu
                              disallowEmptySelection
                              aria-label="Merge options"
                              className="max-w-[300px]"
                              selectedKeys={new Set([selectedOption])}
                              selectionMode="single"
                              onSelectionChange={inviteSelectionChange}
                            >
                              <Dropdown.Item
                                key="accept"
                                id="accept"
                                textValue=" "
                              >
                                {
                                  <Icon
                                    icon="hugeicons:tick-double-01"
                                    width={24}
                                  />
                                }
                                {labelsMap["accept"]}
                              </Dropdown.Item>
                              <Dropdown.Item
                                key="decline"
                                id="decline"
                                className="text-danger"
                                textValue=" "
                              >
                                {<Icon icon="hugeicons:cancel-01" width={24} />}
                                {labelsMap["decline"]}
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </ButtonGroup>
                    </div>
                  </div>
                </Card.Content>
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
