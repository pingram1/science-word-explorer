import { NextResponse } from "next/server";
import { getRepository } from "@/lib/repositories";
import type { User, UserRole } from "@/lib/types";
import {
  assertStudentAccessRecord,
  assertTeacherAccessClass,
  assertTeacherAccessStudent,
  canStudentAccessRecord,
  canTeacherAccessStudent,
  isTeacherOrAdmin,
  PermissionError,
  type AccessContext,
} from "@/lib/learning/permissions";
import { StepProgressError } from "@/lib/learning/grade-attempt";
import { getSession, type DemoSession } from "@/lib/auth/session";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function getActorUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const repo = await getRepository();
  return repo.getUser(session.userId);
}

export async function requireAuth(
  allowedRoles?: UserRole[],
): Promise<{ user: User; session: DemoSession }> {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Authentication required.", 401);
  }

  const repo = await getRepository();
  const user = await repo.getUser(session.userId);
  if (!user || !user.isActive) {
    throw new AuthError("User not found or inactive.", 401);
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError("Insufficient permissions.", 403);
  }

  return { user, session };
}

export async function buildAccessContext(actor: User): Promise<AccessContext> {
  const repo = await getRepository();
  const classMemberships = await repo.listClassMemberships();
  return { actor: { id: actor.id, role: actor.role }, classMemberships };
}

export async function requireStudentAccess(studentId: string): Promise<User> {
  const { user } = await requireAuth(["student", "teacher", "admin"]);

  if (user.role === "student") {
    assertStudentAccessRecord(user, { studentId });
    return user;
  }

  if (isTeacherOrAdmin(user.role)) {
    const context = await buildAccessContext(user);
    assertTeacherAccessStudent(context, studentId);
    return user;
  }

  throw new AuthError("Insufficient permissions.", 403);
}

export async function requireTeacherAccess(studentId?: string): Promise<User> {
  const { user } = await requireAuth(["teacher", "admin"]);

  if (studentId) {
    const context = await buildAccessContext(user);
    assertTeacherAccessStudent(context, studentId);
  }

  return user;
}

export async function requireTeacherClassAccess(classId: string): Promise<User> {
  const { user } = await requireAuth(["teacher", "admin"]);
  const context = await buildAccessContext(user);
  assertTeacherAccessClass(context, classId);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const { user } = await requireAuth(["admin"]);
  return user;
}

export function canAccessStudentRecord(
  actor: User,
  context: AccessContext,
  studentId: string,
): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "student") {
    return canStudentAccessRecord(actor, { studentId });
  }
  if (actor.role === "teacher") {
    return canTeacherAccessStudent(context, studentId);
  }
  return false;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function handleRouteError(error: unknown): Promise<NextResponse> {
  if (error instanceof AuthError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof PermissionError || error instanceof StepProgressError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof Error) {
    console.error("[API Error]", error.message);
    return jsonError(error.message, 400);
  }

  console.error("[API Error]", error);
  return jsonError("An unexpected error occurred.", 500);
}
