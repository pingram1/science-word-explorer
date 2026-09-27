"use client";

import { useCallback, useRef, useState } from "react";
import { getSupportiveFeedback } from "@/lib/constants/feedback";
import { fetchApi } from "@/components/student/api";
import type { AttemptResponse, AttemptSubmitPayload } from "@/components/student/types";
import type { InstructionalStep, LearningSession } from "@/lib/types";

export function useStepAttempt(sessionId: string) {
  const startTimeRef = useRef(Date.now());
  const attemptNumberRef = useRef(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<AttemptResponse | null>(null);

  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const submitAttempt = useCallback(
    async (payload: AttemptSubmitPayload): Promise<AttemptResponse> => {
      setIsSubmitting(true);
      const responseTimeMs = Date.now() - startTimeRef.current;

      try {
        const attemptResult = await fetchApi<{
          attempt: { isCorrect: boolean };
          adaptiveExplanations?: string[];
        }>(
          `/api/sessions/${sessionId}/attempts`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instructionalStep: payload.instructionalStep,
              studentResponse: payload.studentResponse,
              correctResponse: payload.correctResponse,
              responseTimeMs,
              attemptNumber: attemptNumberRef.current,
              hintsUsed: payload.hintsUsed ?? 0,
              audioReplays: payload.audioReplays ?? 0,
              slowAudioUsed: payload.slowAudioUsed ?? false,
              textToSpeechUsed: payload.textToSpeechUsed ?? false,
              wordBankUsed: payload.wordBankUsed ?? false,
              pictureSupportUsed: payload.pictureSupportUsed ?? false,
              speechRecognitionConfidence: payload.speechRecognitionConfidence ?? null,
              completionStatus: payload.completionStatus ?? "completed",
            }),
          },
        );

        // Use the server grade, not the client-claimed result.
        const isCorrect = attemptResult.attempt.isCorrect;

        let session: LearningSession | null = null;
        if (isCorrect) {
          const stepResult = await fetchApi<{ session: LearningSession }>(
            `/api/sessions/${sessionId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "completeStep",
                step: payload.instructionalStep,
              }),
            },
          );
          session = stepResult.session;
        }

        const feedback = getSupportiveFeedback({
          step: payload.instructionalStep,
          isCorrect,
          attemptNumber: attemptNumberRef.current,
        });

        const result: AttemptResponse = {
          feedback,
          isCorrect,
          nextStep: session
            ? session.status === "completed"
              ? null
              : session.currentStep
            : null,
          session: {
            status: session?.status ?? "in_progress",
            currentStep: (session?.currentStep ?? payload.instructionalStep) as InstructionalStep,
          },
          adaptiveExplanations: attemptResult.adaptiveExplanations ?? [],
        };

        setLastResult(result);

        if (!isCorrect) {
          attemptNumberRef.current += 1;
        } else {
          attemptNumberRef.current = 1;
        }

        resetTimer();
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong saving your answer.";
        const fallback: AttemptResponse = {
          feedback: message,
          isCorrect: false,
          nextStep: null,
          session: {
            status: "in_progress",
            currentStep: payload.instructionalStep,
          },
          adaptiveExplanations: [],
        };
        setLastResult(fallback);
        return fallback;
      } finally {
        setIsSubmitting(false);
      }
    },
    [sessionId, resetTimer],
  );

  return {
    submitAttempt,
    isSubmitting,
    lastResult,
    resetTimer,
    attemptNumber: attemptNumberRef.current,
  };
}
