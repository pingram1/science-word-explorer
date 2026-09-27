"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { UnitCardData } from "@/lib/api/student-services";
import { fetchApi } from "@/components/student/api";

export default function StudentUnitsPage() {
  const [units, setUnits] = useState<UnitCardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<{ units: UnitCardData[] }>("/api/student/units")
      .then((data) => setUnits(data.units))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState title="Loading units" />;
  if (error) return <ErrorState title="Units unavailable" message={error} />;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-3xl font-bold text-foreground">Science Units</h2>
        <p className="text-lg text-muted">Choose a unit to explore vocabulary words.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {units.map(({ unit, progress, wordCount }) => (
          <Card key={unit.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-science-teal" aria-hidden="true" />
                {unit.title}
              </CardTitle>
              <CardDescription>{unit.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <p className="text-sm text-muted">{wordCount} vocabulary words</p>
              <ProgressBar
                value={progress.percentComplete}
                label="Unit progress"
                showValue
              />
              <p className="text-sm font-medium">
                {progress.wordsMastered} of {progress.totalWords} mastered
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href={`/student/units/${unit.slug}`}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 font-semibold",
                  "bg-science-blue text-white hover:bg-science-blue-light",
                  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring",
                )}
              >
                Explore unit
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
