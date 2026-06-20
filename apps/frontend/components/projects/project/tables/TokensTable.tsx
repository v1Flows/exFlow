import { PagePagination } from "@/components/ui/page-pagination";
import { Icon } from "@iconify/react";
import {
  Button,
  ButtonGroup,
  Chip,
  Table,
  toast,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import React from "react";
import { motion } from "framer-motion";
import CreateProjectTokenModal from "@/components/modals/projects/createToken";
import DeleteProjectTokenModal from "@/components/modals/projects/deleteToken";
import ChangeProjectTokenStatusModal from "@/components/modals/projects/changeTokenStatus";
import DeleteRunnerTokenModal from "@/components/modals/tokens/deleteRunnerToken";
import canEditProject from "@/lib/functions/canEditProject";
export default function ProjectTokens({ tokens, project, user }: any) {
  const [targetToken, setTargetToken] = React.useState({} as any);
  // project tokens
  const addProjectTokenModal = useOverlayState();
  const deleteProjectTokenModal = useOverlayState();
  const changeProjectTokenStatusModal = useOverlayState();
  const deleteTokenModal = useOverlayState();
  // pagination
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 7;
  const pages = Math.ceil(tokens.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return tokens.slice(start, end);
  }, [page, tokens]);
  const copyTokentoClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Token", { description: "Token copied to clipboard" });
  };
  const renderCell = React.useCallback((key: any, columnKey: any) => {
    const cellValue = key[columnKey];
    switch (columnKey) {
      case "actions":
        return (
          <ButtonGroup variant="ghost">
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isDisabled={
                    (!canEditProject(user.id, project.members) ||
                      project.disabled) &&
                    user.role !== "admin"
                  }
                  onPress={() => {
                    copyTokentoClipboard(key.key);
                  }}
                  className="aspect-square p-0"
                >
                  <Icon icon="hugeicons:copy-02" width={20} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{"Copy to Clipboard"}</Tooltip.Content>
            </Tooltip>
            {!key.disabled && (
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    isDisabled={
                      (!canEditProject(user.id, project.members) ||
                        project.disabled) &&
                      user.role !== "admin"
                    }
                    onPress={() => {
                      key.disabled = true;
                      setTargetToken(key);
                      changeProjectTokenStatusModal.open();
                    }}
                    variant="danger"
                    className="aspect-square p-0"
                  >
                    <Icon icon="hugeicons:square-lock-01" width={20} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{"Disable"}</Tooltip.Content>
              </Tooltip>
            )}
            {key.disabled && (
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    isDisabled={
                      (!canEditProject(user.id, project.members) ||
                        project.disabled) &&
                      user.role !== "admin"
                    }
                    onPress={() => {
                      key.disabled = false;
                      setTargetToken(key);
                      changeProjectTokenStatusModal.open();
                    }}
                    className="aspect-square p-0"
                  >
                    <Icon icon="hugeicons:square-unlock-01" width={20} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>{"Enable"}</Tooltip.Content>
              </Tooltip>
            )}
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isDisabled={
                    (!canEditProject(user.id, project.members) ||
                      project.disabled) &&
                    user.role !== "admin"
                  }
                  onPress={() => {
                    setTargetToken(key);
                    if (key.type === "project") {
                      deleteProjectTokenModal.open();
                    } else if (key.type === "runner") {
                      deleteTokenModal.open();
                    }
                  }}
                  variant="danger"
                  className="aspect-square p-0"
                >
                  <Icon icon="hugeicons:delete-02" width={20} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{"Delete"}</Tooltip.Content>
            </Tooltip>
          </ButtonGroup>
        );
      case "expires_at":
        return new Date(key.expires_at).toLocaleString();
      case "created_at":
        return new Date(key.created_at).toLocaleString();
      case "status":
        return (
          <div>
            <Chip
              className="capitalize"
              color={key.disabled ? "danger" : "success"}
              size="sm"
              variant="soft"
            >
              <Chip.Label>{key.disabled ? "Disabled" : "Active"}</Chip.Label>
            </Chip>
            {key.disabled && (
              <p className="text-sm text-muted">{key.disabled_reason}</p>
            )}
          </div>
        );
      case "type":
        return <p>{key.type}</p>;
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
        className="flex flex-wrap items-center justify-between gap-4"
        variants={{
          hidden: { y: -10, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold">Tokens</h2>
          <p className="text-sm text-muted">{tokens.length} Active Tokens</p>
        </div>
        <Button
          isDisabled={
            (!canEditProject(user.id, project.members) || project.disabled) &&
            user.role !== "admin"
          }
          size="sm"
          variant="primary"
          onPress={() => addProjectTokenModal.open()}
        >
          {<Icon icon="hugeicons:plus-sign" width={18} />}
          Create Token
        </Button>
      </motion.div>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Project Tokens">
              <Table.Header>
                <Table.Column key="name" id="name">
                  Name
                </Table.Column>
                <Table.Column key="key" id="key">
                  Key
                </Table.Column>
                <Table.Column key="status" id="status">
                  Status
                </Table.Column>
                <Table.Column key="created_at" id="created_at">
                  Created At
                </Table.Column>
                <Table.Column key="actions" id="actions" className="text-end">
                  Actions
                </Table.Column>
              </Table.Header>
              <Table.Body items={items}>
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

      <CreateProjectTokenModal
        disclosure={addProjectTokenModal}
        projectID={project.id}
      />
      <DeleteProjectTokenModal
        disclosure={deleteProjectTokenModal}
        projectID={project.id}
        token={targetToken}
      />
      <ChangeProjectTokenStatusModal
        disabled={targetToken?.disabled}
        disclosure={changeProjectTokenStatusModal}
        projectID={project.id}
        token={targetToken}
      />
      <DeleteRunnerTokenModal
        disclosure={deleteTokenModal}
        token={targetToken}
      />
    </motion.div>
  );
}
