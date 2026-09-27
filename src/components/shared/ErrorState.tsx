import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/Alert";

export interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border-2 border-error/30 bg-surface px-6 py-10 text-center",
        className,
      )}
      role="alert"
    >
      <div
        className="flex size-16 items-center justify-center rounded-2xl bg-error/15 text-error"
        aria-hidden="true"
      >
        <AlertTriangle className="size-8" />
      </div>

      <Alert variant="error" title={title} className="w-full max-w-lg text-left">
        {message}
      </Alert>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
