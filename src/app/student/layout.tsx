import { requireStudentSession } from "@/lib/auth/session";
import { StudentShell } from "@/app/student/StudentShell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStudentSession();

  return <StudentShell>{children}</StudentShell>;
}
