import { requireTeacherOrAdminSession } from "@/lib/auth/session";
import { TeacherShell } from "@/app/teacher/TeacherShell";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTeacherOrAdminSession();

  return <TeacherShell>{children}</TeacherShell>;
}
