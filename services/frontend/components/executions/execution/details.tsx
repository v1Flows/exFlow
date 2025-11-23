import { Icon } from "@iconify/react";
import { Tooltip } from "@heroui/react";
import NumberFlow from "@number-flow/react";
import ReactTimeago from "react-timeago";

import {
  executionStatusColor,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";

interface StatCardProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  color?: string;
  tooltip?: string;
}

function StatCard({ icon, label, value, color = "default", tooltip }: StatCardProps) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-${color === "default" ? "default-100" : color + "/20"} text-${color === "default" ? "default-500" : color}`}>
        <Icon icon={icon} width={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-default-500">{label}</p>
        <div className="truncate text-sm font-bold text-foreground">{value}</div>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} placement="top">
        {content}
      </Tooltip>
    );
  }

  return content;
}

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
      return "default";
    }

    if (execution.status === "success" || execution.status === "recovered") {
      return "success";
    }

    if (timeAgo < 0 && timeAgo > -10) {
      return "success";
    } else if (timeAgo <= -10 && timeAgo > -20) {
      return "warning";
    } else if (timeAgo <= -20) {
      return "danger";
    }
    return "default";
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
    return "Unknown";
  }

  const runnerName = runners.find((r: any) => r.id === execution.runner_id)?.name || "N/A";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {/* Status */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10">
        <div className="flex size-10 shrink-0 items-center justify-center">
          {executionStatusWrapper(execution)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-default-500">Status</p>
          <p className={`truncate text-sm font-bold text-${executionStatusColor(execution)}`}>
            {executionStatusName(execution)}
          </p>
        </div>
      </div>

      {/* Scheduled At */}
      {execution.status === "scheduled" && (
        <StatCard
          icon="hugeicons:date-time"
          label="Scheduled At"
          value={
            execution.scheduled_at === "0001-01-01T00:00:00Z" ? (
              "N/A"
            ) : (
              <ReactTimeago date={execution.scheduled_at} />
            )
          }
          color="secondary"
        />
      )}

      {/* Health */}
      <StatCard
        icon="hugeicons:stethoscope-02"
        label="Health"
        value={heartbeatStatus()}
        color={heartbeatColor()}
        tooltip={execution.last_heartbeat}
      />

      {/* Runner */}
      <StatCard
        icon="hugeicons:ai-brain-04"
        label="Runner"
        value={runnerName}
        tooltip={runnerName.length > 20 ? runnerName : undefined}
      />

      {/* Total Steps */}
      <StatCard
        icon="hugeicons:workflow-square-02"
        label="Total Steps"
        value={<NumberFlow locales="en-US" value={steps.length} />}
      />

      {/* Executed At */}
      <StatCard
        icon="hugeicons:time-schedule"
        label="Executed At"
        value={
          execution.executed_at === "0001-01-01T00:00:00Z" ? (
            "N/A"
          ) : (
            <ReactTimeago date={execution.executed_at} />
          )
        }
        tooltip={execution.executed_at}
      />

      {/* Finished At */}
      <StatCard
        icon="hugeicons:time-02"
        label="Finished At"
        value={
          execution.finished_at !== "0001-01-01T00:00:00Z" ? (
            <ReactTimeago date={execution.finished_at} />
          ) : (
            "N/A"
          )
        }
        tooltip={execution.finished_at}
      />

      {/* Duration */}
      {execution.status !== "scheduled" && (
        <StatCard
          icon="hugeicons:timer-02"
          label="Duration"
          value={getDuration()}
          tooltip="The 'Pick Up' step is not considered in the calculation"
        />
      )}
    </div>
  );
}
