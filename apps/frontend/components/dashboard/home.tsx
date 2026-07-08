"use client";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  Chip,
  Dropdown,
  ScrollShadow,
  useOverlayState,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactTimeago from "react-timeago";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import WelcomeModal from "@/components/modals/user/welcome";
import { Ripple } from "@/components/magicui/ripple";
import Executions from "../executions/executions";
import Alerts from "../alerts/alerts";
import DashboardExecutionsStats from "./stats-charts";

const statusVariables: Record<
  string,
  { background: string; foreground: string }
> = {
  accent: {
    background: "color-mix(in oklab, var(--accent) 18%, transparent)",
    foreground: "var(--accent)",
  },
  danger: {
    background: "color-mix(in oklab, var(--danger) 18%, transparent)",
    foreground: "var(--danger)",
  },
  default: {
    background: "var(--default)",
    foreground: "var(--default-foreground)",
  },
  success: {
    background: "color-mix(in oklab, var(--success) 18%, transparent)",
    foreground: "var(--success)",
  },
  warning: {
    background: "color-mix(in oklab, var(--warning) 18%, transparent)",
    foreground: "var(--warning)",
  },
};

const getStatusVariables = (color: string) =>
  statusVariables[color] ?? statusVariables.default;
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};
export default function DashboardHome({
  stats,
  flows,
  runners,
  executionsWithAttention,
  user,
}: any) {
  const router = useRouter();
  const [welcomeModalWasOpened, setWelcomeModalWasOpened] = useState(false);
  const welcomeModal = useOverlayState();
  function runnerHeartbeatStatus(runner: any) {
    const timeAgo =
      (new Date(runner.last_heartbeat).getTime() - Date.now()) / 1000;
    if (timeAgo < 0 && timeAgo > -30) {
      return true;
    } else if (timeAgo <= -30) {
      return false;
    }
  }
  function heartbeatColor(runner: any) {
    const timeAgo =
      (new Date(runner.last_heartbeat).getTime() - Date.now()) / 1000;
    if (timeAgo < 0 && timeAgo > -30) {
      return "success";
    } else if (timeAgo <= -30 && timeAgo > -60) {
      return "warning";
    } else if (timeAgo <= -60) {
      return "danger";
    }
  }
  useEffect(() => {
    if (user && !user.welcomed && !welcomeModalWasOpened) {
      welcomeModal.open();
      setWelcomeModalWasOpened(true);
    }
  });
  const StatTile = ({
    title,
    value,
    subtext,
    icon,
    statusColor = "default",
    children,
  }: any) => (
    <motion.div className="h-full" variants={itemVariants}>
      <div className="group h-full rounded-3xl outline-none transition-transform active:scale-[0.98]">
        <Card className="h-full min-h-[132px] border border-default bg-surface/60 shadow-lg backdrop-blur-md transition-colors group-hover:bg-surface/75">
          <Card.Content className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div
                className="flex size-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: getStatusVariables(statusColor).background,
                  color: getStatusVariables(statusColor).foreground,
                }}
              >
                <Icon icon={icon} width={24} />
              </div>
              {children}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted text-sm font-medium">{title}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">
                  <NumberFlow value={value} />
                </span>
                {subtext && (
                  <span className="text-xs text-muted font-medium">
                    {subtext}
                  </span>
                )}
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </motion.div>
  );
  const flowIssues = flows.filter((f: any) => f.maintenance).length;
  const executionIssues = executionsWithAttention.filter(
    (e: any) =>
      (e.status === "error" || e.status === "interactionWaiting") &&
      new Date(e.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000,
  ).length;
  const runnerIssues = runners.filter(
    (r: any) => !r.shared_runner && !runnerHeartbeatStatus(r),
  ).length;
  return (
    <main className="relative w-full min-h-full p-2 md:p-6">
      <div className="relative z-10 mx-auto">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Command <span className="text-accent">Center</span>
            </h1>
            <p className="text-muted">
              Welcome back, {user.username}. Systems are operational.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onPress={() => router.push("/flows")}>
              {<Icon icon="hugeicons:arrow-right-01" />}
              To Flows
            </Button>
          </div>
        </motion.div>

        <motion.div
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Top Row: Stats Tiles */}
          <Dropdown>
            <Dropdown.Trigger className="block w-full text-left">
              <StatTile
                icon="hugeicons:workflow-square-01"
                statusColor={flowIssues > 0 ? "warning" : "success"}
                subtext={`${flowIssues} requiring attention`}
                title="Active Flows"
                value={flows.length}
              />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label="Flow Problems">
                {flows
                  .filter((f: any) => f.maintenance)
                  .map((flow: any) => (
                    <Dropdown.Item
                      key={flow.id}
                      id={flow.id}
                      onPress={() => router.push(`/flows/${flow.id}`)}
                      textValue=" "
                    >
                      {
                        <Icon
                          className="text-warning"
                          icon="hugeicons:alert-02"
                        />
                      }
                      {flow.name}
                    </Dropdown.Item>
                  ))}
                {flowIssues === 0 && (
                  <Dropdown.Item
                    key="no-issues"
                    id="no-issues"
                    textValue="No issues detected"
                  >
                    No issues detected
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <Dropdown>
            <Dropdown.Trigger className="block w-full text-left">
              <StatTile
                icon="hugeicons:rocket-02"
                statusColor={executionIssues > 0 ? "danger" : "accent"}
                subtext={`${executionIssues} failed or waiting`}
                title="24h Executions"
                value={executionsWithAttention.length} // This might need to be total executions count if available, using attention list for now
              />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label="Execution Problems">
                {executionsWithAttention
                  .filter(
                    (e: any) =>
                      (e.status === "error" ||
                        e.status === "interactionWaiting") &&
                      new Date(e.created_at).getTime() >
                        Date.now() - 24 * 60 * 60 * 1000,
                  )
                  .map((execution: any) => (
                    <Dropdown.Item
                      key={execution.id}
                      id={execution.id}
                      onPress={() =>
                        router.push(
                          `/flows/${execution.flow_id}/execution/${execution.id}`,
                        )
                      }
                      textValue=" ..."
                    >
                      {
                        <Icon
                          className={
                            execution.status === "error"
                              ? "text-danger"
                              : "text-accent"
                          }
                          icon={
                            execution.status === "error"
                              ? "hugeicons:alert-02"
                              : "hugeicons:waving-hand-01"
                          }
                        />
                      }
                      {execution.id.substring(0, 8)}...
                    </Dropdown.Item>
                  ))}
                {executionIssues === 0 && (
                  <Dropdown.Item
                    key="no-issues"
                    id="no-issues"
                    textValue="All systems nominal"
                  >
                    All systems nominal
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <Dropdown>
            <Dropdown.Trigger className="block w-full text-left">
              <StatTile
                icon="hugeicons:ai-brain-04"
                statusColor={runnerIssues > 0 ? "danger" : "success"}
                subtext={`${runnerIssues} offline`}
                title="Online Runners"
                value={runners.length}
              />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label="Runner Problems">
                {runners
                  .filter(
                    (r: any) => !r.shared_runner && !runnerHeartbeatStatus(r),
                  )
                  .map((runner: any) => (
                    <Dropdown.Item
                      key={runner.id}
                      id={runner.id}
                      onPress={() =>
                        router.push(
                          `/projects/${runner.project_id}?tab=runners`,
                        )
                      }
                      textValue=" "
                    >
                      {
                        <Icon
                          className="text-danger"
                          icon="hugeicons:alert-02"
                        />
                      }
                      {runner.name}
                    </Dropdown.Item>
                  ))}
                {runnerIssues === 0 && (
                  <Dropdown.Item
                    key="no-runner-issues"
                    id="no-runner-issues"
                    textValue="All runners operational"
                  >
                    All runners operational
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          {/* Middle Row: Chart & Pulse */}
          <motion.div className="md:col-span-2 h-full" variants={itemVariants}>
            <Card className="h-full min-h-[360px] border border-default bg-surface/60 shadow-lg backdrop-blur-md">
              <Card.Header className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg">Execution Volume</h4>
                <p className="text-xs text-muted">
                  Daily activity over the last week
                </p>
              </Card.Header>
              <Card.Content className="min-h-0 overflow-hidden px-4 pb-4">
                <DashboardExecutionsStats stats={stats} />
              </Card.Content>
            </Card>
          </motion.div>

          <motion.div className="md:col-span-1 h-full" variants={itemVariants}>
            <Card className="h-full min-h-[360px] border border-default bg-surface/60 shadow-lg backdrop-blur-md">
              <Card.Header className="pb-0 pt-4 px-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">System Pulse</h4>
                  <p className="text-xs text-muted">Live Runner Status</p>
                </div>
                <Chip color="success" size="sm" variant="soft">
                  {
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                  }
                  <Chip.Label>Live</Chip.Label>
                </Chip>
              </Card.Header>
              <Card.Content className="min-h-0 px-2 pb-4">
                <ScrollShadow className="h-[260px]">
                  <div className="flex flex-col gap-2 p-2">
                    {runners.length === 0 && (
                      <div className="flex h-[220px] flex-col items-center justify-center gap-3 text-center text-muted">
                        <Icon
                          className="text-3xl"
                          icon="hugeicons:ai-brain-04"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            No runners connected
                          </p>
                          <p className="text-xs">Waiting for heartbeat data</p>
                        </div>
                      </div>
                    )}
                    {runners.map((runner: any) => {
                      const isAlive = runnerHeartbeatStatus(runner);
                      const color = heartbeatColor(runner);
                      const colorVars = getStatusVariables(color ?? "default");

                      return (
                        <div
                          key={runner.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary transition-colors cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            router.push(
                              `/projects/${runner.project_id}?tab=runners`,
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              router.push(
                                `/projects/${runner.project_id}?tab=runners`,
                              );
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`relative`}>
                              <div
                                className={`w-2 h-2 rounded-full ${isAlive ? "animate-pulse" : ""}`}
                                style={{
                                  backgroundColor: colorVars.foreground,
                                }}
                              />
                              {isAlive && (
                                <div
                                  className="absolute inset-0 h-2 w-2 animate-ping rounded-full opacity-75"
                                  style={{
                                    backgroundColor: colorVars.foreground,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {runner.name}
                              </span>
                              <span className="text-[10px] text-muted">
                                {runner.shared_runner
                                  ? "Shared Runner"
                                  : "Private Runner"}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted font-mono">
                            {runner.last_heartbeat ? (
                              <ReactTimeago date={runner.last_heartbeat} />
                            ) : (
                              "Never"
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollShadow>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Bottom Row: Flight Log */}
          <motion.div className="md:col-span-3" variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <Icon className="text-xl" icon="hugeicons:task-01" />
              <h3 className="text-xl font-bold">Flight Log</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Executions displayToFlow flows={flows} runners={runners} />
              <Alerts showFlow flows={flows} runners={runners} />
            </div>
          </motion.div>
        </motion.div>

        <WelcomeModal disclosure={welcomeModal} />
      </div>
      <div className="fixed inset-0 -z-0 pointer-events-none">
        <Ripple mainCircleOpacity={0.15} numCircles={8} />
      </div>
    </main>
  );
}
