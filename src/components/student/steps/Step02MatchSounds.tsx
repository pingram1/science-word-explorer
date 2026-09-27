"use client";

import { useMemo, useState } from "react";
import { GameShell } from "@/components/shared/GameShell";
import { AudioButton } from "@/components/shared/AudioButton";
import { FeedbackBanner } from "@/components/student/FeedbackBanner";
import { PhonemeTiles } from "@/components/student/PhonemeTiles";
import { StepFooter } from "@/components/student/StepFooter";
import { SupportPanel } from "@/components/student/SupportPanel";
import { useStepAttempt } from "@/components/student/hooks/useStepAttempt";
import { STEP_DIRECTIONS, STEP_LABELS, type StepComponentProps } from "@/components/student/types";

export function Step02MatchSounds({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const pool = useMemo(() => {
    const extras = ["/t/", "/s/", "/m/", "/d/", "/k/"].filter(
      (phoneme) => !word.phonemeSequence.includes(phoneme),
    );
    return [...word.phonemeSequence, ...extras.slice(0, 2)];
  }, [word.phonemeSequence]);

  const submitSequence = async (sequence: string[], isCorrect: boolean) => {
    const result = await submitAttempt({
      instructionalStep: 2,
      studentResponse: JSON.stringify(sequence),
      correctResponse: JSON.stringify(word.phonemeSequence),
      isCorrect,
      slowAudioUsed: supportProfile.slowPlayback,
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
    const isCorrect = JSON.stringify(selected) === JSON.stringify(word.phonemeSequence);
    await submitSequence(selected, isCorrect);
  };

  const handleSubmitIncorrect = async () => {
    const wrong = [...word.phonemeSequence].reverse();
    setSelected(wrong);
    await submitSequence(wrong, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setSelected([]);
  };

  return (
    <GameShell
      title={`Step 2: Match Sounds — ${word.word}`}
      directions={STEP_DIRECTIONS[2]}
      currentStep={2}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <AudioButton
          text={word.word}
          label="Hear word"
          speed={supportProfile.slowPlayback ? "slow" : "normal"}
        />
        <PhonemeTiles
          available={pool}
          selected={selected}
          onChange={setSelected}
          disabled={isSubmitting}
        />
        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check sounds"
          isSubmitting={isSubmitting}
          submitDisabled={selected.length === 0}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
