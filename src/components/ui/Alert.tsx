import { type HTMLAttributes, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  info: {
    container: "border-info/30 bg-info/10 text-foreground",
    icon: "text-info",
    Icon: Info,
  },
  success: {
    container: "border-success/30 bg-success/10 text-foreground",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  warning: {
    container: "border-warning/30 bg-warning/10 text-foreground",
    icon: "text-warning",
    Icon: TriangleAlert,
  },
  error: {
    container: "border-error/30 bg-error/10 text-foreground",
    icon: "text-error",
    Icon: AlertCircle,
  },
} as const;

export type AlertVariant = keyof typeof variantStyles;

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const { container, icon, Icon } = variantStyles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-xl border-2 p-4",
        container,
        className,
      )}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", icon)} aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="mb-1 font-bold">{title}</p>}
        <div className="text-base leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
