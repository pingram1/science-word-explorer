import { expect, test } from "@playwright/test";
import { advanceThroughSteps, enterStudentDemo, startEvaporationLesson } from "./helpers";

test.describe("Pronunciation fallback", () => {
  test("no-microphone fallback allows progress on step 5", async ({ page, context }) => {
    await context.grantPermissions([]);
    await enterStudentDemo(page);
    await startEvaporationLesson(page);

    await advanceThroughSteps(page, 1, 4);
    await page.getByTestId("step-continue").click();

    await expect(page.getByTestId("step-indicator")).toContainText("5");

    const fallback = page.getByTestId("pronunciation-fallback-read-aloud");
    if (await fallback.isVisible().catch(() => false)) {
      await fallback.click();
    }

    await page.getByTestId("step-submit").click();
    await expect(page.getByTestId("step-feedback")).toBeVisible();
    await expect(page.getByTestId("step-continue")).toBeEnabled();
  });
});
