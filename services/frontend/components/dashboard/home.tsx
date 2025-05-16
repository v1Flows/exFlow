"use client";

import { Icon } from "@iconify/react";
import {
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spacer,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactTimeago from "react-timeago";

import WelcomeModal from "@/components/modals/user/welcome";
import Executions from "@/components/execution/executions";
import Stats from "@/components/dashboard/stats";

import Reloader from "../reloader/Reloader";

export default function DashboardHome({
  stats,
  flows,
  runners,
  executions,
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

  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2">
        <div>
          <p className="text-xl font-bold">Hello, {user.username} 👋</p>
          <p className="text-default-500">
            Here&apos;s the current status for today.
          </p>
        </div>
        <Reloader circle refresh={10} />
      </div>
      <Spacer y={4} />
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1">
          <Dropdown backdrop="opaque" placement="bottom">
            <DropdownTrigger>
              <Card fullWidth isHoverable isPressable>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                      <Icon icon="hugeicons:workflow-square-10" width={24} />
                    </div>
                    <div>
                      {flows.filter((f: any) => f.maintenance).length > 0 ? (
                        <p className="text-md font-bold text-warning">
                          {flows.filter((f: any) => f.maintenance).length} need
                          attention
                        </p>
                      ) : (
                        <p className="text-md font-bold text-success">OK</p>
                      )}
                      <p className="text-sm text-default-500">Flows</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </DropdownTrigger>
            <DropdownMenu aria-label="Flow Problems">
              {flows
                .filter((f: any) => f.maintenance)
                .map((flow: any) => (
                  <DropdownItem
                    key={flow.id}
                    onPress={() => {
                      router.push(`/flows/${flow.id}`);
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                          <Icon
                            className="text-warning"
                            icon="hugeicons:alert-02"
                            width={20}
                          />
                        </div>
                        <div className="items-start">
                          <p className="text-md font-bold">{flow.name}</p>
                          <p className="text-sm text-default-500">
                            Message: {flow.maintenance_message}
                          </p>
                        </div>
                      </div>
                      <Icon icon="akar-icons:arrow-right" />
                    </div>
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="col-span-1">
          <Dropdown backdrop="opaque" placement="bottom">
            <DropdownTrigger>
              <Card fullWidth isHoverable isPressable>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                      <Icon icon="hugeicons:rocket-02" width={24} />
                    </div>
                    <div>
                      {executions.filter(
                        (e: any) =>
                          (e.error || e.interaction_required) &&
                          new Date(e.created_at).getTime() >
                            Date.now() - 24 * 60 * 60 * 1000,
                      ).length > 0 ? (
                        <div className="flex-cols flex items-center gap-1">
                          {executions.filter((e: any) => e.interaction_required)
                            .length > 0 && (
                            <p className="text-md font-bold text-primary">
                              {
                                executions.filter(
                                  (e: any) =>
                                    e.interaction_required &&
                                    new Date(e.created_at).getTime() >
                                      Date.now() - 24 * 60 * 60 * 1000,
                                ).length
                              }{" "}
                              Interaction Required
                            </p>
                          )}
                          {executions.filter((e: any) => e.error).length > 0 &&
                            executions.filter(
                              (e: any) => e.interaction_required,
                            ).length > 0 && (
                              <p className="text-md font-bold">&</p>
                            )}
                          {executions.filter((e: any) => e.error).length >
                            0 && (
                            <p className="text-md font-bold text-danger">
                              {
                                executions.filter(
                                  (e: any) =>
                                    e.error &&
                                    new Date(e.created_at).getTime() >
                                      Date.now() - 24 * 60 * 60 * 1000,
                                ).length
                              }{" "}
                              Failed
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-md font-bold text-success">OK</p>
                      )}
                      <p className="text-sm text-default-500">
                        Executions (last 24 hours)
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </DropdownTrigger>
            <DropdownMenu aria-label="Execution Problems">
              {executions
                .filter(
                  (e: any) =>
                    e.interaction_required &&
                    new Date(e.created_at).getTime() >
                      Date.now() - 24 * 60 * 60 * 1000,
                )
                .sort((a: any, b: any) =>
                  new Date(a.created_at) < new Date(b.created_at) ? 1 : -1,
                )
                .map((execution: any, index: any) => (
                  <DropdownItem
                    key={execution.id}
                    showDivider={index !== executions.length - 1}
                    onPress={() => {
                      router.push(
                        `/flows/${execution.flow_id}/execution/${execution.id}`,
                      );
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                          <Icon
                            className="text-primary"
                            icon="hugeicons:waving-hand-01"
                            width={24}
                          />
                        </div>
                        <div>
                          <p className="text-md font-bold">{execution.id}</p>
                          <p className="text-sm text-default-500">
                            Flow:{" "}
                            {
                              flows.find((f: any) => f.id === execution.flow_id)
                                .name
                            }
                          </p>
                          <p className="text-sm text-default-500">
                            Executed at:{" "}
                            <ReactTimeago date={execution.executed_at} />
                          </p>
                        </div>
                      </div>
                      <Icon icon="akar-icons:arrow-right" />
                    </div>
                  </DropdownItem>
                ))}
              {executions
                .filter(
                  (e: any) =>
                    e.error &&
                    new Date(e.created_at).getTime() >
                      Date.now() - 24 * 60 * 60 * 1000,
                )
                .sort((a: any, b: any) =>
                  new Date(a.created_at) < new Date(b.created_at) ? 1 : -1,
                )
                .map((execution: any) => (
                  <DropdownItem
                    key={execution.id}
                    onPress={() => {
                      router.push(
                        `/flows/${execution.flow_id}/execution/${execution.id}`,
                      );
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                          <Icon
                            className="text-danger"
                            icon="hugeicons:alert-02"
                            width={24}
                          />
                        </div>
                        <div>
                          <p className="text-md font-bold">{execution.id}</p>
                          <p className="text-sm text-default-500">
                            Flow:{" "}
                            {
                              flows.find((f: any) => f.id === execution.flow_id)
                                .name
                            }
                          </p>
                          <p className="text-sm text-default-500">
                            Executed at:{" "}
                            <ReactTimeago date={execution.executed_at} />
                          </p>
                        </div>
                      </div>
                      <Icon icon="akar-icons:arrow-right" />
                    </div>
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="col-span-1">
          <Dropdown backdrop="opaque" placement="bottom">
            <DropdownTrigger>
              <Card fullWidth isHoverable isPressable>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                      <Icon icon="hugeicons:ai-brain-04" width={24} />
                    </div>
                    <div>
                      {runners.filter(
                        (r: any) =>
                          !r.shared_runner && !runnerHeartbeatStatus(r),
                      ).length > 0 ? (
                        <p className="text-md font-bold text-danger">
                          {
                            runners.filter(
                              (r: any) =>
                                !r.shared_runner && !runnerHeartbeatStatus(r),
                            ).length
                          }{" "}
                          with issues
                        </p>
                      ) : (
                        <p className="text-md font-bold text-success">OK</p>
                      )}
                      <p className="text-sm text-default-500">Runners</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </DropdownTrigger>
            <DropdownMenu aria-label="Runner Problems">
              {runners
                .filter(
                  (r: any) => !r.shared_runner && !runnerHeartbeatStatus(r),
                )
                .map((runner: any) => (
                  <DropdownItem
                    key={runner.id}
                    onPress={() => {
                      router.push(`/projects/${runner.project_id}?tab=runners`);
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center justify-start gap-2">
                        <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                          <Icon
                            className={`text-${heartbeatColor(runner)}`}
                            icon="hugeicons:alert-02"
                            width={24}
                          />
                        </div>
                        <div>
                          <p className="text-md font-bold">{runner.name}</p>
                          <p className="text-sm text-default-500">
                            {runner.last_heartbeat ? (
                              <p>
                                Last Heartbeat:{" "}
                                <span
                                  className={`text- font-bold${heartbeatColor(runner)}`}
                                >
                                  <ReactTimeago date={runner.last_heartbeat} />
                                </span>
                              </p>
                            ) : (
                              "No heartbeat"
                            )}
                          </p>
                        </div>
                      </div>
                      <Icon icon="akar-icons:arrow-right" />
                    </div>
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <Spacer y={4} />

      {/* Stats */}
      <Stats stats={stats} />

      <Spacer y={4} />
      <p className="mb-2 text-2xl font-bold text-primary">Executions</p>
      <Executions displayToFlow executions={executions} runners={runners} />

      <WelcomeModal disclosure={welcomeModal} />
    </main>
  );
}
