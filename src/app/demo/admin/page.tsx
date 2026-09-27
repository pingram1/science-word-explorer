import { redirect } from "next/navigation";
import Link from "next/link";
import { setSession } from "@/lib/auth/session";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

async function loginAsAdmin() {
  "use server";
  await setSession(SEED_IDS.users.adminChen, "admin");
  redirect("/admin");
}

export default function AdminDemoPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 inline-flex rounded-full bg-science-accent/20 p-5">
        <BookOpen className="size-10 text-science-accent" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">Content Manager Demo</h1>
      <p className="mt-3 text-muted">
        Sign in as <strong className="text-foreground">Dr. Chen</strong> to browse,
        create, and edit science vocabulary words across all units.
      </p>
      <form action={loginAsAdmin} className="mt-8">
        <Button type="submit" variant="accent" size="lg">
          Enter as Dr. Chen
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
