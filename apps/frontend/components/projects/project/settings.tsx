import {
  Button,
  Card,
  Chip,
  toast,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import RotateAutoJoinTokenModal from "@/components/modals/projects/rotateAutoJoinToken";
import canEditProject from "@/lib/functions/canEditProject";
export default function ProjectSettings({
  project,
  user,
}: {
  project: any;
  user: any;
}) {
  const rotateAutoJoinTokenModal = useOverlayState();
  function copyJoinToken() {
    navigator.clipboard.writeText(project.runner_auto_join_token);
    toast.success("Runner", { description: "Join token copied to clipboard" });
  }
  return (
    <motion.div
      animate="visible"
      className="space-y-8"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.div
        className="space-y-4"
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <h2 className="text-lg font-bold">Runners</h2>
        <Card className="w-full border-none shadow-sm bg-surface/60 backdrop-blur-md border border-default">
          <Card.Content className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <p className="text-sm font-bold">Auto Join Token</p>
                <p className="text-xs text-muted">
                  Use this token in your runner configuration to allow auto join
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  isDisabled={project.disabled && user.role !== "admin"}
                  size="sm"
                  variant="secondary"
                  onPress={copyJoinToken}
                >
                  <Icon icon="hugeicons:copy-02" width={16} />
                  Copy Token
                </Button>
                <Tooltip>
                  <Tooltip.Trigger>
                    <Button
                      isDisabled={
                        (!canEditProject(user.id, project.members) ||
                          project.disabled) &&
                        user.role !== "admin"
                      }
                      size="sm"
                      variant="tertiary"
                      onPress={rotateAutoJoinTokenModal.open}
                    >
                      {<Icon icon="hugeicons:rotate-clockwise" width={16} />}
                      Rotate Token
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>{"Rotate Token"}</Tooltip.Content>
                </Tooltip>
              </div>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      <motion.div
        className="space-y-4"
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <h2 className="text-lg font-bold">Security</h2>
        <Card className="border-none shadow-sm bg-surface/60 backdrop-blur-md border border-default">
          <Card.Content className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Encryption</p>
                <p className="text-xs text-muted">
                  Project data encryption status
                </p>
              </div>
              {project.encryption_enabled ? (
                <Chip color="success" size="sm" variant="soft">
                  <Chip.Label>Enabled</Chip.Label>
                </Chip>
              ) : (
                <Chip color="danger" size="sm" variant="soft">
                  <Chip.Label>Disabled</Chip.Label>
                </Chip>
              )}
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      <RotateAutoJoinTokenModal
        disclosure={rotateAutoJoinTokenModal}
        projectID={project.id}
      />
    </motion.div>
  );
}
