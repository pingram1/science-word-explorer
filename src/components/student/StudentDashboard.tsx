"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Compass,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import type { DashboardData } from "@/lib/api/student-services";
import { fetchApi } from "@/components/student/api";

export function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<DashboardData>("/api/student/dashboard")
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState title="Loading your dashboard" />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message={error ?? "Something went wrong."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6" data-testid="student-dashboard">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground" data-testid="student-greeting">
          {data.greeting}, {data.studentName}!{" "}
          <Sparkles className="inline size-7 text-science-accent" aria-hidden="true" />
        </h2>
        <p className="text-lg text-muted">
          Keep exploring science words — you&apos;re making real progress.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="size-6 text-science-teal" aria-hidden="true" />
              Continue learning
            </CardTitle>
            <CardDescription>
              {data.currentUnit
                ? `Current unit: ${data.currentUnit.title}`
                : "Pick a unit to begin"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data.continueSession ? (
              <div className="rounded-xl border-2 border-science-teal/30 bg-science-teal/5 p-4">
                <p className="font-semibold text-foreground">
                  You have a session in progress
                </p>
                <p className="text-sm text-muted">
                  Step {data.continueSession.currentStep} of 10
                </p>
                <Link
                  href={`/student/session/${data.continueSession.id}`}
                  data-testid="continue-learning-button"
                  className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-xl bg-science-blue px-6 py-2 text-lg font-semibold text-white hover:bg-science-blue-light focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring"
                >
                  <Play className="size-5" aria-hidden="true" />
                  Continue session
                </Link>
              </div>
            ) : (
              <Link
                href={data.currentUnit ? `/student/units/${data.currentUnit.slug}` : "/student/units"}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-science-blue px-6 py-2 text-lg font-semibold text-white hover:bg-science-blue-light focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring"
              >
                <Play className="size-5" aria-hidden="true" />
                Start learning
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-6 text-science-green" aria-hidden="true" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted">Overall</span>
                <span className="font-bold">{data.progress.percentComplete}%</span>
              </div>
              <ProgressBar value={data.progress.percentComplete} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Mastered</dt>
                <dd className="text-xl font-bold text-science-green">{data.wordsMastered}</dd>
              </div>
              <div>
                <dt className="text-muted">Learning</dt>
                <dd className="text-xl font-bold text-science-accent">{data.wordsLearning}</dd>
              </div>
              <div>
                <dt className="text-muted">Review due</dt>
                <dd className="text-xl font-bold text-science-blue">{data.reviewDueCount}</dd>
              </div>
              <div>
                <dt className="text-muted">Journey</dt>
                <dd className="text-xl font-bold">{data.journeyProgress}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="size-5" aria-hidden="true" />
              Review
            </CardTitle>
            <CardDescription>
              {data.reviewDueCount > 0
                ? `${data.reviewDueCount} words ready for review today`
                : "You're caught up on reviews"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/student/review"
              className="inline-flex min-h-11 items-center rounded-xl bg-science-teal px-4 py-2 font-semibold text-white hover:bg-science-teal-light focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring"
            >
              Go to review
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5" aria-hidden="true" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {data.badges.map((badge) => (
                <li key={badge.id}>
                  <Badge variant={badge.earnedAt ? "green" : "accent"}>
                    {badge.title}
                  </Badge>
                </li>
              ))}
            </ul>
            <Link
              href="/student/journey"
              className="mt-3 inline-flex min-h-11 items-center rounded-xl border-2 border-science-blue px-4 py-2 font-semibold text-science-blue hover:bg-surface-muted focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring"
            >
              View journey
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" aria-hidden="true" />
            This week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Sessions completed</dt>
              <dd className="text-2xl font-bold">{data.weeklySummary.sessionsCompleted}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Words practiced</dt>
              <dd className="text-2xl font-bold">{data.weeklySummary.wordsPracticed}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Minutes learning</dt>
              <dd className="text-2xl font-bold">~{data.weeklySummary.minutesEstimate}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
