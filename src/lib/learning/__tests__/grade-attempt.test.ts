import { describe, expect, it } from "vitest";
import {
  assertSessionAcceptsAttempts,
  gradeInstructionalStep,
  hasPassedStep,
  StepProgressError,
} from "@/lib/learning/grade-attempt";
import type { LearningAttempt, VocabularyWord } from "@/lib/types";

function makeWord(overrides: Partial<VocabularyWord> = {}): VocabularyWord {
  return {
    id: "word-evaporation",
    unitId: "unit-water",
    word: "evaporation",
    gradeLevel: 5,
    standardsTags: [],
    studentFriendlyDefinition: "Liquid water changing into water vapor.",
    formalDefinition: "Liquid water changing into water vapor.",
    pronunciationAudioUrl: null,
    syllableBreakdown: ["e", "vap", "o", "ra", "tion"],
    phonemeSequence: ["/ih/", "/v/", "/ae/"],
    graphemeSequence: ["e", "v", "a"],
    prefix: null,
    baseOrRoot: "evapor",
    suffix: "-ation",
    morphemeMeanings: [
      { part: "evapor", type: "root", meaning: "to change into vapor" },
      { part: "-ation", type: "suffix", meaning: "the process or result of" },
    ],
    morphologyApplicable: true,
    requiresTeacherReview: false,
    images: [{ id: "img-primary", url: "/primary.png", altText: "Puddle", isPrimary: true }],
    imageDistractorIds: ["img-wrong"],
    definitionDistractors: ["Rain falling from clouds."],
    exampleSentence: "The puddle shrank.",
    clozeSentence: "The puddle shrank because of __________.",
    applicationQuestions: [
      {
        id: "q1",
        vocabularyWordId: "word-evaporation",
        prompt: "Why did the towel dry?",
        choices: ["Evaporation", "Condensation", "Erosion"],
        correctChoiceIndex: 0,
        explanation: "Heat turns liquid to vapor.",
        difficultyLevel: 2,
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    commonSpellingErrors: [],
    commonMisconceptions: [],
    glossaryTranslations: [],
    difficultyLevel: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("gradeInstructionalStep", () => {
  const word = makeWord();

  it("grades syllable claps against the canonical breakdown, ignoring client claims", () => {
    expect(
      gradeInstructionalStep({
        instructionalStep: 1,
        word,
        studentResponse: "5",
      }).isCorrect,
    ).toBe(true);

    expect(
      gradeInstructionalStep({
        instructionalStep: 1,
        word,
        studentResponse: "2",
      }).isCorrect,
    ).toBe(false);
  });

  it("rejects an empty response instead of treating it as correct", () => {
    const result = gradeInstructionalStep({
      instructionalStep: 9,
      word,
      studentResponse: "",
    });
    expect(result.isCorrect).toBe(false);
    expect(result.errorCategories).toContain("no_response");
  });

  it("grades spelling from the word record, not a client-supplied correctResponse", () => {
    const correct = gradeInstructionalStep({
      instructionalStep: 9,
      word,
      studentResponse: "evaporation",
    });
    const spoofed = gradeInstructionalStep({
      instructionalStep: 9,
      word,
      studentResponse: "xyz",
    });
    expect(correct.isCorrect).toBe(true);
    expect(spoofed.isCorrect).toBe(false);
  });

  it("grades application questions by index against canonical choices", () => {
    expect(
      gradeInstructionalStep({
        instructionalStep: 10,
        word,
        studentResponse: "0",
      }).isCorrect,
    ).toBe(true);
    expect(
      gradeInstructionalStep({
        instructionalStep: 10,
        word,
        studentResponse: "2",
      }).isCorrect,
    ).toBe(false);
  });

  it("treats self-rated pronunciation as support-dependent, not unassisted mastery", () => {
    const result = gradeInstructionalStep({
      instructionalStep: 5,
      word,
      studentResponse: "self:confident",
    });
    expect(result.isCorrect).toBe(true);
    expect(result.supportDependentCorrect).toBe(true);
  });

  it("allows morphology skip only when the word has no applicable parts", () => {
    const skippedApplicable = gradeInstructionalStep({
      instructionalStep: 4,
      word,
      studentResponse: null,
      completionStatus: "skipped",
    });
    expect(skippedApplicable.isCorrect).toBe(false);

    const skippedNa = gradeInstructionalStep({
      instructionalStep: 4,
      word: makeWord({ morphologyApplicable: false, morphemeMeanings: [] }),
      studentResponse: null,
      completionStatus: "skipped",
    });
    expect(skippedNa.isCorrect).toBe(true);
    expect(skippedNa.supportDependentCorrect).toBe(true);
  });
});

describe("hasPassedStep / assertSessionAcceptsAttempts", () => {
  it("requires a correct attempt on the current step before advancing", () => {
    const attempts: Pick<LearningAttempt, "instructionalStep" | "isCorrect">[] = [
      { instructionalStep: 1, isCorrect: false },
    ];
    expect(hasPassedStep(1, attempts)).toBe(false);
    expect(hasPassedStep(1, [...attempts, { instructionalStep: 1, isCorrect: true }])).toBe(true);
  });

  it("rejects answers for a different step or a completed session", () => {
    expect(() =>
      assertSessionAcceptsAttempts({ status: "completed", currentStep: 1 }, 1),
    ).toThrow(StepProgressError);

    expect(() =>
      assertSessionAcceptsAttempts({ status: "in_progress", currentStep: 1 }, 10),
    ).toThrow(/current instructional step/);
  });
});
