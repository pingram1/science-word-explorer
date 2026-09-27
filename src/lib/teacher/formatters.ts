import type { ErrorCategory, SkillCategory, WordMasteryStatus } from "@/lib/types";

export const SKILL_LABELS: Record<SkillCategory, string> = {
  listening: "Listening",
  syllable_awareness: "Syllable awareness",
  phoneme_sequencing: "Phoneme sequencing",
  grapheme_mapping: "Grapheme mapping",
  spelling: "Spelling",
  morphology: "Morphology",
  pronunciation: "Pronunciation",
  picture_association: "Picture association",
  definition_knowledge: "Definition knowledge",
  context_use: "Context use",
  written_production: "Written production",
  concept_application: "Concept application",
  retrieval_fluency: "Retrieval fluency",
};

export const ERROR_LABELS: Record<ErrorCategory, string> = {
  omission: "Omission",
  insertion: "Insertion",
  substitution: "Substitution",
  transposition: "Transposition",
  incorrect_syllable_boundary: "Incorrect syllable boundary",
  incorrect_sound_order: "Incorrect sound order",
  prefix_error: "Prefix error",
  root_or_base_error: "Root/base error",
  suffix_error: "Suffix error",
  definition_misconception: "Definition misconception",
  picture_misconception: "Picture misconception",
  context_misconception: "Context misconception",
  science_concept_misconception: "Science concept misconception",
  no_response: "No response",
  timed_out: "Timed out",
  support_dependent_correct_response: "Support-dependent correct",
};

export const MASTERY_STATUS_LABELS: Record<WordMasteryStatus, string> = {
  not_started: "Not started",
  introduced: "Introduced",
  practicing: "Practicing",
  nearly_mastered: "Nearly mastered",
  mastered: "Mastered",
  review_due: "Review due",
  needs_teacher_support: "Needs support",
};

export const STEP_LABELS = [
  "Listen",
  "Phonemes",
  "Graphemes",
  "Morphology",
  "Pronounce",
  "Picture",
  "Definition",
  "Context",
  "Write",
  "Apply",
] as const;

export function formatSkillLabel(skill: SkillCategory): string {
  return SKILL_LABELS[skill];
}

export function formatErrorLabel(error: ErrorCategory): string {
  return ERROR_LABELS[error];
}

export function formatMasteryStatus(status: WordMasteryStatus): string {
  return MASTERY_STATUS_LABELS[status];
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export const CHART_COLORS = {
  primary: "#0a7390",
  secondary: "#0b7c74",
  tertiary: "#15803d",
  accent: "#d97706",
  muted: "#3d6b7a",
  error: "#dc4a3a",
} as const;

export const ACCESSIBLE_CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.accent,
  "#1a93b3",
  "#14b8a6",
  "#4ade80",
  CHART_COLORS.muted,
] as const;
