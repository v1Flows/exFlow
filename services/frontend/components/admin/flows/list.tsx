"use client";
import { Icon } from "@iconify/react";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Pagination,
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import EditFlowModal from "@/components/modals/flows/edit";
import ChangeFlowStatusModal from "@/components/modals/flows/changeStatus";
import ChangeFlowMaintenanceModal from "@/components/modals/flows/changeMaintenance";
import CreateFlowModal from "@/components/modals/flows/create";
import DeleteFlowModal from "@/components/modals/flows/delete";
import DeleteFolderModal from "@/components/modals/folders/delete";
import UpdateFolderModal from "@/components/modals/folders/update";

export function AdminFlowsList({ flows, folders, projects, runners }: any) {
  const router = useRouter();

  const [status, setStatus] = React.useState(false);
  const [maintenance, setMaintenance] = React.useState(false);
  const [targetFlow, setTargetFlow] = React.useState({} as any);
  const [targetFolder, setTargetFolder] = React.useState({} as any);
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const changeMaintenanceModal = useDisclosure();
  const changeStatusModal = useDisclosure();
  const deleteModal = useDisclosure();

  const editFolderModal = useDisclosure();
  const deleteFolderModal = useDisclosure();

  // flow pagination
  const [flowPage, setFlowPage] = React.useState(1);
  const flowRowsPerPage = 7;
  const flowPages = Math.ceil(flows.length / flowRowsPerPage);
  const flowItems = React.useMemo(() => {
    const start = (flowPages - 1) * flowRowsPerPage;
    const end = start + flowRowsPerPage;

    return flows.slice(start, end);
  }, [flowPage, flows]);

  // folder pagination
  const [folderPage, setFolderPage] = React.useState(1);
  const folderRowsPerPage = 7;
  const folderPages = Math.ceil(folders.length / folderRowsPerPage);
  const folderItems = React.useMemo(() => {
    const start = (folderPages - 1) * folderRowsPerPage;
    const end = start + folderRowsPerPage;

    return folders.slice(start, end);
  }, [folderPage, folders]);

  const flowRenderCell = React.useCallback((flow: any, columnKey: any) => {
    const cellValue = flow[columnKey];

    switch (columnKey) {
      case "id":
        return (
          <Snippet hideSymbol size="sm" variant="flat">
            {cellValue}
          </Snippet>
        );
      case "name":
        return (
          <div>
            <p className="font-bold">{flow.name}</p>
            <p className="text-sm text-default-500">{flow.description}</p>
          </div>
        );
      case "folder":
        return (
          <div>
            <p>
              {folders.find((f: any) => f.id === flow.folder_id)?.name ||
                "None"}
            </p>
          </div>
        );
      case "project_id":
        return (
          <div>
            <p>{projects.find((p: any) => p.id === flow.project_id)?.name}</p>
            <p className="text-xs text-default-400">{flow.project_id}</p>
          </div>
        );
      case "runner_id":
        return (
          <div>
            {flow.runner_id !== "any" ? (
              <>
                <p>{runners.find((r: any) => r.id === flow.runner_id)?.name}</p>
                <p className="text-xs text-default-400">{flow.runner_id}</p>
              </>
            ) : (
              <p>Any</p>
            )}
          </div>
        );
      case "status":
        return (
          <div>
            <Chip
              className="capitalize"
              color={
                flow.disabled
                  ? "danger"
                  : flow.maintenance
                    ? "warning"
                    : "success"
              }
              radius="sm"
              size="sm"
              variant="flat"
            >
              {flow.disabled
                ? "Disabled"
                : flow.maintenance
                  ? "Maintenance"
                  : "Enabled"}
            </Chip>
            {flow.disabled && (
              <p className="text-sm text-default-400">{flow.disabled_reason}</p>
            )}
            {flow.maintenance && (
              <p className="text-sm text-default-400">
                {flow.maintenance_message}
              </p>
            )}
          </div>
        );
      case "created_at":
        return new Date(flow.created_at).toLocaleString("de-DE");
      case "updated_at":
        return new Date(flow.updated_at).toLocaleString("de-DE");
      case "actions":
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon
                    className="text-default-400"
                    icon="hugeicons:more-vertical-circle-01"
                    width={24}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu variant="flat">
                <DropdownSection showDivider title="Actions">
                  <DropdownItem
                    key="view"
                    startContent={<Icon icon="hugeicons:view" width={20} />}
                    onPress={() => router.push(`/flows/${flow.id}`)}
                  >
                    View
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Edit Zone">
                  <DropdownItem
                    key="edit"
                    color="warning"
                    startContent={
                      <Icon icon="hugeicons:pencil-edit-02" width={20} />
                    }
                    onPress={() => {
                      setTargetFlow(flow);
                      editModal.onOpen();
                    }}
                  >
                    Edit
                  </DropdownItem>
                  {flow.maintenance ? (
                    <DropdownItem
                      key="disable"
                      isDisabled
                      color="warning"
                      startContent={
                        <Icon icon="hugeicons:wrench-01" width={20} />
                      }
                      onPress={() => {
                        setTargetFlow(flow);
                        setMaintenance(false);
                        changeMaintenanceModal.onOpen();
                      }}
                    >
                      Remove Maintenance
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key="disable"
                      isDisabled
                      color="warning"
                      startContent={
                        <Icon icon="hugeicons:wrench-01" width={20} />
                      }
                      onPress={() => {
                        setTargetFlow(flow);
                        setMaintenance(true);
                        changeMaintenanceModal.onOpen();
                      }}
                    >
                      Set Maintenance
                    </DropdownItem>
                  )}
                  {flow.disabled && (
                    <DropdownItem
                      key="disable"
                      color="success"
                      startContent={
                        <Icon icon="hugeicons:square-unlock-01" width={20} />
                      }
                      onPress={() => {
                        setTargetFlow(flow);
                        setStatus(false);
                        changeStatusModal.onOpen();
                      }}
                    >
                      Enable
                    </DropdownItem>
                  )}
                  {!flow.disabled && (
                    <DropdownItem
                      key="disable"
                      color="danger"
                      startContent={
                        <Icon icon="hugeicons:square-lock-01" width={20} />
                      }
                      onPress={() => {
                        setTargetFlow(flow);
                        setStatus(true);
                        changeStatusModal.onOpen();
                      }}
                    >
                      Disable
                    </DropdownItem>
                  )}
                </DropdownSection>
                <DropdownSection title="Danger Zone">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={
                      <Icon icon="hugeicons:delete-02" width={20} />
                    }
                    onPress={() => {
                      setTargetFlow(flow);
                      deleteModal.onOpen();
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const folderRenderCell = React.useCallback((folder: any, columnKey: any) => {
    const cellValue = folder[columnKey];

    switch (columnKey) {
      case "id":
        return (
          <Snippet hideSymbol size="sm" variant="flat">
            {cellValue}
          </Snippet>
        );
      case "name":
        return (
          <div>
            <p className="font-bold">{folder.name}</p>
            <p className="text-sm text-default-500">{folder.description}</p>
          </div>
        );
      case "parent_folder":
        return (
          <div>
            <p>
              {folders.find((f: any) => f.id === folder.parent_id)?.name ||
                "None"}
            </p>
          </div>
        );
      case "project_id":
        return (
          <div>
            <p>{projects.find((p: any) => p.id === folder.project_id)?.name}</p>
            <p className="text-xs text-default-400">{folder.project_id}</p>
          </div>
        );
      case "created_at":
        return new Date(folder.created_at).toLocaleString("de-DE");
      case "actions":
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon
                    className="text-default-400"
                    icon="hugeicons:more-vertical-circle-01"
                    width={24}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu variant="flat">
                <DropdownSection showDivider title="Actions">
                  <DropdownItem
                    key="view"
                    startContent={<Icon icon="hugeicons:view" width={20} />}
                    onPress={() => router.push(`/flows?folder=${folder.id}`)}
                  >
                    View
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    color="warning"
                    startContent={
                      <Icon icon="hugeicons:pencil-edit-02" width={20} />
                    }
                    onPress={() => {
                      setTargetFolder(folder);
                      editFolderModal.onOpen();
                    }}
                  >
                    Edit
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Danger Zone">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={
                      <Icon icon="hugeicons:delete-02" width={20} />
                    }
                    onPress={() => {
                      setTargetFolder(folder);
                      deleteFolderModal.onOpen();
                    }}
                  >
                    Delete
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <main>
      <Table
        aria-label="Example table with custom cells"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              showControls
              page={flowPage}
              total={flowPages}
              onChange={(page) => setFlowPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="name" align="start">
            Name
          </TableColumn>
          <TableColumn key="folder" align="center">
            Folder
          </TableColumn>
          <TableColumn key="project_id" align="center">
            Project
          </TableColumn>
          <TableColumn key="runner_id" align="center">
            Runner
          </TableColumn>
          <TableColumn key="status" align="center">
            Status
          </TableColumn>
          <TableColumn key="created_at" align="center">
            Created At
          </TableColumn>
          <TableColumn key="updated_at" align="center">
            Updated At
          </TableColumn>
          <TableColumn key="id" align="center">
            ID
          </TableColumn>
          <TableColumn key="actions" align="center">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent="No rows to display." items={flowItems}>
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{flowRenderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <p className="text-2xl font-bold mb-4 mt-4">Folders</p>
      <Table
        aria-label="Example table with custom cells"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              showControls
              page={folderPage}
              total={folderPages}
              onChange={(page) => setFolderPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="name" align="start">
            Name
          </TableColumn>
          <TableColumn key="parent_folder" align="center">
            Parent Folder
          </TableColumn>
          <TableColumn key="project_id" align="center">
            Project
          </TableColumn>
          <TableColumn key="created_at" align="center">
            Created At
          </TableColumn>
          <TableColumn key="id" align="center">
            ID
          </TableColumn>
          <TableColumn key="actions" align="center">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent="No rows to display." items={folderItems}>
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{folderRenderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CreateFlowModal
        disclosure={createModal}
        folders={folders}
        projects={projects}
      />
      <EditFlowModal
        disclosure={editModal}
        folders={folders}
        projects={projects}
        targetFlow={targetFlow}
      />
      <ChangeFlowStatusModal
        disclosure={changeStatusModal}
        flow={targetFlow}
        status={status}
      />
      <ChangeFlowMaintenanceModal
        disclosure={changeMaintenanceModal}
        flow={targetFlow}
        maintenance={maintenance}
      />
      <DeleteFlowModal disclosure={deleteModal} flow={targetFlow} />

      <DeleteFolderModal disclosure={deleteFolderModal} folder={targetFolder} />
      <UpdateFolderModal
        disclosure={editFolderModal}
        folder={targetFolder}
        folders={folders}
        projects={projects}
      />
    </main>
  );
}
