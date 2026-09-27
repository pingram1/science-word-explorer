"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  VocabularyForm,
  formValuesToVocabularyPayload,
} from "@/components/admin/VocabularyForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import type { VocabularyFormValues } from "@/lib/admin/vocabulary-schema";
import type { VocabularyWord } from "@/lib/types";

export default function EditVocabularyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [units, setUnits] = useState<Array<{ id: string; title: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [wordResponse, unitsResponse] = await Promise.all([
          fetch(`/api/admin/vocabulary/${params.id}`),
          fetch("/api/admin/units"),
        ]);
        if (!wordResponse.ok) throw new Error("Word not found");
        setWord(await wordResponse.json());
        setUnits(await unitsResponse.json());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load word");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [params.id]);

  async function handleSubmit(values: VocabularyFormValues) {
    const payload = formValuesToVocabularyPayload(values);
    const response = await fetch(`/api/admin/vocabulary/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    router.push(`/admin/vocabulary/${params.id}/preview`);
  }

  if (isLoading) {
    return <LoadingState title="Loading word" description="" />;
  }

  if (error || !word) {
    return <ErrorState title="Word unavailable" message={error ?? "Not found"} />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">
            <Link href="/admin/vocabulary" className="text-science-blue hover:underline">
              Vocabulary
            </Link>{" "}
            / Edit
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">Edit {word.word}</h2>
        </div>
        <Link
          href={`/admin/vocabulary/${word.id}/preview`}
          className="text-sm font-semibold text-science-teal hover:underline"
        >
          Preview lesson →
        </Link>
      </header>

      <VocabularyForm
        units={units}
        initialValues={word}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
