import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function Card({
  className,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-surface shadow-sm",
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn("text-xl font-bold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn("text-base text-muted", className)} {...props}>
      {children}
    </p>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("mt-4 flex flex-wrap items-center gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}
