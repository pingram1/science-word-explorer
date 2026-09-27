/**
 * Core domain types for Science Word Explorer.
 * Structured literacy vocabulary instruction for 5th-grade science.
 */

// ---------------------------------------------------------------------------
// Enums and unions
// ---------------------------------------------------------------------------

export type UserRole = "student" | "teacher" | "admin";

/** Standardized skill categories tracked across learning events. */
export type SkillCategory =
  | "listening"
  | "syllable_awareness"
  | "phoneme_sequencing"
  | "grapheme_mapping"
  | "spelling"
  | "morphology"
  | "pronunciation"
  | "picture_association"
  | "definition_knowledge"
  | "context_use"
  | "written_production"
  | "concept_application"
  | "retrieval_fluency";

/** Standardized error categories for learning analytics. */
export type ErrorCategory =
  | "omission"
  | "insertion"
  | "substitution"
  | "transposition"
  | "incorrect_syllable_boundary"
  | "incorrect_sound_order"
  | "prefix_error"
  | "root_or_base_error"
  | "suffix_error"
  | "definition_misconception"
  | "picture_misconception"
  | "context_misconception"
  | "science_concept_misconception"
  | "no_response"
  | "timed_out"
  | "support_dependent_correct_response";

/** Configurable instructional support levels (1 = maximum, 4 = advanced). */
export type SupportLevel = 1 | 2 | 3 | 4;

/** Word-level mastery progression statuses. */
export type WordMasteryStatus =
  | "not_started"
  | "introduced"
  | "practicing"
  | "nearly_mastered"
  | "mastered"
  | "review_due"
  | "needs_teacher_support";

/** Ten-step structured literacy word learning routine. */
export type InstructionalStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type DeviceCategory = "desktop" | "tablet" | "chromebook" | "interactive_display" | "unknown";

export type InputPreference = "typing" | "handwriting" | "both";

export type FontPreference = "default" | "opendyslexic" | "high_legibility_sans";

export type ClassMembershipRole = "student" | "teacher";

export type LearningSessionStatus = "in_progress" | "completed" | "abandoned";

export type CompletionStatus = "completed" | "skipped" | "in_progress" | "abandoned";

export type ReviewIntervalKey =
  | "same_session"
  | "one_day"
  | "three_days"
  | "seven_days"
  | "fourteen_days";

export type InterventionGroupStatus = "suggested" | "active" | "dismissed";

export type AssignmentStatus = "draft" | "active" | "archived";

// ---------------------------------------------------------------------------
// User and organization
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  gradeLevel: number;
  defaultSupportLevel: SupportLevel;
  supportProfileId: string | null;
  journeyProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  schoolName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  gradeLevel: number;
  defaultSupportLevel: SupportLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassMembership {
  id: string;
  classId: string;
  userId: string;
  role: ClassMembershipRole;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export interface Unit {
  id: string;
  slug: string;
  title: string;
  description: string;
  gradeLevel: number;
  standardsTags: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MorphemeEntry {
  part: string;
  type: "prefix" | "root" | "base" | "suffix";
  meaning: string;
}

export interface GlossaryTranslation {
  languageCode: string;
  term: string;
  definition: string;
}

export interface VocabularyImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export interface ApplicationQuestion {
  id: string;
  vocabularyWordId: string;
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation: string;
  difficultyLevel: SupportLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyWord {
  id: string;
  unitId: string;
  word: string;
  gradeLevel: number;
  standardsTags: string[];
  studentFriendlyDefinition: string;
  formalDefinition: string;
  pronunciationAudioUrl: string | null;
  syllableBreakdown: string[];
  phonemeSequence: string[];
  graphemeSequence: string[];
  prefix: string | null;
  baseOrRoot: string | null;
  suffix: string | null;
  morphemeMeanings: MorphemeEntry[];
  morphologyApplicable: boolean;
  /** True when linguistic fields need teacher review before use in instruction. */
  requiresTeacherReview: boolean;
  images: VocabularyImage[];
  imageDistractorIds: string[];
  definitionDistractors: string[];
  exampleSentence: string;
  clozeSentence: string;
  applicationQuestions: ApplicationQuestion[];
  commonSpellingErrors: string[];
  commonMisconceptions: string[];
  glossaryTranslations: GlossaryTranslation[];
  difficultyLevel: SupportLevel;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Student support profile
// ---------------------------------------------------------------------------

export interface StudentSupportProfile {
  id: string;
  studentId: string;
  fontPreference: FontPreference;
  textSize: "small" | "medium" | "large" | "extra_large";
  letterSpacing: "normal" | "wide" | "extra_wide";
  lineSpacing: "normal" | "relaxed" | "loose";
  reducedMotion: boolean;
  audioDirections: boolean;
  textToSpeech: boolean;
  slowPlayback: boolean;
  syllableHighlighting: boolean;
  morphemeHighlighting: boolean;
  numberOfDistractors: 2 | 3 | 4;
  wordBank: boolean;
  pictureSupport: boolean;
  extendedTime: boolean;
  bilingualGlossary: boolean;
  preferredGlossaryLanguage: string | null;
  speechRecognitionAlternative: boolean;
  inputPreference: InputPreference;
  /** Non-restricted display prefs students may adjust themselves. */
  studentAdjustableDisplay: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Learning sessions and events
// ---------------------------------------------------------------------------

export interface LearningSession {
  id: string;
  studentId: string;
  classId: string | null;
  unitId: string;
  vocabularyWordId: string;
  assignmentId: string | null;
  supportLevel: SupportLevel;
  currentStep: InstructionalStep;
  status: LearningSessionStatus;
  startedAt: string;
  completedAt: string | null;
  lastActivityAt: string;
  deviceCategory: DeviceCategory;
  createdAt: string;
  updatedAt: string;
}

export interface LearningAttempt {
  id: string;
  sessionId: string;
  studentId: string;
  vocabularyWordId: string;
  instructionalStep: InstructionalStep;
  skillCategory: SkillCategory;
  supportLevel: SupportLevel;
  isCorrect: boolean;
  studentResponse: string | null;
  correctResponse: string | null;
  errorCategories: ErrorCategory[];
  responseTimeMs: number;
  attemptNumber: number;
  hintsUsed: number;
  audioReplays: number;
  slowAudioUsed: boolean;
  textToSpeechUsed: boolean;
  wordBankUsed: boolean;
  pictureSupportUsed: boolean;
  speechRecognitionConfidence: number | null;
  teacherVerified: boolean;
  supportDependentCorrect: boolean;
  completionStatus: CompletionStatus;
  createdAt: string;
}

export interface LearningEvent {
  id: string;
  studentId: string;
  classId: string | null;
  unitId: string;
  vocabularyWordId: string;
  sessionId: string;
  attemptId: string | null;
  instructionalStep: InstructionalStep;
  skillCategory: SkillCategory;
  supportLevel: SupportLevel;
  promptShown: string | null;
  studentResponse: string | null;
  correctResponse: string | null;
  isCorrect: boolean;
  errorCategories: ErrorCategory[];
  responseTimeMs: number;
  attemptNumber: number;
  hintsUsed: number;
  audioReplays: number;
  slowAudioUsed: boolean;
  textToSpeechUsed: boolean;
  wordBankUsed: boolean;
  pictureSupportUsed: boolean;
  speechRecognitionConfidence: number | null;
  teacherVerified: boolean;
  supportDependentCorrect: boolean;
  completionStatus: CompletionStatus;
  deviceCategory: DeviceCategory;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Mastery and review
// ---------------------------------------------------------------------------

export interface StudentWordMastery {
  id: string;
  studentId: string;
  vocabularyWordId: string;
  unitId: string;
  weightedScore: number;
  status: WordMasteryStatus;
  sessionCount: number;
  successfulWithoutHighHint: boolean;
  retrievalAttemptCompleted: boolean;
  essentialSkillsCompleted: boolean;
  lastSessionAt: string | null;
  masteredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSkillMastery {
  id: string;
  studentId: string;
  vocabularyWordId: string;
  skillCategory: SkillCategory;
  score: number;
  attemptCount: number;
  correctCount: number;
  lastAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSchedule {
  id: string;
  studentId: string;
  vocabularyWordId: string;
  intervalKey: ReviewIntervalKey;
  scheduledFor: string;
  completedAt: string | null;
  sessionId: string | null;
  isDue: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Rewards and intervention
// ---------------------------------------------------------------------------

export interface Reward {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "lab_badge" | "garden_item" | "space_mission" | "wilderness_trail" | "milestone";
  imageUrl: string | null;
  pointsRequired: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentReward {
  id: string;
  studentId: string;
  rewardId: string;
  earnedAt: string;
  sessionId: string | null;
  createdAt: string;
}

export interface InterventionGroup {
  id: string;
  classId: string;
  name: string;
  reason: string;
  supportingData: string;
  recommendedActivity: string;
  status: InterventionGroupStatus;
  isManual: boolean;
  skillFocus: SkillCategory | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterventionGroupMember {
  id: string;
  groupId: string;
  studentId: string;
  addedAt: string;
}

export interface TeacherNote {
  id: string;
  teacherId: string;
  studentId: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

export interface Assignment {
  id: string;
  classId: string;
  unitId: string;
  teacherId: string;
  title: string;
  defaultSupportLevel: SupportLevel;
  dueDate: string | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentWord {
  id: string;
  assignmentId: string;
  vocabularyWordId: string;
  supportLevelOverride: SupportLevel | null;
  sortOrder: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Engine input/output helpers
// ---------------------------------------------------------------------------

export interface SkillScoreInput {
  skillCategory: SkillCategory;
  /** Score from 0–100 for this skill on a word. */
  score: number;
}

export interface MasteryCalculationInput {
  skillScores: SkillScoreInput[];
  sessionCount: number;
  successfulWithoutHighHint: boolean;
  retrievalAttemptCompleted: boolean;
  essentialSkillsCompleted: boolean;
}

export interface MasteryThresholds {
  masteredMinScore: number;
  nearlyMasteredMinScore: number;
  practicingMinScore: number;
  minSessionsForMastery: number;
}

export interface AdaptiveRuleContext {
  skillCategory: SkillCategory;
  recentAttempts: LearningAttempt[];
  currentSupportProfile: StudentSupportProfile;
  supportLevel: SupportLevel;
}

export interface AdaptiveRuleResult {
  updatedSupportProfile: Partial<StudentSupportProfile>;
  updatedSupportLevel: SupportLevel | null;
  reviewFocus: SkillCategory | null;
  flagOralLanguageSupport: boolean;
  explanations: string[];
}

export type SupportSettingKey = keyof StudentSupportProfile | "support_level";

export interface SupportRecommendation {
  supportKey: SupportSettingKey;
  suggestedValue: boolean | SupportLevel | number;
  reason: string;
  triggeredByRule: string;
}

export interface SpellingErrorClassification {
  errors: ErrorCategory[];
  details: string[];
}

export interface ProgressSummary {
  totalWords: number;
  wordsMastered: number;
  wordsInProgress: number;
  wordsNotStarted: number;
  wordsReviewDue: number;
  percentComplete: number;
}

export interface UnitProgressSummary extends ProgressSummary {
  unitId: string;
}

export interface StudentProgressSummary extends ProgressSummary {
  studentId: string;
  averageMasteryScore: number;
  activeUnits: number;
}

/** Maps each instructional step to its primary skill category. */
export const INSTRUCTIONAL_STEP_SKILLS: Record<InstructionalStep, SkillCategory> = {
  1: "listening",
  2: "phoneme_sequencing",
  3: "grapheme_mapping",
  4: "morphology",
  5: "pronunciation",
  6: "picture_association",
  7: "definition_knowledge",
  8: "context_use",
  9: "written_production",
  10: "concept_application",
};

export const ALL_SKILL_CATEGORIES: readonly SkillCategory[] = [
  "listening",
  "syllable_awareness",
  "phoneme_sequencing",
  "grapheme_mapping",
  "spelling",
  "morphology",
  "pronunciation",
  "picture_association",
  "definition_knowledge",
  "context_use",
  "written_production",
  "concept_application",
  "retrieval_fluency",
] as const;

export const ALL_ERROR_CATEGORIES: readonly ErrorCategory[] = [
  "omission",
  "insertion",
  "substitution",
  "transposition",
  "incorrect_syllable_boundary",
  "incorrect_sound_order",
  "prefix_error",
  "root_or_base_error",
  "suffix_error",
  "definition_misconception",
  "picture_misconception",
  "context_misconception",
  "science_concept_misconception",
  "no_response",
  "timed_out",
  "support_dependent_correct_response",
] as const;
