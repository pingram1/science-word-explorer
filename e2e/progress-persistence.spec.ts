import { expect, test } from "@playwright/test";
import { enterStudentDemo, startEvaporationLesson, submitCorrectStep } from "./helpers";

test.describe("Progress persistence", () => {
  test("progress saves between screens and after reload", async ({ page }) => {
    await enterStudentDemo(page);
    await startEvaporationLesson(page);

    await submitCorrectStep(page);
    await page.getByTestId("step-continue").click();
    await expect(page.getByTestId("step-indicator")).toContainText("2");

    await page.getByTestId("exit-save-button").click();
    await expect(page.getByTestId("student-dashboard")).toBeVisible();
    await expect(page.getByTestId("continue-learning-button")).toBeVisible();

    await page.getByTestId("continue-learning-button").click();
    await expect(page.getByTestId("game-shell")).toBeVisible();
    await expect(page.getByTestId("step-indicator")).toContainText("2");

    await page.reload();
    await expect(page.getByTestId("step-indicator")).toContainText("2");
  });
});
