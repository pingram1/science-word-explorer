import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-surface-muted text-foreground border-border",
  blue: "bg-science-blue/15 text-science-blue border-science-blue/30",
  teal: "bg-science-teal/15 text-science-teal border-science-teal/30",
  green: "bg-science-green/15 text-science-green border-science-green/30",
  accent: "bg-science-accent/20 text-foreground border-science-accent/40",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  error: "bg-error/15 text-error border-error/30",
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
