import { expect, test } from "@playwright/test";
import { enterStudentDemo, startEvaporationLesson, submitCorrectStep } from "./helpers";

test.describe("Step feedback", () => {
  test("correct response produces supportive feedback", async ({ page }) => {
    await enterStudentDemo(page);
    await startEvaporationLesson(page);

    await submitCorrectStep(page);

    const feedback = page.getByTestId("step-feedback");
    await expect(feedback).toBeVisible();
    await expect(feedback).not.toContainText(/wrong/i);
    await expect(feedback).not.toContainText(/failed/i);
  });
});
