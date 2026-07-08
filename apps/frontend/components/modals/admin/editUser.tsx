"use client";
import {
  Button,
  Description,
  FieldError,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import UpdateUser from "@/lib/fetch/admin/PUT/UpdateUser";
import ErrorCard from "@/components/error/ErrorCard";
export default function AdminEditUserModal({
  user,
  disclosure,
}: {
  user: any;
  disclosure: UseOverlayStateReturn;
}) {
  const router = useRouter();
  const { isOpen, setOpen: onOpenChange, close: onClose } = disclosure;
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  // loading
  const [isLoading, setIsLoading] = React.useState(false);
  useEffect(() => {
    if (user !== null) {
      setUsername(user.username);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);
  async function editUser() {
    setIsLoading(true);
    const response = (await UpdateUser(
      user.id,
      username,
      email,
      role ? role : user.role,
      password,
    )) as any;
    if (!response) {
      setError(true);
      setErrorText("Failed to update user");
      setErrorMessage("Failed to update user");
      setIsLoading(false);
      toast.danger("User", { description: "Failed to update user" });
      return;
    }
    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      router.refresh();
      onOpenChange(false);
      toast.success("User", { description: "User updated successfully" });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      toast.danger("User", { description: "Failed to update user" });
    }
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col gap-2">
                        <p className="text-lg font-bold">Edit User</p>
                        <p className="text-sm text-muted">
                          Edit the user details below and click apply changes to
                          save.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <TextField
                      isRequired
                      value={username}
                      onChange={setUsername}
                    >
                      <Label>{"Username"}</Label>
                      <InputGroup>
                        <InputGroup.Input placeholder="Enter the username" type="name" />
                      </InputGroup>
                    </TextField>
                    <TextField isRequired value={email} onChange={setEmail}>
                      <Label>{"Email"}</Label>
                      <InputGroup>
                        <InputGroup.Input placeholder="Enter the email" type="email" />
                      </InputGroup>
                    </TextField>
                    <Select
                      selectedKey={role}
                      isRequired
                      placeholder="Select the user role"
                      onSelectionChange={(key) => setRole(String(key ?? ""))}
                    >
                      <Label>{"Role"}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item key="user" id="user" textValue="User">
                            User
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="editor"
                            id="editor"
                            textValue="Editor"
                          >
                            Editor
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                          <ListBox.Item
                            key="admin"
                            id="admin"
                            textValue="Admin"
                          >
                            Admin
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <TextField
                      isRequired
                      value={password}
                      onChange={setPassword}
                    >
                      <Label>{"Password"}</Label>
                      <InputGroup>
                        <InputGroup.Input
                          placeholder="Enter the new password."
                          type="password"
                        />
                      </InputGroup>
                      <Description>
                        {"Leave blank to keep the same password."}
                      </Description>
                    </TextField>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isLoading}
                      variant="primary"
                      onPress={editUser}
                    >
                      {<Icon icon="hugeicons:floppy-disk" width={18} />}
                      Save Changes
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
