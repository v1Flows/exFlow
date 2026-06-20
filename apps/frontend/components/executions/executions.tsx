import { PagePagination } from "@/components/ui/page-pagination";
import {
  Button,
  ButtonGroup,
  Card,
  Dropdown,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};
import { useExecutionsStyleStore } from "@/lib/functions/userExecutionsStyle";
import {
  executionStatusColor,
  executionStatuses,
  executionStatusIcon,
  executionStatusName,
} from "@/lib/functions/executionStyles";
import {
  useExecutions,
  useFlowExecutionsPaginated,
} from "@/lib/swr/hooks/flows";
import ExecutionsTimeline from "./executionsTimeline";
import ExecutionsTable from "./executionsTable";
export default function Executions({
  runners,
  displayToFlow,
  canEdit,
  flows,
  flowID,
}: any) {
  const { displayStyle, setDisplayStyle } = useExecutionsStyleStore();
  const [statusFilter, setStatusFilter] = useState(new Set([]) as any);
  // pagination
  const [page, setPage] = useState(1);
  const limit = displayStyle === "table" ? 10 : 6;
  // Calculate offset using page directly for now (will be validated later)
  const offset = (page - 1) * limit;
  // Convert statusFilter to string for API
  const statusFilterString =
    statusFilter.size > 0 ? Array.from(statusFilter).join(",") : null;
  // Always call both hooks but only use the relevant one
  const flowExecutionsResult = useFlowExecutionsPaginated(
    flowID || null,
    limit,
    offset,
    statusFilterString,
  );
  const allExecutionsResult = useExecutions(
    flowID ? 0 : limit,
    flowID ? 0 : offset,
    flowID ? null : statusFilterString,
  );
  // Choose the right result based on whether we have a flowID
  const {
    executions,
    total: totalExecutions,
    isLoading: loading,
    refresh,
  } = flowID ? flowExecutionsResult : allExecutionsResult;
  const items = useMemo(() => {
    return executions || [];
  }, [executions]);
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalExecutions / limit));
  // Ensure page is never higher than total pages
  const safePage = Math.min(page, totalPages);
  // If safe page is different from current page, update it
  if (safePage !== page && totalPages > 0 && !loading) {
    setPage(safePage);
  }
  return (
    <motion.div
      animate="visible"
      className="h-full"
      initial="hidden"
      variants={itemVariants}
    >
      <Card className="bg-surface/60 backdrop-blur-md shadow-lg border border-default h-full">
        <Card.Content className="p-0 h-full overflow-hidden">
          <div className="p-4 border-b border-default flex flex-wrap gap-4 justify-between items-center bg-surface/50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon icon="hugeicons:rocket-02" width={24} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold">Executions</h3>
                <p className="text-sm text-muted">
                  Total: <NumberFlow value={totalExecutions} />
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dropdown>
                <Dropdown.Trigger>
                  <Button
                    size="md"
                    variant={statusFilter.size > 0 ? "primary" : "tertiary"}
                  >
                    {<Icon className="text-sm" icon="hugeicons:filter" />}
                    Filter
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    aria-label="Multiple selection example"
                    selectedKeys={statusFilter}
                    selectionMode="multiple"
                    onSelectionChange={(e) => {
                      setStatusFilter(e);
                      setPage(1); // Reset to first page when filter changes
                    }}
                  >
                    {executionStatuses().map((status: any) => {
                      return (
                        <Dropdown.Item key={status} id={status} textValue=" ">
                          {
                            <Icon
                              className={`text-${executionStatusColor({
                                status: status,
                              })}`}
                              icon={executionStatusIcon({ status: status })}
                              width={20}
                            />
                          }
                          {executionStatusName({ status: status })}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>

              <Button
                isPending={loading}
                size="md"
                variant="tertiary"
                onPress={() => {
                  refresh();
                }}
              >
                {<Icon className="text-sm" icon="hugeicons:refresh" />}
                Refresh
              </Button>

              <ButtonGroup size="md">
                <Tooltip>
                  <Tooltip.Trigger>
                    <Button
                      variant={
                        displayStyle !== "table" ? "primary" : "tertiary"
                      }
                      onPress={() => {
                        setDisplayStyle("list");
                        setPage(1);
                      }}
                      className="aspect-square p-0"
                    >
                      {<Icon icon="hugeicons:time-02" width={17} />}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content placement="top">
                    {"Timeline View"}
                  </Tooltip.Content>
                </Tooltip>
                <Tooltip>
                  <Tooltip.Trigger>
                    <Button
                      variant={
                        displayStyle === "table" ? "primary" : "tertiary"
                      }
                      onPress={() => {
                        setDisplayStyle("table");
                        setPage(1);
                      }}
                      className="aspect-square p-0"
                    >
                      {<Icon icon="hugeicons:layout-table-01" width={17} />}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content placement="top">
                    {"Table View"}
                  </Tooltip.Content>
                </Tooltip>
              </ButtonGroup>
            </div>
          </div>

          <div aria-hidden className="h-2" />

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {displayStyle === "table" ? (
                <ExecutionsTable
                  canEdit={canEdit}
                  displayToFlow={displayToFlow}
                  executions={items}
                  runners={runners}
                />
              ) : (
                <ExecutionsTimeline
                  canEdit={canEdit}
                  displayToFlow={displayToFlow}
                  executions={items}
                  flows={flows}
                  runners={runners}
                />
              )}
            </>
          )}

          <div className="flex justify-center mt-4 mb-4">
            <PagePagination
              page={safePage}
              pageCount={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
