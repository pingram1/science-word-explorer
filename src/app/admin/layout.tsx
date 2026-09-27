import { requireAdminSession } from "@/lib/auth/session";
import { AdminShell } from "@/app/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return <AdminShell>{children}</AdminShell>;
}
