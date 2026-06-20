"use client";
import { PagePagination } from "@/components/ui/page-pagination";
import { CopySnippet } from "@/components/ui/copy-snippet";
import { Icon } from "@iconify/react";
import {
  Avatar,
  Button,
  Chip,
  Dropdown,
  Header,
  Table,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import DeleteProjectModal from "@/components/modals/projects/delete";
import EditProjectModal from "@/components/modals/projects/edit";
import ChangeProjectStatusModal from "@/components/modals/projects/changeStatus";
export function AdminProjectList({ projects }: any) {
  const router = useRouter();
  const [status, setStatus] = React.useState(false);
  const [targetProject, setTargetProject] = React.useState({});
  const changeStatusModal = useOverlayState();
  const editProjectModal = useOverlayState();
  const deleteProjectModal = useOverlayState();
  // pagination
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 7;
  const pages = Math.ceil(projects.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return projects.slice(start, end);
  }, [page, projects]);
  const renderCell = React.useCallback((project: any, columnKey: any) => {
    const cellValue = project[columnKey];
    switch (columnKey) {
      case "icon":
        return (
          <div
            className="shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(45deg, ${project.color} 0%, ${project.color} 100%)`,
            }}
          >
            <Icon className="text-xl" icon={project.icon} />
          </div>
        );
      case "name":
        return (
          <div>
            <p className="font-bold">{project.name}</p>
            <p className="text-sm text-muted">{project.description}</p>
          </div>
        );
      case "id":
        return <CopySnippet showPrompt={false}>{project.id}</CopySnippet>;
      case "members":
        return (
          <div className="flex -space-x-2">
            {project.members.map((member: any) => (
              <Tooltip key={member.email}>
                <Tooltip.Trigger>
                  <Avatar>
                    <Avatar.Fallback>
                      {String("").slice(0, 2).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  {
                    <div className="px-1 py-2">
                      <div className="text-sm font-bold">{member.email}</div>
                      <div className="text-xs">{member.role}</div>
                    </div>
                  }
                </Tooltip.Content>
              </Tooltip>
            ))}
          </div>
        );
      case "shared_runners":
        return (
          <Chip
            className="capitalize"
            color={project.shared_runners ? "success" : "danger"}
          >
            <Chip.Label>
              {project.shared_runners ? "Enabled" : "Disabled"}
            </Chip.Label>
          </Chip>
        );
      case "auto_runners":
        return (
          <Chip
            className="capitalize"
            color={project.enable_auto_runners ? "success" : "danger"}
          >
            <Chip.Label>
              {project.enable_auto_runners ? "Enabled" : "Disabled"}
            </Chip.Label>
          </Chip>
        );
      case "runner_join":
        return (
          <Chip
            className="capitalize"
            color={project.disable_runner_join ? "danger" : "success"}
          >
            <Chip.Label>
              {project.disable_runner_join ? "Disabled" : "Enabled"}
            </Chip.Label>
          </Chip>
        );
      case "status":
        return (
          <div>
            <Chip
              className="capitalize"
              color={project.disabled ? "danger" : "success"}
            >
              <Chip.Label>
                {project.disabled ? "Disabled" : "Active"}
              </Chip.Label>
            </Chip>
            {project.disabled && (
              <p className="text-sm text-muted">{project.disabled_reason}</p>
            )}
          </div>
        );
      case "created_at":
        return new Date(project.created_at).toLocaleString("de-DE");
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
                      onPress={() => router.push(`/projects/${project.id}`)}
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
                        setTargetProject(project);
                        editProjectModal.open();
                      }}
                      textValue="Edit"
                    >
                      {<Icon icon="hugeicons:pencil-edit-02" width={20} />}
                      Edit
                    </Dropdown.Item>
                    {project.disabled && (
                      <Dropdown.Item
                        key="enable"
                        id="enable"
                        onPress={() => {
                          setTargetProject(project);
                          setStatus(false);
                          changeStatusModal.open();
                        }}
                        textValue="Enable"
                      >
                        {<Icon icon="hugeicons:square-unlock-01" width={20} />}
                        Enable
                      </Dropdown.Item>
                    )}
                    {!project.disabled && (
                      <Dropdown.Item
                        key="disable"
                        id="disable"
                        onPress={() => {
                          setTargetProject(project);
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
                        setTargetProject(project);
                        deleteProjectModal.open();
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
              <Table.Column key="icon" id="icon" className="text-start">
                Icon
              </Table.Column>
              <Table.Column key="name" id="name" className="text-center">
                Name
              </Table.Column>
              <Table.Column key="status" id="status" className="text-center">
                Status
              </Table.Column>
              <Table.Column key="members" id="members" className="text-center">
                Members
              </Table.Column>
              <Table.Column
                key="shared_runners"
                id="shared_runners"
                className="text-center"
              >
                Shared Runners
              </Table.Column>
              <Table.Column
                key="auto_runners"
                id="auto_runners"
                className="text-center"
              >
                Auto Runners
              </Table.Column>
              <Table.Column
                key="runner_join"
                id="runner_join"
                className="text-center"
              >
                Runner Join
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
      <ChangeProjectStatusModal
        disclosure={changeStatusModal}
        project={targetProject}
        status={status}
      />
      <EditProjectModal disclosure={editProjectModal} project={targetProject} />
      <DeleteProjectModal
        disclosure={deleteProjectModal}
        project={targetProject}
      />
    </main>
  );
}
