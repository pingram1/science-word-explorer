import { Suspense } from "react";
import { LoadingState } from "@/components/shared/LoadingState";
import { VocabularyListClient } from "./VocabularyListClient";

export default function VocabularyListPage() {
  return (
    <Suspense
      fallback={
        <LoadingState title="Loading vocabulary" description="Preparing the word list." />
      }
    >
      <VocabularyListClient />
    </Suspense>
  );
}
