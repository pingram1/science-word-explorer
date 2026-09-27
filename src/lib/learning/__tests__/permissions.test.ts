import { describe, expect, it } from "vitest";
import {
  assertStudentAccessRecord,
  assertTeacherAccessStudent,
  canStudentAccessRecord,
  canTeacherAccessClass,
  canTeacherAccessStudent,
  isTeacherOrAdmin,
} from "@/lib/learning/permissions";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type { ClassMembership } from "@/lib/types";

const memberships: ClassMembership[] = [
  {
    id: "membership-teacher",
    classId: SEED_IDS.class.riveraPeriod3,
    userId: SEED_IDS.users.teacherRivera,
    role: "teacher",
    joinedAt: "2026-07-01T00:00:00.000Z",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "membership-student",
    classId: SEED_IDS.class.riveraPeriod3,
    userId: SEED_IDS.users.students.sofiaMartinez,
    role: "student",
    joinedAt: "2026-07-01T00:00:00.000Z",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
];

describe("canTeacherAccessStudent", () => {
  it("allows teachers to access students in their classes", () => {
    expect(
      canTeacherAccessStudent(
        {
          actor: { id: SEED_IDS.users.teacherRivera, role: "teacher" },
          classMemberships: memberships,
        },
        SEED_IDS.users.students.sofiaMartinez,
      ),
    ).toBe(true);
  });

  it("denies teachers access to students outside their classes", () => {
    expect(
      canTeacherAccessStudent(
        {
          actor: { id: SEED_IDS.users.teacherRivera, role: "teacher" },
          classMemberships: memberships,
        },
        "unknown-student",
      ),
    ).toBe(false);
  });

  it("allows admins to access any student", () => {
    expect(
      canTeacherAccessStudent(
        {
          actor: { id: SEED_IDS.users.adminChen, role: "admin" },
          classMemberships: memberships,
        },
        "any-student",
      ),
    ).toBe(true);
  });

  it("denies student role from teacher access checks", () => {
    expect(
      canTeacherAccessStudent(
        {
          actor: { id: SEED_IDS.users.students.sofiaMartinez, role: "student" },
          classMemberships: memberships,
        },
        SEED_IDS.users.students.marcusJohnson,
      ),
    ).toBe(false);
  });
});

describe("canStudentAccessRecord", () => {
  it("allows students to access their own records", () => {
    expect(
      canStudentAccessRecord(
        { id: SEED_IDS.users.students.sofiaMartinez, role: "student" },
        { studentId: SEED_IDS.users.students.sofiaMartinez },
      ),
    ).toBe(true);
  });

  it("denies students access to other students' records", () => {
    expect(
      canStudentAccessRecord(
        { id: SEED_IDS.users.students.sofiaMartinez, role: "student" },
        { studentId: SEED_IDS.users.students.marcusJohnson },
      ),
    ).toBe(false);
  });

  it("allows admins to access any student record", () => {
    expect(
      canStudentAccessRecord(
        { id: SEED_IDS.users.adminChen, role: "admin" },
        { studentId: SEED_IDS.users.students.marcusJohnson },
      ),
    ).toBe(true);
  });
});

describe("isTeacherOrAdmin", () => {
  it("returns true for teacher and admin roles", () => {
    expect(isTeacherOrAdmin("teacher")).toBe(true);
    expect(isTeacherOrAdmin("admin")).toBe(true);
  });

  it("returns false for student role", () => {
    expect(isTeacherOrAdmin("student")).toBe(false);
  });
});

describe("assertTeacherAccessStudent", () => {
  it("throws when access is denied", () => {
    expect(() =>
      assertTeacherAccessStudent(
        {
          actor: { id: SEED_IDS.users.teacherRivera, role: "teacher" },
          classMemberships: memberships,
        },
        "unknown-student",
      ),
    ).toThrow(/does not have access/);
  });
});

describe("assertStudentAccessRecord", () => {
  it("throws when a student accesses another student's record", () => {
    expect(() =>
      assertStudentAccessRecord(
        { id: SEED_IDS.users.students.sofiaMartinez, role: "student" },
        { studentId: SEED_IDS.users.students.marcusJohnson },
      ),
    ).toThrow(/does not have access/);
  });
});

describe("canTeacherAccessClass", () => {
  it("allows a teacher to access their own class", () => {
    expect(
      canTeacherAccessClass(
        {
          actor: { id: SEED_IDS.users.teacherRivera, role: "teacher" },
          classMemberships: memberships,
        },
        SEED_IDS.class.riveraPeriod3,
      ),
    ).toBe(true);
  });

  it("denies a teacher access to an unknown class", () => {
    expect(
      canTeacherAccessClass(
        {
          actor: { id: SEED_IDS.users.teacherRivera, role: "teacher" },
          classMemberships: memberships,
        },
        "class-other-teacher",
      ),
    ).toBe(false);
  });
});
