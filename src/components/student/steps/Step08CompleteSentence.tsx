"use client";

import { useMemo, useState } from "react";
import { GameShell } from "@/components/shared/GameShell";
import { Button } from "@/components/ui/Button";
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

export function Step08CompleteSentence({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [answer, setAnswer] = useState("");
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

  const wordBank = useMemo(() => {
    if (!supportProfile.wordBank) return [];
    const distractors = word.definitionDistractors
      .map((d) => d.split(" ")[0])
      .filter((w) => w.length > 2)
      .slice(0, 2);
    return shuffleWithSeed([word.word, ...distractors], `${word.id}-bank`);
  }, [supportProfile.wordBank, word]);

  const parts = word.clozeSentence.split("__________");

  const submitAnswer = async (response: string, isCorrect: boolean) => {
    const result = await submitAttempt({
      instructionalStep: 8,
      studentResponse: response,
      correctResponse: word.word,
      isCorrect,
      wordBankUsed: supportProfile.wordBank && wordBank.includes(response),
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
    const response = answer.trim();
    if (!response) return;
    const isCorrect = response.toLowerCase() === word.word.toLowerCase();
    await submitAnswer(response, isCorrect);
  };

  const handleSubmitIncorrect = async () => {
    const wrong = "wrong";
    setAnswer(wrong);
    await submitAnswer(wrong, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setAnswer("");
  };

  return (
    <GameShell
      title={`Step 8: Complete Sentence — ${word.word}`}
      directions={STEP_DIRECTIONS[8]}
      currentStep={8}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <p className={cn("text-lg leading-relaxed text-foreground", textClass)}>
          {parts[0]}
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            aria-label="Word to complete the sentence"
            className="mx-2 inline-block min-w-32 rounded-lg border-2 border-science-blue bg-surface px-3 py-1 text-lg font-semibold"
          />
          {parts[1] ?? ""}
        </p>

        {supportProfile.wordBank && wordBank.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Word bank">
            {wordBank.map((bankWord) => (
              <Button
                key={bankWord}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAnswer(bankWord)}
              >
                {bankWord}
              </Button>
            ))}
          </div>
        )}

        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check sentence"
          isSubmitting={isSubmitting}
          submitDisabled={!answer.trim()}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
