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

import UpdateExecutionStep from "@/lib/fetch/executions/PUT/updateStep";

export default function AdminStepActions({
  execution,
  step,
}: {
  execution: any;
  step: any;
}) {
  const router = useRouter();

  async function changeStepStatus(status: string) {
    const newStep = { ...step };

    switch (status) {
      case "pending":
        newStep.status = "pending";
        newStep.messages = ["Action Status changed by Admin to Pending"];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "running":
        newStep.status = "running";
        newStep.messages = ["Action Status changed by Admin to Running"];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "paused":
        newStep.status = "paused";
        newStep.messages = ["Action Status changed by Admin to Paused"];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "canceled":
        newStep.status = "canceled";
        newStep.messages = ["Action Status changed by Admin to Canceled"];
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
          "Action Status changed by Admin to No Pattern Match",
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "interactionWaiting":
        newStep.status = "interactionWaiting";
        newStep.messages = [
          "Action Status changed by Admin to Interaction Required",
        ];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : "0001-01-01T00:00:00Z";
        break;
      case "error":
        newStep.status = "error";
        newStep.messages = ["Action Status changed by Admin to Error"];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
            : new Date().toISOString();
        break;
      case "success":
        newStep.status = "success";
        newStep.messages = ["Action Status changed by Admin to Success"];
        newStep.finished_at =
          step.finished_at !== "0001-01-01T00:00:00Z"
            ? step.finished_at
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

    const response = await UpdateExecutionStep(execution, newStep);

    if (response.success) {
      addToast({
        title: "Execution",
        description: "Step Status Changed",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      addToast({
        title: "Execution",
        description: "Failed to change Step Status",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly color="danger" variant="flat">
          <Icon icon="solar:shield-up-broken" width={20} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Table Columns" variant="flat">
        <DropdownSection title="Change Execution Status">
          <DropdownItem
            key="pending"
            className="capitalize"
            onPress={() => changeStepStatus("pending")}
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
            onPress={() => changeStepStatus("running")}
          >
            <div className="flex-cols flex gap-2">
              <Icon className="text-primary" icon="hugeicons:play" width={20} />
              Running
            </div>
          </DropdownItem>
          <DropdownItem
            key="paused"
            className="capitalize"
            onPress={() => changeStepStatus("paused")}
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
            onPress={() => changeStepStatus("canceled")}
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
            key="no_pattern_match"
            className="capitalize"
            onPress={() => changeStepStatus("noPatternMatch")}
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
            onPress={() => changeStepStatus("interactionWaiting")}
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
            onPress={() => changeStepStatus("error")}
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
            onPress={() => changeStepStatus("success")}
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
