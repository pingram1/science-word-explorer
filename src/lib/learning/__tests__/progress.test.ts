import { describe, expect, it } from "vitest";
import {
  calculateMultiUnitProgress,
  calculateStudentProgress,
  calculateUnitProgress,
} from "@/lib/learning/progress";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type { StudentWordMastery } from "@/lib/types";

const masteryRecords: StudentWordMastery[] = [
  {
    id: "mastery-1",
    studentId: SEED_IDS.users.students.sofiaMartinez,
    vocabularyWordId: "word-1",
    unitId: SEED_IDS.units.waterCycle,
    weightedScore: 90,
    status: "mastered",
    sessionCount: 2,
    successfulWithoutHighHint: true,
    retrievalAttemptCompleted: true,
    essentialSkillsCompleted: true,
    lastSessionAt: "2026-07-28T00:00:00.000Z",
    masteredAt: "2026-07-28T00:00:00.000Z",
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-28T00:00:00.000Z",
  },
  {
    id: "mastery-2",
    studentId: SEED_IDS.users.students.sofiaMartinez,
    vocabularyWordId: "word-2",
    unitId: SEED_IDS.units.waterCycle,
    weightedScore: 55,
    status: "practicing",
    sessionCount: 1,
    successfulWithoutHighHint: false,
    retrievalAttemptCompleted: false,
    essentialSkillsCompleted: false,
    lastSessionAt: "2026-07-27T00:00:00.000Z",
    masteredAt: null,
    createdAt: "2026-07-20T00:00:00.000Z",
    updatedAt: "2026-07-27T00:00:00.000Z",
  },
  {
    id: "mastery-3",
    studentId: SEED_IDS.users.students.sofiaMartinez,
    vocabularyWordId: "word-3",
    unitId: SEED_IDS.units.ecosystems,
    weightedScore: 72,
    status: "nearly_mastered",
    sessionCount: 2,
    successfulWithoutHighHint: true,
    retrievalAttemptCompleted: false,
    essentialSkillsCompleted: true,
    lastSessionAt: "2026-07-26T00:00:00.000Z",
    masteredAt: null,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-26T00:00:00.000Z",
  },
  {
    id: "mastery-4",
    studentId: SEED_IDS.users.students.marcusJohnson,
    vocabularyWordId: "word-1",
    unitId: SEED_IDS.units.waterCycle,
    weightedScore: 40,
    status: "introduced",
    sessionCount: 1,
    successfulWithoutHighHint: false,
    retrievalAttemptCompleted: false,
    essentialSkillsCompleted: false,
    lastSessionAt: "2026-07-25T00:00:00.000Z",
    masteredAt: null,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-25T00:00:00.000Z",
  },
];

describe("calculateUnitProgress", () => {
  it("counts mastery statuses for a unit", () => {
    const progress = calculateUnitProgress(
      SEED_IDS.units.waterCycle,
      masteryRecords,
      6,
    );

    expect(progress.unitId).toBe(SEED_IDS.units.waterCycle);
    expect(progress.wordsMastered).toBe(1);
    expect(progress.wordsInProgress).toBe(2);
    expect(progress.totalWords).toBe(6);
    expect(progress.wordsNotStarted).toBe(3);
    expect(progress.percentComplete).toBe(17);
  });
});

describe("calculateStudentProgress", () => {
  it("summarizes progress across assigned words", () => {
    const progress = calculateStudentProgress({
      studentId: SEED_IDS.users.students.sofiaMartinez,
      masteryRecords,
      totalAssignedWords: 10,
      unitIds: [SEED_IDS.units.waterCycle, SEED_IDS.units.ecosystems],
    });

    expect(progress.studentId).toBe(SEED_IDS.users.students.sofiaMartinez);
    expect(progress.wordsMastered).toBe(1);
    expect(progress.wordsInProgress).toBe(2);
    expect(progress.wordsNotStarted).toBe(7);
    expect(progress.averageMasteryScore).toBe(72.33);
    expect(progress.activeUnits).toBe(2);
  });
});

describe("calculateMultiUnitProgress", () => {
  it("returns per-unit summaries for a student", () => {
    const summaries = calculateMultiUnitProgress(
      SEED_IDS.users.students.sofiaMartinez,
      masteryRecords,
      {
        [SEED_IDS.units.waterCycle]: 6,
        [SEED_IDS.units.ecosystems]: 8,
      },
    );

    expect(summaries).toHaveLength(2);
    expect(summaries[0].unitId).toBe(SEED_IDS.units.waterCycle);
    expect(summaries[1].unitId).toBe(SEED_IDS.units.ecosystems);
    expect(summaries[1].wordsMastered).toBe(0);
    expect(summaries[1].wordsInProgress).toBe(1);
  });
});
