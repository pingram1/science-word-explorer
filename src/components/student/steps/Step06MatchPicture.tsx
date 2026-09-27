"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GameShell } from "@/components/shared/GameShell";
import { FeedbackBanner } from "@/components/student/FeedbackBanner";
import { StepFooter } from "@/components/student/StepFooter";
import { SupportPanel } from "@/components/student/SupportPanel";
import { useStepAttempt } from "@/components/student/hooks/useStepAttempt";
import { STEP_DIRECTIONS, STEP_LABELS, shuffleWithSeed, type StepComponentProps } from "@/components/student/types";

export function Step06MatchPicture({
  sessionId,
  word,
  supportProfile,
  imageChoices = [],
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const choices = useMemo(
    () => shuffleWithSeed(imageChoices, `${word.id}-images`),
    [imageChoices, word.id],
  );

  const correctImage = word.images[0];
  const correctId = correctImage?.id ?? "";

  const submitChoice = async (choiceId: string, isCorrect: boolean) => {
    const result = await submitAttempt({
      instructionalStep: 6,
      studentResponse: choiceId,
      correctResponse: correctId,
      isCorrect,
      pictureSupportUsed: supportProfile.pictureSupport,
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
    if (!selectedId) return;
    await submitChoice(selectedId, selectedId === correctId);
  };

  const handleSubmitIncorrect = async () => {
    const wrongId = choices.find((image) => image.id !== correctId)?.id ?? "wrong";
    setSelectedId(wrongId);
    await submitChoice(wrongId, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setSelectedId(null);
  };

  return (
    <GameShell
      title={`Step 6: Match Picture — ${word.word}`}
      directions={STEP_DIRECTIONS[6]}
      currentStep={6}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <p className="text-xl font-bold text-foreground">{word.word}</p>

        <div
          className="grid gap-4 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Picture choices"
        >
          {choices.map((image) => (
            <button
              key={image.id}
              type="button"
              role="radio"
              aria-checked={selectedId === image.id}
              onClick={() => setSelectedId(image.id)}
              className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${
                selectedId === image.id
                  ? "border-science-teal ring-2 ring-science-teal/30"
                  : "border-border hover:border-science-blue"
              }`}
            >
              <div className="relative aspect-video w-full bg-surface-muted">
                <Image
                  src={image.url}
                  alt={image.altText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <p className="p-3 text-sm text-muted">{image.altText}</p>
            </button>
          ))}
        </div>

        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check picture"
          isSubmitting={isSubmitting}
          submitDisabled={!selectedId}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
