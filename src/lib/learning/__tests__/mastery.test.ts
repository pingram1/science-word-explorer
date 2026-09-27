import { describe, expect, it } from "vitest";
import {
  calculateSkillMastery,
  calculateWordMastery,
  checkEssentialSkillsCompleted,
  createMasteryConfig,
  determineMasteryStatus,
} from "@/lib/learning/mastery";
import { DEFAULT_MASTERY_CONFIG } from "@/lib/constants/mastery";
import type { SkillScoreInput } from "@/lib/types";

function allEssentialSkills(score: number): SkillScoreInput[] {
  return [
    { skillCategory: "listening", score },
    { skillCategory: "grapheme_mapping", score },
    { skillCategory: "definition_knowledge", score },
    { skillCategory: "concept_application", score },
  ];
}

function fullWeightedSkillScores(score: number): SkillScoreInput[] {
  return [
    { skillCategory: "listening", score },
    { skillCategory: "syllable_awareness", score },
    { skillCategory: "phoneme_sequencing", score },
    { skillCategory: "grapheme_mapping", score },
    { skillCategory: "spelling", score },
    { skillCategory: "written_production", score },
    { skillCategory: "morphology", score },
    { skillCategory: "pronunciation", score },
    { skillCategory: "picture_association", score },
    { skillCategory: "definition_knowledge", score },
    { skillCategory: "context_use", score },
    { skillCategory: "concept_application", score },
    { skillCategory: "retrieval_fluency", score },
  ];
}

describe("calculateSkillMastery", () => {
  it("returns 0 for empty scores", () => {
    expect(calculateSkillMastery([])).toBe(0);
  });

  it("averages scores and clamps to 0–100", () => {
    expect(calculateSkillMastery([80, 100])).toBe(90);
    expect(calculateSkillMastery([120, -10])).toBe(50);
  });
});

describe("calculateWordMastery", () => {
  it("weights skill groups according to mastery config", () => {
    const skillScores: SkillScoreInput[] = [
      { skillCategory: "listening", score: 100 },
      { skillCategory: "grapheme_mapping", score: 100 },
      { skillCategory: "spelling", score: 100 },
      { skillCategory: "written_production", score: 100 },
      { skillCategory: "morphology", score: 100 },
      { skillCategory: "pronunciation", score: 100 },
      { skillCategory: "picture_association", score: 100 },
      { skillCategory: "definition_knowledge", score: 100 },
      { skillCategory: "context_use", score: 100 },
      { skillCategory: "concept_application", score: 100 },
      { skillCategory: "retrieval_fluency", score: 100 },
    ];

    expect(calculateWordMastery(skillScores)).toBe(100);
  });

  it("returns a partial score when only some skill groups are present", () => {
    const skillScores: SkillScoreInput[] = [
      { skillCategory: "listening", score: 100 },
      { skillCategory: "definition_knowledge", score: 100 },
    ];

    const score = calculateWordMastery(skillScores);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe("determineMasteryStatus", () => {
  it("returns mastered when all criteria are met", () => {
    const status = determineMasteryStatus({
      skillScores: fullWeightedSkillScores(95),
      sessionCount: 2,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: true,
      essentialSkillsCompleted: true,
    });

    expect(status).toBe("mastered");
  });

  it("does not return mastered when score is below threshold", () => {
    const status = determineMasteryStatus({
      skillScores: fullWeightedSkillScores(70),
      sessionCount: 2,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: true,
      essentialSkillsCompleted: true,
    });

    expect(status).toBe("nearly_mastered");
  });

  it("returns nearly_mastered at the 70% threshold", () => {
    const status = determineMasteryStatus({
      skillScores: fullWeightedSkillScores(72),
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
    });

    expect(status).toBe("nearly_mastered");
  });

  it("returns practicing when score is at least 40%", () => {
    const status = determineMasteryStatus({
      skillScores: fullWeightedSkillScores(45),
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
    });

    expect(status).toBe("practicing");
  });

  it("returns introduced when sessions exist but score is below practicing threshold", () => {
    const status = determineMasteryStatus({
      skillScores: allEssentialSkills(20),
      sessionCount: 1,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
    });

    expect(status).toBe("introduced");
  });

  it("returns not_started with no sessions and low score", () => {
    const status = determineMasteryStatus({
      skillScores: [],
      sessionCount: 0,
      successfulWithoutHighHint: false,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: false,
    });

    expect(status).toBe("not_started");
  });

  it("preserves review_due when score remains above practicing minimum", () => {
    const status = determineMasteryStatus({
      skillScores: fullWeightedSkillScores(55),
      sessionCount: 2,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: false,
      essentialSkillsCompleted: true,
      currentStatus: "review_due",
    });

    expect(status).toBe("review_due");
  });

  it("requires minimum sessions for mastery", () => {
    const status = determineMasteryStatus({
      skillScores: fullWeightedSkillScores(95),
      sessionCount: 1,
      successfulWithoutHighHint: true,
      retrievalAttemptCompleted: true,
      essentialSkillsCompleted: true,
    });

    expect(status).not.toBe("mastered");
  });
});

describe("checkEssentialSkillsCompleted", () => {
  it("returns true when essential skills meet minimum score", () => {
    expect(checkEssentialSkillsCompleted(allEssentialSkills(80))).toBe(true);
  });

  it("returns false when an essential skill is missing", () => {
    expect(
      checkEssentialSkillsCompleted([
        { skillCategory: "listening", score: 90 },
        { skillCategory: "grapheme_mapping", score: 90 },
      ]),
    ).toBe(false);
  });

  it("returns false when essential skill score is below minimum", () => {
    expect(checkEssentialSkillsCompleted(allEssentialSkills(50), 60)).toBe(false);
  });
});

describe("createMasteryConfig", () => {
  it("throws when weight groups do not sum to 1", () => {
    expect(() =>
      createMasteryConfig({
        weightGroups: [
          {
            key: "only",
            label: "Only",
            weight: 0.5,
            skills: ["listening"],
          },
        ],
      }),
    ).toThrow(/must sum to 1/);
  });

  it("allows threshold overrides", () => {
    const config = createMasteryConfig({
      thresholds: { ...DEFAULT_MASTERY_CONFIG.thresholds, masteredMinScore: 90 },
    });

    expect(config.thresholds.masteredMinScore).toBe(90);
  });
});
