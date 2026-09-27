"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { CHART_COLORS } from "@/lib/teacher/formatters";
import type { MasteryTrendPoint } from "@/lib/teacher/types";

export interface MasteryTrendChartProps {
  data: MasteryTrendPoint[];
  title?: string;
  description?: string;
}

export function MasteryTrendChart({
  data,
  title = "Mastery trend",
  description = "Average accuracy and mastered words over time",
}: MasteryTrendChartProps) {
  const tableId = "mastery-trend-table";

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <figure role="group" aria-labelledby="mastery-trend-heading">
        <figcaption id="mastery-trend-heading" className="sr-only">
          {title}. {description}
        </figcaption>

        <div className="h-72 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                stroke="var(--border)"
              />
              <YAxis
                yAxisId="score"
                domain={[0, 100]}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                stroke="var(--border)"
                label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fill: "var(--muted)" }}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                stroke="var(--border)"
                label={{ value: "Mastered", angle: 90, position: "insideRight", fill: "var(--muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "2px solid var(--border)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value, name) => [
                  value,
                  name === "averageScore" ? "Average accuracy (%)" : "Words mastered",
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "averageScore" ? "Average accuracy (%)" : "Words mastered"
                }
              />
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="averageScore"
                name="averageScore"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{ r: 4, fill: CHART_COLORS.primary }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="count"
                type="monotone"
                dataKey="masteredCount"
                name="masteredCount"
                stroke={CHART_COLORS.secondary}
                strokeWidth={3}
                dot={{ r: 4, fill: CHART_COLORS.secondary }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-science-blue">
          View data table
        </summary>
        <table id={tableId} className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">Mastery trend data</caption>
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Date
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Average accuracy (%)
              </th>
              <th scope="col" className="py-2 font-semibold">
                Words mastered
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.date} className="border-b border-border">
                <td className="py-2 pr-4">{point.label}</td>
                <td className="py-2 pr-4">{point.averageScore}%</td>
                <td className="py-2">{point.masteredCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  );
}
