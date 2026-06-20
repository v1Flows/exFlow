import { Icon } from "@iconify/react";
import { Button, Dropdown, Header, toast } from "@heroui/react";
import UpdateExecutionStep from "@/lib/fetch/executions/PUT/updateStep";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function AdminStepActions({
  execution,
  step,
}: {
  execution: any;
  step: any;
}) {
  const { refreshExecutionSteps } = useRefreshCache();
  async function changeStepStatus(status: string) {
    const newStep = { ...step };
    switch (status) {
      case "pending":
        newStep.status = "pending";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Pending`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "running":
        newStep.status = "running";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Running`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "paused":
        newStep.status = "paused";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Paused`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "canceled":
        newStep.status = "canceled";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Canceled`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.canceled_by = "admin";
        newStep.canceled_at = new Date().toISOString();
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : new Date().toISOString();
        break;
      case "noPatternMatch":
        newStep.status = "noPatternMatch";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to No Pattern Match`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "skipped":
        newStep.status = "skipped";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Skipped`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "interactionWaiting":
        newStep.status = "interactionWaiting";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Interaction Required`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "warning":
        newStep.status = "warning";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Warning`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : new Date().toISOString();
        break;
      case "error":
        newStep.status = "error";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Error`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : new Date().toISOString();
        break;
      case "success":
        newStep.status = "success";
        newStep.messages = [
          {
            Title: "Admin",
            Lines: [
              {
                Content: `********** CAUTION **********`,
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `Step Status changed by Admin to Success`,
                Color: "warning",
                Timestamp: new Date().toISOString(),
              },
              {
                Content: `********************`,
                Timestamp: new Date().toISOString(),
              },
            ],
          },
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : new Date().toISOString();
        break;
      default:
        toast.danger("Execution", { description: "Invalid Status" });
        return;
    }
    const response = await UpdateExecutionStep(execution, newStep);
    if (response.success) {
      toast.success("Execution", { description: "Step Status Changed" });
      refreshExecutionSteps(execution.id);
    } else {
      toast.danger("Execution", {
        description: "Failed to change Step Status",
      });
    }
  }
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button variant="danger-soft" className="aspect-square p-0">
          <Icon icon="solar:shield-up-broken" width={20} />
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
              onPress={() => changeStepStatus("pending")}
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
              onPress={() => changeStepStatus("running")}
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
              key="interactionWaiting"
              id="interactionWaiting"
              className="capitalize"
              onPress={() => changeStepStatus("interactionWaiting")}
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
              key="paused"
              id="paused"
              className="capitalize"
              onPress={() => changeStepStatus("paused")}
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
              onPress={() => changeStepStatus("canceled")}
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
              key="no_pattern_match"
              id="no_pattern_match"
              className="capitalize"
              onPress={() => changeStepStatus("noPatternMatch")}
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
              key="skipped"
              id="skipped"
              className="capitalize"
              onPress={() => changeStepStatus("skipped")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-muted"
                  icon="hugeicons:redo-03"
                  width={20}
                />
                Skipped
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="warning"
              id="warning"
              className="capitalize"
              onPress={() => changeStepStatus("warning")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-warning"
                  icon="hugeicons:alert-02"
                  width={20}
                />
                Warning
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="error"
              id="error"
              className="capitalize"
              onPress={() => changeStepStatus("error")}
              textValue=" "
            >
              <div className="flex-cols flex gap-2">
                <Icon
                  className="text-danger"
                  icon="hugeicons:alert-diamond"
                  width={20}
                />
                Error
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              key="success"
              id="success"
              className="capitalize"
              onPress={() => changeStepStatus("success")}
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
