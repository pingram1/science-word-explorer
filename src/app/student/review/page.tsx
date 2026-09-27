"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, RotateCcw } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ReviewData } from "@/lib/api/student-services";
import { fetchApi } from "@/components/student/api";
import type { VocabularyWord } from "@/lib/types";

function WordList({
  title,
  description,
  words,
  onPractice,
  loadingId,
}: {
  title: string;
  description: string;
  words: VocabularyWord[];
  onPractice: (word: VocabularyWord) => void;
  loadingId: string | null;
}) {
  if (words.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted">Nothing here right now — great job!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {words.map((word) => (
            <li
              key={word.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-bold text-foreground">{word.word}</p>
                <p className="text-sm text-muted">{word.studentFriendlyDefinition}</p>
              </div>
              <Button
                size="md"
                variant="secondary"
                onClick={() => onPractice(word)}
                isLoading={loadingId === word.id}
              >
                <Play className="size-4" aria-hidden="true" />
                Practice
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function StudentReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingWordId, setStartingWordId] = useState<string | null>(null);

  useEffect(() => {
    fetchApi<ReviewData>("/api/student/review")
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const startReview = async (word: VocabularyWord) => {
    setStartingWordId(word.id);
    try {
      const json = await fetchApi<{ session: { id: string } }>("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: word.unitId, vocabularyWordId: word.id }),
      });
      router.push(`/student/session/${json.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start session");
      setStartingWordId(null);
    }
  };

  if (loading) return <LoadingState title="Loading review" />;
  if (error || !data) {
    return <ErrorState title="Review unavailable" message={error ?? "Error"} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <RotateCcw className="size-8 text-science-teal" aria-hidden="true" />
          Review
        </h2>
        <p className="text-lg text-muted">
          Strengthen words with retrieval practice and spaced review.
        </p>
      </header>

      <WordList
        title="Due today"
        description="Words scheduled for review today"
        words={data.dueToday}
        onPractice={startReview}
        loadingId={startingWordId}
      />

      <WordList
        title="Recently missed"
        description="Words that need another look"
        words={data.recentlyMissed}
        onPractice={startReview}
        loadingId={startingWordId}
      />

      <WordList
        title="Nearly mastered"
        description="Almost there — one more strong session"
        words={data.nearlyMastered}
        onPractice={startReview}
        loadingId={startingWordId}
      />

      <WordList
        title="Retrieval practice"
        description="Quick recall to strengthen memory"
        words={data.retrievalWords}
        onPractice={startReview}
        loadingId={startingWordId}
      />

      <Link
        href="/student"
        className="text-science-blue font-semibold hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
