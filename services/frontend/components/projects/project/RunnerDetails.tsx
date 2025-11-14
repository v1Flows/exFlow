import { addToast, Card, CardBody, Switch, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import UpdateProject from "@/lib/fetch/project/PUT/UpdateProject";
import canEditProject from "@/lib/functions/canEditProject";

export default function ProjectRunnerDetails({
  project,
  user,
}: {
  project: any;
  user: any;
}) {
  const router = useRouter();

  const [sharedRunners, setSharedRunners] = useState(project.shared_runners);
  const [autoJoin, setAutoJoin] = useState(project.enable_auto_runners);
  const [disableJoin, setDisableJoin] = useState(project.disable_runner_join);

  useEffect(() => {
    setSharedRunners(project.shared_runners);
    setAutoJoin(project.enable_auto_runners);
    setDisableJoin(project.disable_runner_join);
  }, [project]);

  useEffect(() => {
    if (
      sharedRunners === project.shared_runners &&
      autoJoin === project.enable_auto_runners &&
      disableJoin === project.disable_runner_join
    ) {
      return;
    }
    updateProject();
  }, [sharedRunners, autoJoin, disableJoin]);

  async function updateProject() {
    const response = (await UpdateProject(
      project.id,
      project.name,
      project.description,
      sharedRunners,
      project.icon,
      project.color,
      autoJoin,
      disableJoin,
    )) as any;

    if (!response) {
      addToast({
        title: "Project",
        description: "Failed to update project",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      router.refresh();
      addToast({
        title: "Project",
        description: "Project updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Project",
        description: "Failed to update project",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        <Card fullWidth>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-md font-bold">Shared Runners</p>
                <p className="text-sm text-default-500">
                  Use Runners from shared pool
                </p>
              </div>
              <Switch
                isDisabled={
                  (!canEditProject(user.id, project.members) ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                isSelected={sharedRunners}
                size="sm"
                onValueChange={(value) => {
                  setSharedRunners(value);
                }}
              />
            </div>
          </CardBody>
        </Card>

        <Card fullWidth>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex flex-cols items-center gap-2">
                  <p className="text-md font-bold">Auto Join</p>
                  <Tooltip content="You have to configure the projects runner join secret in your runner configuration">
                    <Icon icon="solar:info-circle-linear" />
                  </Tooltip>
                </div>
                <p className="text-sm text-default-500 max-w-xs">
                  Runners on scalable infrastructure can automatically join
                </p>
              </div>
              <Switch
                isDisabled={
                  (!canEditProject(user.id, project.members) ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                isSelected={autoJoin}
                size="sm"
                onValueChange={setAutoJoin}
              />
            </div>
          </CardBody>
        </Card>

        <Card fullWidth>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-md font-bold">Disable Join</p>
                <p className="text-sm text-default-500">
                  Disable new runners from joining
                </p>
              </div>
              <Switch
                color="danger"
                isDisabled={
                  (!canEditProject(user.id, project.members) ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                isSelected={disableJoin}
                size="sm"
                onValueChange={setDisableJoin}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
