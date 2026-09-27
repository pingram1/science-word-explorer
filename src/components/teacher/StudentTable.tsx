"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatShortDate } from "@/lib/teacher/formatters";
import type { StudentTableRow } from "@/lib/teacher/types";

export interface StudentTableProps {
  students: StudentTableRow[];
}

export function StudentTable({ students }: StudentTableProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">Class student progress</caption>
          <thead>
            <tr className="border-b-2 border-border bg-surface-muted">
              <th scope="col" className="px-4 py-3 font-semibold">
                Student
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Mastered
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                In progress
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Avg mastery
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Review due
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Last activity
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-border hover:bg-surface-muted/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/teacher/students/${student.id}`}
                    data-testid="teacher-student-link"
                    className="font-semibold text-science-blue underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring"
                  >
                    {student.displayName}
                  </Link>
                </td>
                <td className="px-4 py-3">{student.wordsMastered}</td>
                <td className="px-4 py-3">{student.wordsInProgress}</td>
                <td className="px-4 py-3">{student.averageMasteryScore}%</td>
                <td className="px-4 py-3">{student.reviewDueCount}</td>
                <td className="px-4 py-3">
                  {student.lastActivityAt ? formatShortDate(student.lastActivityAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  {student.needsSupport ? (
                    <Badge variant="warning">Needs support</Badge>
                  ) : (
                    <Badge variant="green">On track</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
