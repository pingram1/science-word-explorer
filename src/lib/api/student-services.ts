import { calculateMultiUnitProgress, calculateStudentProgress } from "@/lib/learning/progress";
import { getRepository } from "@/lib/repositories";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type {
  InstructionalStep,
  LearningAttempt,
  LearningSession,
  Reward,
  StudentSupportProfile,
  StudentWordMastery,
  SupportLevel,
  Unit,
  VocabularyImage,
  VocabularyWord,
} from "@/lib/types";
import { INSTRUCTIONAL_STEP_SKILLS } from "@/lib/types";
import { applyAdaptiveRules } from "@/lib/learning/adaptive";
import { getSupportiveFeedback } from "@/lib/constants/feedback";
import { gradeInstructionalStep } from "@/lib/learning/grade-attempt";
import { randomUUID } from "crypto";

export interface DashboardData {
  greeting: string;
  studentName: string;
  currentUnit: Unit | null;
  continueSession: LearningSession | null;
  progress: ReturnType<typeof calculateStudentProgress>;
  wordsMastered: number;
  wordsLearning: number;
  reviewDueCount: number;
  journeyProgress: number;
  badges: { id: string; title: string; earnedAt: string | null }[];
  weeklySummary: {
    sessionsCompleted: number;
    wordsPracticed: number;
    minutesEstimate: number;
  };
}

export async function buildStudentDashboard(studentId: string): Promise<DashboardData> {
  const repo = await getRepository();
  const user = await repo.getUser(studentId);
  const profile = await repo.getStudentProfileByUserId(studentId);
  const units = await repo.listUnits(true);
  const allWords = await repo.listVocabularyWords(undefined, true);
  const mastery = await repo.listStudentWordMastery({ studentId });
  const reviewSchedules = await repo.listReviewSchedules({ studentId, isDue: true });
  const sessions = await repo.listLearningSessions({ studentId });
  const rewards = await repo.listRewards(true);
  const studentRewards = await repo.listStudentRewards(studentId);

  const inProgressSession =
    sessions
      .filter((s) => s.status === "in_progress")
      .sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
      )[0] ?? null;

  const activeUnitId =
    inProgressSession?.unitId ??
    mastery.find((m) => m.status !== "mastered" && m.status !== "not_started")?.unitId ??
    SEED_IDS.units.waterCycle;

  const currentUnit = (await repo.getUnit(activeUnitId)) ?? units[0] ?? null;

  const progress = calculateStudentProgress({
    studentId,
    masteryRecords: mastery,
    totalAssignedWords: allWords.length,
    unitIds: units.map((u) => u.id),
  });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentSessions = sessions.filter(
    (s) => s.status === "completed" && new Date(s.completedAt ?? s.updatedAt) >= oneWeekAgo,
  );
  const recentWords = new Set(recentSessions.map((s) => s.vocabularyWordId));

  const earnedRewardIds = new Set(studentRewards.map((r) => r.rewardId));
  const badges = rewards
    .filter((r) => r.category === "lab_badge" || r.category === "milestone")
    .map((r) => ({
      id: r.id,
      title: r.title,
      earnedAt: studentRewards.find((sr) => sr.rewardId === r.id)?.earnedAt ?? null,
    }));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return {
    greeting,
    studentName: user?.displayName.split(" ")[0] ?? "Explorer",
    currentUnit,
    continueSession: inProgressSession,
    progress,
    wordsMastered: progress.wordsMastered,
    wordsLearning: progress.wordsInProgress,
    reviewDueCount: reviewSchedules.length,
    journeyProgress: profile?.journeyProgress ?? 0,
    badges,
    weeklySummary: {
      sessionsCompleted: recentSessions.length,
      wordsPracticed: recentWords.size,
      minutesEstimate: recentSessions.length * 8,
    },
  };
}

export interface UnitCardData {
  unit: Unit;
  progress: {
    totalWords: number;
    wordsMastered: number;
    percentComplete: number;
  };
  wordCount: number;
}

export async function buildUnitCards(studentId: string): Promise<UnitCardData[]> {
  const repo = await getRepository();
  const units = await repo.listUnits(true);
  const allWords = await repo.listVocabularyWords(undefined, true);
  const mastery = await repo.listStudentWordMastery({ studentId });

  const wordsPerUnit: Record<string, number> = {};
  for (const word of allWords) {
    wordsPerUnit[word.unitId] = (wordsPerUnit[word.unitId] ?? 0) + 1;
  }

  const unitProgress = calculateMultiUnitProgress(studentId, mastery, wordsPerUnit);

  return units
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((unit) => {
      const progress = unitProgress.find((p) => p.unitId === unit.id);
      return {
        unit,
        progress: {
          totalWords: progress?.totalWords ?? 0,
          wordsMastered: progress?.wordsMastered ?? 0,
          percentComplete: progress?.percentComplete ?? 0,
        },
        wordCount: wordsPerUnit[unit.id] ?? 0,
      };
    });
}

export interface UnitDetailData {
  unit: Unit;
  words: (VocabularyWord & { masteryStatus: StudentWordMastery["status"] })[];
  progress: UnitCardData["progress"];
}

export async function buildUnitDetail(
  studentId: string,
  slug: string,
): Promise<UnitDetailData | null> {
  const repo = await getRepository();
  const unit = await repo.getUnitBySlug(slug);
  if (!unit) return null;

  const words = await repo.listVocabularyWords(unit.id, true);
  const mastery = await repo.listStudentWordMastery({ studentId, unitId: unit.id });
  const masteryMap = new Map(mastery.map((m) => [m.vocabularyWordId, m.status]));

  const cards = await buildUnitCards(studentId);
  const progress = cards.find((c) => c.unit.id === unit.id)?.progress ?? {
    totalWords: words.length,
    wordsMastered: 0,
    percentComplete: 0,
  };

  return {
    unit,
    words: words.map((word) => ({
      ...word,
      masteryStatus: masteryMap.get(word.id) ?? "not_started",
    })),
    progress,
  };
}

export interface ReviewData {
  dueToday: VocabularyWord[];
  recentlyMissed: VocabularyWord[];
  nearlyMastered: VocabularyWord[];
  retrievalWords: VocabularyWord[];
}

export async function buildReviewData(studentId: string): Promise<ReviewData> {
  const repo = await getRepository();
  const mastery = await repo.listStudentWordMastery({ studentId });
  const reviewSchedules = await repo.listReviewSchedules({ studentId, isDue: true });
  const attempts = await repo.listLearningAttempts({ studentId });

  const wordIds = new Set<string>();
  for (const schedule of reviewSchedules) wordIds.add(schedule.vocabularyWordId);
  for (const m of mastery.filter((r) => r.status === "nearly_mastered")) {
    wordIds.add(m.vocabularyWordId);
  }

  const missedWordIds = new Set<string>();
  const recentIncorrect = attempts
    .filter((a) => !a.isCorrect)
    .slice(-20);
  for (const attempt of recentIncorrect) {
    missedWordIds.add(attempt.vocabularyWordId);
  }

  const allWords = await repo.listVocabularyWords(undefined, true);
  const wordMap = new Map(allWords.map((w) => [w.id, w]));

  const dueToday = reviewSchedules
    .map((s) => wordMap.get(s.vocabularyWordId))
    .filter((w): w is VocabularyWord => Boolean(w));

  const recentlyMissed = [...missedWordIds]
    .map((id) => wordMap.get(id))
    .filter((w): w is VocabularyWord => Boolean(w))
    .slice(0, 6);

  const nearlyMastered = mastery
    .filter((m) => m.status === "nearly_mastered")
    .map((m) => wordMap.get(m.vocabularyWordId))
    .filter((w): w is VocabularyWord => Boolean(w));

  const retrievalWords = [...dueToday, ...nearlyMastered]
    .filter((w, i, arr) => arr.findIndex((x) => x.id === w.id) === i)
    .slice(0, 8);

  return { dueToday, recentlyMissed, nearlyMastered, retrievalWords };
}

export interface JourneyData {
  journeyProgress: number;
  badges: Reward[];
  earnedBadgeIds: string[];
  categories: {
    lab_badge: Reward[];
    garden_item: Reward[];
    space_mission: Reward[];
    wilderness_trail: Reward[];
  };
}

export async function buildJourneyData(studentId: string): Promise<JourneyData> {
  const repo = await getRepository();
  const profile = await repo.getStudentProfileByUserId(studentId);
  const rewards = await repo.listRewards(true);
  const studentRewards = await repo.listStudentRewards(studentId);
  const earnedBadgeIds = studentRewards.map((r) => r.rewardId);

  const categories = {
    lab_badge: rewards.filter((r) => r.category === "lab_badge"),
    garden_item: rewards.filter((r) => r.category === "garden_item"),
    space_mission: rewards.filter((r) => r.category === "space_mission"),
    wilderness_trail: rewards.filter((r) => r.category === "wilderness_trail"),
  };

  return {
    journeyProgress: profile?.journeyProgress ?? 0,
    badges: rewards,
    earnedBadgeIds,
    categories,
  };
}

export interface SessionPayload {
  session: LearningSession;
  word: VocabularyWord;
  supportProfile: StudentSupportProfile;
  imageChoices: VocabularyImage[];
}

export async function buildSessionPayload(
  sessionId: string,
  studentId: string,
): Promise<SessionPayload | null> {
  const repo = await getRepository();
  const session = await repo.getLearningSession(sessionId);
  if (!session || session.studentId !== studentId) return null;

  const word = await repo.getVocabularyWord(session.vocabularyWordId);
  if (!word) return null;

  const profile = await repo.getStudentProfileByUserId(studentId);
  const supportProfile =
    (profile?.supportProfileId
      ? await repo.getSupportProfile(profile.supportProfileId)
      : null) ??
    (await repo.getSupportProfileByStudentId(studentId));

  if (!supportProfile) {
    throw new Error("Support profile not found for student.");
  }

  const unitWords = await repo.listVocabularyWords(session.unitId, true);
  const distractorImages: VocabularyImage[] = [];
  for (const other of unitWords) {
    if (other.id === word.id) continue;
    const img = other.images.find((i) => i.isPrimary) ?? other.images[0];
    if (img) distractorImages.push(img);
    if (distractorImages.length >= supportProfile.numberOfDistractors) break;
  }

  const imageChoices = [
    ...(word.images[0] ? [word.images[0]] : []),
    ...distractorImages,
  ].slice(0, supportProfile.numberOfDistractors + 1);

  return { session, word, supportProfile, imageChoices };
}

export interface AttemptInput {
  instructionalStep: InstructionalStep;
  studentResponse: string | null;
  correctResponse: string | null;
  isCorrect?: boolean;
  responseTimeMs: number;
  attemptNumber: number;
  hintsUsed?: number;
  audioReplays?: number;
  slowAudioUsed?: boolean;
  textToSpeechUsed?: boolean;
  wordBankUsed?: boolean;
  pictureSupportUsed?: boolean;
  speechRecognitionConfidence?: number | null;
  completionStatus?: "completed" | "skipped";
}

export interface AttemptResult {
  attempt: LearningAttempt;
  feedback: string;
  isCorrect: boolean;
  session: LearningSession;
  nextStep: InstructionalStep | null;
  adaptiveExplanations: string[];
}

/**
 * Legacy student-service helper. Not used by HTTP routes.
 * Do not wire this to an API — it auto-advances steps without the session mutex
 * or `completeStep` pass check. Use `recordAttemptAndEvent` instead.
 */
export async function recordAttempt(
  sessionId: string,
  studentId: string,
  input: AttemptInput,
): Promise<AttemptResult> {
  const repo = await getRepository();
  const session = await repo.getLearningSession(sessionId);
  if (!session || session.studentId !== studentId) {
    throw new Error("Session not found.");
  }

  const word = await repo.getVocabularyWord(session.vocabularyWordId);
  if (!word) throw new Error("Word not found.");

  const skillCategory = INSTRUCTIONAL_STEP_SKILLS[input.instructionalStep];
  const supportProfile = await repo.getSupportProfileByStudentId(studentId);

  const grade = gradeInstructionalStep({
    instructionalStep: input.instructionalStep,
    word,
    studentResponse: input.studentResponse,
    completionStatus: input.completionStatus,
    speechRecognitionConfidence: input.speechRecognitionConfidence,
  });
  const isCorrect = grade.isCorrect;
  const errorCategories = grade.errorCategories;

  const attempt: LearningAttempt = {
    id: randomUUID(),
    sessionId,
    studentId,
    vocabularyWordId: session.vocabularyWordId,
    instructionalStep: input.instructionalStep,
    skillCategory,
    supportLevel: session.supportLevel,
    isCorrect,
    studentResponse: input.studentResponse,
    correctResponse: grade.correctResponse,
    errorCategories,
    responseTimeMs: input.responseTimeMs,
    attemptNumber: input.attemptNumber,
    hintsUsed: input.hintsUsed ?? 0,
    audioReplays: input.audioReplays ?? 0,
    slowAudioUsed: input.slowAudioUsed ?? false,
    textToSpeechUsed: input.textToSpeechUsed ?? false,
    wordBankUsed: input.wordBankUsed ?? false,
    pictureSupportUsed: input.pictureSupportUsed ?? false,
    speechRecognitionConfidence: input.speechRecognitionConfidence ?? null,
    teacherVerified: false,
    supportDependentCorrect:
      grade.supportDependentCorrect ||
      (isCorrect &&
        ((input.hintsUsed ?? 0) > 0 ||
          (input.wordBankUsed ?? false) ||
          (input.pictureSupportUsed ?? false))),
    completionStatus: input.completionStatus ?? "completed",
    createdAt: new Date().toISOString(),
  };

  await repo.createLearningAttempt(attempt);

  await repo.createLearningEvent({
    id: randomUUID(),
    studentId,
    classId: session.classId,
    unitId: session.unitId,
    vocabularyWordId: session.vocabularyWordId,
    sessionId,
    attemptId: attempt.id,
    instructionalStep: input.instructionalStep,
    skillCategory,
    supportLevel: session.supportLevel,
    promptShown: null,
    studentResponse: input.studentResponse,
    correctResponse: grade.correctResponse,
    isCorrect,
    errorCategories,
    responseTimeMs: input.responseTimeMs,
    attemptNumber: input.attemptNumber,
    hintsUsed: input.hintsUsed ?? 0,
    audioReplays: input.audioReplays ?? 0,
    slowAudioUsed: input.slowAudioUsed ?? false,
    textToSpeechUsed: input.textToSpeechUsed ?? false,
    wordBankUsed: input.wordBankUsed ?? false,
    pictureSupportUsed: input.pictureSupportUsed ?? false,
    speechRecognitionConfidence: input.speechRecognitionConfidence ?? null,
    teacherVerified: false,
    supportDependentCorrect: attempt.supportDependentCorrect,
    completionStatus: input.completionStatus ?? "completed",
    deviceCategory: session.deviceCategory,
    timestamp: new Date().toISOString(),
  });

  let nextStep: InstructionalStep | null = null;
  let updatedSession = session;

  if (isCorrect) {
    let step = session.currentStep;
    if (step === 4 && !word.morphologyApplicable) {
      step = 4;
    }
    if (step < 10) {
      nextStep = (step + 1) as InstructionalStep;
      updatedSession = await repo.updateLearningSession(sessionId, {
        currentStep: nextStep,
        lastActivityAt: new Date().toISOString(),
      });
    } else {
      updatedSession = await repo.updateLearningSession(sessionId, {
        status: "completed",
        completedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      });
      nextStep = null;
    }
  } else {
    updatedSession = await repo.updateLearningSession(sessionId, {
      lastActivityAt: new Date().toISOString(),
    });
  }

  const recentAttempts = await repo.listLearningAttempts({ sessionId });
  const adaptiveExplanations: string[] = [];
  if (supportProfile) {
    const adaptive = applyAdaptiveRules({
      skillCategory,
      recentAttempts,
      currentSupportProfile: supportProfile,
      supportLevel: session.supportLevel,
    });
    if (Object.keys(adaptive.updatedSupportProfile).length > 0) {
      await repo.updateSupportProfile(supportProfile.id, adaptive.updatedSupportProfile);
    }
    adaptiveExplanations.push(...adaptive.explanations);
  }

  const feedback = getSupportiveFeedback({
    step: input.instructionalStep,
    isCorrect,
    attemptNumber: input.attemptNumber,
  });

  return { attempt, feedback, isCorrect, session: updatedSession, nextStep, adaptiveExplanations };
}

export async function createWordSession(options: {
  studentId: string;
  unitId: string;
  vocabularyWordId: string;
  supportLevel?: SupportLevel;
  classId?: string | null;
}): Promise<LearningSession> {
  const repo = await getRepository();
  const profile = await repo.getStudentProfileByUserId(options.studentId);
  const now = new Date().toISOString();

  const session: LearningSession = {
    id: randomUUID(),
    studentId: options.studentId,
    classId: options.classId ?? SEED_IDS.class.riveraPeriod3,
    unitId: options.unitId,
    vocabularyWordId: options.vocabularyWordId,
    assignmentId: null,
    supportLevel: options.supportLevel ?? profile?.defaultSupportLevel ?? 2,
    currentStep: 1,
    status: "in_progress",
    startedAt: now,
    completedAt: null,
    lastActivityAt: now,
    deviceCategory: "desktop",
    createdAt: now,
    updatedAt: now,
  };

  return repo.createLearningSession(session);
}
