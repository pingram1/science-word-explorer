"use client";

import { useState } from "react";
import { GameShell } from "@/components/shared/GameShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FeedbackBanner } from "@/components/student/FeedbackBanner";
import { HandwritingCanvas, type Stroke } from "@/components/student/HandwritingCanvas";
import { StepFooter } from "@/components/student/StepFooter";
import { SupportPanel } from "@/components/student/SupportPanel";
import { useStepAttempt } from "@/components/student/hooks/useStepAttempt";
import {
  STEP_DIRECTIONS,
  STEP_LABELS,
  supportFontClass,
  supportTextSizeClass,
  type StepComponentProps,
} from "@/components/student/types";
import { cn } from "@/lib/utils";

export function Step09WriteWord({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [typed, setTyped] = useState("");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [mode, setMode] = useState<"typing" | "handwriting">(
    supportProfile.inputPreference === "handwriting" ? "handwriting" : "typing",
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const textClass = cn(supportTextSizeClass(supportProfile), supportFontClass(supportProfile));
  const showBoth = supportProfile.inputPreference === "both";

  const submitSpelling = async (response: string, isCorrect: boolean) => {
    const result = await submitAttempt({
      instructionalStep: 9,
      studentResponse: response,
      correctResponse: word.word,
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
    const response = typed.trim();
    if (!response) return;
    const isCorrect = response.toLowerCase() === word.word.toLowerCase();
    await submitSpelling(response, isCorrect);
  };

  const handleSubmitIncorrect = async () => {
    const wrong = "wrong";
    setTyped(wrong);
    await submitSpelling(wrong, false);
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setTyped("");
    setStrokes([]);
  };

  return (
    <GameShell
      title={`Step 9: Write Word — ${word.word}`}
      directions={STEP_DIRECTIONS[9]}
      currentStep={9}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />

        {showBoth && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "typing" ? "primary" : "outline"}
              onClick={() => setMode("typing")}
            >
              Type
            </Button>
            <Button
              type="button"
              variant={mode === "handwriting" ? "primary" : "outline"}
              onClick={() => setMode("handwriting")}
            >
              Handwrite
            </Button>
          </div>
        )}

        {(mode === "typing" || supportProfile.inputPreference === "typing") && (
          <div className={textClass}>
            <label htmlFor="write-word" className="mb-2 block font-semibold">
              Type the word
            </label>
            <Input
              id="write-word"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="text-xl"
            />
          </div>
        )}

        {(mode === "handwriting" ||
          supportProfile.inputPreference === "handwriting") && (
          <div>
            <p className="mb-2 font-semibold text-foreground">Handwriting practice</p>
            <HandwritingCanvas onChange={setStrokes} disabled={isSubmitting} />
            <label htmlFor="handwrite-check" className="mt-3 mb-2 block text-sm text-muted">
              Type what you wrote to check spelling
            </label>
            <Input
              id="handwrite-check"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        )}

        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel="Check spelling"
          isSubmitting={isSubmitting}
          submitDisabled={!typed.trim()}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
