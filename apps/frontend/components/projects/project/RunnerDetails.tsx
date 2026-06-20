import { Card, Switch, toast, Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
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
      toast.danger("Project", { description: "Failed to update project" });
      return;
    }
    if (response.success) {
      router.refresh();
      toast.success("Project", { description: "Project updated successfully" });
    } else {
      toast.danger("Project", { description: "Failed to update project" });
    }
  }
  return (
    <motion.div
      animate="visible"
      className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Card className="h-full border-none shadow-sm bg-surface/60 backdrop-blur-md border border-default">
          <Card.Content>
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col">
                <p className="text-md font-bold">Shared Runners</p>
                <p className="text-sm text-muted">
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
                onChange={(value) => {
                  setSharedRunners(value);
                }}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Card className="h-full border-none shadow-sm bg-surface/60 backdrop-blur-md border border-default">
          <Card.Content>
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col">
                <div className="flex flex-cols items-center gap-2">
                  <p className="text-md font-bold">Auto Join</p>
                  <Tooltip>
                    <Tooltip.Trigger>
                      <Icon icon="solar:info-circle-linear" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      {
                        "You have to configure the projects runner join secret in your runner configuration"
                      }
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted max-w-xs">
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
                onChange={(value) => {
                  setAutoJoin(value);
                }}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>
          </Card.Content>
        </Card>
      </motion.div>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Card className="h-full border-none shadow-sm bg-surface/60 backdrop-blur-md border border-default">
          <Card.Content>
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col">
                <p className="text-md font-bold">Disable Join</p>
                <p className="text-sm text-muted">
                  Disable new runners from joining
                </p>
              </div>
              <Switch
                isDisabled={
                  (!canEditProject(user.id, project.members) ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                isSelected={disableJoin}
                onChange={(value) => {
                  setDisableJoin(value);
                }}
              >
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch>
            </div>
          </Card.Content>
        </Card>
      </motion.div>
    </motion.div>
  );
}
