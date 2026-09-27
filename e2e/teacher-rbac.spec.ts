import { expect, test } from "@playwright/test";
import { enterStudentDemo, enterTeacherDemo } from "./helpers";
import { SEED_IDS } from "../src/lib/seed/seed-ids";

test.describe("Teacher persona — RBAC", () => {
  test("student cannot read teacher intervention or admin vocabulary APIs", async ({
    page,
  }) => {
    await enterStudentDemo(page);

    const intervention = await page.request.get("/api/teacher/intervention");
    expect(intervention.status()).toBe(403);

    const createGroup = await page.request.post("/api/teacher/intervention", {
      data: {
        name: "Forged group",
        reason: "Student should not be able to create this",
        classId: SEED_IDS.class.riveraPeriod3,
      },
    });
    expect(createGroup.status()).toBe(403);

    const vocab = await page.request.get("/api/admin/vocabulary");
    expect(vocab.status()).toBe(403);
  });

  test("unsigned JSON session cookie cannot escalate to admin", async ({ page }) => {
    await enterStudentDemo(page);

    await page.context().addCookies([
      {
        name: "swe_session",
        value: JSON.stringify({ userId: SEED_IDS.users.adminChen, role: "admin" }),
        url: "http://localhost:3000",
      },
    ]);

    const vocab = await page.request.get("/api/admin/vocabulary");
    expect(vocab.status()).toBe(401);
  });

  test("teacher cannot request a class they do not teach", async ({ page }) => {
    await enterTeacherDemo(page);

    const dashboard = await page.request.get(
      "/api/teacher/dashboard?classId=class-not-owned",
    );
    expect(dashboard.status()).toBe(403);

    const ok = await page.request.get("/api/teacher/dashboard");
    expect(ok.ok()).toBe(true);
    const body = (await ok.json()) as {
      ok: boolean;
      data: { filterOptions: { classes: { id: string }[] } };
    };
    expect(body.data.filterOptions.classes.every((item) => item.id === SEED_IDS.class.riveraPeriod3)).toBe(
      true,
    );
  });
});
