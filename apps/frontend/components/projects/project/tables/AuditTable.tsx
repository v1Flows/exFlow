import { PagePagination } from "@/components/ui/page-pagination";
import { Icon } from "@iconify/react";
import { Avatar, Chip, Table, Tooltip } from "@heroui/react";
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
        return "accent";
      default:
        return "default";
    }
  }
  const renderCell = React.useCallback((entry: any, columnKey: any) => {
    const cellValue = entry[columnKey];
    switch (columnKey) {
      case "user_id":
        return (
          <Tooltip>
            <Tooltip.Trigger>
              <div className={`flex items-center gap-3 ${""}`}>
                <Avatar>
                  <Avatar.Fallback>
                    {String("").slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate">
                    {
                      <div className="flex items-center gap-2">
                        <p>{entry?.username}</p>
                        {!project.members.find(
                          (member: any) => member.user_id === entry.user_id,
                        ) &&
                          entry?.role !== "admin" && (
                            <Tooltip>
                              <Tooltip.Trigger>
                                <Icon icon="solar:ghost-outline" />
                              </Tooltip.Trigger>
                              <Tooltip.Content>
                                {"left the project"}
                              </Tooltip.Content>
                            </Tooltip>
                          )}
                        {entry.user_id === user.id && (
                          <Chip color="accent" size="sm" variant="soft">
                            <Chip.Label>You</Chip.Label>
                          </Chip>
                        )}
                        {entry?.role === "admin" && (
                          <Chip color="danger" size="sm" variant="soft">
                            <Chip.Label>Admin</Chip.Label>
                          </Chip>
                        )}
                      </div>
                    }
                  </div>
                  <div className="truncate text-sm text-muted">
                    {entry?.email}
                  </div>
                </div>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {
                <div>
                  <p className="font-bold text-muted">ID</p>
                  <p>{entry.user_id}</p>
                </div>
              }
            </Tooltip.Content>
          </Tooltip>
        );
      case "operation":
        return (
          <Chip
            className="capitalize"
            color={operationColor(entry.operation)}
            size="sm"
            variant="soft"
          >
            <Chip.Label>{entry.operation}</Chip.Label>
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
        <p className="text-sm text-muted">{audit.length} Audit Entries</p>
      </motion.div>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Project Audit Logs">
              <Table.Header>
                <Table.Column
                  key="user_id"
                  id="user_id"
                  className="text-start"
                ></Table.Column>
                <Table.Column
                  key="operation"
                  id="operation"
                  className="text-center"
                >
                  Operation
                </Table.Column>
                <Table.Column
                  key="details"
                  id="details"
                  className="text-center"
                >
                  Details
                </Table.Column>
                <Table.Column key="id" id="id" className="text-center">
                  ID
                </Table.Column>
                <Table.Column
                  key="created_at"
                  id="created_at"
                  className="text-center"
                >
                  Created At
                </Table.Column>
              </Table.Header>
              <Table.Body
                items={items}
                renderEmptyState={() => "No rows to display."}
              >
                {(item: any) => (
                  <Table.Row key={item.id} id={item.id}>
                    {(columnKey) => (
                      <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                    )}
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
          <Table.Footer>
            {
              <div className="flex w-full justify-center">
                <PagePagination
                  page={page}
                  pageCount={pages}
                  onPageChange={(page) => setPage(page)}
                />
              </div>
            }
          </Table.Footer>
        </Table>
      </motion.div>
    </motion.div>
  );
}
