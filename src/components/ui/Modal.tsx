"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  closeOnOverlayClick = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative z-50 w-full max-w-lg rounded-2xl border-2 border-border bg-surface p-6 shadow-xl",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-base text-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="text-foreground">{children}</div>

        {footer && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
