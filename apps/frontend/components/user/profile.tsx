"use client";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  TextField,
  toast,
  useOverlayState,
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
  const updatePasswordModal = useOverlayState();
  const disableUserModal = useOverlayState();
  const deleteUserModal = useOverlayState();
  const [username, setUsername] = React.useState(user.username);
  const [email, setEmail] = React.useState(user.email);
  const [isLoading, setIsLoading] = React.useState(false);
  async function checkUserTaken() {
    const res = await CheckUserTaken(user.id, email, username);
    if (res.result === "success") {
      UpdateUser();
    } else {
      toast.danger("User", { description: res.error });
    }
  }
  async function UpdateUser() {
    setIsLoading(true);
    const res = await ChangeUserDetails(user.id, username, email);
    if (res) {
      setIsLoading(false);
      toast.success("User", { description: "User updated successfully" });
      router.refresh();
    } else {
      setIsLoading(false);
      toast.danger("User", { description: "Failed to update user" });
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
              User <span className="text-accent">Profile</span>
            </h1>
            <p className="text-muted">
              Manage your account settings and security preferences.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onPress={() => router.push("/logout")}>
              {<Icon icon="hugeicons:logout-04" />}
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
            <Card className="h-full bg-surface/60 backdrop-blur-md shadow-lg border border-default">
              <Card.Header className="flex flex-col items-start px-6 pb-0 pt-6">
                <div className="p-2 rounded-lg bg-accent/10 mb-2">
                  <Icon
                    className="text-accent text-xl"
                    icon="hugeicons:user-circle"
                  />
                </div>
                <h4 className="text-xl font-bold">Account Settings</h4>
                <p className="text-sm text-muted">
                  Manage your username and email address
                </p>
              </Card.Header>
              <Card.Content className="space-y-4 p-6">
                <CellWrapper
                  ref={null}
                  className="bg-surface-secondary/50 hover:bg-surface-secondary/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-xs text-muted">Visible to other users</p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                    <TextField value={username} onChange={setUsername}>
                      <InputGroup>
                        <Input type="username" />
                      </InputGroup>
                    </TextField>
                  </div>
                </CellWrapper>

                <CellWrapper
                  ref={null}
                  className="bg-surface-secondary/50 hover:bg-surface-secondary/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-xs text-muted">Used for notifications</p>
                  </div>
                  <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                    <TextField value={email} onChange={setEmail}>
                      <InputGroup>
                        <Input type="email" />
                      </InputGroup>
                    </TextField>
                  </div>
                </CellWrapper>

                <div className="pt-4 flex flex-col gap-3">
                  <Button
                    className="font-medium shadow-lg shadow-accent/20"
                    isPending={isLoading}
                    onPress={() => checkUserTaken()}
                    variant="primary"
                  >
                    {<Icon icon="hugeicons:floppy-disk" width={18} />}
                    Save Changes
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="bg-surface-secondary/50 hover:bg-surface-secondary"
                      isPending={isLoading}
                      variant="tertiary"
                      onPress={() => {
                        navigator.clipboard.writeText(user.id);
                        toast.success("UserID", {
                          description: "UserID copied to clipboard!",
                        });
                      }}
                    >
                      {<Icon icon="hugeicons:copy-01" width={18} />}
                      Copy ID
                    </Button>
                    <Button
                      className="bg-surface-secondary/50 hover:bg-surface-secondary"
                      isPending={isLoading}
                      variant="tertiary"
                      onPress={() => {
                        navigator.clipboard.writeText(session);
                        toast.success("Session Token", {
                          description: "Session Token copied to clipboard!",
                        });
                      }}
                    >
                      {<Icon icon="hugeicons:key-01" width={18} />}
                      Copy Token
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div variants={itemVariants}>
            <Card className="h-full bg-surface/60 backdrop-blur-md shadow-lg border border-default">
              <Card.Header className="flex flex-col items-start px-6 pb-0 pt-6">
                <div className="p-2 rounded-lg bg-danger/10 mb-2">
                  <Icon
                    className="text-danger text-xl"
                    icon="hugeicons:shield-02"
                  />
                </div>
                <h4 className="text-xl font-bold">Security Settings</h4>
                <p className="text-sm text-muted">
                  Manage your security preferences
                </p>
              </Card.Header>
              <Card.Content className="space-y-4 p-6">
                <CellWrapper
                  ref={null}
                  className="bg-surface-secondary/50 hover:bg-surface-secondary/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-xs text-muted">Last changed: Never</p>
                  </div>
                  <Button
                    className="border-default"
                    size="sm"
                    variant="outline"
                    onPress={() => updatePasswordModal.open()}
                  >
                    {<Icon icon="hugeicons:lock-key" width={16} />}
                    Change
                  </Button>
                </CellWrapper>

                <CellWrapper
                  ref={null}
                  className="bg-surface-secondary/50 hover:bg-surface-secondary/80 transition-colors"
                >
                  <div>
                    <p className="font-medium">Deactivate Account</p>
                    <p className="text-xs text-muted">
                      Temporarily disable access
                    </p>
                  </div>
                  <Button
                    className="border-default"
                    size="sm"
                    variant="outline"
                    onPress={() => disableUserModal.open()}
                  >
                    {<Icon icon="hugeicons:user-block-01" width={16} />}
                    Deactivate
                  </Button>
                </CellWrapper>

                <CellWrapper
                  ref={null}
                  className="bg-danger/5 hover:bg-danger/10 border border-danger/10 transition-colors"
                >
                  <div>
                    <p className="font-medium text-danger">Delete Account</p>
                    <p className="text-xs text-danger/60">
                      Permanently remove all data
                    </p>
                  </div>
                  <Button
                    className="bg-danger/10 text-danger"
                    size="sm"
                    variant="danger-soft"
                    onPress={() => deleteUserModal.open()}
                  >
                    {<Icon icon="hugeicons:delete-02" width={16} />}
                    Delete
                  </Button>
                </CellWrapper>
              </Card.Content>
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
