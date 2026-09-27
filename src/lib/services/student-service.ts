import { getRepository } from "@/lib/repositories";
import { getDueReviews } from "@/lib/learning/review-schedule";
import { calculateMultiUnitProgress, calculateStudentProgress } from "@/lib/learning/progress";
import type {
  Assignment,
  LearningSession,
  ReviewSchedule,
  StudentProgressSummary,
  Unit,
  UnitProgressSummary,
  VocabularyWord,
} from "@/lib/types";
import { SEED_IDS } from "@/lib/seed/seed-ids";

export interface StudentDashboard {
  studentId: string;
  displayName: string;
  progress: StudentProgressSummary;
  activeSessions: LearningSession[];
  reviewDueCount: number;
  journeyProgress: number;
  assignedUnits: Unit[];
}

export interface ReviewWordEntry {
  schedule: ReviewSchedule;
  word: VocabularyWord;
}

async function getAssignedWordIds(studentId: string): Promise<{
  unitIds: string[];
  wordIds: string[];
  assignments: Assignment[];
}> {
  const repo = await getRepository();
  const memberships = await repo.listClassMemberships();
  const studentClasses = memberships
    .filter((membership) => membership.userId === studentId && membership.role === "student")
    .map((membership) => membership.classId);

  const assignments = (
    await Promise.all(studentClasses.map((classId) => repo.listAssignments({ classId, status: "active" })))
  ).flat();

  const assignmentWords = (
    await Promise.all(assignments.map((assignment) => repo.listAssignmentWords(assignment.id)))
  ).flat();

  const unitIds = [...new Set(assignments.map((assignment) => assignment.unitId))];
  const wordIds = [...new Set(assignmentWords.map((entry) => entry.vocabularyWordId))];

  return { unitIds, wordIds, assignments };
}

export async function getStudentDashboard(studentId: string): Promise<StudentDashboard> {
  const repo = await getRepository();
  const user = await repo.getUser(studentId);
  if (!user) {
    throw new Error("Student not found.");
  }

  const profile = await repo.getStudentProfileByUserId(studentId);
  const { unitIds, wordIds, assignments } = await getAssignedWordIds(studentId);
  const masteryRecords = await repo.listStudentWordMastery({ studentId });
  const progress = calculateStudentProgress({
    studentId,
    masteryRecords,
    totalAssignedWords: wordIds.length,
    unitIds,
  });

  const activeSessions = await repo.listLearningSessions({
    studentId,
    status: "in_progress",
  });
  const sortedActiveSessions = [...activeSessions].sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  );

  const reviewSchedules = await repo.listReviewSchedules({ studentId });
  const dueReviews = getDueReviews(reviewSchedules, { studentId });

  const assignedUnits = (
    await Promise.all(unitIds.map((unitId) => repo.getUnit(unitId)))
  ).filter((unit): unit is Unit => unit !== null);

  return {
    studentId,
    displayName: user.displayName,
    progress,
    activeSessions: sortedActiveSessions,
    reviewDueCount: dueReviews.length,
    journeyProgress: profile?.journeyProgress ?? 0,
    assignedUnits,
  };
}

export async function getUnitProgress(
  studentId: string,
  unitId?: string,
): Promise<UnitProgressSummary[]> {
  const repo = await getRepository();
  const { unitIds, wordIds } = await getAssignedWordIds(studentId);
  const targetUnitIds = unitId ? [unitId] : unitIds;
  const masteryRecords = await repo.listStudentWordMastery({ studentId });
  const allWords = await repo.listVocabularyWords(undefined, true);

  const wordsPerUnit: Record<string, number> = {};
  for (const id of targetUnitIds) {
    const unitWordIds = new Set(
      allWords.filter((word) => word.unitId === id).map((word) => word.id),
    );
    wordsPerUnit[id] = wordIds.filter((wordId) => unitWordIds.has(wordId)).length;
  }

  return calculateMultiUnitProgress(studentId, masteryRecords, wordsPerUnit);
}

export async function getReviewWords(studentId: string): Promise<ReviewWordEntry[]> {
  const repo = await getRepository();
  const schedules = await repo.listReviewSchedules({ studentId });
  const due = getDueReviews(schedules, { studentId });

  const entries: ReviewWordEntry[] = [];
  for (const schedule of due) {
    const word = await repo.getVocabularyWord(schedule.vocabularyWordId);
    if (word) {
      entries.push({ schedule, word });
    }
  }

  return entries;
}

export async function getDemoStudents() {
  const repo = await getRepository();
  const students = await repo.listUsersByRole("student");
  const demoStudentIds = new Set(Object.values(SEED_IDS.users.students));
  return students.filter((student) => demoStudentIds.has(student.id as typeof SEED_IDS.users.students[keyof typeof SEED_IDS.users.students]));
}
