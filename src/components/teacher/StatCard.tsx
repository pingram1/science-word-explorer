import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("", className)} padding="md">
      <CardContent className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground" aria-label={`${label}: ${value}`}>
            {value}
          </p>
          {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
        </div>
        {Icon && (
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-science-blue/15 text-science-blue"
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
