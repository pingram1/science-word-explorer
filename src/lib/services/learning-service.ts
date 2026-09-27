import { getRepository } from "@/lib/repositories";
import { applyAdaptiveRules, isSupportDependentCorrect } from "@/lib/learning/adaptive";
import {
  assertSessionAcceptsAttempts,
  gradeInstructionalStep,
  hasPassedStep,
  StepProgressError,
} from "@/lib/learning/grade-attempt";
import {
  calculateWordMastery,
  checkEssentialSkillsCompleted,
  determineMasteryStatus,
} from "@/lib/learning/mastery";
import { scheduleReview } from "@/lib/learning/review-schedule";
import { Mutex } from "@/lib/utils/mutex";
import type {
  CompletionStatus,
  DeviceCategory,
  ErrorCategory,
  InstructionalStep,
  LearningAttempt,
  LearningEvent,
  LearningSession,
  SkillCategory,
  SkillScoreInput,
  StudentSupportProfile,
  StudentWordMastery,
  SupportLevel,
} from "@/lib/types";
import { INSTRUCTIONAL_STEP_SKILLS } from "@/lib/types";
import { generateId } from "@/lib/utils/id";

export interface StartSessionInput {
  studentId: string;
  vocabularyWordId: string;
  unitId: string;
  classId?: string | null;
  assignmentId?: string | null;
  supportLevel?: SupportLevel;
  deviceCategory?: DeviceCategory;
}

export interface RecordAttemptInput {
  sessionId: string;
  instructionalStep: InstructionalStep;
  skillCategory?: SkillCategory;
  /** Ignored — correctness is computed server-side from canonical word data. */
  isCorrect?: boolean;
  studentResponse?: string | null;
  correctResponse?: string | null;
  errorCategories?: ErrorCategory[];
  responseTimeMs?: number;
  hintsUsed?: number;
  audioReplays?: number;
  slowAudioUsed?: boolean;
  textToSpeechUsed?: boolean;
  wordBankUsed?: boolean;
  pictureSupportUsed?: boolean;
  speechRecognitionConfidence?: number | null;
  completionStatus?: CompletionStatus;
  promptShown?: string | null;
}

const sessionLocks = new Map<string, Mutex>();

function lockForSession(sessionId: string): Mutex {
  const existing = sessionLocks.get(sessionId);
  if (existing) return existing;
  const mutex = new Mutex();
  sessionLocks.set(sessionId, mutex);
  return mutex;
}

export interface ActiveSupports {
  supportLevel: SupportLevel;
  profile: StudentSupportProfile;
  adaptiveExplanations: string[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function attemptScore(attempt: Pick<LearningAttempt, "isCorrect" | "hintsUsed" | "wordBankUsed" | "pictureSupportUsed" | "supportDependentCorrect">): number {
  if (!attempt.isCorrect) return 0;
  if (attempt.supportDependentCorrect || attempt.hintsUsed > 0 || attempt.wordBankUsed || attempt.pictureSupportUsed) {
    return 70;
  }
  return 100;
}

function buildSkillScores(
  skillRecords: { skillCategory: SkillCategory; score: number }[],
): SkillScoreInput[] {
  return skillRecords.map((record) => ({
    skillCategory: record.skillCategory,
    score: record.score,
  }));
}

async function updateMasteryForWord(
  studentId: string,
  vocabularyWordId: string,
  unitId: string,
): Promise<StudentWordMastery> {
  const repo = await getRepository();
  const skillRecords = await repo.listStudentSkillMastery({ studentId, vocabularyWordId });
  const skillScores = buildSkillScores(skillRecords);
  const sessions = await repo.listLearningSessions({ studentId });
  const wordSessions = sessions.filter(
    (session) =>
      session.vocabularyWordId === vocabularyWordId &&
      (session.status === "completed" || session.status === "in_progress"),
  );
  const attempts = await repo.listLearningAttempts({ studentId, vocabularyWordId });
  const successfulWithoutHighHint = attempts.some(
    (attempt) => attempt.isCorrect && attempt.hintsUsed === 0 && !attempt.wordBankUsed,
  );
  const retrievalAttemptCompleted = attempts.some(
    (attempt) =>
      attempt.instructionalStep === 10 &&
      attempt.isCorrect &&
      !isSupportDependentCorrect(attempt),
  );
  const essentialSkillsCompleted = checkEssentialSkillsCompleted(skillScores);
  const existing = await repo.getStudentWordMasteryByWord(studentId, vocabularyWordId);
  const weightedScore = calculateWordMastery(skillScores);
  const status = determineMasteryStatus({
    skillScores,
    sessionCount: wordSessions.length,
    successfulWithoutHighHint,
    retrievalAttemptCompleted,
    essentialSkillsCompleted,
    currentStatus: existing?.status,
  });
  const timestamp = nowIso();

  const record: StudentWordMastery = {
    id: existing?.id ?? generateId(),
    studentId,
    vocabularyWordId,
    unitId,
    weightedScore,
    status,
    sessionCount: wordSessions.length,
    successfulWithoutHighHint,
    retrievalAttemptCompleted,
    essentialSkillsCompleted,
    lastSessionAt: wordSessions.at(-1)?.lastActivityAt ?? existing?.lastSessionAt ?? null,
    masteredAt:
      status === "mastered" ? existing?.masteredAt ?? timestamp : existing?.masteredAt ?? null,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  return repo.upsertStudentWordMastery(record);
}

export async function getActiveSupportsForSession(
  session: LearningSession,
): Promise<ActiveSupports> {
  const repo = await getRepository();
  const profile = await repo.getSupportProfileByStudentId(session.studentId);
  if (!profile) {
    throw new Error("Student support profile not found.");
  }

  const recentAttempts = await repo.listLearningAttempts({
    sessionId: session.id,
    studentId: session.studentId,
  });
  const currentStep = session.currentStep;
  const skillCategory = INSTRUCTIONAL_STEP_SKILLS[currentStep];

  const adaptive = applyAdaptiveRules({
    skillCategory,
    recentAttempts,
    currentSupportProfile: profile,
    supportLevel: session.supportLevel,
  });

  const mergedProfile: StudentSupportProfile = {
    ...profile,
    ...adaptive.updatedSupportProfile,
    updatedAt: nowIso(),
  };

  if (Object.keys(adaptive.updatedSupportProfile).length > 0) {
    await repo.updateSupportProfile(profile.id, adaptive.updatedSupportProfile);
  }

  return {
    supportLevel: adaptive.updatedSupportLevel ?? session.supportLevel,
    profile: mergedProfile,
    adaptiveExplanations: adaptive.explanations,
  };
}

export async function startSession(input: StartSessionInput): Promise<LearningSession> {
  const repo = await getRepository();
  const word = await repo.getVocabularyWord(input.vocabularyWordId);
  if (!word) {
    throw new Error("Vocabulary word not found.");
  }
  if (!word.isActive) {
    throw new StepProgressError("This vocabulary word is no longer available.");
  }
  if (word.unitId !== input.unitId) {
    throw new Error("Vocabulary word does not belong to the requested unit.");
  }

  const profile = await repo.getStudentProfileByUserId(input.studentId);
  const supportLevel = input.supportLevel ?? profile?.defaultSupportLevel ?? 2;
  const timestamp = nowIso();

  const session: LearningSession = {
    id: generateId(),
    studentId: input.studentId,
    classId: input.classId ?? null,
    unitId: input.unitId,
    vocabularyWordId: input.vocabularyWordId,
    assignmentId: input.assignmentId ?? null,
    supportLevel,
    currentStep: 1,
    status: "in_progress",
    startedAt: timestamp,
    completedAt: null,
    lastActivityAt: timestamp,
    deviceCategory: input.deviceCategory ?? "unknown",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return repo.createLearningSession(session);
}

export async function resumeSession(sessionId: string): Promise<LearningSession | null> {
  const repo = await getRepository();
  const session = await repo.getLearningSession(sessionId);
  if (!session || session.status !== "in_progress") {
    return null;
  }
  return session;
}

export async function completeStep(
  sessionId: string,
  step?: InstructionalStep,
): Promise<LearningSession> {
  return lockForSession(sessionId).run(async () => {
    const repo = await getRepository();
    const session = await repo.getLearningSession(sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }

    if (session.status !== "in_progress") {
      throw new StepProgressError("Session is not in progress.");
    }

    // Already past the requested step — treat as idempotent, not a skip.
    if (step !== undefined && step < session.currentStep) {
      return session;
    }

    if (step !== undefined && step !== session.currentStep) {
      throw new StepProgressError("Can only complete the current instructional step.");
    }

    const attempts = await repo.listLearningAttempts({ sessionId: session.id });
    if (!hasPassedStep(session.currentStep, attempts)) {
      throw new StepProgressError("Pass the current step before moving on.");
    }

    const timestamp = nowIso();
    const isComplete = session.currentStep >= 10;
    const nextStep = Math.min(10, session.currentStep + 1) as InstructionalStep;

    return repo.updateLearningSession(sessionId, {
      currentStep: isComplete ? 10 : nextStep,
      status: isComplete ? "completed" : "in_progress",
      completedAt: isComplete ? timestamp : null,
      lastActivityAt: timestamp,
      updatedAt: timestamp,
    });
  });
}

export async function exitAndSaveSession(sessionId: string): Promise<LearningSession> {
  const repo = await getRepository();
  const session = await repo.getLearningSession(sessionId);
  if (!session) {
    throw new Error("Session not found.");
  }

  const timestamp = nowIso();
  return repo.updateLearningSession(sessionId, {
    status: session.status === "completed" ? "completed" : "in_progress",
    lastActivityAt: timestamp,
    updatedAt: timestamp,
  });
}

export async function recordAttemptAndEvent(
  input: RecordAttemptInput,
): Promise<{
  attempt: LearningAttempt;
  event: LearningEvent;
  mastery: StudentWordMastery;
  adaptiveExplanations: string[];
}> {
  return lockForSession(input.sessionId).run(() => recordAttemptAndEventUnlocked(input));
}

async function recordAttemptAndEventUnlocked(
  input: RecordAttemptInput,
): Promise<{
  attempt: LearningAttempt;
  event: LearningEvent;
  mastery: StudentWordMastery;
  adaptiveExplanations: string[];
}> {
  const repo = await getRepository();
  const session = await repo.getLearningSession(input.sessionId);
  if (!session) {
    throw new Error("Session not found.");
  }

  assertSessionAcceptsAttempts(session, input.instructionalStep);

  const word = await repo.getVocabularyWord(session.vocabularyWordId);
  if (!word) {
    throw new StepProgressError("This vocabulary word is no longer available.");
  }

  // Server-side grade — never trust client isCorrect / errorCategories / correctResponse.
  const grade = gradeInstructionalStep({
    instructionalStep: input.instructionalStep,
    word,
    studentResponse: input.studentResponse,
    completionStatus: input.completionStatus,
    speechRecognitionConfidence: input.speechRecognitionConfidence,
  });

  const skillCategory =
    input.skillCategory ?? INSTRUCTIONAL_STEP_SKILLS[input.instructionalStep];
  const priorAttempts = await repo.listLearningAttempts({ sessionId: session.id });
  const stepAttempts = priorAttempts.filter(
    (attempt) => attempt.instructionalStep === input.instructionalStep,
  );
  const timestamp = nowIso();

  const attemptData = {
    isCorrect: grade.isCorrect,
    hintsUsed: input.hintsUsed ?? 0,
    wordBankUsed: input.wordBankUsed ?? false,
    pictureSupportUsed: input.pictureSupportUsed ?? false,
    supportDependentCorrect: grade.supportDependentCorrect,
  };
  const supportDependentCorrect =
    grade.supportDependentCorrect || isSupportDependentCorrect(attemptData as LearningAttempt);

  const attempt: LearningAttempt = {
    id: generateId(),
    sessionId: session.id,
    studentId: session.studentId,
    vocabularyWordId: session.vocabularyWordId,
    instructionalStep: input.instructionalStep,
    skillCategory,
    supportLevel: session.supportLevel,
    isCorrect: grade.isCorrect,
    studentResponse: input.studentResponse ?? null,
    correctResponse: grade.correctResponse,
    errorCategories: grade.errorCategories,
    responseTimeMs: input.responseTimeMs ?? 0,
    attemptNumber: stepAttempts.length + 1,
    hintsUsed: input.hintsUsed ?? 0,
    audioReplays: input.audioReplays ?? 0,
    slowAudioUsed: input.slowAudioUsed ?? false,
    textToSpeechUsed: input.textToSpeechUsed ?? false,
    wordBankUsed: input.wordBankUsed ?? false,
    pictureSupportUsed: input.pictureSupportUsed ?? false,
    speechRecognitionConfidence: input.speechRecognitionConfidence ?? null,
    teacherVerified: false,
    supportDependentCorrect,
    completionStatus: input.completionStatus ?? "completed",
    createdAt: timestamp,
  };

  const savedAttempt = await repo.createLearningAttempt(attempt);

  const event: LearningEvent = {
    id: generateId(),
    studentId: session.studentId,
    classId: session.classId,
    unitId: session.unitId,
    vocabularyWordId: session.vocabularyWordId,
    sessionId: session.id,
    attemptId: savedAttempt.id,
    instructionalStep: input.instructionalStep,
    skillCategory,
    supportLevel: session.supportLevel,
    promptShown: input.promptShown ?? null,
    studentResponse: input.studentResponse ?? null,
    correctResponse: grade.correctResponse,
    isCorrect: grade.isCorrect,
    errorCategories: grade.errorCategories,
    responseTimeMs: input.responseTimeMs ?? 0,
    attemptNumber: savedAttempt.attemptNumber,
    hintsUsed: savedAttempt.hintsUsed,
    audioReplays: savedAttempt.audioReplays,
    slowAudioUsed: savedAttempt.slowAudioUsed,
    textToSpeechUsed: savedAttempt.textToSpeechUsed,
    wordBankUsed: savedAttempt.wordBankUsed,
    pictureSupportUsed: savedAttempt.pictureSupportUsed,
    speechRecognitionConfidence: savedAttempt.speechRecognitionConfidence,
    teacherVerified: false,
    supportDependentCorrect: savedAttempt.supportDependentCorrect,
    completionStatus: savedAttempt.completionStatus,
    deviceCategory: session.deviceCategory,
    timestamp,
  };

  await repo.createLearningEvent(event);

  const existingSkill = (
    await repo.listStudentSkillMastery({
      studentId: session.studentId,
      vocabularyWordId: session.vocabularyWordId,
    })
  ).find((record) => record.skillCategory === skillCategory);

  const score = attemptScore(savedAttempt);
  const correctCount = (existingSkill?.correctCount ?? 0) + (grade.isCorrect ? 1 : 0);
  const attemptCount = (existingSkill?.attemptCount ?? 0) + 1;
  const updatedSkillScore = existingSkill
    ? Math.round(((existingSkill.score * existingSkill.attemptCount + score) / attemptCount) * 100) /
      100
    : score;

  await repo.upsertStudentSkillMastery({
    id: existingSkill?.id ?? generateId(),
    studentId: session.studentId,
    vocabularyWordId: session.vocabularyWordId,
    skillCategory,
    score: updatedSkillScore,
    attemptCount,
    correctCount,
    lastAttemptAt: timestamp,
    createdAt: existingSkill?.createdAt ?? timestamp,
    updatedAt: timestamp,
  });

  const allAttempts = await repo.listLearningAttempts({
    studentId: session.studentId,
    vocabularyWordId: session.vocabularyWordId,
  });
  const supportProfile = await repo.getSupportProfileByStudentId(session.studentId);
  const adaptiveExplanations: string[] = [];
  if (supportProfile) {
    const adaptive = applyAdaptiveRules({
      skillCategory,
      recentAttempts: allAttempts,
      currentSupportProfile: supportProfile,
      supportLevel: session.supportLevel,
    });

    adaptiveExplanations.push(...adaptive.explanations);

    if (Object.keys(adaptive.updatedSupportProfile).length > 0) {
      await repo.updateSupportProfile(supportProfile.id, adaptive.updatedSupportProfile);
    }

    if (adaptive.updatedSupportLevel !== null) {
      await repo.updateLearningSession(session.id, {
        supportLevel: adaptive.updatedSupportLevel,
        updatedAt: timestamp,
      });
    }
  }

  await repo.updateLearningSession(session.id, {
    lastActivityAt: timestamp,
    updatedAt: timestamp,
  });

  const mastery = await updateMasteryForWord(
    session.studentId,
    session.vocabularyWordId,
    session.unitId,
  );

  if (mastery.status === "mastered" && !mastery.masteredAt) {
    await repo.upsertStudentWordMastery({
      ...mastery,
      masteredAt: timestamp,
    });

    const priorSchedules = await repo.listReviewSchedules({
      studentId: session.studentId,
    });
    const wordSchedules = priorSchedules.filter(
      (schedule) => schedule.vocabularyWordId === session.vocabularyWordId,
    );
    const lastCompleted = wordSchedules
      .filter((schedule) => schedule.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
      )[0];

    const reviewResult = scheduleReview({
      studentId: session.studentId,
      vocabularyWordId: session.vocabularyWordId,
      anchorDate: new Date(),
      previousIntervalKey: lastCompleted?.intervalKey ?? null,
      sessionId: session.id,
    });

    if (reviewResult) {
      await repo.createReviewSchedule(reviewResult.schedule);
    }
  }

  return { attempt: savedAttempt, event, mastery, adaptiveExplanations };
}
