"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";
import { FilterBar } from "@/components/teacher/FilterBar";
import { StatCard } from "@/components/teacher/StatCard";
import { StudentTable } from "@/components/teacher/StudentTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingState } from "@/components/shared/LoadingState";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TeacherDashboardData, TeacherDashboardFilters } from "@/lib/teacher/types";
import { fetchJsonApi } from "@/lib/api/client";
import { formatMasteryStatus } from "@/lib/teacher/formatters";

const MasteryTrendChart = dynamic(
  () =>
    import("@/components/teacher/MasteryTrendChart").then((mod) => mod.MasteryTrendChart),
  { ssr: false, loading: () => <LoadingState title="Loading chart" description="" /> },
);

const SkillProfileChart = dynamic(
  () =>
    import("@/components/teacher/SkillProfileChart").then((mod) => mod.SkillProfileChart),
  { ssr: false, loading: () => <LoadingState title="Loading chart" description="" /> },
);

function buildQuery(filters: TeacherDashboardFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, String(value));
  }
  return params.toString();
}

function buildFilterSummary(
  filters: TeacherDashboardFilters,
  options: TeacherDashboardData["filterOptions"],
): string {
  const parts: string[] = [];
  if (filters.unitId) {
    const unit = options.units.find((item) => item.id === filters.unitId);
    if (unit) parts.push(unit.title);
  }
  if (filters.masteryStatus) {
    parts.push(formatMasteryStatus(filters.masteryStatus));
  }
  if (filters.classId) {
    const classItem = options.classes.find((item) => item.id === filters.classId);
    if (classItem) parts.push(classItem.name);
  }
  if (filters.studentId) {
    const student = options.students.find((item) => item.id === filters.studentId);
    if (student) parts.push(student.displayName);
  }
  return parts.length > 0 ? parts.join(" · ") : "All students";
}

async function downloadClassCsv() {
  const response = await fetch("/api/teacher/export?type=class");
  if (!response.ok) return;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "class-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function TeacherDashboardPage() {
  const [filters, setFilters] = useState<TeacherDashboardFilters>({});
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = buildQuery(filters);
      const dashboard = await fetchJsonApi<TeacherDashboardData>(
        `/api/teacher/dashboard${query ? `?${query}` : ""}`,
      );
      setData(dashboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading && !data) {
    return <LoadingState title="Loading dashboard" description="Gathering class analytics…" />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message={error}
        action={
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="rounded-xl bg-science-blue px-4 py-2 font-semibold text-white"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!data) {
    return <EmptyState title="No dashboard data" description="Try adjusting your filters." />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Class overview</h2>
          <p className="mt-1 text-muted">
            Track mastery, skills, and students who need support across your science vocabulary units.
          </p>
        </div>
        <button
          type="button"
          data-testid="export-csv-button"
          onClick={() => void downloadClassCsv()}
          className="inline-flex min-h-11 items-center rounded-xl bg-science-teal px-4 py-2 font-semibold text-white hover:bg-science-teal-light"
        >
          Export CSV
        </button>
      </header>

      <FilterBar filters={filters} options={data.filterOptions} onChange={setFilters} />

      <p
        data-testid="active-filter-summary"
        className="text-sm font-medium text-muted"
        aria-live="polite"
      >
        Showing: {buildFilterSummary(filters, data.filterOptions)}
      </p>

      <div data-testid="teacher-dashboard-results" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Students" value={data.stats.totalStudents} icon={Users} />
        <StatCard label="Words mastered" value={data.stats.wordsMastered} icon={BookOpen} />
        <StatCard
          label="Average mastery"
          value={`${data.stats.averageMastery}%`}
          icon={GraduationCap}
        />
        <StatCard label="Review due" value={data.stats.reviewDue} icon={RefreshCw} />
        <StatCard label="Needs support" value={data.stats.needsSupport} icon={Activity} />
        <StatCard label="Active sessions" value={data.stats.activeSessions} icon={BarChart3} />
        </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MasteryTrendChart data={data.masteryTrend} />
        <SkillProfileChart data={data.skillProfile} />
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Unit progress</CardTitle>
          <CardDescription>Aggregate mastery across assigned vocabulary units</CardDescription>
        </CardHeader>
        <ul className="space-y-4">
          {data.unitProgress.map((unit) => (
            <li key={unit.unitId}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-foreground">{unit.unitTitle}</span>
                <span className="text-muted">
                  {unit.wordsMastered}/{unit.totalWords} words · {unit.percentComplete}%
                </span>
              </div>
              <ProgressBar value={unit.percentComplete} label={`${unit.unitTitle} progress`} />
            </li>
          ))}
        </ul>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-science-blue">
            View unit progress table
          </summary>
          <table className="mt-3 w-full border-collapse text-sm">
            <caption className="sr-only">Unit progress data</caption>
            <thead>
              <tr className="border-b-2 border-border text-left">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Unit
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Mastered
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Total
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Complete (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.unitProgress.map((unit) => (
                <tr key={unit.unitId} className="border-b border-border">
                  <td className="py-2 pr-4">{unit.unitTitle}</td>
                  <td className="py-2 pr-4">{unit.wordsMastered}</td>
                  <td className="py-2 pr-4">{unit.totalWords}</td>
                  <td className="py-2">{unit.percentComplete}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </Card>

      <section>
        <h3 className="mb-3 text-xl font-bold text-foreground">Students</h3>
        <StudentTable students={data.students} />
      </section>
      </div>
    </div>
  );
}
