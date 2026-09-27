import type { ClassMembership, User, UserRole } from "@/lib/types";

export interface AccessContext {
  actor: Pick<User, "id" | "role">;
  classMemberships: ClassMembership[];
}

export interface StudentRecord {
  studentId: string;
  classId?: string | null;
}

/** Thrown when an actor is authenticated but not authorized for the record. */
export class PermissionError extends Error {
  readonly status = 403;
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

/**
 * Determines whether a teacher can access a student's learning records.
 * Teachers may only access students enrolled in their classes.
 * Admins may access all students.
 */
export function canTeacherAccessStudent(
  context: AccessContext,
  targetStudentId: string,
): boolean {
  const { actor, classMemberships } = context;

  if (actor.role === "admin") {
    return true;
  }

  if (actor.role !== "teacher") {
    return false;
  }

  const teacherClassIds = new Set(
    classMemberships
      .filter(
        (membership) => membership.userId === actor.id && membership.role === "teacher",
      )
      .map((membership) => membership.classId),
  );

  if (teacherClassIds.size === 0) {
    return false;
  }

  return classMemberships.some(
    (membership) =>
      membership.userId === targetStudentId &&
      membership.role === "student" &&
      teacherClassIds.has(membership.classId),
  );
}

/**
 * Determines whether the acting user can access a specific learning record.
 */
export function canStudentAccessRecord(
  actor: Pick<User, "id" | "role">,
  record: StudentRecord,
): boolean {
  if (actor.role === "admin") {
    return true;
  }

  if (actor.role === "student") {
    return actor.id === record.studentId;
  }

  return false;
}

/**
 * Returns whether a user with the given role can perform teacher-level actions.
 */
export function isTeacherOrAdmin(role: UserRole): boolean {
  return role === "teacher" || role === "admin";
}

/**
 * Validates teacher access to a student record; throws if denied.
 * Useful in service layers where exceptions are preferred.
 */
export function assertTeacherAccessStudent(
  context: AccessContext,
  targetStudentId: string,
): void {
  if (!canTeacherAccessStudent(context, targetStudentId)) {
    throw new PermissionError("Teacher does not have access to this student.");
  }
}

/**
 * Teachers may only query classes they belong to. Admins may query any class.
 */
export function canTeacherAccessClass(context: AccessContext, classId: string): boolean {
  const { actor, classMemberships } = context;
  if (actor.role === "admin") return true;
  if (actor.role !== "teacher") return false;
  return classMemberships.some(
    (membership) =>
      membership.userId === actor.id &&
      membership.role === "teacher" &&
      membership.classId === classId,
  );
}

export function assertTeacherAccessClass(context: AccessContext, classId: string): void {
  if (!canTeacherAccessClass(context, classId)) {
    throw new PermissionError("Teacher does not have access to this class.");
  }
}

/**
 * Validates student access to their own record; throws if denied.
 */
export function assertStudentAccessRecord(
  actor: Pick<User, "id" | "role">,
  record: StudentRecord,
): void {
  if (!canStudentAccessRecord(actor, record)) {
    throw new PermissionError("Student does not have access to this record.");
  }
}
