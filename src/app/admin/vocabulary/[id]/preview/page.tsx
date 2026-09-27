"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentPreview } from "@/components/admin/ContentPreview";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import type { VocabularyWord } from "@/lib/types";

export default function VocabularyPreviewPage() {
  const params = useParams<{ id: string }>();
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/admin/vocabulary/${params.id}`);
        if (!response.ok) throw new Error("Word not found");
        setWord(await response.json());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load word");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [params.id]);

  if (isLoading) {
    return <LoadingState title="Loading preview" description="" />;
  }

  if (error || !word) {
    return <ErrorState title="Preview unavailable" message={error ?? "Not found"} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">
            <Link href="/admin/vocabulary" className="text-science-blue hover:underline">
              Vocabulary
            </Link>{" "}
            / Preview
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{word.word}</h2>
          <p className="mt-1 text-muted">Full 10-step structured literacy lesson preview</p>
        </div>
        <Link
          href={`/admin/vocabulary/${word.id}`}
          className="text-sm font-semibold text-science-blue hover:underline"
        >
          Edit word →
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={currentStep <= 1}
          onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
        >
          Previous step
        </Button>
        <span className="text-sm font-semibold text-muted">
          Step {currentStep} of 10
        </span>
        <Button
          variant="outline"
          disabled={currentStep >= 10}
          onClick={() => setCurrentStep((step) => Math.min(10, step + 1))}
        >
          Next step
        </Button>
      </div>

      <ContentPreview word={word} currentStep={currentStep} />
    </div>
  );
}
