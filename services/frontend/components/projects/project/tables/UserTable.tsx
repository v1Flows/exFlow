import { Icon } from "@iconify/react";
import {
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
  User,
} from "@heroui/react";
import React from "react";
import { useMediaQuery } from "usehooks-ts";

import EditProjectMemberModal from "@/components/modals/projects/editMember";
import LeaveProjectModal from "@/components/modals/projects/leave";
import AddProjectMemberModal from "@/components/modals/projects/members";
import ProjectTransferOwnership from "@/components/modals/projects/transferOwnership";
import DeleteProjectMemberModal from "@/components/modals/projects/removeMember";

const statusColorMap: any = {
  Owner: "danger",
  Editor: "primary",
  Viewer: "default",
};

export default function ProjectMembers({ project, settings, user }: any) {
  const addProjectMemberModal = useDisclosure();
  const editProjectMemberModal = useDisclosure();
  const leaveProjectModal = useDisclosure();
  const deleteProjectMemberModal = useDisclosure();
  const transferOwnershipModal = useDisclosure();

  const [targetUser, setTargetUser] = React.useState({});

  const isMobile = useMediaQuery("(max-width: 650px)");

  // pagination
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 7;
  const pages = Math.ceil(project.members.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return project.members.slice(start, end);
  }, [page, project]);

  const renderCell = React.useCallback((tableUser: any, columnKey: any) => {
    const cellValue = tableUser[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", name: tableUser.username }}
            description={tableUser.email}
            name={
              <div className="flex items-center gap-2">
                <p>{tableUser.username}</p>
                {tableUser.user_id === user.id && (
                  <Chip color="primary" radius="sm" size="sm" variant="flat">
                    You
                  </Chip>
                )}
              </div>
            }
          >
            {tableUser.user_id}
          </User>
        );
      case "role":
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[tableUser.role]}
            size="sm"
            variant="flat"
          >
            {cellValue}
          </Chip>
        );
      case "invite_pending":
        return (
          <Chip
            className="capitalize"
            color={tableUser.invite_pending ? "warning" : "success"}
            size="sm"
            variant="flat"
          >
            {tableUser.invite_pending ? "Pending" : "Accepted"}
          </Chip>
        );
      case "invited_at":
        return new Date(tableUser.invited_at).toLocaleString();
      case "actions":
        return (
          <ButtonGroup variant="light">
            <Tooltip content="Edit User">
              <Button
                isIconOnly
                isDisabled={checkViewerButtonDisabled()}
                onPress={() => {
                  setTargetUser(tableUser);
                  editProjectMemberModal.onOpen();
                }}
              >
                <Icon
                  className="text-default-400"
                  icon="hugeicons:pencil-edit-02"
                  width={20}
                />
              </Button>
            </Tooltip>
            <Tooltip color="danger" content="Remove User">
              <Button
                isIconOnly
                color="danger"
                isDisabled={
                  checkViewerButtonDisabled() || tableUser.user_id === user.id
                }
                onPress={() => {
                  setTargetUser(tableUser);
                  deleteProjectMemberModal.onOpen();
                }}
              >
                <Icon icon="hugeicons:delete-02" width={20} />
              </Button>
            </Tooltip>
          </ButtonGroup>
        );
      default:
        return cellValue;
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-wrap items-center justify-end gap-4">
        {checkLeaveProjectDisabled() ? (
          <Button
            color="danger"
            isDisabled={project.disabled}
            isIconOnly={isMobile}
            startContent={
              <Icon icon="solar:transfer-horizontal-line-duotone" width={20} />
            }
            variant="flat"
            onPress={() => transferOwnershipModal.onOpen()}
          >
            {isMobile ? "" : "Transfer Ownership"}
          </Button>
        ) : (
          <Button
            color="secondary"
            isDisabled={checkLeaveProjectDisabled()}
            isIconOnly={isMobile}
            startContent={
              <Icon icon="solar:undo-left-round-outline" width={20} />
            }
            variant="ghost"
            onPress={() => leaveProjectModal.onOpen()}
          >
            {isMobile ? "" : "Leave Project"}
          </Button>
        )}
        <Button
          color="primary"
          isDisabled={checkAddMemberDisabled()}
          isIconOnly={isMobile}
          startContent={<Icon icon="hugeicons:plus-sign" />}
          onPress={() => addProjectMemberModal.onOpen()}
        >
          {isMobile ? "" : "Add Member"}
        </Button>
      </div>
    );
  }, []);

  function checkAddMemberDisabled() {
    if (!settings.add_project_members) {
      return true;
    } else if (project.disabled) {
      return true;
    } else if (user.role === "vip") {
      return false;
    } else if (user.role === "admin") {
      return false;
    } else if (
      project.members.find((m: any) => m.user_id === user.id) &&
      project.members.filter((m: any) => m.user_id === user.id)[0].role ===
        "Viewer"
    ) {
      return true;
    }

    return false;
  }

  function checkLeaveProjectDisabled() {
    if (
      project.members.find((m: any) => m.user_id === user.id) &&
      project.members.filter((m: any) => m.user_id === user.id)[0].role ===
        "Owner"
    ) {
      return true;
    }

    return false;
  }

  function checkViewerButtonDisabled() {
    if (
      project.members.find((m: any) => m.user_id === user.id) &&
      project.members.filter((m: any) => m.user_id === user.id)[0].role ===
        "Viewer"
    ) {
      return true;
    }

    return false;
  }

  return (
    <>
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
        topContent={topContent}
      >
        <TableHeader>
          <TableColumn key="name" align="start">
            NAME
          </TableColumn>
          <TableColumn key="role" align="start">
            ROLE
          </TableColumn>
          <TableColumn key="invite_pending" align="start">
            Status
          </TableColumn>
          <TableColumn key="invited_at" align="start">
            Invited At
          </TableColumn>
          <TableColumn key="actions" align="center">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody emptyContent="No rows to display." items={items}>
          {(item: any) => (
            <TableRow key={item.user_id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <AddProjectMemberModal
        disclosure={addProjectMemberModal}
        project={project}
      />
      <EditProjectMemberModal
        disclosure={editProjectMemberModal}
        projectID={project.id}
        user={targetUser}
      />
      <LeaveProjectModal
        disclosure={leaveProjectModal}
        projectID={project.id}
      />
      <DeleteProjectMemberModal
        disclosure={deleteProjectMemberModal}
        projectID={project.id}
        user={targetUser}
      />
      <ProjectTransferOwnership
        disclosure={transferOwnershipModal}
        project={project}
        user={user}
      />
    </>
  );
}
