import { expect, test } from "@playwright/test";
import { enterTeacherDemo } from "./helpers";

test.describe("Teacher CSV export", () => {
  test("teacher exports a class report as CSV", async ({ page }) => {
    await enterTeacherDemo(page);

    const response = await page.request.get("/api/teacher/export?type=class");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("text/csv");

    const body = await response.text();
    expect(body).toContain("student");
    expect(body.split("\n").length).toBeGreaterThan(1);
  });
});
