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
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody>
          <p className="text-lg font-bold mb-2">Runners</p>

          <Card fullWidth className="bg-content2">
            <CardBody>
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-md font-bold">Auto Join Token</p>
                  <p className="text-sm text-default-500">
                    Use this token in your runner configuration to allow auto
                    join
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
                    <Icon icon="hugeicons:copy-02" width={18} />
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
                        <Icon icon="hugeicons:rotate-clockwise" width={18} />
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
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-lg font-bold">Encryption</p>
            {project.encryption_enabled ? (
              <Chip color="success" radius="sm" variant="flat">
                Enabled
              </Chip>
            ) : (
              <Chip color="danger" radius="sm" variant="flat">
                Disabled
              </Chip>
            )}
          </div>
        </CardBody>
      </Card>

      <RotateAutoJoinTokenModal
        disclosure={rotateAutoJoinTokenModal}
        projectID={project.id}
      />
    </div>
  );
}
