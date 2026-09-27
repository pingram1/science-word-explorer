"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StepRenderer } from "@/components/student/StepRenderer";
import { fetchApi } from "@/components/student/api";
import type { SessionPayload } from "@/lib/api/student-services";
import type { InstructionalStep, LearningSession } from "@/lib/types";

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [payload, setPayload] = useState<SessionPayload | null>(null);
  const [currentStep, setCurrentStep] = useState<InstructionalStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  const loadSession = useCallback(async () => {
    const data = await fetchApi<SessionPayload>(`/api/student/sessions/${params.sessionId}`);
    setPayload(data);
    setCurrentStep(data.session.currentStep);
    if (data.session.status === "completed") {
      setShowComplete(true);
    }
    return data;
  }, [params.sessionId]);

  useEffect(() => {
    loadSession()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadSession]);

  const handleStepComplete = async () => {
    const data = await loadSession();
    if (data.session.status === "completed") {
      setShowComplete(true);
      return;
    }
    setCurrentStep(data.session.currentStep);
  };

  const handleExitSave = async () => {
    await fetchApi<{ session: LearningSession }>(`/api/sessions/${params.sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "exit" }),
    });
    router.push("/student");
  };

  if (loading) return <LoadingState title="Loading session" />;
  if (error || !payload) {
    return <ErrorState title="Session unavailable" message={error ?? "Not found"} />;
  }

  if (showComplete || payload.session.status === "completed") {
    return (
      <div
        data-testid="lesson-complete"
        className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-16 text-center"
      >
        <h2 className="text-3xl font-bold text-foreground">Lesson complete!</h2>
        <p className="text-lg text-muted">
          Great work on <strong>{payload.word.word}</strong>. You finished all ten steps.
        </p>
        <button
          type="button"
          onClick={() => router.push("/student")}
          className="inline-flex min-h-11 items-center rounded-xl bg-science-blue px-4 py-2 font-semibold text-white hover:bg-science-blue-light"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <StepRenderer
      step={currentStep}
      sessionId={payload.session.id}
      word={payload.word}
      supportProfile={payload.supportProfile}
      supportLevel={payload.session.supportLevel}
      imageChoices={payload.imageChoices}
      onStepComplete={handleStepComplete}
      onExitSave={handleExitSave}
    />
  );
}
