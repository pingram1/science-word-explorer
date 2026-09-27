import type {
  AdaptiveRuleContext,
  AdaptiveRuleResult,
  LearningAttempt,
  SkillCategory,
  StudentSupportProfile,
  SupportLevel,
  SupportRecommendation,
} from "@/lib/types";

const HIGH_HINT_THRESHOLD = 1;

function getRecentAttemptsForSkill(
  attempts: LearningAttempt[],
  skillCategory: SkillCategory,
  limit = 5,
): LearningAttempt[] {
  return attempts
    .filter((attempt) => attempt.skillCategory === skillCategory)
    .slice(-limit);
}

function countConsecutiveCorrect(attempts: LearningAttempt[]): number {
  let count = 0;
  for (let i = attempts.length - 1; i >= 0; i -= 1) {
    if (attempts[i].isCorrect && attempts[i].hintsUsed === 0) {
      count += 1;
    } else {
      break;
    }
  }
  return count;
}

function countRecentIncorrect(attempts: LearningAttempt[], count = 2): boolean {
  const recent = attempts.slice(-count);
  return recent.length >= count && recent.every((attempt) => !attempt.isCorrect);
}

function averageSkillScore(attempts: LearningAttempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  return (correct / attempts.length) * 100;
}

function escalateSupportLevel(current: SupportLevel): SupportLevel {
  return (Math.max(1, current - 1) as SupportLevel);
}

function reduceSupportLevel(current: SupportLevel): SupportLevel {
  return (Math.min(4, current + 1) as SupportLevel);
}

/**
 * Applies transparent, rule-based adaptive adjustments to a student's support profile.
 * Returns partial profile updates, optional support level change, and human-readable explanations.
 */
export function applyAdaptiveRules(context: AdaptiveRuleContext): AdaptiveRuleResult {
  const { skillCategory, recentAttempts, currentSupportProfile, supportLevel } = context;

  const skillAttempts = getRecentAttemptsForSkill(recentAttempts, skillCategory);
  const explanations: string[] = [];
  const updatedSupportProfile: Partial<StudentSupportProfile> = {};
  let updatedSupportLevel: SupportLevel | null = null;
  let reviewFocus: SkillCategory | null = null;
  let flagOralLanguageSupport = false;

  if (countRecentIncorrect(skillAttempts, 2)) {
    if (!currentSupportProfile.slowPlayback) {
      updatedSupportProfile.slowPlayback = true;
      explanations.push(
        "Enabled slow audio because the student missed two recent attempts on this skill.",
      );
    } else if (!currentSupportProfile.syllableHighlighting) {
      updatedSupportProfile.syllableHighlighting = true;
      explanations.push(
        "Enabled syllable highlighting after repeated incorrect attempts on this skill.",
      );
    } else if (currentSupportProfile.numberOfDistractors > 2) {
      updatedSupportProfile.numberOfDistractors = 2;
      explanations.push(
        "Reduced the number of answer choices to lower task load after repeated errors.",
      );
    } else if (!currentSupportProfile.wordBank) {
      updatedSupportProfile.wordBank = true;
      explanations.push(
        "Enabled the word bank after repeated incorrect attempts on this skill.",
      );
    } else if (supportLevel > 1) {
      updatedSupportLevel = escalateSupportLevel(supportLevel);
      explanations.push(
        `Increased support from level ${supportLevel} to ${updatedSupportLevel} after two incorrect responses.`,
      );
    } else {
      explanations.push(
        "Added extra step guidance after two incorrect attempts on this skill. Current supports remain available.",
      );
    }
  }

  const consecutiveCorrect = countConsecutiveCorrect(skillAttempts);
  if (consecutiveCorrect >= 3) {
    if (currentSupportProfile.wordBank) {
      updatedSupportProfile.wordBank = false;
      explanations.push(
        "Removed the word bank after three consecutive correct responses without hints.",
      );
    } else if (currentSupportProfile.syllableHighlighting) {
      updatedSupportProfile.syllableHighlighting = false;
      explanations.push(
        "Reduced syllable highlighting after sustained independent success.",
      );
    } else if (supportLevel < 4) {
      updatedSupportLevel = reduceSupportLevel(supportLevel);
      explanations.push(
        `Reduced support from level ${supportLevel} to ${updatedSupportLevel} after three consecutive correct responses without hints.`,
      );
    }
  }

  const definitionAttempts = getRecentAttemptsForSkill(recentAttempts, "definition_knowledge");
  const spellingAttempts = [
    ...getRecentAttemptsForSkill(recentAttempts, "spelling"),
    ...getRecentAttemptsForSkill(recentAttempts, "written_production"),
    ...getRecentAttemptsForSkill(recentAttempts, "grapheme_mapping"),
  ];

  if (
    definitionAttempts.length >= 2 &&
    spellingAttempts.length >= 2 &&
    averageSkillScore(definitionAttempts) >= 80 &&
    averageSkillScore(spellingAttempts) < 60
  ) {
    reviewFocus = "spelling";
    explanations.push(
      "Scheduled spelling-focused review because definition knowledge is strong but spelling attempts are inconsistent.",
    );
  }

  const applicationAttempts = getRecentAttemptsForSkill(recentAttempts, "concept_application");
  if (
    spellingAttempts.length >= 2 &&
    applicationAttempts.length >= 2 &&
    averageSkillScore(spellingAttempts) >= 80 &&
    averageSkillScore(applicationAttempts) < 60
  ) {
    reviewFocus = "concept_application";
    explanations.push(
      "Scheduled concept-focused review because the student can spell the word but application responses are inconsistent.",
    );
  }

  const pronunciationAttempts = getRecentAttemptsForSkill(recentAttempts, "pronunciation");
  const listeningAttempts = getRecentAttemptsForSkill(recentAttempts, "listening");
  const replayHeavy = [...pronunciationAttempts, ...listeningAttempts].some(
    (attempt) => attempt.audioReplays >= 3 || attempt.slowAudioUsed,
  );

  if (replayHeavy) {
    flagOralLanguageSupport = true;
    if (!currentSupportProfile.slowPlayback) {
      updatedSupportProfile.slowPlayback = true;
    }
    explanations.push(
      "Flagged for additional oral-language support because the student frequently replays pronunciation audio.",
    );
  }

  return {
    updatedSupportProfile,
    updatedSupportLevel,
    reviewFocus,
    flagOralLanguageSupport,
    explanations,
  };
}

/**
 * Returns teacher-visible support recommendations with transparent rule explanations.
 */
export function getSupportRecommendations(
  context: AdaptiveRuleContext,
): SupportRecommendation[] {
  const result = applyAdaptiveRules(context);
  const recommendations: SupportRecommendation[] = [];

  for (const [key, value] of Object.entries(result.updatedSupportProfile)) {
    if (value === undefined) continue;

    const matchingExplanation =
      result.explanations.find((explanation) =>
        explanation.toLowerCase().includes(key.replace(/([A-Z])/g, " $1").toLowerCase()),
      ) ?? result.explanations[0] ?? "Adaptive rule triggered a support change.";

    recommendations.push({
      supportKey: key as keyof StudentSupportProfile,
      suggestedValue: value as boolean | number,
      reason: matchingExplanation,
      triggeredByRule: "adaptive_support_escalation_or_reduction",
    });
  }

  if (result.updatedSupportLevel !== null) {
    recommendations.push({
      supportKey: "support_level",
      suggestedValue: result.updatedSupportLevel,
      reason:
        result.explanations.find((e) => e.includes("support from level")) ??
        "Support level adjusted based on recent performance.",
      triggeredByRule: "support_level_adjustment",
    });
  }

  if (result.reviewFocus) {
    recommendations.push({
      supportKey: "wordBank",
      suggestedValue: result.reviewFocus === "spelling",
      reason:
        result.explanations.find((e) => e.includes("review")) ??
        `Recommend focused review on ${result.reviewFocus}.`,
      triggeredByRule: "skill_gap_review_focus",
    });
  }

  if (result.flagOralLanguageSupport) {
    recommendations.push({
      supportKey: "slowPlayback",
      suggestedValue: true,
      reason:
        result.explanations.find((e) => e.includes("oral-language")) ??
        "Recommend oral-language support based on audio replay patterns.",
      triggeredByRule: "oral_language_replay_pattern",
    });
  }

  return recommendations;
}

/** Returns true when a response relied heavily on supports rather than independent recall. */
export function isSupportDependentCorrect(attempt: LearningAttempt): boolean {
  return (
    attempt.isCorrect &&
    (attempt.hintsUsed >= HIGH_HINT_THRESHOLD ||
      attempt.wordBankUsed ||
      attempt.pictureSupportUsed ||
      attempt.supportDependentCorrect)
  );
}
