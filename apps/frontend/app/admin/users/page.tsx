import AdminUsersHeading from "@/components/admin/users/heading";
import AdminGetUsers from "@/lib/fetch/admin/users";
import { AdminUsersList } from "@/components/admin/users/list";
import ErrorCard from "@/components/error/ErrorCard";

export default async function AdminUsersPage() {
  const usersData = AdminGetUsers();

  const [users] = (await Promise.all([usersData])) as any;

  return (
    <main>
      {users.success ? (
        <>
          <AdminUsersHeading />
          <hr className="my-4 border-default" />
          <AdminUsersList users={users.data.users} />
        </>
      ) : (
        <ErrorCard error={users.error} message={users.message} />
      )}
    </main>
  );
}
