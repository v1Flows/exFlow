import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  ButtonGroup,
  Chip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React from "react";

import CreateProjectTokenModal from "@/components/modals/projects/createToken";
import DeleteProjectTokenModal from "@/components/modals/projects/deleteToken";
import ChangeProjectTokenStatusModal from "@/components/modals/projects/changeTokenStatus";
import DeleteRunnerTokenModal from "@/components/modals/tokens/deleteRunnerToken";
import canEditProject from "@/lib/functions/canEditProject";

export default function ProjectTokens({
  tokens,
  project,
  settings,
  user,
}: any) {
  const [targetToken, setTargetToken] = React.useState({} as any);

  // project tokens
  const addProjectTokenModal = useDisclosure();
  const deleteProjectTokenModal = useDisclosure();
  const changeProjectTokenStatusModal = useDisclosure();

  const deleteTokenModal = useDisclosure();

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
    addToast({
      title: "Token",
      description: "Token copied to clipboard",
      color: "success",
      variant: "flat",
    });
  };

  const renderCell = React.useCallback((key: any, columnKey: any) => {
    const cellValue = key[columnKey];

    switch (columnKey) {
      case "actions":
        return (
          <ButtonGroup variant="light">
            <Tooltip content="Copy to Clipboard">
              <Button
                isIconOnly
                isDisabled={
                  (!canEditProject(user.id, project.members) ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                onPress={() => {
                  copyTokentoClipboard(key.key);
                }}
              >
                <Icon icon="hugeicons:copy-02" width={20} />
              </Button>
            </Tooltip>
            {!key.disabled && (
              <Tooltip content="Disable">
                <Button
                  isIconOnly
                  color="danger"
                  isDisabled={
                    (!canEditProject(user.id, project.members) ||
                      project.disabled) &&
                    user.role !== "admin"
                  }
                  onPress={() => {
                    key.disabled = true;
                    setTargetToken(key);
                    changeProjectTokenStatusModal.onOpen();
                  }}
                >
                  <Icon icon="hugeicons:square-lock-01" width={20} />
                </Button>
              </Tooltip>
            )}
            {key.disabled && (
              <Tooltip content="Enable">
                <Button
                  isIconOnly
                  color="success"
                  isDisabled={
                    (!canEditProject(user.id, project.members) ||
                      project.disabled) &&
                    user.role !== "admin"
                  }
                  onPress={() => {
                    key.disabled = false;
                    setTargetToken(key);
                    changeProjectTokenStatusModal.onOpen();
                  }}
                >
                  <Icon icon="hugeicons:square-unlock-01" width={20} />
                </Button>
              </Tooltip>
            )}
            <Tooltip color="danger" content="Delete">
              <Button
                isIconOnly
                color="danger"
                isDisabled={
                  (!canEditProject(user.id, project.members) ||
                    project.disabled) &&
                  user.role !== "admin"
                }
                onPress={() => {
                  setTargetToken(key);
                  if (key.type === "project") {
                    deleteProjectTokenModal.onOpen();
                  } else if (key.type === "runner") {
                    deleteTokenModal.onOpen();
                  }
                }}
              >
                <Icon icon="hugeicons:delete-02" width={20} />
              </Button>
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
              radius="sm"
              size="sm"
              variant="flat"
            >
              {key.disabled ? "Disabled" : "Active"}
            </Chip>
            {key.disabled && (
              <p className="text-sm text-default-400">{key.disabled_reason}</p>
            )}
          </div>
        );
      case "type":
        return <p>{key.type}</p>;
      default:
        return cellValue;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col items-end justify-center gap-4">
        <Button
          color="primary"
          isDisabled={
            (!canEditProject(user.id, project.members) ||
              !settings.create_api_keys ||
              project.disabled) &&
            user.role !== "admin"
          }
          startContent={<Icon icon="hugeicons:plus-sign" width={18} />}
          onPress={() => addProjectTokenModal.onOpen()}
        >
          Generate Token
        </Button>
      </div>
    );
  }, []);

  return (
    <div>
      <Table
        aria-label="Example table with custom cells"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              showControls
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
        topContent={topContent}
      >
        <TableHeader>
          <TableColumn key="id" align="start">
            ID
          </TableColumn>
          <TableColumn key="description" align="center">
            Description
          </TableColumn>
          <TableColumn key="status" align="center">
            Status
          </TableColumn>
          <TableColumn key="type" align="center">
            Type
          </TableColumn>
          <TableColumn key="expires_at" align="center">
            Expires At
          </TableColumn>
          <TableColumn key="created_at" align="center">
            Created At
          </TableColumn>
          <TableColumn key="actions" align="center">
            Actions
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
      <CreateProjectTokenModal
        disclosure={addProjectTokenModal}
        projectID={project.id}
      />
      <ChangeProjectTokenStatusModal
        disabled={targetToken.disabled}
        disclosure={changeProjectTokenStatusModal}
        projectID={project.id}
        token={targetToken}
      />
      <DeleteProjectTokenModal
        disclosure={deleteProjectTokenModal}
        projectID={project.id}
        token={targetToken}
      />

      {/* Runner Token */}
      <DeleteRunnerTokenModal
        disclosure={deleteTokenModal}
        token={targetToken}
      />
    </div>
  );
}
