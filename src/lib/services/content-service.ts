import { getRepository } from "@/lib/repositories";
import {
  vocabularyWordSchema,
  vocabularyWordUpdateSchema,
  type VocabularyWordInput,
  type VocabularyWordUpdateInput,
} from "@/lib/validation/vocabulary";
import type { ApplicationQuestion, VocabularyWord } from "@/lib/types";
import { generateId } from "@/lib/utils/id";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeApplicationQuestions(
  questions: VocabularyWordInput["applicationQuestions"],
  vocabularyWordId: string,
  timestamp: string,
): ApplicationQuestion[] {
  return questions.map((question) => ({
    id: question.id ?? generateId(),
    vocabularyWordId,
    prompt: question.prompt,
    choices: question.choices,
    correctChoiceIndex: question.correctChoiceIndex,
    explanation: question.explanation,
    difficultyLevel: question.difficultyLevel,
    isActive: question.isActive ?? true,
    createdAt: question.createdAt ?? timestamp,
    updatedAt: timestamp,
  }));
}

export async function listVocabulary(unitId?: string): Promise<VocabularyWord[]> {
  const repo = await getRepository();
  return repo.listVocabularyWords(unitId, false);
}

export async function getVocabularyWord(id: string): Promise<VocabularyWord | null> {
  const repo = await getRepository();
  return repo.getVocabularyWord(id);
}

export async function createVocabularyWord(input: unknown): Promise<VocabularyWord> {
  const parsed = vocabularyWordSchema.parse(input);
  const repo = await getRepository();
  const unit = await repo.getUnit(parsed.unitId);
  if (!unit) {
    throw new Error("Unit not found.");
  }

  const existing = await repo.getVocabularyWordByText(parsed.word);
  if (existing) {
    throw new Error("A vocabulary word with this text already exists.");
  }

  const timestamp = nowIso();
  const id = generateId();
  const word: VocabularyWord = {
    id,
    ...parsed,
    pronunciationAudioUrl: parsed.pronunciationAudioUrl ?? null,
    prefix: parsed.prefix ?? null,
    baseOrRoot: parsed.baseOrRoot ?? null,
    suffix: parsed.suffix ?? null,
    applicationQuestions: normalizeApplicationQuestions(parsed.applicationQuestions, id, timestamp),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return repo.createVocabularyWord(word);
}

export async function updateVocabularyWord(
  id: string,
  input: unknown,
): Promise<VocabularyWord> {
  const parsed = vocabularyWordUpdateSchema.parse(input);
  const repo = await getRepository();
  const existing = await repo.getVocabularyWord(id);
  if (!existing) {
    throw new Error("Vocabulary word not found.");
  }

  if (parsed.unitId) {
    const unit = await repo.getUnit(parsed.unitId);
    if (!unit) {
      throw new Error("Unit not found.");
    }
  }

  const timestamp = nowIso();
  const patch: Partial<VocabularyWord> = {
    updatedAt: timestamp,
  };

  const { applicationQuestions, ...rest } = parsed;
  Object.assign(patch, rest);

  if (applicationQuestions) {
    patch.applicationQuestions = normalizeApplicationQuestions(
      applicationQuestions,
      id,
      timestamp,
    );
  }

  return repo.updateVocabularyWord(id, patch);
}

export async function deleteVocabularyWord(id: string): Promise<{ deactivated: boolean; activeSessionCount: number }> {
  const repo = await getRepository();
  const existing = await repo.getVocabularyWord(id);
  if (!existing) {
    throw new Error("Vocabulary word not found.");
  }

  // Soft-delete so in-progress student sessions are not orphaned.
  // Historical attempts and sessions keep a stable word reference.
  const sessions = await repo.listLearningSessions();
  const activeSessionCount = sessions.filter(
    (session) => session.vocabularyWordId === id && session.status === "in_progress",
  ).length;

  await repo.updateVocabularyWord(id, { isActive: false });
  return { deactivated: true, activeSessionCount };
}

export { vocabularyWordSchema, vocabularyWordUpdateSchema };
export type { VocabularyWordInput, VocabularyWordUpdateInput };
