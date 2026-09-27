import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "blue" | "teal" | "green" | "accent";
}

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
} as const;

const variantStyles = {
  blue: "bg-science-blue",
  teal: "bg-science-teal",
  green: "bg-science-green",
  accent: "bg-science-accent",
} as const;

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  className,
  size = "md",
  variant = "teal",
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((clamped / max) * 100) : 0;

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-2 text-sm font-medium text-foreground">
          {label && <span id="progress-label">{label}</span>}
          {showValue && (
            <span aria-hidden="true">{percent}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby={label ? "progress-label" : undefined}
        aria-label={!label ? "Progress" : undefined}
        className={cn(
          "overflow-hidden rounded-full bg-surface-muted border border-border",
          sizeStyles[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] motion-safe:duration-500 motion-reduce:transition-none",
            variantStyles[variant],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
