import { Divider } from "@heroui/react";

import AdminUsersHeading from "@/components/admin/users/heading";
import AdminGetUsers from "@/lib/fetch/admin/users";
import { AdminUsersList } from "@/components/admin/users/list";

export default async function AdminUsersPage() {
  const usersData = AdminGetUsers();

  const [users] = (await Promise.all([usersData])) as any;

  return (
    <main>
      <AdminUsersHeading />
      <Divider className="mt-4 mb-4" />
      <AdminUsersList users={users.data.users} />
    </main>
  );
}
