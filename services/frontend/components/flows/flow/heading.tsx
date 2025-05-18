"use client";

import { addToast, Button, Divider, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import APIStartExecution from "@/lib/fetch/executions/start";
import Reloader from "@/components/reloader/Reloader";
import ScheduleExecutionModal from "@/components/modals/executions/schedule";
import EditFlowModal from "@/components/modals/flows/edit";
import canEditProject from "@/lib/functions/canEditProject";

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

  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2">
        <div>
          <p className="text-2xl font-bold">{flow.name}</p>
          <p className="text-sm text-default-500">{flow.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Button
              color="secondary"
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
              onPress={() => {
                APIStartExecution(flow.id)
                  .then(() => {
                    addToast({
                      title: "Execution Started",
                      color: "success",
                    });
                  })
                  .catch((err) => {
                    addToast({
                      title: "Execution start failed",
                      description: err.message,
                      color: "danger",
                    });
                  });
              }}
            >
              Execute
            </Button>
            <Divider className="h-10 mr-1 ml-1" orientation="vertical" />
            <Button
              color="warning"
              isDisabled={
                (!canEditProject(user.id, project.members) || flow.disabled) &&
                user.role !== "admin"
              }
              startContent={<Icon icon="hugeicons:pencil-edit-02" width={20} />}
              variant="flat"
              onPress={() => {
                editFlowModal.onOpen();
              }}
            >
              Edit
            </Button>
            <Divider className="h-10 mr-1 ml-1" orientation="vertical" />
            <Reloader circle refresh={20} />
          </div>

          {/* Mobile */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              isIconOnly
              color="secondary"
              startContent={<Icon icon="hugeicons:time-schedule" width={18} />}
              variant="flat"
              onPress={() => {
                scheduleExecutionModal.onOpen();
              }}
            />
            <Button
              isIconOnly
              color="primary"
              startContent={<Icon icon="solar:play-linear" width={18} />}
              variant="solid"
              onPress={() => {
                APIStartExecution(flow.id)
                  .then(() => {
                    addToast({
                      title: "Execution Started",
                      color: "success",
                    });
                  })
                  .catch((err) => {
                    addToast({
                      title: "Execution start failed",
                      description: err.message,
                      color: "danger",
                    });
                  });
              }}
            />
            <Divider className="h-10 mr-1 ml-1" orientation="vertical" />
            <Reloader circle refresh={20} />
            <Button
              isIconOnly
              color="warning"
              startContent={<Icon icon="hugeicons:pencil-edit-02" width={18} />}
              variant="flat"
              onPress={() => {
                editFlowModal.onOpen();
              }}
            />
          </div>
        </div>
      </div>
      <ScheduleExecutionModal disclosure={scheduleExecutionModal} flow={flow} />
      <EditFlowModal
        disclosure={editFlowModal}
        folders={folders}
        projects={projects}
        targetFlow={flow}
      />
    </main>
  );
}
