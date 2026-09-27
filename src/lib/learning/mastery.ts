import {
  createMasteryConfig,
  DEFAULT_MASTERY_CONFIG,
  type MasteryConfig,
} from "@/lib/constants/mastery";
import type {
  MasteryCalculationInput,
  MasteryThresholds,
  SkillCategory,
  SkillScoreInput,
  WordMasteryStatus,
} from "@/lib/types";

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function averageScores(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Calculates an aggregate score for a single skill category from attempt-level scores.
 */
export function calculateSkillMastery(scores: number[]): number {
  if (scores.length === 0) return 0;
  return clampScore(averageScores(scores.map(clampScore)));
}

/**
 * Calculates weighted word mastery from per-skill scores using configurable weight groups.
 * Returns a score from 0–100.
 */
export function calculateWordMastery(
  skillScores: SkillScoreInput[],
  config: MasteryConfig = DEFAULT_MASTERY_CONFIG,
): number {
  const aggregatedBySkill = new Map<SkillCategory, number[]>();
  for (const entry of skillScores) {
    const list = aggregatedBySkill.get(entry.skillCategory) ?? [];
    list.push(entry.score);
    aggregatedBySkill.set(entry.skillCategory, list);
  }

  let weightedTotal = 0;

  for (const group of config.weightGroups) {
    const groupScores: number[] = [];

    for (const skill of group.skills) {
      const scores = aggregatedBySkill.get(skill);
      if (scores && scores.length > 0) {
        groupScores.push(calculateSkillMastery(scores));
      }
    }

    const groupAverage = groupScores.length > 0 ? averageScores(groupScores) : 0;
    weightedTotal += groupAverage * group.weight;
  }

  return clampScore(Math.round(weightedTotal * 100) / 100);
}

export interface DetermineMasteryStatusInput extends MasteryCalculationInput {
  /** Existing status, used to preserve review_due when appropriate. */
  currentStatus?: WordMasteryStatus;
}

/**
 * Determines word mastery status from weighted score and mastery criteria.
 * Mastery requires score threshold, essential skills, multi-session success,
 * unassisted success, and a completed retrieval attempt.
 */
export function determineMasteryStatus(
  input: DetermineMasteryStatusInput,
  config: MasteryConfig = DEFAULT_MASTERY_CONFIG,
): WordMasteryStatus {
  const thresholds: MasteryThresholds = config.thresholds;
  const weightedScore = calculateWordMastery(input.skillScores, config);

  const essentialSkillsAttempted = config.essentialSkills.every((skill) =>
    input.skillScores.some((entry) => entry.skillCategory === skill),
  );

  const meetsMasteryCriteria =
    weightedScore >= thresholds.masteredMinScore &&
    input.essentialSkillsCompleted &&
    essentialSkillsAttempted &&
    input.sessionCount >= thresholds.minSessionsForMastery &&
    input.successfulWithoutHighHint &&
    input.retrievalAttemptCompleted;

  if (meetsMasteryCriteria) {
    return "mastered";
  }

  if (input.currentStatus === "review_due" && weightedScore >= thresholds.practicingMinScore) {
    return "review_due";
  }

  if (weightedScore >= thresholds.nearlyMasteredMinScore) {
    return "nearly_mastered";
  }

  if (weightedScore >= thresholds.practicingMinScore || input.sessionCount > 0) {
    return input.sessionCount > 0 && weightedScore < thresholds.practicingMinScore
      ? "introduced"
      : "practicing";
  }

  if (input.sessionCount > 0) {
    return "introduced";
  }

  return "not_started";
}

/**
 * Checks whether essential skills have minimum acceptable scores.
 */
export function checkEssentialSkillsCompleted(
  skillScores: SkillScoreInput[],
  minimumScore = 60,
  config: MasteryConfig = DEFAULT_MASTERY_CONFIG,
): boolean {
  return config.essentialSkills.every((skill) => {
    const scores = skillScores
      .filter((entry) => entry.skillCategory === skill)
      .map((entry) => entry.score);

    if (scores.length === 0) return false;
    return calculateSkillMastery(scores) >= minimumScore;
  });
}

/** Re-export config factory for tests and teacher overrides. */
export { createMasteryConfig };
