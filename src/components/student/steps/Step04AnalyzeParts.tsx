"use client";

import { useMemo, useState } from "react";
import { GameShell } from "@/components/shared/GameShell";
import { FeedbackBanner } from "@/components/student/FeedbackBanner";
import { StepFooter } from "@/components/student/StepFooter";
import { SupportPanel } from "@/components/student/SupportPanel";
import { useStepAttempt } from "@/components/student/hooks/useStepAttempt";
import {
  STEP_DIRECTIONS,
  STEP_LABELS,
  shuffleWithSeed,
  supportFontClass,
  supportSpacingClass,
  supportTextSizeClass,
  type StepComponentProps,
} from "@/components/student/types";
import { cn } from "@/lib/utils";

export function Step04AnalyzeParts({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const textClass = cn(
    supportTextSizeClass(supportProfile),
    supportSpacingClass(supportProfile),
    supportFontClass(supportProfile),
  );

  const meaningOptions = useMemo(() => {
    const meanings = word.morphemeMeanings.map((m) => m.meaning);
    const pool = [
      ...meanings,
      "a type of energy",
      "a solid object",
      "moving quickly",
      "without color",
    ];
    return shuffleWithSeed(pool, word.id);
  }, [word]);

  const handleSkip = async () => {
    const result = await submitAttempt({
      instructionalStep: 4,
      studentResponse: null,
      correctResponse: null,
      isCorrect: true,
      completionStatus: "skipped",
    });
    setFeedback(result.feedback);
    setShowContinue(true);
    if (result.session.status === "completed") {
      onStepComplete();
    }
  };

  const submitSelections = async (
    currentSelections: Record<string, string>,
    isCorrect: boolean,
  ) => {
    const result = await submitAttempt({
      instructionalStep: 4,
      studentResponse: JSON.stringify(currentSelections),
      correctResponse: JSON.stringify(
        Object.fromEntries(word.morphemeMeanings.map((m) => [m.part, m.meaning])),
      ),
      isCorrect,
    });
    setFeedback(result.feedback);
    if (result.adaptiveExplanations.length > 0) {
      setAdaptiveMessage(result.adaptiveExplanations.join(" "));
    }
    if (result.isCorrect) {
      setShowContinue(true);
      setShowRetry(false);
      setShowIncorrect(false);
      if (result.session.status === "completed") {
        onStepComplete();
      }
    } else {
      setShowRetry(true);
      setShowIncorrect(true);
    }
  };

  const handleSubmit = async () => {
    const pairs = word.morphemeMeanings.map((m) => `${m.part}:${selections[m.part] ?? ""}`);
    const correctPairs = word.morphemeMeanings.map((m) => `${m.part}:${m.meaning}`);
    const isCorrect = pairs.every((p, i) => p === correctPairs[i]);
    await submitSelections(selections, isCorrect);
  };

  const handleSubmitIncorrect = async () => {
    const wrongSelections = Object.fromEntries(
      word.morphemeMeanings.map((m) => [m.part, "a solid object"]),
    );
    setSelections(wrongSelections);
    await submitSelections(wrongSelections, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setSelections({});
  };

  if (!word.morphologyApplicable || word.morphemeMeanings.length === 0) {
    return (
      <GameShell
        title={`Step 4: Word Parts — ${word.word}`}
        directions="This word does not have word parts to analyze right now. You can continue."
        currentStep={4}
        stepLabels={[...STEP_LABELS]}
        onExitSave={onExitSave}
      >
        <div className="flex flex-col gap-6">
          <p className={cn("text-base text-muted", textClass)}>
            Morphology analysis is not needed for this word. Great listening so far!
          </p>
          <StepFooter
            onSubmit={handleSkip}
            onContinue={onStepComplete}
            submitLabel="Continue to next step"
            continueLabel="Continue to next step"
            isSubmitting={isSubmitting}
            showContinue={showContinue}
          />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title={`Step 4: Word Parts — ${word.word}`}
      directions={STEP_DIRECTIONS[4]}
      currentStep={4}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <ul className="flex flex-col gap-4">
          {word.morphemeMeanings.map((morpheme) => (
            <li
              key={morpheme.part}
              className={cn(
                "rounded-xl border-2 border-border bg-surface p-4",
                supportProfile.morphemeHighlighting && "border-science-accent/40",
              )}
            >
              <label
                htmlFor={`morpheme-${morpheme.part}`}
                className={cn("mb-2 block font-bold text-foreground", textClass)}
              >
                {morpheme.part}{" "}
                <span className="text-sm font-normal text-muted">({morpheme.type})</span>
              </label>
              <select
                id={`morpheme-${morpheme.part}`}
                value={selections[morpheme.part] ?? ""}
                onChange={(e) =>
                  setSelections((prev) => ({ ...prev, [morpheme.part]: e.target.value }))
                }
                className="min-h-11 w-full rounded-xl border-2 border-border bg-surface px-3 text-base"
              >
                <option value="">Choose a meaning</option>
                {meaningOptions.map((meaning) => (
                  <option key={meaning} value={meaning}>
                    {meaning}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check word parts"
          isSubmitting={isSubmitting}
          submitDisabled={word.morphemeMeanings.some((morpheme) => !selections[morpheme.part])}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
