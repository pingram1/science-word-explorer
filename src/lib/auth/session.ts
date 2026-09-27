import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getRepository } from "@/lib/repositories";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type { StudentProfile, StudentSupportProfile, User, UserRole } from "@/lib/types";

export const SESSION_COOKIE = "swe_session";

export interface DemoSession {
  userId: string;
  role: UserRole;
}

const DEMO_USER_IDS = new Set<string>([
  SEED_IDS.users.teacherRivera,
  SEED_IDS.users.adminChen,
  ...Object.values(SEED_IDS.users.students),
]);

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface StudentSession {
  user: User;
  profile: StudentProfile;
  supportProfile: StudentSupportProfile | null;
}

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "swe-demo-session-secret";
}

function signPayload(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

/** HMAC-signed cookie value so clients cannot forge a role by editing JSON. */
export function serializeSessionCookie(session: DemoSession): string {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function signaturesMatch(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseSessionCookie(raw: string | undefined): DemoSession | null {
  if (!raw) return null;

  const separator = raw.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }

  const payload = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  if (!signaturesMatch(signature, signPayload(payload))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as DemoSession;
    if (
      typeof parsed.userId === "string" &&
      typeof parsed.role === "string" &&
      ["student", "teacher", "admin"].includes(parsed.role) &&
      isValidDemoUser(parsed.userId, parsed.role)
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function isValidDemoUser(userId: string, role: UserRole): boolean {
  if (!DEMO_USER_IDS.has(userId)) {
    return false;
  }

  if (role === "teacher") {
    return userId === SEED_IDS.users.teacherRivera;
  }

  if (role === "admin") {
    return userId === SEED_IDS.users.adminChen;
  }

  return Object.values(SEED_IDS.users.students).includes(
    userId as (typeof SEED_IDS.users.students)[keyof typeof SEED_IDS.users.students],
  );
}

export async function getSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  return parseSessionCookie(cookie?.value);
}

export async function setSession(userId: string, role: UserRole): Promise<void> {
  if (!isValidDemoUser(userId, role)) {
    throw new Error("Invalid demo user or role combination.");
  }

  const cookieStore = await cookies();
  const value = serializeSessionCookie({ userId, role });

  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const repo = await getRepository();
  const user = await repo.getUser(session.userId);
  if (!user || !user.isActive) return null;
  return user;
}

export async function getStudentSession(): Promise<StudentSession | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "student") return null;

  const repo = await getRepository();
  const profile = await repo.getStudentProfileByUserId(user.id);
  if (!profile) return null;

  const supportProfile = profile.supportProfileId
    ? await repo.getSupportProfile(profile.supportProfileId)
    : await repo.getSupportProfileByStudentId(user.id);

  return { user, profile, supportProfile };
}

export async function requireStudentSession(): Promise<StudentSession> {
  const session = await getStudentSession();
  if (!session) {
    redirect("/demo/student");
  }
  return session;
}

export async function requireStudentUser(): Promise<User> {
  const session = await requireStudentSession();
  return session.user;
}

export async function requireTeacherOrAdminSession(): Promise<User> {
  const user = await getSessionUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/demo/teacher");
  }
  return user;
}

export async function requireAdminSession(): Promise<User> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    redirect("/demo/admin");
  }
  return user;
}

export { DEMO_USER_IDS, isValidDemoUser };
