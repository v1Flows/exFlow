"use client";

import { Icon } from "@iconify/react";
import {
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
  Button,
  Chip,
  ScrollShadow,
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
  const welcomeModal = useDisclosure();

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
      welcomeModal.onOpen();
      setWelcomeModalWasOpened(true);
    }
  });

  const StatTile = ({
    title,
    value,
    subtext,
    icon,
    statusColor = "default",
    onClick,
    children,
  }: any) => (
    <motion.div className="h-full" variants={itemVariants}>
      <Card
        className="h-full bg-content1/60 backdrop-blur-md shadow-lg border border-default-100 overflow-visible"
        isPressable={!!onClick}
        onPress={onClick}
      >
        <CardBody className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div
              className={`flex size-10 items-center justify-center rounded-xl bg-${statusColor}/20 text-${statusColor}`}
            >
              <Icon icon={icon} width={24} />
            </div>
            {children}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-default-500 text-sm font-medium">
              {title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                <NumberFlow value={value} />
              </span>
              {subtext && (
                <span className="text-xs text-default-400 font-medium">
                  {subtext}
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
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
              Command <span className="text-primary">Center</span>
            </h1>
            <p className="text-default-500">
              Welcome back, {user.username}. Systems are operational.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:arrow-right-01" />}
              variant="shadow"
              onPress={() => router.push("/flows")}
            >
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
          <Dropdown backdrop="blur" placement="bottom-start">
            <DropdownTrigger>
              <div>
                <StatTile
                  icon="hugeicons:workflow-square-01"
                  statusColor={flowIssues > 0 ? "warning" : "success"}
                  subtext={`${flowIssues} requiring attention`}
                  title="Active Flows"
                  value={flows.length}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Flow Problems">
              {flows
                .filter((f: any) => f.maintenance)
                .map((flow: any) => (
                  <DropdownItem
                    key={flow.id}
                    startContent={
                      <Icon
                        className="text-warning"
                        icon="hugeicons:alert-02"
                      />
                    }
                    onPress={() => router.push(`/flows/${flow.id}`)}
                  >
                    {flow.name}
                  </DropdownItem>
                ))}
              {flowIssues === 0 && (
                <DropdownItem key="no-issues" isReadOnly>
                  No issues detected
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          <Dropdown backdrop="blur" placement="bottom-start">
            <DropdownTrigger>
              <div>
                <StatTile
                  icon="hugeicons:rocket-02"
                  statusColor={executionIssues > 0 ? "danger" : "primary"}
                  subtext={`${executionIssues} failed or waiting`}
                  title="24h Executions"
                  value={executionsWithAttention.length} // This might need to be total executions count if available, using attention list for now
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Execution Problems">
              {executionsWithAttention
                .filter(
                  (e: any) =>
                    (e.status === "error" ||
                      e.status === "interactionWaiting") &&
                    new Date(e.created_at).getTime() >
                      Date.now() - 24 * 60 * 60 * 1000,
                )
                .map((execution: any) => (
                  <DropdownItem
                    key={execution.id}
                    description={<ReactTimeago date={execution.executed_at} />}
                    startContent={
                      <Icon
                        className={
                          execution.status === "error"
                            ? "text-danger"
                            : "text-primary"
                        }
                        icon={
                          execution.status === "error"
                            ? "hugeicons:alert-02"
                            : "hugeicons:waving-hand-01"
                        }
                      />
                    }
                    onPress={() =>
                      router.push(
                        `/flows/${execution.flow_id}/execution/${execution.id}`,
                      )
                    }
                  >
                    {execution.id.substring(0, 8)}...
                  </DropdownItem>
                ))}
              {executionIssues === 0 && (
                <DropdownItem key="no-issues" isReadOnly>
                  All systems nominal
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          <Dropdown backdrop="blur" placement="bottom-start">
            <DropdownTrigger>
              <div>
                <StatTile
                  icon="hugeicons:ai-brain-04"
                  statusColor={runnerIssues > 0 ? "danger" : "success"}
                  subtext={`${runnerIssues} offline`}
                  title="Online Runners"
                  value={runners.length}
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Runner Problems">
              {runners
                .filter(
                  (r: any) => !r.shared_runner && !runnerHeartbeatStatus(r),
                )
                .map((runner: any) => (
                  <DropdownItem
                    key={runner.id}
                    startContent={
                      <Icon className="text-danger" icon="hugeicons:alert-02" />
                    }
                    onPress={() =>
                      router.push(`/projects/${runner.project_id}?tab=runners`)
                    }
                  >
                    {runner.name}
                  </DropdownItem>
                ))}
              {runnerIssues === 0 && (
                <DropdownItem key="no-runner-issues" isReadOnly>
                  All runners operational
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* Middle Row: Chart & Pulse */}
          <motion.div className="md:col-span-2 h-full" variants={itemVariants}>
            <Card className="h-full min-h-[350px] bg-content1/60 backdrop-blur-md shadow-lg border border-default-100">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-large">Execution Volume</h4>
                <p className="text-tiny text-default-500">
                  Daily activity over the last week
                </p>
              </CardHeader>
              <CardBody className="overflow-hidden">
                <DashboardExecutionsStats stats={stats} />
              </CardBody>
            </Card>
          </motion.div>

          <motion.div className="md:col-span-1 h-full" variants={itemVariants}>
            <Card className="h-full min-h-[350px] bg-content1/60 backdrop-blur-md shadow-lg border border-default-100">
              <CardHeader className="pb-0 pt-4 px-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-large">System Pulse</h4>
                  <p className="text-tiny text-default-500">
                    Live Runner Status
                  </p>
                </div>
                <Chip
                  color="success"
                  size="sm"
                  startContent={
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
                    </span>
                  }
                  variant="flat"
                >
                  Live
                </Chip>
              </CardHeader>
              <CardBody className="px-2">
                <ScrollShadow className="h-[280px]">
                  <div className="flex flex-col gap-2 p-2">
                    {runners.map((runner: any) => {
                      const isAlive = runnerHeartbeatStatus(runner);
                      const color = heartbeatColor(runner);

                      return (
                        <div
                          key={runner.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-content2/50 hover:bg-content2 transition-colors cursor-pointer"
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
                                className={`w-2 h-2 rounded-full bg-${color} ${isAlive ? "animate-pulse" : ""}`}
                              />
                              {isAlive && (
                                <div
                                  className={`absolute inset-0 w-2 h-2 rounded-full bg-${color} animate-ping opacity-75`}
                                />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {runner.name}
                              </span>
                              <span className="text-[10px] text-default-400">
                                {runner.shared_runner
                                  ? "Shared Runner"
                                  : "Private Runner"}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-default-400 font-mono">
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
              </CardBody>
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
