"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
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
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange, onClose } = disclosure;

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState(new Set([]) as any);
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
      setRole(new Set([user.role]));
    }
  }, [user]);

  async function editUser() {
    setIsLoading(true);

    const response = (await UpdateUser(
      user.id,
      username,
      email,
      role.currentKey ? role.currentKey : user.role,
      password,
    )) as any;

    if (!response) {
      setError(true);
      setErrorText("Failed to update user");
      setErrorMessage("Failed to update user");
      setIsLoading(false);
      addToast({
        title: "User",
        description: "Failed to update user",
        color: "danger",
        variant: "flat",
      });

      return;
    }

    if (response.success) {
      setIsLoading(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      router.refresh();
      onOpenChange();
      addToast({
        title: "User",
        description: "User updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      addToast({
        title: "User",
        description: "Failed to update user",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Edit User</p>
                  <p className="text-sm text-default-500">
                    Edit the user details below and click apply changes to save.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  isRequired
                  label="Username"
                  labelPlacement="outside"
                  placeholder="Enter the username"
                  type="name"
                  value={username}
                  variant="flat"
                  onValueChange={setUsername}
                />
                <Input
                  isRequired
                  label="Email"
                  labelPlacement="outside"
                  placeholder="Enter the email"
                  type="email"
                  value={email}
                  variant="flat"
                  onValueChange={setEmail}
                />
                <Select
                  isRequired
                  label="Role"
                  labelPlacement="outside"
                  placeholder="Select the user role"
                  selectedKeys={role}
                  variant="flat"
                  onSelectionChange={setRole}
                >
                  <SelectItem key="user">User</SelectItem>
                  <SelectItem key="admin">Admin</SelectItem>
                </Select>
                <Input
                  isRequired
                  description="Leave blank to keep the same password."
                  label="Password"
                  labelPlacement="outside"
                  placeholder="Enter the new password."
                  type="password"
                  value={password}
                  variant="flat"
                  onValueChange={setPassword}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  startContent={
                    <Icon icon="hugeicons:floppy-disk" width={18} />
                  }
                  variant="solid"
                  onPress={editUser}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
