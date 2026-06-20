"use client";
import { PagePagination } from "@/components/ui/page-pagination";
import { CopySnippet } from "@/components/ui/copy-snippet";
import { Icon } from "@iconify/react";
import {
  Button,
  Chip,
  Dropdown,
  Header,
  Table,
  useOverlayState,
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
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const changeMaintenanceModal = useOverlayState();
  const changeStatusModal = useOverlayState();
  const deleteModal = useOverlayState();
  const editFolderModal = useOverlayState();
  const deleteFolderModal = useOverlayState();
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
        return <CopySnippet showPrompt={false}>{cellValue}</CopySnippet>;
      case "name":
        return (
          <div>
            <p className="font-bold">{flow.name}</p>
            <p className="text-sm text-muted">{flow.description}</p>
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
            <p className="text-xs text-muted">{flow.project_id}</p>
          </div>
        );
      case "runner_id":
        return (
          <div>
            {flow.runner_id !== "any" ? (
              <>
                <p>{runners.find((r: any) => r.id === flow.runner_id)?.name}</p>
                <p className="text-xs text-muted">{flow.runner_id}</p>
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
            >
              <Chip.Label>
                {flow.disabled
                  ? "Disabled"
                  : flow.maintenance
                    ? "Maintenance"
                    : "Enabled"}
              </Chip.Label>
            </Chip>
            {flow.disabled && (
              <p className="text-sm text-muted">{flow.disabled_reason}</p>
            )}
            {flow.maintenance && (
              <p className="text-sm text-muted">{flow.maintenance_message}</p>
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
              <Dropdown.Trigger>
                <Button variant="ghost" className="aspect-square p-0">
                  <Icon
                    className="text-muted"
                    icon="hugeicons:more-vertical-circle-01"
                    width={24}
                  />
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Section>
                    <Header>{"Actions"}</Header>
                    <Dropdown.Item
                      key="view"
                      id="view"
                      onPress={() => router.push(`/flows/${flow.id}`)}
                      textValue="View"
                    >
                      {<Icon icon="hugeicons:view" width={20} />}
                      View
                    </Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Header>{"Edit Zone"}</Header>
                    <Dropdown.Item
                      key="edit"
                      id="edit"
                      onPress={() => {
                        setTargetFlow(flow);
                        editModal.open();
                      }}
                      textValue="Edit"
                    >
                      {<Icon icon="hugeicons:pencil-edit-02" width={20} />}
                      Edit
                    </Dropdown.Item>
                    {flow.maintenance ? (
                      <Dropdown.Item
                        key="disable"
                        id="disable"
                        isDisabled
                        onPress={() => {
                          setTargetFlow(flow);
                          setMaintenance(false);
                          changeMaintenanceModal.open();
                        }}
                        textValue="Remove Maintenance"
                      >
                        {<Icon icon="hugeicons:wrench-01" width={20} />}
                        Remove Maintenance
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item
                        key="disable"
                        id="disable"
                        isDisabled
                        onPress={() => {
                          setTargetFlow(flow);
                          setMaintenance(true);
                          changeMaintenanceModal.open();
                        }}
                        textValue="Set Maintenance"
                      >
                        {<Icon icon="hugeicons:wrench-01" width={20} />}
                        Set Maintenance
                      </Dropdown.Item>
                    )}
                    {flow.disabled && (
                      <Dropdown.Item
                        key="disable"
                        id="disable"
                        onPress={() => {
                          setTargetFlow(flow);
                          setStatus(false);
                          changeStatusModal.open();
                        }}
                        textValue="Enable"
                      >
                        {<Icon icon="hugeicons:square-unlock-01" width={20} />}
                        Enable
                      </Dropdown.Item>
                    )}
                    {!flow.disabled && (
                      <Dropdown.Item
                        key="disable"
                        id="disable"
                        onPress={() => {
                          setTargetFlow(flow);
                          setStatus(true);
                          changeStatusModal.open();
                        }}
                        className="text-danger"
                        textValue="Disable"
                      >
                        {<Icon icon="hugeicons:square-lock-01" width={20} />}
                        Disable
                      </Dropdown.Item>
                    )}
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Header>{"Danger Zone"}</Header>
                    <Dropdown.Item
                      key="delete"
                      id="delete"
                      className="text-danger"
                      onPress={() => {
                        setTargetFlow(flow);
                        deleteModal.open();
                      }}
                      textValue="Delete"
                    >
                      {<Icon icon="hugeicons:delete-02" width={20} />}
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
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
        return <CopySnippet showPrompt={false}>{cellValue}</CopySnippet>;
      case "name":
        return (
          <div>
            <p className="font-bold">{folder.name}</p>
            <p className="text-sm text-muted">{folder.description}</p>
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
            <p className="text-xs text-muted">{folder.project_id}</p>
          </div>
        );
      case "created_at":
        return new Date(folder.created_at).toLocaleString("de-DE");
      case "actions":
        return (
          <div className="relative flex items-center justify-center gap-2">
            <Dropdown>
              <Dropdown.Trigger>
                <Button variant="ghost" className="aspect-square p-0">
                  <Icon
                    className="text-muted"
                    icon="hugeicons:more-vertical-circle-01"
                    width={24}
                  />
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Popover>
                <Dropdown.Menu>
                  <Dropdown.Section>
                    <Header>{"Actions"}</Header>
                    <Dropdown.Item
                      key="view"
                      id="view"
                      onPress={() => router.push(`/flows?folder=${folder.id}`)}
                      textValue="View"
                    >
                      {<Icon icon="hugeicons:view" width={20} />}
                      View
                    </Dropdown.Item>
                    <Dropdown.Item
                      key="edit"
                      id="edit"
                      onPress={() => {
                        setTargetFolder(folder);
                        editFolderModal.open();
                      }}
                      textValue="Edit"
                    >
                      {<Icon icon="hugeicons:pencil-edit-02" width={20} />}
                      Edit
                    </Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Header>{"Danger Zone"}</Header>
                    <Dropdown.Item
                      key="delete"
                      id="delete"
                      className="text-danger"
                      onPress={() => {
                        setTargetFolder(folder);
                        deleteFolderModal.open();
                      }}
                      textValue="Delete"
                    >
                      {<Icon icon="hugeicons:delete-02" width={20} />}
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  return (
    <main>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Example table with custom cells">
            <Table.Header>
              <Table.Column key="name" id="name" className="text-start">
                Name
              </Table.Column>
              <Table.Column key="folder" id="folder" className="text-center">
                Folder
              </Table.Column>
              <Table.Column
                key="project_id"
                id="project_id"
                className="text-center"
              >
                Project
              </Table.Column>
              <Table.Column
                key="runner_id"
                id="runner_id"
                className="text-center"
              >
                Runner
              </Table.Column>
              <Table.Column key="status" id="status" className="text-center">
                Status
              </Table.Column>
              <Table.Column
                key="created_at"
                id="created_at"
                className="text-center"
              >
                Created At
              </Table.Column>
              <Table.Column
                key="updated_at"
                id="updated_at"
                className="text-center"
              >
                Updated At
              </Table.Column>
              <Table.Column key="id" id="id" className="text-center">
                ID
              </Table.Column>
              <Table.Column key="actions" id="actions" className="text-center">
                Actions
              </Table.Column>
            </Table.Header>
            <Table.Body
              items={flowItems}
              renderEmptyState={() => "No rows to display."}
            >
              {(item: any) => (
                <Table.Row key={item.id} id={item.id}>
                  {(columnKey) => (
                    <Table.Cell>{flowRenderCell(item, columnKey)}</Table.Cell>
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
                page={flowPage}
                pageCount={flowPages}
                onPageChange={(page) => setFlowPage(page)}
              />
            </div>
          }
        </Table.Footer>
      </Table>

      <p className="text-2xl font-bold mb-4 mt-4">Folders</p>
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Example table with custom cells">
            <Table.Header>
              <Table.Column key="name" id="name" className="text-start">
                Name
              </Table.Column>
              <Table.Column
                key="parent_folder"
                id="parent_folder"
                className="text-center"
              >
                Parent Folder
              </Table.Column>
              <Table.Column
                key="project_id"
                id="project_id"
                className="text-center"
              >
                Project
              </Table.Column>
              <Table.Column
                key="created_at"
                id="created_at"
                className="text-center"
              >
                Created At
              </Table.Column>
              <Table.Column key="id" id="id" className="text-center">
                ID
              </Table.Column>
              <Table.Column key="actions" id="actions" className="text-center">
                Actions
              </Table.Column>
            </Table.Header>
            <Table.Body
              items={folderItems}
              renderEmptyState={() => "No rows to display."}
            >
              {(item: any) => (
                <Table.Row key={item.id} id={item.id}>
                  {(columnKey) => (
                    <Table.Cell>{folderRenderCell(item, columnKey)}</Table.Cell>
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
                page={folderPage}
                pageCount={folderPages}
                onPageChange={(page) => setFolderPage(page)}
              />
            </div>
          }
        </Table.Footer>
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
