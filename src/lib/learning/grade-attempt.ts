import type {
  CompletionStatus,
  ErrorCategory,
  InstructionalStep,
  LearningAttempt,
  LearningSession,
  VocabularyWord,
} from "@/lib/types";
import {
  classifyPhonemeOrderErrors,
  classifySpellingErrors,
} from "@/lib/learning/spelling-errors";

export interface GradeAttemptInput {
  instructionalStep: InstructionalStep;
  word: VocabularyWord;
  studentResponse?: string | null;
  completionStatus?: CompletionStatus;
  speechRecognitionConfidence?: number | null;
}

export interface GradeAttemptResult {
  isCorrect: boolean;
  errorCategories: ErrorCategory[];
  correctResponse: string;
  /** True when the pass used a self-check or skip rather than an independent response. */
  supportDependentCorrect: boolean;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function parseJson<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function noResponse(correctResponse: string): GradeAttemptResult {
  return {
    isCorrect: false,
    errorCategories: ["no_response"],
    correctResponse,
    supportDependentCorrect: false,
  };
}

function primaryImageId(word: VocabularyWord): string {
  return word.images.find((image) => image.isPrimary)?.id ?? word.images[0]?.id ?? "";
}

function expectedMorphemeMap(word: VocabularyWord): Record<string, string> {
  return Object.fromEntries(word.morphemeMeanings.map((entry) => [entry.part, entry.meaning]));
}

/**
 * Grades a student response against canonical word data.
 * Client-supplied isCorrect / errorCategories / correctResponse are ignored.
 */
export function gradeInstructionalStep(input: GradeAttemptInput): GradeAttemptResult {
  const { instructionalStep: step, word, studentResponse, completionStatus } = input;
  const response = studentResponse?.trim() ?? "";

  if (step === 1) {
    const expected = String(word.syllableBreakdown.length);
    if (!response) return noResponse(expected);
    const actual = Number(response);
    return {
      isCorrect: actual === word.syllableBreakdown.length,
      errorCategories: actual === word.syllableBreakdown.length ? [] : ["incorrect_syllable_boundary"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 2) {
    const expected = JSON.stringify(word.phonemeSequence);
    const actual = parseJson<string[]>(response);
    if (!actual) return noResponse(expected);
    const classification = classifyPhonemeOrderErrors(word.phonemeSequence, actual);
    return {
      isCorrect: classification.errors.length === 0,
      errorCategories: classification.errors,
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 3) {
    const expected = word.graphemeSequence.join("");
    if (!response) return noResponse(expected);
    const actualJoined = (() => {
      const asArray = parseJson<string[]>(response);
      return asArray ? asArray.join("") : normalize(response);
    })();
    const isCorrect = actualJoined === expected.toLowerCase();
    return {
      isCorrect,
      errorCategories: isCorrect ? [] : ["substitution"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 4) {
    const expected = JSON.stringify(expectedMorphemeMap(word));
    const morphologyUnavailable =
      !word.morphologyApplicable || word.morphemeMeanings.length === 0;
    if (completionStatus === "skipped" && morphologyUnavailable) {
      return {
        isCorrect: true,
        errorCategories: [],
        correctResponse: expected,
        supportDependentCorrect: true,
      };
    }
    if (morphologyUnavailable) {
      return {
        isCorrect: true,
        errorCategories: [],
        correctResponse: expected,
        supportDependentCorrect: true,
      };
    }
    const actual = parseJson<Record<string, string>>(response);
    if (!actual || Object.keys(actual).length === 0) return noResponse(expected);
    const expectedMap = expectedMorphemeMap(word);
    const isCorrect = Object.entries(expectedMap).every(
      ([part, meaning]) => normalize(actual[part] ?? "") === normalize(meaning),
    );
    return {
      isCorrect,
      errorCategories: isCorrect ? [] : ["root_or_base_error"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 5) {
    const expected = word.word;
    if (!response) return noResponse(expected);
    if (response.startsWith("self:")) {
      const rating = response.slice("self:".length);
      const accepted = rating === "confident" || rating === "unsure";
      return {
        isCorrect: accepted,
        errorCategories: accepted ? [] : ["no_response"],
        correctResponse: expected,
        // Self-ratings cannot count as unassisted mastery.
        supportDependentCorrect: accepted,
      };
    }
    const spoken = normalize(response);
    const target = normalize(word.word);
    const transcriptMatches = spoken === target || spoken.includes(target);
    const confidence = input.speechRecognitionConfidence;
    const isCorrect = transcriptMatches && (confidence === null || confidence === undefined || confidence >= 0.4);
    return {
      isCorrect,
      errorCategories: isCorrect ? [] : ["substitution"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 6) {
    const expected = primaryImageId(word);
    if (!response) return noResponse(expected);
    const isCorrect = response === expected;
    return {
      isCorrect,
      errorCategories: isCorrect ? [] : ["picture_misconception"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 7) {
    const expected = word.studentFriendlyDefinition;
    if (!response) return noResponse(expected);
    const isCorrect = normalize(response) === normalize(expected);
    return {
      isCorrect,
      errorCategories: isCorrect ? [] : ["definition_misconception"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 8) {
    const expected = word.word;
    if (!response) return noResponse(expected);
    const isCorrect = normalize(response) === normalize(expected);
    return {
      isCorrect,
      errorCategories: isCorrect ? [] : ["context_misconception"],
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  if (step === 9) {
    const expected = word.word;
    if (!response) return noResponse(expected);
    const classification = classifySpellingErrors({
      expected,
      actual: response,
      morphemes: word.morphemeMeanings,
      expectedSyllables: word.syllableBreakdown,
    });
    return {
      isCorrect: classification.errors.length === 0,
      errorCategories: classification.errors,
      correctResponse: expected,
      supportDependentCorrect: false,
    };
  }

  const question = word.applicationQuestions.find((item) => item.isActive) ?? word.applicationQuestions[0];
  const expectedIndex = question?.correctChoiceIndex ?? 0;
  const expected = question?.choices[expectedIndex] ?? word.word;
  if (!response) return noResponse(String(expectedIndex));
  const asIndex = Number(response);
  const isCorrect =
    (!Number.isNaN(asIndex) && asIndex === expectedIndex) ||
    normalize(response) === normalize(expected);
  return {
    isCorrect,
    errorCategories: isCorrect ? [] : ["science_concept_misconception"],
    correctResponse: String(expectedIndex),
    supportDependentCorrect: false,
  };
}

export function hasPassedStep(
  step: InstructionalStep,
  attempts: Pick<LearningAttempt, "instructionalStep" | "isCorrect">[],
): boolean {
  return attempts.some((attempt) => attempt.instructionalStep === step && attempt.isCorrect);
}

export function assertSessionAcceptsAttempts(
  session: Pick<LearningSession, "status" | "currentStep">,
  instructionalStep: InstructionalStep,
): void {
  if (session.status !== "in_progress") {
    throw new StepProgressError("This session is no longer accepting answers.");
  }
  if (instructionalStep !== session.currentStep) {
    throw new StepProgressError("Answers must match the current instructional step.");
  }
}

export class StepProgressError extends Error {
  readonly status = 409;
  constructor(message: string) {
    super(message);
    this.name = "StepProgressError";
  }
}
