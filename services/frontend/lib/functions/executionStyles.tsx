import { CircularProgress, Progress, Tooltip } from "@heroui/react";
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
            <Icon className="text-warning" icon="hugeicons:pause" width={20} />
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
              width={20}
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
              icon="hugeicons:alert-diamond"
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
              icon="hugeicons:tick-double-01"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "warning") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="warning"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-warning"
              icon="hugeicons:alert-02"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "recovered") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="warning"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-warning"
              icon="hugeicons:first-aid-kit"
              width={20}
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
              width={20}
            />
          }
        />
      </Tooltip>
    );
  }
}

export function executionStatusSmall(step: any) {
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
    return <Icon className="text-warning" icon="hugeicons:pause" width={20} />;
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
              width={20}
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
              icon="hugeicons:alert-diamond"
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
              icon="hugeicons:tick-double-01"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "warning") {
    return (
      <Tooltip content={`${executionStatusName(step)}`}>
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="warning"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-warning"
              icon="hugeicons:alert-02"
              width={20}
            />
          }
        />
      </Tooltip>
    );
  } else if (step.status === "recovered") {
    return (
      <Icon
        className="text-warning"
        icon="hugeicons:first-aid-kit"
        width={20}
      />
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
              width={20}
            />
          }
        />
      </Tooltip>
    );
  }
}

export function executionStatusWrapperCircle(step: any) {
  if (step.status === "pending") {
    return <div className="w-3 h-3 rounded-full bg-default-200" />;
  } else if (step.status === "scheduled") {
    return <div className="w-3 h-3 rounded-full bg-secondary" />;
  } else if (step.status === "running") {
    return <div className="w-3 h-3 rounded-full bg-primary" />;
  } else if (step.status === "paused") {
    return <div className="w-3 h-3 rounded-full bg-warning" />;
  } else if (step.status === "canceled") {
    return <div className="w-3 h-3 rounded-full bg-danger" />;
  } else if (step.status === "noPatternMatch") {
    return <div className="w-3 h-3 rounded-full bg-secondary" />;
  } else if (step.status === "noResult") {
    return <div className="w-3 h-3 rounded-full bg-default-500" />;
  } else if (step.status === "interactionWaiting") {
    return <div className="w-3 h-3 rounded-full bg-primary" />;
  } else if (step.status === "error") {
    return <div className="w-3 h-3 rounded-full bg-danger" />;
  } else if (step.status === "success") {
    return <div className="w-3 h-3 rounded-full bg-success" />;
  } else if (step.status === "warning") {
    return <div className="w-3 h-3 rounded-full bg-warning" />;
  } else if (step.status === "recovered") {
    return <div className="w-3 h-3 rounded-full bg-warning" />;
  } else {
    return <div className="w-3 h-3 rounded-full bg-default-500" />;
  }
}

export function executionStatusTimeline(step: any) {
  if (step.status === "pending") {
    return <div className="h-1 m-2 bg-default rounded-full" />;
  } else if (step.status === "scheduled") {
    return <div className="h-1 m-2 bg-secondary rounded-full" />;
  } else if (step.status === "running") {
    return <Progress isIndeterminate className="h-1" />;
  } else if (step.status === "paused") {
    return <Progress isIndeterminate className="h-1" color="warning" />;
  } else if (step.status === "canceled") {
    return <div className="h-1 m-2 bg-danger rounded-full" />;
  } else if (step.status === "noPatternMatch") {
    return <div className="h-1 m-2 bg-secondary rounded-full" />;
  } else if (step.status === "noResult") {
    return <div className="h-1 m-2 bg-secondary rounded-full" />;
  } else if (step.status === "interactionWaiting") {
    return <Progress className="flex-1 h-1" value={100} />;
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
