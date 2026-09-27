"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const textareaId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = error && textareaId ? `${textareaId}-error` : undefined;
    const hintId = hint && textareaId ? `${textareaId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-base font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "w-full min-h-[5.5rem] rounded-xl border-2 border-border bg-surface",
            "px-4 py-3 text-base text-foreground placeholder:text-muted resize-y",
            "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error",
            className,
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
