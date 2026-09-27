"use client";

import { useCallback, useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface PhonemeTilesProps {
  available: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function PhonemeTiles({
  available,
  selected,
  onChange,
  disabled = false,
  className,
}: PhonemeTilesProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [dragSource, setDragSource] = useState<{ type: "pool" | "slot"; index: number } | null>(
    null,
  );

  const pool = available.filter(
    (phoneme, index) =>
      !selected.includes(phoneme) ||
      selected.indexOf(phoneme) !== selected.lastIndexOf(phoneme) ||
      available.indexOf(phoneme) !== index,
  );

  const remainingPool = available.filter((p) => {
    const selectedCount = selected.filter((s) => s === p).length;
    const availableCount = available.filter((a) => a === p).length;
    return selectedCount < availableCount;
  });

  const addToSlot = useCallback(
    (phoneme: string) => {
      if (disabled || selected.length >= available.length) return;
      onChange([...selected, phoneme]);
    },
    [available.length, disabled, onChange, selected],
  );

  const removeFromSlot = useCallback(
    (index: number) => {
      if (disabled) return;
      onChange(selected.filter((_, i) => i !== index));
    },
    [disabled, onChange, selected],
  );

  const moveSlot = useCallback(
    (index: number, direction: -1 | 1) => {
      const next = [...selected];
      const target = index + direction;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    },
    [onChange, selected],
  );

  const handleDrop = (targetIndex: number) => {
    if (!dragSource || disabled) return;
    if (dragSource.type === "pool") {
      const phoneme = remainingPool[dragSource.index];
      if (!phoneme) return;
      const next = [...selected];
      next.splice(targetIndex, 0, phoneme);
      onChange(next.slice(0, available.length));
    } else {
      const next = [...selected];
      const [moved] = next.splice(dragSource.index, 1);
      next.splice(targetIndex, 0, moved);
      onChange(next);
    }
    setDragSource(null);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div>
        <p className="mb-2 text-sm font-semibold text-muted">Sound tiles</p>
        <div className="flex flex-wrap gap-2" role="listbox" aria-label="Available sounds">
          {remainingPool.map((phoneme, index) => (
            <button
              key={`${phoneme}-${index}`}
              type="button"
              draggable={!disabled}
              disabled={disabled}
              onDragStart={() => setDragSource({ type: "pool", index })}
              onClick={() => addToSlot(phoneme)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addToSlot(phoneme);
                }
              }}
              className={cn(
                "min-h-11 min-w-11 rounded-xl border-2 border-science-blue bg-surface px-3 py-2",
                "text-base font-bold text-science-blue",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring",
                "hover:bg-science-blue/10 active:scale-95 motion-reduce:active:scale-100",
              )}
              aria-label={`Add sound ${phoneme}`}
            >
              {phoneme}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">
          Drag tiles or click to add. Use arrow buttons to reorder.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-muted">Your sound order</p>
        <div
          className="flex min-h-16 flex-wrap gap-2 rounded-xl border-2 border-dashed border-border bg-surface-muted p-3"
          role="list"
          aria-label="Selected sound order"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(selected.length)}
        >
          {selected.length === 0 && (
            <span className="text-muted">Click or drag sounds here</span>
          )}
          {selected.map((phoneme, index) => (
            <div
              key={`slot-${index}`}
              className="flex items-center gap-1"
              draggable={!disabled}
              onDragStart={() => setDragSource({ type: "slot", index })}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(index);
              }}
            >
              <span
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl border-2 border-science-teal bg-science-teal/10 px-3",
                  "text-base font-bold text-science-teal",
                  focusedIndex === index && "ring-2 ring-ring",
                )}
                tabIndex={0}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") moveSlot(index, -1);
                  if (e.key === "ArrowRight") moveSlot(index, 1);
                  if (e.key === "Backspace" || e.key === "Delete") removeFromSlot(index);
                }}
                aria-label={`Sound ${index + 1}: ${phoneme}`}
              >
                {phoneme}
              </span>
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSlot(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label={`Move ${phoneme} earlier`}
                  className="min-h-8 px-2"
                >
                  <ArrowUp className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromSlot(index)}
                  disabled={disabled}
                  aria-label={`Remove ${phoneme}`}
                  className="min-h-8 px-2"
                >
                  <X className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveSlot(index, 1)}
                  disabled={disabled || index === selected.length - 1}
                  aria-label={`Move ${phoneme} later`}
                  className="min-h-8 px-2"
                >
                  <ArrowDown className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
