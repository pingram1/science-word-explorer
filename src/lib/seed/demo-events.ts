import type {
  LearningAttempt,
  LearningEvent,
  LearningSession,
  ReviewSchedule,
  StudentReward,
  StudentSkillMastery,
  StudentWordMastery,
} from "@/lib/types";
import { INSTRUCTIONAL_STEP_SKILLS } from "@/lib/types";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import { seedTimestamps } from "@/lib/seed/helpers";
import { DEMO_WORD_IDS } from "@/lib/seed/demo-users";
import { SEED_WORD_IDS } from "@/lib/seed/vocabulary";

const ts = seedTimestamps();

function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const date = new Date("2026-07-29T15:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

interface SessionSpec {
  id: string;
  studentId: string;
  wordId: string;
  unitId: string;
  daysAgo: number;
  status: "completed" | "in_progress" | "abandoned";
  supportLevel: 1 | 2 | 3 | 4;
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  accuracyPattern: ("correct" | "incorrect")[];
}

const SESSION_SPECS: SessionSpec[] = [
  {
    id: "seed-session-emma-evaporation-1",
    studentId: SEED_IDS.users.students.emmaChen,
    wordId: SEED_WORD_IDS.evaporation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 14,
    status: "completed",
    supportLevel: 3,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-emma-evaporation-2",
    studentId: SEED_IDS.users.students.emmaChen,
    wordId: SEED_WORD_IDS.evaporation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 7,
    status: "completed",
    supportLevel: 3,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-marcus-evaporation-1",
    studentId: SEED_IDS.users.students.marcusJohnson,
    wordId: SEED_WORD_IDS.evaporation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 10,
    status: "completed",
    supportLevel: 1,
    currentStep: 10,
    accuracyPattern: ["correct", "incorrect", "incorrect", "correct", "correct", "incorrect", "correct", "correct", "incorrect", "correct"],
  },
  {
    id: "seed-session-noah-evaporation-1",
    studentId: SEED_IDS.users.students.noahWilliams,
    wordId: SEED_WORD_IDS.evaporation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 5,
    status: "in_progress",
    supportLevel: 1,
    currentStep: 6,
    accuracyPattern: ["correct", "incorrect", "incorrect", "correct", "correct", "incorrect"],
  },
  {
    id: "seed-session-sofia-condensation-1",
    studentId: SEED_IDS.users.students.sofiaMartinez,
    wordId: SEED_WORD_IDS.condensation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 8,
    status: "completed",
    supportLevel: 2,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "incorrect", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-jayden-force-1",
    studentId: SEED_IDS.users.students.jaydenTaylor,
    wordId: SEED_WORD_IDS.force,
    unitId: SEED_IDS.units.forceAndMotion,
    daysAgo: 12,
    status: "completed",
    supportLevel: 1,
    currentStep: 10,
    accuracyPattern: ["correct", "incorrect", "incorrect", "correct", "correct", "correct", "incorrect", "correct", "incorrect", "correct"],
  },
  {
    id: "seed-session-olivia-ecosystem-1",
    studentId: SEED_IDS.users.students.oliviaNguyen,
    wordId: SEED_WORD_IDS.ecosystem,
    unitId: SEED_IDS.units.ecosystems,
    daysAgo: 20,
    status: "completed",
    supportLevel: 4,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-aisha-hypothesis-1",
    studentId: SEED_IDS.users.students.aishaPatel,
    wordId: SEED_WORD_IDS.hypothesis,
    unitId: SEED_IDS.units.scientificInvestigation,
    daysAgo: 6,
    status: "completed",
    supportLevel: 3,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "incorrect", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-ethan-atom-1",
    studentId: SEED_IDS.users.students.ethanBrooks,
    wordId: SEED_WORD_IDS.atom,
    unitId: SEED_IDS.units.matter,
    daysAgo: 9,
    status: "completed",
    supportLevel: 2,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-grace-evaporation-review",
    studentId: SEED_IDS.users.students.graceKim,
    wordId: SEED_WORD_IDS.evaporation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 3,
    status: "completed",
    supportLevel: 3,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-caleb-matter-abandoned",
    studentId: SEED_IDS.users.students.calebWashington,
    wordId: SEED_WORD_IDS.molecule,
    unitId: SEED_IDS.units.matter,
    daysAgo: 2,
    status: "abandoned",
    supportLevel: 2,
    currentStep: 3,
    accuracyPattern: ["correct", "incorrect", "incorrect"],
  },
  {
    id: "seed-session-zara-ecosystem-1",
    studentId: SEED_IDS.users.students.zaraAhmed,
    wordId: SEED_WORD_IDS.ecosystem,
    unitId: SEED_IDS.units.ecosystems,
    daysAgo: 11,
    status: "completed",
    supportLevel: 2,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "incorrect", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
  {
    id: "seed-session-mia-precipitation-1",
    studentId: SEED_IDS.users.students.miaRodriguez,
    wordId: SEED_WORD_IDS.precipitation,
    unitId: SEED_IDS.units.waterCycle,
    daysAgo: 4,
    status: "in_progress",
    supportLevel: 3,
    currentStep: 5,
    accuracyPattern: ["correct", "correct", "incorrect", "correct", "correct"],
  },
  {
    id: "seed-session-liam-friction-1",
    studentId: SEED_IDS.users.students.liamObrien,
    wordId: SEED_WORD_IDS.friction,
    unitId: SEED_IDS.units.forceAndMotion,
    daysAgo: 15,
    status: "completed",
    supportLevel: 2,
    currentStep: 10,
    accuracyPattern: ["correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct", "correct"],
  },
];

function buildSessions(): LearningSession[] {
  return SESSION_SPECS.map((spec) => {
    const startedAt = isoDaysAgo(spec.daysAgo, 14);
    const lastActivityAt = isoDaysAgo(spec.daysAgo, 14, 35);
    return {
      id: spec.id,
      studentId: spec.studentId,
      classId: SEED_IDS.class.riveraPeriod3,
      unitId: spec.unitId,
      vocabularyWordId: spec.wordId,
      assignmentId:
        spec.unitId === SEED_IDS.units.waterCycle
          ? SEED_IDS.assignment.waterCycleUnit
          : spec.unitId === SEED_IDS.units.ecosystems
            ? SEED_IDS.assignment.ecosystemsUnit
            : spec.unitId === SEED_IDS.units.matter
              ? SEED_IDS.assignment.matterUnit
              : null,
      supportLevel: spec.supportLevel,
      currentStep: spec.currentStep,
      status: spec.status === "completed" ? "completed" : spec.status === "abandoned" ? "abandoned" : "in_progress",
      startedAt,
      completedAt: spec.status === "completed" ? lastActivityAt : null,
      lastActivityAt,
      deviceCategory: spec.studentId === SEED_IDS.users.students.marcusJohnson ? "chromebook" : "desktop",
      ...ts,
    };
  });
}

function errorForStep(step: number, isCorrect: boolean) {
  if (isCorrect) return [] as const;
  if (step === 2) return ["incorrect_sound_order"] as const;
  if (step === 3) return ["substitution"] as const;
  if (step === 4) return ["suffix_error"] as const;
  if (step === 7) return ["definition_misconception"] as const;
  if (step === 8) return ["context_misconception"] as const;
  if (step === 10) return ["science_concept_misconception"] as const;
  return ["substitution"] as const;
}

function buildAttemptsAndEvents(sessions: LearningSession[]): {
  attempts: LearningAttempt[];
  events: LearningEvent[];
} {
  const attempts: LearningAttempt[] = [];
  const events: LearningEvent[] = [];

  for (const spec of SESSION_SPECS) {
    spec.accuracyPattern.forEach((result, index) => {
      const step = (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
      const isCorrect = result === "correct";
      const attemptId = `seed-attempt-${spec.id}-step-${step}`;
      const timestamp = isoDaysAgo(spec.daysAgo, 14, 5 + index * 2);
      const skillCategory = INSTRUCTIONAL_STEP_SKILLS[step];
      const hintsUsed = isCorrect ? 0 : spec.supportLevel === 1 ? 2 : 1;
      const wordBankUsed = !isCorrect && step === 8 && spec.supportLevel <= 2;
      const slowAudioUsed = spec.supportLevel === 1 && step === 1;
      const supportDependentCorrect = isCorrect && hintsUsed > 0;

      const attempt: LearningAttempt = {
        id: attemptId,
        sessionId: spec.id,
        studentId: spec.studentId,
        vocabularyWordId: spec.wordId,
        instructionalStep: step,
        skillCategory,
        supportLevel: spec.supportLevel,
        isCorrect,
        studentResponse: isCorrect ? "expected-response" : "student-error-response",
        correctResponse: "expected-response",
        errorCategories: [...errorForStep(step, isCorrect)],
        responseTimeMs: 4000 + index * 700 + (isCorrect ? 0 : 2500),
        attemptNumber: isCorrect ? 1 : 2,
        hintsUsed,
        audioReplays: step === 1 ? 1 : 0,
        slowAudioUsed,
        textToSpeechUsed: spec.supportLevel <= 2 && (step === 7 || step === 8),
        wordBankUsed,
        pictureSupportUsed: spec.supportLevel <= 2 && step === 6,
        speechRecognitionConfidence: step === 5 ? (isCorrect ? 0.88 : 0.42) : null,
        teacherVerified: step === 5 && !isCorrect,
        supportDependentCorrect,
        completionStatus: "completed",
        createdAt: timestamp,
      };
      attempts.push(attempt);

      events.push({
        id: `seed-event-${attemptId}`,
        studentId: spec.studentId,
        classId: SEED_IDS.class.riveraPeriod3,
        unitId: spec.unitId,
        vocabularyWordId: spec.wordId,
        sessionId: spec.id,
        attemptId,
        instructionalStep: step,
        skillCategory,
        supportLevel: spec.supportLevel,
        promptShown: `Step ${step} prompt for ${spec.wordId}`,
        studentResponse: attempt.studentResponse,
        correctResponse: attempt.correctResponse,
        isCorrect,
        errorCategories: [...attempt.errorCategories],
        responseTimeMs: attempt.responseTimeMs,
        attemptNumber: attempt.attemptNumber,
        hintsUsed,
        audioReplays: attempt.audioReplays,
        slowAudioUsed,
        textToSpeechUsed: attempt.textToSpeechUsed,
        wordBankUsed,
        pictureSupportUsed: attempt.pictureSupportUsed,
        speechRecognitionConfidence: attempt.speechRecognitionConfidence,
        teacherVerified: attempt.teacherVerified,
        supportDependentCorrect,
        completionStatus: "completed",
        deviceCategory: attempt.sessionId.includes("marcus") ? "chromebook" : "desktop",
        timestamp,
      });
    });
  }

  return { attempts, events };
}

function buildWordMastery(): StudentWordMastery[] {
  return [
    {
      id: "seed-mastery-emma-evaporation",
      studentId: SEED_IDS.users.students.emmaChen,
      vocabularyWordId: SEED_WORD_IDS.evaporation,
      unitId: SEED_IDS.units.waterCycle,
      weightedScore: 92,
      status: "mastered",
      sessionCount: 2,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: true,
      essentialSkillsCompleted: true,
      lastSessionAt: isoDaysAgo(7),
      masteredAt: isoDaysAgo(7),
      ...ts,
    },
    {
      id: "seed-mastery-marcus-evaporation",
      studentId: SEED_IDS.users.students.marcusJohnson,
      vocabularyWordId: SEED_WORD_IDS.evaporation,
      unitId: SEED_IDS.units.waterCycle,
      weightedScore: 71,
      status: "nearly_mastered",
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: true,
      lastSessionAt: isoDaysAgo(10),
      masteredAt: null,
      ...ts,
    },
    {
      id: "seed-mastery-noah-evaporation",
      studentId: SEED_IDS.users.students.noahWilliams,
      vocabularyWordId: SEED_WORD_IDS.evaporation,
      unitId: SEED_IDS.units.waterCycle,
      weightedScore: 48,
      status: "needs_teacher_support",
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
      lastSessionAt: isoDaysAgo(5),
      masteredAt: null,
      ...ts,
    },
    {
      id: "seed-mastery-olivia-ecosystem",
      studentId: SEED_IDS.users.students.oliviaNguyen,
      vocabularyWordId: SEED_WORD_IDS.ecosystem,
      unitId: SEED_IDS.units.ecosystems,
      weightedScore: 95,
      status: "mastered",
      sessionCount: 1,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: true,
      essentialSkillsCompleted: true,
      lastSessionAt: isoDaysAgo(20),
      masteredAt: isoDaysAgo(20),
      ...ts,
    },
    {
      id: "seed-mastery-jayden-force",
      studentId: SEED_IDS.users.students.jaydenTaylor,
      vocabularyWordId: SEED_WORD_IDS.force,
      unitId: SEED_IDS.units.forceAndMotion,
      weightedScore: 68,
      status: "practicing",
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
      lastSessionAt: isoDaysAgo(12),
      masteredAt: null,
      ...ts,
    },
    {
      id: "seed-mastery-grace-evaporation",
      studentId: SEED_IDS.users.students.graceKim,
      vocabularyWordId: SEED_WORD_IDS.evaporation,
      unitId: SEED_IDS.units.waterCycle,
      weightedScore: 88,
      status: "review_due",
      sessionCount: 2,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: true,
      essentialSkillsCompleted: true,
      lastSessionAt: isoDaysAgo(3),
      masteredAt: isoDaysAgo(21),
      ...ts,
    },
    {
      id: "seed-mastery-caleb-molecule",
      studentId: SEED_IDS.users.students.calebWashington,
      vocabularyWordId: SEED_WORD_IDS.molecule,
      unitId: SEED_IDS.units.matter,
      weightedScore: 15,
      status: "introduced",
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
      lastSessionAt: isoDaysAgo(2),
      masteredAt: null,
      ...ts,
    },
    {
      id: "seed-mastery-aisha-hypothesis",
      studentId: SEED_IDS.users.students.aishaPatel,
      vocabularyWordId: SEED_WORD_IDS.hypothesis,
      unitId: SEED_IDS.units.scientificInvestigation,
      weightedScore: 82,
      status: "nearly_mastered",
      sessionCount: 1,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: true,
      lastSessionAt: isoDaysAgo(6),
      masteredAt: null,
      ...ts,
    },
  ];
}

function buildSkillMastery(): StudentSkillMastery[] {
  const records: StudentSkillMastery[] = [];
  const profiles = [
    { studentId: SEED_IDS.users.students.emmaChen, wordId: SEED_WORD_IDS.evaporation, scores: { listening: 95, phoneme_sequencing: 90, grapheme_mapping: 88, spelling: 92, morphology: 85, pronunciation: 90, picture_association: 94, definition_knowledge: 96, context_use: 90, written_production: 88, concept_application: 93, retrieval_fluency: 90, syllable_awareness: 92 } },
    { studentId: SEED_IDS.users.students.marcusJohnson, wordId: SEED_WORD_IDS.evaporation, scores: { listening: 80, phoneme_sequencing: 55, grapheme_mapping: 60, spelling: 58, morphology: 70, pronunciation: 75, picture_association: 85, definition_knowledge: 88, context_use: 72, written_production: 50, concept_application: 78, retrieval_fluency: 65, syllable_awareness: 62 } },
    { studentId: SEED_IDS.users.students.jaydenTaylor, wordId: SEED_WORD_IDS.force, scores: { listening: 78, phoneme_sequencing: 52, grapheme_mapping: 48, spelling: 45, morphology: 60, pronunciation: 70, picture_association: 82, definition_knowledge: 80, context_use: 75, written_production: 42, concept_application: 68, retrieval_fluency: 55, syllable_awareness: 58 } },
  ] as const;

  for (const profile of profiles) {
    for (const [skillCategory, score] of Object.entries(profile.scores)) {
      records.push({
        id: `seed-skill-${profile.studentId}-${profile.wordId}-${skillCategory}`,
        studentId: profile.studentId,
        vocabularyWordId: profile.wordId,
        skillCategory: skillCategory as StudentSkillMastery["skillCategory"],
        score,
        attemptCount: 10,
        correctCount: Math.round(score / 10),
        lastAttemptAt: isoDaysAgo(5),
        ...ts,
      });
    }
  }

  return records;
}

function buildReviewSchedules(): ReviewSchedule[] {
  return [
    {
      id: "seed-review-grace-evaporation",
      studentId: SEED_IDS.users.students.graceKim,
      vocabularyWordId: SEED_WORD_IDS.evaporation,
      intervalKey: "seven_days",
      scheduledFor: isoDaysAgo(-1, 8),
      completedAt: null,
      sessionId: null,
      isDue: true,
      ...ts,
    },
    {
      id: "seed-review-emma-condensation",
      studentId: SEED_IDS.users.students.emmaChen,
      vocabularyWordId: SEED_WORD_IDS.condensation,
      intervalKey: "three_days",
      scheduledFor: isoDaysAgo(1, 8),
      completedAt: null,
      sessionId: null,
      isDue: true,
      ...ts,
    },
    {
      id: "seed-review-marcus-evaporation",
      studentId: SEED_IDS.users.students.marcusJohnson,
      vocabularyWordId: SEED_WORD_IDS.evaporation,
      intervalKey: "one_day",
      scheduledFor: isoDaysAgo(0, 8),
      completedAt: null,
      sessionId: null,
      isDue: true,
      ...ts,
    },
  ];
}

function buildStudentRewards(): StudentReward[] {
  return [
    {
      id: "seed-student-reward-emma-water",
      studentId: SEED_IDS.users.students.emmaChen,
      rewardId: "seed-reward-water-cycle",
      earnedAt: isoDaysAgo(7),
      sessionId: "seed-session-emma-evaporation-2",
      createdAt: isoDaysAgo(7),
    },
    {
      id: "seed-student-reward-aisha-hypothesis",
      studentId: SEED_IDS.users.students.aishaPatel,
      rewardId: "seed-reward-lab-badge-1",
      earnedAt: isoDaysAgo(6),
      sessionId: "seed-session-aisha-hypothesis-1",
      createdAt: isoDaysAgo(6),
    },
    {
      id: "seed-student-reward-olivia-ecosystem",
      studentId: SEED_IDS.users.students.oliviaNguyen,
      rewardId: "seed-reward-ecosystem-garden",
      earnedAt: isoDaysAgo(20),
      sessionId: "seed-session-olivia-ecosystem-1",
      createdAt: isoDaysAgo(20),
    },
  ];
}

export function buildDemoLearningData() {
  const learningSessions = buildSessions();
  const { attempts: learningAttempts, events: learningEvents } = buildAttemptsAndEvents(learningSessions);

  return {
    learningSessions,
    learningAttempts,
    learningEvents,
    studentWordMastery: buildWordMastery(),
    studentSkillMastery: buildSkillMastery(),
    reviewSchedules: buildReviewSchedules(),
    studentRewards: buildStudentRewards(),
    demoWordIds: DEMO_WORD_IDS,
  };
}

export const SEED_DEMO_LEARNING = buildDemoLearningData();
