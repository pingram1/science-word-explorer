"use client";

import { useMemo, useState } from "react";
import { GameShell } from "@/components/shared/GameShell";
import { AudioButton } from "@/components/shared/AudioButton";
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

export function Step07MatchDefinition({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [selected, setSelected] = useState<string | null>(null);
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

  const choices = useMemo(() => {
    const pool = [
      word.studentFriendlyDefinition,
      ...word.definitionDistractors.slice(0, supportProfile.numberOfDistractors),
    ];
    return shuffleWithSeed(pool, `${word.id}-defs`);
  }, [word, supportProfile.numberOfDistractors]);

  const submitDefinition = async (definition: string, isCorrect: boolean) => {
    const result = await submitAttempt({
      instructionalStep: 7,
      studentResponse: definition,
      correctResponse: word.studentFriendlyDefinition,
      isCorrect,
      textToSpeechUsed: supportProfile.textToSpeech,
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
    if (!selected) return;
    await submitDefinition(selected, selected === word.studentFriendlyDefinition);
  };

  const handleSubmitIncorrect = async () => {
    const wrong =
      choices.find((choice) => choice !== word.studentFriendlyDefinition) ??
      "wrong definition";
    setSelected(wrong);
    await submitDefinition(wrong, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setSelected(null);
  };

  return (
    <GameShell
      title={`Step 7: Match Definition — ${word.word}`}
      directions={STEP_DIRECTIONS[7]}
      currentStep={7}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <div className="flex flex-wrap items-center gap-3">
          <p className={cn("text-2xl font-bold text-foreground", textClass)}>{word.word}</p>
          {supportProfile.textToSpeech && (
            <AudioButton text={word.studentFriendlyDefinition} label="Hear definitions" />
          )}
        </div>

        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Definition choices">
          {choices.map((definition) => (
            <label
              key={definition}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border-2 p-4",
                selected === definition
                  ? "border-science-teal bg-science-teal/5"
                  : "border-border bg-surface hover:border-science-blue",
                textClass,
              )}
            >
              <input
                type="radio"
                name="definition-choice"
                value={definition}
                checked={selected === definition}
                onChange={() => setSelected(definition)}
                className="mt-1 size-5"
              />
              <span>{definition}</span>
            </label>
          ))}
        </div>

        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check definition"
          isSubmitting={isSubmitting}
          submitDisabled={!selected}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
