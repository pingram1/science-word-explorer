import { type ReactNode } from "react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-surface-muted/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div
        className="flex size-16 items-center justify-center rounded-2xl bg-science-teal/15 text-science-teal"
        aria-hidden="true"
      >
        {icon ?? <Compass className="size-8" />}
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-base text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
