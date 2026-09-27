"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  VocabularyForm,
  formValuesToVocabularyPayload,
} from "@/components/admin/VocabularyForm";
import { LoadingState } from "@/components/shared/LoadingState";
import type { VocabularyFormValues } from "@/lib/admin/vocabulary-schema";

export default function NewVocabularyPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      const response = await fetch("/api/admin/units");
      setUnits(await response.json());
      setIsLoading(false);
    }
    void loadUnits();
  }, []);

  async function handleSubmit(values: VocabularyFormValues) {
    const payload = formValuesToVocabularyPayload(values);
    const response = await fetch("/api/admin/vocabulary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    const created = await response.json();
    router.push(`/admin/vocabulary/${created.id}`);
  }

  if (isLoading) {
    return <LoadingState title="Loading form" description="" />;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-muted">
          <Link href="/admin/vocabulary" className="text-science-blue hover:underline">
            Vocabulary
          </Link>{" "}
          / New word
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">Create vocabulary word</h2>
      </header>

      <VocabularyForm units={units} onSubmit={handleSubmit} submitLabel="Create word" />
    </div>
  );
}
