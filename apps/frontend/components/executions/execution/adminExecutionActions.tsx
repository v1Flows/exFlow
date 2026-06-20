import { Icon } from "@iconify/react";
import { Button, Dropdown, Header, toast } from "@heroui/react";
import UpdateExecution from "@/lib/fetch/executions/PUT/update";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function AdminExecutionActions({
  execution,
}: {
  execution: any;
}) {
  const { refreshExecution } = useRefreshCache();
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
      case "recovered":
        newExecution.status = "recovered";
        newExecution.finished_at =
          execution.finished_at !== "0001-01-01T00:00:00Z"
            ? execution.finished_at
            : new Date().toISOString();
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
        toast.danger("Execution", { description: "Invalid Status" });
        return;
    }
    const response = await UpdateExecution(newExecution);
    if (response.success) {
      toast.success("Execution", { description: "Execution Status Changed" });
      refreshExecution(execution.id);
    } else {
      toast.danger("Execution", {
        description: "Failed to change Execution Status",
      });
    }
  }
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button variant="danger-soft">
          <Icon icon="hugeicons:shield-energy" width={20} />
          Admin Actions
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Table Columns">
          <Dropdown.Section>
            <Header>{"Change Execution Status"}</Header>
            <Dropdown.Item
              key="pending"
              id="pending"
              className="capitalize"
              onPress={() => changeExecutionStatus("pending")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-muted"
                  icon="hugeicons:time-quarter-pass"
                  width={20}
                />
                Pending
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="running"
              id="running"
              className="capitalize"
              onPress={() => changeExecutionStatus("running")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-accent"
                  icon="hugeicons:play"
                  width={20}
                />
                Running
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="paused"
              id="paused"
              className="capitalize"
              onPress={() => changeExecutionStatus("paused")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-warning"
                  icon="hugeicons:pause"
                  width={20}
                />
                Paused
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="canceled"
              id="canceled"
              className="capitalize"
              onPress={() => changeExecutionStatus("canceled")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-danger"
                  icon="hugeicons:cancel-01"
                  width={20}
                />
                Canceled
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="noPatternMatch"
              id="noPatternMatch"
              className="capitalize"
              onPress={() => changeExecutionStatus("noPatternMatch")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-default-foreground"
                  icon="hugeicons:note-remove"
                  width={20}
                />
                No Pattern Match
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="interactionWaiting"
              id="interactionWaiting"
              className="capitalize"
              onPress={() => changeExecutionStatus("interactionWaiting")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-accent"
                  icon="hugeicons:waving-hand-01"
                  width={20}
                />
                Interaction Required
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="recovered"
              id="recovered"
              className="capitalize"
              onPress={() => changeExecutionStatus("recovered")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-warning"
                  icon="hugeicons:first-aid-kit"
                  width={20}
                />
                Recovered
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="error"
              id="error"
              className="capitalize"
              onPress={() => changeExecutionStatus("error")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-danger"
                  icon="hugeicons:alert-02"
                  width={20}
                />
                Error
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="success"
              id="success"
              className="capitalize"
              onPress={() => changeExecutionStatus("success")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-success"
                  icon="hugeicons:tick-double-01"
                  width={20}
                />
                Success
              </div>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
