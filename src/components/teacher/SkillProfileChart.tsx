"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ACCESSIBLE_CHART_PALETTE, CHART_COLORS } from "@/lib/teacher/formatters";
import type { SkillProfilePoint } from "@/lib/teacher/types";

export interface SkillProfileChartProps {
  data: SkillProfilePoint[];
  title?: string;
  description?: string;
}

export function SkillProfileChart({
  data,
  title = "Skill profile",
  description = "Average performance across structured literacy skills",
}: SkillProfileChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    shortLabel: point.label.length > 14 ? `${point.label.slice(0, 12)}…` : point.label,
  }));

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <figure role="group" aria-labelledby="skill-profile-heading">
        <figcaption id="skill-profile-heading" className="sr-only">
          {title}. {description}
        </figcaption>

        <div className="h-80 w-full" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                stroke="var(--border)"
                label={{ value: "Score (%)", position: "insideBottom", offset: -4, fill: "var(--muted)" }}
              />
              <YAxis
                type="category"
                dataKey="shortLabel"
                width={120}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                stroke="var(--border)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  border: "2px solid var(--border)",
                  borderRadius: "0.75rem",
                }}
                formatter={(value) => [`${value}%`, "Score"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.label ?? "Skill"
                }
              />
              <Legend formatter={() => "Skill score (%)"} />
              <Bar
                dataKey="score"
                name="score"
                fill={CHART_COLORS.primary}
                radius={[0, 6, 6, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.skill}
                    fill={ACCESSIBLE_CHART_PALETTE[index % ACCESSIBLE_CHART_PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-science-blue">
          View data table
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">Skill profile data</caption>
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Skill
              </th>
              <th scope="col" className="py-2 font-semibold">
                Score (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.skill} className="border-b border-border">
                <td className="py-2 pr-4">{point.label}</td>
                <td className="py-2">{point.score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  );
}
