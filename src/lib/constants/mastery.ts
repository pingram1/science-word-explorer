import type { MasteryThresholds, SkillCategory } from "@/lib/types";

/** Weight groups for word mastery calculation (must sum to 1). */
export interface MasteryWeightGroup {
  key: string;
  label: string;
  weight: number;
  skills: SkillCategory[];
}

export const DEFAULT_MASTERY_WEIGHT_GROUPS: readonly MasteryWeightGroup[] = [
  {
    key: "sound_and_syllable",
    label: "Sound and syllable work",
    weight: 0.15,
    skills: ["listening", "syllable_awareness", "phoneme_sequencing"],
  },
  {
    key: "word_building_and_spelling",
    label: "Word building and spelling",
    weight: 0.2,
    skills: ["grapheme_mapping", "spelling", "written_production"],
  },
  {
    key: "morphology",
    label: "Morphology",
    weight: 0.1,
    skills: ["morphology"],
  },
  {
    key: "pronunciation",
    label: "Pronunciation or verified oral reading",
    weight: 0.1,
    skills: ["pronunciation"],
  },
  {
    key: "picture_and_definition",
    label: "Picture and definition knowledge",
    weight: 0.15,
    skills: ["picture_association", "definition_knowledge"],
  },
  {
    key: "sentence_and_context",
    label: "Sentence and context use",
    weight: 0.15,
    skills: ["context_use"],
  },
  {
    key: "science_concept_application",
    label: "Science concept application",
    weight: 0.15,
    skills: ["concept_application", "retrieval_fluency"],
  },
] as const;

/** Essential skills that must be attempted before mastery can be awarded. */
export const ESSENTIAL_SKILLS_FOR_MASTERY: readonly SkillCategory[] = [
  "listening",
  "grapheme_mapping",
  "definition_knowledge",
  "concept_application",
] as const;

export const DEFAULT_MASTERY_THRESHOLDS: MasteryThresholds = {
  masteredMinScore: 85,
  nearlyMasteredMinScore: 70,
  practicingMinScore: 40,
  minSessionsForMastery: 2,
};

/** Configurable mastery settings used by the learning engine. */
export interface MasteryConfig {
  weightGroups: readonly MasteryWeightGroup[];
  thresholds: MasteryThresholds;
  essentialSkills: readonly SkillCategory[];
}

export const DEFAULT_MASTERY_CONFIG: MasteryConfig = {
  weightGroups: DEFAULT_MASTERY_WEIGHT_GROUPS,
  thresholds: DEFAULT_MASTERY_THRESHOLDS,
  essentialSkills: ESSENTIAL_SKILLS_FOR_MASTERY,
};

/**
 * Creates a mastery config with optional overrides.
 * Validates that weight groups sum to approximately 1.
 */
export function createMasteryConfig(
  overrides: Partial<MasteryConfig> = {},
): MasteryConfig {
  const config: MasteryConfig = {
    weightGroups: overrides.weightGroups ?? DEFAULT_MASTERY_WEIGHT_GROUPS,
    thresholds: { ...DEFAULT_MASTERY_THRESHOLDS, ...overrides.thresholds },
    essentialSkills: overrides.essentialSkills ?? ESSENTIAL_SKILLS_FOR_MASTERY,
  };

  const totalWeight = config.weightGroups.reduce((sum, group) => sum + group.weight, 0);
  if (Math.abs(totalWeight - 1) > 0.001) {
    throw new Error(`Mastery weight groups must sum to 1. Received ${totalWeight}.`);
  }

  return config;
}
