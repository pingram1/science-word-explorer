"use client";

import { cn } from "@/lib/utils";

export interface FeedbackBannerProps {
  message: string;
  variant?: "success" | "support" | "info";
  className?: string;
  "data-testid"?: string;
}

export function FeedbackBanner({
  message,
  variant = "support",
  className,
  "data-testid": testId = "step-feedback",
}: FeedbackBannerProps) {
  const styles = {
    success: "border-science-green/40 bg-science-green/10 text-foreground",
    support: "border-science-accent/40 bg-science-accent/10 text-foreground",
    info: "border-science-blue/40 bg-science-blue/10 text-foreground",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid={testId}
      className={cn(
        "rounded-xl border-2 p-4 text-base font-medium leading-relaxed",
        styles[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}
