import { NextResponse } from "next/server";
import { setSession } from "@/lib/auth/session";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type { UserRole } from "@/lib/types";

function resolveDemoUserId(role: UserRole, userId?: string): string {
  if (role === "teacher") {
    return SEED_IDS.users.teacherRivera;
  }
  if (role === "admin") {
    return SEED_IDS.users.adminChen;
  }
  if (userId) {
    return userId;
  }
  return SEED_IDS.users.students.sofiaMartinez;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { role?: UserRole; userId?: string; redirectTo?: string };
    const role = body.role ?? "student";

    if (!["student", "teacher", "admin"].includes(role)) {
      return NextResponse.json({ ok: false, error: "Invalid role." }, { status: 400 });
    }

    const userId = resolveDemoUserId(role, body.userId);
    await setSession(userId, role);

    const redirectTo = body.redirectTo ?? `/demo/${role === "admin" ? "admin" : role}`;
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to set session.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
