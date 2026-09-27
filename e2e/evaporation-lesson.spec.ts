import { expect, test } from "@playwright/test";
import { enterStudentDemo, startEvaporationLesson, submitCorrectStep } from "./helpers";

test.describe("Evaporation lesson", () => {
  test("student completes all ten instructional steps", async ({ page }) => {
    await enterStudentDemo(page);
    await startEvaporationLesson(page);

    for (let step = 1; step <= 10; step += 1) {
      await expect(page.getByTestId("step-indicator")).toContainText(`Step ${step} of`);
      await submitCorrectStep(page);

      if (step < 10) {
        await page.getByTestId("step-continue").click();
      }
    }

    await expect(page.getByTestId("lesson-complete")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/evaporation/i)).toBeVisible();
  });
});
