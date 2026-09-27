"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { SEED_IDS } from "@/lib/seed/seed-ids";

const demoStudents = [
  { id: SEED_IDS.users.students.emmaChen, name: "Emma Chen" },
  { id: SEED_IDS.users.students.sofiaMartinez, name: "Sofia Martinez" },
  { id: SEED_IDS.users.students.marcusJohnson, name: "Marcus Johnson" },
  { id: SEED_IDS.users.students.noahWilliams, name: "Noah Williams" },
];

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/student";
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (userId: string) => {
    setLoadingId(userId);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Sign in failed");
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setLoadingId(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-science-teal/15 text-science-teal">
            <FlaskConical className="size-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Science Word Explorer</CardTitle>
          <CardDescription>Choose a demo student to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {demoStudents.map((student) => (
            <Button
              key={student.id}
              size="lg"
              variant="secondary"
              onClick={() => signIn(student.id)}
              isLoading={loadingId === student.id}
            >
              Sign in as {student.name}
            </Button>
          ))}
          {error && (
            <p className="text-center text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
