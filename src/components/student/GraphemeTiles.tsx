"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { shuffleWithSeed } from "@/components/student/types";

export interface GraphemeTilesProps {
  target: string[];
  distractors: string[];
  built: string[];
  lockedIndices: number[];
  onSelect: (grapheme: string) => void;
  disabled?: boolean;
  seed?: string;
  className?: string;
}

export function GraphemeTiles({
  target,
  distractors,
  built,
  lockedIndices,
  onSelect,
  disabled = false,
  seed = "grapheme",
  className,
}: GraphemeTilesProps) {
  const tiles = useMemo(
    () => shuffleWithSeed([...target, ...distractors], seed),
    [target, distractors, seed],
  );

  const usedCounts = built.reduce<Record<string, number>>((acc, g) => {
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});

  const targetCounts = target.reduce<Record<string, number>>((acc, g) => {
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});

  const isTileAvailable = (grapheme: string) => {
    const used = usedCounts[grapheme] ?? 0;
    const totalInPool = tiles.filter((t) => t === grapheme).length;
    return used < totalInPool;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div
        className="flex min-h-14 flex-wrap gap-2 rounded-xl border-2 border-border bg-surface-muted p-3"
        aria-label="Word being built"
      >
        {built.map((grapheme, index) => (
          <span
            key={`built-${index}`}
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 px-3 text-lg font-bold",
              lockedIndices.includes(index)
                ? "border-science-green bg-science-green/15 text-science-green"
                : "border-science-blue bg-surface text-science-blue",
            )}
            aria-label={`Letter ${index + 1}: ${grapheme}${lockedIndices.includes(index) ? ", locked" : ""}`}
          >
            {grapheme}
          </span>
        ))}
        {built.length === 0 && <span className="text-muted">Tap letters to build the word</span>}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Letter tiles">
        {tiles.map((grapheme, index) => {
          const available = isTileAvailable(grapheme);
          return (
            <button
              key={`tile-${grapheme}-${index}`}
              type="button"
              disabled={disabled || !available || built.length >= target.length}
              onClick={() => onSelect(grapheme)}
              className={cn(
                "min-h-11 min-w-11 rounded-xl border-2 px-3 text-lg font-bold",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring",
                available && built.length < target.length
                  ? "border-science-blue bg-surface text-science-blue hover:bg-science-blue/10"
                  : "cursor-not-allowed border-border bg-surface-muted text-muted opacity-50",
              )}
              aria-label={`Letter tile ${grapheme}${!available ? ", used" : ""}`}
            >
              {grapheme}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        Correct letters lock in place. {built.length} of {target.length} letters placed.
      </p>
    </div>
  );
}
