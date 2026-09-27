import { redirect } from "next/navigation";
import Link from "next/link";
import { setSession } from "@/lib/auth/session";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";

async function loginAsTeacher() {
  "use server";
  await setSession(SEED_IDS.users.teacherRivera, "teacher");
  redirect("/teacher");
}

export default function TeacherDemoPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 inline-flex rounded-full bg-science-teal/10 p-5">
        <FlaskConical className="size-10 text-science-teal" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">Teacher Demo</h1>
      <p className="mt-3 text-muted">
        Sign in as <strong className="text-foreground">Ms. Rivera</strong> to view
        class progress, intervention groups, and student analytics for Period 3
        Grade 5 Science.
      </p>
      <form action={loginAsTeacher} className="mt-8">
        <Button type="submit" variant="secondary" size="lg">
          Enter as Ms. Rivera
        </Button>
      </form>
      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="text-science-blue hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
