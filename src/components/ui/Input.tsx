"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const hintId = hint && inputId ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-base font-semibold text-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn(
            "w-full min-h-11 rounded-xl border-2 border-border bg-surface",
            "px-4 py-2 text-base text-foreground placeholder:text-muted",
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

Input.displayName = "Input";
