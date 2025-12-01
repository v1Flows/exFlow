"use client";
import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

import ChangeUserDetails from "@/lib/fetch/user/PUT/changeDetails";
import CheckUserTaken from "@/lib/auth/checkTaken";
import { Ripple } from "@/components/magicui/ripple";

import DeleteUserModal from "../modals/user/delete";
import DisableUserModal from "../modals/user/disable";
import ChangeUserPasswordModal from "../modals/user/changePassword";

import CellWrapper from "./cell-wrapper";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

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
    <main className="relative w-full min-h-full p-2 md:p-6">
      <div className="relative z-10 mx-auto">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              User <span className="text-primary">Profile</span>
            </h1>
            <p className="text-default-500">
              Manage your account settings and security preferences.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:logout-04" />}
              variant="shadow"
              onPress={() => router.push("/logout")}
            >
              Sign Out
            </Button>
          </div>
        </motion.div>

        <motion.div
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Account Settings */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-content1/60 backdrop-blur-md shadow-lg border border-default-100">
              <CardHeader className="flex flex-col items-start px-6 pb-0 pt-6">
                <div className="p-2 rounded-lg bg-primary/10 mb-2">
                  <Icon
                    className="text-primary text-xl"
                    icon="hugeicons:user-circle"
                  />
                </div>
                <h4 className="text-xl font-bold">Account Settings</h4>
                <p className="text-small text-default-500">
                  Manage your username and email address
                </p>
              </CardHeader>
              <CardBody className="space-y-4 p-6">
                <CellWrapper
                  ref={null}
                  className="bg-content2/50 hover:bg-content2/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-tiny text-default-500">
                      Visible to other users
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                    <Input
                      classNames={{
                        inputWrapper: "bg-content1/50",
                      }}
                      radius="sm"
                      size="sm"
                      type="username"
                      value={username}
                      variant="bordered"
                      onValueChange={setUsername}
                    />
                  </div>
                </CellWrapper>

                <CellWrapper
                  ref={null}
                  className="bg-content2/50 hover:bg-content2/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-tiny text-default-500">
                      Used for notifications
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                    <Input
                      classNames={{
                        inputWrapper: "bg-content1/50",
                      }}
                      radius="sm"
                      size="sm"
                      type="email"
                      value={email}
                      variant="bordered"
                      onValueChange={setEmail}
                    />
                  </div>
                </CellWrapper>

                <div className="pt-4 flex flex-col gap-3">
                  <Button
                    fullWidth
                    className="font-medium shadow-lg shadow-primary/20"
                    color="primary"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:floppy-disk" width={18} />
                    }
                    onPress={() => checkUserTaken()}
                  >
                    Save Changes
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      fullWidth
                      className="bg-content2/50 hover:bg-content2"
                      isLoading={isLoading}
                      startContent={
                        <Icon icon="hugeicons:copy-01" width={18} />
                      }
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
                      Copy ID
                    </Button>
                    <Button
                      fullWidth
                      className="bg-content2/50 hover:bg-content2"
                      isLoading={isLoading}
                      startContent={<Icon icon="hugeicons:key-01" width={18} />}
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
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-content1/60 backdrop-blur-md shadow-lg border border-default-100">
              <CardHeader className="flex flex-col items-start px-6 pb-0 pt-6">
                <div className="p-2 rounded-lg bg-danger/10 mb-2">
                  <Icon
                    className="text-danger text-xl"
                    icon="hugeicons:shield-02"
                  />
                </div>
                <h4 className="text-xl font-bold">Security Settings</h4>
                <p className="text-small text-default-500">
                  Manage your security preferences
                </p>
              </CardHeader>
              <CardBody className="space-y-4 p-6">
                <CellWrapper
                  ref={null}
                  className="bg-content2/50 hover:bg-content2/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-tiny text-default-500">
                      Last changed: Never
                    </p>
                  </div>
                  <Button
                    className="border-default-200"
                    size="sm"
                    startContent={<Icon icon="hugeicons:lock-key" width={16} />}
                    variant="bordered"
                    onPress={() => updatePasswordModal.onOpen()}
                  >
                    Change
                  </Button>
                </CellWrapper>

                <CellWrapper
                  ref={null}
                  className="bg-content2/50 hover:bg-content2/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Deactivate Account</p>
                    <p className="text-tiny text-default-500">
                      Temporarily disable access
                    </p>
                  </div>
                  <Button
                    className="border-default-200"
                    color="warning"
                    size="sm"
                    startContent={
                      <Icon icon="hugeicons:user-block-01" width={16} />
                    }
                    variant="bordered"
                    onPress={() => disableUserModal.onOpen()}
                  >
                    Deactivate
                  </Button>
                </CellWrapper>

                <CellWrapper
                  ref={null}
                  className="bg-danger/5 hover:bg-danger/10 border border-danger/10 transition-colors"
                >
                  <div>
                    <p className="font-medium text-danger">Delete Account</p>
                    <p className="text-tiny text-danger/60">
                      Permanently remove all data
                    </p>
                  </div>
                  <Button
                    className="bg-danger/10 text-danger"
                    color="danger"
                    size="sm"
                    startContent={
                      <Icon icon="hugeicons:delete-02" width={16} />
                    }
                    variant="flat"
                    onPress={() => deleteUserModal.onOpen()}
                  >
                    Delete
                  </Button>
                </CellWrapper>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>

        <ChangeUserPasswordModal
          disclosure={updatePasswordModal}
          userId={user.id}
        />
        <DisableUserModal disclosure={disableUserModal} user={user} />
        <DeleteUserModal disclosure={deleteUserModal} user={user} />
      </div>
      <div className="fixed inset-0 -z-0 pointer-events-none">
        <Ripple mainCircleOpacity={0.15} numCircles={8} />
      </div>
    </main>
  );
}
