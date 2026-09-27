"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = error && selectId ? `${selectId}-error` : undefined;
    const hintId = hint && selectId ? `${selectId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-base font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            className={cn(
              "w-full min-h-11 appearance-none rounded-xl border-2 border-border bg-surface",
              "px-4 py-2 pr-10 text-base text-foreground",
              "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring focus-visible:outline-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-error",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
        </div>
        {hint && !error && (
          <p id={hintId} className="mt-2 text-sm text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-2 text-sm font-medium text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
