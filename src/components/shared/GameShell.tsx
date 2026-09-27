"use client";

import { type ReactNode } from "react";
import {
  CircleHelp,
  LogOut,
  RotateCcw,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AudioButton } from "./AudioButton";
import { StepProgress } from "./StepProgress";

export interface GameShellProps {
  children: ReactNode;
  title: string;
  directions: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
  onRepeatDirections?: () => void;
  onHelp?: () => void;
  onExitSave?: () => void;
  className?: string;
}

export function GameShell({
  children,
  title,
  directions,
  currentStep,
  totalSteps = 10,
  stepLabels,
  onRepeatDirections,
  onHelp,
  onExitSave,
  className,
}: GameShellProps) {
  return (
    <div
      data-testid="game-shell"
      className={cn(
        "flex flex-col gap-6 rounded-2xl border-2 border-border bg-surface p-4 sm:p-6",
        className,
      )}
    >
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-science-teal">
              Science Word Explorer
            </p>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <AudioButton text={directions} label="Listen" speed="slow" />
            {onRepeatDirections && (
              <Button
                variant="outline"
                size="md"
                onClick={onRepeatDirections}
                aria-label="Repeat directions"
              >
                <RotateCcw className="size-5" aria-hidden="true" />
                Repeat
              </Button>
            )}
            {onHelp && (
              <Button
                variant="ghost"
                size="md"
                onClick={onHelp}
                aria-label="Get help"
              >
                <CircleHelp className="size-5" aria-hidden="true" />
                Help
              </Button>
            )}
            {onExitSave && (
              <Button
                variant="secondary"
                size="md"
                onClick={onExitSave}
                aria-label="Save progress and exit"
                data-testid="exit-save-button"
              >
                <Save className="size-5" aria-hidden="true" />
                Save &amp; Exit
              </Button>
            )}
          </div>
        </div>

        <div
          className="rounded-xl border-2 border-science-blue/20 bg-science-blue/5 p-4"
          role="region"
          aria-label="Directions"
        >
          <p className="text-base leading-relaxed text-foreground">{directions}</p>
        </div>

        {currentStep !== undefined && (
          <StepProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            labels={stepLabels}
          />
        )}
      </header>

      <section aria-label="Activity" className="flex-1">
        {children}
      </section>

      {onExitSave && (
        <footer className="flex justify-end border-t-2 border-border pt-4">
          <Button
            variant="ghost"
            size="md"
            onClick={onExitSave}
            className="text-muted"
          >
            <LogOut className="size-5" aria-hidden="true" />
            Leave activity
          </Button>
        </footer>
      )}
    </div>
  );
}
