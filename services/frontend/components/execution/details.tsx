import { Icon } from "@iconify/react";
import { Card, CardBody, Tooltip } from "@heroui/react";
import NumberFlow from "@number-flow/react";
import ReactTimeago from "react-timeago";

import {
  executionStatusColor,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";

export default function ExecutionDetails({ runners, execution, steps }: any) {
  function getDuration() {
    let calFinished = new Date().toISOString();

    if (execution.executed_at === "0001-01-01T00:00:00Z") {
      return "N/A";
    }

    if (execution.finished_at !== "0001-01-01T00:00:00Z") {
      calFinished = execution.finished_at;
    }

    const ms =
      new Date(calFinished).getTime() -
      new Date(execution.executed_at).getTime();
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (day > 0) {
      return `${day}d ${hr % 24}h ${min % 60}m ${sec % 60}s`;
    } else if (hr > 0) {
      return `${hr}h ${min % 60}m ${sec % 60}s`;
    } else if (min > 0) {
      return `${min}m ${sec % 60}s`;
    } else {
      return `${sec}s`;
    }
  }

  function heartbeatColor() {
    const timeAgo =
      (new Date(execution.last_heartbeat).getTime() - Date.now()) / 1000;

    if (execution.status === "pending" || execution.status === "scheduled") {
      return "";
    }

    if (execution.status === "success") {
      return "success";
    }

    if (timeAgo < 0 && timeAgo > -10) {
      return "success";
    } else if (timeAgo <= -10 && timeAgo > -20) {
      return "warning";
    } else if (timeAgo <= -20) {
      return "danger";
    }
  }

  function heartbeatStatus() {
    const timeAgo =
      (new Date(execution.last_heartbeat).getTime() - Date.now()) / 1000;

    if (execution.status === "pending" || execution.status === "scheduled") {
      return "N/A";
    }

    if (execution.status === "success") {
      return "Healthy";
    }

    if (timeAgo < 0 && timeAgo > -10) {
      return "Healthy";
    } else if (timeAgo <= -11) {
      return "Unhealthy";
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 items-start items-stretch gap-4 lg:grid-cols-3 xl:grid-cols-7">
        <Card>
          <CardBody>
            <div className="flex items-center justify-start gap-2">
              <div className="flex size-12 items-center justify-center">
                {executionStatusWrapper(execution)}
              </div>
              <div>
                <p
                  className={`text-sm text- font-bold text-${executionStatusColor(execution)}`}
                >
                  {executionStatusName(execution)}
                </p>
                <p className="text-sm text-default-500">Status</p>
              </div>
            </div>
          </CardBody>
        </Card>
        {execution.status === "scheduled" && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-large bg-default text-secondary bg-opacity-40">
                  <Icon icon="hugeicons:date-time" width={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary">
                    {execution.scheduled_at === "0001-01-01T00:00:00Z" ? (
                      "N/A"
                    ) : (
                      <ReactTimeago date={execution.scheduled_at} />
                    )}
                  </p>
                  <p className="text-sm text-default-500">Scheduled At</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
        <Tooltip content={execution.last_heartbeat} placement="top">
          <Card>
            <CardBody>
              <div className="flex items-center justify-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-large bg-default bg-opacity-40">
                  <Icon icon="hugeicons:stethoscope-02" width={28} />
                </div>
                <div>
                  <p className={`text-sm font-bold text-${heartbeatColor()}`}>
                    {heartbeatStatus()}
                  </p>
                  <p className="text-sm text-default-500">Health</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tooltip>
        <Card>
          <CardBody>
            <div className="flex items-center justify-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-large bg-default bg-opacity-40">
                <Icon icon="hugeicons:ai-brain-04" width={28} />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {runners.find((r: any) => r.id === execution.runner_id)?.name
                    .length > 20 ? (
                    <Tooltip
                      content={
                        runners.find((r: any) => r.id === execution.runner_id)
                          ?.name
                      }
                    >
                      {runners
                        .find((r: any) => r.id === execution.runner_id)
                        ?.name.slice(0, 20) + "..."}
                    </Tooltip>
                  ) : (
                    runners.find((r: any) => r.id === execution.runner_id)
                      ?.name || "N/A"
                  )}
                </p>
                <p className="text-sm text-default-500">Runner</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-large bg-default bg-opacity-40">
                <Icon icon="hugeicons:workflow-square-02" width={28} />
              </div>
              <div>
                <p className="text-sm font-bold">
                  <NumberFlow
                    locales="en-US" // Intl.NumberFormat locales
                    value={steps.length}
                  />
                </p>
                <p className="text-sm text-default-500">Total Steps</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Tooltip content={execution.executed_at} placement="top">
          <Card>
            <CardBody>
              <div className="flex items-center justify-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-large bg-default bg-opacity-40">
                  <Icon icon="hugeicons:time-schedule" width={28} />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {execution.executed_at === "0001-01-01T00:00:00Z" ? (
                      "N/A"
                    ) : (
                      <ReactTimeago date={execution.executed_at} />
                    )}
                  </p>
                  <p className="text-sm text-default-500">Executed At</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tooltip>
        <Tooltip content={execution.finished_at} placement="top">
          <Card>
            <CardBody>
              <div className="flex items-center justify-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-large bg-default bg-opacity-40">
                  <Icon icon="hugeicons:time-02" width={28} />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {execution.finished_at != "0001-01-01T00:00:00Z" ? (
                      <ReactTimeago date={execution.finished_at} />
                    ) : (
                      "N/A"
                    )}
                  </p>
                  <p className="text-sm text-default-500">Finished At</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tooltip>
        {execution.status !== "scheduled" && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-large bg-default bg-opacity-40">
                  <Icon icon="hugeicons:timer-02" width={28} />
                </div>
                <div>
                  <p className="text-sm font-bold">{getDuration()}</p>
                  <p className="text-sm text-default-500">Duration</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
}
