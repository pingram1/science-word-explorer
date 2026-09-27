"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-science-blue text-white hover:bg-science-blue-light active:bg-science-blue shadow-sm",
  secondary:
    "bg-science-teal text-white hover:bg-science-teal-light active:bg-science-teal shadow-sm",
  outline:
    "border-2 border-science-blue bg-transparent text-science-blue hover:bg-surface-muted active:bg-border",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted active:bg-border",
  danger:
    "bg-error text-white hover:opacity-90 active:opacity-100 shadow-sm",
  accent:
    "bg-science-accent text-foreground hover:bg-science-accent-light active:bg-science-accent shadow-sm",
} as const;

const sizeStyles = {
  sm: "min-h-11 px-3 text-sm gap-1.5 rounded-lg",
  md: "min-h-11 min-w-11 px-4 text-base gap-2 rounded-xl",
  lg: "min-h-12 min-w-12 px-6 text-lg gap-2 rounded-xl",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          "transition-colors motion-safe:duration-200",
          "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-ring focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
