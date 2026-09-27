import { expect, test } from "@playwright/test";
import { enterStudentDemo, ROUTES } from "./helpers";

test.describe("Demo entry", () => {
  test("student enters demo and reaches dashboard", async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page.getByRole("heading", { name: /Science Word Explorer/i })).toBeVisible();
    await enterStudentDemo(page);
    await expect(page.getByTestId("student-dashboard")).toBeVisible();
    await expect(page.getByTestId("student-greeting")).toBeVisible();
  });
});
