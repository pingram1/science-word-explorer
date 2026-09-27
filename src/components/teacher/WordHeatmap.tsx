"use client";

import { cn } from "@/lib/utils";

export interface WordHeatmapCell {
  instructionalStep: number;
  stepLabel: string;
  errorCount: number;
  attemptCount: number;
  errorRate: number;
}

export interface WordHeatmapProps {
  cells: WordHeatmapCell[];
  title?: string;
}

function heatColor(rate: number): string {
  if (rate === 0) return "bg-science-green/20 text-science-green border-science-green/30";
  if (rate < 25) return "bg-science-teal/20 text-science-teal border-science-teal/30";
  if (rate < 50) return "bg-science-accent/25 text-foreground border-science-accent/40";
  if (rate < 75) return "bg-warning/20 text-warning border-warning/40";
  return "bg-error/15 text-error border-error/30";
}

export function WordHeatmap({ cells, title = "Error heatmap by step" }: WordHeatmapProps) {
  return (
    <section aria-labelledby="word-heatmap-title">
      <h3 id="word-heatmap-title" className="mb-3 text-xl font-bold text-foreground">
        {title}
      </h3>
      <p className="mb-4 text-sm text-muted">
        Darker colors indicate higher error rates at each instructional step.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10" role="list">
        {cells.map((cell) => (
          <div
            key={cell.instructionalStep}
            role="listitem"
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center",
              heatColor(cell.errorRate),
            )}
            aria-label={`Step ${cell.instructionalStep} ${cell.stepLabel}: ${cell.errorRate}% error rate, ${cell.errorCount} errors of ${cell.attemptCount} attempts`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide">{cell.stepLabel}</span>
            <span className="mt-1 text-lg font-bold">{cell.errorRate}%</span>
            <span className="mt-1 text-xs">
              {cell.errorCount}/{cell.attemptCount}
            </span>
          </div>
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-science-blue">
          View data table
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">Error heatmap data by instructional step</caption>
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Step
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Label
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Errors
              </th>
              <th scope="col" className="py-2 pr-4 font-semibold">
                Attempts
              </th>
              <th scope="col" className="py-2 font-semibold">
                Error rate (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {cells.map((cell) => (
              <tr key={cell.instructionalStep} className="border-b border-border">
                <td className="py-2 pr-4">{cell.instructionalStep}</td>
                <td className="py-2 pr-4">{cell.stepLabel}</td>
                <td className="py-2 pr-4">{cell.errorCount}</td>
                <td className="py-2 pr-4">{cell.attemptCount}</td>
                <td className="py-2">{cell.errorRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
