"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { WordHeatmap } from "@/components/teacher/WordHeatmap";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { formatMasteryStatus } from "@/lib/teacher/formatters";
import { fetchJsonApi } from "@/lib/api/client";
import type { WordAnalysisData } from "@/lib/teacher/types";

const SkillProfileChart = dynamic(
  () =>
    import("@/components/teacher/SkillProfileChart").then((mod) => mod.SkillProfileChart),
  { ssr: false, loading: () => <LoadingState title="Loading chart" description="" /> },
);

export default function WordAnalysisPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<WordAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const analysis = await fetchJsonApi<WordAnalysisData>(`/api/teacher/words/${params.id}`);
        setData(analysis);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load word");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [params.id]);

  if (isLoading) {
    return <LoadingState title="Loading word analysis" description="" />;
  }

  if (error || !data) {
    return <ErrorState title="Word unavailable" message={error ?? "Not found"} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-muted">
          <Link href="/teacher" className="text-science-blue hover:underline">
            Dashboard
          </Link>{" "}
          / Word analysis
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">{data.word.word}</h2>
        <p className="mt-1 text-muted">
          {data.unitTitle} · {data.word.studentFriendlyDefinition}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.studentsAssigned}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.studentsMastered}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Mastery rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.masteryRate}%</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Avg attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.averageAttempts}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Avg score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.averageScore}%</p>
          </CardContent>
        </Card>
      </div>

      <SkillProfileChart
        data={data.skillBreakdown}
        title="Skill breakdown"
        description="Average skill scores for this word across students"
      />

      <Card padding="md">
        <WordHeatmap cells={data.errorHeatmap} />
      </Card>

      <section>
        <h3 className="mb-3 text-xl font-bold">Student performance</h3>
        {data.students.length === 0 ? (
          <EmptyState title="No student data" description="No mastery records for this word yet." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-border">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <caption className="sr-only">Student performance on this word</caption>
              <thead>
                <tr className="border-b-2 border-border bg-surface-muted text-left">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Student
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Score
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Attempts
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Common errors
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.studentId} className="border-b border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={`/teacher/students/${student.studentId}`}
                        className="font-semibold text-science-blue hover:underline"
                      >
                        {student.displayName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.status === "mastered" ? "green" : "accent"}>
                        {formatMasteryStatus(student.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{Math.round(student.weightedScore * 100)}%</td>
                    <td className="px-4 py-3">{student.attemptCount}</td>
                    <td className="px-4 py-3">
                      {student.commonErrors.length > 0
                        ? student.commonErrors.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
