"use client";

import { useState } from "react";
import { Hand } from "lucide-react";
import { GameShell } from "@/components/shared/GameShell";
import { AudioButton } from "@/components/shared/AudioButton";
import { Button } from "@/components/ui/Button";
import { FeedbackBanner } from "@/components/student/FeedbackBanner";
import { StepFooter } from "@/components/student/StepFooter";
import { SupportPanel } from "@/components/student/SupportPanel";
import { useStepAttempt } from "@/components/student/hooks/useStepAttempt";
import {
  STEP_DIRECTIONS,
  STEP_LABELS,
  supportFontClass,
  supportSpacingClass,
  supportTextSizeClass,
  type StepComponentProps,
} from "@/components/student/types";
import { cn } from "@/lib/utils";

export function Step01HearWord({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [revealed, setRevealed] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [audioReplays, setAudioReplays] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const [lastCorrect, setLastCorrect] = useState(false);
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const syllableCount = word.syllableBreakdown.length;
  const textClass = cn(
    supportTextSizeClass(supportProfile),
    supportSpacingClass(supportProfile),
    supportFontClass(supportProfile),
  );

  const submitClapCount = async (count: number) => {
    const isCorrect = count === syllableCount;
    const result = await submitAttempt({
      instructionalStep: 1,
      studentResponse: String(count),
      correctResponse: String(syllableCount),
      isCorrect,
      audioReplays,
      slowAudioUsed: supportProfile.slowPlayback,
    });
    setFeedback(result.feedback);
    setLastCorrect(result.isCorrect);
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
    if (!revealed) {
      setRevealed(true);
    }
    await submitClapCount(clapCount);
  };

  const handleSubmitIncorrect = async () => {
    if (!revealed) {
      setRevealed(true);
    }
    const wrongCount = Math.max(1, syllableCount - 1);
    setClapCount(wrongCount);
    await submitClapCount(wrongCount);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setClapCount(0);
  };

  return (
    <GameShell
      title={`Step 1: Listen — ${word.word}`}
      directions={STEP_DIRECTIONS[1]}
      currentStep={1}
      stepLabels={[...STEP_LABELS]}
      onRepeatDirections={() => setAudioReplays((n) => n + 1)}
      onHelp={() =>
        setFeedback("Listen first, then reveal the word and clap once for each syllable.")
      }
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />

        <div className="flex flex-wrap items-center gap-3">
          <AudioButton
            text={word.word}
            label="Hear word"
            speed={supportProfile.slowPlayback ? "slow" : "normal"}
          />
          <AudioButton
            text={word.word}
            label="Slow audio"
            speed="slow"
          />
        </div>

        {!revealed ? (
          <Button
            type="button"
            size="lg"
            data-testid="reveal-word-button"
            onClick={() => setRevealed(true)}
          >
            I listened — reveal the word
          </Button>
        ) : (
          <div className={cn("flex flex-col gap-4", textClass)}>
            <p className="text-3xl font-bold text-foreground">{word.word}</p>
            <div
              className="flex flex-wrap gap-2"
              aria-label="Syllable breakdown"
            >
              {word.syllableBreakdown.map((syllable, index) => (
                <span
                  key={index}
                  className={cn(
                    "rounded-lg px-3 py-1 font-semibold",
                    supportProfile.syllableHighlighting
                      ? "bg-science-accent/20 text-foreground"
                      : "bg-surface-muted text-foreground",
                  )}
                >
                  {syllable}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-base text-muted">
                Clap once for each syllable. You clapped {clapCount} of {syllableCount}.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                data-testid="clap-syllable-button"
                onClick={() => setClapCount((n) => Math.min(n + 1, syllableCount + 2))}
                aria-label="Record a syllable clap"
              >
                <Hand className="size-5" aria-hidden="true" />
                Clap syllable ({clapCount})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setClapCount(0)}
              >
                Reset claps
              </Button>
            </div>
          </div>
        )}

        {feedback && (
          <FeedbackBanner
            message={feedback}
            variant={lastCorrect ? "success" : "support"}
          />
        )}

        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check syllables"
          isSubmitting={isSubmitting}
          submitDisabled={clapCount === 0}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
