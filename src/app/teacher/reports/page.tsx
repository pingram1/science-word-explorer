"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const REPORTS = [
  {
    type: "students",
    title: "Student progress",
    description: "Mastery, review due counts, and last activity for each student.",
    filename: "student-report.csv",
  },
  {
    type: "class",
    title: "Class overview",
    description: "Aggregate mastery and support counts for the class.",
    filename: "class-report.csv",
  },
  {
    type: "words",
    title: "Word analysis",
    description: "Mastery rates and common errors across vocabulary words.",
    filename: "word-report.csv",
  },
  {
    type: "events",
    title: "Learning events",
    description: "Event-level analytics with skills, errors, and response times.",
    filename: "events-report.csv",
  },
] as const;

async function downloadReport(type: string, filename: string) {
  const response = await fetch(`/api/teacher/export?type=${type}`);
  if (!response.ok) return;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function TeacherReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="mt-1 text-muted">
          Export CSV reports for grading systems, PLCs, or offline analysis.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.type} padding="md">
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                onClick={() => void downloadReport(report.type, report.filename)}
              >
                <Download className="size-4" aria-hidden="true" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
