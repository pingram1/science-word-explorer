"use client";

import { Button } from "@/components/ui/Button";

interface StepFooterProps {
  onSubmit: () => void;
  onContinue?: () => void;
  onRetry?: () => void;
  onSubmitIncorrect?: () => void;
  submitLabel?: string;
  continueLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  showContinue?: boolean;
  showRetry?: boolean;
  showIncorrect?: boolean;
}

export function StepFooter({
  onSubmit,
  onContinue,
  onRetry,
  onSubmitIncorrect,
  submitLabel = "Check answer",
  continueLabel = "Continue",
  isSubmitting = false,
  submitDisabled = false,
  showContinue = false,
  showRetry = false,
  showIncorrect = false,
}: StepFooterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {!showContinue && (
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          isLoading={isSubmitting}
          disabled={submitDisabled}
          data-testid="step-submit"
        >
          {submitLabel}
        </Button>
      )}
      {showIncorrect && onSubmitIncorrect && (
        <Button
          type="button"
          size="md"
          variant="outline"
          onClick={onSubmitIncorrect}
          data-testid="step-submit-incorrect"
        >
          Try a different answer
        </Button>
      )}
      {showRetry && onRetry && (
        <Button type="button" size="md" variant="secondary" onClick={onRetry} data-testid="step-retry">
          Try again
        </Button>
      )}
      {showContinue && onContinue && (
        <Button type="button" size="lg" onClick={onContinue} data-testid="step-continue">
          {continueLabel}
        </Button>
      )}
    </div>
  );
}
