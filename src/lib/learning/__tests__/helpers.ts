import type {
  LearningAttempt,
  SkillCategory,
  StudentSupportProfile,
} from "@/lib/types";

let attemptCounter = 0;

export function makeAttempt(
  overrides: Partial<LearningAttempt> & {
    skillCategory: SkillCategory;
    isCorrect: boolean;
  },
): LearningAttempt {
  attemptCounter += 1;
  return {
    id: `test-attempt-${attemptCounter}`,
    sessionId: "test-session",
    studentId: "test-student",
    vocabularyWordId: "test-word",
    instructionalStep: 1,
    supportLevel: 2,
    studentResponse: null,
    correctResponse: null,
    errorCategories: [],
    responseTimeMs: 1200,
    attemptNumber: 1,
    hintsUsed: 0,
    audioReplays: 0,
    slowAudioUsed: false,
    textToSpeechUsed: false,
    wordBankUsed: false,
    pictureSupportUsed: false,
    speechRecognitionConfidence: null,
    teacherVerified: false,
    supportDependentCorrect: false,
    completionStatus: "completed",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeSupportProfile(
  overrides: Partial<StudentSupportProfile> = {},
): StudentSupportProfile {
  return {
    id: "test-support-profile",
    studentId: "test-student",
    fontPreference: "default",
    textSize: "medium",
    letterSpacing: "normal",
    lineSpacing: "normal",
    reducedMotion: false,
    audioDirections: true,
    textToSpeech: false,
    slowPlayback: false,
    syllableHighlighting: false,
    morphemeHighlighting: false,
    numberOfDistractors: 3,
    wordBank: false,
    pictureSupport: false,
    extendedTime: false,
    bilingualGlossary: false,
    preferredGlossaryLanguage: null,
    speechRecognitionAlternative: true,
    inputPreference: "typing",
    studentAdjustableDisplay: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
