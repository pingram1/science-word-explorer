import { expect, test } from "@playwright/test";
import { enterStudentDemo, startEvaporationLesson } from "./helpers";

test.describe("Keyboard navigation", () => {
  test("student can navigate a game step with keyboard only", async ({ page }) => {
    await enterStudentDemo(page);
    await startEvaporationLesson(page);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    let focusedTestId = "";
    for (let i = 0; i < 12; i += 1) {
      const testId = await page.locator(":focus").getAttribute("data-testid");
      if (testId === "step-submit") {
        focusedTestId = testId;
        break;
      }
      await page.keyboard.press("Tab");
    }

    expect(focusedTestId).toBe("step-submit");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("step-feedback")).toBeVisible();
  });
});
