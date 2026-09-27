import type { ErrorCategory, MorphemeEntry, SpellingErrorClassification } from "@/lib/types";

interface ClassifySpellingErrorsOptions {
  expected: string;
  actual: string;
  morphemes?: Pick<MorphemeEntry, "part" | "type">[];
  /** Treat empty or whitespace-only responses as no_response. */
  allowEmpty?: boolean;
}

function normalizeSpelling(value: string): string {
  return value.trim().toLowerCase();
}

interface EditOperation {
  type: "match" | "substitute" | "insert" | "delete" | "transpose";
  expectedChar?: string;
  actualChar?: string;
  expectedIndex?: number;
  actualIndex?: number;
}

/**
 * Computes edit operations between expected and actual strings using
 * dynamic programming, then backtracks to classify error types.
 */
function computeEditOperations(expected: string, actual: string): EditOperation[] {
  const m = expected.length;
  const n = actual.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (expected[i - 1] === actual[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const operations: EditOperation[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expected[i - 1] === actual[j - 1]) {
      operations.unshift({
        type: "match",
        expectedChar: expected[i - 1],
        actualChar: actual[j - 1],
        expectedIndex: i - 1,
        actualIndex: j - 1,
      });
      i -= 1;
      j -= 1;
      continue;
    }

    if (
      i > 1 &&
      j > 1 &&
      expected[i - 1] === actual[j - 2] &&
      expected[i - 2] === actual[j - 1]
    ) {
      operations.unshift({
        type: "transpose",
        expectedChar: expected[i - 2] + expected[i - 1],
        actualChar: actual[j - 2] + actual[j - 1],
        expectedIndex: i - 2,
        actualIndex: j - 2,
      });
      i -= 2;
      j -= 2;
      continue;
    }

    const deletionCost = i > 0 ? dp[i - 1][j] : Number.POSITIVE_INFINITY;
    const insertionCost = j > 0 ? dp[i][j - 1] : Number.POSITIVE_INFINITY;
    const substitutionCost =
      i > 0 && j > 0 ? dp[i - 1][j - 1] : Number.POSITIVE_INFINITY;

    const minCost = Math.min(deletionCost, insertionCost, substitutionCost);

    if (minCost === substitutionCost && i > 0 && j > 0) {
      operations.unshift({
        type: "substitute",
        expectedChar: expected[i - 1],
        actualChar: actual[j - 1],
        expectedIndex: i - 1,
        actualIndex: j - 1,
      });
      i -= 1;
      j -= 1;
    } else if (minCost === deletionCost && i > 0) {
      operations.unshift({
        type: "delete",
        expectedChar: expected[i - 1],
        expectedIndex: i - 1,
      });
      i -= 1;
    } else if (minCost === insertionCost && j > 0) {
      operations.unshift({
        type: "insert",
        actualChar: actual[j - 1],
        actualIndex: j - 1,
      });
      j -= 1;
    } else {
      break;
    }
  }

  return operations;
}

function classifyMorphemeErrors(
  expected: string,
  actual: string,
  morphemes: Pick<MorphemeEntry, "part" | "type">[],
): ErrorCategory[] {
  const errors = new Set<ErrorCategory>();
  const normalizedExpected = normalizeSpelling(expected);
  const normalizedActual = normalizeSpelling(actual);

  for (const morpheme of morphemes) {
    const part = normalizeSpelling(morpheme.part);
    if (!part) continue;

    const expectedHas = normalizedExpected.includes(part);
    const actualHas = normalizedActual.includes(part);

    if (expectedHas && !actualHas) {
      switch (morpheme.type) {
        case "prefix":
          errors.add("prefix_error");
          break;
        case "suffix":
          errors.add("suffix_error");
          break;
        default:
          errors.add("root_or_base_error");
          break;
      }
    }
  }

  return [...errors];
}

function detectSyllableBoundaryError(
  expectedSyllables: string[] | undefined,
  actual: string,
): boolean {
  if (!expectedSyllables || expectedSyllables.length === 0) {
    return false;
  }

  const reconstructed = expectedSyllables.join("");
  if (normalizeSpelling(reconstructed) !== normalizeSpelling(actual)) {
    return false;
  }

  // If letters match but explicit syllable markers differ significantly, flag boundary issues.
  const syllablePattern = expectedSyllables.map((s) => normalizeSpelling(s)).join("-");
  return !normalizeSpelling(actual).includes(syllablePattern.replace(/-/g, ""));
}

/**
 * Classifies spelling and related orthographic errors between an expected
 * target word and the student's response.
 */
export function classifySpellingErrors(
  options: ClassifySpellingErrorsOptions & {
    expectedSyllables?: string[];
  },
): SpellingErrorClassification {
  const { expected, actual, morphemes = [], allowEmpty = true, expectedSyllables } = options;

  const errors = new Set<ErrorCategory>();
  const details: string[] = [];

  const trimmedActual = actual.trim();

  if (!trimmedActual) {
    if (allowEmpty) {
      return {
        errors: ["no_response"],
        details: ["Student did not provide a response."],
      };
    }
  }

  const normalizedExpected = normalizeSpelling(expected);
  const normalizedActual = normalizeSpelling(trimmedActual);

  if (normalizedExpected === normalizedActual) {
    return { errors: [], details: ["Exact match."] };
  }

  const operations = computeEditOperations(normalizedExpected, normalizedActual);

  for (const operation of operations) {
    switch (operation.type) {
      case "substitute":
        errors.add("substitution");
        details.push(
          `Substituted "${operation.actualChar}" for "${operation.expectedChar}" at position ${operation.expectedIndex}.`,
        );
        break;
      case "insert":
        errors.add("insertion");
        details.push(`Inserted "${operation.actualChar}" at position ${operation.actualIndex}.`);
        break;
      case "delete":
        errors.add("omission");
        details.push(`Omitted "${operation.expectedChar}" at position ${operation.expectedIndex}.`);
        break;
      case "transpose":
        errors.add("transposition");
        details.push(
          `Transposed "${operation.expectedChar}" to "${operation.actualChar}".`,
        );
        break;
      default:
        break;
    }
  }

  if (morphemes.length > 0) {
    for (const morphemeError of classifyMorphemeErrors(expected, trimmedActual, morphemes)) {
      errors.add(morphemeError);
      details.push(`Detected ${morphemeError.replace(/_/g, " ")}.`);
    }
  }

  if (detectSyllableBoundaryError(expectedSyllables, trimmedActual)) {
    errors.add("incorrect_syllable_boundary");
    details.push("Syllable boundary may be incorrect.");
  }

  return {
    errors: [...errors],
    details,
  };
}

/**
 * Classifies phoneme-order errors for sound-matching steps.
 */
export function classifyPhonemeOrderErrors(
  expectedSequence: string[],
  actualSequence: string[],
): SpellingErrorClassification {
  if (actualSequence.length === 0) {
    return {
      errors: ["no_response"],
      details: ["No sounds were selected."],
    };
  }

  if (expectedSequence.join("|") === actualSequence.join("|")) {
    return { errors: [], details: ["Sound sequence matches."] };
  }

  const classification = classifySpellingErrors({
    expected: expectedSequence.join(""),
    actual: actualSequence.join(""),
    allowEmpty: false,
  });

  const errors = new Set<ErrorCategory>(classification.errors);
  errors.add("incorrect_sound_order");

  return {
    errors: [...errors],
    details: [...classification.details, "Sound order does not match the target sequence."],
  };
}
