import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spacer,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useExecutionsStyleStore } from "@/lib/functions/userExecutionsStyle";
import {
  executionStatusColor,
  executionStatuses,
  executionStatusIcon,
  executionStatusName,
} from "@/lib/functions/executionStyles";
import GetExecutions from "@/lib/fetch/executions/all";
import GetFlowExecutions from "@/lib/fetch/flow/executions";

import ExecutionsList from "./executionsList";
import ExecutionsTable from "./executionsTable";
import ExecutionsCompact from "./executionsCompact";

export default function Executions({
  runners,
  displayToFlow,
  canEdit,
  flows,
  flowID,
}: any) {
  const router = useRouter();

  const { displayStyle, setDisplayStyle } = useExecutionsStyleStore();
  const [statusFilter, setStatusFilter] = useState(new Set([]) as any);

  const [totalExecutions, setTotalExecutions] = useState(0);
  const [executions, setExecutions] = useState([] as any);
  const [refreshKey, setRefreshKey] = useState(0);

  // pagination
  const [page, setPage] = useState(1);
  const limit =
    displayStyle === "list" ? 4 : displayStyle === "compact" ? 6 : 10;
  const offset = (page - 1) * limit;

  const items = useMemo(() => {
    if (statusFilter.size > 0) {
      return executions.filter((execution: any) =>
        statusFilter.has(statusFilterReturn(execution)),
      );
    }

    return executions;
  }, [executions, statusFilter]);

  useEffect(() => {
    async function fetchExecutions() {
      let res: any;

      if (flowID) {
        res = await GetFlowExecutions(
          flowID,
          limit,
          offset,
          statusFilter.size > 0 ? Array.from(statusFilter).join(",") : null,
        );
      } else {
        res = await GetExecutions(
          limit,
          offset,
          statusFilter.size > 0 ? Array.from(statusFilter).join(",") : null,
        );
      }

      if (res.success) {
        setExecutions(res.data.executions);
        setTotalExecutions(res.data.total);
      }
    }
    fetchExecutions();
  }, [page, statusFilter, displayStyle, refreshKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, []);

  function pages() {
    return Math.ceil(totalExecutions / limit);
  }

  function statusFilterReturn(execution: any) {
    if (execution.status === "scheduled") {
      return "scheduled";
    } else if (execution.status === "pending") {
      return "pending";
    } else if (execution.status === "running") {
      return "running";
    } else if (execution.status === "paused") {
      return "paused";
    } else if (execution.status === "canceled") {
      return "canceled";
    } else if (execution.status === "noPatternMatch") {
      return "no_pattern_match";
    } else if (execution.status === "interactionWaiting") {
      return "interaction_waiting";
    } else if (execution.status === "error") {
      return "error";
    } else if (execution.status === "success") {
      return "success";
    } else if (execution.status === "recovered") {
      return "recovered";
    } else {
      return "unknown";
    }
  }

  return (
    <Card>
      <CardBody className="p-0 h-full overflow-hidden">
        <div className="p-4 border-b border-default-100 flex flex-wrap gap-4 justify-end items-center">
          <div className="flex gap-2">
            <Dropdown backdrop="blur">
              <DropdownTrigger>
                <Button
                  size="md"
                  startContent={
                    <Icon className="text-sm" icon="hugeicons:filter" />
                  }
                  variant={statusFilter.size > 0 ? "solid" : "flat"}
                >
                  Filter
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Multiple selection example"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                variant="flat"
                onSelectionChange={(e) => {
                  setStatusFilter(e);
                  setPage(1); // Reset to first page when filter changes
                }}
              >
                {executionStatuses().map((status: any) => {
                  return (
                    <DropdownItem
                      key={status}
                      startContent={
                        <Icon
                          className={`text-${executionStatusColor({
                            status: status,
                          })}`}
                          icon={executionStatusIcon({ status: status })}
                          width={20}
                        />
                      }
                    >
                      {executionStatusName({ status: status })}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>

            <Button
              size="md"
              startContent={
                <Icon className="text-sm" icon="hugeicons:refresh" />
              }
              variant="flat"
              onPress={() => {
                setRefreshKey((k) => k + 1);
                router.refresh();
              }}
            >
              Refresh
            </Button>

            <ButtonGroup radius="sm" size="md">
              <Tooltip content="Compact View" placement="top">
                <Button
                  isIconOnly
                  startContent={
                    <Icon
                      icon="hugeicons:left-to-right-list-bullet"
                      width={17}
                    />
                  }
                  variant={displayStyle === "compact" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("compact");
                  }}
                />
              </Tooltip>
              <Tooltip content="List View" placement="top">
                <Button
                  isIconOnly
                  startContent={<Icon icon="hugeicons:task-01" width={17} />}
                  variant={displayStyle === "list" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("list");
                  }}
                />
              </Tooltip>
              <Tooltip content="Table View" placement="top">
                <Button
                  isIconOnly
                  startContent={
                    <Icon icon="hugeicons:layout-table-01" width={17} />
                  }
                  variant={displayStyle === "table" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("table");
                  }}
                />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>

        <Spacer y={2} />

        {displayStyle === "table" && (
          <ExecutionsTable
            canEdit={canEdit}
            displayToFlow={displayToFlow}
            executions={items}
            runners={runners}
          />
        )}

        {displayStyle === "list" && (
          <ExecutionsList
            canEdit={canEdit}
            displayToFlow={displayToFlow}
            executions={items}
            flows={flows}
            runners={runners}
          />
        )}

        {displayStyle === "compact" && (
          <ExecutionsCompact
            canEdit={canEdit}
            displayToFlow={displayToFlow}
            executions={items}
            flows={flows}
            runners={runners}
          />
        )}

        <div className="flex justify-center mt-4 mb-4">
          <Pagination
            showControls
            isDisabled={items.length === 0}
            page={page}
            total={pages()}
            onChange={(page) => setPage(page)}
          />
        </div>
      </CardBody>
    </Card>
  );
}
