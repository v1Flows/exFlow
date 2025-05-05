import { CircularProgress, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

export function executionStatuses(): string[] {
  return [
    "scheduled",
    "pending",
    "running",
    "paused",
    "canceled",
    "noPatternMatch",
    "noResult",
    "interactionWaiting",
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
  } else if (step.status === "interactionWaiting") {
    return "Interactive";
  } else if (step.status === "error") {
    return "Error";
  } else if (step.status === "success") {
    return "Success";
  } else {
    return "N/A";
  }
}

export function executionStatusColor(step: any) {
  if (step.status === "pending") {
    return "default-400";
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
    return "default-400";
  } else if (step.status === "interactionWaiting") {
    return "primary";
  } else if (step.status === "error") {
    return "danger";
  } else if (step.status === "success") {
    return "success";
  } else {
    return "default-400";
  }
}

export function executionStatusCardBackgroundColor(step: any) {
  if (step.status === "pending") {
    return "default/50";
  } else if (step.status === "scheduled") {
    return "secondary/30";
  } else if (step.status === "running") {
    return "primary/30";
  } else if (step.status === "paused") {
    return "warning/30";
  } else if (step.status === "canceled") {
    return "danger/30";
  } else if (step.status === "noPatternMatch") {
    return "secondary/30";
  } else if (step.status === "noResult") {
    return "default/50";
  } else if (step.status === "interactionWaiting") {
    return "primary/30";
  } else if (step.status === "error") {
    return "danger/30";
  } else if (step.status === "success") {
    return "success/30";
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
  } else if (step.status === "interactionWaiting") {
    return "hugeicons:waving-hand-01";
  } else if (step.status === "error") {
    return "hugeicons:alert-02";
  } else if (step.status === "success") {
    return "hugeicons:tick-double-03";
  } else {
    return "solar:question-square-linear";
  }
}

export function executionStatusWrapper(step: any) {
  if (step.status === "pending") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="default"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-default-500"
              icon="hugeicons:time-quarter-pass"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "scheduled") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="secondary"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-secondary"
              icon="hugeicons:time-schedule"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "running") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress aria-label="Step" color="primary" size="md" />
      </Tooltip>
    );
  } else if (step.status === "paused") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="warning"
          size="md"
          value={100}
          valueLabel={
            <Icon className="text-warning" icon="hugeicons:pause" width={16} />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "canceled") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="danger"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-danger"
              icon="hugeicons:cancel-01"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "noPatternMatch") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          color="secondary"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-secondary"
              icon="hugeicons:note-remove"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "noResult") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="default"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-default-500"
              icon="solar:ghost-broken"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "interactionWaiting") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="primary"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-primary"
              icon="hugeicons:waving-hand-01"
              width={22}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "error") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="danger"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-danger"
              icon="hugeicons:alert-02"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "success") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="success"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-success"
              icon="hugeicons:tick-double-03"
              width={22}
            />
          }
        />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="success"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-success"
              icon="solar:question-square-linear"
              width={22}
            />
          }
        />
      </Tooltip>
    );
  }
}
