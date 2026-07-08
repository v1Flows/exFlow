"use client";
import { PagePagination } from "@/components/ui/page-pagination";
import { CopySnippet } from "@/components/ui/copy-snippet";
import { Icon } from "@iconify/react";
import {
  Avatar,
  Button,
  Chip,
  Description,
  Dropdown,
  FieldError,
  Header,
  InputGroup,
  Label,
  Modal,
  Table,
  TextField,
  toast,
  useOverlayState,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import UpdateUserStatus from "@/lib/fetch/admin/PUT/UpdateUserState";
import AdminDeleteUserModal from "@/components/modals/admin/deleteUser";
import AdminEditUserModal from "@/components/modals/admin/editUser";
export function AdminUsersList({ users }: any) {
  const router = useRouter();
  const { isOpen, setOpen: onOpenChange } = useOverlayState();
  const [disableReason, setDisableReason] = React.useState("");
  const [isDisableLoading, setIsDisableLoading] = React.useState(false);
  const [userID, setUserID] = React.useState("");
  const [disableUser, setDisableUser] = React.useState(false);
  const [targetUser, setTargetUser] = React.useState<any>(null);
  const editUserModal = useOverlayState();
  const deleteUserModal = useOverlayState();
  React.useEffect(() => {
    if (userID !== "" && !disableUser) {
      changeUserStatus();
    }
  }, [userID, disableUser]);
  function roleColor(role: string) {
    switch (role) {
      case "admin":
        return "danger";
      case "editor":
        return "primary";
      case "vip":
        return "warning";
      default:
        return "text";
    }
  }
  function handleEditUser(user: any) {
    setTargetUser(user);
    editUserModal.open();
  }
  function handleDeleteUser(user: any) {
    setTargetUser(user);
    deleteUserModal.open();
  }
  function changeUserStatusModal(userID: string, disabled: boolean) {
    setUserID(userID);
    setDisableUser(disabled);
    if (disabled) {
      onOpenChange(false);
    }
  }
  async function changeUserStatus() {
    if (!disableUser) {
      const res = await UpdateUserStatus(userID, disableUser, "");
      if (res.success) {
        setUserID("");
        router.refresh();
        toast.success("", {
          description: "status updated successfully",
        });
      } else {
        router.refresh();
        toast.danger("", { description: "Failed to update user status" });
      }
    } else {
      setIsDisableLoading(true);
      const res = await UpdateUserStatus(userID, disableUser, disableReason);
      if (res.success) {
        setIsDisableLoading(false);
        setDisableReason("");
        setUserID("");
        setDisableUser(false);
        onOpenChange(false);
        router.refresh();
        toast.success("", {
          description: "status updated successfully",
        });
      } else {
        setIsDisableLoading(false);
        router.refresh();
        toast.danger("", { description: "Failed to update user status" });
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
          <div className={`flex items-center gap-3 ${""}`}>
            <Avatar>
              <Avatar.Fallback>
                {String("").slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate">{cellValue}</div>
              <div className="truncate text-sm text-muted">{user.email}</div>
            </div>
          </div>
        );
      case "id":
        return <CopySnippet showPrompt={false}>{cellValue}</CopySnippet>;
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
            >
              <Chip.Label>{user.disabled ? "Disabled" : "Active"}</Chip.Label>
            </Chip>
            {user.disabled && (
              <p className="text-sm text-muted">{user.disabled_reason}</p>
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
                    <Header>{"Edit Zone"}</Header>
                    <Dropdown.Item
                      key="edit"
                      id="edit"
                      onPress={() => handleEditUser(user)}
                      textValue="Edit"
                    >
                      {<Icon icon="hugeicons:pencil-edit-02" width={20} />}
                      Edit
                    </Dropdown.Item>
                    {!user.disabled && (
                      <Dropdown.Item
                        key="disable"
                        id="disable"
                        onPress={() => changeUserStatusModal(user.id, true)}
                        className="text-danger"
                        textValue="Disable"
                      >
                        {<Icon icon="hugeicons:square-lock-01" width={20} />}
                        Disable
                      </Dropdown.Item>
                    )}
                    {user.disabled && (
                      <Dropdown.Item
                        key="enable"
                        id="enable"
                        onPress={() => changeUserStatusModal(user.id, false)}
                        textValue="Enable"
                      >
                        {<Icon icon="hugeicons:square-unlock-01" width={20} />}
                        Enable
                      </Dropdown.Item>
                    )}
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Header>{"Danger Zone"}</Header>
                    <Dropdown.Item
                      key="delete"
                      id="delete"
                      className="text-danger"
                      onPress={() => handleDeleteUser(user)}
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
              <Table.Column key="username" id="username" className="text-start">
                name
              </Table.Column>
              <Table.Column key="role" id="role" className="text-center">
                Role
              </Table.Column>
              <Table.Column
                key="disabled"
                id="disabled"
                className="text-center"
              >
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
      <div>
        <Modal>
          <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container placement="top">
              <Modal.Dialog>
                {({ close: onClose }) => (
                  <>
                    <Modal.Header className="flex flex-wrap items-center justify-center gap-2 font-bold text-danger">
                      <Modal.Heading>
                        <Icon icon="hugeicons:user-block-01" /> Disable{" "}
                      </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <TextField
                        value={disableReason}
                        onChange={setDisableReason}
                      >
                        <Label>{"Disable Reason"}</Label>
                        <InputGroup>
                          <InputGroup.Input placeholder="Enter the reason for disabling this user" />
                        </InputGroup>
                      </TextField>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button onPress={onClose}>Cancel</Button>
                      <Button
                        isPending={isDisableLoading}
                        onPress={changeUserStatus}
                        variant="danger"
                      >
                        Disable
                      </Button>
                    </Modal.Footer>
                  </>
                )}
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
      <AdminEditUserModal disclosure={editUserModal} user={targetUser} />
      <AdminDeleteUserModal disclosure={deleteUserModal} user={targetUser} />
    </main>
  );
}
