import { describe, expect, it } from "vitest";
import {
  applyAdaptiveRules,
  getSupportRecommendations,
  isSupportDependentCorrect,
} from "@/lib/learning/adaptive";
import { makeAttempt, makeSupportProfile } from "./helpers";

describe("applyAdaptiveRules", () => {
  it("enables slow playback after two consecutive incorrect attempts", () => {
    const recentAttempts = [
      makeAttempt({ skillCategory: "spelling", isCorrect: false }),
      makeAttempt({ skillCategory: "spelling", isCorrect: false }),
    ];

    const result = applyAdaptiveRules({
      skillCategory: "spelling",
      recentAttempts,
      currentSupportProfile: makeSupportProfile({ slowPlayback: false }),
      supportLevel: 2,
    });

    expect(result.updatedSupportProfile.slowPlayback).toBe(true);
    expect(result.explanations.some((e) => e.includes("slow audio"))).toBe(true);
  });

  it("escalates through supports after repeated errors", () => {
    const profile = makeSupportProfile({
      slowPlayback: true,
      syllableHighlighting: false,
    });

    const result = applyAdaptiveRules({
      skillCategory: "spelling",
      recentAttempts: [
        makeAttempt({ skillCategory: "spelling", isCorrect: false }),
        makeAttempt({ skillCategory: "spelling", isCorrect: false }),
      ],
      currentSupportProfile: profile,
      supportLevel: 2,
    });

    expect(result.updatedSupportProfile.syllableHighlighting).toBe(true);
  });

  it("reduces word bank after three consecutive correct responses without hints", () => {
    const result = applyAdaptiveRules({
      skillCategory: "spelling",
      recentAttempts: [
        makeAttempt({ skillCategory: "spelling", isCorrect: true, hintsUsed: 0 }),
        makeAttempt({ skillCategory: "spelling", isCorrect: true, hintsUsed: 0 }),
        makeAttempt({ skillCategory: "spelling", isCorrect: true, hintsUsed: 0 }),
      ],
      currentSupportProfile: makeSupportProfile({ wordBank: true }),
      supportLevel: 2,
    });

    expect(result.updatedSupportProfile.wordBank).toBe(false);
    expect(result.explanations.some((e) => e.includes("word bank"))).toBe(true);
  });

  it("reduces support level after sustained success without hints", () => {
    const result = applyAdaptiveRules({
      skillCategory: "definition_knowledge",
      recentAttempts: [
        makeAttempt({ skillCategory: "definition_knowledge", isCorrect: true, hintsUsed: 0 }),
        makeAttempt({ skillCategory: "definition_knowledge", isCorrect: true, hintsUsed: 0 }),
        makeAttempt({ skillCategory: "definition_knowledge", isCorrect: true, hintsUsed: 0 }),
      ],
      currentSupportProfile: makeSupportProfile(),
      supportLevel: 2,
    });

    expect(result.updatedSupportLevel).toBe(3);
  });

  it("schedules spelling review when definition is strong but spelling is weak", () => {
    const recentAttempts = [
      makeAttempt({ skillCategory: "definition_knowledge", isCorrect: true }),
      makeAttempt({ skillCategory: "definition_knowledge", isCorrect: true }),
      makeAttempt({ skillCategory: "spelling", isCorrect: false }),
      makeAttempt({ skillCategory: "written_production", isCorrect: false }),
    ];

    const result = applyAdaptiveRules({
      skillCategory: "spelling",
      recentAttempts,
      currentSupportProfile: makeSupportProfile(),
      supportLevel: 2,
    });

    expect(result.reviewFocus).toBe("spelling");
  });

  it("flags oral-language support when audio is replayed heavily", () => {
    const result = applyAdaptiveRules({
      skillCategory: "pronunciation",
      recentAttempts: [
        makeAttempt({
          skillCategory: "pronunciation",
          isCorrect: true,
          audioReplays: 4,
        }),
      ],
      currentSupportProfile: makeSupportProfile({ slowPlayback: false }),
      supportLevel: 2,
    });

    expect(result.flagOralLanguageSupport).toBe(true);
    expect(result.updatedSupportProfile.slowPlayback).toBe(true);
  });
});

describe("getSupportRecommendations", () => {
  it("returns teacher-visible recommendations with reasons", () => {
    const recommendations = getSupportRecommendations({
      skillCategory: "spelling",
      recentAttempts: [
        makeAttempt({ skillCategory: "spelling", isCorrect: false }),
        makeAttempt({ skillCategory: "spelling", isCorrect: false }),
      ],
      currentSupportProfile: makeSupportProfile({ slowPlayback: false }),
      supportLevel: 2,
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].reason.length).toBeGreaterThan(0);
    expect(recommendations[0].triggeredByRule).toBeTruthy();
  });
});

describe("isSupportDependentCorrect", () => {
  it("returns true when correct but hints were used", () => {
    expect(
      isSupportDependentCorrect(
        makeAttempt({ skillCategory: "spelling", isCorrect: true, hintsUsed: 2 }),
      ),
    ).toBe(true);
  });

  it("returns false for independent correct responses", () => {
    expect(
      isSupportDependentCorrect(
        makeAttempt({ skillCategory: "spelling", isCorrect: true, hintsUsed: 0 }),
      ),
    ).toBe(false);
  });
});
