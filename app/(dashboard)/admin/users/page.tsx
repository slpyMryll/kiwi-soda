import { getAdminUsers } from "@/lib/actions/admin-management";
import { UserManagementClient } from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return <UserManagementClient initialUsers={users} />;
}