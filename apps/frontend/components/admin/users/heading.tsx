"use client";
import { Button, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import AdminCreateUserModal from "@/components/modals/admin/createUser";
export default function AdminUsersHeading() {
  const createUserModal = useOverlayState();
  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-2xl font-bold mb-1">
            <span className="text-danger">Admin</span> | Users
          </p>
        </div>
        <div className="flex flex-cols justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Button variant="secondary" onPress={createUserModal.open}>
              {<Icon icon="hugeicons:user-add-01" width={18} />}
              Create User
            </Button>
          </div>

          <div className="flex sm:hidden gap-2">
            <Button variant="primary" className="aspect-square p-0">
              <Icon icon="hugeicons:user-add-01" width={18} />
            </Button>
          </div>
        </div>
      </div>
      <AdminCreateUserModal disclosure={createUserModal} />
    </main>
  );
}
