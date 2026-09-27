import { getRepository } from "@/lib/repositories";
import {
  buildClassReportRows,
  buildWordReportRows,
  exportClassReportCsv,
  exportEventReportCsv,
  exportStudentReportCsv,
  exportWordReportCsv,
  mapEventsToReportRows,
  type ClassReportRow,
  type EventReportRow,
  type StudentReportRow,
  type WordReportRow,
} from "@/lib/learning/csv-export";
import { calculateStudentProgress } from "@/lib/learning/progress";
import { getDueReviews } from "@/lib/learning/review-schedule";
import type {
  InterventionGroup,
  LearningEvent,
  StudentSupportProfile,
  StudentWordMastery,
  TeacherNote,
  User,
  VocabularyWord,
} from "@/lib/types";
import { SEED_IDS } from "@/lib/seed/seed-ids";

export interface TeacherDashboard {
  teacherId: string;
  displayName: string;
  classId: string;
  className: string;
  studentCount: number;
  students: Array<{
    user: User;
    progress: ReturnType<typeof calculateStudentProgress>;
    reviewDueCount: number;
    needsSupport: boolean;
  }>;
  interventionGroupCount: number;
}

export interface StudentDetail {
  user: User;
  progress: ReturnType<typeof calculateStudentProgress>;
  masteryRecords: StudentWordMastery[];
  recentEvents: LearningEvent[];
  notes: TeacherNote[];
  supportProfile: StudentSupportProfile | null;
}

export interface WordAnalysis {
  word: VocabularyWord;
  masteryRecords: StudentWordMastery[];
  totalAttempts: number;
  averageAccuracy: number;
  commonErrors: string[];
}

export interface InterventionGroupDetail extends InterventionGroup {
  members: User[];
}

export type ExportType = "class" | "student" | "word" | "events";

async function getTeacherClass(teacherId: string) {
  const repo = await getRepository();
  const classes = await repo.listClassesByTeacher(teacherId);
  const primaryClass =
    classes.find((classItem) => classItem.id === SEED_IDS.class.riveraPeriod3) ??
    classes[0];

  if (!primaryClass) {
    throw new Error("No class found for teacher.");
  }

  return primaryClass;
}

export async function getTeacherDashboard(teacherId: string): Promise<TeacherDashboard> {
  const repo = await getRepository();
  const teacher = await repo.getUser(teacherId);
  if (!teacher) {
    throw new Error("Teacher not found.");
  }

  const classItem = await getTeacherClass(teacherId);
  const students = await repo.listStudentsInClass(classItem.id);
  const allMastery = await repo.listStudentWordMastery();
  const assignmentWords = (
    await repo.listAssignments({ classId: classItem.id, status: "active" })
  ).flatMap(async (assignment) => repo.listAssignmentWords(assignment.id));
  const wordIdLists = await Promise.all(assignmentWords);
  const assignedWordIds = [...new Set(wordIdLists.flat().map((entry) => entry.vocabularyWordId))];
  const groups = await repo.listInterventionGroups(classItem.id);

  const studentSummaries = await Promise.all(
    students.map(async (student) => {
      const masteryRecords = allMastery.filter((record) => record.studentId === student.id);
      const progress = calculateStudentProgress({
        studentId: student.id,
        masteryRecords,
        totalAssignedWords: assignedWordIds.length,
      });
      const schedules = await repo.listReviewSchedules({ studentId: student.id });
      const reviewDueCount = getDueReviews(schedules, { studentId: student.id }).length;
      const needsSupport = masteryRecords.some(
        (record) => record.status === "needs_teacher_support",
      );

      return { user: student, progress, reviewDueCount, needsSupport };
    }),
  );

  return {
    teacherId,
    displayName: teacher.displayName,
    classId: classItem.id,
    className: classItem.name,
    studentCount: students.length,
    students: studentSummaries,
    interventionGroupCount: groups.length,
  };
}

export async function getStudentDetail(
  teacherId: string,
  studentId: string,
): Promise<StudentDetail> {
  const repo = await getRepository();
  const user = await repo.getUser(studentId);
  if (!user) {
    throw new Error("Student not found.");
  }

  const classItem = await getTeacherClass(teacherId);
  const assignments = await repo.listAssignments({ classId: classItem.id, status: "active" });
  const assignmentWordLists = await Promise.all(
    assignments.map((assignment) => repo.listAssignmentWords(assignment.id)),
  );
  const assignedWordIds = [...new Set(assignmentWordLists.flat().map((entry) => entry.vocabularyWordId))];

  const masteryRecords = await repo.listStudentWordMastery({ studentId });
  const progress = calculateStudentProgress({
    studentId,
    masteryRecords,
    totalAssignedWords: assignedWordIds.length,
  });
  const recentEvents = (await repo.listLearningEvents({ studentId }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);
  const notes = await repo.listTeacherNotes({ teacherId, studentId });
  const supportProfile = await repo.getSupportProfileByStudentId(studentId);

  return {
    user,
    progress,
    masteryRecords,
    recentEvents,
    notes,
    supportProfile,
  };
}

export async function getWordAnalysis(wordId: string): Promise<WordAnalysis> {
  const repo = await getRepository();
  const word = await repo.getVocabularyWord(wordId);
  if (!word) {
    throw new Error("Vocabulary word not found.");
  }

  const masteryRecords = (await repo.listStudentWordMastery()).filter(
    (record) => record.vocabularyWordId === wordId,
  );
  const attempts = await repo.listLearningAttempts({ vocabularyWordId: wordId });
  const correctAttempts = attempts.filter((attempt) => attempt.isCorrect).length;
  const averageAccuracy =
    attempts.length > 0 ? Math.round((correctAttempts / attempts.length) * 100) : 0;

  const errorCounts = new Map<string, number>();
  for (const attempt of attempts) {
    for (const error of attempt.errorCategories) {
      errorCounts.set(error, (errorCounts.get(error) ?? 0) + 1);
    }
  }

  const commonErrors = [...errorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([error]) => error);

  return {
    word,
    masteryRecords,
    totalAttempts: attempts.length,
    averageAccuracy,
    commonErrors: commonErrors.length > 0 ? commonErrors : word.commonSpellingErrors,
  };
}

export async function getInterventionGroups(
  teacherId: string,
): Promise<InterventionGroupDetail[]> {
  const repo = await getRepository();
  const classItem = await getTeacherClass(teacherId);
  const groups = await repo.listInterventionGroups(classItem.id);
  const members = await repo.listInterventionGroupMembers();

  return Promise.all(
    groups.map(async (group) => {
      const groupMemberIds = members
        .filter((member) => member.groupId === group.id)
        .map((member) => member.studentId);
      const memberUsers = (
        await Promise.all(groupMemberIds.map((id) => repo.getUser(id)))
      ).filter((user): user is User => user !== null);

      return { ...group, members: memberUsers };
    }),
  );
}

export async function exportCsv(
  teacherId: string,
  type: ExportType,
): Promise<{ filename: string; content: string }> {
  const repo = await getRepository();
  const classItem = await getTeacherClass(teacherId);
  const students = await repo.listStudentsInClass(classItem.id);
  const masteryRecords = await repo.listStudentWordMastery();
  const words = await repo.listVocabularyWords(undefined, true);
  const events = await repo.listLearningEvents({ classId: classItem.id });
  const attempts = await repo.listLearningAttempts();

  const attemptsByWord: Record<string, number> = {};
  for (const attempt of attempts) {
    attemptsByWord[attempt.vocabularyWordId] =
      (attemptsByWord[attempt.vocabularyWordId] ?? 0) + 1;
  }

  switch (type) {
    case "class": {
      const rows: ClassReportRow[] = buildClassReportRows(
        [classItem],
        masteryRecords,
        students,
      );
      return {
        filename: `${classItem.id}-class-report.csv`,
        content: exportClassReportCsv(rows),
      };
    }
    case "student": {
      const rows: StudentReportRow[] = students.map((student) => {
        const records = masteryRecords.filter((record) => record.studentId === student.id);
        const wordsMastered = records.filter((record) => record.status === "mastered").length;
        const wordsInProgress = records.filter(
          (record) => record.status !== "mastered" && record.status !== "not_started",
        ).length;
        const averageMasteryScore =
          records.length > 0
            ? Math.round(
                (records.reduce((sum, record) => sum + record.weightedScore, 0) / records.length) *
                  100,
              ) / 100
            : 0;
        const reviewDueCount = records.filter((record) => record.status === "review_due").length;
        const lastActivity = records
          .map((record) => record.lastSessionAt)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null;

        return {
          studentId: student.id,
          studentName: student.displayName,
          classId: classItem.id,
          className: classItem.name,
          wordsMastered,
          wordsInProgress,
          averageMasteryScore,
          reviewDueCount,
          lastActivityAt: lastActivity,
        };
      });
      return {
        filename: `${classItem.id}-students.csv`,
        content: exportStudentReportCsv(rows),
      };
    }
    case "word": {
      const rows: WordReportRow[] = buildWordReportRows(words, masteryRecords, attemptsByWord);
      return {
        filename: `${classItem.id}-words.csv`,
        content: exportWordReportCsv(rows),
      };
    }
    case "events": {
      const rows: EventReportRow[] = mapEventsToReportRows(events);
      return {
        filename: `${classItem.id}-events.csv`,
        content: exportEventReportCsv(rows),
      };
    }
    default:
      throw new Error(`Unknown export type: ${type as string}`);
  }
}
