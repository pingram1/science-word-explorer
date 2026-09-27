import { getSupportRecommendations, applyAdaptiveRules } from "@/lib/learning/adaptive";
import { calculateMultiUnitProgress, calculateStudentProgress } from "@/lib/learning/progress";
import { canTeacherAccessClass, PermissionError } from "@/lib/learning/permissions";
import { getRepository } from "@/lib/repositories";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type {
  LearningEvent,
  SkillCategory,
  StudentWordMastery,
  User,
  WordMasteryStatus,
} from "@/lib/types";
import { ALL_SKILL_CATEGORIES } from "@/lib/types";
import {
  formatShortDate,
  formatSkillLabel,
  formatErrorLabel,
  STEP_LABELS,
} from "@/lib/teacher/formatters";
import type {
  MasteryTrendPoint,
  SkillProfilePoint,
  StudentTableRow,
  TeacherDashboardData,
  TeacherDashboardFilters,
  UnitProgressPoint,
} from "@/lib/teacher/types";

function filterMasteryRecords(
  records: StudentWordMastery[],
  filters: TeacherDashboardFilters,
  studentIds: Set<string>,
): StudentWordMastery[] {
  return records.filter((record) => {
    if (!studentIds.has(record.studentId)) return false;
    if (filters.unitId && record.unitId !== filters.unitId) return false;
    if (filters.studentId && record.studentId !== filters.studentId) return false;
    if (filters.masteryStatus && record.status !== filters.masteryStatus) return false;
    return true;
  });
}

function filterEvents(
  events: LearningEvent[],
  filters: TeacherDashboardFilters,
  studentIds: Set<string>,
): LearningEvent[] {
  return events.filter((event) => {
    if (!studentIds.has(event.studentId)) return false;
    if (filters.classId && event.classId !== filters.classId) return false;
    if (filters.unitId && event.unitId !== filters.unitId) return false;
    if (filters.studentId && event.studentId !== filters.studentId) return false;
    if (filters.skillCategory && event.skillCategory !== filters.skillCategory) return false;
    if (filters.startDate && event.timestamp < filters.startDate) return false;
    if (filters.endDate && event.timestamp > filters.endDate) return false;
    return true;
  });
}

function buildMasteryTrend(events: LearningEvent[]): MasteryTrendPoint[] {
  const byDate = new Map<string, { scores: number[]; mastered: number }>();

  for (const event of events) {
    const dateKey = event.timestamp.slice(0, 10);
    const entry = byDate.get(dateKey) ?? { scores: [], mastered: 0 };
    entry.scores.push(event.isCorrect ? 100 : 0);
    if (event.isCorrect && event.instructionalStep === 10) {
      entry.mastered += 1;
    }
    byDate.set(dateKey, entry);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, data]) => ({
      date,
      label: formatShortDate(`${date}T12:00:00.000Z`),
      averageScore:
        data.scores.length > 0
          ? Math.round(
              data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
            )
          : 0,
      masteredCount: data.mastered,
    }));
}

function buildSkillProfile(events: LearningEvent[]): SkillProfilePoint[] {
  const bySkill = new Map<SkillCategory, { correct: number; total: number }>();

  for (const skill of ALL_SKILL_CATEGORIES) {
    bySkill.set(skill, { correct: 0, total: 0 });
  }

  for (const event of events) {
    const entry = bySkill.get(event.skillCategory)!;
    entry.total += 1;
    if (event.isCorrect) entry.correct += 1;
  }

  return ALL_SKILL_CATEGORIES.map((skill) => {
    const entry = bySkill.get(skill)!;
    return {
      skill,
      label: formatSkillLabel(skill),
      score:
        entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0,
    };
  }).filter((point) => point.score > 0 || events.some((e) => e.skillCategory === point.skill));
}

function buildUnitProgress(
  masteryRecords: StudentWordMastery[],
  wordsPerUnit: Record<string, number>,
  unitTitles: Record<string, string>,
): UnitProgressPoint[] {
  return Object.entries(wordsPerUnit).map(([unitId, totalWords]) => {
    const unitRecords = masteryRecords.filter((record) => record.unitId === unitId);
    const wordsMastered = unitRecords.filter((record) => record.status === "mastered").length;
    const percentComplete =
      totalWords > 0 ? Math.round((wordsMastered / (totalWords * Math.max(1, new Set(unitRecords.map((r) => r.studentId)).size || 1))) * 100) : 0;

    const studentCount = new Set(unitRecords.map((r) => r.studentId)).size || 1;
    const aggregatePercent =
      totalWords > 0 && studentCount > 0
        ? Math.round((wordsMastered / (totalWords * studentCount)) * 100)
        : 0;

    return {
      unitId,
      unitTitle: unitTitles[unitId] ?? unitId,
      percentComplete: aggregatePercent,
      wordsMastered,
      totalWords: totalWords * studentCount,
    };
  });
}

function buildStudentRows(
  students: User[],
  masteryRecords: StudentWordMastery[],
  reviewDueByStudent: Map<string, number>,
  lastActivityByStudent: Map<string, string>,
  totalWords: number,
): StudentTableRow[] {
  return students.map((student) => {
    const records = masteryRecords.filter((record) => record.studentId === student.id);
    const progress = calculateStudentProgress({
      studentId: student.id,
      masteryRecords: records,
      totalAssignedWords: totalWords,
    });

    return {
      id: student.id,
      displayName: student.displayName,
      wordsMastered: progress.wordsMastered,
      wordsInProgress: progress.wordsInProgress,
      averageMasteryScore: progress.averageMasteryScore,
      reviewDueCount: reviewDueByStudent.get(student.id) ?? 0,
      lastActivityAt: lastActivityByStudent.get(student.id) ?? null,
      needsSupport: records.some((record) => record.status === "needs_teacher_support"),
    };
  });
}

export async function getTeacherDashboard(
  filters: TeacherDashboardFilters = {},
  actor?: Pick<User, "id" | "role">,
): Promise<TeacherDashboardData> {
  const repo = await getRepository();

  const allClasses = await repo.listClasses();
  const units = await repo.listUnits(true);
  const allWords = await repo.listVocabularyWords(undefined, true);
  const memberships = await repo.listClassMemberships();

  const accessibleClasses =
    !actor || actor.role === "admin"
      ? allClasses
      : allClasses.filter((classItem) =>
          canTeacherAccessClass(
            { actor, classMemberships: memberships },
            classItem.id,
          ),
        );

  if (filters.classId) {
    const allowed = accessibleClasses.some((classItem) => classItem.id === filters.classId);
    if (!allowed) {
      throw new PermissionError("Teacher does not have access to this class.");
    }
  }

  const classId = filters.classId ?? accessibleClasses[0]?.id ?? SEED_IDS.class.riveraPeriod3;
  const classStudents = await repo.listStudentsInClass(classId);
  const studentIds = new Set(classStudents.map((student) => student.id));

  const allMastery = await repo.listStudentWordMastery();
  const masteryRecords = filterMasteryRecords(allMastery, filters, studentIds);

  const events = filterEvents(
    await repo.listLearningEvents({ classId }),
    filters,
    studentIds,
  );

  const reviewSchedules = await repo.listReviewSchedules({ isDue: true });
  const reviewDueByStudent = new Map<string, number>();
  for (const schedule of reviewSchedules) {
    if (!studentIds.has(schedule.studentId)) continue;
    reviewDueByStudent.set(
      schedule.studentId,
      (reviewDueByStudent.get(schedule.studentId) ?? 0) + 1,
    );
  }

  const sessions = await repo.listLearningSessions({ status: "in_progress" });
  const activeSessions = sessions.filter((session) => studentIds.has(session.studentId)).length;

  const lastActivityByStudent = new Map<string, string>();
  for (const event of events) {
    const existing = lastActivityByStudent.get(event.studentId);
    if (!existing || event.timestamp > existing) {
      lastActivityByStudent.set(event.studentId, event.timestamp);
    }
  }

  const wordsPerUnit: Record<string, number> = {};
  const unitTitles: Record<string, string> = {};
  for (const unit of units) {
    unitTitles[unit.id] = unit.title;
    wordsPerUnit[unit.id] = allWords.filter((word) => word.unitId === unit.id).length;
  }

  const totalAssignedWords = Object.values(wordsPerUnit).reduce((sum, count) => sum + count, 0);

  const averageMastery =
    masteryRecords.length > 0
      ? Math.round(
          (masteryRecords.reduce((sum, record) => sum + record.weightedScore, 0) /
            masteryRecords.length) *
            100,
        ) / 100
      : 0;

  const masteryStatuses: WordMasteryStatus[] = [
    "not_started",
    "introduced",
    "practicing",
    "nearly_mastered",
    "mastered",
    "review_due",
    "needs_teacher_support",
  ];

  return {
    stats: {
      totalStudents: classStudents.length,
      wordsMastered: masteryRecords.filter((record) => record.status === "mastered").length,
      averageMastery,
      reviewDue: [...reviewDueByStudent.values()].reduce((sum, count) => sum + count, 0),
      needsSupport: masteryRecords.filter((record) => record.status === "needs_teacher_support")
        .length,
      activeSessions,
    },
    filterOptions: {
      classes: accessibleClasses,
      units,
      students: classStudents,
      skills: [...ALL_SKILL_CATEGORIES],
      masteryStatuses,
    },
    masteryTrend: buildMasteryTrend(events),
    skillProfile: buildSkillProfile(events),
    unitProgress: buildUnitProgress(masteryRecords, wordsPerUnit, unitTitles),
    students: buildStudentRows(
      classStudents,
      masteryRecords,
      reviewDueByStudent,
      lastActivityByStudent,
      totalAssignedWords,
    ),
  };
}

export async function getStudentDetail(studentId: string) {
  const repo = await getRepository();
  const student = await repo.getUser(studentId);
  if (!student) return null;

  const profile = await repo.getStudentProfileByUserId(studentId);
  if (!profile) return null;

  const units = await repo.listUnits(true);
  const allWords = await repo.listVocabularyWords(undefined, true);
  const wordsPerUnit: Record<string, number> = {};
  const unitTitles: Record<string, string> = {};
  for (const unit of units) {
    unitTitles[unit.id] = unit.title;
    wordsPerUnit[unit.id] = allWords.filter((word) => word.unitId === unit.id).length;
  }

  const masteryRecords = await repo.listStudentWordMastery({ studentId });
  const totalAssignedWords = Object.values(wordsPerUnit).reduce((sum, count) => sum + count, 0);
  const progress = calculateStudentProgress({
    studentId,
    masteryRecords,
    totalAssignedWords,
    unitIds: units.map((unit) => unit.id),
  });

  const unitProgress = calculateMultiUnitProgress(studentId, masteryRecords, wordsPerUnit).map(
    (unit) => ({
      unitId: unit.unitId,
      unitTitle: unitTitles[unit.unitId] ?? unit.unitId,
      percentComplete: unit.percentComplete,
      wordsMastered: unit.wordsMastered,
      totalWords: unit.totalWords,
    }),
  );

  const wordMap = new Map(allWords.map((word) => [word.id, word]));
  const wordStatuses = masteryRecords.map((record) => {
    const word = wordMap.get(record.vocabularyWordId);
    return {
      vocabularyWordId: record.vocabularyWordId,
      word: word?.word ?? record.vocabularyWordId,
      unitTitle: unitTitles[record.unitId] ?? record.unitId,
      status: record.status,
      weightedScore: record.weightedScore,
      lastSessionAt: record.lastSessionAt,
    };
  });

  const skillRecords = await repo.listStudentSkillMastery({ studentId });
  const skillProfile: SkillProfilePoint[] = skillRecords.map((record) => ({
    skill: record.skillCategory,
    label: formatSkillLabel(record.skillCategory),
    score: record.score,
  }));

  const sessions = (await repo.listLearningSessions({ studentId }))
    .toSorted((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map((session) => ({
      ...session,
      word: wordMap.get(session.vocabularyWordId)?.word ?? session.vocabularyWordId,
    }));
  const events = await repo.listLearningEvents({ studentId });
  const attempts = await repo.listLearningAttempts({ studentId });

  const byDate = new Map<string, { correct: number; total: number }>();
  for (const event of events) {
    const dateKey = event.timestamp.slice(0, 10);
    const entry = byDate.get(dateKey) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (event.isCorrect) entry.correct += 1;
    byDate.set(dateKey, entry);
  }

  const accuracyTrend = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, data]) => ({
      date,
      label: formatShortDate(`${date}T12:00:00.000Z`),
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      attempts: data.total,
    }));

  const errorCounts = new Map<string, number>();
  for (const event of events) {
    for (const error of event.errorCategories) {
      errorCounts.set(error, (errorCounts.get(error) ?? 0) + 1);
    }
  }

  const errorSummary = [...errorCounts.entries()]
    .map(([errorCategory, count]) => ({
      errorCategory: errorCategory as import("@/lib/types").ErrorCategory,
      label: formatErrorLabel(errorCategory as import("@/lib/types").ErrorCategory),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const supportProfile = await repo.getSupportProfileByStudentId(studentId);
  let supportRecommendations: import("@/lib/types").SupportRecommendation[] = [];
  let adaptiveExplanations: string[] = [];

  if (supportProfile && attempts.length > 0) {
    const latestAttempt = attempts[attempts.length - 1];
    const adaptiveResult = applyAdaptiveRules({
      skillCategory: latestAttempt.skillCategory,
      recentAttempts: attempts,
      currentSupportProfile: supportProfile,
      supportLevel: profile.defaultSupportLevel,
    });
    adaptiveExplanations = adaptiveResult.explanations;
    supportRecommendations = getSupportRecommendations({
      skillCategory: latestAttempt.skillCategory,
      recentAttempts: attempts,
      currentSupportProfile: supportProfile,
      supportLevel: profile.defaultSupportLevel,
    });
  }

  const reviewSchedules = await repo.listReviewSchedules({ studentId });
  const interventionGroups = await repo.listInterventionGroups();
  const allMembers = await repo.listInterventionGroupMembers();
  const studentGroups = interventionGroups
    .filter((group) => allMembers.some((m) => m.groupId === group.id && m.studentId === studentId))
    .map((group) => ({
      ...group,
      members: allMembers.filter((member) => member.groupId === group.id),
    }));

  const notes = await repo.listTeacherNotes({ studentId });

  return {
    student,
    profile: {
      gradeLevel: profile.gradeLevel,
      defaultSupportLevel: profile.defaultSupportLevel,
      journeyProgress: profile.journeyProgress,
    },
    progress: {
      totalWords: progress.totalWords,
      wordsMastered: progress.wordsMastered,
      wordsInProgress: progress.wordsInProgress,
      wordsNotStarted: progress.wordsNotStarted,
      wordsReviewDue: progress.wordsReviewDue,
      percentComplete: progress.percentComplete,
      averageMasteryScore: progress.averageMasteryScore,
    },
    unitProgress,
    wordStatuses,
    skillProfile,
    sessions,
    accuracyTrend,
    errorSummary,
    supportRecommendations,
    adaptiveExplanations,
    reviewSchedules,
    interventionGroups: studentGroups,
    notes,
  };
}

export async function getWordAnalysis(wordId: string, actor?: Pick<User, "id" | "role">) {
  const repo = await getRepository();
  const word = await repo.getVocabularyWord(wordId);
  if (!word) return null;

  const unit = await repo.getUnit(word.unitId);
  const masteryRecords = await repo.listStudentWordMastery({ unitId: word.unitId });
  const memberships = await repo.listClassMemberships();
  const accessibleStudentIds = new Set(
    !actor || actor.role === "admin"
      ? memberships.filter((membership) => membership.role === "student").map((m) => m.userId)
      : memberships
          .filter(
            (membership) =>
              membership.role === "student" &&
              canTeacherAccessClass({ actor, classMemberships: memberships }, membership.classId),
          )
          .map((membership) => membership.userId),
  );
  const wordRecords = masteryRecords.filter(
    (record) =>
      record.vocabularyWordId === wordId && accessibleStudentIds.has(record.studentId),
  );
  const events = (await repo.listLearningEvents({ vocabularyWordId: wordId })).filter((event) =>
    accessibleStudentIds.has(event.studentId),
  );
  const attempts = (await repo.listLearningAttempts({ vocabularyWordId: wordId })).filter(
    (attempt) => accessibleStudentIds.has(attempt.studentId),
  );
  const users = await repo.listUsers();

  const studentsMastered = wordRecords.filter((record) => record.status === "mastered").length;
  const studentsAssigned = wordRecords.length;
  const averageScore =
    wordRecords.length > 0
      ? Math.round(
          (wordRecords.reduce((sum, record) => sum + record.weightedScore, 0) /
            wordRecords.length) *
            100,
        ) / 100
      : 0;

  const skillRecords = (await repo.listStudentSkillMastery({ vocabularyWordId: wordId })).filter(
    (record) => accessibleStudentIds.has(record.studentId),
  );
  const skillMap = new Map<string, { total: number; count: number }>();
  for (const record of skillRecords) {
    const entry = skillMap.get(record.skillCategory) ?? { total: 0, count: 0 };
    entry.total += record.score;
    entry.count += 1;
    skillMap.set(record.skillCategory, entry);
  }

  const skillBreakdown: SkillProfilePoint[] = [...skillMap.entries()].map(
    ([skill, data]) => ({
      skill: skill as SkillCategory,
      label: formatSkillLabel(skill as SkillCategory),
      score: data.count > 0 ? Math.round(data.total / data.count) : 0,
    }),
  );

  const stepStats = Array.from({ length: 10 }, (_, index) => {
    const step = index + 1;
    const stepEvents = events.filter((event) => event.instructionalStep === step);
    const errorCount = stepEvents.filter((event) => !event.isCorrect).length;
    return {
      instructionalStep: step,
      stepLabel: STEP_LABELS[index] ?? `Step ${step}`,
      errorCount,
      attemptCount: stepEvents.length,
      errorRate:
        stepEvents.length > 0 ? Math.round((errorCount / stepEvents.length) * 100) : 0,
    };
  });

  const userMap = new Map(users.map((user) => [user.id, user.displayName]));
  const errorsByStudent = new Map<string, Set<import("@/lib/types").ErrorCategory>>();
  for (const event of events) {
    if (event.isCorrect) continue;
    const set = errorsByStudent.get(event.studentId) ?? new Set();
    for (const error of event.errorCategories) set.add(error);
    errorsByStudent.set(event.studentId, set);
  }

  const attemptCountByStudent = new Map<string, number>();
  for (const attempt of attempts) {
    attemptCountByStudent.set(
      attempt.studentId,
      (attemptCountByStudent.get(attempt.studentId) ?? 0) + 1,
    );
  }

  const students = wordRecords.map((record) => ({
    studentId: record.studentId,
    displayName: userMap.get(record.studentId) ?? record.studentId,
    status: record.status,
    weightedScore: record.weightedScore,
    attemptCount: attemptCountByStudent.get(record.studentId) ?? 0,
    commonErrors: [...(errorsByStudent.get(record.studentId) ?? [])],
  }));

  return {
    word,
    unitTitle: unit?.title ?? word.unitId,
    stats: {
      studentsAssigned,
      studentsMastered,
      masteryRate:
        studentsAssigned > 0 ? Math.round((studentsMastered / studentsAssigned) * 100) : 0,
      averageAttempts:
        attempts.length > 0 && studentsAssigned > 0
          ? Math.round(attempts.length / studentsAssigned)
          : 0,
      averageScore,
    },
    skillBreakdown,
    errorHeatmap: stepStats,
    students,
  };
}

export async function getInterventionPageData(classId?: string, actor?: Pick<User, "id" | "role">) {
  const repo = await getRepository();
  const resolvedClassId = classId ?? SEED_IDS.class.riveraPeriod3;
  if (actor && actor.role !== "admin") {
    const memberships = await repo.listClassMemberships();
    if (!canTeacherAccessClass({ actor, classMemberships: memberships }, resolvedClassId)) {
      throw new PermissionError("Teacher does not have access to this class.");
    }
  }
  const groups = await repo.listInterventionGroups(resolvedClassId);
  const members = await repo.listInterventionGroupMembers();
  const users = await repo.listUsers();
  const userMap = new Map(users.map((user) => [user.id, user.displayName]));
  const allClasses = await repo.listClasses();
  const classes =
    !actor || actor.role === "admin"
      ? allClasses
      : allClasses.filter((classItem) => classItem.teacherId === actor.id);
  const students = await repo.listStudentsInClass(resolvedClassId);

  const groupDetails = groups.map((group) => ({
    ...group,
    members: members
      .filter((member) => member.groupId === group.id)
      .map((member) => ({
        studentId: member.studentId,
        displayName: userMap.get(member.studentId) ?? member.studentId,
      })),
  }));

  return { groups: groupDetails, students, classes };
}
