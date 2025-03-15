import { Icon } from "@iconify/react";
import {
  Chip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  User,
} from "@heroui/react";
import React from "react";

export default function ProjectAuditLogs({ audit, members, user }: any) {
  // pagination
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(audit.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return audit.slice(start, end);
  }, [page, audit]);

  function operationColor(operation: string) {
    switch (operation) {
      case "create":
        return "success";
      case "update":
        return "warning";
      case "delete":
        return "danger";
      case "info":
        return "primary";
      default:
        return "default";
    }
  }

  const renderCell = React.useCallback((entry: any, columnKey: any) => {
    const cellValue = entry[columnKey];

    switch (columnKey) {
      case "user_id":
        return (
          <Tooltip
            content={
              <div>
                <p className="font-bold text-default-500">User ID</p>
                <p>{entry.user_id}</p>
              </div>
            }
          >
            <User
              avatarProps={{
                name: entry?.username,
              }}
              description={entry?.email}
              name={
                <div className="flex items-center gap-2">
                  <p>{entry?.username}</p>
                  {!members.find(
                    (member: any) => member.user_id === entry.user_id,
                  ) &&
                    entry?.role !== "admin" && (
                      <Tooltip content="User left the project">
                        <Icon icon="solar:ghost-outline" />
                      </Tooltip>
                    )}
                  {entry.user_id === user.id && (
                    <Chip color="primary" radius="sm" size="sm" variant="flat">
                      You
                    </Chip>
                  )}
                  {entry?.role === "admin" && (
                    <Chip color="danger" radius="sm" size="sm" variant="flat">
                      Admin
                    </Chip>
                  )}
                </div>
              }
            />
          </Tooltip>
        );
      case "operation":
        return (
          <Chip
            className="capitalize"
            color={operationColor(entry.operation)}
            radius="sm"
            size="sm"
            variant="flat"
          >
            {entry.operation}
          </Chip>
        );
      case "created_at":
        return new Date(entry.created_at).toLocaleString();
      default:
        return cellValue;
    }
  }, []);

  return (
    <div>
      <Table
        aria-label="Example table with custom cells"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="user_id" align="start">
            USER
          </TableColumn>
          <TableColumn key="operation" align="start">
            OPERATION
          </TableColumn>
          <TableColumn key="details" align="start">
            DETAILS
          </TableColumn>
          <TableColumn key="id" align="start">
            ID
          </TableColumn>
          <TableColumn key="created_at" align="start">
            CREATED AT
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent="No rows to display." items={items}>
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
