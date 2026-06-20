"use client";
import {
  Avatar,
  Button,
  Card,
  Description,
  Dropdown,
  FieldError,
  Input,
  InputGroup,
  Label,
  Modal,
  type Selection,
  Separator,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import AddProjectMember from "@/lib/fetch/project/POST/AddProjectMember";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import Cell from "./user-cell";
export default function AddProjectMemberModal({
  disclosure,
  project,
}: {
  disclosure: UseOverlayStateReturn;
  project: any;
}) {
  const { refreshProject } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const [email, setEmail] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
    new Set(["Viewer"]),
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const statusColorMap: any = {
    Owner: "danger",
    Editor: "primary",
    Viewer: "default",
  };
  const permissionLabels: Record<string, string> = {
    Owner: "Owner",
    Viewer: "Can View",
    Editor: "Can Edit",
  };
  // Memoize the user list to avoid re-rendering when changing the selected keys
  const userList = React.useMemo(
    () => (
      <div className="mt-2 flex flex-col gap-2">
        {project.members.map((member: any) => (
          <div key={member.user_id}>
            <Cell
              key={member.user_id}
              ref={null}
              avatar={member.username}
              color={statusColorMap[member.role]}
              name={member.username}
              permission={permissionLabels[member.role]}
            />
            <Separator className="m-1" />
          </div>
        ))}
      </div>
    ),
    [],
  );
  async function inviteMember() {
    const role = Array.from(selectedKeys)[0];
    setIsLoading(true);
    const res = (await AddProjectMember(
      project.id,
      email,
      role.toString(),
    )) as any;
    if (!res) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      toast.success("Project", { description: "Member invited successfully" });
      return;
    }
    if (res.success) {
      setIsLoading(false);
      setEmail("");
      setError(false);
      setErrorText("");
      setErrorMessage("");
      onOpenChange(false);
      refreshProject(project.id);
      toast.success("Project", { description: "Member invited successfully" });
    } else {
      setIsLoading(false);
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      toast.danger("Project", { description: res.error });
    }
  }
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog>
            {() => (
              <Modal.Body>
                <Card className="w-full bg-transparent shadow-none">
                  <Card.Header className="justify-center px-6 pb-0 pt-6">
                    <div className="flex flex-col items-center">
                      <div className="flex -space-x-2">
                        {project.members.map((member: any) => (
                          <Avatar key={member.id}>
                            <Avatar.Fallback>
                              {String("").slice(0, 2).toUpperCase()}
                            </Avatar.Fallback>
                          </Avatar>
                        ))}
                      </div>
                      <div aria-hidden className="h-2" />
                      <h4 className="text-lg">Invite Member</h4>
                      <p className="text-center text-sm text-muted">
                        Invite a new member to your project.
                      </p>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div className="flex items-center gap-2">
                      <TextField value={email} onChange={setEmail}>
                        <Label>{"Email Address"}</Label>
                        <InputGroup>
                          <Input placeholder="Enter email address" />
                          <InputGroup.Suffix>
                            {
                              <Dropdown>
                                <Dropdown.Trigger>
                                  <Button
                                    className="text-muted"
                                    variant="ghost"
                                  >
                                    {Array.from(selectedKeys)
                                      .map((key) => permissionLabels[key])
                                      .join(", ")}
                                    {
                                      <span className="hidden sm:flex">
                                        <Icon icon="solar:alt-arrow-down-linear" />
                                      </span>
                                    }
                                  </Button>
                                </Dropdown.Trigger>
                                <Dropdown.Popover>
                                  <Dropdown.Menu
                                    selectedKeys={selectedKeys}
                                    selectionMode="single"
                                    onSelectionChange={setSelectedKeys}
                                  >
                                    <Dropdown.Item
                                      key="Viewer"
                                      id="Viewer"
                                      textValue="Can View"
                                    >
                                      {<Icon icon="solar:eye-linear" />}
                                      Can View
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                      key="Editor"
                                      id="Editor"
                                      textValue="Can Edit"
                                    >
                                      {<Icon icon="hugeicons:pencil-edit-02" />}
                                      Can Edit
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown.Popover>
                              </Dropdown>
                            }
                          </InputGroup.Suffix>
                        </InputGroup>
                        <Description>{"must have an account"}</Description>
                      </TextField>
                      <Button
                        isPending={isLoading}
                        size="md"
                        onPress={inviteMember}
                        variant="primary"
                      >
                        Invite
                      </Button>
                    </div>
                    <div aria-hidden className="h-4" />
                    {userList}
                  </Card.Content>
                  <Card.Footer className="justify-end gap-2">
                    <Button isDisabled>Copy Link</Button>
                  </Card.Footer>
                </Card>
              </Modal.Body>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
