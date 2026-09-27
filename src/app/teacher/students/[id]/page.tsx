"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { formatMasteryStatus, formatShortDate } from "@/lib/teacher/formatters";
import { fetchJsonApi } from "@/lib/api/client";
import type { StudentDetailData } from "@/lib/teacher/types";

const SkillProfileChart = dynamic(
  () =>
    import("@/components/teacher/SkillProfileChart").then((mod) => mod.SkillProfileChart),
  { ssr: false, loading: () => <LoadingState title="Loading chart" description="" /> },
);

const MasteryTrendChart = dynamic(
  () =>
    import("@/components/teacher/MasteryTrendChart").then((mod) => ({
      default: mod.MasteryTrendChart,
    })),
  { ssr: false, loading: () => <LoadingState title="Loading chart" description="" /> },
);

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const detail = await fetchJsonApi<StudentDetailData>(`/api/teacher/students/${params.id}`);
        setData(detail);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load student");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [params.id]);

  if (isLoading) {
    return <LoadingState title="Loading student" description="Fetching mastery and support data…" />;
  }

  if (error || !data) {
    return <ErrorState title="Student unavailable" message={error ?? "Not found"} />;
  }

  const accuracyAsTrend = data.accuracyTrend.map((point) => ({
    date: point.date,
    label: point.label,
    averageScore: point.accuracy,
    masteredCount: 0,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-muted">
          <Link href="/teacher" className="text-science-blue hover:underline">
            Dashboard
          </Link>{" "}
          / Student
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">{data.student.displayName}</h2>
        <p className="mt-1 text-muted">
          Grade {data.profile.gradeLevel} · Support level {data.profile.defaultSupportLevel} ·
          Journey {data.profile.journeyProgress}%
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.progress.averageMasteryScore}%</p>
            <p className="text-sm text-muted">
              {data.progress.wordsMastered} mastered · {data.progress.wordsInProgress} in progress
            </p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Review due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.progress.wordsReviewDue}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.sessions.length}</p>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardHeader>
            <CardTitle className="text-base">Intervention groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.interventionGroups.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Unit progress</CardTitle>
        </CardHeader>
        <ul className="space-y-4">
          {data.unitProgress.map((unit) => (
            <li key={unit.unitId}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">{unit.unitTitle}</span>
                <span className="text-muted">{unit.percentComplete}%</span>
              </div>
              <ProgressBar value={unit.percentComplete} label={`${unit.unitTitle} progress`} />
            </li>
          ))}
        </ul>
      </Card>

      <section>
        <h3 className="mb-3 text-xl font-bold">Word status</h3>
        <div className="overflow-x-auto rounded-2xl border-2 border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Student word mastery status</caption>
            <thead>
              <tr className="border-b-2 border-border bg-surface-muted text-left">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Word
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Unit
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Score
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Last session
                </th>
              </tr>
            </thead>
            <tbody>
              {data.wordStatuses.map((word) => (
                <tr key={word.vocabularyWordId} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Link
                      href={`/teacher/words/${word.vocabularyWordId}`}
                      className="font-semibold text-science-blue hover:underline"
                    >
                      {word.word}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{word.unitTitle}</td>
                  <td className="px-4 py-3">
                    <Badge variant={word.status === "mastered" ? "green" : "accent"}>
                      {formatMasteryStatus(word.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{Math.round(word.weightedScore * 100)}%</td>
                  <td className="px-4 py-3">
                    {word.lastSessionAt ? formatShortDate(word.lastSessionAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SkillProfileChart data={data.skillProfile} title="Skill profile" />

      <MasteryTrendChart
        data={accuracyAsTrend}
        title="Accuracy trend"
        description="Daily accuracy across learning events"
      />

      <Card padding="md">
        <CardHeader>
          <CardTitle>Common errors</CardTitle>
        </CardHeader>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Error summary</caption>
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Error type
              </th>
              <th scope="col" className="py-2 font-semibold">
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {data.errorSummary.map((row) => (
              <tr key={row.errorCategory} className="border-b border-border">
                <td className="py-2 pr-4">{row.label}</td>
                <td className="py-2">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Support recommendations</CardTitle>
          <p className="text-sm text-muted">
            Transparent adaptive rules explain why each support or review change was suggested.
          </p>
        </CardHeader>
        {data.adaptiveExplanations.length > 0 && (
          <ul className="mb-4 space-y-2 rounded-xl bg-surface-muted p-4">
            {data.adaptiveExplanations.map((explanation) => (
              <li key={explanation} className="text-sm text-foreground">
                {explanation}
              </li>
            ))}
          </ul>
        )}
        <ul className="space-y-3">
          {data.supportRecommendations.map((rec) => (
            <li key={`${rec.supportKey}-${rec.triggeredByRule}`} className="rounded-xl border-2 border-border p-4">
              <p className="font-semibold text-foreground">
                {rec.supportKey}: {String(rec.suggestedValue)}
              </p>
              <p className="mt-1 text-sm text-muted">{rec.reason}</p>
              <p className="mt-1 text-xs text-muted">Rule: {rec.triggeredByRule}</p>
            </li>
          ))}
          {data.supportRecommendations.length === 0 && (
            <li className="text-muted">No active support changes recommended.</li>
          )}
        </ul>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Review schedule</CardTitle>
        </CardHeader>
        <ul className="space-y-2">
          {data.reviewSchedules.map((schedule) => (
            <li key={schedule.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted p-3 text-sm">
              <span>
                Word review · {schedule.intervalKey.replace(/_/g, " ")}
              </span>
              <Badge variant={schedule.isDue ? "warning" : "default"}>
                {schedule.isDue ? "Due" : "Scheduled"} · {formatShortDate(schedule.scheduledFor)}
              </Badge>
            </li>
          ))}
          {data.reviewSchedules.length === 0 && (
            <li className="text-muted">No review items scheduled.</li>
          )}
        </ul>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Intervention recommendation</CardTitle>
        </CardHeader>
        {data.interventionGroups.length > 0 ? (
          <ul className="space-y-3">
            {data.interventionGroups.map((group) => (
              <li key={group.id} className="rounded-xl border-2 border-border p-4">
                <p className="font-semibold">{group.name}</p>
                <p className="mt-1 text-sm text-muted">{group.reason}</p>
                <p className="mt-2 text-sm">{group.recommendedActivity}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No intervention groups" description="This student is not in a suggested group." />
        )}
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Teacher notes</CardTitle>
        </CardHeader>
        <ul className="space-y-3">
          {data.notes.map((note) => (
            <li key={note.id} className="rounded-xl border-2 border-border p-4">
              <p>{note.content}</p>
              <p className="mt-2 text-xs text-muted">{formatShortDate(note.updatedAt)}</p>
            </li>
          ))}
          {data.notes.length === 0 && (
            <li className="text-muted">No notes yet for this student.</li>
          )}
        </ul>
      </Card>

      <Card padding="md" data-testid="recent-attempts">
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Learning sessions</caption>
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Word
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Started
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Status
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Step
              </th>
              <th scope="col" className="py-2 font-semibold">
                Support
              </th>
            </tr>
          </thead>
          <tbody>
            {data.sessions.slice(0, 10).map((session) => (
              <tr key={session.id} className="border-b border-border">
                <td className="py-2 pr-4 font-semibold">{session.word}</td>
                <td className="py-2 pr-4">{formatShortDate(session.startedAt)}</td>
                <td className="py-2 pr-4">{session.status}</td>
                <td className="py-2 pr-4">{session.currentStep}/10</td>
                <td className="py-2">Level {session.supportLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
