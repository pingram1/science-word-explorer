import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  title = "Loading your adventure",
  description = "Getting everything ready for exploration…",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <Spinner size="lg" label={title} />
      <div className="max-w-sm space-y-2">
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-base text-muted leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
