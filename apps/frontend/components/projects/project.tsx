"use client";

import { Icon } from "@iconify/react";
import { Alert, Button, Card, CardBody, useDisclosure } from "@heroui/react";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import React from "react";

import EditProjectModal from "@/components/modals/projects/edit";
import canEditProject from "@/lib/functions/canEditProject";

import ProjectTabs from "./project/tabs";

export default function Project({
  user,
  settings,
  project,
  runners,
  tokens,
  audit,
  flows,
}: any) {
  const editProjectModal = useDisclosure();

  return (
    <main className="w-full p-4 space-y-8">
      {/* Header Section */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
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
          <div>
            <h1 className="text-2xl font-bold leading-tight">{project.name}</h1>
            <p className="text-small text-default-500">{project.description}</p>
          </div>
        </div>
        <Button
          className="bg-warning/10 text-warning hover:bg-warning/20"
          color="warning"
          isDisabled={
            (project.disabled || !canEditProject(user.id, project.members)) &&
            user.role !== "admin"
          }
          startContent={<Icon icon="hugeicons:pencil-edit-02" width={20} />}
          variant="flat"
          onPress={() => editProjectModal.onOpen()}
        >
          Edit Project
        </Button>
      </motion.div>

      {project.disabled && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.95 }}
        >
          <Alert
            color="danger"
            description={project.disabled_reason}
            title="Project is currently disabled"
            variant="faded"
          />
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Members",
            value: project.members.length,
            icon: "hugeicons:location-user-02",
            color: "primary",
          },
          {
            title: "Flows",
            value: flows.filter((f: any) => f.project_id === project.id).length,
            icon: "hugeicons:workflow-square-10",
            color: "secondary",
          },
          {
            title: "Runners",
            value: project.shared_runners
              ? runners.length
              : runners.filter((r: any) => r.shared_runner === false).length,
            icon: "hugeicons:ai-brain-04",
            color: "success",
          },
          {
            title: "Tokens",
            value: tokens.length,
            icon: "hugeicons:key-02",
            color: "warning",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Card
              key={index}
              className="border-none shadow-lg bg-content1/60 backdrop-blur-md border border-default-100"
            >
              <CardBody className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg bg-${stat.color}/20 text-${stat.color}`}
                  >
                    <Icon icon={stat.icon} width={20} />
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-small font-medium text-default-500">
                      {stat.title}
                    </p>
                    <p className="text-xl font-bold text-default-900">
                      <NumberFlow value={stat.value} />
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <ProjectTabs
          audit={audit}
          project={project}
          runners={runners}
          settings={settings}
          tokens={tokens}
          user={user}
        />
      </div>
      <EditProjectModal disclosure={editProjectModal} project={project} />
    </main>
  );
}
