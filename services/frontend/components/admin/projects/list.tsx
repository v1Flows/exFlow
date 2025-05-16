"use client";
import { Icon } from "@iconify/react";
import {
  Avatar,
  AvatarGroup,
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
  Tooltip,
  useDisclosure,
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
  const changeStatusModal = useDisclosure();
  const editProjectModal = useDisclosure();
  const deleteProjectModal = useDisclosure();

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
            className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center"
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
            <p className="text-sm text-default-500">{project.description}</p>
          </div>
        );
      case "id":
        return (
          <Snippet hideSymbol size="sm" variant="flat">
            {project.id}
          </Snippet>
        );
      case "members":
        return (
          <AvatarGroup isBordered max={5} radius="lg">
            {project.members.map((member: any) => (
              <Tooltip
                key={member.email}
                content={
                  <div className="px-1 py-2">
                    <div className="text-small font-bold">{member.email}</div>
                    <div className="text-tiny">{member.role}</div>
                  </div>
                }
              >
                <Avatar
                  color={
                    member.role === "Owner"
                      ? "danger"
                      : member.role === "Editor"
                        ? "primary"
                        : "default"
                  }
                  name={member.email}
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        );
      case "shared_runners":
        return (
          <Chip
            className="capitalize"
            color={project.shared_runners ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {project.shared_runners ? "Enabled" : "Disabled"}
          </Chip>
        );
      case "auto_runners":
        return (
          <Chip
            className="capitalize"
            color={project.enable_auto_runners ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {project.enable_auto_runners ? "Enabled" : "Disabled"}
          </Chip>
        );
      case "runner_join":
        return (
          <Chip
            className="capitalize"
            color={project.disable_runner_join ? "danger" : "success"}
            size="sm"
            variant="flat"
          >
            {project.disable_runner_join ? "Disabled" : "Enabled"}
          </Chip>
        );
      case "status":
        return (
          <div>
            <Chip
              className="capitalize"
              color={project.disabled ? "danger" : "success"}
              radius="sm"
              size="sm"
              variant="flat"
            >
              {project.disabled ? "Disabled" : "Active"}
            </Chip>
            {project.disabled && (
              <p className="text-sm text-default-400">
                {project.disabled_reason}
              </p>
            )}
          </div>
        );
      case "created_at":
        return new Date(project.created_at).toLocaleString("de-DE");
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
                    onPress={() => router.push(`/projects/${project.id}`)}
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
                      setTargetProject(project);
                      editProjectModal.onOpen();
                    }}
                  >
                    Edit
                  </DropdownItem>
                  {project.disabled && (
                    <DropdownItem
                      key="enable"
                      color="success"
                      startContent={
                        <Icon icon="hugeicons:square-unlock-01" width={20} />
                      }
                      onPress={() => {
                        setTargetProject(project);
                        setStatus(false);
                        changeStatusModal.onOpen();
                      }}
                    >
                      Enable
                    </DropdownItem>
                  )}
                  {!project.disabled && (
                    <DropdownItem
                      key="disable"
                      color="danger"
                      startContent={
                        <Icon icon="hugeicons:square-lock-01" width={20} />
                      }
                      onPress={() => {
                        setTargetProject(project);
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
                      setTargetProject(project);
                      deleteProjectModal.onOpen();
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
          <TableColumn key="icon" align="start">
            Icon
          </TableColumn>
          <TableColumn key="name" align="center">
            Name
          </TableColumn>
          <TableColumn key="status" align="center">
            Status
          </TableColumn>
          <TableColumn key="members" align="center">
            Members
          </TableColumn>
          <TableColumn key="shared_runners" align="center">
            Shared Runners
          </TableColumn>
          <TableColumn key="auto_runners" align="center">
            Auto Runners
          </TableColumn>
          <TableColumn key="runner_join" align="center">
            Runner Join
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
