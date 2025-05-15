"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
  User,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import UpdateUserStatus from "@/lib/fetch/admin/PUT/UpdateUserState";
import AdminDeleteUserModal from "@/components/modals/admin/deleteUser";
import AdminEditUserModal from "@/components/modals/admin/editUser";

export function AdminUsersList({ users }: any) {
  const router = useRouter();
  const { isOpen, onOpenChange } = useDisclosure();
  const [disableReason, setDisableReason] = React.useState("");
  const [isDisableLoading, setIsDisableLoading] = React.useState(false);

  const [userID, setUserID] = React.useState("");
  const [disableUser, setDisableUser] = React.useState(false);

  const [targetUser, setTargetUser] = React.useState<any>(null);
  const editUserModal = useDisclosure();
  const deleteUserModal = useDisclosure();

  React.useEffect(() => {
    if (userID !== "" && !disableUser) {
      changeUserStatus();
    }
  }, [userID, disableUser]);

  function roleColor(role: string) {
    switch (role) {
      case "admin":
        return "danger";
      case "vip":
        return "warning";
      default:
        return "text";
    }
  }

  function handleEditUser(user: any) {
    setTargetUser(user);
    editUserModal.onOpen();
  }

  function handleDeleteUser(user: any) {
    setTargetUser(user);
    deleteUserModal.onOpen();
  }

  function changeUserStatusModal(userID: string, disabled: boolean) {
    setUserID(userID);
    setDisableUser(disabled);

    if (disabled) {
      onOpenChange();
    }
  }

  async function changeUserStatus() {
    if (!disableUser) {
      const res = await UpdateUserStatus(userID, disableUser, "");

      if (res.success) {
        setUserID("");
        router.refresh();
        addToast({
          title: "User",
          description: "User status updated successfully",
          color: "success",
          variant: "flat",
        });
      } else {
        router.refresh();
        addToast({
          title: "User",
          description: "Failed to update user status",
          color: "danger",
          variant: "flat",
        });
      }
    } else {
      setIsDisableLoading(true);
      const res = await UpdateUserStatus(userID, disableUser, disableReason);

      if (res.success) {
        setIsDisableLoading(false);
        setDisableReason("");
        setUserID("");
        setDisableUser(false);
        onOpenChange();
        router.refresh();
        addToast({
          title: "User",
          description: "User status updated successfully",
          color: "success",
          variant: "flat",
        });
      } else {
        setIsDisableLoading(false);
        router.refresh();
        addToast({
          title: "User",
          description: "Failed to update user status",
          color: "danger",
          variant: "flat",
        });
      }
    }
  }

  // pagination
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 7;
  const pages = Math.ceil(users.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return users.slice(start, end);
  }, [page, users]);

  const renderCell = React.useCallback((user: any, columnKey: any) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "username":
        return (
          <User
            avatarProps={{
              radius: "lg",
              isBordered: true,
              name: user.username,
              color:
                user.role === "admin"
                  ? "danger"
                  : user.role === "vip"
                    ? "warning"
                    : "primary",
            }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "id":
        return (
          <Snippet hideSymbol size="sm" variant="flat">
            {cellValue}
          </Snippet>
        );
      case "role":
        return (
          <p
            className={`text-${roleColor(cellValue)} text-sm font-bold capitalize`}
          >
            {cellValue}
          </p>
        );
      case "disabled":
        return (
          <div>
            <Chip
              className="capitalize"
              color={user.disabled ? "danger" : "success"}
              radius="sm"
              size="sm"
              variant="flat"
            >
              {user.disabled ? "Disabled" : "Active"}
            </Chip>
            {user.disabled && (
              <p className="text-sm text-default-400">{user.disabled_reason}</p>
            )}
          </div>
        );
      case "created_at":
        return new Date(user.created_at).toLocaleString("de-DE");
      case "updated_at":
        return (
          <p>
            {user.updated_at
              ? new Date(user.updated_at).toLocaleString("de-DE")
              : "N/A"}
          </p>
        );
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
                <DropdownSection showDivider title="Edit Zone">
                  <DropdownItem
                    key="edit"
                    color="warning"
                    startContent={
                      <Icon icon="hugeicons:pencil-edit-02" width={20} />
                    }
                    onPress={() => handleEditUser(user)}
                  >
                    Edit
                  </DropdownItem>
                  {!user.disabled && (
                    <DropdownItem
                      key="disable"
                      color="danger"
                      startContent={
                        <Icon icon="hugeicons:square-lock-01" width={20} />
                      }
                      onPress={() => changeUserStatusModal(user.id, true)}
                    >
                      Disable
                    </DropdownItem>
                  )}
                  {user.disabled && (
                    <DropdownItem
                      key="enable"
                      color="success"
                      startContent={
                        <Icon icon="hugeicons:square-unlock-01" width={20} />
                      }
                      onPress={() => changeUserStatusModal(user.id, false)}
                    >
                      Enable
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
                    onPress={() => handleDeleteUser(user)}
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
              showShadow
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
          <TableColumn key="username" align="start">
            Username
          </TableColumn>
          <TableColumn key="role" align="center">
            Role
          </TableColumn>
          <TableColumn key="disabled" align="center">
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
        <TableBody items={items}>
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div>
        <Modal
          isOpen={isOpen}
          placement="top-center"
          onOpenChange={onOpenChange}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-wrap items-center justify-center gap-2 font-bold text-danger">
                  <Icon icon="hugeicons:user-block-01" /> Disable User
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Disable Reason"
                    placeholder="Enter the reason for disabling this user"
                    value={disableReason}
                    variant="bordered"
                    onValueChange={setDisableReason}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isDisableLoading}
                    onPress={changeUserStatus}
                  >
                    Disable
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <AdminEditUserModal disclosure={editUserModal} user={targetUser} />
      <AdminDeleteUserModal disclosure={deleteUserModal} user={targetUser} />
    </main>
  );
}
