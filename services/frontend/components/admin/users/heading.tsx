"use client";

import { Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import AdminCreateUserModal from "@/components/modals/admin/createUser";

export default function AdminUsersHeading() {
  const createUserModal = useDisclosure();

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">Users</p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button
              color="primary"
              startContent={<Icon icon="hugeicons:user-add-01" width={18} />}
              variant="flat"
              onPress={createUserModal.onOpen}
            >
              Create User
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button isIconOnly color="primary">
              <Icon icon="hugeicons:user-add-01" width={18} />
            </Button>
          </div>
        </div>
      </div>
      <AdminCreateUserModal disclosure={createUserModal} />
    </main>
  );
}
