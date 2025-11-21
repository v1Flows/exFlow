import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import RotateAutoJoinTokenModal from "@/components/modals/projects/rotateAutoJoinToken";
import canEditProject from "@/lib/functions/canEditProject";

export default function ProjectSettings({
  project,
  user,
}: {
  project: any;
  user: any;
}) {
  const rotateAutoJoinTokenModal = useDisclosure();

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
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Runners</h2>
        <Card fullWidth className="border-none shadow-sm bg-content1/60 backdrop-blur-md border border-default-100">
          <CardBody className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-small font-bold">Auto Join Token</p>
                <p className="text-tiny text-default-500">
                  Use this token in your runner configuration to allow auto join
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  color="primary"
                  isDisabled={project.disabled && user.role !== "admin"}
                  size="sm"
                  variant="flat"
                  onPress={copyJoinToken}
                >
                  <Icon icon="hugeicons:copy-02" width={16} />
                  Copy Token
                </Button>
                <Tooltip content="Rotate Token">
                  <Button
                    color="warning"
                    isDisabled={
                      (!canEditProject(user.id, project.members) ||
                        project.disabled) &&
                      user.role !== "admin"
                    }
                    size="sm"
                    startContent={
                      <Icon icon="hugeicons:rotate-clockwise" width={16} />
                    }
                    variant="flat"
                    onPress={rotateAutoJoinTokenModal.onOpen}
                  >
                    Rotate Token
                  </Button>
                </Tooltip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Security</h2>
        <Card className="border-none shadow-sm bg-content1/60 backdrop-blur-md border border-default-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small font-bold">Encryption</p>
                <p className="text-tiny text-default-500">
                  Project data encryption status
                </p>
              </div>
              {project.encryption_enabled ? (
                <Chip color="success" radius="sm" variant="flat" size="sm">
                  Enabled
                </Chip>
              ) : (
                <Chip color="danger" radius="sm" variant="flat" size="sm">
                  Disabled
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <RotateAutoJoinTokenModal
        disclosure={rotateAutoJoinTokenModal}
        projectID={project.id}
      />
    </div>
  );
}
