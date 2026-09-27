import { z } from "zod";

const morphemeEntrySchema = z.object({
  part: z.string().min(1),
  type: z.enum(["prefix", "root", "base", "suffix"]),
  meaning: z.string().min(1),
});

const vocabularyImageSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  altText: z.string().min(1),
  isPrimary: z.boolean(),
});

const glossaryTranslationSchema = z.object({
  languageCode: z.string().min(2).max(5),
  term: z.string().min(1),
  definition: z.string().min(1),
});

const applicationQuestionSchema = z.object({
  id: z.string().min(1).optional(),
  vocabularyWordId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2),
  correctChoiceIndex: z.number().int().min(0),
  explanation: z.string().min(1),
  difficultyLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const vocabularyWordBaseSchema = z.object({
    unitId: z.string().min(1),
    word: z.string().min(1).max(100),
    gradeLevel: z.number().int().min(1).max(12).default(5),
    standardsTags: z.array(z.string()).default([]),
    studentFriendlyDefinition: z.string().min(1),
    formalDefinition: z.string().min(1),
    pronunciationAudioUrl: z.string().url().nullable().optional(),
    syllableBreakdown: z.array(z.string()).default([]),
    phonemeSequence: z.array(z.string()).default([]),
    graphemeSequence: z.array(z.string()).default([]),
    prefix: z.string().nullable().optional(),
    baseOrRoot: z.string().nullable().optional(),
    suffix: z.string().nullable().optional(),
    morphemeMeanings: z.array(morphemeEntrySchema).default([]),
    morphologyApplicable: z.boolean().default(false),
    requiresTeacherReview: z.boolean().default(false),
    images: z.array(vocabularyImageSchema).default([]),
    imageDistractorIds: z.array(z.string()).default([]),
    definitionDistractors: z.array(z.string()).default([]),
    exampleSentence: z.string().default(""),
    clozeSentence: z.string().default(""),
    applicationQuestions: z.array(applicationQuestionSchema).default([]),
    commonSpellingErrors: z.array(z.string()).default([]),
    commonMisconceptions: z.array(z.string()).default([]),
    glossaryTranslations: z.array(glossaryTranslationSchema).default([]),
    difficultyLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
    isActive: z.boolean().default(true),
  });

export const vocabularyWordSchema = vocabularyWordBaseSchema.superRefine((data, ctx) => {
    for (const question of data.applicationQuestions) {
      if (question.correctChoiceIndex >= question.choices.length) {
        ctx.addIssue({
          code: "custom",
          message: "correctChoiceIndex must be within choices array bounds.",
          path: ["applicationQuestions"],
        });
      }
    }
  });

export const vocabularyWordUpdateSchema = vocabularyWordBaseSchema.partial();

export type VocabularyWordInput = z.infer<typeof vocabularyWordSchema>;
export type VocabularyWordUpdateInput = z.infer<typeof vocabularyWordUpdateSchema>;
