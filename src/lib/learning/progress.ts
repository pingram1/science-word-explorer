import type {
  ProgressSummary,
  StudentProgressSummary,
  StudentWordMastery,
  UnitProgressSummary,
  WordMasteryStatus,
} from "@/lib/types";

const IN_PROGRESS_STATUSES: readonly WordMasteryStatus[] = [
  "introduced",
  "practicing",
  "nearly_mastered",
  "needs_teacher_support",
] as const;

function countByStatus(
  records: StudentWordMastery[],
  statuses: readonly WordMasteryStatus[],
): number {
  return records.filter((record) => statuses.includes(record.status)).length;
}

function buildProgressSummary(
  records: StudentWordMastery[],
  totalWords: number,
): ProgressSummary {
  const wordsMastered = countByStatus(records, ["mastered"]);
  const wordsReviewDue = countByStatus(records, ["review_due"]);
  const wordsInProgress = countByStatus(records, IN_PROGRESS_STATUSES);
  const wordsNotStarted = Math.max(0, totalWords - records.length);

  const percentComplete =
    totalWords > 0 ? Math.round((wordsMastered / totalWords) * 100) : 0;

  return {
    totalWords,
    wordsMastered,
    wordsInProgress,
    wordsNotStarted,
    wordsReviewDue,
    percentComplete,
  };
}

/**
 * Calculates progress for a single science unit based on word mastery records.
 */
export function calculateUnitProgress(
  unitId: string,
  masteryRecords: StudentWordMastery[],
  totalWordsInUnit: number,
): UnitProgressSummary {
  const unitRecords = masteryRecords.filter((record) => record.unitId === unitId);

  return {
    unitId,
    ...buildProgressSummary(unitRecords, totalWordsInUnit),
  };
}

export interface CalculateStudentProgressInput {
  studentId: string;
  masteryRecords: StudentWordMastery[];
  totalAssignedWords: number;
  unitIds?: string[];
}

/**
 * Calculates overall student progress across assigned vocabulary.
 */
export function calculateStudentProgress(
  input: CalculateStudentProgressInput,
): StudentProgressSummary {
  const { studentId, masteryRecords, totalAssignedWords, unitIds = [] } = input;

  const studentRecords = masteryRecords.filter((record) => record.studentId === studentId);

  const summary = buildProgressSummary(studentRecords, totalAssignedWords);

  const averageMasteryScore =
    studentRecords.length > 0
      ? Math.round(
          (studentRecords.reduce((sum, record) => sum + record.weightedScore, 0) /
            studentRecords.length) *
            100,
        ) / 100
      : 0;

  const activeUnits =
    unitIds.length > 0
      ? unitIds.filter((unitId) =>
          studentRecords.some(
            (record) =>
              record.unitId === unitId &&
              record.status !== "not_started" &&
              record.status !== "mastered",
          ),
        ).length
      : new Set(
          studentRecords
            .filter(
              (record) =>
                record.status !== "not_started" && record.status !== "mastered",
            )
            .map((record) => record.unitId),
        ).size;

  return {
    studentId,
    ...summary,
    averageMasteryScore,
    activeUnits,
  };
}

/** Calculates combined progress across multiple units for a student. */
export function calculateMultiUnitProgress(
  studentId: string,
  masteryRecords: StudentWordMastery[],
  wordsPerUnit: Record<string, number>,
): UnitProgressSummary[] {
  return Object.entries(wordsPerUnit).map(([unitId, totalWords]) =>
    calculateUnitProgress(
      unitId,
      masteryRecords.filter((record) => record.studentId === studentId),
      totalWords,
    ),
  );
}
