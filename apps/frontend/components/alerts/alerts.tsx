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
import { useAlerts, useFlowAlertsPaginated } from "@/lib/swr/hooks/flows";
import { useAlertsStyleStore } from "@/lib/functions/userAlertsStyle";
import AlertsList from "./list";
export default function Alerts({
  runners,
  flows,
  canEdit,
  flowID,
  showFlow,
}: {
  runners: any;
  flows: any;
  canEdit?: boolean;
  flowID?: any;
  showFlow?: boolean;
}) {
  const { displayStyle, setDisplayStyle } = useAlertsStyleStore();
  const [statusFilter, setStatusFilter] = useState(new Set([]) as any);
  // pagination
  const [page, setPage] = useState(1);
  const limit = 6;
  // Calculate offset using page directly for now (will be validated later)
  const offset = (page - 1) * limit;
  // Convert statusFilter to string for API
  const statusFilterString =
    statusFilter.size > 0 ? Array.from(statusFilter).join(",") : null;
  // Always call both hooks but only use the relevant one
  const flowAlertsResult = useFlowAlertsPaginated(
    flowID || null,
    limit,
    offset,
    statusFilterString,
  );
  const allAlertsResult = useAlerts(
    flowID ? 0 : limit,
    flowID ? 0 : offset,
    flowID ? null : statusFilterString,
  );
  // Choose the right result based on whether we have a flowID
  const {
    alerts,
    total: totalAlerts,
    isLoading: loading,
    refresh,
  } = flowID ? flowAlertsResult : allAlertsResult;
  const items = useMemo(() => {
    return alerts || [];
  }, [alerts]);
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalAlerts / limit));
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
              <div className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Icon icon="hugeicons:alert-02" width={24} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold">Alerts</h3>
                <p className="text-sm text-muted">
                  Total: <NumberFlow value={totalAlerts} />
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
                    <Dropdown.Item
                      key={"firing"}
                      id={"firing"}
                      textValue="Firing"
                    >
                      {
                        <Icon
                          className="text-danger"
                          icon="hugeicons:fire"
                          width={20}
                        />
                      }
                      Firing
                    </Dropdown.Item>
                    <Dropdown.Item
                      key={"resolved"}
                      id={"resolved"}
                      textValue="Resolved"
                    >
                      {
                        <Icon
                          className="text-success"
                          icon="hugeicons:checkmark-badge-01"
                          width={20}
                        />
                      }
                      Resolved
                    </Dropdown.Item>
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
                      variant={displayStyle === "list" ? "primary" : "tertiary"}
                      onPress={() => {
                        setDisplayStyle("list");
                        setPage(1);
                      }}
                      className="aspect-square p-0"
                    >
                      {<Icon icon="hugeicons:task-01" width={17} />}
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content placement="top">
                    {"List View"}
                  </Tooltip.Content>
                </Tooltip>
              </ButtonGroup>
            </div>
          </div>

          <div aria-hidden className="h-2" />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {displayStyle === "list" && (
                <AlertsList
                  alerts={items}
                  canEdit={canEdit}
                  flows={flows}
                  runners={runners}
                  showDelete={true}
                  showFlowChip={showFlow}
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
