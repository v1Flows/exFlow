"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

import ChangeUserDetails from "@/lib/fetch/user/PUT/changeDetails";
import CheckUserTaken from "@/lib/auth/checkTaken";

import DeleteUserModal from "../modals/user/delete";
import DisableUserModal from "../modals/user/disable";
import ChangeUserPasswordModal from "../modals/user/changePassword";

import CellWrapper from "./cell-wrapper";

export function UserProfile({ user, session }: any) {
  const router = useRouter();

  const updatePasswordModal = useDisclosure();
  const disableUserModal = useDisclosure();
  const deleteUserModal = useDisclosure();

  const [username, setUsername] = React.useState(user.username);
  const [email, setEmail] = React.useState(user.email);
  const [isLoading, setIsLoading] = React.useState(false);

  async function checkUserTaken() {
    const res = await CheckUserTaken(user.id, email, username);

    if (res.result === "success") {
      UpdateUser();
    } else {
      addToast({
        title: "User",
        description: res.error,
        color: "danger",
        variant: "flat",
      });
    }
  }

  async function UpdateUser() {
    setIsLoading(true);
    const res = await ChangeUserDetails(user.id, username, email);

    if (res) {
      setIsLoading(false);
      addToast({
        title: "User",
        description: "User updated successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
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
    <main>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <p className="mb-0 text-2xl font-bold">👋 Welcome on your profile,</p>
          <p className="mb-0 text-2xl font-bold text-primary">
            {user.username}
          </p>
        </div>
      </div>
      <Divider className="my-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="w-full p-2">
          <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
            <p className="text-large">Account Settings</p>
            <p className="text-small text-default-500">
              Manage your username and email address
            </p>
          </CardHeader>
          <CardBody className="space-y-2">
            <CellWrapper ref={null}>
              <div>
                <p>Username</p>
                <p className="text-small text-default-500">
                  The username must be unique.
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                <Input
                  radius="sm"
                  size="md"
                  type="username"
                  value={username}
                  variant="faded"
                  onValueChange={setUsername}
                />
              </div>
            </CellWrapper>
            <CellWrapper ref={null}>
              <div>
                <p>Email Address</p>
                <p className="text-small text-default-500">
                  Email address must be unique.
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                <Input
                  radius="sm"
                  size="md"
                  type="email"
                  value={email}
                  variant="faded"
                  onValueChange={setEmail}
                />
              </div>
            </CellWrapper>

            <div className="flex w-full items-end justify-bottom h-full gap-2">
              <Button
                fullWidth
                color="primary"
                isLoading={isLoading}
                radius="sm"
                startContent={
                  <Icon icon="hugeicons:system-update-01" width={18} />
                }
                variant="solid"
                onPress={() => checkUserTaken()}
              >
                Update Account
              </Button>
              <Button
                fullWidth
                isLoading={isLoading}
                radius="sm"
                startContent={<Icon icon="hugeicons:copy-02" width={18} />}
                variant="flat"
                onPress={() => {
                  navigator.clipboard.writeText(user.id);
                  addToast({
                    title: "UserID",
                    description: "UserID copied to clipboard!",
                    color: "success",
                    variant: "flat",
                  });
                }}
              >
                Copy UserID
              </Button>
              <Button
                fullWidth
                isLoading={isLoading}
                radius="sm"
                startContent={<Icon icon="hugeicons:copy-02" width={18} />}
                variant="flat"
                onPress={() => {
                  navigator.clipboard.writeText(session);
                  addToast({
                    title: "Session Token",
                    description: "Session Token copied to clipboard!",
                    color: "success",
                    variant: "flat",
                  });
                }}
              >
                Copy Token
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="w-full p-2">
          <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
            <p className="text-large">Security Settings</p>
            <p className="text-small text-default-500">
              Manage your security preferences
            </p>
          </CardHeader>
          <CardBody className="space-y-2">
            {/* Password */}
            <CellWrapper ref={null}>
              <div>
                <p>Password</p>
                <p className="text-small text-default-500">
                  Set a unique password to protect your account.
                </p>
              </div>
              <Button
                radius="sm"
                startContent={
                  <Icon icon="hugeicons:reset-password" width={18} />
                }
                variant="bordered"
                onPress={() => updatePasswordModal.onOpen()}
              >
                Change
              </Button>
            </CellWrapper>
            <CellWrapper ref={null}>
              <div>
                <p>Deactivate Account</p>
                <p className="text-small text-default-500">
                  Deactivate your account
                </p>
              </div>
              <Button
                radius="sm"
                startContent={
                  <Icon icon="hugeicons:user-block-01" width={18} />
                }
                variant="bordered"
                onPress={() => disableUserModal.onOpen()}
              >
                Deactivate
              </Button>
            </CellWrapper>
            {/* Delete Account */}
            <CellWrapper ref={null}>
              <div>
                <p>Delete Account</p>
                <p className="text-small text-default-500">
                  Delete your account and all your data.
                </p>
              </div>
              <Button
                color="danger"
                radius="sm"
                startContent={
                  <Icon icon="hugeicons:user-remove-01" width={18} />
                }
                variant="flat"
                onPress={() => deleteUserModal.onOpen()}
              >
                Delete
              </Button>
            </CellWrapper>
          </CardBody>
        </Card>
      </div>
      <ChangeUserPasswordModal
        disclosure={updatePasswordModal}
        userId={user.id}
      />
      <DisableUserModal disclosure={disableUserModal} user={user} />
      <DeleteUserModal disclosure={deleteUserModal} user={user} />
    </main>
  );
}
