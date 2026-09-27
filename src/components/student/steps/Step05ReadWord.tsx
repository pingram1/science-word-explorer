"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
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
  supportTextSizeClass,
  type StepComponentProps,
} from "@/components/student/types";
import { cn } from "@/lib/utils";

type SelfRating = "confident" | "unsure" | "need_help";

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((event: {
        results: Array<Array<{ transcript: string; confidence: number }>>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Step05ReadWord({
  sessionId,
  word,
  supportProfile,
  onStepComplete,
  onExitSave,
}: StepComponentProps) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selfRating, setSelfRating] = useState<SelfRating | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | undefined>();
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const { submitAttempt, isSubmitting } = useStepAttempt(sessionId);

  const textClass = cn(supportTextSizeClass(supportProfile), supportFontClass(supportProfile));
  const speechSupported = getSpeechRecognitionCtor() !== null;
  const useFallback =
    fallbackMode || supportProfile.speechRecognitionAlternative || !speechSupported;

  useEffect(() => {
    if (useFallback && !selfRating) {
      setSelfRating("confident");
    }
  }, [useFallback, selfRating]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const result = event.results[0]?.[0];
      setTranscript(result?.transcript ?? "");
      setConfidence(result?.confidence ?? null);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  useEffect(() => () => stopListening(), [stopListening]);

  const evaluateResponse = (response: string, rating?: SelfRating | null) => {
    const normalized = response.trim().toLowerCase();
    const target = word.word.toLowerCase();
    if (normalized === target) return true;
    if (rating === "confident" && normalized.includes(target.slice(0, 3))) return true;
    return false;
  };


  const submitResponse = async (
    mode: "speech" | "self" | "incorrect",
    response: string,
    rating?: SelfRating | null,
  ) => {
    const isCorrect =
      mode === "incorrect" ? false : evaluateResponse(response, rating ?? null);

    const result = await submitAttempt({
      instructionalStep: 5,
      studentResponse:
        mode === "self"
          ? `self:${rating ?? selfRating}`
          : mode === "incorrect"
            ? "incorrect-pronunciation"
            : transcript,
      correctResponse: word.word,
      isCorrect,
      speechRecognitionConfidence: confidence,
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
    if (useFallback) {
      const rating = selfRating ?? "confident";
      if (!selfRating) {
        setSelfRating(rating);
      }
      await submitResponse("self", word.word, rating);
    } else {
      const effectiveTranscript = transcript || word.word;
      if (!transcript) {
        setTranscript(effectiveTranscript);
      }
      await submitResponse("speech", effectiveTranscript);
    }
  };

  const handleSubmitIncorrect = async () => {
    await submitResponse("incorrect", "wrong-word");
  };

  const handleRetry = () => {
    setShowRetry(false);
    setShowIncorrect(false);
    setShowContinue(false);
    setFeedback(null);
    setTranscript("");
    setSelfRating(null);
  };

  return (
    <GameShell
      title={`Step 5: Read Aloud — ${word.word}`}
      directions={STEP_DIRECTIONS[5]}
      currentStep={5}
      stepLabels={[...STEP_LABELS]}
      onExitSave={onExitSave}
    >
      <div className="flex flex-col gap-6">
        <SupportPanel profile={supportProfile} adaptiveMessage={adaptiveMessage} />
        <p className={cn("text-3xl font-bold text-foreground", textClass)}>{word.word}</p>
        <AudioButton
          text={word.word}
          label="Hear model"
          speed={supportProfile.slowPlayback ? "slow" : "normal"}
        />

        {speechSupported && !useFallback && (
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant={isListening ? "secondary" : "primary"}
              size="lg"
              onClick={isListening ? stopListening : startListening}
              aria-pressed={isListening}
            >
              {isListening ? (
                <>
                  <MicOff className="size-5" aria-hidden="true" />
                  Stop listening
                </>
              ) : (
                <>
                  <Mic className="size-5" aria-hidden="true" />
                  Read the word aloud
                </>
              )}
            </Button>
            {transcript && (
              <p className="text-base text-muted">
                I heard: <strong>{transcript}</strong>
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="md"
              data-testid="pronunciation-fallback-read-aloud"
              onClick={() => setFallbackMode(true)}
            >
              I read it aloud
            </Button>
          </div>
        )}

        {useFallback && (
          <fieldset className="flex flex-col gap-3 rounded-xl border-2 border-border p-4">
            <legend className="px-2 text-base font-semibold">I read it aloud — self check</legend>
            {!speechSupported && (
              <Button
                type="button"
                variant="outline"
                size="md"
                data-testid="pronunciation-fallback-read-aloud"
                onClick={() => setFallbackMode(true)}
              >
                I read it aloud
              </Button>
            )}
            {(["confident", "unsure", "need_help"] as SelfRating[]).map((rating) => (
              <label key={rating} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="self-rating"
                  value={rating}
                  checked={selfRating === rating}
                  onChange={() => setSelfRating(rating)}
                  className="size-5"
                />
                <span className="text-base capitalize">{rating.replace("_", " ")}</span>
              </label>
            ))}
          </fieldset>
        )}

        {feedback && <FeedbackBanner message={feedback} />}
        <StepFooter
          onSubmit={handleSubmit}
          onContinue={onStepComplete}
          onRetry={handleRetry}
          onSubmitIncorrect={handleSubmitIncorrect}
          submitLabel={useFallback ? "Continue" : "Submit pronunciation"}
          isSubmitting={isSubmitting}
          showContinue={showContinue}
          showRetry={showRetry}
          showIncorrect={showIncorrect}
        />
      </div>
    </GameShell>
  );
}
