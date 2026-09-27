import { describe, expect, it } from "vitest";
import { parseSessionCookie, serializeSessionCookie } from "@/lib/auth/session";
import { SEED_IDS } from "@/lib/seed/seed-ids";

describe("demo session cookies", () => {
  it("round-trips a signed student session", () => {
    const session = {
      userId: SEED_IDS.users.students.sofiaMartinez,
      role: "student" as const,
    };
    expect(parseSessionCookie(serializeSessionCookie(session))).toEqual(session);
  });

  it("rejects unsigned JSON cookies that forge an admin role", () => {
    const forged = JSON.stringify({
      userId: SEED_IDS.users.adminChen,
      role: "admin",
    });
    expect(parseSessionCookie(forged)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const signed = serializeSessionCookie({
      userId: SEED_IDS.users.teacherRivera,
      role: "teacher",
    });
    const [payload] = signed.split(".");
    expect(parseSessionCookie(`${payload}.not-a-real-signature`)).toBeNull();
  });
});
