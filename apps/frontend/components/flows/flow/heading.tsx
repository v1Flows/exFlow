"use client";

import { addToast, Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import ScheduleExecutionModal from "@/components/modals/executions/schedule";
import EditFlowModal from "@/components/modals/flows/edit";
import canEditProject from "@/lib/functions/canEditProject";
import { startExecution } from "@/lib/swr/api/executions";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import SimulateAlertModal from "@/components/modals/alerts/simulate";

export default function FlowHeading({
  flow,
  projects,
  project,
  user,
  folders,
  settings,
}: {
  flow: any;
  projects: any;
  project: any;
  user: any;
  folders: any;
  settings: any;
}) {
  const editFlowModal = useDisclosure();
  const scheduleExecutionModal = useDisclosure();
  const simulateAlertModal = useDisclosure();
  const { refreshAllExecutionCaches } = useRefreshCache();

  const handleExecuteFlow = async () => {
    const result = await startExecution(flow.id);

    if (result.success) {
      addToast({
        title: "Execution Started",
        color: "success",
      });
      // Immediately refresh executions data
      refreshAllExecutionCaches(flow.id);
    } else {
      addToast({
        title: "Execution start failed",
        description: result.error,
        color: "danger",
      });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      initial={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${project?.color || "#000"}20 0%, ${project?.color || "#000"}40 100%)`,
            color: project?.color || "#000",
            border: `1px solid ${project?.color || "#000"}40`,
          }}
        >
          <Icon className="text-2xl" icon="hugeicons:workflow-square-01" />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">{flow.name}</h1>
          <p className="text-small text-default-500">{flow.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 md:ml-auto">
        <Button
          isIconOnly
          isDisabled={
            (!canEditProject(user.id, project.members) || flow.disabled) &&
            user.role !== "admin"
          }
          variant="light"
          onPress={() => {
            editFlowModal.onOpen();
          }}
        >
          <Icon icon="hugeicons:pencil-edit-02" width={20} />
        </Button>
        {flow.type === "alert" ? (
          <Button
            color="secondary"
            isDisabled={
              (flow.disabled || !settings.start_executions) &&
              user.role !== "admin"
            }
            startContent={<Icon icon="hugeicons:alert-02" width={20} />}
            variant="flat"
            onPress={() => {
              simulateAlertModal.onOpen();
            }}
          >
            Simulate Alert
          </Button>
        ) : (
          <>
            <Button
              isDisabled={
                (flow.disabled || !settings.start_executions) &&
                user.role !== "admin"
              }
              startContent={<Icon icon="hugeicons:time-schedule" width={20} />}
              variant="flat"
              onPress={() => {
                scheduleExecutionModal.onOpen();
              }}
            >
              Schedule
            </Button>
            <Button
              color="primary"
              isDisabled={
                (flow.disabled || !settings.start_executions) &&
                user.role !== "admin"
              }
              startContent={<Icon icon="hugeicons:play" width={20} />}
              variant="solid"
              onPress={handleExecuteFlow}
            >
              Run Flow
            </Button>
          </>
        )}
      </div>

      <EditFlowModal
        disclosure={editFlowModal}
        folders={folders}
        projects={projects}
        targetFlow={flow}
      />
      <ScheduleExecutionModal disclosure={scheduleExecutionModal} flow={flow} />
      <SimulateAlertModal disclosure={simulateAlertModal} flow={flow} />
    </motion.div>
  );
}
