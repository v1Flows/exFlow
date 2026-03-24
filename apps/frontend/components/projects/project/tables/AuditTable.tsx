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
import { motion } from "framer-motion";

export default function ProjectAuditLogs({ audit, project, user }: any) {
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
                  {!project.members.find(
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
    <motion.div
      animate="visible"
      className="space-y-6"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.div
        className="flex flex-col items-start gap-2"
        variants={{
          hidden: { y: -10, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <h2 className="text-xl font-bold">Audit Logs</h2>
        <p className="text-small text-default-500">
          {audit.length} Audit Entries
        </p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Table
          aria-label="Project Audit Logs"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
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
            wrapper:
              "bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm min-h-[222px]",
            th: "bg-default-100/50 backdrop-blur-sm",
          }}
        >
          <TableHeader>
            <TableColumn key="user_id" align="start">
              User
            </TableColumn>
            <TableColumn key="operation" align="center">
              Operation
            </TableColumn>
            <TableColumn key="details" align="center">
              Details
            </TableColumn>
            <TableColumn key="id" align="center">
              ID
            </TableColumn>
            <TableColumn key="created_at" align="center">
              Created At
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
      </motion.div>
    </motion.div>
  );
}
