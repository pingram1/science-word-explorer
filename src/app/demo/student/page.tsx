import { redirect } from "next/navigation";
import Link from "next/link";
import { getDemoStudents } from "@/lib/services/student-service";
import { getSession, setSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Microscope } from "lucide-react";

async function loginAsStudent(userId: string) {
  "use server";
  await setSession(userId, "student");
  redirect("/student");
}

export default async function StudentDemoPage() {
  const session = await getSession();
  const students = await getDemoStudents();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-science-blue/10 p-4">
          <Microscope className="size-8 text-science-blue" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Choose Your Explorer</h1>
        <p className="mt-2 text-muted">
          Select a demo student to begin your science vocabulary journey.
        </p>
        {session?.role === "student" && (
          <p className="mt-2 text-sm text-science-teal">
            Currently signed in. Pick another student to switch accounts.
          </p>
        )}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {students.map((student) => (
          <li key={student.id}>
            <form action={loginAsStudent.bind(null, student.id)}>
              <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:border-science-blue/50">
                <div className="text-left">
                  <p className="font-semibold text-foreground">{student.displayName}</p>
                  <p className="text-sm text-muted">{student.email}</p>
                </div>
                <Button type="submit" size="sm" variant="primary" data-testid={`demo-user-${student.id}`}>
                  Start
                </Button>
              </Card>
            </form>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/" className="text-science-blue hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
