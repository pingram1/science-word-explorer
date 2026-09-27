import { describe, expect, it } from "vitest";
import { vocabularyWordSchema } from "@/lib/validation/vocabulary";

describe("vocabularyWordSchema", () => {
  const validWord = {
    unitId: "unit-1",
    word: "evaporation",
    gradeLevel: 5,
    standardsTags: ["5-ESS2-1"],
    studentFriendlyDefinition: "Liquid water changing into water vapor.",
    formalDefinition: "The process by which liquid water becomes water vapor.",
    syllableBreakdown: ["e", "vap", "o", "ra", "tion"],
    phonemeSequence: ["/ih/", "/v/"],
    graphemeSequence: ["e", "v"],
    morphemeMeanings: [{ part: "evapor", type: "root" as const, meaning: "to vaporize" }],
    morphologyApplicable: true,
    requiresTeacherReview: false,
    images: [
      {
        id: "img-1",
        url: "https://example.com/evaporation.jpg",
        altText: "Sun warming a puddle",
        isPrimary: true,
      },
    ],
    definitionDistractors: ["Rain falling from clouds"],
    exampleSentence: "Evaporation from the lake increased on the hot afternoon.",
    clozeSentence: "The puddle became smaller because of __________.",
    applicationQuestions: [
      {
        prompt: "Which change would speed up evaporation?",
        choices: ["Placing water in sunlight", "Covering the dish"],
        correctChoiceIndex: 0,
        explanation: "Heat increases evaporation.",
        difficultyLevel: 2 as const,
      },
    ],
    commonSpellingErrors: ["evaportion"],
    commonMisconceptions: ["Confusing evaporation with condensation"],
    glossaryTranslations: [
      { languageCode: "es", term: "evaporación", definition: "Agua líquida a vapor." },
    ],
    difficultyLevel: 3 as const,
    isActive: true,
  };

  it("accepts a valid vocabulary record", () => {
    const result = vocabularyWordSchema.safeParse(validWord);
    expect(result.success).toBe(true);
  });

  it("requires student-friendly and formal definitions", () => {
    const result = vocabularyWordSchema.safeParse({
      ...validWord,
      studentFriendlyDefinition: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects application questions with out-of-range correctChoiceIndex", () => {
    const result = vocabularyWordSchema.safeParse({
      ...validWord,
      applicationQuestions: [
        {
          prompt: "Sample question",
          choices: ["A", "B"],
          correctChoiceIndex: 3,
          explanation: "Invalid index",
          difficultyLevel: 2,
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("validates image URLs and alt text", () => {
    const result = vocabularyWordSchema.safeParse({
      ...validWord,
      images: [{ id: "img-1", url: "not-a-url", altText: "", isPrimary: true }],
    });

    expect(result.success).toBe(false);
  });
});
