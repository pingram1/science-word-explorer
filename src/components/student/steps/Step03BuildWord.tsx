"use client";

import { useMemo, useState } from "react";
import { GameShell } from "@/components/shared/GameShell";
import { FeedbackBanner } from "@/components/student/FeedbackBanner";
import { GraphemeTiles } from "@/components/student/GraphemeTiles";
import { StepFooter } from "@/components/student/StepFooter";
import { SupportPanel } from "@/components/student/SupportPanel";
import { useStepAttempt } from "@/components/student/hooks/useStepAttempt";
import { STEP_DIRECTIONS, STEP_LABELS, type StepComponentProps } from "@/components/student/types";

export function Step03BuildWord({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [built, setBuilt] = useState<string[]>([]);
  const [lockedIndices, setLockedIndices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const target = word.graphemeSequence;
  const distractorCount = Math.max(0, supportProfile.numberOfDistractors - 1);
  const distractors = useMemo(() => {
    const alphabet = "aeioubcdfghjklmnpqrstvwxyz".split("");
    const extras: string[] = [];
    for (const letter of alphabet) {
      if (!target.includes(letter) && extras.length < distractorCount) {
        extras.push(letter);
      }
    }
    return extras;
  }, [target, distractorCount]);

  const applyResult = async (sequence: string[], isCorrect: boolean) => {
    const result = await submitAttempt({
      instructionalStep: 3,
      studentResponse: sequence.join(""),
      correctResponse: target.join(""),
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
      const newLocked: number[] = [];
      sequence.forEach((g, i) => {
        if (g === target[i]) newLocked.push(i);
      });
      setLockedIndices(newLocked);
    }
  };

  const handleSelect = (grapheme: string) => {
    const nextIndex = built.length;
    const expected = target[nextIndex];
    const nextBuilt = [...built, grapheme];
    setBuilt(nextBuilt);

    if (grapheme === expected) {
      setLockedIndices((prev) => [...prev, nextIndex]);
    }
  };

  const handleSubmit = async () => {
    const isCorrect = built.join("") === target.join("");
    await applyResult(built, isCorrect);
  };

  const handleSubmitIncorrect = async () => {
    const wrong = target.length > 1 ? [...target.slice(1), target[0]!] : ["x"];
    setBuilt(wrong);
    setLockedIndices([]);
    await applyResult(wrong, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setBuilt([]);
    setLockedIndices([]);
  };

  return (
    <GameShell
      title={`Step 3: Build Word — ${word.word}`}
      directions={STEP_DIRECTIONS[3]}
      currentStep={3}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <GraphemeTiles
          target={target}
          distractors={distractors}
          built={built}
          lockedIndices={lockedIndices}
          onSelect={handleSelect}
          disabled={isSubmitting}
          seed={word.id}
        />
        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check spelling"
          isSubmitting={isSubmitting}
          submitDisabled={built.length === 0}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
