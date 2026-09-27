import type {
  Class,
  LearningEvent,
  StudentWordMastery,
  User,
  VocabularyWord,
} from "@/lib/types";

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue =
    value instanceof Date
      ? value.toISOString()
      : Array.isArray(value)
        ? value.join("; ")
        : String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function toCsvRow(values: unknown[]): string {
  return values.map(escapeCsvValue).join(",");
}

function toCsvDocument(headers: string[], rows: unknown[][]): string {
  return [toCsvRow(headers), ...rows.map((row) => toCsvRow(row))].join("\n");
}

export interface ClassReportRow {
  classId: string;
  className: string;
  studentCount: number;
  wordsMastered: number;
  averageMasteryScore: number;
  reviewCompletionRate: number;
  studentsNeedingSupport: number;
}

export interface StudentReportRow {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  wordsMastered: number;
  wordsInProgress: number;
  averageMasteryScore: number;
  reviewDueCount: number;
  lastActivityAt: string | null;
}

export interface WordReportRow {
  vocabularyWordId: string;
  word: string;
  unitId: string;
  studentsAssigned: number;
  studentsMastered: number;
  masteryRate: number;
  averageAttempts: number;
  commonErrors: string;
}

export interface EventReportRow {
  eventId: string;
  timestamp: string;
  studentId: string;
  classId: string | null;
  unitId: string;
  vocabularyWordId: string;
  instructionalStep: number;
  skillCategory: string;
  isCorrect: boolean;
  errorCategories: string;
  responseTimeMs: number;
  hintsUsed: number;
}

/**
 * Exports a class overview report as CSV.
 */
export function exportClassReportCsv(rows: ClassReportRow[]): string {
  return toCsvDocument(
    [
      "class_id",
      "class_name",
      "student_count",
      "words_mastered",
      "average_mastery_score",
      "review_completion_rate",
      "students_needing_support",
    ],
    rows.map((row) => [
      row.classId,
      row.className,
      row.studentCount,
      row.wordsMastered,
      row.averageMasteryScore,
      row.reviewCompletionRate,
      row.studentsNeedingSupport,
    ]),
  );
}

/**
 * Exports a student progress report as CSV.
 */
export function exportStudentReportCsv(rows: StudentReportRow[]): string {
  return toCsvDocument(
    [
      "student_id",
      "student_name",
      "class_id",
      "class_name",
      "words_mastered",
      "words_in_progress",
      "average_mastery_score",
      "review_due_count",
      "last_activity_at",
    ],
    rows.map((row) => [
      row.studentId,
      row.studentName,
      row.classId,
      row.className,
      row.wordsMastered,
      row.wordsInProgress,
      row.averageMasteryScore,
      row.reviewDueCount,
      row.lastActivityAt,
    ]),
  );
}

/**
 * Exports a vocabulary word analysis report as CSV.
 */
export function exportWordReportCsv(rows: WordReportRow[]): string {
  return toCsvDocument(
    [
      "vocabulary_word_id",
      "word",
      "unit_id",
      "students_assigned",
      "students_mastered",
      "mastery_rate",
      "average_attempts",
      "common_errors",
    ],
    rows.map((row) => [
      row.vocabularyWordId,
      row.word,
      row.unitId,
      row.studentsAssigned,
      row.studentsMastered,
      row.masteryRate,
      row.averageAttempts,
      row.commonErrors,
    ]),
  );
}

/**
 * Exports event-level learning analytics as CSV.
 */
export function exportEventReportCsv(rows: EventReportRow[]): string {
  return toCsvDocument(
    [
      "event_id",
      "timestamp",
      "student_id",
      "class_id",
      "unit_id",
      "vocabulary_word_id",
      "instructional_step",
      "skill_category",
      "is_correct",
      "error_categories",
      "response_time_ms",
      "hints_used",
    ],
    rows.map((row) => [
      row.eventId,
      row.timestamp,
      row.studentId,
      row.classId,
      row.unitId,
      row.vocabularyWordId,
      row.instructionalStep,
      row.skillCategory,
      row.isCorrect,
      row.errorCategories,
      row.responseTimeMs,
      row.hintsUsed,
    ]),
  );
}

/** Builds class report rows from domain entities. */
export function buildClassReportRows(
  classes: Class[],
  masteryRecords: StudentWordMastery[],
  studentUsers: User[],
): ClassReportRow[] {
  return classes.map((classItem) => {
    const classStudentIds = studentUsers.map((user) => user.id);
    const records = masteryRecords.filter((record) =>
      classStudentIds.includes(record.studentId),
    );

    const wordsMastered = records.filter((record) => record.status === "mastered").length;
    const averageMasteryScore =
      records.length > 0
        ? Math.round(
            (records.reduce((sum, record) => sum + record.weightedScore, 0) /
              records.length) *
              100,
          ) / 100
        : 0;

    const studentsNeedingSupport = new Set(
      records
        .filter((record) => record.status === "needs_teacher_support")
        .map((record) => record.studentId),
    ).size;

    return {
      classId: classItem.id,
      className: classItem.name,
      studentCount: classStudentIds.length,
      wordsMastered,
      averageMasteryScore,
      reviewCompletionRate: 0,
      studentsNeedingSupport,
    };
  });
}

/** Maps learning events to export rows. */
export function mapEventsToReportRows(events: LearningEvent[]): EventReportRow[] {
  return events.map((event) => ({
    eventId: event.id,
    timestamp: event.timestamp,
    studentId: event.studentId,
    classId: event.classId,
    unitId: event.unitId,
    vocabularyWordId: event.vocabularyWordId,
    instructionalStep: event.instructionalStep,
    skillCategory: event.skillCategory,
    isCorrect: event.isCorrect,
    errorCategories: event.errorCategories.join("; "),
    responseTimeMs: event.responseTimeMs,
    hintsUsed: event.hintsUsed,
  }));
}

/** Maps vocabulary words and mastery data to word report rows. */
export function buildWordReportRows(
  words: VocabularyWord[],
  masteryRecords: StudentWordMastery[],
  attemptsByWord: Record<string, number>,
): WordReportRow[] {
  return words.map((word) => {
    const records = masteryRecords.filter(
      (record) => record.vocabularyWordId === word.id,
    );
    const studentsMastered = records.filter((record) => record.status === "mastered").length;
    const studentsAssigned = records.length;

    return {
      vocabularyWordId: word.id,
      word: word.word,
      unitId: word.unitId,
      studentsAssigned,
      studentsMastered,
      masteryRate:
        studentsAssigned > 0
          ? Math.round((studentsMastered / studentsAssigned) * 100)
          : 0,
      averageAttempts: attemptsByWord[word.id] ?? 0,
      commonErrors: word.commonSpellingErrors.join("; "),
    };
  });
}
