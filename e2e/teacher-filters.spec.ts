import { expect, test } from "@playwright/test";
import { enterTeacherDemo } from "./helpers";

test.describe("Teacher dashboard filters", () => {
  test("teacher filters dashboard by unit and mastery status", async ({ page }) => {
    await enterTeacherDemo(page);

    await page.getByTestId("filter-unit").selectOption({ label: "Water Cycle" });
    await page.getByTestId("filter-mastery-status").selectOption({ label: "Practicing" });

    await expect(page.getByTestId("teacher-dashboard-results")).toBeVisible();
    await expect(page.getByTestId("active-filter-summary")).toContainText(/Water Cycle/i);
  });
});
