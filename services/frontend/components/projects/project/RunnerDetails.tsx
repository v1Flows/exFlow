import {
  addToast,
  Button,
  Card,
  CardBody,
  Spacer,
  Switch,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import CreateRunnerModal from "@/components/modals/runner/create";
import UpdateProject from "@/lib/fetch/project/PUT/UpdateProject";
import canEditProject from "@/lib/functions/canEditProject";
import RotateAutoJoinTokenModal from "@/components/modals/projects/rotateAutoJoinToken";

export default function ProjectRunnerDetails({
  project,
  user,
  settings,
}: {
  project: any;
  user: any;
  settings: any;
}) {
  const router = useRouter();

  const addRunnerModal = useDisclosure();
  const rotateAutoJoinTokenModal = useDisclosure();

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

  function copyJoinToken() {
    navigator.clipboard.writeText(project.runner_auto_join_token);
    addToast({
      title: "Runner",
      description: "Join token copied to clipboard",
      color: "success",
      variant: "flat",
    });
  }

  return (
    <>
      <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-4">
        <Card fullWidth>
          <CardBody className="flex items-center justify-between text-center">
            <div className="flex flex-col">
              <p className="text-md font-bold">Shared Runners</p>
              <p className="text-sm text-default-500">
                Use Runners from shared pool
              </p>
            </div>
            <Spacer y={2} />
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
          </CardBody>
        </Card>

        <Card fullWidth>
          <CardBody className="flex items-center justify-between text-center">
            <div className="flex flex-col">
              <div className="flex flex-cols items-center justify-center gap-2">
                <p className="text-md font-bold">Auto Join</p>
                <Tooltip content="You have to configure the projects runner join secret in your runner configuration">
                  <Icon icon="solar:info-circle-linear" />
                </Tooltip>
              </div>
              <p className="text-sm text-default-500">
                Runners on scalable infrastructure can automatically join
              </p>
            </div>
            <Spacer y={2} />
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
          </CardBody>
        </Card>

        <Card fullWidth>
          <CardBody className="flex items-center justify-between text-center">
            <div className="flex flex-col">
              <p className="text-md font-bold">Disable Join</p>
              <p className="text-sm text-default-500">
                Disable new runners from joining
              </p>
            </div>
            <Spacer y={2} />
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
          </CardBody>
        </Card>

        <Card fullWidth>
          <CardBody className="flex items-center justify-between text-center">
            <div className="flex flex-col">
              <p className="text-md font-bold">Auto Join Token</p>
              <p className="text-sm text-default-500">
                Use this token in your runner configuration to allow auto join
              </p>
            </div>
            <Spacer y={2} />
            <div className="flex items-center gap-2">
              <Button
                color="primary"
                isDisabled={project.disabled && user.role !== "admin"}
                size="sm"
                variant="flat"
                onPress={copyJoinToken}
              >
                <Icon icon="hugeicons:copy-02" width={18} />
                Copy Token
              </Button>
              <Tooltip content="Rotate Token">
                <Button
                  isIconOnly
                  color="warning"
                  isDisabled={project.disabled && user.role !== "admin"}
                  size="sm"
                  variant="flat"
                  onPress={rotateAutoJoinTokenModal.onOpen}
                >
                  <Icon icon="hugeicons:rotate-clockwise" width={18} />
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>

        <Card fullWidth>
          <CardBody className="flex items-center justify-between text-center">
            <div className="flex flex-col">
              <p className="text-md font-bold">Add Persistent Runner</p>
              <p className="text-sm text-default-500">
                Add a new self-hosted runner which is persistent to this project
              </p>
            </div>
            <Spacer y={2} />
            <Button
              isIconOnly
              color="primary"
              isDisabled={
                (!canEditProject(user.id, project.members) ||
                  !settings.create_runners ||
                  project.disabled) &&
                user.role !== "admin"
              }
              size="sm"
              variant="flat"
              onPress={addRunnerModal.onOpen}
            >
              <Icon icon="hugeicons:plus-sign" width={18} />
            </Button>
          </CardBody>
        </Card>
      </div>
      <CreateRunnerModal
        disclosure={addRunnerModal}
        project={project}
        shared_runner={false}
      />
      <RotateAutoJoinTokenModal
        disclosure={rotateAutoJoinTokenModal}
        projectID={project.id}
      />
    </>
  );
}
