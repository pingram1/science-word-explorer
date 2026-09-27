import type { InstructionalStep, SkillCategory } from "@/lib/types";

/** Supportive corrective feedback — avoid punitive language. */
export const SUPPORTIVE_FEEDBACK = {
  general: {
    tryAgain: "Let's look at that part again.",
    partialSuccess: "You're on the right track.",
    corrected: "You corrected your spelling.",
    keepGoing: "Keep exploring this word.",
    nextStep: "Nice work — let's try the next step.",
  },
  syllable: {
    foundFirst: "You found the first syllable.",
    listenMiddle: "Listen to the middle sound.",
    clapSyllables: "Try clapping each syllable as you say the word.",
  },
  spelling: {
    checkLetters: "Check the letters in that part of the word.",
    useWordParts: "Try using the word parts.",
    buildAgain: "Let's build the word one piece at a time.",
  },
  morphology: {
    matchParts: "Match each word part to its meaning.",
    rootMeaning: "The root helps explain the science idea.",
  },
  definition: {
    reread: "Reread the definition and think about what the word means in science.",
    connectPicture: "Think about how the picture connects to the meaning.",
  },
  context: {
    sentenceClue: "Use the sentence clues to find the best word.",
    scienceExample: "Now apply the word to a science example.",
  },
  application: {
    thinkScenario: "Think about which situation best shows this science idea.",
    explainReason: "Explain why that example fits the concept.",
  },
  pronunciation: {
    listenAgain: "Listen again, then try reading the word aloud.",
    slowAudio: "Try the slow audio to hear each part clearly.",
  },
  encouragement: {
    effort: "Your effort is helping you learn this word.",
    progress: "You're making progress on this science vocabulary.",
    review: "Review helps your brain remember — great job showing up.",
  },
} as const;

export type FeedbackCategory = keyof typeof SUPPORTIVE_FEEDBACK;

/** Step-specific feedback pools for immediate corrective responses. */
export const STEP_FEEDBACK: Record<InstructionalStep, readonly string[]> = {
  1: [
    SUPPORTIVE_FEEDBACK.syllable.foundFirst,
    SUPPORTIVE_FEEDBACK.syllable.listenMiddle,
    SUPPORTIVE_FEEDBACK.pronunciation.listenAgain,
  ],
  2: [
    SUPPORTIVE_FEEDBACK.syllable.listenMiddle,
    "Match each sound in order.",
    SUPPORTIVE_FEEDBACK.general.tryAgain,
  ],
  3: [
    SUPPORTIVE_FEEDBACK.spelling.buildAgain,
    SUPPORTIVE_FEEDBACK.spelling.checkLetters,
    SUPPORTIVE_FEEDBACK.general.corrected,
  ],
  4: [
    SUPPORTIVE_FEEDBACK.morphology.matchParts,
    SUPPORTIVE_FEEDBACK.spelling.useWordParts,
    SUPPORTIVE_FEEDBACK.morphology.rootMeaning,
  ],
  5: [
    SUPPORTIVE_FEEDBACK.pronunciation.listenAgain,
    SUPPORTIVE_FEEDBACK.pronunciation.slowAudio,
    SUPPORTIVE_FEEDBACK.general.partialSuccess,
  ],
  6: [
    SUPPORTIVE_FEEDBACK.definition.connectPicture,
    "Look closely at what is happening in each picture.",
    SUPPORTIVE_FEEDBACK.general.tryAgain,
  ],
  7: [
    SUPPORTIVE_FEEDBACK.definition.reread,
    "Compare each definition carefully.",
    SUPPORTIVE_FEEDBACK.general.tryAgain,
  ],
  8: [
    SUPPORTIVE_FEEDBACK.context.sentenceClue,
    "Read the whole sentence before you choose.",
    SUPPORTIVE_FEEDBACK.general.partialSuccess,
  ],
  9: [
    SUPPORTIVE_FEEDBACK.spelling.checkLetters,
    SUPPORTIVE_FEEDBACK.general.corrected,
    SUPPORTIVE_FEEDBACK.spelling.buildAgain,
  ],
  10: [
    SUPPORTIVE_FEEDBACK.application.thinkScenario,
    SUPPORTIVE_FEEDBACK.context.scienceExample,
    SUPPORTIVE_FEEDBACK.application.explainReason,
  ],
};

/** Skill-specific feedback when step context is unavailable. */
export const SKILL_FEEDBACK: Partial<Record<SkillCategory, readonly string[]>> = {
  listening: STEP_FEEDBACK[1],
  syllable_awareness: [
    SUPPORTIVE_FEEDBACK.syllable.foundFirst,
    SUPPORTIVE_FEEDBACK.syllable.clapSyllables,
  ],
  phoneme_sequencing: STEP_FEEDBACK[2],
  grapheme_mapping: STEP_FEEDBACK[3],
  spelling: [
    SUPPORTIVE_FEEDBACK.spelling.checkLetters,
    SUPPORTIVE_FEEDBACK.spelling.useWordParts,
  ],
  morphology: STEP_FEEDBACK[4],
  pronunciation: STEP_FEEDBACK[5],
  picture_association: STEP_FEEDBACK[6],
  definition_knowledge: STEP_FEEDBACK[7],
  context_use: STEP_FEEDBACK[8],
  written_production: STEP_FEEDBACK[9],
  concept_application: STEP_FEEDBACK[10],
  retrieval_fluency: [
    SUPPORTIVE_FEEDBACK.encouragement.review,
    SUPPORTIVE_FEEDBACK.general.tryAgain,
  ],
};

/**
 * Returns supportive feedback for an attempt.
 * Uses attempt number to rotate messages without repeating punitive wording.
 */
export function getSupportiveFeedback(options: {
  step?: InstructionalStep;
  skill?: SkillCategory;
  isCorrect?: boolean;
  attemptNumber?: number;
}): string {
  const { step, skill, isCorrect = false, attemptNumber = 1 } = options;

  if (isCorrect) {
    return attemptNumber > 1
      ? SUPPORTIVE_FEEDBACK.general.corrected
      : SUPPORTIVE_FEEDBACK.general.nextStep;
  }

  const pool =
    (step !== undefined ? STEP_FEEDBACK[step] : undefined) ??
    (skill !== undefined ? SKILL_FEEDBACK[skill] : undefined) ??
    [SUPPORTIVE_FEEDBACK.general.tryAgain];

  return pool[(attemptNumber - 1) % pool.length];
}

/** Phrases that must not appear in student-facing feedback. */
export const DISALLOWED_FEEDBACK_PHRASES: readonly string[] = [
  "wrong",
  "failed",
  "failure",
  "bad",
  "incorrect student",
] as const;
