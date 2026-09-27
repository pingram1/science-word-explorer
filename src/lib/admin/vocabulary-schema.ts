import { z } from "zod";

export const vocabularyFormSchema = z.object({
  unitId: z.string().min(1, "Unit is required"),
  word: z.string().min(1, "Word is required"),
  gradeLevel: z.coerce.number().min(1).max(12),
  standardsTags: z.string(),
  studentFriendlyDefinition: z.string().min(1, "Student-friendly definition is required"),
  formalDefinition: z.string().min(1, "Formal definition is required"),
  pronunciationAudioUrl: z.string().optional(),
  syllableBreakdown: z.string(),
  phonemeSequence: z.string(),
  graphemeSequence: z.string(),
  prefix: z.string().optional(),
  baseOrRoot: z.string().optional(),
  suffix: z.string().optional(),
  morphologyApplicable: z.boolean(),
  requiresTeacherReview: z.boolean(),
  exampleSentence: z.string().min(1, "Example sentence is required"),
  clozeSentence: z.string().min(1, "Cloze sentence is required"),
  definitionDistractors: z.string(),
  commonSpellingErrors: z.string(),
  commonMisconceptions: z.string(),
  difficultyLevel: z.number().min(1).max(4),
  isActive: z.boolean(),
  imageUrl: z.string().optional(),
  imageAltText: z.string().optional(),
});

export type VocabularyFormValues = z.infer<typeof vocabularyFormSchema>;

export function splitCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinCommaList(values: string[]): string {
  return values.join(", ");
}
