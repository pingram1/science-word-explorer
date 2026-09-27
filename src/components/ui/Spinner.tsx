import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: "size-5 border-2",
  md: "size-8 border-[3px]",
  lg: "size-12 border-4",
} as const;

export function Spinner({
  size = "md",
  label = "Loading",
  className,
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span
        className={cn(
          "animate-spin rounded-full border-science-teal border-t-transparent motion-reduce:animate-none",
          sizeStyles[size],
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
