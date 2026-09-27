import { expect, test } from "@playwright/test";
import { enterStudentDemo } from "./helpers";
import { SEED_IDS } from "../src/lib/seed/seed-ids";
import { SEED_WORD_IDS } from "../src/lib/seed/vocabulary";

test.describe("Student persona — scoring integrity", () => {
  test("client cannot fake a correct answer or skip to the last step", async ({ page }) => {
    await enterStudentDemo(page);

    const create = await page.request.post("/api/sessions", {
      data: {
        vocabularyWordId: SEED_WORD_IDS.evaporation,
        unitId: SEED_IDS.units.waterCycle,
      },
    });
    expect(create.ok()).toBe(true);
    const created = (await create.json()) as {
      data: { session: { id: string; currentStep: number } };
    };
    const sessionId = created.data.session.id;

    const spoof = await page.request.post(`/api/sessions/${sessionId}/attempts`, {
      data: {
        instructionalStep: 1,
        studentResponse: "1",
        isCorrect: true,
        correctResponse: "5",
      },
    });
    expect(spoof.ok()).toBe(true);
    const spoofBody = (await spoof.json()) as {
      data: { attempt: { isCorrect: boolean } };
    };
    expect(spoofBody.data.attempt.isCorrect).toBe(false);

    const skip = await page.request.patch(`/api/sessions/${sessionId}`, {
      data: { action: "completeStep", step: 10 },
    });
    expect(skip.status()).toBe(409);

    const futureStep = await page.request.post(`/api/sessions/${sessionId}/attempts`, {
      data: {
        instructionalStep: 10,
        studentResponse: "0",
        isCorrect: true,
      },
    });
    expect(futureStep.status()).toBe(409);
  });
});
