import { ProgressBar, ProgressCircle, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
export function executionStatuses(): string[] {
  return [
    "scheduled",
    "pending",
    "running",
    "interactionWaiting",
    "paused",
    "canceled",
    "noPatternMatch",
    "noResult",
    "skipped",
    "recovered",
    "error",
    "success",
  ];
}
export function executionStatusName(step: any): any {
  if (step.status === "scheduled") {
    return "Scheduled";
  } else if (step.status === "pending") {
    return "Pending";
  } else if (step.status === "running") {
    return "Running";
  } else if (step.status === "paused") {
    return "Paused";
  } else if (step.status === "canceled") {
    return "Canceled";
  } else if (step.status === "noPatternMatch") {
    return "No Pattern Match";
  } else if (step.status === "noResult") {
    return "No Result";
  } else if (step.status === "skipped") {
    return "Skipped";
  } else if (step.status === "interactionWaiting") {
    return "Interaction Required";
  } else if (step.status === "error") {
    return "Error";
  } else if (step.status === "success") {
    return "Success";
  } else if (step.status === "warning") {
    return "Warning";
  } else if (step.status === "recovered") {
    return "Recovered";
  } else {
    return "N/A";
  }
}
export function executionStatusColor(step: any) {
  if (step.status === "pending") {
    return "default";
  } else if (step.status === "scheduled") {
    return "secondary";
  } else if (step.status === "running") {
    return "primary";
  } else if (step.status === "paused") {
    return "warning";
  } else if (step.status === "canceled") {
    return "danger";
  } else if (step.status === "noPatternMatch") {
    return "secondary";
  } else if (step.status === "noResult") {
    return "default";
  } else if (step.status === "skipped") {
    return "default";
  } else if (step.status === "interactionWaiting") {
    return "primary";
  } else if (step.status === "error") {
    return "danger";
  } else if (step.status === "success") {
    return "success";
  } else if (step.status === "warning") {
    return "warning";
  } else if (step.status === "recovered") {
    return "warning";
  } else {
    return "default";
  }
}
export function executionStatusCardBackgroundColor(step: any) {
  if (step.status === "pending") {
    return "default/50";
  } else if (step.status === "scheduled") {
    return "secondary/20";
  } else if (step.status === "running") {
    return "primary/20";
  } else if (step.status === "paused") {
    return "warning/20";
  } else if (step.status === "canceled") {
    return "danger/20";
  } else if (step.status === "noPatternMatch") {
    return "secondary/20";
  } else if (step.status === "noResult") {
    return "default/50";
  } else if (step.status === "skipped") {
    return "default/50";
  } else if (step.status === "interactionWaiting") {
    return "primary/20";
  } else if (step.status === "error") {
    return "danger/20";
  } else if (step.status === "success") {
    return "success/20";
  } else if (step.status === "warning") {
    return "warning/20";
  } else if (step.status === "recovered") {
    return "warning/20";
  } else {
    return "default/50";
  }
}
export function executionStatusIcon(step: any) {
  if (step.status === "pending") {
    return "hugeicons:time-quarter-pass";
  } else if (step.status === "scheduled") {
    return "hugeicons:time-schedule";
  } else if (step.status === "running") {
    return "hugeicons:play";
  } else if (step.status === "paused") {
    return "hugeicons:pause";
  } else if (step.status === "canceled") {
    return "hugeicons:cancel-01";
  } else if (step.status === "noPatternMatch") {
    return "hugeicons:note-remove";
  } else if (step.status === "noResult") {
    return "solar:ghost-broken";
  } else if (step.status === "skipped") {
    return "hugeicons:redo-03";
  } else if (step.status === "interactionWaiting") {
    return "hugeicons:waving-hand-01";
  } else if (step.status === "error") {
    return "hugeicons:alert-diamond";
  } else if (step.status === "success") {
    return "hugeicons:tick-double-01";
  } else if (step.status === "warning") {
    return "hugeicons:alert-02";
  } else if (step.status === "recovered") {
    return "hugeicons:first-aid-kit";
  } else {
    return "solar:question-square-linear";
  }
}
function executionStatusProgressColor(
  step: any,
): "default" | "accent" | "success" | "warning" | "danger" {
  const color = executionStatusColor(step);
  if (color === "primary" || color === "secondary") return "accent";
  return color;
}

function ExecutionStatusIndicator({
  step,
  size = "md",
}: {
  step: any;
  size?: "sm" | "md" | "lg";
}) {
  const isRunning = step.status === "running";
  return (
    <span className="relative inline-flex items-center justify-center">
      <ProgressCircle
        aria-label={executionStatusName(step)}
        color={executionStatusProgressColor(step)}
        isIndeterminate={isRunning}
        size={size}
        value={isRunning ? undefined : 100}
      >
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      {!isRunning && (
        <Icon
          className={`absolute text-${executionStatusProgressColor(step)}`}
          icon={executionStatusIcon(step)}
          width={size === "sm" ? 14 : 20}
        />
      )}
    </span>
  );
}

export function executionStatusWrapper(step: any) {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <ExecutionStatusIndicator step={step} />
      </Tooltip.Trigger>
      <Tooltip.Content>{executionStatusName(step)}</Tooltip.Content>
    </Tooltip>
  );
}

export function executionStatusSmall(step: any) {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <ExecutionStatusIndicator size="sm" step={step} />
      </Tooltip.Trigger>
      <Tooltip.Content>{executionStatusName(step)}</Tooltip.Content>
    </Tooltip>
  );
}
export function executionStatusWrapperCircle(step: any) {
  if (step.status === "pending") {
    return <div className="w-3 h-3 rounded-full bg-default" />;
  } else if (step.status === "scheduled") {
    return <div className="w-3 h-3 rounded-full bg-default" />;
  } else if (step.status === "running") {
    return <div className="w-3 h-3 rounded-full bg-accent" />;
  } else if (step.status === "paused") {
    return <div className="w-3 h-3 rounded-full bg-warning" />;
  } else if (step.status === "canceled") {
    return <div className="w-3 h-3 rounded-full bg-danger" />;
  } else if (step.status === "noPatternMatch") {
    return <div className="w-3 h-3 rounded-full bg-default" />;
  } else if (step.status === "noResult") {
    return <div className="w-3 h-3 rounded-full bg-default" />;
  } else if (step.status === "skipped") {
    return <div className="w-3 h-3 rounded-full bg-default" />;
  } else if (step.status === "interactionWaiting") {
    return <div className="w-3 h-3 rounded-full bg-accent" />;
  } else if (step.status === "error") {
    return <div className="w-3 h-3 rounded-full bg-danger" />;
  } else if (step.status === "success") {
    return <div className="w-3 h-3 rounded-full bg-success" />;
  } else if (step.status === "warning") {
    return <div className="w-3 h-3 rounded-full bg-warning" />;
  } else if (step.status === "recovered") {
    return <div className="w-3 h-3 rounded-full bg-warning" />;
  } else {
    return <div className="w-3 h-3 rounded-full bg-default" />;
  }
}
export function executionStatusTimeline(step: any) {
  if (step.status === "pending") {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  } else if (step.status === "scheduled") {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  } else if (step.status === "running") {
    return <ProgressBar isIndeterminate className="h-1" />;
  } else if (step.status === "paused") {
    return <ProgressBar isIndeterminate className="h-1" color="warning" />;
  } else if (step.status === "canceled") {
    return <div className="h-1 m-2 bg-danger rounded-full" />;
  } else if (step.status === "noPatternMatch") {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  } else if (step.status === "noResult") {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  } else if (step.status === "skipped") {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  } else if (step.status === "interactionWaiting") {
    return <ProgressBar className="flex-1 h-1" value={100} />;
  } else if (step.status === "error") {
    return <div className="h-1 m-2 bg-danger rounded-full" />;
  } else if (step.status === "success") {
    return <div className="h-1 m-2 bg-success rounded-full" />;
  } else if (step.status === "warning") {
    return <div className="h-1 m-2 bg-warning rounded-full" />;
  } else if (step.status === "recovered") {
    return <div className="h-1 m-2 bg-warning rounded-full" />;
  } else {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  }
}
