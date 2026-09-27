import { expect, type Page } from "@playwright/test";
import { SEED_IDS } from "../src/lib/seed/seed-ids";

export const ROUTES = {
  home: "/",
  demoStudent: "/demo/student",
  demoTeacher: "/demo/teacher",
  studentDashboard: "/student",
  studentUnit: (slug: string) => `/student/units/${slug}`,
  teacherDashboard: "/teacher",
  teacherStudent: (studentId: string) => `/teacher/students/${studentId}`,
} as const;

export async function enterStudentDemo(
  page: Page,
  studentKey: keyof typeof SEED_IDS.users.students = "sofiaMartinez",
) {
  await page.goto(ROUTES.home);
  await page.getByTestId("demo-student-entry").click();
  await page.getByTestId(`demo-user-${SEED_IDS.users.students[studentKey]}`).click();
  await expect(page).toHaveURL(/\/student/);
  await expect(page.getByTestId("student-dashboard")).toBeVisible({ timeout: 15000 });
}

export async function enterTeacherDemo(page: Page) {
  await page.goto(ROUTES.home);
  await page.getByTestId("demo-teacher-entry").click();
  await page.getByRole("button", { name: /Enter as Ms\. Rivera/i }).click();
  await expect(page).toHaveURL(/\/teacher/);
  await expect(page.getByTestId("teacher-dashboard-results")).toBeVisible({ timeout: 15000 });
}

export async function startEvaporationLesson(page: Page) {
  await page.getByRole("link", { name: "Units" }).click();
  await page.locator('a[href="/student/units/water-cycle"]').click();
  await expect(page.getByTestId("word-card-evaporation")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("word-card-evaporation").click();
  await page.getByTestId("start-lesson-button").click();
  await expect(page.getByTestId("game-shell")).toBeVisible({ timeout: 15000 });
}

async function getCurrentStep(page: Page): Promise<number> {
  const stepText = await page.getByTestId("step-indicator").textContent();
  return Number(stepText?.match(/Step (\d+) of/)?.[1] ?? "1");
}

async function waitForAttemptResponse(page: Page) {
  await page.waitForResponse(
    (response) =>
      response.url().includes("/attempts") &&
      response.request().method() === "POST" &&
      response.ok(),
    { timeout: 15000 },
  );
}

/** Prepare the current step, then submit a correct response. */
export async function completeCurrentStepCorrectly(page: Page) {
  const step = await getCurrentStep(page);

  if (step === 1) {
    const reveal = page.getByTestId("reveal-word-button");
    if (await reveal.isVisible().catch(() => false)) {
      await reveal.click();
    }
    const clap = page.getByTestId("clap-syllable-button");
    for (let i = 0; i < 5; i += 1) {
      await clap.click();
    }
  }

  if (step === 2) {
    const phonemes = ["/ih/", "/v/", "/ae/", "/p/", "/ah/", "/r/", "/ey/", "/sh/", "/ahn/"];
    for (const phoneme of phonemes) {
      await page.getByRole("button", { name: `Add sound ${phoneme}` }).first().click();
    }
  }

  if (step === 3) {
    for (const letter of "evaporation".split("")) {
      await page.getByRole("button", { name: `Letter tile ${letter}`, exact: true }).first().click();
    }
  }

  if (step === 4) {
    await page.locator("#morpheme-evapor").selectOption("to change into vapor");
    await page.locator("#morpheme--ation").selectOption("the process or result of");
  }

  if (step === 5) {
    const fallback = page.getByTestId("pronunciation-fallback-read-aloud");
    if (await fallback.isVisible().catch(() => false)) {
      await fallback.click();
    }
  }

  if (step === 6) {
    await page.getByRole("radio", { name: /Sunlight warming a puddle/i }).click();
  }

  if (step === 7) {
    await page
      .getByRole("radio", { name: /Liquid water changing into water vapor/i })
      .click();
  }

  if (step === 8) {
    const bankButton = page.getByRole("button", { name: /^evaporation$/i });
    if (await bankButton.isVisible().catch(() => false)) {
      await bankButton.click();
    } else {
      await page.getByLabel("Word to complete the sentence").fill("evaporation");
    }
  }

  if (step === 9) {
    const writeInput = page.getByLabel(/Type the word|Type what you wrote/i);
    await writeInput.fill("evaporation");
  }

  if (step === 10) {
    await page.getByTestId("application-choice-0").check();
  }

  const applyChoice = page.getByTestId("application-choice-0");
  if (step !== 10 && (await applyChoice.isVisible().catch(() => false))) {
    await applyChoice.check();
  }

  const submit = page.getByTestId("step-submit");
  await expect(submit).toBeEnabled({ timeout: 15000 });

  const attemptPromise = waitForAttemptResponse(page).catch(() => null);
  await submit.click();
  await attemptPromise;

  if (step === 10) {
    await expect(
      page.getByTestId("step-feedback").or(page.getByTestId("lesson-complete")),
    ).toBeVisible({ timeout: 15000 });
    return;
  }

  await expect(page.getByTestId("step-feedback").first()).toBeVisible({ timeout: 15000 });
}

export async function submitCorrectStep(page: Page) {
  await completeCurrentStepCorrectly(page);
}

export async function submitIncorrectStep(page: Page) {
  const step = await getCurrentStep(page);

  if (step === 1) {
    const reveal = page.getByTestId("reveal-word-button");
    if (await reveal.isVisible().catch(() => false)) {
      await reveal.click();
    }
    await page.getByTestId("clap-syllable-button").click();
    const attemptPromise = waitForAttemptResponse(page).catch(() => null);
    await page.getByTestId("step-submit").click();
    await attemptPromise;
  } else {
    const attemptPromise = waitForAttemptResponse(page).catch(() => null);
    await page.getByTestId("step-submit-incorrect").click();
    await attemptPromise;
  }

  await expect(page.getByTestId("step-feedback")).toBeVisible({ timeout: 15000 });
}

export async function advanceThroughSteps(page: Page, fromStep: number, toStep: number) {
  for (let step = fromStep; step <= toStep; step += 1) {
    await expect(page.getByTestId("step-indicator")).toContainText(String(step));
    await submitCorrectStep(page);
    if (step < toStep) {
      await page.getByTestId("step-continue").click();
    }
  }
}
