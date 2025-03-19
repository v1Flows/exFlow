import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import UpdateExecution from "@/lib/fetch/executions/PUT/update";

export default function AdminExecutionActions({
  execution,
}: {
  execution: any;
}) {
  const router = useRouter();

  async function changeExecutionStatus(status: string) {
    const newExecution = { ...execution };

    switch (status) {
      case "pending":
        newExecution.status = "pending";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "running":
        newExecution.status = "running";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "paused":
        newExecution.status = "paused";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "canceled":
        newExecution.status = "canceled";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : new Date().toISOString();
        break;
      case "noPatternMatch":
        newExecution.status = "noPatternMatch";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "interactionWaiting":
        newExecution.status = "interactionWaiting";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "error":
        newExecution.status = "error";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : new Date().toISOString();
        break;
      case "success":
        newExecution.status = "success";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : new Date().toISOString();
        break;
      default:
        addToast({
          title: "Execution",
          description: "Invalid Status",
          color: "danger",
          variant: "flat",
        });

        return;
    }

    const response = await UpdateExecution(newExecution);

    if (response.success) {
      addToast({
        title: "Execution",
        description: "Execution Status Changed",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      addToast({
        title: "Execution",
        description: "Failed to change Execution Status",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button color="danger" variant="flat">
          <Icon icon="solar:shield-up-broken" width={20} />
          Admin Actions
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Table Columns" variant="flat">
        <DropdownSection title="Change Execution Status">
          <DropdownItem
            key="pending"
            className="capitalize"
            onPress={() => changeExecutionStatus("pending")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-default-500"
                icon="hugeicons:time-quarter-pass"
                width={20}
              />
              Pending
            </div>
          </DropdownItem>
          <DropdownItem
            key="running"
            className="capitalize"
            onPress={() => changeExecutionStatus("running")}
          >
            <div className="flex-cols flex gap-2">
              <Icon className="text-primary" icon="hugeicons:play" width={20} />
              Running
            </div>
          </DropdownItem>
          <DropdownItem
            key="paused"
            className="capitalize"
            onPress={() => changeExecutionStatus("paused")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-warning"
                icon="hugeicons:pause"
                width={20}
              />
              Paused
            </div>
          </DropdownItem>
          <DropdownItem
            key="canceled"
            className="capitalize"
            onPress={() => changeExecutionStatus("canceled")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-danger"
                icon="hugeicons:cancel-01"
                width={20}
              />
              Canceled
            </div>
          </DropdownItem>
          <DropdownItem
            key="noPatternMatch"
            className="capitalize"
            onPress={() => changeExecutionStatus("noPatternMatch")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-secondary"
                icon="hugeicons:note-remove"
                width={20}
              />
              No Pattern Match
            </div>
          </DropdownItem>
          <DropdownItem
            key="interactionWaiting"
            className="capitalize"
            onPress={() => changeExecutionStatus("interactionWaiting")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-primary"
                icon="hugeicons:waving-hand-01"
                width={20}
              />
              Interaction Required
            </div>
          </DropdownItem>
          <DropdownItem
            key="error"
            className="capitalize"
            onPress={() => changeExecutionStatus("error")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-danger"
                icon="hugeicons:alert-02"
                width={20}
              />
              Error
            </div>
          </DropdownItem>
          <DropdownItem
            key="success"
            className="capitalize"
            onPress={() => changeExecutionStatus("success")}
          >
            <div className="flex-cols flex gap-2">
              <Icon
                className="text-success"
                icon="hugeicons:tick-double-01"
                width={20}
              />
              Success
            </div>
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
