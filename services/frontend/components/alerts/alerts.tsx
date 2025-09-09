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
  Spinner,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import NumberFlow from "@number-flow/react";

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
    <Card>
      <CardBody className="p-0 h-full overflow-hidden">
        <div className="p-4 border-b border-default-100 flex flex-wrap gap-4 justify-between items-center">
          <p className="text-default-500 font-semibold">
            Total Alerts: <NumberFlow value={totalAlerts} />
          </p>
          <div className="flex gap-2">
            <Dropdown backdrop="transparent">
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
                <DropdownItem
                  key={"firing"}
                  startContent={
                    <Icon
                      className="text-danger"
                      icon="hugeicons:fire"
                      width={20}
                    />
                  }
                >
                  Firing
                </DropdownItem>
                <DropdownItem
                  key={"resolved"}
                  startContent={
                    <Icon
                      className="text-success"
                      icon="hugeicons:checkmark-badge-01"
                      width={20}
                    />
                  }
                >
                  Resolved
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              isLoading={loading}
              size="md"
              startContent={
                <Icon className="text-sm" icon="hugeicons:refresh" />
              }
              variant="flat"
              onPress={() => {
                refresh();
              }}
            >
              Refresh
            </Button>

            <ButtonGroup radius="sm" size="md">
              <Tooltip content="List View" placement="top">
                <Button
                  isIconOnly
                  startContent={<Icon icon="hugeicons:task-01" width={17} />}
                  variant={displayStyle === "list" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("list");
                    setPage(1);
                  }}
                />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>

        <Spacer y={2} />

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
          <Pagination
            showControls
            isDisabled={loading}
            page={safePage}
            total={totalPages}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      </CardBody>
    </Card>
  );
}
