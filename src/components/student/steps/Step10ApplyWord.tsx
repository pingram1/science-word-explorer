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

export function Step10ApplyWord({
  sessionId,
  word,
  supportProfile,
  supportLevel,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
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

  const question = useMemo(() => {
    const matching =
      word.applicationQuestions.find((q) => q.difficultyLevel <= supportLevel) ??
      word.applicationQuestions[0];
    return matching;
  }, [word.applicationQuestions, supportLevel]);

  const choices = useMemo(
    () => (question ? shuffleWithSeed(question.choices, `${word.id}-apply`) : []),
    [question, word.id],
  );

  const submitChoice = async (index: number, isCorrect: boolean) => {
    if (!question) return;

    const result = await submitAttempt({
      instructionalStep: 10,
      // Send the canonical choice index so server-side grading does not depend on wording.
      studentResponse: String(index),
      correctResponse: String(question.correctChoiceIndex),
      isCorrect,
    });
    setFeedback(result.feedback);
    setExplanation(question.explanation);
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
    if (!question || selectedIndex === null) return;
    const isCorrect = selectedIndex === question.correctChoiceIndex;
    await submitChoice(selectedIndex, isCorrect);
  };

  const handleSubmitIncorrect = async () => {
    if (!question) return;
    const wrongIndex = question.choices.findIndex((_, i) => i !== question.correctChoiceIndex);
    const index = wrongIndex >= 0 ? wrongIndex : 0;
    setSelectedIndex(index);
    await submitChoice(index, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setExplanation(null);
    setSelectedIndex(null);
  };

  if (!question) {
    return (
      <GameShell
        title={`Step 10: Apply — ${word.word}`}
        directions="No application question available. You completed the routine!"
        currentStep={10}
        stepLabels={[...STEP_LABELS]}
        onExitSave={onExitSave}
      >
        <StepFooter
          onSubmit={onStepComplete}
          onContinue={onStepComplete}
          submitLabel="Finish"
          continueLabel="Finish"
          showContinue
        />
      </GameShell>
    );
  }

  return (
    <GameShell
      title={`Step 10: Apply — ${word.word}`}
      directions={STEP_DIRECTIONS[10]}
      currentStep={10}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <p className={cn("text-lg font-semibold leading-relaxed text-foreground", textClass)}>
          {question.prompt}
        </p>

        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Application choices">
          {choices.map((choice) => {
            const originalIndex = question.choices.indexOf(choice);
            return (
              <label
                key={choice}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border-2 p-4",
                  selectedIndex === originalIndex
                    ? "border-science-teal bg-science-teal/5"
                    : "border-border bg-surface hover:border-science-blue",
                  textClass,
                )}
                onClick={() => setSelectedIndex(originalIndex)}
              >
                <input
                  type="radio"
                  name="application-choice"
                  value={choice}
                  checked={selectedIndex === originalIndex}
                  onChange={() => setSelectedIndex(originalIndex)}
                  aria-label={choice}
                  data-testid={`application-choice-${originalIndex}`}
                  className="mt-1 size-5"
                />
                <span>{choice}</span>
              </label>
            );
          })}
        </div>

        {feedback && <FeedbackBanner message={feedback} />}
        {explanation && (
          <FeedbackBanner
            message={explanation}
            variant="info"
            data-testid="science-explanation"
          />
        )}

        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check answer"
          isSubmitting={isSubmitting}
          submitDisabled={selectedIndex === null}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
