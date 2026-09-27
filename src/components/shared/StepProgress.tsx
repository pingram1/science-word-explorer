import { cn } from "@/lib/utils";

export interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
  labels?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps = 10,
  labels,
  className,
}: StepProgressProps) {
  const clampedStep = Math.min(Math.max(currentStep, 1), totalSteps);

  return (
    <nav aria-label="Routine progress" className={cn("w-full", className)}>
      <ol className="flex items-center gap-1 sm:gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < clampedStep;
          const isCurrent = stepNumber === clampedStep;
          const label = labels?.[index];

          return (
            <li key={stepNumber} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold sm:size-9",
                  "transition-colors motion-safe:duration-200",
                  isComplete &&
                    "border-science-green bg-science-green text-white",
                  isCurrent &&
                    "border-science-accent bg-science-accent text-foreground ring-2 ring-science-accent/40 ring-offset-2",
                  !isComplete &&
                    !isCurrent &&
                    "border-border bg-surface text-muted",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span className="sr-only">
                  Step {stepNumber}
                  {isComplete ? ", completed" : ""}
                  {isCurrent ? ", current" : ""}
                </span>
                <span aria-hidden="true">{stepNumber}</span>
              </div>
              {label && (
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isCurrent ? "text-foreground" : "text-muted",
                  )}
                >
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p
        className="mt-3 text-center text-sm font-semibold text-muted"
        data-testid="step-indicator"
      >
        Step {clampedStep} of {totalSteps}
      </p>
    </nav>
  );
}
