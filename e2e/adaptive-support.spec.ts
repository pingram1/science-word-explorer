import { expect, test } from "@playwright/test";
import { enterStudentDemo, startEvaporationLesson, submitIncorrectStep } from "./helpers";

test.describe("Adaptive support", () => {
  test("missed response triggers visible support escalation", async ({ page }) => {
    await enterStudentDemo(page, "aishaPatel");
    await startEvaporationLesson(page);

    await submitIncorrectStep(page);
    await page.getByTestId("step-retry").click();
    await submitIncorrectStep(page);

    await expect(page.getByTestId("adaptive-support-banner")).toBeVisible();
    await expect(page.getByTestId("adaptive-support-banner")).toContainText(/slow audio|support|syllable/i);
  });
});
