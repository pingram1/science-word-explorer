import { expect, test } from "@playwright/test";
import {
  completeCurrentStepCorrectly,
  enterStudentDemo,
  enterTeacherDemo,
  startEvaporationLesson,
} from "./helpers";
import { SEED_IDS } from "../src/lib/seed/seed-ids";

test.describe("Teacher dashboard", () => {
  test("teacher views a student attempt after gameplay", async ({ browser }) => {
    const studentContext = await browser.newContext();
    const teacherContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    const teacherPage = await teacherContext.newPage();

    await enterStudentDemo(studentPage);
    await startEvaporationLesson(studentPage);
    await completeCurrentStepCorrectly(studentPage);
    await studentPage.getByTestId("step-continue").click();

    await enterTeacherDemo(teacherPage);
    await teacherPage.goto(`/teacher/students/${SEED_IDS.users.students.sofiaMartinez}`);
    await expect(teacherPage).toHaveURL(
      new RegExp(`/teacher/students/${SEED_IDS.users.students.sofiaMartinez}`),
    );
    await expect(teacherPage.getByTestId("recent-attempts")).toBeVisible({ timeout: 15000 });
    await expect(
      teacherPage.getByTestId("recent-attempts").getByText(/evaporation/i).first(),
    ).toBeVisible();

    await studentContext.close();
    await teacherContext.close();
  });
});
