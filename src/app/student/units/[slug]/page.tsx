"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { UnitDetailData } from "@/lib/api/student-services";
import { fetchApi } from "@/components/student/api";
import type { WordMasteryStatus } from "@/lib/types";

const statusLabels: Record<WordMasteryStatus, string> = {
  not_started: "Not started",
  introduced: "Introduced",
  practicing: "Practicing",
  nearly_mastered: "Nearly mastered",
  mastered: "Mastered",
  review_due: "Review due",
  needs_teacher_support: "Needs support",
};

const statusVariants: Record<WordMasteryStatus, "accent" | "blue" | "green" | "teal"> = {
  not_started: "accent",
  introduced: "blue",
  practicing: "teal",
  nearly_mastered: "teal",
  mastered: "green",
  review_due: "accent",
  needs_teacher_support: "accent",
};

export default function UnitDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<UnitDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingWordId, setStartingWordId] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  const slugifyWord = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    fetchApi<UnitDetailData>(`/api/student/units/${params.slug}`)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const startSession = async (vocabularyWordId: string, unitId: string) => {
    setStartingWordId(vocabularyWordId);
    try {
      const json = await fetchApi<{ session: { id: string } }>("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, vocabularyWordId }),
      });
      router.push(`/student/session/${json.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start session");
      setStartingWordId(null);
    }
  };

  if (loading) return <LoadingState title="Loading unit" />;
  if (error || !data) {
    return <ErrorState title="Unit unavailable" message={error ?? "Not found"} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/student/units"
        className="inline-flex items-center gap-2 text-science-blue font-semibold hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All units
      </Link>

      <header>
        <h2 className="text-3xl font-bold text-foreground">{data.unit.title}</h2>
        <p className="mt-2 text-lg text-muted">{data.unit.description}</p>
        <div className="mt-4 max-w-md">
          <ProgressBar
            value={data.progress.percentComplete}
            label="Unit progress"
            showValue
          />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Word list</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {data.words.map((word) => (
              <li
                key={word.id}
                data-testid={`word-card-${slugifyWord(word.word)}`}
                onClick={() => setSelectedWordId(word.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedWordId(word.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 cursor-pointer rounded-lg px-2 -mx-2 ${
                  selectedWordId === word.id ? "bg-science-teal/5 ring-2 ring-science-teal/30" : ""
                }`}
              >
                <div>
                  <p className="text-lg font-bold text-foreground">{word.word}</p>
                  <p className="text-sm text-muted">{word.studentFriendlyDefinition}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariants[word.masteryStatus]}>
                    {statusLabels[word.masteryStatus]}
                  </Badge>
                  <Button
                    size="md"
                    data-testid={
                      selectedWordId === word.id
                        ? "start-lesson-button"
                        : `start-lesson-${slugifyWord(word.word)}`
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      startSession(word.id, data.unit.id);
                    }}
                    isLoading={startingWordId === word.id}
                    aria-label={`Start session for ${word.word}`}
                  >
                    <Play className="size-4" aria-hidden="true" />
                    Start
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
